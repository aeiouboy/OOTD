#!/usr/bin/env python3
"""
Incremental scraper that maintains state between scraping sessions.
Designed to be called by Claude Code with actual Firecrawl MCP tools.
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict

# Import the markdown parser
from markdown_parser import parse_product_page_markdown

# Setup paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent.parent / "data" / "products"

INPUT_FILE = DATA_DIR / "women_clothing_v1.json"
OUTPUT_FILE = DATA_DIR / "women_clothing_scraped.json"
PROGRESS_FILE = SCRIPT_DIR / "scraping_progress.json"


def load_products() -> List[Dict]:
    """Load all products from input file."""
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('products', [])


def load_progress() -> Dict:
    """Load scraping progress."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'started_at': datetime.now().isoformat(),
        'last_updated': None,
        'completed_count': 0,
        'failed_count': 0,
        'completed_indices': [],
        'failed_indices': [],
        'total_products': 0
    }


def save_progress(progress: Dict):
    """Save scraping progress."""
    progress['last_updated'] = datetime.now().isoformat()
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)


def load_scraped_data() -> List[Dict]:
    """Load existing scraped data."""
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('products', [])
    return []


def save_scraped_data(scraped_items: List[Dict]):
    """Save scraped data to output file."""
    output_data = {
        'version': 'v1',
        'totalCount': len(scraped_items),
        'scraping_metadata': {
            'last_updated': datetime.now().isoformat(),
            'total_scraped': len(scraped_items)
        },
        'products': scraped_items
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)


def get_next_batch(batch_size: int = 50) -> List[Dict]:
    """Get next batch of products to scrape."""
    products = load_products()
    progress = load_progress()

    completed = set(progress.get('completed_indices', []))
    failed = set(progress.get('failed_indices', []))
    processed = completed | failed

    batch = []
    for idx, product in enumerate(products):
        if idx not in processed:
            batch.append({
                'index': idx,
                'product': product
            })
            if len(batch) >= batch_size:
                break

    return batch


def record_scraped_item(index: int, product: Dict, scraped_attrs: Dict, success: bool):
    """Record a scraped item."""
    # Load current progress
    progress = load_progress()
    products = load_products()

    if success:
        # Merge original product with scraped attributes
        merged_product = {**product, **scraped_attrs}

        # Load existing scraped data
        scraped_data = load_scraped_data()

        # Create or update scraped data dictionary indexed by link
        scraped_dict = {item.get('link'): item for item in scraped_data}
        scraped_dict[product.get('link')] = merged_product

        # Convert back to list maintaining original order
        updated_scraped = []
        for orig_product in products:
            link = orig_product.get('link')
            if link in scraped_dict:
                updated_scraped.append(scraped_dict[link])

        # Save scraped data
        save_scraped_data(updated_scraped)

        # Update progress
        if index not in progress.get('completed_indices', []):
            progress.setdefault('completed_indices', []).append(index)
            progress['completed_count'] = len(progress['completed_indices'])
    else:
        # Record failure
        if index not in progress.get('failed_indices', []):
            progress.setdefault('failed_indices', []).append(index)
            progress['failed_count'] = len(progress['failed_indices'])

    progress['total_products'] = len(products)
    save_progress(progress)


def get_status() -> Dict:
    """Get current scraping status."""
    products = load_products()
    progress = load_progress()
    total = len(products)
    completed = len(progress.get('completed_indices', []))
    failed = len(progress.get('failed_indices', []))
    remaining = total - completed - failed

    return {
        'total_products': total,
        'completed': completed,
        'failed': failed,
        'remaining': remaining,
        'completion_rate': f"{completed/total*100:.1f}%" if total > 0 else "0%",
        'success_rate': f"{completed/(completed+failed)*100:.1f}%" if (completed+failed) > 0 else "N/A"
    }


def print_status():
    """Print scraping status."""
    status = get_status()
    print("\n" + "="*70)
    print("SCRAPING STATUS")
    print("="*70)
    print(f"Total products: {status['total_products']}")
    print(f"Completed: {status['completed']} ({status['completion_rate']})")
    print(f"Failed: {status['failed']}")
    print(f"Remaining: {status['remaining']}")
    print(f"Success rate: {status['success_rate']}")
    print("="*70 + "\n")


def parse_scraped_markdown(markdown: str) -> Dict:
    """Parse scraped markdown using the parser."""
    return parse_product_page_markdown(markdown)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            print_status()
        elif command == 'next':
            batch_size = int(sys.argv[2]) if len(sys.argv) > 2 else 50
            batch = get_next_batch(batch_size)
            print(f"Next batch: {len(batch)} products")
            for item in batch[:10]:  # Show first 10
                idx = item['index']
                product = item['product']
                print(f"  [{idx}] {product.get('brand', 'N/A')} - {product.get('product_name', 'N/A')[:60]}")
            if len(batch) > 10:
                print(f"  ... and {len(batch) - 10} more")
        elif command == 'reset':
            if PROGRESS_FILE.exists():
                PROGRESS_FILE.unlink()
            print("Progress reset")
        else:
            print(f"Unknown command: {command}")
            print("Usage: incremental_scraper.py [status|next|reset]")
    else:
        print_status()
