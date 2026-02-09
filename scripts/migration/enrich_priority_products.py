#!/usr/bin/env python3
"""
Priority Product Enrichment Script
Enriches high-priority products with full KB attributes

This script:
1. Loads product_master_v1.json (products with default KB placeholders)
2. Identifies priority products based on:
   - Top products by price (high-value items)
   - Premium brands (POLO RALPH LAUREN, MAJE, COS, etc.)
   - Work essentials (blazers, shirts, trousers)
3. Exports priority products template for manual enrichment
4. Merges enriched data back into product_master_v1.json
"""

import json
import re
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
INPUT_FILE = PROJECT_ROOT / "data" / "products" / "product_master_v1.json"
OUTPUT_FILE = PROJECT_ROOT / "data" / "products" / "product_master_v1.json"
PRIORITY_TEMPLATE = PROJECT_ROOT / "data" / "migration" / "priority_products_template.json"
PRIORITY_ENRICHED = PROJECT_ROOT / "data" / "migration" / "priority_products_enriched.json"

# Priority selection criteria
PREMIUM_BRANDS = {
    "POLO RALPH LAUREN",
    "MAJE",
    "COS",
    "& OTHER STORIES",
    "ASAVA",
    "SANDRO",
    "SABA",
    "CLUB MONACO",
    "THEORY",
    "MASSIMO DUTTI"
}

WORK_ESSENTIALS_KEYWORDS = [
    "blazer", "shirt", "trouser", "pant", "dress", "skirt",
    "blouse", "cardigan", "suit", "tailored"
]

MIN_PRICE_FOR_PRIORITY = 5000  # THB


def parse_price(price_str: str) -> float:
    """Parse Thai Baht price string to float."""
    if not price_str:
        return 0.0
    clean = re.sub(r'[^\d.]', '', str(price_str))
    try:
        return float(clean) if clean else 0.0
    except ValueError:
        return 0.0


def is_premium_brand(brand: str) -> bool:
    """Check if brand is in premium list."""
    if not brand:
        return False
    return brand.upper() in PREMIUM_BRANDS


def is_work_essential(product_name: str, category: str) -> bool:
    """Check if product is a work essential."""
    search_text = f"{product_name} {category}".lower()
    return any(keyword in search_text for keyword in WORK_ESSENTIALS_KEYWORDS)


def calculate_priority_score(product: dict) -> int:
    """Calculate priority score for a product (higher = more priority)."""
    score = 0
    price = parse_price(product.get("price", "0"))
    brand = product.get("brand", "")
    name = product.get("product_name", "")
    category = product.get("category", "")

    # Price factor (0-40 points)
    if price >= 15000:
        score += 40
    elif price >= 10000:
        score += 30
    elif price >= 5000:
        score += 20
    elif price >= 3000:
        score += 10

    # Premium brand (30 points)
    if is_premium_brand(brand):
        score += 30

    # Work essential (20 points)
    if is_work_essential(name, category):
        score += 20

    # Dress/complete outfit (10 points - high impact)
    if "dress" in name.lower() or "dress" in category.lower():
        score += 10

    return score


def select_priority_products(products: list[dict], max_count: int = 100) -> list[dict]:
    """Select top priority products based on scoring."""
    # Calculate scores
    scored = [(p, calculate_priority_score(p)) for p in products]

    # Sort by score descending
    scored.sort(key=lambda x: -x[1])

    # Select top products with score > 0
    priority = []
    for product, score in scored:
        if score > 0 and len(priority) < max_count:
            product_with_score = dict(product)
            product_with_score["_priority_score"] = score
            priority.append(product_with_score)

    return priority


def export_priority_template(priority_products: list[dict]):
    """Export priority products template for manual enrichment."""
    print(f"\nExporting priority products template to: {PRIORITY_TEMPLATE}")

    # Create simplified template with KB groups highlighted
    template = []
    for product in priority_products:
        template_product = {
            # Identification
            "_priority_score": product.get("_priority_score", 0),
            "product_name": product.get("product_name", ""),
            "brand": product.get("brand", ""),
            "price": product.get("price", ""),
            "category": product.get("category", ""),
            "image_url": product.get("image_url", ""),
            "link": product.get("link", ""),

            # KB groups for enrichment
            "thaiContext": product.get("thaiContext", {}),
            "visualMatching": product.get("visualMatching", {}),
            "crossProductCompatibility": product.get("crossProductCompatibility", {}),
            "priceIntelligence": product.get("priceIntelligence", {}),
            "socialProof": product.get("socialProof", {})
        }
        template.append(template_product)

    with open(PRIORITY_TEMPLATE, 'w', encoding='utf-8') as f:
        json.dump(template, f, indent=2, ensure_ascii=False)

    print(f"  Exported {len(template)} products for enrichment")


def merge_enriched_products(products: list[dict]) -> list[dict]:
    """Merge enriched priority products back into main catalog."""
    if not PRIORITY_ENRICHED.exists():
        print(f"\n  Note: {PRIORITY_ENRICHED} not found. Skipping merge.")
        return products

    print(f"\nMerging enriched products from: {PRIORITY_ENRICHED}")

    with open(PRIORITY_ENRICHED, 'r', encoding='utf-8') as f:
        enriched = json.load(f)

    # Build lookup by product name (since we don't have SKUs)
    enriched_lookup = {p["product_name"]: p for p in enriched}

    # Merge back
    merged_count = 0
    for product in products:
        name = product.get("product_name", "")
        if name in enriched_lookup:
            enriched_data = enriched_lookup[name]
            # Merge KB groups
            for kb_group in ["thaiContext", "visualMatching", "crossProductCompatibility", "priceIntelligence", "socialProof"]:
                if kb_group in enriched_data:
                    product[kb_group] = enriched_data[kb_group]
            merged_count += 1

    print(f"  Merged {merged_count} enriched products")
    return products


def main():
    """Main enrichment function."""
    print("=" * 60)
    print("Priority Product Enrichment")
    print("=" * 60)

    # Load products
    if not INPUT_FILE.exists():
        print(f"\n  Error: {INPUT_FILE} not found!")
        print("  Run migrate_kb_attributes.py first.")
        return

    print(f"\nLoading: {INPUT_FILE}")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"  Products loaded: {len(products):,}")

    # Select priority products
    print("\nSelecting priority products...")
    priority = select_priority_products(products, max_count=100)
    print(f"  Priority products selected: {len(priority)}")

    # Show priority breakdown
    print("\n  Priority breakdown:")
    premium_count = sum(1 for p in priority if is_premium_brand(p.get("brand", "")))
    high_price_count = sum(1 for p in priority if parse_price(p.get("price", "0")) >= 10000)
    work_count = sum(1 for p in priority if is_work_essential(p.get("product_name", ""), p.get("category", "")))

    print(f"    Premium brands: {premium_count}")
    print(f"    High price (>=฿10,000): {high_price_count}")
    print(f"    Work essentials: {work_count}")

    # Export template
    export_priority_template(priority)

    # Merge enriched (if available)
    products = merge_enriched_products(products)

    # Save updated catalog
    print(f"\nSaving updated catalog: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print("Enrichment Complete")
    print("=" * 60)
    print(f"\n  Template exported: {PRIORITY_TEMPLATE}")
    print(f"  To enrich products manually:")
    print(f"    1. Edit {PRIORITY_TEMPLATE}")
    print(f"    2. Save as {PRIORITY_ENRICHED}")
    print(f"    3. Re-run this script to merge")


if __name__ == "__main__":
    main()
