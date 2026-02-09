#!/usr/bin/env python3
"""
Batch processor for Session 1 scraping.
This script manages the batch processing and integrates with Claude Code's MCP calls.
"""

import json
import sys
import time
from pathlib import Path
from incremental_scraper import (
    load_products,
    load_progress,
    record_scraped_item,
    get_status,
    parse_scraped_markdown
)

def process_batch(start_idx, end_idx):
    """
    Print information about products in the batch that need to be scraped.
    Claude Code will then make the actual MCP calls.
    """
    products = load_products()
    progress = load_progress()
    completed_indices = set(progress.get('completed_indices', []))

    print(f"\n{'='*70}")
    print(f"BATCH: Products {start_idx}-{end_idx}")
    print(f"{'='*70}\n")

    batch_info = []
    for idx in range(start_idx, end_idx + 1):
        if idx >= len(products):
            break
        if idx in completed_indices:
            print(f"[{idx}] SKIPPED (already completed)")
            continue

        product = products[idx]
        batch_info.append({
            'index': idx,
            'url': product.get('link'),
            'brand': product.get('brand', 'N/A'),
            'name': product.get('product_name', 'N/A')[:60]
        })
        print(f"[{idx}] {product.get('brand', 'N/A')} - {product.get('product_name', 'N/A')[:60]}")

    print(f"\n{'='*70}")
    print(f"Total products to scrape in this batch: {len(batch_info)}")
    print(f"{'='*70}\n")

    return batch_info

def record_result(index, success, scraped_attrs=None):
    """
    Record a scraping result.
    """
    products = load_products()
    if index >= len(products):
        print(f"Error: Index {index} out of range")
        return

    product = products[index]

    if scraped_attrs is None:
        scraped_attrs = {}

    record_scraped_item(index, product, scraped_attrs, success)
    print(f"[{index}] Recorded: success={success}")

def show_batch_status(start_idx, end_idx):
    """Show status for a specific batch range."""
    progress = load_progress()
    completed_indices = set(progress.get('completed_indices', []))
    failed_indices = set(progress.get('failed_indices', []))

    completed_in_batch = [i for i in range(start_idx, end_idx + 1) if i in completed_indices]
    failed_in_batch = [i for i in range(start_idx, end_idx + 1) if i in failed_indices]
    total_in_batch = end_idx - start_idx + 1

    print(f"\n{'='*70}")
    print(f"BATCH STATUS: Products {start_idx}-{end_idx}")
    print(f"{'='*70}")
    print(f"Completed: {len(completed_in_batch)}/{total_in_batch}")
    print(f"Failed: {len(failed_in_batch)}/{total_in_batch}")
    print(f"Remaining: {total_in_batch - len(completed_in_batch) - len(failed_in_batch)}/{total_in_batch}")
    print(f"{'='*70}\n")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage:")
        print("  batch_processor.py process <start> <end>  - Show batch info")
        print("  batch_processor.py status <start> <end>   - Show batch status")
        print("  batch_processor.py record <index> <success> - Record result")
        sys.exit(1)

    command = sys.argv[1]

    if command == 'process':
        if len(sys.argv) < 4:
            print("Usage: batch_processor.py process <start> <end>")
            sys.exit(1)
        start_idx = int(sys.argv[2])
        end_idx = int(sys.argv[3])
        process_batch(start_idx, end_idx)

    elif command == 'status':
        if len(sys.argv) < 4:
            print("Usage: batch_processor.py status <start> <end>")
            sys.exit(1)
        start_idx = int(sys.argv[2])
        end_idx = int(sys.argv[3])
        show_batch_status(start_idx, end_idx)

    elif command == 'record':
        if len(sys.argv) < 4:
            print("Usage: batch_processor.py record <index> <success>")
            sys.exit(1)
        index = int(sys.argv[2])
        success = sys.argv[3].lower() in ['true', '1', 'yes']
        record_result(index, success)

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
