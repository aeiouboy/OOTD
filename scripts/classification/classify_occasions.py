#!/usr/bin/env python3
"""
Classify women's clothing products with 30 occasions.

This script reads women_clothing_v1.json, applies occasion classification rules,
and updates the file with occasions field for each product.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.classification.occasion_rules import (
    classify_product_occasions,
    get_occasion_distribution,
    validate_classification,
    OCCASION_RULES
)


def load_products(filepath: str, scraped_filepath: str = None) -> tuple:
    """
    Load products from JSON file with optional scraped data merge.

    Args:
        filepath: Path to main products file
        scraped_filepath: Optional path to scraped data file

    Returns:
        Tuple of (data dict, products list)
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, dict) and 'products' in data:
        products = data['products']
    elif isinstance(data, list):
        data = {'products': data}
        products = data
    else:
        raise ValueError(f"Unexpected JSON structure in {filepath}")

    # Merge scraped data if provided
    if scraped_filepath:
        print(f"Loading scraped data from {scraped_filepath}...")
        try:
            with open(scraped_filepath, 'r', encoding='utf-8') as f:
                scraped_data = json.load(f)

            scraped_products = scraped_data.get('products', [])

            # Create mapping of product id to scraped attributes
            scraped_map = {}
            for sp in scraped_products:
                product_id = sp.get('id')
                if product_id:
                    scraped_map[product_id] = sp

            # Merge scraped attributes into products
            merged_count = 0
            for product in products:
                product_id = product.get('id')
                if product_id in scraped_map:
                    scraped = scraped_map[product_id]

                    # Merge scraped attributes (prioritize scraped data)
                    for attr in ['subcategory', 'material', 'fit', 'care', 'color_from_page', 'sleeve_type', 'length_type']:
                        if attr in scraped and scraped[attr]:
                            product[attr] = scraped[attr]
                            merged_count += 1

            print(f"Merged {len(scraped_map)} scraped products with {merged_count} total attributes")

        except FileNotFoundError:
            print(f"Warning: Scraped data file not found at {scraped_filepath}")
        except Exception as e:
            print(f"Warning: Failed to load scraped data: {e}")

    return data, products


def save_products(filepath: str, data: dict) -> None:
    """Save products to JSON file with pretty formatting."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data.get('products', []))} products to {filepath}")


def classify_all_products(products: List[dict], track_attribute_usage: bool = False) -> tuple:
    """
    Classify all products with occasions.

    Args:
        products: List of product dictionaries
        track_attribute_usage: Whether to track which attributes influenced classification

    Returns:
        Tuple of (classified products list, attribute usage stats dict)
    """
    classified = []
    total = len(products)
    attribute_usage = {
        'material': 0,
        'subcategory': 0,
        'sleeve_type': 0,
        'length_type': 0,
        'color_from_page': 0
    } if track_attribute_usage else {}

    for i, product in enumerate(products):
        # Track which scraped attributes this product has
        if track_attribute_usage:
            for attr in attribute_usage.keys():
                if product.get(attr):
                    attribute_usage[attr] += 1

        # Classify product
        occasions = classify_product_occasions(product)

        # Add occasions to product
        product['occasions'] = occasions
        classified.append(product)

        # Progress indicator
        if (i + 1) % 100 == 0:
            print(f"Classified {i + 1}/{total} products...")

    return classified, attribute_usage


def generate_report(products: List[dict], attribute_usage: dict = None, use_scraped: bool = False) -> str:
    """
    Generate classification report.

    Args:
        products: List of classified products
        attribute_usage: Optional dict of attribute usage statistics
        use_scraped: Whether scraped data was used

    Returns:
        Formatted report string
    """
    validation = validate_classification(products)
    distribution = validation['occasion_distribution']

    total = validation['total_products']
    lines = [
        "=" * 60,
        "WOMEN CLOTHING OCCASION CLASSIFICATION REPORT",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Mode: {'With Scraped Data' if use_scraped else 'Standard'}",
        "=" * 60,
        "",
        f"Total Products: {total}",
        f"Products with No Occasion: {validation['products_with_no_occasion']}",
    ]

    # Add attribute usage stats if available
    if attribute_usage:
        lines.extend([
            "",
            "SCRAPED ATTRIBUTE USAGE:",
            "-" * 40,
        ])
        for attr, count in sorted(attribute_usage.items(), key=lambda x: -x[1]):
            pct = (count / total * 100) if total > 0 else 0
            lines.append(f"  {attr:20s}: {count:5d} products ({pct:5.1f}%)")

    lines.extend([
        "",
        "OCCASION DISTRIBUTION:",
        "-" * 40,
    ])

    # Sort by count descending
    sorted_dist = sorted(distribution.items(), key=lambda x: -x[1])

    # Group by category
    categories = {
        'Work & Professional': ['work_formal', 'work_casual', 'business_meeting', 'interview', 'presentation'],
        'Social & Events': ['date', 'party', 'clubbing', 'dinner', 'brunch', 'concert', 'wedding_guest'],
        'Casual & Lifestyle': ['casual', 'cafe', 'shopping', 'travel', 'beach', 'weekend'],
        'Formal & Ceremonies': ['graduation', 'gala', 'ceremony', 'funeral'],
        'Thai Cultural': ['temple', 'thai_wedding', 'songkran', 'loy_krathong', 'cny'],
        'Active & Sports': ['sport', 'yoga', 'outdoor'],
    }

    for cat_name, occasions in categories.items():
        lines.append(f"\n{cat_name}:")
        for occ in occasions:
            count = distribution.get(occ, 0)
            pct = count * 100 / total if total > 0 else 0
            bar = "█" * int(pct / 2)
            lines.append(f"  {occ:20s}: {count:5d} ({pct:5.1f}%) {bar}")

    lines.append("")
    lines.append("=" * 60)

    # Products with no occasions
    if validation['products_with_no_occasion'] > 0:
        lines.append(f"\nProducts with no occasions (first 10):")
        for name in validation['no_occasion_products']:
            lines.append(f"  - {name}")

    return "\n".join(lines)


def main():
    """Main classification workflow."""
    import argparse

    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Classify women clothing occasions')
    parser.add_argument('--use-scraped', action='store_true',
                        help='Use scraped data from women_clothing_scraped.json')
    args = parser.parse_args()

    # File paths
    base_dir = Path(__file__).parent.parent.parent
    input_file = base_dir / "data" / "products" / "women_clothing_v1.json"
    scraped_file = base_dir / "data" / "products" / "women_clothing_scraped.json" if args.use_scraped else None
    output_file = input_file  # Update in place
    backup_file = base_dir / "data" / "products" / "women_clothing_v1_backup.json"

    # Different report file for scraped vs standard
    report_file = (
        base_dir / "scripts" / "classification" / "classification_report_with_scraped.txt"
        if args.use_scraped
        else base_dir / "scripts" / "classification" / "classification_report.txt"
    )

    print(f"Loading products from {input_file}...")

    # Load products (with optional scraped data merge)
    data, products = load_products(input_file, scraped_file)
    print(f"Loaded {len(products)} products")

    # Create backup
    print(f"Creating backup at {backup_file}...")
    with open(input_file, 'r') as f:
        backup_data = f.read()
    with open(backup_file, 'w') as f:
        f.write(backup_data)

    # Classify products
    print("\nClassifying products with 30 occasions...")
    classified_products, attribute_usage = classify_all_products(products, track_attribute_usage=args.use_scraped)

    # Update data
    data['products'] = classified_products

    # Add metadata
    data['_classification_metadata'] = {
        'classified_at': datetime.now().isoformat(),
        'total_occasions': len(OCCASION_RULES),
        'total_products': len(classified_products),
        'occasion_list': list(OCCASION_RULES.keys()),
        'used_scraped_data': args.use_scraped,
    }

    # Save classified products
    print(f"\nSaving classified products to {output_file}...")
    save_products(output_file, data)

    # Generate and save report
    print("\nGenerating classification report...")
    report = generate_report(classified_products, attribute_usage, args.use_scraped)
    with open(report_file, 'w') as f:
        f.write(report)
    print(f"Saved report to {report_file}")

    # Print report to console
    print("\n" + report)

    return 0


if __name__ == "__main__":
    sys.exit(main())
