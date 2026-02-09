#!/usr/bin/env python3
"""
Execute batch scraping for Session 1 products using Firecrawl MCP
Processes products 6-249 in manageable batches
"""

import json
import time
import sys
from pathlib import Path
from incremental_scraper import load_products, load_progress, record_scraped_item, get_status
from markdown_parser import parse_product_page_markdown

def scrape_product_range(start_idx, end_idx, products, progress_data):
    """Scrape a range of products and return results"""
    results = {
        'success_count': 0,
        'fail_count': 0,
        'scraped_products': []
    }

    completed_indices = set(progress_data.get('completed_indices', []))

    for idx in range(start_idx, end_idx + 1):
        if idx in completed_indices:
            print(f"[{idx}/249] Already completed, skipping")
            results['success_count'] += 1
            continue

        if idx >= len(products):
            print(f"[{idx}/249] Index out of range, stopping")
            break

        product = products[idx]
        product_url = product.get('link', '')

        if not product_url:
            print(f"[{idx}/249] No URL, skipping")
            continue

        # Store product info for MCP call
        results['scraped_products'].append({
            'index': idx,
            'url': product_url,
            'brand': product.get('brand', ''),
            'name': product.get('product_name', '')[:50]
        })

    return results

def main():
    # Load products and progress
    products = load_products()
    progress = load_progress()

    print("=" * 70)
    print("SESSION 1 BATCH SCRAPING - Products 6-249")
    print("=" * 70)

    # Display initial status
    status = get_status()
    print(f"Initial state: {status['completed']}/{status['total']} completed")
    print(f"Remaining for Session 1: {250 - status['completed']} products")
    print("=" * 70)

    # Define batches
    batches = [
        (6, 30, "Batch 1"),
        (31, 55, "Batch 2"),
        (56, 80, "Batch 3"),
        (81, 105, "Batch 4"),
        (106, 130, "Batch 5"),
        (131, 155, "Batch 6"),
        (156, 180, "Batch 7"),
        (181, 205, "Batch 8"),
        (206, 230, "Batch 9"),
        (231, 249, "Batch 10")
    ]

    for start, end, batch_name in batches:
        print(f"\n{batch_name}: Indices {start}-{end} ({end-start+1} products)")
        results = scrape_product_range(start, end, products, progress)

        # Output product list for MCP calls
        if results['scraped_products']:
            print(f"\nProducts to scrape in {batch_name}:")
            for p in results['scraped_products']:
                print(f"  [{p['index']}] {p['brand']} - {p['name']}")
                print(f"       URL: {p['url']}")

        print(f"\n{batch_name} scan complete. Ready for MCP scraping.")
        input(f"Press Enter to continue to next batch...")

if __name__ == '__main__':
    main()
