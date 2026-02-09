#!/usr/bin/env python3
"""
Script to record scraped data from Firecrawl results.
Takes index and markdown content, parses it, and records to database.
"""

import sys
import json
from pathlib import Path
from markdown_parser import parse_product_page_markdown
from incremental_scraper import load_products, record_scraped_item

def main():
    if len(sys.argv) < 3:
        print("Usage: scrape_and_record.py <index> <markdown_file>")
        print("   or: scrape_and_record.py <index> --markdown '<markdown_text>'")
        sys.exit(1)

    index = int(sys.argv[1])

    # Get markdown content
    if sys.argv[2] == '--markdown':
        markdown = sys.argv[3]
    else:
        markdown_file = Path(sys.argv[2])
        with open(markdown_file, 'r', encoding='utf-8') as f:
            markdown = f.read()

    # Parse the markdown
    attrs = parse_product_page_markdown(markdown)

    # Load products
    products = load_products()
    if index >= len(products):
        print(f"Error: Index {index} out of range")
        sys.exit(1)

    product = products[index]

    # Record the scraped item
    record_scraped_item(index, product, attrs, True)

    # Print summary
    print(f"[{index}] Recorded successfully")
    print(f"  Brand: {product.get('brand', 'N/A')}")
    print(f"  Name: {product.get('product_name', 'N/A')[:60]}")
    print(f"  Attributes extracted:")
    for key, value in attrs.items():
        if value and key != 'description':
            print(f"    {key}: {value}")

if __name__ == '__main__':
    main()
