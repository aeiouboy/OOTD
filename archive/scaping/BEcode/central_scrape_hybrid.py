"""
Central Group Product Scraping System - Main Orchestrator
Multi-worker Crawl4AI-based scraping system with comprehensive error handling
Version: 1.0
"""
import asyncio
import logging
import sys
from datetime import datetime
from typing import Dict, List
import argparse

from config import (
    CATEGORIES, DEFAULT_WORKERS, LOG_LEVEL, LOG_FORMAT,
    CONSOLE_LOG, FILE_LOG, LOG_DIR
)
from scraper_worker_hybrid import HybridScraperWorker as ScraperWorker
from data_validator import DataValidator
from storage_manager import StorageManager
from logger import ScrapingLogger

# Setup logging
logging.basicConfig(
    level=LOG_LEVEL,
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler() if CONSOLE_LOG else logging.NullHandler(),
        logging.FileHandler(
            LOG_DIR / f"scraping_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        ) if FILE_LOG else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)


class ScrapingOrchestrator:
    """Main orchestrator for multi-worker scraping"""

    def __init__(self, num_workers: int = DEFAULT_WORKERS,
                 scrape_details: bool = True,
                 validate_images: bool = False,
                 resume: bool = True):
        """
        Initialize orchestrator

        Args:
            num_workers: Number of worker processes
            scrape_details: Whether to scrape detailed product info
            validate_images: Whether to validate image URLs (slower)
            resume: Whether to skip already completed categories
        """
        self.num_workers = num_workers
        self.scrape_details = scrape_details
        self.validate_images = validate_images
        self.resume = resume

        self.storage = StorageManager()
        self.validator = DataValidator()
        self.session_logger = ScrapingLogger()

        self.results = {}
        self.validation_reports = {}

    async def _scrape_with_retry(self, worker: ScraperWorker, category_name: str,
                                 category_url: str, max_retries: int = 3) -> Dict:
        """
        Scrape category with retry logic

        Args:
            worker: ScraperWorker instance
            category_name: Category name
            category_url: Category URL
            max_retries: Maximum retry attempts

        Returns:
            Category data dictionary
        """
        from config import RETRY_DELAYS

        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries} for category '{category_name}'")

                category_data = await worker.scrape_category(
                    category_name,
                    category_url,
                    scrape_details=self.scrape_details
                )

                # Check if we got products
                if category_data.get('total_products', 0) > 0:
                    return category_data
                else:
                    logger.warning(f"No products found for '{category_name}' on attempt {attempt + 1}")

            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed for '{category_name}': {e}")

                # Wait before retry (exponential backoff)
                if attempt < max_retries - 1:
                    delay = RETRY_DELAYS[attempt] if attempt < len(RETRY_DELAYS) else RETRY_DELAYS[-1]
                    logger.info(f"Waiting {delay}s before retry...")
                    await asyncio.sleep(delay)

        # All retries failed
        raise Exception(f"Failed to scrape '{category_name}' after {max_retries} attempts")

    async def _process_category(self, worker_id: int, category_name: str,
                                category_url: str) -> Dict:
        """
        Process a single category

        Args:
            worker_id: Worker ID
            category_name: Category name
            category_url: Category URL

        Returns:
            Category data dictionary
        """
        # Check if already completed (resume functionality)
        if self.resume and self.storage.category_exists(category_name):
            logger.info(f"Worker {worker_id}: Category '{category_name}' already exists, skipping...")
            return self.storage.load_category(category_name)

        # Create worker
        worker = ScraperWorker(worker_id)

        try:
            # Scrape with retry logic
            category_data = await self._scrape_with_retry(
                worker, category_name, category_url
            )

            # Validate data
            logger.info(f"Worker {worker_id}: Validating '{category_name}'...")
            validation_report = await self.validator.validate_category(
                category_data,
                check_images=self.validate_images
            )

            self.validation_reports[category_name] = validation_report

            # Check if meets quality threshold
            if not self.validator.meets_quality_threshold(validation_report):
                logger.warning(
                    f"Worker {worker_id}: Category '{category_name}' does not meet quality threshold. "
                    "Saving anyway with warning."
                )

            # Save category data
            logger.info(f"Worker {worker_id}: Saving '{category_name}'...")
            if self.storage.save_category(category_data):
                # Log success
                self.session_logger.add_category_result(category_data, validation_report)
                logger.info(f"Worker {worker_id}: Successfully completed '{category_name}'")
            else:
                raise Exception("Failed to save category data")

            # Get worker stats
            worker_stats = worker.get_stats()
            self.session_logger.add_worker_stats(worker_stats)

            return category_data

        except Exception as e:
            error_msg = f"Failed to process category '{category_name}': {e}"
            logger.error(f"Worker {worker_id}: {error_msg}")

            self.session_logger.add_category_failure(category_name, str(e))

            # Get worker stats even on failure
            if worker.start_time:
                worker_stats = worker.get_stats()
                self.session_logger.add_worker_stats(worker_stats)

            raise

    async def run(self) -> Dict:
        """
        Run the scraping orchestrator

        Returns:
            Dictionary with all results
        """
        logger.info("="*60)
        logger.info("CENTRAL GROUP PRODUCT SCRAPING SYSTEM")
        logger.info("="*60)
        logger.info(f"Workers: {self.num_workers}")
        logger.info(f"Categories: {len(CATEGORIES)}")
        logger.info(f"Scrape Details: {self.scrape_details}")
        logger.info(f"Validate Images: {self.validate_images}")
        logger.info(f"Resume: {self.resume}")
        logger.info("="*60)

        # Start session logging
        self.session_logger.start_session({
            "workers": self.num_workers,
            "categories": list(CATEGORIES.keys()),
            "scrape_details": self.scrape_details,
            "validate_images": self.validate_images,
            "resume": self.resume
        })

        # Create tasks for all categories
        tasks = []
        worker_id = 0

        for category_name, category_url in CATEGORIES.items():
            worker_id += 1
            task = self._process_category(worker_id, category_name, category_url)
            tasks.append((category_name, task))

        # Run tasks with limited concurrency (semaphore)
        semaphore = asyncio.Semaphore(self.num_workers)

        async def run_with_semaphore(category_name: str, task):
            async with semaphore:
                try:
                    result = await task
                    self.results[category_name] = result
                    return result
                except Exception as e:
                    logger.error(f"Task failed for '{category_name}': {e}")
                    return None

        # Execute all tasks
        await asyncio.gather(*[run_with_semaphore(name, task) for name, task in tasks])

        # Save master file with all categories
        if self.results:
            logger.info("\n" + "="*60)
            logger.info("Generating master output file...")
            self.storage.save_all_categories(self.results)

        # End session logging
        self.session_logger.end_session()

        # Print summary
        self.session_logger.print_summary()

        # Save log file
        log_path = self.session_logger.save()
        if log_path:
            logger.info(f"\nSession log saved: {log_path}")

        logger.info("\n" + "="*60)
        logger.info("SCRAPING COMPLETE")
        logger.info("="*60)

        return self.results


async def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Central Group Product Scraping System'
    )
    parser.add_argument(
        '--workers', '-w',
        type=int,
        default=DEFAULT_WORKERS,
        help=f'Number of workers (default: {DEFAULT_WORKERS})'
    )
    parser.add_argument(
        '--no-details',
        action='store_true',
        help='Skip detailed product scraping (URLs and SKUs only)'
    )
    parser.add_argument(
        '--validate-images',
        action='store_true',
        help='Validate image URL accessibility (slower)'
    )
    parser.add_argument(
        '--no-resume',
        action='store_true',
        help='Disable resume functionality (rescrape all categories)'
    )

    args = parser.parse_args()

    # Create orchestrator
    orchestrator = ScrapingOrchestrator(
        num_workers=args.workers,
        scrape_details=not args.no_details,
        validate_images=args.validate_images,
        resume=not args.no_resume
    )

    # Run scraping
    try:
        await orchestrator.run()
        sys.exit(0)
    except KeyboardInterrupt:
        logger.info("\nScraping interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Scraping failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
