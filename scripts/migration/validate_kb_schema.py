#!/usr/bin/env python3
"""
KB Schema Validation Script
Validates product_master_v1.json conforms to KB expansion schema

Validation checks:
1. All products have 9 original attributes + 5 KB expansion groups
2. Each KB group has correct number of sub-attributes
3. Enum values match TypeScript definitions
4. Data types are correct (numbers, strings, booleans, arrays, objects)
5. No missing required fields
"""

import json
import sys
from pathlib import Path
from typing import Any

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
INPUT_FILE = PROJECT_ROOT / "data" / "products" / "product_master_v1.json"

# ============================================================================
# SCHEMA DEFINITIONS (matching TypeScript enums.ts)
# ============================================================================

ORIGINAL_ATTRIBUTES = {
    "category",
    "price",
    "original_price",
    "brand",
    "product_name",
    "link",
    "image_url",
    "availability",
    "product_description"
}

KB_GROUPS = {
    "thaiContext",
    "visualMatching",
    "crossProductCompatibility",
    "priceIntelligence",
    "socialProof"
}

# Thai Context schema
THAI_CONTEXT_SCHEMA = {
    "thaiClimateRating": (int, float),
    "acFriendly": bool,
    "monthSuitability": list,
    "templeAppropriate": bool,
    "weddingAppropriate": str,
    "funeralAppropriate": bool,
    "songkranSuitable": str,
    "loyKrathongSuitable": bool,
    "cnySuitable": str,
    "coverage": dict,
    "thaiDayColors": list
}

WEDDING_APPROPRIATE_VALUES = {"any", "morning", "evening", "outdoor", "indoor", "none"}
SONGKRAN_SUITABLE_VALUES = {"temple-morning", "water-play", "both", "neither"}
CNY_SUITABLE_VALUES = {"suitable", "unsuitable", "neutral"}
COVERAGE_TYPE_VALUES = {"covered", "partially-covered", "exposed"}

# Visual Matching schema
VISUAL_MATCHING_SCHEMA = {
    "silhouetteShape": str,
    "silhouetteFit": str,
    "silhouetteVolume": str,
    "visualWeightScore": (int, float),
    "visualWeightLevel": str,
    "proportionRatio": str,
    "proportionEffect": dict,
    "patternComplexity": (int, float),
    "textureType": str,
    "outfitRoleType": str,
    "thaiProportionScore": (int, float),
    "statementPotential": bool,
    "styleMoods": list
}

SILHOUETTE_SHAPE_VALUES = {"a-line", "h-line", "x-line", "i-line", "o-line", "fitted", "oversized", "boxy", "relaxed", "structured"}
SILHOUETTE_FIT_VALUES = {"fitted", "semi-fitted", "relaxed", "oversized", "boxy", "structured", "fluid"}
SILHOUETTE_VOLUME_VALUES = {"low", "medium", "high"}
VISUAL_WEIGHT_LEVEL_VALUES = {"light", "medium", "heavy"}
PROPORTION_RATIO_VALUES = {"top-heavy", "balanced", "bottom-heavy"}
TEXTURE_TYPE_VALUES = {"matte", "sheen", "glossy", "textured", "mixed"}
OUTFIT_ROLE_TYPE_VALUES = {"anchor", "supporting", "accent", "statement"}

# Cross-Product Compatibility schema
CROSS_PRODUCT_SCHEMA = {
    "pairingScore": (int, float),
    "essentialPairings": list,
    "avoidPairings": list,
    "versatilityScore": (int, float),
    "layerCompatibility": list,
    "outfitCompleteness": str,
    "formalityTolerance": (int, float),
    "patternMixingSafe": bool,
    "perfectMatchSkus": list,
    "commonPairings": list
}

OUTFIT_COMPLETENESS_VALUES = {"standalone", "needs-top", "needs-bottom", "needs-both", "needs-layer", "needs-accessories"}
LAYER_COMPATIBILITY_VALUES = {"fitted", "structured", "loose"}

# Price Intelligence schema
PRICE_INTELLIGENCE_SCHEMA = {
    "costPerWear": (int, float),
    "costPerWearTier": str,
    "investmentScore": (int, float),
    "qualityTier": (int, float),
    "timelessScore": (int, float),
    "isInvestmentPiece": bool,
    "isCapsuleWardrobe": bool,
    "saleLikelihood": str,
    "bestPurchaseTiming": str,
    "expectedWears": (int, float),
    "valueTier": str
}

COST_PER_WEAR_TIER_VALUES = {"excellent", "good", "moderate", "poor"}
SALE_LIKELIHOOD_VALUES = {"rare", "seasonal", "frequent"}
VALUE_TIER_VALUES = {"exceptional", "fair", "premium", "overpriced"}

# Social Proof schema
SOCIAL_PROOF_SCHEMA = {
    "popularityScore": (int, float),
    "popularityTier": str,
    "trendStatus": str,
    "trendConfidence": (int, float),
    "celebrityAssociations": list,
    "hashtagTrending": list,
    "reviewSentiment": (int, float),
    "reviewCount": (int, float),
    "recommendRate": (int, float),
    "influencerFeatures": (int, float)
}

POPULARITY_TIER_VALUES = {"viral", "hot", "popular", "steady", "niche", "new", "emerging"}
TREND_STATUS_VALUES = {"emerging", "trending", "peak", "classic", "timeless", "declining", "revival"}


class ValidationError:
    """Represents a validation error."""
    def __init__(self, product_index: int, product_name: str, field: str, message: str):
        self.product_index = product_index
        self.product_name = product_name
        self.field = field
        self.message = message

    def __str__(self):
        return f"Product #{self.product_index} ({self.product_name[:30]}...): {self.field} - {self.message}"


def validate_enum_value(value: str, allowed_values: set, field_name: str) -> str | None:
    """Validate that a string value is in allowed set."""
    if value not in allowed_values:
        return f"Invalid value '{value}', expected one of {allowed_values}"
    return None


def validate_coverage(coverage: dict) -> list[str]:
    """Validate coverage object."""
    errors = []
    for key in ["shoulders", "knees"]:
        if key not in coverage:
            errors.append(f"Missing required field: coverage.{key}")
        elif coverage[key] not in COVERAGE_TYPE_VALUES:
            errors.append(f"Invalid coverage.{key} value '{coverage[key]}'")
    return errors


def validate_proportion_effect(effect: dict) -> list[str]:
    """Validate proportion effect object."""
    errors = []
    required = ["torsoLengthening", "legLengthening", "heightEffect", "widthEffect"]
    for key in required:
        if key not in effect:
            errors.append(f"Missing required field: proportionEffect.{key}")
        elif not isinstance(effect[key], (int, float)):
            errors.append(f"proportionEffect.{key} must be a number")
    return errors


def validate_thai_context(ctx: dict, errors_list: list, product_index: int, product_name: str):
    """Validate thaiContext group."""
    for field, expected_type in THAI_CONTEXT_SCHEMA.items():
        if field not in ctx:
            errors_list.append(ValidationError(product_index, product_name, f"thaiContext.{field}", "Missing required field"))
            continue

        value = ctx[field]
        if isinstance(expected_type, tuple):
            if not isinstance(value, expected_type):
                errors_list.append(ValidationError(product_index, product_name, f"thaiContext.{field}", f"Expected {expected_type}, got {type(value).__name__}"))
        elif not isinstance(value, expected_type):
            errors_list.append(ValidationError(product_index, product_name, f"thaiContext.{field}", f"Expected {expected_type.__name__}, got {type(value).__name__}"))

    # Validate enum values
    if "weddingAppropriate" in ctx:
        err = validate_enum_value(ctx["weddingAppropriate"], WEDDING_APPROPRIATE_VALUES, "weddingAppropriate")
        if err:
            errors_list.append(ValidationError(product_index, product_name, "thaiContext.weddingAppropriate", err))

    if "songkranSuitable" in ctx:
        err = validate_enum_value(ctx["songkranSuitable"], SONGKRAN_SUITABLE_VALUES, "songkranSuitable")
        if err:
            errors_list.append(ValidationError(product_index, product_name, "thaiContext.songkranSuitable", err))

    if "cnySuitable" in ctx:
        err = validate_enum_value(ctx["cnySuitable"], CNY_SUITABLE_VALUES, "cnySuitable")
        if err:
            errors_list.append(ValidationError(product_index, product_name, "thaiContext.cnySuitable", err))

    # Validate coverage
    if "coverage" in ctx and isinstance(ctx["coverage"], dict):
        for cov_err in validate_coverage(ctx["coverage"]):
            errors_list.append(ValidationError(product_index, product_name, "thaiContext.coverage", cov_err))

    # Validate monthSuitability
    if "monthSuitability" in ctx:
        ms = ctx["monthSuitability"]
        if len(ms) != 12:
            errors_list.append(ValidationError(product_index, product_name, "thaiContext.monthSuitability", f"Expected 12 months, got {len(ms)}"))


def validate_visual_matching(vm: dict, errors_list: list, product_index: int, product_name: str):
    """Validate visualMatching group."""
    for field, expected_type in VISUAL_MATCHING_SCHEMA.items():
        if field not in vm:
            errors_list.append(ValidationError(product_index, product_name, f"visualMatching.{field}", "Missing required field"))
            continue

        value = vm[field]
        if isinstance(expected_type, tuple):
            if not isinstance(value, expected_type):
                errors_list.append(ValidationError(product_index, product_name, f"visualMatching.{field}", f"Expected {expected_type}, got {type(value).__name__}"))
        elif not isinstance(value, expected_type):
            errors_list.append(ValidationError(product_index, product_name, f"visualMatching.{field}", f"Expected {expected_type.__name__}, got {type(value).__name__}"))

    # Validate enum values
    enum_validations = [
        ("silhouetteShape", SILHOUETTE_SHAPE_VALUES),
        ("silhouetteFit", SILHOUETTE_FIT_VALUES),
        ("silhouetteVolume", SILHOUETTE_VOLUME_VALUES),
        ("visualWeightLevel", VISUAL_WEIGHT_LEVEL_VALUES),
        ("proportionRatio", PROPORTION_RATIO_VALUES),
        ("textureType", TEXTURE_TYPE_VALUES),
        ("outfitRoleType", OUTFIT_ROLE_TYPE_VALUES),
    ]

    for field, allowed in enum_validations:
        if field in vm:
            err = validate_enum_value(vm[field], allowed, field)
            if err:
                errors_list.append(ValidationError(product_index, product_name, f"visualMatching.{field}", err))

    # Validate proportionEffect
    if "proportionEffect" in vm and isinstance(vm["proportionEffect"], dict):
        for pe_err in validate_proportion_effect(vm["proportionEffect"]):
            errors_list.append(ValidationError(product_index, product_name, "visualMatching.proportionEffect", pe_err))


def validate_cross_product(cp: dict, errors_list: list, product_index: int, product_name: str):
    """Validate crossProductCompatibility group."""
    for field, expected_type in CROSS_PRODUCT_SCHEMA.items():
        if field not in cp:
            errors_list.append(ValidationError(product_index, product_name, f"crossProductCompatibility.{field}", "Missing required field"))
            continue

        value = cp[field]
        if isinstance(expected_type, tuple):
            if not isinstance(value, expected_type):
                errors_list.append(ValidationError(product_index, product_name, f"crossProductCompatibility.{field}", f"Expected {expected_type}, got {type(value).__name__}"))
        elif not isinstance(value, expected_type):
            errors_list.append(ValidationError(product_index, product_name, f"crossProductCompatibility.{field}", f"Expected {expected_type.__name__}, got {type(value).__name__}"))

    # Validate enum values
    if "outfitCompleteness" in cp:
        err = validate_enum_value(cp["outfitCompleteness"], OUTFIT_COMPLETENESS_VALUES, "outfitCompleteness")
        if err:
            errors_list.append(ValidationError(product_index, product_name, "crossProductCompatibility.outfitCompleteness", err))

    # Validate layerCompatibility values
    if "layerCompatibility" in cp and isinstance(cp["layerCompatibility"], list):
        for lc in cp["layerCompatibility"]:
            if lc not in LAYER_COMPATIBILITY_VALUES:
                errors_list.append(ValidationError(product_index, product_name, "crossProductCompatibility.layerCompatibility", f"Invalid value '{lc}'"))


def validate_price_intelligence(pi: dict, errors_list: list, product_index: int, product_name: str):
    """Validate priceIntelligence group."""
    for field, expected_type in PRICE_INTELLIGENCE_SCHEMA.items():
        if field not in pi:
            errors_list.append(ValidationError(product_index, product_name, f"priceIntelligence.{field}", "Missing required field"))
            continue

        value = pi[field]
        if isinstance(expected_type, tuple):
            if not isinstance(value, expected_type):
                errors_list.append(ValidationError(product_index, product_name, f"priceIntelligence.{field}", f"Expected {expected_type}, got {type(value).__name__}"))
        elif not isinstance(value, expected_type):
            errors_list.append(ValidationError(product_index, product_name, f"priceIntelligence.{field}", f"Expected {expected_type.__name__}, got {type(value).__name__}"))

    # Validate enum values
    enum_validations = [
        ("costPerWearTier", COST_PER_WEAR_TIER_VALUES),
        ("saleLikelihood", SALE_LIKELIHOOD_VALUES),
        ("valueTier", VALUE_TIER_VALUES),
    ]

    for field, allowed in enum_validations:
        if field in pi:
            err = validate_enum_value(pi[field], allowed, field)
            if err:
                errors_list.append(ValidationError(product_index, product_name, f"priceIntelligence.{field}", err))


def validate_social_proof(sp: dict, errors_list: list, product_index: int, product_name: str):
    """Validate socialProof group."""
    for field, expected_type in SOCIAL_PROOF_SCHEMA.items():
        if field not in sp:
            errors_list.append(ValidationError(product_index, product_name, f"socialProof.{field}", "Missing required field"))
            continue

        value = sp[field]
        if isinstance(expected_type, tuple):
            if not isinstance(value, expected_type):
                errors_list.append(ValidationError(product_index, product_name, f"socialProof.{field}", f"Expected {expected_type}, got {type(value).__name__}"))
        elif not isinstance(value, expected_type):
            errors_list.append(ValidationError(product_index, product_name, f"socialProof.{field}", f"Expected {expected_type.__name__}, got {type(value).__name__}"))

    # Validate enum values
    enum_validations = [
        ("popularityTier", POPULARITY_TIER_VALUES),
        ("trendStatus", TREND_STATUS_VALUES),
    ]

    for field, allowed in enum_validations:
        if field in sp:
            err = validate_enum_value(sp[field], allowed, field)
            if err:
                errors_list.append(ValidationError(product_index, product_name, f"socialProof.{field}", err))


def validate_product(product: dict, index: int) -> list[ValidationError]:
    """Validate a single product."""
    errors = []
    product_name = product.get("product_name", "Unknown")

    # Check original attributes
    for attr in ORIGINAL_ATTRIBUTES:
        if attr not in product:
            errors.append(ValidationError(index, product_name, attr, "Missing original attribute"))

    # Check KB groups exist
    for group in KB_GROUPS:
        if group not in product:
            errors.append(ValidationError(index, product_name, group, "Missing KB group"))
            continue

        if not isinstance(product[group], dict):
            errors.append(ValidationError(index, product_name, group, f"Expected dict, got {type(product[group]).__name__}"))
            continue

        # Validate each group
        if group == "thaiContext":
            validate_thai_context(product[group], errors, index, product_name)
        elif group == "visualMatching":
            validate_visual_matching(product[group], errors, index, product_name)
        elif group == "crossProductCompatibility":
            validate_cross_product(product[group], errors, index, product_name)
        elif group == "priceIntelligence":
            validate_price_intelligence(product[group], errors, index, product_name)
        elif group == "socialProof":
            validate_social_proof(product[group], errors, index, product_name)

    return errors


def main():
    """Main validation function."""
    print("=" * 60)
    print("KB Schema Validation: product_master_v1.json")
    print("=" * 60)

    # Check file exists
    if not INPUT_FILE.exists():
        print(f"\n Error: {INPUT_FILE} not found!")
        print("  Run migrate_kb_attributes.py first.")
        sys.exit(1)

    # Load file
    print(f"\nLoading: {INPUT_FILE}")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"  Products to validate: {len(products):,}")

    # Validate all products
    all_errors: list[ValidationError] = []

    for i, product in enumerate(products):
        errors = validate_product(product, i)
        all_errors.extend(errors)

    # Report results
    print(f"\n{'=' * 60}")
    print("Validation Results")
    print("=" * 60)

    if not all_errors:
        print(f"\n  All {len(products):,} products validated successfully!")
        print("\n  Schema compliance: 100%")
        print("\n  Original attributes: 9")
        print("  KB expansion groups: 5")
        print("  Total attributes per product: 14 top-level")
        sys.exit(0)
    else:
        # Group errors by type
        error_types: dict[str, int] = {}
        for err in all_errors:
            key = err.field.split('.')[0]
            error_types[key] = error_types.get(key, 0) + 1

        print(f"\n  Validation errors: {len(all_errors)}")
        print(f"\n  Error distribution:")
        for field, count in sorted(error_types.items(), key=lambda x: -x[1]):
            print(f"    {field}: {count}")

        # Show first 20 errors
        print(f"\n  First {min(20, len(all_errors))} errors:")
        for err in all_errors[:20]:
            print(f"    - {err}")

        if len(all_errors) > 20:
            print(f"    ... and {len(all_errors) - 20} more errors")

        compliance = (len(products) * 14 - len(all_errors)) / (len(products) * 14) * 100
        print(f"\n  Schema compliance: {compliance:.1f}%")

        sys.exit(1)


if __name__ == "__main__":
    main()
