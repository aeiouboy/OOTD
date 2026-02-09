#!/usr/bin/env python3
"""
KB Attributes Migration Script
Migrates product_master.json (9 attributes) to product_master_v1.json (63 attributes)

This script:
1. Loads existing product_master.json (2,594 products with 9 basic attributes)
2. Adds KB expansion groups with sensible default placeholders
3. Writes output to product_master_v1.json

KB Expansion Groups (54 sub-attributes):
- thaiContext: Thai climate and cultural appropriateness
- visualMatching: Visual attributes for AI image matching
- crossProductCompatibility: Product pairing rules
- priceIntelligence: Value and investment metrics
- socialProof: Popularity and trend signals
"""

import json
import re
from pathlib import Path
from typing import Any

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
INPUT_FILE = PROJECT_ROOT / "data" / "products" / "product_master.json"
OUTPUT_FILE = PROJECT_ROOT / "data" / "products" / "product_master_v1.json"


def parse_price(price_str: str) -> float:
    """Parse Thai Baht price string to float."""
    if not price_str:
        return 0.0
    # Remove currency symbols, commas, and extract number
    clean = re.sub(r'[^\d.]', '', str(price_str))
    try:
        return float(clean) if clean else 0.0
    except ValueError:
        return 0.0


def infer_category_type(category: str, product_name: str = "") -> str:
    """Infer broad category type from product category and name."""
    # Combine category and product name for better inference
    search_text = f"{category} {product_name}".lower() if category or product_name else ""

    # Order matters: Check more specific categories first to avoid false matches
    # e.g., "Blazer Double Knit" should match outerwear before matching "knit" as top
    if any(x in search_text for x in ['dress', 'jumpsuit', 'romper']):
        return 'dress'
    elif any(x in search_text for x in ['jacket', 'blazer', 'coat', 'cardigan', 'outerwear']):
        # Check outerwear before tops (blazers often have "knit" in name)
        return 'outerwear'
    elif any(x in search_text for x in ['pant', 'trouser', 'jean', 'skirt', 'short']):
        return 'bottom'
    elif any(x in search_text for x in ['shirt', 'blouse', 'top', 'tee', 't-shirt', 'sweater', 'knit', 'pullover']):
        return 'top'
    elif any(x in search_text for x in ['shoe', 'boot', 'sandal', 'sneaker', 'heel', 'loafer', 'flat', 'footwear']):
        return 'footwear'
    elif any(x in search_text for x in ['bag', 'purse', 'tote', 'clutch', 'handbag']):
        return 'bag'
    elif any(x in search_text for x in ['accessory', 'jewelry', 'scarf', 'belt', 'hat', 'watch']):
        return 'accessory'
    else:
        return 'clothing'


def get_coverage_defaults(category_type: str) -> dict:
    """Get coverage defaults based on category type."""
    if category_type in ['top', 'outerwear']:
        return {
            "shoulders": "covered",
            "knees": "exposed"  # Tops don't cover knees
        }
    elif category_type in ['dress']:
        return {
            "shoulders": "covered",
            "knees": "covered"  # Assume modest dress by default
        }
    elif category_type in ['bottom']:
        return {
            "shoulders": "exposed",
            "knees": "covered"  # Assume long pants/skirts
        }
    elif category_type in ['footwear', 'bag', 'accessory']:
        return {
            "shoulders": "exposed",
            "knees": "exposed"
        }
    else:
        return {
            "shoulders": "covered",
            "knees": "covered"
        }


def get_essential_pairings(category_type: str) -> list:
    """Get essential pairing requirements based on category."""
    if category_type == 'top':
        return ["bottom", "footwear"]
    elif category_type == 'bottom':
        return ["top", "footwear"]
    elif category_type == 'dress':
        return ["footwear"]
    elif category_type == 'outerwear':
        return ["top", "bottom", "footwear"]
    elif category_type == 'footwear':
        return []
    elif category_type in ['bag', 'accessory']:
        return []
    else:
        return ["footwear"]


def get_outfit_completeness(category_type: str) -> str:
    """Get outfit completeness based on category."""
    if category_type == 'top':
        return "needs-bottom"
    elif category_type == 'bottom':
        return "needs-top"
    elif category_type == 'dress':
        return "standalone"
    elif category_type == 'outerwear':
        return "needs-both"
    elif category_type == 'footwear':
        return "needs-accessories"
    else:
        return "needs-bottom"


def get_outfit_role_type(category_type: str) -> str:
    """Get outfit role type based on category."""
    if category_type == 'dress':
        return "anchor"
    elif category_type in ['bag', 'accessory', 'footwear']:
        return "accent"
    elif category_type == 'outerwear':
        return "statement"
    else:
        return "supporting"


def get_cost_per_wear_tier(cpw: float) -> str:
    """Map cost per wear to tier."""
    if cpw < 50:
        return "excellent"
    elif cpw < 100:
        return "good"
    elif cpw < 200:
        return "moderate"
    else:
        return "poor"


def get_quality_tier(price: float) -> int:
    """Infer quality tier from price."""
    if price < 1000:
        return 2
    elif price < 3000:
        return 3
    elif price < 10000:
        return 4
    else:
        return 5


def get_value_tier(price: float, quality_tier: int) -> str:
    """Infer value tier from price and quality."""
    if quality_tier >= 4 and price < 5000:
        return "exceptional"
    elif quality_tier == 5 and price > 15000:
        return "premium"
    elif quality_tier <= 2 and price > 2000:
        return "overpriced"
    else:
        return "fair"


def get_default_kb_attributes(product: dict) -> dict:
    """
    Generate default KB expansion attributes for a product.

    Args:
        product: Original product dict with 9 basic attributes

    Returns:
        Dict containing 5 KB expansion groups with default values
    """
    category = product.get("category", "")
    product_name = product.get("product_name", "")
    category_type = infer_category_type(category, product_name)
    price = parse_price(product.get("price", "0"))

    # Calculate price-based metrics
    expected_wears = 50
    cost_per_wear = price / expected_wears if expected_wears > 0 else price
    quality_tier = get_quality_tier(price)

    return {
        # ===== Thai Context (KB Sections 01, 02, 07, 12) =====
        "thaiContext": {
            "thaiClimateRating": 5,  # Neutral, suitable year-round
            "acFriendly": True,  # Assume most indoor clothes are AC-friendly
            "monthSuitability": [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],  # Neutral 6/10
            "templeAppropriate": False,  # Conservative default, requires manual review
            "weddingAppropriate": "none",  # Requires manual classification
            "funeralAppropriate": False,
            "songkranSuitable": "neither",
            "loyKrathongSuitable": False,
            "cnySuitable": "neutral",
            "coverage": get_coverage_defaults(category_type),
            "thaiDayColors": []  # Requires manual enrichment
        },

        # ===== Visual Matching (KB Section 15) =====
        "visualMatching": {
            "silhouetteShape": "h-line",  # Most common default
            "silhouetteFit": "semi-fitted",  # Middle ground
            "silhouetteVolume": "medium",
            "visualWeightScore": 5,
            "visualWeightLevel": "medium",
            "proportionRatio": "balanced",
            "proportionEffect": {
                "torsoLengthening": 0,
                "legLengthening": 0,
                "heightEffect": 0,
                "widthEffect": 0
            },
            "patternComplexity": 1,  # Assume solid unless description mentions pattern
            "textureType": "matte",
            "outfitRoleType": get_outfit_role_type(category_type),
            "thaiProportionScore": 5,
            "statementPotential": False,
            "styleMoods": []
        },

        # ===== Cross-Product Compatibility (KB Section 17) =====
        "crossProductCompatibility": {
            "pairingScore": 50,
            "essentialPairings": get_essential_pairings(category_type),
            "avoidPairings": [],
            "versatilityScore": 5,
            "layerCompatibility": ["fitted", "structured", "loose"],
            "outfitCompleteness": get_outfit_completeness(category_type),
            "formalityTolerance": 2,  # +/- 2 formality levels
            "patternMixingSafe": True,  # Assume safe unless pattern detected
            "perfectMatchSkus": [],
            "commonPairings": []
        },

        # ===== Price Intelligence (KB Section 13) =====
        "priceIntelligence": {
            "costPerWear": round(cost_per_wear, 2),
            "costPerWearTier": get_cost_per_wear_tier(cost_per_wear),
            "investmentScore": 50,  # Neutral
            "qualityTier": quality_tier,
            "timelessScore": 5,
            "isInvestmentPiece": False,  # Requires manual classification
            "isCapsuleWardrobe": False,
            "saleLikelihood": "seasonal",
            "bestPurchaseTiming": "anytime",
            "expectedWears": expected_wears,
            "valueTier": get_value_tier(price, quality_tier)
        },

        # ===== Social Proof (KB Special Topics) =====
        "socialProof": {
            "popularityScore": 50,
            "popularityTier": "steady",
            "trendStatus": "classic",
            "trendConfidence": 50,
            "celebrityAssociations": [],
            "hashtagTrending": [],
            "reviewSentiment": 70,
            "reviewCount": 0,
            "recommendRate": 70,
            "influencerFeatures": 0
        }
    }


def migrate_products(products: list[dict]) -> list[dict]:
    """
    Migrate all products by adding KB expansion attributes.

    Args:
        products: List of original products with 9 attributes

    Returns:
        List of enriched products with 63 attributes (9 original + 54 KB)
    """
    migrated = []

    for product in products:
        # Start with original attributes
        enriched = dict(product)

        # Add KB expansion groups
        kb_attrs = get_default_kb_attributes(product)
        enriched.update(kb_attrs)

        migrated.append(enriched)

    return migrated


def main():
    """Main migration function."""
    print("=" * 60)
    print("KB Attributes Migration: product_master.json -> product_master_v1.json")
    print("=" * 60)

    # Load input file
    print(f"\nLoading: {INPUT_FILE}")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    original_count = len(products)
    print(f"  Products loaded: {original_count:,}")

    # Get original attribute count
    if products:
        original_attrs = len(products[0].keys())
        print(f"  Original attributes per product: {original_attrs}")

    # Migrate products
    print("\nMigrating products with KB expansion attributes...")
    migrated_products = migrate_products(products)

    # Count new attributes
    if migrated_products:
        new_attrs = len(migrated_products[0].keys())
        kb_groups = 5
        print(f"  New attributes per product: {new_attrs} ({original_attrs} original + {kb_groups} KB groups)")

    # Write output
    print(f"\nWriting: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(migrated_products, f, indent=2, ensure_ascii=False)

    # Calculate file sizes
    input_size = INPUT_FILE.stat().st_size / (1024 * 1024)  # MB
    output_size = OUTPUT_FILE.stat().st_size / (1024 * 1024)  # MB

    # Count lines
    with open(OUTPUT_FILE, 'r') as f:
        output_lines = sum(1 for _ in f)

    print(f"\n{'=' * 60}")
    print("Migration Statistics")
    print("=" * 60)
    print(f"  Products processed: {len(migrated_products):,}")
    print(f"  Input file size:    {input_size:.2f} MB")
    print(f"  Output file size:   {output_size:.2f} MB")
    print(f"  Output file lines:  {output_lines:,}")
    print(f"  Size increase:      {(output_size/input_size):.1f}x")
    print(f"\n  Migration completed successfully!")
    print(f"  Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
