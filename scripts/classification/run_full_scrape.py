#!/usr/bin/env python3
"""
Load products and prepare them for Firecrawl MCP scraping.
Claude Code will call this to get product URLs to scrape.
"""

import json
import sys
from pathlib import Path

# Setup paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent.parent / "data" / "products"
INPUT_FILE = DATA_DIR / "women_clothing_v1.json"

def load_products():
    """Load all products."""
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('products', data if isinstance(data, list) else [])

def get_product_urls(start_idx=0, limit=None):
    """Get product URLs for scraping."""
    products = load_products()

    if limit:
        products = products[start_idx:start_idx + limit]
    else:
        products = products[start_idx:]

    urls = []
    for idx, product in enumerate(products, start=start_idx):
        urls.append({
            'index': idx,
            'url': product.get('link', ''),
            'product_name': product.get('product_name', ''),
            'brand': product.get('brand', '')
        })

    return urls

if __name__ == '__main__':
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else None

    urls = get_product_urls(start, limit)
    print(json.dumps(urls, indent=2, ensure_ascii=False))
