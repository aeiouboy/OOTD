#!/usr/bin/env python3
"""
Script to coordinate Session 1 scraping for Claude Code.
This script loads products and prints the scraping commands for Claude Code to execute.
"""

import json
import sys
from pathlib import Path
from incremental_scraper import load_products, load_progress

def main():
    """Main execution function."""
    # Load data
    products = load_products()
    progress = load_progress()
    completed_indices = set(progress.get('completed_indices', []))

    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: scrape_session1.py <start_index> <end_index>")
        sys.exit(1)

    start_idx = int(sys.argv[1])
    end_idx = int(sys.argv[2])

    # Get products in range
    batch_products = []
    for idx in range(start_idx, end_idx + 1):
        if idx < len(products) and idx not in completed_indices:
            batch_products.append({
                'index': idx,
                'product': products[idx]
            })

    print(f"Batch: indices {start_idx}-{end_idx}")
    print(f"Products to scrape: {len(batch_products)}")
    print(f"Already completed: {len([i for i in range(start_idx, end_idx + 1) if i in completed_indices])}")
    print()

    # Print the products in this batch
    for item in batch_products:
        idx = item['index']
        product = item['product']
        print(f"[{idx}] {product.get('brand', 'N/A')} - {product.get('product_name', 'N/A')[:60]}")
        print(f"    URL: {product.get('link', 'N/A')}")

if __name__ == '__main__':
    main()
