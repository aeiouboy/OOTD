#!/usr/bin/env python3
import sys
import time
import json
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from incremental_scraper import load_products, load_progress, record_scraped_item
from markdown_parser import parse_product_page_markdown

# Load state
products = load_products()
progress = load_progress()
completed = set(progress.get('completed_indices', []))

print(f"Total: {len(products)}, Completed: {len(completed)}, Remaining: {len(products) - len(completed)}")
print(f"\nNext products to scrape (Session 1, indices 0-249):")

# Show next 10 products to scrape
count = 0
for idx in range(250):
    if idx not in completed:
        product = products[idx]
        print(f"  [{idx}] {product.get('brand', 'No Brand')} - {product.get('product_name', 'No Name')}")
        print(f"      URL: {product.get('link', '')}")
        count += 1
        if count >= 10:
            break

print(f"\nTo scrape these, you'll need to:")
print(f"1. Use Claude Code with Firecrawl MCP tools")
print(f"2. OR get Firecrawl API key and use direct API calls")
