#!/usr/bin/env python3
"""
Helper script to get product info for a specific index.
Used by Claude Code to fetch product details before scraping.
"""

import json
import sys
from pathlib import Path

def main():
    if len(sys.argv) < 2:
        print("Usage: run_batch.py <index>")
        sys.exit(1)

    index = int(sys.argv[1])

    # Load products
    data_dir = Path(__file__).parent.parent.parent / "data" / "products"
    input_file = data_dir / "women_clothing_v1.json"

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    products = data.get('products', [])

    if index < 0 or index >= len(products):
        print(f"Error: Index {index} out of range (0-{len(products)-1})")
        sys.exit(1)

    product = products[index]

    # Print product info as JSON for easy parsing
    print(json.dumps(product, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
