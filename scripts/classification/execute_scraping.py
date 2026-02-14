#!/usr/bin/env python3
"""
Execute Firecrawl MCP scraping for women's clothing products.

This script calls the actual Firecrawl MCP tools to scrape product pages.
It's designed to be called by Claude Code with access to MCP tools.
"""

import json
import sys
import time
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

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


class ScrapingExecutor:
    """Handles the actual scraping execution with MCP tools."""

    def __init__(self, input_file: str, output_file: str):
        self.input_file = input_file
        self.output_file = output_file
        self.checkpoint_file = Path('data/products/scraping_checkpoint.json')
        self.scraped_data = []

    def load_products(self) -> tuple[List[Dict], Dict]:
        """Load products from JSON file."""
        logger.info(f"Loading products from {self.input_file}")

        with open(self.input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        products = data.get('products', [])
        metadata = {k: v for k, v in data.items() if k != 'products'}

        logger.info(f"Loaded {len(products)} products")
        return products, metadata

    def save_checkpoint(self, next_index: int):
        """Save checkpoint for resuming."""
        checkpoint_data = {
            'next_index': next_index,
            'scraped_data': self.scraped_data,
            'timestamp': datetime.now().isoformat()
        }

        with open(self.checkpoint_file, 'w', encoding='utf-8') as f:
            json.dump(checkpoint_data, f, indent=2, ensure_ascii=False)

        logger.info(f"Checkpoint saved at index {next_index}")

    def load_checkpoint(self) -> Optional[int]:
        """Load checkpoint if it exists."""
        if self.checkpoint_file.exists():
            try:
                with open(self.checkpoint_file, 'r', encoding='utf-8') as f:
                    checkpoint_data = json.load(f)
                    self.scraped_data = checkpoint_data.get('scraped_data', [])
                    next_index = checkpoint_data.get('next_index', 0)
                    logger.info(f"Resuming from checkpoint at index {next_index}")
                    return next_index
            except Exception as e:
                logger.warning(f"Failed to load checkpoint: {e}")
        return None

    def save_results(self, products: List[Dict], metadata: Dict):
        """Save enriched results to output file."""
        # Create mapping of product_id to scraped data
        scraped_map = {}
        for item in self.scraped_data:
            product_id = item.get('product_id')
            if product_id:
                scraped_map[product_id] = item

        # Merge scraped data into products
        enriched_products = []
        for product in products:
            product_id = product.get('id')
            scraped = scraped_map.get(product_id, {})

            # Start with original product
            enriched_product = {**product}

            # Add scraped attributes
            for key in ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']:
                if key in scraped and scraped[key]:
                    enriched_product[key] = scraped[key]

            # Add scraping metadata
            enriched_product['scraping_metadata'] = {
                'status': scraped.get('scraping_status', 'not_scraped'),
                'timestamp': scraped.get('scraping_timestamp', '')
            }

            enriched_products.append(enriched_product)

        # Save to file
        output_data = {
            **metadata,
            'products': enriched_products,
            'scraping_metadata': {
                'total_products': len(enriched_products),
                'scraping_timestamp': datetime.now().isoformat(),
                'scraper_version': '1.0'
            }
        }

        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        logger.info(f"Saved {len(enriched_products)} enriched products to {self.output_file}")

    def generate_report(self) -> str:
        """Generate scraping report."""
        total = len(self.scraped_data)

        # Count by status
        status_counts = {}
        for item in self.scraped_data:
            status = item.get('scraping_status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1

        # Count attribute coverage
        attributes = ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']
        coverage = {attr: 0 for attr in attributes}

        successful = [item for item in self.scraped_data if item.get('scraping_status') == 'success']
        for item in successful:
            for attr in attributes:
                if item.get(attr):
                    coverage[attr] += 1

        # Build report
        lines = [
            "=" * 70,
            "FIRECRAWL MCP SCRAPING REPORT",
            "=" * 70,
            f"Total Products: {total}",
            "",
            "Status Breakdown:",
        ]

        for status, count in sorted(status_counts.items()):
            percentage = (count / total * 100) if total > 0 else 0
            lines.append(f"  {status}: {count} ({percentage:.1f}%)")

        lines.extend([
            "",
            "Attribute Coverage (for successfully scraped products):",
        ])

        success_count = len(successful)
        targets = {
            'subcategory': 80, 'material': 70, 'fit': 60, 'care': 50,
            'color_from_page': 90, 'sleeve_type': 80, 'length_type': 75
        }

        for attr in attributes:
            count = coverage[attr]
            percentage = (count / success_count * 100) if success_count > 0 else 0
            target = targets.get(attr, 0)
            status_mark = '✓' if percentage >= target else '✗'
            lines.append(f"  {status_mark} {attr}: {count}/{success_count} ({percentage:.1f}%) [target: {target}%]")

        # List failures
        failures = [item for item in self.scraped_data if item.get('scraping_status') in ['failed', 'parse_failed']]
        if failures:
            lines.extend([
                "",
                f"Failed Products ({len(failures)}):",
            ])
            for item in failures[:10]:
                lines.append(f"  - {item.get('product_id')}: {item.get('product_name')} ({item.get('error', 'unknown error')})")
            if len(failures) > 10:
                lines.append(f"  ... and {len(failures) - 10} more (see scraping_errors.log)")

        lines.append("=" * 70)

        return "\n".join(lines)


def main():
    """Main execution function - called by Claude Code with MCP access."""
    import argparse

    parser = argparse.ArgumentParser(description='Execute Firecrawl MCP scraping')
    parser.add_argument('--limit', type=int, help='Limit number of products to scrape')
    parser.add_argument('--batch-size', type=int, default=100, help='Checkpoint every N products')
    parser.add_argument('--input', type=str, default='data/products/women_clothing_v1.json')
    parser.add_argument('--output', type=str, default='data/products/women_clothing_scraped.json')

    args = parser.parse_args()

    executor = ScrapingExecutor(args.input, args.output)

    # Load products
    products, metadata = executor.load_products()

    # Check for checkpoint
    start_index = executor.load_checkpoint() or 0

    # Determine end index
    end_index = len(products) if args.limit is None else min(start_index + args.limit, len(products))

    logger.info(f"Scraping products {start_index} to {end_index}")

    # This script expects to be called by Claude Code
    # The actual scraping will be done through MCP tool calls
    # This is just the orchestration framework

    print("\n" + "="*70)
    print("READY FOR SCRAPING EXECUTION")
    print("="*70)
    print(f"Products to scrape: {end_index - start_index}")
    print(f"Start index: {start_index}")
    print(f"End index: {end_index}")
    print(f"Batch size: {args.batch_size}")
    print("="*70)
    print("\nThis script provides the framework.")
    print("Actual scraping requires Claude Code to call Firecrawl MCP tools.")
    print("\nNext steps:")
    print("1. Claude Code will iterate through products")
    print("2. For each product URL, call mcp__firecrawl-mcp__firecrawl_scrape")
    print("3. Parse markdown with parse_product_page_markdown()")
    print("4. Store results in executor.scraped_data")
    print("5. Checkpoint every", args.batch_size, "products")
    print("6. Save final results with executor.save_results()")
    print("="*70)

    # Return the executor for programmatic use
    return executor, products, metadata, start_index, end_index, args.batch_size


if __name__ == '__main__':
    main()
