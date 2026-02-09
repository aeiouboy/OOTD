# Chore: Enhance Product Mock Data with Knowledge Base Alignment

## Metadata
adw_id: `to`
prompt: `analyst product enhance mock-data03.ts attributes that align with knowledge base to mock-data04.ts`

## Chore Description

Analyze the current `mock-data03.ts` product data and enhance it to `mock-data04.ts` by fully populating the KB Expansion Feb 2026 attribute groups (`thaiContext`, `visualMatching`, `crossProductCompatibility`, `priceIntelligence`, `socialProof`) for all 14 products. Currently, only CG001 has these attributes populated.

### Current State Analysis

**mock-data03.ts contains:**
- 14 products: CG001, CG002, CG004, CG005, CG006, CG007, CG008, SF001, SF002, LO001, SF003, SF004, SH001, SH002
- Base attributes (47+): styleTags, seasonType, formalityLevel, fitType, patternType, materialType, colorTone, aesthetic, colorPalette, outfitRole, brandTier, pairingCategories, layeringStyle, silhouetteType, bodyTypeCompatibility, heightRecommendation, dressCode, eventTypes, timeOfDay, temperatureRange, weatherSuitability, stylePersonality, fashionMoods, trendStatus, trendSeasons, versatilityScore, dominantColors, secondaryColors, textureDescription, visualWeight, garmentDetails, sustainabilityScore, sustainabilityTags, investmentPiece, capsuleWardrobe, pricePerWear, stylingTips, avoidPairingWith, ageRange, targetLifestyle, colorFamily, colorSaturation, colorBrightness, aiMatchingTags, semanticDescription, alternativeNames, inspirationKeywords, pinterestAesthetics, styleReferences, visualRole, distinctiveFeatures
- **KB Expansion attributes populated:** 1/14 products (CG001 only)

**KB Expansion Feb 2026 Attribute Groups (5 total):**

1. **thaiContext** (ThaiClimateContext) - KB Sections 01, 02, 07, 12
   - thaiClimateRating (1-10)
   - acFriendly (boolean)
   - monthSuitability (12-element array)
   - templeAppropriate (boolean)
   - weddingAppropriate ('any' | 'conservative' | 'not-appropriate')
   - funeralAppropriate (boolean)
   - songkranSuitable ('yes' | 'no' | 'temple-morning' | 'water-play')
   - loyKrathongSuitable (boolean)
   - coverage (shoulders, knees coverage requirements)
   - thaiDayColors (auspicious days for this color)

2. **visualMatching** (VisualMatchingAttributes) - KB Section 15
   - silhouetteShape (SilhouetteShape enum)
   - visualWeightScore (1-10)
   - visualWeightLevel (VisualWeightLevel enum)
   - proportionRatio (ProportionRatio enum)
   - proportionEffect (torsoLengthening, legLengthening, heightEffect, widthEffect)
   - patternComplexity (1-10)
   - textureType (TextureType enum)
   - outfitRoleType (OutfitRoleType enum)
   - thaiProportionScore (1-10)
   - statementPotential (boolean)
   - styleMoods (string[])

3. **crossProductCompatibility** (CrossProductCompatibility) - KB Section 17
   - pairingScore (0-100)
   - essentialPairings (string[])
   - avoidPairings (string[])
   - versatilityScore (1-10)
   - layerCompatibility (LayerCompatibility[])
   - outfitCompleteness (OutfitCompleteness enum)
   - formalityTolerance (number ±range)
   - patternMixingSafe (boolean)
   - perfectMatchSkus (string[])
   - commonPairings (array of {sku, relationship, score})

4. **priceIntelligence** (PriceIntelligence) - KB Section 13
   - costPerWear (calculated from price ÷ expectedWears)
   - costPerWearTier (CostPerWearTier enum)
   - investmentScore (0-100)
   - qualityTier (1-5)
   - timelessScore (1-10)
   - isInvestmentPiece (boolean)
   - isCapsuleWardrobe (boolean)
   - saleLikelihood (SaleLikelihood enum)
   - bestPurchaseTiming (string)
   - expectedWears (number)
   - valueTier ('exceptional' | 'fair' | 'premium' | 'overpriced')

5. **socialProof** (SocialProofSignals) - KB Special Topics
   - popularityScore (0-100)
   - popularityTier (PopularityTier enum)
   - trendStatus (TrendLifecycle enum)
   - trendConfidence (0-100)
   - celebrityAssociations (string[])
   - hashtagTrending (string[])
   - reviewSentiment (0-100)
   - reviewCount (number)
   - recommendRate (0-100)
   - influencerFeatures (number)
   - salesVelocity ('fast-selling' | 'steady' | 'slow')
   - stockScarcity ('limited' | 'available' | 'abundant')

## Relevant Files

### Source Files (Read-Only)
- `apps/web/lib/mock-data03.ts` - Current product data with 14 products, 1 with full KB attributes
- `apps/web/lib/types/thai-context-types.ts` - ThaiClimateContext interface definition
- `apps/web/lib/types/ai-matching-types.ts` - VisualMatchingAttributes, CrossProductCompatibility, PriceIntelligence, SocialProofSignals interfaces
- `apps/web/lib/types/enums.ts` - Enum definitions for all attribute values

### Knowledge Base Reference Files
- `data/personas/knowledge_base/00_INDEX.md` - Master index of all KB sections
- `data/personas/knowledge_base/implementation/15_visual_matching_intelligence.md` - Visual vocabulary for silhouettes, weights, proportions
- `data/personas/knowledge_base/implementation/16_outfit_composition_rules.md` - Outfit formulas and composition logic
- `data/personas/knowledge_base/implementation/17_cross_product_compatibility.md` - Pairing rules and compatibility matrices
- `data/personas/knowledge_base/advanced/12_thai_micro_seasons.md` - Thai seasonal fashion calendar
- `data/personas/knowledge_base/advanced/13_price_intelligence.md` - Cost-per-wear and investment criteria
- `data/personas/knowledge_base/special/social_proof_signals.md` - Popularity and trend indicators
- `data/personas/knowledge_base/foundation/02_thai_culture_fashion.md` - Thai day colors and cultural context

### New Files
- `apps/web/lib/mock-data04.ts` - Enhanced product data with all KB expansion attributes populated for all 14 products

## Step by Step Tasks

### 1. Analyze CG001 Reference Implementation
- Study the fully-populated CG001 product in mock-data03.ts as the reference implementation
- Document the pattern for each of the 5 KB expansion attribute groups
- Extract the value calculation logic (e.g., costPerWear = price ÷ expectedWears)
- Map attribute values to knowledge base section guidelines

### 2. Create Product Analysis Spreadsheet (Mental Model)
For each of the 14 products, analyze and determine:
- **Thai Context**: Climate suitability, cultural appropriateness, festival compatibility
- **Visual Matching**: Silhouette shape, visual weight, proportion effects
- **Cross-Product Compatibility**: Perfect matches with other SKUs, pairing rules
- **Price Intelligence**: Cost-per-wear calculation, investment score
- **Social Proof**: Popularity estimates, trend status, celebrity associations

### 3. Create mock-data04.ts Foundation
- Copy mock-data03.ts to mock-data04.ts
- Update file header comments to reflect v4 enhancements
- Document the KB expansion completion status

### 4. Populate CG002 Tailored Black Trousers Attributes
Apply KB guidelines for bottom category:
- thaiContext: Dark color consideration for funerals, temple not recommended
- visualMatching: H-line silhouette, medium visual weight, leg lengthening effect
- crossProductCompatibility: Perfect match with CG001, SF001, LO001
- priceIntelligence: ฿1,890 ÷ 100 wears = ฿18.90 CPW
- socialProof: Timeless status, high confidence

### 5. Populate CG004 Casual Denim Jeans Attributes
Apply KB guidelines for casual bottom:
- thaiContext: Not temple appropriate, good for casual events
- visualMatching: I-line silhouette, medium weight, versatile proportions
- crossProductCompatibility: High versatility, many pairings
- priceIntelligence: ฿1,590 ÷ 200 wears = excellent CPW
- socialProof: Timeless casual staple

### 6. Populate CG005 Floral Summer Dress Attributes
Apply KB guidelines for dress category:
- thaiContext: Songkran temple-morning suitable, Loy Krathong good
- visualMatching: A-line silhouette, light visual weight, statement piece
- crossProductCompatibility: Complete outfit, needs accessories only
- priceIntelligence: Seasonal piece, lower expected wears
- socialProof: Seasonal trending, feminine associations

### 7. Populate CG006 Blazer Jacket Attributes
Apply KB guidelines for outerwear:
- thaiContext: AC-friendly, temple appropriate with proper bottom
- visualMatching: Structured, medium-heavy visual weight
- crossProductCompatibility: High versatility, elevates any outfit
- priceIntelligence: Investment piece, high expected wears
- socialProof: Power dressing association, executive references

### 8. Populate CG007 Cotton T-Shirt Attributes
Apply KB guidelines for casual top:
- thaiContext: Not temple appropriate alone, versatile daily wear
- visualMatching: H-line, light visual weight, supporting role
- crossProductCompatibility: Pairs with almost everything
- priceIntelligence: Low price, high wears = excellent CPW
- socialProof: Wardrobe basic, minimal social proof needed

### 9. Populate CG008 Leather Belt Attributes
Apply KB guidelines for accessory:
- thaiContext: Neutral accessory, suitable for most occasions
- visualMatching: Accent role, minimal visual weight
- crossProductCompatibility: Pairs with pants, jeans, dresses
- priceIntelligence: Long lifespan, excellent CPW
- socialProof: Classic accessory, stable demand

### 10. Populate SF001 SFERA Blazer Suit Attributes
Apply KB guidelines for premium outerwear:
- thaiContext: High formality, excellent for professional settings
- visualMatching: Statement piece, structured silhouette
- crossProductCompatibility: Perfect match with SF002
- priceIntelligence: Investment piece at accessible price point
- socialProof: Executive associations, power dressing references

### 11. Populate SF002 SFERA Suit Pants Attributes
Apply KB guidelines for formal bottom:
- thaiContext: High formality, professional settings
- visualMatching: H-line, supporting role
- crossProductCompatibility: Perfect match with SF001, CG001
- priceIntelligence: Investment piece for professional wardrobe
- socialProof: Power suit associations

### 12. Populate LO001 SFERA White Blouse Attributes
Apply KB guidelines for elegant top:
- thaiContext: Temple appropriate, wedding guest appropriate
- visualMatching: Fitted silhouette, light visual weight, schiffli texture
- crossProductCompatibility: Versatile top, many bottom pairings
- priceIntelligence: Mid-range investment, good wears
- socialProof: Classic elegance associations

### 13. Populate SF003 SFERA Printed Midi Skirt Attributes
Apply KB guidelines for patterned bottom:
- thaiContext: Office-casual appropriate, creative workplaces
- visualMatching: A-line silhouette, pattern complexity 6-7
- crossProductCompatibility: Needs solid color tops
- priceIntelligence: Seasonal piece, moderate wears
- socialProof: Bohemian-chic, artsy references

### 14. Populate SF004 SFERA Navy Button Dress Attributes
Apply KB guidelines for formal dress:
- thaiContext: Navy is Friday lucky color, professional appropriate
- visualMatching: Fitted sheath, statement buttons as accent
- crossProductCompatibility: Complete outfit, blazer optional
- priceIntelligence: Higher price, investment piece
- socialProof: Executive elegance, commanding presence

### 15. Populate SH001 and SH002 Footwear Attributes
Apply KB guidelines for footwear category:
- thaiContext: Consider temple removal ease
- visualMatching: Footwear-specific visual weight
- crossProductCompatibility: Match with outfit formality
- priceIntelligence: Comfort and durability factors
- socialProof: Footwear-specific influencer associations

### 16. Validate TypeScript Compilation
- Run TypeScript type check to ensure all new data validates against interfaces
- Fix any type errors in populated attributes
- Ensure all enum values are valid

### 17. Cross-Reference SKU Relationships
- Verify all perfectMatchSkus reference existing SKUs
- Validate commonPairings arrays have correct relationship types
- Ensure bidirectional pairing references are consistent

## Validation Commands

```bash
# Validate TypeScript compilation
cd apps/web && pnpm tsc --noEmit 2>&1 | grep -E "(mock-data04|thai-context|ai-matching)" || echo "No errors found"

# Count products with all KB expansion attributes
grep -c "thaiContext:" apps/web/lib/mock-data04.ts
# Expected: 14

# Count products with visualMatching
grep -c "visualMatching:" apps/web/lib/mock-data04.ts
# Expected: 14

# Count products with crossProductCompatibility
grep -c "crossProductCompatibility:" apps/web/lib/mock-data04.ts
# Expected: 14

# Count products with priceIntelligence
grep -c "priceIntelligence:" apps/web/lib/mock-data04.ts
# Expected: 14

# Count products with socialProof
grep -c "socialProof:" apps/web/lib/mock-data04.ts
# Expected: 14

# Verify file is valid JS/TS syntax
cd apps/web && node -e "require('./lib/mock-data04.ts')" 2>&1 || echo "Syntax check requires ts-node"

# Check total line count (expect ~3000-3500 lines with all attributes)
wc -l apps/web/lib/mock-data04.ts
```

## Notes

### Knowledge Base Value Guidelines

**Thai Climate Rating (1-10):**
- 10: Perfect for Thai heat (linen, breathable cotton)
- 7-9: Good with AC (most business wear)
- 4-6: Cool season only or AC-dependent
- 1-3: Not suitable for Thai climate

**Visual Weight Score (1-10):**
- 1-2: Ultra light (chiffon, sheer)
- 3-4: Light (cotton tee, linen)
- 5-6: Medium (denim, cotton blazer)
- 7-8: Heavy (wool, leather)
- 9-10: Statement heavy (brocade, structured outerwear)

**Cost-Per-Wear Tiers:**
- 'excellent': < ฿50/wear
- 'very-good': ฿50-100/wear
- 'good': ฿100-200/wear
- 'fair': ฿200-500/wear
- 'poor': > ฿500/wear

**Popularity Score Guidelines:**
- 90-100: Viral ("ปังมาก!")
- 75-89: Hot ("ฮิตมาก")
- 60-74: Popular ("นิยม")
- 40-59: Moderate
- < 40: Niche

### Cross-Product Pairing Validation

All perfectMatchSkus must reference valid SKUs from the product list:
- CG001, CG002, CG004, CG005, CG006, CG007, CG008
- SF001, SF002, LO001, SF003, SF004
- SH001, SH002

### Formality Tolerance Rule

Products can pair within ±2 formality levels:
- Formality 7 (blazer) can pair with 5-9
- Formality 3 (jeans) can pair with 1-5
