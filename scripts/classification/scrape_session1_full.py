#!/usr/bin/env python3
"""
Session 1 Scraping Coordinator
This script coordinates scraping for Session 1 (products 5-249).
Designed to be run by Claude Code which will make actual Firecrawl MCP calls.
"""

import json
import sys
import time
from pathlib import Path
from datetime import datetime
from incremental_scraper import (
    load_products,
    load_progress,
    record_scraped_item,
    get_status,
    parse_scraped_markdown
)

def scrape_session1(start_batch=1, end_batch=10):
    """
    Coordinate Session 1 scraping (products 5-249).

    Batches:
    1: 5-29 (25 products)
    2: 30-54 (25 products)
    3: 55-79 (25 products)
    4: 80-104 (25 products)
    5: 105-129 (25 products)
    6: 130-154 (25 products)
    7: 155-179 (25 products)
    8: 180-204 (25 products)
    9: 205-229 (25 products)
    10: 230-249 (20 products)
    """

    batch_ranges = [
        (5, 29),    # Batch 1
        (30, 54),   # Batch 2
        (55, 79),   # Batch 3
        (80, 104),  # Batch 4
        (105, 129), # Batch 5
        (130, 154), # Batch 6
        (155, 179), # Batch 7
        (180, 204), # Batch 8
        (205, 229), # Batch 9
        (230, 249), # Batch 10
    ]

    products = load_products()

    print("\n" + "="*70)
    print("SESSION 1 SCRAPING COORDINATOR")
    print("="*70)
    print(f"Target: Products 5-249 (245 products)")
    print(f"Batches: {start_batch}-{end_batch}")
    print("="*70 + "\n")

    for batch_num in range(start_batch - 1, end_batch):
        if batch_num >= len(batch_ranges):
            break

        start_idx, end_idx = batch_ranges[batch_num]
        batch_size = end_idx - start_idx + 1

        print(f"\n{'='*70}")
        print(f"BATCH {batch_num + 1}: Products {start_idx}-{end_idx} ({batch_size} products)")
        print(f"{'='*70}\n")

        progress = load_progress()
        completed_indices = set(progress.get('completed_indices', []))

        scraped_count = 0
        skipped_count = 0

        for idx in range(start_idx, end_idx + 1):
            if idx in completed_indices:
                skipped_count += 1
                print(f"[{idx}] SKIPPED (already completed)")
                continue

            if idx >= len(products):
                print(f"[{idx}] SKIPPED (out of range)")
                continue

            product = products[idx]
            url = product.get('link')

            # This is where Claude Code would make the Firecrawl MCP call
            # For now, we print the instruction
            print(f"\n[{idx}] {product.get('brand', 'N/A')} - {product.get('product_name', 'N/A')[:50]}")
            print(f"      URL: {url}")
            print(f"      → Claude Code: Call mcp__firecrawl-mcp__firecrawl_scrape")
            print(f"      → Parameters:")
            print(f"         - url: {url}")
            print(f"         - formats: ['markdown']")
            print(f"         - onlyMainContent: false")
            print(f"         - waitFor: 2000")
            print(f"         - removeBase64Images: true")
            print(f"      → Parse markdown with parse_product_page_markdown()")
            print(f"      → Call record_scraped_item({idx}, product, attrs, True)")

            scraped_count += 1

        print(f"\nBatch {batch_num + 1} Summary:")
        print(f"  Processed: {scraped_count}")
        print(f"  Skipped: {skipped_count}")
        print(f"  Total: {batch_size}")

        # Show updated status
        status = get_status()
        print(f"\nOverall Progress: {status['completed']}/{status['total_products']} ({status['completion_rate']})")

    print("\n" + "="*70)
    print("SESSION 1 SCRAPING PLAN COMPLETE")
    print("="*70)
    print("\nNext: Claude Code will make actual Firecrawl MCP calls")
    print("      for each product following the printed instructions.")
    print("="*70 + "\n")

if __name__ == '__main__':
    start_batch = 1
    end_batch = 10

    if len(sys.argv) > 1:
        start_batch = int(sys.argv[1])
    if len(sys.argv) > 2:
        end_batch = int(sys.argv[2])

    scrape_session1(start_batch, end_batch)
