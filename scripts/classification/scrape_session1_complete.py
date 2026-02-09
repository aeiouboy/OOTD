#!/usr/bin/env python3
"""
Automated Session 1 Product Scraper

This script automatically scrapes all remaining Session 1 women's clothing products
(indices 7-249) from Central.co.th using the Firecrawl API. It processes 243 products
without manual intervention, saving progress incrementally for interruption recovery.

Features:
- Fully automated scraping with no user interaction required
- Incremental progress saving (every 10 products by default)
- Automatic retry on failures (1 retry attempt per product)
- Comprehensive logging to file and console
- Resume capability (skips already-completed products)
- Final summary with statistics and attribute coverage

Requirements:
- Firecrawl Python SDK: pip install firecrawl-py
- FIRECRAWL_API_KEY environment variable set
- Existing infrastructure: incremental_scraper.py, markdown_parser.py

Usage:
    # Scrape all remaining Session 1 products (7-249)
    python3 scrape_session1_complete.py

    # Scrape specific range
    python3 scrape_session1_complete.py --start 7 --end 50

    # Custom log file and batch size
    python3 scrape_session1_complete.py --log-file my_scrape.log --batch-size 20

Output:
- Scraped data saved to: ../../data/products/women_clothing_scraped.json
- Progress tracking: scraping_progress.json
- Execution log: scrape_session1.log (or custom log file)

Expected Execution Time:
- 243 products × 30 seconds/product ≈ 2 hours

Author: AI Developer Workflow (ADW) System
Chore: ac5a85a6
Date: 2026-02-09
"""

import json
import sys
import time
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

# Import existing infrastructure
from incremental_scraper import (
    load_products, load_progress, record_scraped_item, get_status
)
from markdown_parser import parse_product_page_markdown

# Import Firecrawl SDK
try:
    from firecrawl import FirecrawlApp
    FIRECRAWL_AVAILABLE = True
except ImportError:
    FIRECRAWL_AVAILABLE = False
    FirecrawlApp = None  # Type placeholder when not installed
    print("WARNING: Firecrawl SDK not installed. Install with: pip install firecrawl-py")

# Constants
SCRIPT_DIR = Path(__file__).parent
DEFAULT_START = 7
DEFAULT_END = 249
DEFAULT_LOG_FILE = "scrape_session1.log"
DEFAULT_BATCH_SIZE = 10
SLEEP_BETWEEN_REQUESTS = 0.1  # 100ms
MAX_RETRIES = 1


def setup_argument_parser() -> argparse.ArgumentParser:
    """Setup command-line argument parser."""
    parser = argparse.ArgumentParser(
        description='Automated scraper for Session 1 women\'s clothing products',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape all remaining products (7-249)
  python3 scrape_session1_complete.py

  # Scrape specific range
  python3 scrape_session1_complete.py --start 7 --end 50

  # Custom log file
  python3 scrape_session1_complete.py --log-file my_scrape.log
        """
    )

    parser.add_argument(
        '--start',
        type=int,
        default=DEFAULT_START,
        help=f'Starting product index (default: {DEFAULT_START})'
    )
    parser.add_argument(
        '--end',
        type=int,
        default=DEFAULT_END,
        help=f'Ending product index (default: {DEFAULT_END})'
    )
    parser.add_argument(
        '--log-file',
        type=str,
        default=DEFAULT_LOG_FILE,
        help=f'Log file path (default: {DEFAULT_LOG_FILE})'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help=f'Save progress every N products (default: {DEFAULT_BATCH_SIZE})'
    )

    return parser


def setup_logging(log_file: str) -> logging.Logger:
    """Setup logging to both file and console."""
    logger = logging.getLogger('scraper')
    logger.setLevel(logging.INFO)

    # File handler
    fh = logging.FileHandler(log_file, mode='a', encoding='utf-8')
    fh.setLevel(logging.INFO)

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)

    # Formatter
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)

    logger.addHandler(fh)
    logger.addHandler(ch)

    return logger


def scrape_product(
    firecrawl_app: Any,  # FirecrawlApp instance
    product_url: str,
    logger: logging.Logger,
    max_retries: int = MAX_RETRIES
) -> Optional[str]:
    """
    Scrape a product page using Firecrawl SDK.

    Args:
        firecrawl_app: Initialized FirecrawlApp instance
        product_url: URL to scrape
        logger: Logger instance
        max_retries: Maximum retry attempts on failure

    Returns:
        Markdown content or None on failure
    """
    for attempt in range(max_retries + 1):
        try:
            result = firecrawl_app.scrape_url(
                url=product_url,
                params={
                    'formats': ['markdown'],
                    'onlyMainContent': False,  # CRITICAL: Captures breadcrumb for subcategory
                    'waitFor': 2000,  # Allows JavaScript rendering
                    'removeBase64Images': True  # Reduces response size
                }
            )

            markdown = result.get('markdown', '')
            if markdown:
                return markdown
            else:
                logger.warning(f"Empty markdown returned (attempt {attempt + 1})")

        except Exception as e:
            if attempt < max_retries:
                logger.warning(f"Scraping failed (attempt {attempt + 1}): {e} - retrying...")
                time.sleep(1)  # Wait 1 second before retry
            else:
                logger.error(f"Scraping failed after {max_retries + 1} attempts: {e}")
                return None

    return None


def scrape_session1(
    start_index: int,
    end_index: int,
    batch_size: int,
    logger: logging.Logger
) -> Dict:
    """
    Main scraping loop for Session 1 products.

    Returns:
        Summary statistics dictionary
    """
    # Initialize Firecrawl
    if not FIRECRAWL_AVAILABLE:
        logger.error("Firecrawl SDK not available. Exiting.")
        sys.exit(1)

    import os
    api_key = os.environ.get('FIRECRAWL_API_KEY')
    if not api_key:
        logger.error("FIRECRAWL_API_KEY environment variable not set. Exiting.")
        sys.exit(1)

    firecrawl_app = FirecrawlApp(api_key=api_key)

    # Load data
    logger.info("Loading products and progress...")
    products = load_products()
    progress = load_progress()
    completed_indices = set(progress.get('completed_indices', []))

    # Initialize counters
    start_time = datetime.now()
    total_to_scrape = end_index - start_index + 1
    scraped_count = 0
    failed_count = 0
    skipped_count = 0

    logger.info(f"Starting Session 1 scraping: products {start_index}-{end_index}")
    logger.info(f"Total to process: {total_to_scrape} products")
    already_completed = len([i for i in completed_indices if start_index <= i <= end_index])
    logger.info(f"Already completed: {already_completed} products")

    # Main loop
    for index in range(start_index, end_index + 1):
        # Skip if already completed
        if index in completed_indices:
            skipped_count += 1
            logger.info(f"[{index}/{end_index}] Skipping (already completed)")
            continue

        # Get product
        product = products[index]
        product_url = product.get('link', '')
        product_name = f"{product.get('brand', 'N/A')} - {product.get('product_name', 'N/A')[:50]}"

        logger.info(f"[{index}/{end_index}] Scraping: {product_name}")
        logger.info(f"  URL: {product_url}")

        # Scrape product
        scrape_start = time.time()
        markdown = scrape_product(firecrawl_app, product_url, logger)
        scrape_duration = time.time() - scrape_start

        if markdown:
            # Parse markdown
            scraped_attrs = parse_product_page_markdown(markdown)

            # Record success
            record_scraped_item(index, product, scraped_attrs, success=True)
            scraped_count += 1
            logger.info(f"SUCCESS: [{index}/{end_index}] Scraped successfully ({scrape_duration:.1f}s)")
            logger.info(f"  Attributes: subcategory={bool(scraped_attrs.get('subcategory'))}, "
                       f"material={bool(scraped_attrs.get('material'))}, "
                       f"color={bool(scraped_attrs.get('color_from_page'))}")
        else:
            # Record failure
            record_scraped_item(index, product, {}, success=False)
            failed_count += 1
            logger.error(f"FAILED: [{index}/{end_index}] Could not scrape product")

        # Checkpoint every batch_size products
        if (scraped_count + failed_count) % batch_size == 0:
            completed = scraped_count + skipped_count
            logger.info(f"CHECKPOINT: Processed {scraped_count + failed_count}/{total_to_scrape} "
                       f"(scraped: {scraped_count}, failed: {failed_count}, skipped: {skipped_count})")

        # Sleep between requests
        time.sleep(SLEEP_BETWEEN_REQUESTS)

    # Calculate final statistics
    elapsed_time = datetime.now() - start_time
    total_processed = scraped_count + failed_count + skipped_count
    success_rate = (scraped_count / (scraped_count + failed_count) * 100) if (scraped_count + failed_count) > 0 else 0

    return {
        'total_to_scrape': total_to_scrape,
        'total_processed': total_processed,
        'scraped': scraped_count,
        'failed': failed_count,
        'skipped': skipped_count,
        'success_rate': success_rate,
        'elapsed_time': str(elapsed_time).split('.')[0]  # Remove microseconds
    }


def print_summary(stats: Dict, logger: logging.Logger):
    """Print final scraping summary."""
    logger.info("=" * 70)
    logger.info("SESSION 1 SCRAPING COMPLETE")
    logger.info("=" * 70)
    logger.info(f"Total products to scrape: {stats['total_to_scrape']}")
    logger.info(f"Successfully scraped: {stats['scraped']}")
    logger.info(f"Failed: {stats['failed']}")
    logger.info(f"Skipped (already done): {stats['skipped']}")
    logger.info(f"Success rate: {stats['success_rate']:.1f}%")
    logger.info(f"Elapsed time: {stats['elapsed_time']}")
    logger.info("=" * 70)

    # Get overall status
    status = get_status()
    logger.info(f"Overall catalog progress: {status['completed']}/{status['total_products']} "
               f"({status['completion_rate']})")
    logger.info(f"Session 1 target (250 products): "
               f"{'✓ COMPLETE' if status['completed'] >= 250 else f'{status['completed']}/250'}")
    logger.info("=" * 70)


def main():
    """Main entry point for automated scraping."""
    # Parse arguments
    parser = setup_argument_parser()
    args = parser.parse_args()

    # Setup logging
    logger = setup_logging(args.log_file)

    # Validate arguments
    if args.start < 0 or args.end >= 1247:
        logger.error(f"Invalid range: {args.start}-{args.end}. Must be 0-1246.")
        sys.exit(1)

    if args.start > args.end:
        logger.error(f"Start index ({args.start}) must be <= end index ({args.end})")
        sys.exit(1)

    # Log configuration
    logger.info(f"Configuration:")
    logger.info(f"  Index range: {args.start}-{args.end}")
    logger.info(f"  Log file: {args.log_file}")
    logger.info(f"  Batch size: {args.batch_size}")
    logger.info("")

    try:
        # Run scraping
        stats = scrape_session1(
            start_index=args.start,
            end_index=args.end,
            batch_size=args.batch_size,
            logger=logger
        )

        # Print summary
        print_summary(stats, logger)

        # Exit with appropriate code
        if stats['failed'] == 0:
            logger.info("Scraping completed successfully with no failures.")
            sys.exit(0)
        elif stats['success_rate'] >= 95:
            logger.info("Scraping completed with acceptable failure rate (<5%).")
            sys.exit(0)
        else:
            logger.warning(f"Scraping completed with high failure rate ({100 - stats['success_rate']:.1f}%).")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.warning("\nScraping interrupted by user. Progress has been saved.")
        logger.info("Run the script again to resume from where you left off.")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
