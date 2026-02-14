# Chore: Integrate KB Expansion Attributes with AI Matching Algorithms

## Metadata
adw_id: `a2c25948`
prompt: `chore-kb003: Integrate KB expansion attributes with AI matching algorithms. Create specialized matchers (thai-cultural-matcher.ts, visual-matching-scorer.ts, cross-product-matcher.ts, price-intelligence-optimizer.ts, social-proof-ranker.ts) and integrate with outfit-combination-rules.ts and ai-chat-service.ts.`

## Chore Description

This chore integrates the KB expansion attributes (from chore-kb001 and chore-kb002) into the AI-powered outfit generation and recommendation system. The implementation creates five specialized matcher modules that leverage Thai cultural context, visual matching intelligence, cross-product compatibility, price intelligence, and social proof signals to generate more accurate, culturally appropriate, and personalized outfit recommendations.

### Current State Analysis

The outfit generation system currently uses:
- **Basic product attributes** from `product_master_v1.json` (9 base + 5 KB groups)
- **enrichProductData()** in `product-enrichment.ts` for attribute inference
- **Pinterest 2026 trends** in `outfit-combination-rules.ts` (976 lines)
- **Color palette matching** in `color-palette-matcher.ts`
- **Gender-aware filtering** in `product-filters.ts` (356 lines)
- **Formality matching** with ±2 tolerance on 1-10 scale

### Target State

Enhanced outfit generation leveraging KB attributes:
1. **Thai Cultural Appropriateness** - Temple/wedding/funeral validation, festival recommendations
2. **Visual Matching Intelligence** - Silhouette balancing, proportion effects, pattern complexity
3. **Cross-Product Compatibility** - Perfect match SKUs, pairing scores, layering rules
4. **Price Intelligence** - Cost-per-wear optimization, investment piece prioritization
5. **Social Proof Signals** - Trend-aware ranking, influencer/celebrity associations

### Dependencies
- **Prerequisites**: chore-kb001 (product_master_v1.json exists), chore-kb002 (server-product-loader.ts supports KB attributes)
- **Blocks**: None (this is the final integration step)

## Relevant Files

### Files to Modify

#### apps/web/lib/enhanced-outfit-generator.ts (488 lines)
- Integrates KB matcher modules into outfit generation pipeline
- Adds KB attribute-based filtering and scoring
- Implements Thai cultural validation and visual matching during outfit construction

#### apps/web/lib/styling/outfit-combination-rules.ts (976 lines)
- Adds Thai cultural validation rules in `validateOutfitComposition()`
- Implements visual balance checks using `calculateVisualBalance()`
- Adds pattern mixing safety checks using KB attributes

#### apps/web/lib/utils/product-filters.ts (356 lines)
- Adds `filterByThaiOccasion()` for cultural event filtering
- Adds `filterByTrendStatus()` for trend-based filtering
- Adds `filterByVisualWeight()` for silhouette balancing

#### apps/web/lib/services/ai-chat-service.ts
- Detects Thai cultural occasions (วัด, งานแต่ง, งานศพ)
- Adds budget optimization using `costPerWear`
- Integrates trend awareness into AI prompt context

### New Files to Create

#### apps/web/lib/matching/thai-cultural-matcher.ts
New module for Thai cultural appropriateness validation:
- `validateThaiOccasion(outfit, occasion)` - Validates outfit for temple/wedding/funeral/festivals
- `filterByMonth(products, month)` - Filters products by month suitability (1-12)
- `checkThaiDayColor(product, date)` - Checks if product color matches auspicious day
- `ThaiOccasion` type - Union type for Thai cultural occasions

#### apps/web/lib/matching/visual-matching-scorer.ts
New module for visual matching intelligence:
- `calculateVisualBalance(outfit)` - Returns `VisualBalanceScore` with silhouette/volume/weight balance
- `getSilhouetteCompatibility(p1, p2)` - Returns 0-100 score based on silhouette fit pairing rules
- `validateProportionEffects(outfit)` - Validates complementary proportion effects
- `getThaiProportionScore(outfit)` - Weighted average of `thaiProportionScore` across items

#### apps/web/lib/matching/cross-product-matcher.ts
New module for cross-product compatibility:
- `findPerfectMatches(product, allProducts)` - Finds products in `perfectMatchSkus` array
- `calculatePairingScore(p1, p2)` - Uses `crossProductCompatibility.pairingScore` with layer/pattern checks
- `validateEssentialPairings(outfit)` - Ensures all `essentialPairings` categories present
- `checkLayeringCompatibility(outfit)` - Validates fitted → structured → loose sequence

#### apps/web/lib/matching/price-intelligence-optimizer.ts
New module for price intelligence:
- `optimizeOutfitBudget(outfits, maxBudget)` - Sorts by `costPerWear` instead of raw price
- `getValueTierMatch(outfit)` - Checks `valueTier` compatibility across items
- `calculateOutfitCostPerWear(outfit)` - Sums `costPerWear` across items
- `getQualityTierScore(outfit)` - Average `qualityTier` (1-5)

#### apps/web/lib/matching/social-proof-ranker.ts
New module for social proof ranking:
- `rankByTrendStatus(outfits)` - Ranks by trend lifecycle (emerging=100, peak=90, timeless=85, declining=40)
- `getTrendConfidence(outfit)` - Weighted average `trendConfidence` by outfit role
- `getPopularityScore(outfit)` - Average `popularityScore` with influencer boost
- `getCelebrityBoost(outfit, occasion)` - Returns boost for celebrity associations

#### apps/web/lib/matching/index.ts
Barrel export file for all matcher modules

### Reference Files (No Changes)

- `apps/web/lib/types/ai-matching-types.ts` - Existing KB type definitions
- `apps/web/lib/types/kb-expansion-types.ts` - KB expansion attribute types
- `apps/web/lib/types/thai-context-types.ts` - Thai cultural context types
- `apps/web/lib/types/enums.ts` - Enum definitions for KB attributes
- `apps/web/lib/transformers/kb-attribute-parser.ts` - KB attribute parsing utilities
- `data/personas/knowledge_base/implementation/15_visual_matching_intelligence.md` - Visual matching rules
- `data/personas/knowledge_base/implementation/16_outfit_composition_rules.md` - Outfit composition guidelines
- `data/personas/knowledge_base/implementation/17_cross_product_compatibility.md` - Pairing rules
- `data/personas/knowledge_base/advanced/12_thai_micro_seasons.md` - Thai cultural context
- `data/personas/knowledge_base/advanced/13_price_intelligence.md` - Price intelligence logic

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Thai Cultural Matcher Module
- Create `apps/web/lib/matching/thai-cultural-matcher.ts`
- Define `ThaiOccasion` type: `'temple' | 'wedding' | 'funeral' | 'songkran' | 'loy-krathong' | 'cny'`
- Define `ThaiValidationResult` interface with `isValid`, `score`, and `issues` fields
- Implement `validateThaiOccasion(outfit: EnhancedProduct[], occasion: ThaiOccasion)`:
  - **Temple**: Check `thaiContext.templeAppropriate === true`, `coverage.shoulders === 'covered'`, `coverage.knees === 'covered'`
  - **Wedding**: Check `weddingAppropriate !== 'none'`, avoid white dresses, formality ≥ 7
  - **Funeral**: Check `funeralAppropriate === true`, validate black/dark colors
  - **Songkran**: Check `songkranSuitable === 'water-play'` or `'both'`
  - **Loy Krathong**: Check `loyKrathongSuitable === true`
  - **CNY**: Check `cnySuitable === 'suitable'`, validate red/gold colors
- Implement `filterByMonth(products: EnhancedProduct[], month: number)`:
  - Filter products where `monthSuitability[month] >= 6`
  - Sort by `monthSuitability` score descending
- Implement `checkThaiDayColor(product: EnhancedProduct, date: Date)`:
  - Map date to Thai day of week using `date.getDay()`
  - Check if product color matches `thaiDayColors` array
- Implement `filterTempleAppropriate(products: EnhancedProduct[])`:
  - Filter where `templeAppropriate === true`
- Export all functions and types

### 2. Create Visual Matching Scorer Module
- Create `apps/web/lib/matching/visual-matching-scorer.ts`
- Define `VisualBalanceScore` interface with `score`, `silhouetteBalance`, `volumeBalance`, `weightBalance`, `proportionBalance`, `patternScore`
- Implement `calculateVisualBalance(outfit: EnhancedProduct[])`:
  - **Silhouette balance**: Score 100 if fitted + relaxed, 70 if matching fits, 50 if both oversized
  - **Volume balance**: Sum `silhouetteVolume` (low=1, medium=2, high=3), prefer 4-6 for 2-item outfit
  - **Visual weight**: Check top vs bottom `visualWeightLevel`, avoid both heavy or both light
  - **Proportion effect**: Sum `torsoLengthening` + `legLengthening`, prefer complementary
  - **Pattern complexity**: Max one item with `patternComplexity > 7`
- Implement `getSilhouetteCompatibility(p1: EnhancedProduct, p2: EnhancedProduct)`:
  - Fitted + Relaxed = 100
  - Fitted + Fitted = 70 (if same `silhouetteShape`)
  - Relaxed + Relaxed = 50 (unless both fluid)
  - Use `visualWeightScore` to refine
- Implement `validateProportionEffects(outfit: EnhancedProduct[])`:
  - Check complementary proportion effects
  - Leg-lengthening bottom + neutral top = good
  - Both torso-lengthening = bad (unbalanced)
- Implement `getThaiProportionScore(outfit: EnhancedProduct[])`:
  - Average `thaiProportionScore` across items
  - Weight anchor items 2x (check `outfitRoleType`)
- Export all functions and types

### 3. Create Cross-Product Matcher Module
- Create `apps/web/lib/matching/cross-product-matcher.ts`
- Define `PairingValidationResult` interface with `isValid`, `score`, `missingCategories`, `issues`
- Implement `findPerfectMatches(product: EnhancedProduct, allProducts: EnhancedProduct[])`:
  - Filter `allProducts` by SKU in `perfectMatchSkus` array
  - If no matches, use `commonPairings` array with score > 70
- Implement `calculatePairingScore(p1: EnhancedProduct, p2: EnhancedProduct)`:
  - Base score from `crossProductCompatibility.pairingScore` (0-100)
  - Check `layerCompatibility`: fitted → structured → loose (+20 if valid)
  - Check `patternMixingSafe`: both false = -50
  - Check `formalityTolerance`: difference > tolerance = -30
- Implement `validateEssentialPairings(outfit: EnhancedProduct[])`:
  - For each item, check `essentialPairings` categories present
  - Return `PairingValidationResult` with missing categories
- Implement `checkLayeringCompatibility(outfit: EnhancedProduct[])`:
  - Extract `layerCompatibility` from outerwear/layering items
  - Validate fitted inside, structured middle, loose outside
  - Return 0-100 score
- Implement `checkOutfitCompleteness(outfit: EnhancedProduct[])`:
  - Check `outfitCompleteness` values
  - Ensure 'needs-top' has top, 'needs-bottom' has bottom
- Export all functions and types

### 4. Create Price Intelligence Optimizer Module
- Create `apps/web/lib/matching/price-intelligence-optimizer.ts`
- Define `PriceOptimizationResult` interface with `outfits`, `savings`, `recommendations`
- Implement `optimizeOutfitBudget(outfits: EnhancedOutfit[], maxBudget: number)`:
  - Filter where total price ≤ maxBudget
  - Sort by total `costPerWear` ascending (best value first)
  - Prioritize `isInvestmentPiece === true` for work occasions
  - Boost score for `isCapsuleWardrobe === true`
- Implement `getValueTierMatch(outfit: EnhancedProduct[])`:
  - Check all items have compatible `valueTier`
  - Acceptable: all exceptional/fair, exceptional+fair
  - Not acceptable: exceptional+overpriced, premium+overpriced
- Implement `calculateOutfitCostPerWear(outfit: EnhancedProduct[])`:
  - Sum `costPerWear` across items
  - Return total and average per item
- Implement `getQualityTierScore(outfit: EnhancedProduct[])`:
  - Average `qualityTier` (1-5) across items
  - Prefer outfits with tier ≥ 3
- Implement `getInvestmentPieceRecommendation(outfit: EnhancedProduct[], occasion: OccasionType)`:
  - For work (formality ≥ 6), prioritize investment pieces
  - For casual (formality ≤ 4), prioritize low `costPerWear`
- Export all functions and types

### 5. Create Social Proof Ranker Module
- Create `apps/web/lib/matching/social-proof-ranker.ts`
- Define `TrendScore` interface with `score`, `status`, `confidence`, `hashtags`
- Implement `rankByTrendStatus(outfits: EnhancedOutfit[])`:
  - Score by trend lifecycle:
    - emerging = 100, peak = 90, trending = 85, timeless = 85
    - stable = 70, classic = 70, revival = 60
    - declining = 40, vintage = 60
  - Average across outfit items, sort descending
- Implement `getTrendConfidence(outfit: EnhancedProduct[])`:
  - Average `trendConfidence` (0-100)
  - Weight anchor items (`outfitRoleType === 'anchor'`) 2x
- Implement `getPopularityScore(outfit: EnhancedProduct[])`:
  - Average `popularityScore` (0-100)
  - Add boost for items with `influencerFeatures > 10`
- Implement `getCelebrityBoost(outfit: EnhancedProduct[], occasion: OccasionType)`:
  - For special occasions (wedding, party), check `celebrityAssociations`
  - Return boost score based on association count
- Implement `getTrendingHashtags(outfit: EnhancedProduct[])`:
  - Extract unique `hashtagTrending` from all items
  - Return count and list
- Export all functions and types

### 6. Create Barrel Export File
- Create `apps/web/lib/matching/index.ts`
- Export all functions and types from:
  - `./thai-cultural-matcher`
  - `./visual-matching-scorer`
  - `./cross-product-matcher`
  - `./price-intelligence-optimizer`
  - `./social-proof-ranker`

### 7. Integrate Matchers into enhanced-outfit-generator.ts
- Import matcher modules from `../matching`
- Add `scoreOutfitWithKB()` function with weighted scoring:
  ```typescript
  function scoreOutfitWithKB(outfit: EnhancedProduct[], context: OutfitContext): number {
    let score = 100
    // Thai cultural (30%), Visual matching (25%), Cross-product (20%)
    // Price intelligence (15%), Social proof (10%)
  }
  ```
- In `generateEnhancedOutfit()`:
  - After categorization, apply Thai cultural filters if occasion is temple/wedding/funeral
  - Apply month-based filtering using current month
  - During pairing, check `getSilhouetteCompatibility()` (skip if < 60)
  - Check `calculatePairingScore()` (skip if < 70)
- In `generateEnhancedOutfits()`:
  - After generating candidates, apply `optimizeOutfitBudget()` if maxPrice set
  - Apply `rankByTrendStatus()` to sort final results
- Add `hasKBAttributes()` helper to check if product has KB data

### 8. Update outfit-combination-rules.ts with KB Rules
- Import matcher functions from `../matching`
- In `validateOutfitComposition()`:
  - Add Thai cultural validation for temple/wedding/funeral occasions
  - Add visual balance check using `calculateVisualBalance()` (warn if < 60)
  - Add pattern mixing safety check using `patternMixingSafe`
- In `deduplicateOutfitCategories()`:
  - Use KB attributes in scoring: prefer items with higher `pairingScore`
- Add new function `validateKBComposition(outfit: Product[], occasion?: OccasionType)`:
  - Combines all KB validation rules
  - Returns comprehensive validation result

### 9. Update product-filters.ts with KB Filters
- Import types from `../types/enums`
- Add `filterByThaiOccasion(products: EnhancedProduct[], occasion: ThaiOccasion)`:
  - Switch statement for each occasion type
  - Uses `thaiContext` attributes for filtering
- Add `filterByTrendStatus(products: EnhancedProduct[], statuses: TrendLifecycle[])`:
  - Filter where `socialProof.trendStatus` matches
- Add `filterByVisualWeight(products: EnhancedProduct[], levels: VisualWeightLevel[])`:
  - Filter where `visualMatching.visualWeightLevel` matches
- Add `filterByMonthSuitability(products: EnhancedProduct[], month: number, minScore: number = 6)`:
  - Filter where `thaiContext.monthSuitability[month] >= minScore`
- Update `applyFilters()` to include new KB filter options

### 10. Enhance ai-chat-service.ts with KB Context
- Import matcher functions from `../matching`
- Add Thai cultural occasion detection:
  - Detect 'วัด'/'temple' → temple occasion
  - Detect 'งานแต่ง'/'wedding' → wedding occasion
  - Detect 'งานศพ'/'funeral' → funeral occasion
  - Detect 'สงกรานต์'/'songkran' → songkran occasion
- Add `detectThaiOccasion(message: string)` function
- In product filtering:
  - Apply `filterByThaiOccasion()` when Thai occasion detected
  - Apply `filterByMonth()` using current month
- Add budget optimization:
  - Use `optimizeOutfitBudget()` when user specifies budget
  - Include cost-per-wear info in AI response
- Add trend context to system prompt:
  - Extract trending items using `getTrendingHashtags()`
  - Include trend status in product descriptions

### 11. Validate TypeScript Compilation and Test
- Run `pnpm exec tsc --noEmit` in apps/web to verify no type errors
- Test Thai cultural filtering with sample products
- Test visual balance scoring with outfit pairs
- Test price intelligence optimization with budget constraints
- Run existing test suite to ensure no regressions

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. TypeScript compilation check
cd /Users/naruechon/OOTD/apps/web && pnpm exec tsc --noEmit

# 2. Verify new matcher files exist
ls -la /Users/naruechon/OOTD/apps/web/lib/matching/

# 3. Check module exports are correct
node -e "
const path = require('path');
const fs = require('fs');
const indexPath = path.join(process.cwd(), 'apps/web/lib/matching/index.ts');
const content = fs.readFileSync(indexPath, 'utf-8');
console.log('Exports found:');
const exports = content.match(/export \* from/g) || [];
console.log('- Total re-exports:', exports.length);
console.log(exports.length >= 5 ? '✅ All modules exported' : '❌ Missing exports');
"

# 4. Run linter on new files
cd /Users/naruechon/OOTD/apps/web && pnpm lint -- --fix apps/web/lib/matching/

# 5. Build the application to verify integration
cd /Users/naruechon/OOTD/apps/web && pnpm build
```

## Notes

### Integration Philosophy
- **Graceful degradation**: If KB attributes missing, fall back to existing logic
- **Weighted scoring**: Combine multiple KB signals (Thai 30%, Visual 25%, Cross 20%, Price 15%, Social 10%)
- **Cultural first**: Thai cultural appropriateness is highest priority for Thai market
- **Progressive enhancement**: Existing outfits still work, KB makes them better

### Performance Considerations
- **Lazy evaluation**: Only calculate KB scores when products have KB attributes
- **Early filtering**: Apply Thai cultural filters early to reduce candidate pool
- **Caching**: Consider caching visual balance and compatibility scores per outfit signature

### Fallback Strategy for v0 Products
Products without KB attributes (v0 format) should:
- **Thai cultural**: Infer from existing attributes (coverage from category, formality for wedding)
- **Visual matching**: Use existing `fitType` and `silhouetteType` as proxies
- **Compatibility**: Use existing `pairingCategories`
- **Price**: Use raw price instead of `costPerWear`
- **Social proof**: Assume neutral trend status (`classic`)

### Type Safety
- All new functions use existing types from `ai-matching-types.ts`, `kb-expansion-types.ts`, `thai-context-types.ts`
- Use type guards like `isProductV1()` from `kb-expansion-types.ts` to check KB availability
- Avoid `any` types - use proper interfaces

### Expected User Experience Impact
- **Culturally appropriate**: 100% temple/wedding/funeral outfits follow Thai norms
- **Better visual balance**: Outfit silhouette scores increase by ~20%
- **Price optimization**: Users save ~15% on cost-per-wear vs raw price
- **Trend awareness**: 80% of recommendations include emerging/peak trends
