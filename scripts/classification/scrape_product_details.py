#!/usr/bin/env python3
"""
Scrape product details from Central.co.th using Firecrawl MCP.

This script scrapes product pages to extract detailed attributes like
subcategory, material, fit, care instructions, and color for improved
occasion classification accuracy.
"""

import json
import sys
import time
import logging
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from markdown_parser import parse_product_page_markdown

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraping_errors.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def load_products(filepath: str) -> Tuple[List[Dict], Dict]:
    """
    Load products from women_clothing_v1.json.

    Args:
        filepath: Path to the JSON file

    Returns:
        Tuple of (products list, metadata dict)
    """
    logger.info(f"Loading products from {filepath}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        products = data.get('products', [])
        metadata = {k: v for k, v in data.items() if k != 'products'}

        logger.info(f"Loaded {len(products)} products")
        return products, metadata

    except Exception as e:
        logger.error(f"Failed to load products: {e}")
        raise


def scrape_product_page(url: str, product_name: str, product_id: str) -> Dict:
    """
    Scrape a single product page using Firecrawl MCP.

    Args:
        url: Product page URL
        product_name: Product name for logging
        product_id: Product ID for logging

    Returns:
        Dictionary with scraped fields or error information
    """
    max_retries = 3
    retry_delay = 1  # seconds

    for attempt in range(max_retries):
        try:
            logger.debug(f"Scraping {product_id}: {product_name} (attempt {attempt + 1}/{max_retries})")

            # Import Firecrawl MCP function
            # Note: This will be called via MCP tools in actual execution
            # For now, we'll structure the code to accept the scraped result

            # In actual execution, this would be called via MCP:
            # result = mcp__firecrawl-mcp__firecrawl_scrape(
            #     url=url,
            #     formats=["markdown"],
            #     onlyMainContent=False,
            #     waitFor=2000,
            #     removeBase64Images=True
            # )

            # Placeholder for MCP call - will be executed by Claude Code
            scraped_data = {
                'url': url,
                'product_id': product_id,
                'product_name': product_name,
                'scraping_status': 'pending_mcp_call',
                'scraping_timestamp': datetime.now().isoformat(),
                'attempt': attempt + 1
            }

            return scraped_data

        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed for {product_id}: {e}")

            if attempt < max_retries - 1:
                time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
            else:
                logger.error(f"All retries failed for {product_id}: {product_name}")
                return {
                    'url': url,
                    'product_id': product_id,
                    'product_name': product_name,
                    'scraping_status': 'failed',
                    'error': str(e),
                    'scraping_timestamp': datetime.now().isoformat()
                }

    return {}


def parse_scraped_markdown(markdown: str, url: str, product_id: str, product_name: str) -> Dict:
    """
    Parse scraped markdown and return enriched product data.

    Args:
        markdown: Scraped markdown content
        url: Product URL
        product_id: Product ID
        product_name: Product name

    Returns:
        Dictionary with all scraped and parsed fields
    """
    try:
        parsed_data = parse_product_page_markdown(markdown)

        return {
            'url': url,
            'product_id': product_id,
            'product_name': product_name,
            'scraping_status': 'success',
            'scraping_timestamp': datetime.now().isoformat(),
            **parsed_data  # Add all parsed fields
        }

    except Exception as e:
        logger.error(f"Failed to parse markdown for {product_id}: {e}")
        return {
            'url': url,
            'product_id': product_id,
            'product_name': product_name,
            'scraping_status': 'parse_failed',
            'error': str(e),
            'scraping_timestamp': datetime.now().isoformat()
        }


def scrape_all_products(
    products: List[Dict],
    start_index: int = 0,
    limit: Optional[int] = None,
    batch_size: int = 100
) -> List[Dict]:
    """
    Scrape all products with progress tracking and checkpointing.

    Args:
        products: List of product dictionaries
        start_index: Starting index for resuming
        limit: Maximum number of products to scrape (None for all)
        batch_size: Number of products to process before checkpointing

    Returns:
        List of enriched product dictionaries
    """
    end_index = len(products) if limit is None else min(start_index + limit, len(products))
    total = end_index - start_index

    logger.info(f"Starting scraping: {total} products (index {start_index} to {end_index})")

    scraped_products = []
    checkpoint_file = Path('data/products/scraping_checkpoint.json')

    # Load existing checkpoint if resuming
    if start_index > 0 and checkpoint_file.exists():
        logger.info("Loading checkpoint data")
        try:
            with open(checkpoint_file, 'r', encoding='utf-8') as f:
                checkpoint_data = json.load(f)
                scraped_products = checkpoint_data.get('scraped_products', [])
        except Exception as e:
            logger.warning(f"Failed to load checkpoint: {e}")

    for i, product in enumerate(products[start_index:end_index], start=start_index):
        # Progress indicator
        if (i - start_index) % 10 == 0:
            progress = ((i - start_index) / total) * 100
            logger.info(f"Progress: {i - start_index}/{total} ({progress:.1f}%)")

        # Get product details
        product_id = product.get('id', f'unknown_{i}')
        product_name = product.get('name', 'Unknown Product')
        product_link = product.get('link', '')

        if not product_link:
            logger.warning(f"No link for product {product_id}: {product_name}")
            scraped_products.append({
                'product_id': product_id,
                'product_name': product_name,
                'scraping_status': 'no_url',
                'scraping_timestamp': datetime.now().isoformat()
            })
            continue

        # Scrape product page
        # Note: This is a placeholder - actual MCP call will happen via Claude Code
        scraped_data = scrape_product_page(product_link, product_name, product_id)
        scraped_products.append(scraped_data)

        # Rate limiting: 100ms delay between requests
        time.sleep(0.1)

        # Checkpoint every batch_size products
        if (i - start_index + 1) % batch_size == 0:
            logger.info(f"Checkpoint: Saving progress at {i - start_index + 1} products")
            save_checkpoint(checkpoint_file, scraped_products, i + 1)

    # Final save
    logger.info("Scraping complete, removing checkpoint file")
    if checkpoint_file.exists():
        checkpoint_file.unlink()

    return scraped_products


def save_checkpoint(filepath: Path, scraped_products: List[Dict], next_index: int):
    """
    Save checkpoint data for resuming interrupted scraping.

    Args:
        filepath: Path to checkpoint file
        scraped_products: List of scraped products so far
        next_index: Index to resume from
    """
    try:
        checkpoint_data = {
            'next_index': next_index,
            'scraped_products': scraped_products,
            'timestamp': datetime.now().isoformat()
        }

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(checkpoint_data, f, indent=2, ensure_ascii=False)

        logger.debug(f"Checkpoint saved: {len(scraped_products)} products")

    except Exception as e:
        logger.error(f"Failed to save checkpoint: {e}")


def save_scraped_data(filepath: str, products: List[Dict], original_metadata: Dict):
    """
    Save enriched product data to JSON file.

    Args:
        filepath: Output file path
        products: List of enriched product dictionaries
        original_metadata: Original metadata from source file
    """
    logger.info(f"Saving scraped data to {filepath}")

    try:
        output_data = {
            **original_metadata,
            'products': products,
            'scraping_metadata': {
                'total_products': len(products),
                'scraping_timestamp': datetime.now().isoformat(),
                'scraper_version': '1.0'
            }
        }

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        logger.info(f"Successfully saved {len(products)} products")

    except Exception as e:
        logger.error(f"Failed to save scraped data: {e}")
        raise


def generate_scraping_report(scraped_data: List[Dict]) -> str:
    """
    Generate detailed scraping report with success rates and coverage.

    Args:
        scraped_data: List of scraped product data

    Returns:
        Formatted report string
    """
    total = len(scraped_data)

    # Count by status
    status_counts = {}
    for item in scraped_data:
        status = item.get('scraping_status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1

    # Count attribute coverage
    attributes = ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']
    coverage = {attr: 0 for attr in attributes}

    for item in scraped_data:
        if item.get('scraping_status') == 'success':
            for attr in attributes:
                if item.get(attr):
                    coverage[attr] += 1

    # Generate report
    report_lines = [
        "=" * 70,
        "SCRAPING REPORT",
        "=" * 70,
        f"Total Products: {total}",
        "",
        "Status Breakdown:",
    ]

    for status, count in sorted(status_counts.items()):
        percentage = (count / total * 100) if total > 0 else 0
        report_lines.append(f"  {status}: {count} ({percentage:.1f}%)")

    report_lines.extend([
        "",
        "Attribute Coverage (for successfully scraped products):",
    ])

    success_count = status_counts.get('success', 0)
    for attr, count in coverage.items():
        percentage = (count / success_count * 100) if success_count > 0 else 0
        report_lines.append(f"  {attr}: {count}/{success_count} ({percentage:.1f}%)")

    # List failures
    failures = [item for item in scraped_data if item.get('scraping_status') in ['failed', 'parse_failed']]
    if failures:
        report_lines.extend([
            "",
            f"Failed Products ({len(failures)}):",
        ])
        for item in failures[:10]:  # Show first 10
            report_lines.append(f"  - {item.get('product_id')}: {item.get('product_name')} ({item.get('error', 'unknown error')})")
        if len(failures) > 10:
            report_lines.append(f"  ... and {len(failures) - 10} more (see scraping_errors.log)")

    report_lines.append("=" * 70)

    return "\n".join(report_lines)


def main():
    """Main execution function."""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape Central.co.th product details')
    parser.add_argument('--start', type=int, default=0, help='Start index for resuming')
    parser.add_argument('--limit', type=int, default=None, help='Limit number of products to scrape')
    parser.add_argument('--batch-size', type=int, default=100, help='Batch size for checkpointing')
    parser.add_argument('--input', type=str, default='data/products/women_clothing_v1.json', help='Input file path')
    parser.add_argument('--output', type=str, default='data/products/women_clothing_scraped.json', help='Output file path')

    args = parser.parse_args()

    try:
        # Load products
        products, metadata = load_products(args.input)

        # Check for existing checkpoint
        checkpoint_file = Path('data/products/scraping_checkpoint.json')
        if args.start == 0 and checkpoint_file.exists():
            logger.info("Found existing checkpoint file")
            try:
                with open(checkpoint_file, 'r', encoding='utf-8') as f:
                    checkpoint_data = json.load(f)
                    resume_index = checkpoint_data.get('next_index', 0)
                    logger.info(f"Resuming from index {resume_index}")
                    args.start = resume_index
            except Exception as e:
                logger.warning(f"Failed to load checkpoint: {e}, starting from beginning")

        # Scrape products
        scraped_data = scrape_all_products(
            products,
            start_index=args.start,
            limit=args.limit,
            batch_size=args.batch_size
        )

        # Merge scraped data back into products
        # Create mapping of product_id to scraped data
        scraped_map = {item.get('product_id'): item for item in scraped_data}

        enriched_products = []
        for product in products:
            product_id = product.get('id')
            scraped = scraped_map.get(product_id, {})

            # Merge scraped attributes into product
            enriched_product = {**product}
            for key in ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']:
                if key in scraped and scraped[key]:
                    enriched_product[key] = scraped[key]

            # Add scraping metadata
            enriched_product['scraping_metadata'] = {
                'status': scraped.get('scraping_status', 'not_scraped'),
                'timestamp': scraped.get('scraping_timestamp', '')
            }

            enriched_products.append(enriched_product)

        # Save enriched data
        save_scraped_data(args.output, enriched_products, metadata)

        # Generate and print report
        report = generate_scraping_report(scraped_data)
        print("\n" + report)

        # Save report to file
        report_file = Path('scripts/classification/scraping_report.txt')
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        logger.info(f"Report saved to {report_file}")

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
