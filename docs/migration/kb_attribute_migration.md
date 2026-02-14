# KB Attribute Migration Guide

## Overview

This document explains the migration strategy from `product_master.json` (9 basic attributes) to `product_master_v1.json` (63 total attributes including 54 KB expansion sub-attributes).

## Migration Philosophy

### Conservative Defaults
- Use safe, neutral values that won't break existing functionality
- Temple appropriateness defaults to `false` (requires manual review)
- Neutral scores of 5/10 for subjective metrics
- Empty arrays for curated lists (hashtags, celebrity associations)

### Gradual Enrichment
1. **Phase 1 (This Migration)**: Default placeholders for all 2,594 products
2. **Phase 2**: Manual enrichment of top 50-100 priority products
3. **Phase 3**: LLM-based inference for remaining products
4. **Phase 4**: User behavior data integration

### Backward Compatibility
- All 9 original attributes remain intact
- KB groups are additive (no modifications to existing fields)
- Products can be loaded with or without KB attributes

## KB Expansion Groups

### 1. Thai Context (11 sub-attributes)
**KB Sections**: 01, 02, 07, 12

Thai climate and cultural appropriateness attributes:

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `thaiClimateRating` | number (1-10) | Thai climate suitability | 5 |
| `acFriendly` | boolean | AC environment suitability | true |
| `monthSuitability` | array[12] | Monthly scores | [6,6,6,6,6,6,6,6,6,6,6,6] |
| `templeAppropriate` | boolean | Temple visit appropriate | false |
| `weddingAppropriate` | enum | Wedding guest appropriate | "none" |
| `funeralAppropriate` | boolean | Funeral appropriate | false |
| `songkranSuitable` | enum | Songkran festival | "neither" |
| `loyKrathongSuitable` | boolean | Loy Krathong suitable | false |
| `cnySuitable` | enum | Chinese New Year | "neutral" |
| `coverage` | object | Body coverage (shoulders, knees) | Inferred from category |
| `thaiDayColors` | array | Auspicious days for color | [] |

### 2. Visual Matching (13 sub-attributes)
**KB Section**: 15 - Visual Matching Intelligence

Attributes for AI image-to-product matching:

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `silhouetteShape` | enum | Overall shape (a-line, h-line, etc.) | "h-line" |
| `silhouetteFit` | enum | Fit classification | "semi-fitted" |
| `silhouetteVolume` | enum | Volume level | "medium" |
| `visualWeightScore` | number (1-10) | Visual weight | 5 |
| `visualWeightLevel` | enum | Weight category | "medium" |
| `proportionRatio` | enum | Weight distribution | "balanced" |
| `proportionEffect` | object | Body proportion effects | All zeros |
| `patternComplexity` | number (1-10) | Pattern complexity | 1 (solid) |
| `textureType` | enum | Surface texture | "matte" |
| `outfitRoleType` | enum | Role in outfit | Inferred from category |
| `thaiProportionScore` | number (1-10) | Thai body suitability | 5 |
| `statementPotential` | boolean | Can be statement piece | false |
| `styleMoods` | array | Mood keywords | [] |

### 3. Cross-Product Compatibility (10 sub-attributes)
**KB Sections**: 16, 17

Product pairing rules:

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `pairingScore` | number (0-100) | Overall compatibility | 50 |
| `essentialPairings` | array | Required companions | Inferred from category |
| `avoidPairings` | array | Styles to avoid | [] |
| `versatilityScore` | number (1-10) | Outfit possibilities | 5 |
| `layerCompatibility` | array | Compatible layers | ["fitted", "structured", "loose"] |
| `outfitCompleteness` | enum | Completion needs | Inferred from category |
| `formalityTolerance` | number | Formality range (±) | 2 |
| `patternMixingSafe` | boolean | Pattern mixing safe | true |
| `perfectMatchSkus` | array | Perfect match SKUs | [] |
| `commonPairings` | array | Common pairings | [] |

### 4. Price Intelligence (11 sub-attributes)
**KB Section**: 13

Value assessment metrics:

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `costPerWear` | number | Price / expected wears | price / 50 |
| `costPerWearTier` | enum | Value tier | Calculated from CPW |
| `investmentScore` | number (0-100) | Investment value | 50 |
| `qualityTier` | number (1-5) | Quality tier | Inferred from price |
| `timelessScore` | number (1-10) | Timelessness | 5 |
| `isInvestmentPiece` | boolean | Investment worthy | false |
| `isCapsuleWardrobe` | boolean | Capsule suitable | false |
| `saleLikelihood` | enum | Sale frequency | "seasonal" |
| `bestPurchaseTiming` | string | Best purchase time | "anytime" |
| `expectedWears` | number | Expected wears | 50 |
| `valueTier` | enum | Value assessment | Calculated |

### 5. Social Proof (10 sub-attributes)
**KB Section**: Special Topics

Popularity and trend signals:

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `popularityScore` | number (0-100) | Overall popularity | 50 |
| `popularityTier` | enum | Popularity category | "steady" |
| `trendStatus` | enum | Trend lifecycle | "classic" |
| `trendConfidence` | number (0-100) | Trend confidence | 50 |
| `celebrityAssociations` | array | Celebrity links | [] |
| `hashtagTrending` | array | Trending hashtags | [] |
| `reviewSentiment` | number (0-100) | Review sentiment | 70 |
| `reviewCount` | number | Review count | 0 |
| `recommendRate` | number (0-100) | Recommendation rate | 70 |
| `influencerFeatures` | number | Influencer features | 0 |

## Default Value Logic

### Category-Based Inference

Coverage defaults based on category:
- **Tops/Outerwear**: shoulders=covered, knees=exposed
- **Dresses**: shoulders=covered, knees=covered
- **Bottoms**: shoulders=exposed, knees=covered
- **Footwear/Accessories**: shoulders=exposed, knees=exposed

Essential pairings based on category:
- **Tops**: ["bottom", "footwear"]
- **Bottoms**: ["top", "footwear"]
- **Dresses**: ["footwear"]
- **Outerwear**: ["top", "bottom", "footwear"]

Outfit role based on category:
- **Dresses**: "anchor"
- **Bags/Accessories/Footwear**: "accent"
- **Outerwear**: "statement"
- **Tops/Bottoms**: "supporting"

### Price-Based Inference

Quality tier from price:
- < ฿1,000: tier 2
- ฿1,000-3,000: tier 3
- ฿3,000-10,000: tier 4
- > ฿10,000: tier 5

Cost-per-wear tier:
- < ฿50/wear: "excellent"
- ฿50-100/wear: "good"
- ฿100-200/wear: "moderate"
- > ฿200/wear: "poor"

## Migration Scripts

### 1. migrate_kb_attributes.py
Main migration script that:
- Loads product_master.json
- Adds KB expansion groups with defaults
- Writes product_master_v1.json

```bash
python scripts/migration/migrate_kb_attributes.py
```

### 2. validate_kb_schema.py
Validates schema compliance:
- Checks all required attributes present
- Validates enum values against TypeScript definitions
- Reports compliance percentage

```bash
python scripts/migration/validate_kb_schema.py
```

### 3. enrich_priority_products.py
Enriches high-value products:
- Selects top 100 products by priority score
- Exports template for manual enrichment
- Merges enriched data back

```bash
python scripts/migration/enrich_priority_products.py
```

### 4. extract_kb_schema.py
Generates schema reference:
- Exports complete KB schema with examples
- For manual enrichment guidance

```bash
python scripts/migration/extract_kb_schema.py
```

## Priority Product Selection

Products selected for manual enrichment (score-based):

| Criterion | Points |
|-----------|--------|
| Price >= ฿15,000 | 40 |
| Price >= ฿10,000 | 30 |
| Price >= ฿5,000 | 20 |
| Price >= ฿3,000 | 10 |
| Premium brand | 30 |
| Work essential | 20 |
| Dress/complete outfit | 10 |

Premium brands: POLO RALPH LAUREN, MAJE, COS, & OTHER STORIES, ASAVA, SANDRO, etc.

Work essentials: blazer, shirt, trouser, pant, dress, skirt, blouse, cardigan, suit, tailored

## Future Enrichment Strategies

### LLM-Based Inference
Use Claude API to infer KB attributes from:
- Product descriptions
- Product names
- Category/brand context

### Computer Vision
Analyze product images to detect:
- Silhouette shape
- Pattern complexity
- Texture type
- Color palette

### User Behavior Data
Populate social proof from:
- Actual sales data
- Customer reviews
- Click-through rates
- Add-to-cart frequency

### Expert Curation
Fashion experts enrich specific categories:
- Wedding dresses (full cultural appropriateness)
- Work essentials (complete formality ratings)
- Festival wear (Songkran, Loy Krathong specifics)

## Validation

Run validation after migration:

```bash
# Check product count
jq '. | length' data/products/product_master_v1.json
# Expected: 2594

# Check attribute count
jq '.[0] | keys | length' data/products/product_master_v1.json
# Expected: 14 (9 original + 5 KB groups)

# Run full validation
python scripts/migration/validate_kb_schema.py
# Expected: ✅ All 2594 products validated successfully
```

## File Size Expectations

| File | Products | Attributes | Size | Lines |
|------|----------|------------|------|-------|
| product_master.json | 2,594 | 9 | ~1.5 MB | ~28,000 |
| product_master_v1.json | 2,594 | 63 | ~12-15 MB | ~150,000 |

## Dependencies

This migration creates the foundation for:
- **chore-kb002**: Update server-product-loader.ts
- **chore-kb003**: Integrate with AI matching algorithms
