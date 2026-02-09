#!/usr/bin/env python3
"""
Batch scraping coordinator for Firecrawl MCP.
This script manages batch processing state but actual MCP calls are made by Claude Code.
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# Setup paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent.parent / "data" / "products"

INPUT_FILE = DATA_DIR / "women_clothing_v1.json"
OUTPUT_FILE = DATA_DIR / "women_clothing_scraped.json"
CHECKPOINT_FILE = SCRIPT_DIR / "scraping_checkpoint.json"

def load_products():
    """Load products from input file."""
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('products', data if isinstance(data, list) else [])

def load_existing_scraped():
    """Load existing scraped data if available."""
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('products', data if isinstance(data, list) else [])
    return []

def load_checkpoint():
    """Load checkpoint if available."""
    if CHECKPOINT_FILE.exists():
        with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'last_index': 0, 'completed': []}

def save_checkpoint(checkpoint_data):
    """Save checkpoint."""
    with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
        json.dump(checkpoint_data, f, indent=2, ensure_ascii=False)

def get_batch_info():
    """Get current batch information."""
    products = load_products()
    checkpoint = load_checkpoint()
    scraped = load_existing_scraped()

    total = len(products)
    completed_count = len(checkpoint.get('completed', []))
    remaining = total - completed_count

    print(f"\n{'='*70}")
    print(f"SCRAPING STATUS")
    print(f"{'='*70}")
    print(f"Total products: {total}")
    print(f"Completed: {completed_count} ({completed_count/total*100:.1f}%)")
    print(f"Remaining: {remaining}")
    print(f"Last processed index: {checkpoint.get('last_index', 0)}")
    print(f"{'='*70}\n")

    return {
        'total': total,
        'completed': completed_count,
        'remaining': remaining,
        'last_index': checkpoint.get('last_index', 0),
        'products': products,
        'scraped': scraped,
        'checkpoint': checkpoint
    }

def get_next_batch(batch_size=50):
    """Get next batch of products to scrape."""
    info = get_batch_info()
    products = info['products']
    last_index = info['last_index']
    completed_indices = set(info['checkpoint'].get('completed', []))

    batch = []
    current_index = last_index

    while len(batch) < batch_size and current_index < len(products):
        if current_index not in completed_indices:
            product = products[current_index]
            batch.append({
                'index': current_index,
                'product_name': product.get('product_name', ''),
                'link': product.get('link', ''),
                'brand': product.get('brand', '')
            })
        current_index += 1

    if batch:
        print(f"Next batch: {len(batch)} products")
        print(f"Index range: {batch[0]['index']} to {batch[-1]['index']}")
        print(f"\nFirst 5 products in batch:")
        for item in batch[:5]:
            print(f"  [{item['index']}] {item['brand']} - {item['product_name'][:50]}")
    else:
        print("No more products to scrape!")

    return batch

def mark_completed(indices):
    """Mark products as completed."""
    checkpoint = load_checkpoint()
    completed = set(checkpoint.get('completed', []))
    completed.update(indices)
    checkpoint['completed'] = sorted(list(completed))
    checkpoint['last_index'] = max(indices) + 1 if indices else checkpoint.get('last_index', 0)
    checkpoint['updated_at'] = datetime.now().isoformat()
    save_checkpoint(checkpoint)
    print(f"Marked {len(indices)} products as completed")

def merge_scraped_data(scraped_items):
    """Merge newly scraped items with existing data."""
    products = load_products()
    existing_scraped = load_existing_scraped()

    # Create index map for existing scraped data
    scraped_map = {item['link']: item for item in existing_scraped}

    # Merge new scraped items
    for item in scraped_items:
        scraped_map[item['link']] = item

    # Create final output
    output = []
    for product in products:
        link = product.get('link', '')
        if link in scraped_map:
            # Merge original + scraped data
            merged = {**product, **scraped_map[link]}
            output.append(merged)
        else:
            # Original product only
            output.append(product)

    # Save output
    output_data = {
        'version': 'v1',
        'totalCount': len(output),
        'scraping_metadata': {
            'last_updated': datetime.now().isoformat(),
            'total_scraped': len(scraped_map),
            'scraping_coverage': f"{len(scraped_map)/len(products)*100:.1f}%"
        },
        'products': output
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(output)} products to {OUTPUT_FILE}")
    print(f"Scraped coverage: {output_data['scraping_metadata']['scraping_coverage']}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            get_batch_info()
        elif command == 'next':
            batch_size = int(sys.argv[2]) if len(sys.argv) > 2 else 50
            batch = get_next_batch(batch_size)
        elif command == 'reset':
            if CHECKPOINT_FILE.exists():
                CHECKPOINT_FILE.unlink()
            print("Checkpoint reset")
        else:
            print(f"Unknown command: {command}")
            print("Usage: batch_scraper.py [status|next|reset]")
    else:
        get_batch_info()
