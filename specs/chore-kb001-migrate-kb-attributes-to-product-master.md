# Chore: Migrate KB Expansion Attributes to product_master_v1.json

## Metadata
adw_id: `kb001`
prompt: `Migrate 120 attributes from mock-data04.ts to new product_master_v1.json format`

## Chore Description

This chore migrates the complete Knowledge Base (KB) expansion attributes from the mock-data04.ts prototype (14 products with 120 attributes each) into a new production-ready JSON format. The goal is to create `product_master_v1.json` that extends the current `product_master.json` (2,594 products with 9 basic attributes) with the full 120-attribute schema.

### Current State
- **product_master.json**: 2,594 products with 9 basic attributes (category, price, original_price, brand, product_name, link, image_url, availability, product_description)
- **mock-data04.ts**: 14 products with 120 attributes including:
  - 65 base attributes (from mock-data02 + mock-data03)
  - 54 KB expansion attributes in 5 groups:
    1. `thaiContext` (7 attributes) - Thai climate, temple/festival appropriateness
    2. `visualMatching` (11 attributes) - Silhouette, visual weight, proportions
    3. `crossProductCompatibility` (10 attributes) - Pairing scores, perfect matches
    4. `priceIntelligence` (11 attributes) - Cost-per-wear, investment scoring
    5. `socialProof` (10 attributes) - Popularity, trends, celebrity associations

### Migration Strategy
**Phase 1 (This Chore)**: Create hybrid format with KB-enriched products
- Start with existing 2,594 products from `product_master.json`
- Add KB expansion attribute **placeholders** with sensible defaults
- Manually enrich **high-priority products** (top 50-100) with full KB attributes
- Create migration scripts for future bulk enrichment

**Future Phases**:
- Phase 2 (chore-kb002): Update server-product-loader.ts to parse v1 format
- Phase 3 (chore-kb003): Integrate KB attributes with AI matching algorithms

## Relevant Files

### Existing Files to Reference
- **apps/web/lib/mock-data04.ts** (3,377 lines) - Source of 120-attribute schema, contains 14 fully populated products (CG001, CG002, CG004, CG005, CG006, CG007, CG008, SF001, SF002, LO001, SF003, SF004, SH001, SH002)
- **data/products/product_master.json** (28,535 lines, 2,594 products) - Current production catalog with 9 basic attributes
- **apps/web/lib/types/product-types.ts** - EnhancedProduct interface definition
- **apps/web/lib/types/enums.ts** - All enum type definitions for KB attributes
- **apps/web/lib/types/thai-context-types.ts** - ThaiClimateContext interface
- **apps/web/lib/types/ai-matching-types.ts** - VisualMatchingAttributes, CrossProductCompatibility, PriceIntelligence, SocialProofSignals interfaces

### New Files

#### data/products/product_master_v1.json
New production catalog with KB expansion attributes. Structure:
```json
[
  {
    // ===== EXISTING 9 ATTRIBUTES (from product_master.json) =====
    "category": "women_clothing",
    "price": "฿1,290",
    "original_price": "฿1,290",
    "brand": "Central",
    "product_name": "Classic White Button Shirt",
    "link": "https://central.co.th/...",
    "image_url": "https://...",
    "availability": "In Stock",
    "product_description": "...",

    // ===== NEW KB EXPANSION GROUPS (54 attributes) =====
    "thaiContext": {
      "thaiClimateRating": 7,
      "acFriendly": true,
      "monthSuitability": [8,8,8,7,6,6,7,7,8,8,8,8],
      "templeAppropriate": true,
      "weddingAppropriate": "morning",
      "funeralAppropriate": false,
      "songkranSuitable": "neither",
      "loyKrathongSuitable": true,
      "coverage": {
        "shoulders": "covered",
        "knees": "covered"
      },
      "thaiDayColors": [],
      "cnySuitable": "neutral"
    },
    "visualMatching": {
      "silhouetteShape": "straight",
      "silhouetteFit": "fitted",
      "silhouetteVolume": "low",
      "visualWeightScore": 3,
      "visualWeightLevel": "lightweight",
      "proportionRatio": "balanced",
      "proportionEffect": {
        "torsoLengthening": 0,
        "legLengthening": 0,
        "heightEffect": 0,
        "widthEffect": 0
      },
      "patternComplexity": 1,
      "textureType": "matte",
      "outfitRoleType": "supporting",
      "thaiProportionScore": 7
    },
    "crossProductCompatibility": {
      "pairingScore": 85,
      "essentialPairings": ["bottom", "footwear"],
      "avoidPairings": [],
      "versatilityScore": 9,
      "layerCompatibility": ["fitted", "structured"],
      "outfitCompleteness": "needs-bottom",
      "formalityTolerance": 2,
      "patternMixingSafe": true,
      "perfectMatchSkus": [],
      "commonPairings": []
    },
    "priceIntelligence": {
      "costPerWear": 12.9,
      "costPerWearTier": "excellent",
      "investmentScore": 85,
      "qualityTier": 4,
      "timelessScore": 9,
      "isInvestmentPiece": true,
      "isCapsuleWardrobe": true,
      "saleLikelihood": "low",
      "bestPurchaseTiming": "anytime",
      "expectedWears": 100,
      "valueTier": "exceptional"
    },
    "socialProof": {
      "popularityScore": 75,
      "popularityTier": "popular",
      "trendStatus": "timeless",
      "trendConfidence": 90,
      "celebrityAssociations": [],
      "hashtagTrending": ["#whiteShirt", "#workwear"],
      "reviewSentiment": 85,
      "reviewCount": 234,
      "recommendRate": 88,
      "influencerFeatures": 12
    }
  }
]
```

#### scripts/migration/migrate_kb_attributes.py
Python script to migrate product_master.json → product_master_v1.json with KB placeholders

#### scripts/migration/enrich_priority_products.py
Script to manually enrich top priority products with full KB attributes from mock-data04.ts

#### scripts/migration/validate_kb_schema.py
Validation script to ensure product_master_v1.json conforms to KB schema

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Migration Script Foundation
- Create `scripts/migration/` directory
- Create `scripts/migration/migrate_kb_attributes.py`:
  - Load existing `product_master.json` (2,594 products)
  - Parse JSON array
  - For each product, add KB expansion groups with **default placeholder values**:
    - `thaiContext`: Sensible defaults (e.g., `thaiClimateRating: 5`, `acFriendly: true`, `templeAppropriate: false` for safety)
    - `visualMatching`: Neutral defaults (e.g., `silhouetteShape: "straight"`, `visualWeightScore: 5`)
    - `crossProductCompatibility`: Conservative defaults (e.g., `pairingScore: 50`, `versatilityScore: 5`)
    - `priceIntelligence`: Calculated from price (e.g., `costPerWear: price / 50`, `investmentScore: 50`)
    - `socialProof`: Neutral defaults (e.g., `popularityScore: 50`, `trendStatus: "stable"`)
  - Write output to `data/products/product_master_v1.json`
  - Log migration statistics (products processed, attributes added)

### 2. Define Default Value Logic
- In `migrate_kb_attributes.py`, create function `get_default_kb_attributes(product: dict) -> dict`:
  - **thaiContext defaults**:
    - `thaiClimateRating`: 5 (neutral, suitable year-round)
    - `acFriendly`: true (assume most indoor clothes are AC-friendly)
    - `monthSuitability`: [6,6,6,6,6,6,6,6,6,6,6,6] (neutral 6/10 for all months)
    - `templeAppropriate`: false (conservative default, requires manual review)
    - `weddingAppropriate`: "none" (requires manual classification)
    - `funeralAppropriate`: false
    - `songkranSuitable`: "neither"
    - `loyKrathongSuitable`: false
    - `coverage`: infer from category (tops/dresses: `shoulders: "covered"`, bottoms: `knees: "covered"`, footwear: `shoulders: "exposed", knees: "exposed"`)
    - `thaiDayColors`: [] (empty, requires manual enrichment)
    - `cnySuitable`: "neutral"
  - **visualMatching defaults**:
    - `silhouetteShape`: "straight" (most common)
    - `silhouetteFit`: "semi-fitted" (middle ground)
    - `silhouetteVolume`: "medium"
    - `visualWeightScore`: 5
    - `visualWeightLevel`: "medium"
    - `proportionRatio`: "balanced"
    - `proportionEffect`: all zeros (neutral)
    - `patternComplexity`: 1 (assume solid unless description mentions pattern)
    - `textureType`: "matte"
    - `outfitRoleType`: infer from category (tops: "supporting", dresses: "anchor", accessories: "accent")
    - `thaiProportionScore`: 5
  - **crossProductCompatibility defaults**:
    - `pairingScore`: 50
    - `essentialPairings`: infer from category (tops: ["bottom", "footwear"], bottoms: ["top", "footwear"], dresses: ["footwear"])
    - `avoidPairings`: []
    - `versatilityScore`: 5
    - `layerCompatibility`: ["fitted", "structured", "loose"] (all, requires manual refinement)
    - `outfitCompleteness`: infer from category (tops: "needs-bottom", bottoms: "needs-top", dresses: "standalone", footwear: "needs-accessories")
    - `formalityTolerance`: 2 (±2 formality range)
    - `patternMixingSafe`: true (assume safe unless pattern detected)
    - `perfectMatchSkus`: []
    - `commonPairings`: []
  - **priceIntelligence defaults**:
    - `costPerWear`: `price / 50` (assume 50 wears baseline)
    - `costPerWearTier`: map from costPerWear (< ฿20 = "excellent", ฿20-50 = "good", ฿50-100 = "fair", > ฿100 = "premium")
    - `investmentScore`: 50 (neutral)
    - `qualityTier`: infer from price (< ฿1000 = 2, ฿1000-3000 = 3, ฿3000-10000 = 4, > ฿10000 = 5)
    - `timelessScore`: 5
    - `isInvestmentPiece`: false (requires manual classification)
    - `isCapsuleWardrobe`: false
    - `saleLikelihood`: "medium"
    - `bestPurchaseTiming`: "anytime"
    - `expectedWears`: 50
    - `valueTier`: "fair"
  - **socialProof defaults**:
    - `popularityScore`: 50
    - `popularityTier`: "emerging"
    - `trendStatus`: "stable"
    - `trendConfidence`: 50
    - `celebrityAssociations`: []
    - `hashtagTrending`: []
    - `reviewSentiment`: 70
    - `reviewCount`: 0
    - `recommendRate`: 70
    - `influencerFeatures`: 0

### 3. Create Priority Product Enrichment Script
- Create `scripts/migration/enrich_priority_products.py`:
  - Define priority product selection criteria:
    - Top 50 products by price (high-value items)
    - Top 50 products by brand tier (Central's premium brands)
    - Products matching mock-data04.ts SKUs if they exist in product_master.json
  - For each priority product, manually copy KB attributes from mock-data04.ts if available
  - Create mapping template for manual enrichment:
    - Export priority products to `data/migration/priority_products_template.json`
    - Include product basic info + empty KB attribute groups for manual filling
  - Merge enriched priority products back into `product_master_v1.json`

### 4. Extract KB Attribute Schema from mock-data04.ts
- Create `scripts/migration/extract_kb_schema.py`:
  - Parse `apps/web/lib/mock-data04.ts` TypeScript file
  - Extract one sample product (e.g., CG001) with all 120 attributes
  - Generate JSON schema template showing structure
  - Output to `data/migration/kb_schema_reference.json` for documentation
  - This serves as reference for future manual enrichment

### 5. Run Migration and Generate product_master_v1.json
- Execute `python scripts/migration/migrate_kb_attributes.py`:
  - Input: `data/products/product_master.json`
  - Output: `data/products/product_master_v1.json`
  - Should process all 2,594 products
  - Log: Number of products migrated, default attributes added, file size comparison

### 6. Create Validation Script
- Create `scripts/migration/validate_kb_schema.py`:
  - Load `product_master_v1.json`
  - Validate structure:
    - All products have 9 original attributes + 5 KB expansion groups
    - Each KB group has correct number of sub-attributes
    - Enum values match TypeScript definitions (reference `apps/web/lib/types/enums.ts`)
    - No missing required fields
    - Data types are correct (numbers, strings, booleans, arrays, objects)
  - Generate validation report:
    - Total products validated
    - Schema compliance rate
    - List of validation errors by product SKU
  - Exit with error code if validation fails

### 7. Document Migration Approach
- Create `docs/migration/kb_attribute_migration.md`:
  - Explain migration strategy (default placeholders + manual enrichment)
  - Document default value logic for each KB attribute group
  - Provide examples of fully enriched vs. placeholder products
  - Include instructions for future bulk enrichment
  - Reference knowledge base sections for each attribute group

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. Run migration script
cd /Users/naruechon/OOTD
python scripts/migration/migrate_kb_attributes.py

# 2. Verify output file exists and has correct structure
ls -lh data/products/product_master_v1.json
jq '. | length' data/products/product_master_v1.json  # Should be 2594
jq '.[0] | keys | length' data/products/product_master_v1.json  # Should be 14 (9 original + 5 KB groups)

# 3. Run validation script
python scripts/migration/validate_kb_schema.py
# Should output: "✅ All 2594 products validated successfully"

# 4. Compare file sizes (v1 should be significantly larger)
wc -l data/products/product_master.json
wc -l data/products/product_master_v1.json

# 5. Inspect sample products
jq '.[0]' data/products/product_master_v1.json  # First product with KB attributes
jq '.[] | select(.brand == "POLO RALPH LAUREN") | .thaiContext' data/products/product_master_v1.json | head -20  # Check premium brand enrichment

# 6. Verify no data loss from original product_master.json
jq '.[].product_name' data/products/product_master.json | wc -l
jq '.[].product_name' data/products/product_master_v1.json | wc -l
# Both should be 2594
```

## Notes

### Migration Philosophy
- **Conservative defaults**: Use safe, neutral values that won't break existing functionality
- **Gradual enrichment**: Start with placeholders, manually enrich high-priority products, then bulk enrich later
- **Backward compatibility**: Keep all 9 original attributes intact
- **Type safety**: Ensure all values conform to TypeScript enum definitions

### Priority Product Selection
Recommended priority products for manual enrichment (first 50-100):
1. **Premium brands**: POLO RALPH LAUREN, MAJE, COS, & Other Stories
2. **High price points**: Products > ฿5,000
3. **Complete outfits**: Dresses, jumpsuits (highest impact on AI matching)
4. **Work essentials**: Blazers, tailored trousers, white shirts (high versatility)
5. **Existing mock data**: If any product_master.json SKUs match mock-data04.ts SKUs (CG001, CG002, etc.)

### Future Bulk Enrichment Strategy
After this chore, future enrichment can happen via:
1. **LLM-based inference**: Use Claude API to infer KB attributes from product descriptions
2. **Image analysis**: Computer vision to detect silhouette, color, pattern, texture
3. **User behavior data**: Populate socialProof from actual sales and reviews
4. **Manual curation**: Fashion experts enrich specific categories (e.g., all wedding dresses)

### File Size Expectations
- Current `product_master.json`: ~1.5 MB (28,535 lines)
- Expected `product_master_v1.json`: ~12-15 MB (120,000-150,000 lines)
  - 2,594 products × ~50-60 lines per product (with KB expansion)

### Dependencies for Next Chores
This chore creates the foundation for:
- **chore-kb002**: Update `server-product-loader.ts` to parse `product_master_v1.json` and populate `EnhancedProduct` interface
- **chore-kb003**: Integrate KB attributes with AI matching (outfit-combination-rules.ts, enhanced-outfit-generator.ts, ai-chat-service.ts)
