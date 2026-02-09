# Chore: Integrate KB Expansion Attributes with AI Matching Algorithms

## Metadata
adw_id: `kb003`
prompt: `Integrate กับ AI matching algorithms - use KB expansion attributes in outfit generation and recommendation logic`

## Chore Description

This chore integrates the 120 KB expansion attributes into the AI-powered outfit generation and recommendation system. The goal is to leverage Thai cultural context, visual matching intelligence, cross-product compatibility, price intelligence, and social proof signals to create more accurate, culturally appropriate, and personalized outfit recommendations.

### Current State
The outfit generation system currently uses:
- **Basic product attributes** (9 fields from product_master.json)
- **Enriched attributes** (inferred from product names via enrichProductData)
- **Pinterest 2026 trends** (outfit-combination-rules.ts)
- **Color palette matching** (color-palette-matcher.ts)
- **Gender-aware filtering** (product-filters.ts)
- **Formality matching** (±2 tolerance on 1-10 scale)

### Target State
Enhanced outfit generation leveraging KB attributes:
1. **Thai Cultural Appropriateness**
   - Temple/wedding/funeral outfit validation using `thaiContext`
   - Songkran/Loy Krathong festival recommendations
   - Chinese New Year color rules (red/gold encouraged, black/white avoided)
   - Thai day colors for auspicious occasions
   - Month-specific suitability (hot/cool/rainy season micro-seasonality)

2. **Visual Matching Intelligence**
   - Silhouette balancing (fitted + relaxed, low + high volume)
   - Proportion effect matching (leg-lengthening + torso-lengthening balance)
   - Visual weight distribution (lightweight top + heavyweight bottom)
   - Thai body proportion optimization (thaiProportionScore)
   - Pattern complexity mixing (simple + complex = visual interest)

3. **Cross-Product Compatibility**
   - Perfect match SKU recommendations (perfectMatchSkus)
   - Pairing score thresholds (only pair products with score > 70)
   - Essential pairing validation (ensure all essentialPairings present)
   - Layering compatibility rules (fitted → structured → loose)
   - Pattern mixing safety (only mix if both patternMixingSafe = true)

4. **Price Intelligence**
   - Budget optimization (costPerWear instead of raw price)
   - Investment piece prioritization for work outfits
   - Capsule wardrobe recommendations
   - Value tier matching (don't mix "exceptional" with "overpriced")
   - Sale timing recommendations

5. **Social Proof Signals**
   - Trend-aware recommendations (prioritize "emerging" and "peak")
   - Celebrity/influencer associations for special occasions
   - Popularity boosting for low-confidence users
   - Hashtag trend integration (#thaistreetfashion, #bangkokstyle)

### Dependencies
- **Prerequisites**:
  - chore-kb001 completed (product_master_v1.json exists)
  - chore-kb002 completed (server-product-loader.ts supports KB attributes)
- **Blocks**: None (this is the final integration step)

## Relevant Files

### Files to Modify

#### apps/web/lib/enhanced-outfit-generator.ts (488 lines)
Current responsibilities:
- Generate outfit combinations from filtered products
- Apply Pinterest 2026 trend-based strategies
- Gender-aware footwear validation
- Deduplication via SKU signatures

Required changes:
- Add KB attribute-based filtering and scoring
- Implement Thai cultural validation
- Visual matching intelligence for outfit balancing
- Cross-product compatibility checking
- Price intelligence optimization

#### apps/web/lib/styling/outfit-combination-rules.ts (976 lines)
Current responsibilities:
- Pinterest 2026 aesthetic-based combinations
- Color palette matching
- Formality level enforcement
- Category conflict prevention (no dress + top)

Required changes:
- Add Thai context validation rules
- Silhouette balancing rules
- Visual weight distribution rules
- Pattern mixing safety checks
- Layering compatibility validation

#### apps/web/lib/services/ai-chat-service.ts (extensive)
Current responsibilities:
- OpenRouter AI integration
- RAG-based knowledge retrieval
- Query analysis and product filtering
- Outfit generation orchestration

Required changes:
- Extract KB attributes for prompt enhancement
- Thai cultural occasion detection (temple visit, wedding guest, Songkran)
- Budget optimization using costPerWear
- Trend awareness using socialProof

#### apps/web/lib/utils/product-filters.ts (816 lines)
Current responsibilities:
- Gender filtering
- Price range filtering
- Occasion filtering
- Availability filtering
- Formality matching

Required changes:
- Add Thai cultural filters (templeAppropriate, weddingAppropriate, etc.)
- Month-specific filtering (monthSuitability array)
- Visual matching filters (silhouette, visual weight)
- Trend status filtering

### Files to Create

#### apps/web/lib/matching/thai-cultural-matcher.ts
New module for Thai cultural appropriateness validation:
```typescript
/**
 * Validate outfit for Thai cultural occasions
 */
export function validateThaiOccasion(
  outfit: EnhancedProduct[],
  occasion: ThaiOccasion
): ThaiValidationResult {
  // Temple: covered shoulders/knees, no black
  // Wedding: avoid white, color depends on wedding type
  // Funeral: all black, modest
  // Songkran: quick-dry, dark colors
  // Loy Krathong: traditional Thai colors
  // CNY: red/gold encouraged, avoid black/white/blue
}

export function getMonthSuitability(
  product: EnhancedProduct,
  month: number
): number {
  // Return 1-10 score from monthSuitability array
}

export function checkThaiDayColor(
  product: EnhancedProduct,
  date: Date
): boolean {
  // Check if product color matches auspicious day
}
```

#### apps/web/lib/matching/visual-matching-scorer.ts
New module for visual matching intelligence:
```typescript
/**
 * Calculate visual balance score for outfit
 */
export function calculateVisualBalance(
  outfit: EnhancedProduct[]
): VisualBalanceScore {
  // Silhouette balance: fitted + relaxed
  // Volume balance: low + high = medium overall
  // Visual weight distribution: top-heavy vs bottom-heavy
  // Proportion effect: complementary lengthening effects
  // Pattern complexity mixing
}

export function getSilhouetteCompatibility(
  product1: EnhancedProduct,
  product2: EnhancedProduct
): number {
  // Returns 0-100 score based on silhouette rules
}

export function getThaiProportionScore(
  outfit: EnhancedProduct[]
): number {
  // Average thaiProportionScore across all items
}
```

#### apps/web/lib/matching/cross-product-matcher.ts
New module for cross-product compatibility:
```typescript
/**
 * Find perfect matches for a product
 */
export function findPerfectMatches(
  product: EnhancedProduct,
  allProducts: EnhancedProduct[]
): EnhancedProduct[] {
  // Filter by perfectMatchSkus
  // Fallback to commonPairings if no perfect matches
}

export function calculatePairingScore(
  product1: EnhancedProduct,
  product2: EnhancedProduct
): number {
  // Use crossProductCompatibility.pairingScore
  // Consider layerCompatibility
  // Check patternMixingSafe
}

export function validateEssentialPairings(
  outfit: EnhancedProduct[]
): ValidationResult {
  // Ensure each item's essentialPairings are satisfied
}
```

#### apps/web/lib/matching/price-intelligence-optimizer.ts
New module for price intelligence:
```typescript
/**
 * Optimize outfit for budget using cost-per-wear
 */
export function optimizeOutfitBudget(
  outfits: Outfit[],
  maxBudget: number
): Outfit[] {
  // Sort by total costPerWear instead of raw price
  // Prioritize investment pieces for work occasions
  // Prefer capsule wardrobe items for minimalist users
}

export function getValueTierMatch(
  outfit: EnhancedProduct[]
): boolean {
  // Check if all items in similar valueTier
  // Avoid mixing "exceptional" with "overpriced"
}

export function calculateOutfitCostPerWear(
  outfit: EnhancedProduct[]
): number {
  // Sum costPerWear of all items
}
```

#### apps/web/lib/matching/social-proof-ranker.ts
New module for social proof ranking:
```typescript
/**
 * Rank outfits by trend and popularity
 */
export function rankByTrendStatus(
  outfits: Outfit[]
): Outfit[] {
  // Prioritize "emerging" and "peak" trends
  // Deprioritize "declining" trends
  // Timeless items always ranked high
}

export function getTrendConfidence(
  outfit: EnhancedProduct[]
): number {
  // Average trendConfidence across all items
}

export function getInfluencerBoost(
  outfit: EnhancedProduct[]
): number {
  // Sum influencerFeatures for social proof
}
```

### Reference Files (No Changes)
- **data/personas/knowledge_base/implementation/15_visual_matching_intelligence.md** - Visual matching rules reference
- **data/personas/knowledge_base/implementation/16_outfit_composition_rules.md** - Outfit composition guidelines
- **data/personas/knowledge_base/implementation/17_cross_product_compatibility.md** - Pairing rules
- **data/personas/knowledge_base/advanced/12_thai_micro_seasons.md** - Thai cultural context
- **data/personas/knowledge_base/advanced/13_price_intelligence.md** - Price intelligence logic

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Thai Cultural Matcher Module
- Create `apps/web/lib/matching/thai-cultural-matcher.ts`:
  - Implement `validateThaiOccasion(outfit, occasion)`:
    - **Temple**: Check all items have `templeAppropriate: true`, `coverage.shoulders: "covered"`, `coverage.knees: "covered"`
    - **Wedding**: Check `weddingAppropriate !== "none"`, avoid white dresses, check formality ≥ 7
    - **Funeral**: Check `funeralAppropriate: true`, all items black or dark colors
    - **Songkran**: Check `songkranSuitable === "water-play"` or `"both"`, quick-dry materials
    - **Loy Krathong**: Check `loyKrathongSuitable: true`, traditional colors preferred
    - **Chinese New Year**: Check `cnySuitable === "suitable"`, red/gold colors encouraged
  - Implement `filterByMonth(products, month)`:
    - Filter products where `monthSuitability[month] >= 6`
    - Sort by monthSuitability score descending
  - Implement `checkThaiDayColor(product, date)`:
    - Map date to Thai day of week
    - Check if product color in `thaiDayColors` array
  - Add Thai climate scoring:
    - Prefer `acFriendly: true` for indoor occasions (work, cafe)
    - Use `thaiClimateRating` for outdoor vs indoor decision

### 2. Create Visual Matching Scorer Module
- Create `apps/web/lib/matching/visual-matching-scorer.ts`:
  - Implement `calculateVisualBalance(outfit)`:
    - **Silhouette balance**: Count fitted vs relaxed items, score = 100 if balanced
    - **Volume balance**: Sum silhouetteVolume (low=1, medium=2, high=3), prefer total 4-6 for 2-item outfit
    - **Visual weight**: Check top vs bottom weight, avoid both heavyweight or both lightweight
    - **Proportion effect**: Sum torsoLengthening and legLengthening, prefer complementary effects
    - **Pattern complexity**: Max one complex pattern (complexity > 7) per outfit
  - Implement `getSilhouetteCompatibility(p1, p2)`:
    - Fitted + Relaxed = 100 (perfect)
    - Fitted + Fitted = 70 (acceptable if same silhouetteShape)
    - Relaxed + Relaxed = 50 (avoid unless both fluid)
    - Use visual weight to refine score
  - Implement `validateProportionEffects(outfit)`:
    - Check if proportion effects are complementary
    - Leg-lengthening bottom + neutral top = good
    - Torso-lengthening top + high-waisted bottom = good
    - Both torso-lengthening = bad (unbalanced)
  - Implement `getThaiProportionScore(outfit)`:
    - Average `thaiProportionScore` across items
    - Weight by outfit role (anchor items weighted 2x)
  - Add pattern mixing rules:
    - Check `patternComplexity` across items
    - Max 1 item with complexity > 7
    - If mixing patterns, ensure `patternMixingSafe: true` for both

### 3. Create Cross-Product Matcher Module
- Create `apps/web/lib/matching/cross-product-matcher.ts`:
  - Implement `findPerfectMatches(product, allProducts)`:
    - Filter allProducts by SKU in `perfectMatchSkus` array
    - If no perfect matches, use `commonPairings` array
    - Sort by pairing relationship score
  - Implement `calculatePairingScore(p1, p2)`:
    - Base score from `crossProductCompatibility.pairingScore`
    - Check `layerCompatibility`: fitted → structured → loose (score +20 if valid sequence)
    - Check `patternMixingSafe`: if both false, score -50
    - Check `formalityTolerance`: if formality difference > tolerance, score -30
  - Implement `validateEssentialPairings(outfit)`:
    - For each item, check if `essentialPairings` categories present in outfit
    - Return validation result with missing categories
  - Implement `checkLayeringCompatibility(outfit)`:
    - Extract layerCompatibility from all outerwear/layering items
    - Validate sequence: fitted inside, structured middle, loose outside
    - Return score 0-100
  - Add outfit completeness check:
    - Check each item's `outfitCompleteness`
    - Ensure "needs-top" has top, "needs-bottom" has bottom, etc.

### 4. Create Price Intelligence Optimizer Module
- Create `apps/web/lib/matching/price-intelligence-optimizer.ts`:
  - Implement `optimizeOutfitBudget(outfits, maxBudget)`:
    - Sort outfits by total `costPerWear` instead of raw price
    - Filter where total price ≤ maxBudget
    - Prioritize outfits with `isInvestmentPiece: true` for work occasions
    - Boost score for `isCapsuleWardrobe: true` items
  - Implement `getValueTierMatch(outfit)`:
    - Check if all items have similar `valueTier`
    - Acceptable combinations:
      - All "exceptional" or "fair" = true
      - "exceptional" + "fair" = true
      - "premium" + "overpriced" = false
      - "exceptional" + "overpriced" = false
  - Implement `calculateOutfitCostPerWear(outfit)`:
    - Sum `costPerWear` across all items
    - Divide by outfit item count for average
  - Implement `getQualityTierScore(outfit)`:
    - Average `qualityTier` (1-5) across items
    - Prefer outfits with tier ≥ 3
  - Add investment piece logic:
    - For work occasions (formality ≥ 6), prioritize `isInvestmentPiece: true`
    - For casual (formality ≤ 4), prioritize `costPerWear` < ฿30

### 5. Create Social Proof Ranker Module
- Create `apps/web/lib/matching/social-proof-ranker.ts`:
  - Implement `rankByTrendStatus(outfits)`:
    - Score by trend lifecycle:
      - "emerging" = 100 (highest priority for trend-forward users)
      - "peak" = 90 (currently trending)
      - "stable" = 70 (mainstream)
      - "timeless" = 85 (always safe choice)
      - "declining" = 40 (avoid unless vintage aesthetic)
      - "vintage" = 60 (specific aesthetic)
    - Sort outfits by average trendStatus score
  - Implement `getTrendConfidence(outfit)`:
    - Average `trendConfidence` (0-100) across items
    - Weight by `outfitRoleType`: anchor items 2x weight
  - Implement `getPopularityScore(outfit)`:
    - Average `popularityScore` (0-100)
    - Boost for items with `influencerFeatures > 10`
  - Implement `getCelebrityBoost(outfit, occasion)`:
    - For special occasions (wedding, party), check `celebrityAssociations`
    - Return boost score based on association count
  - Add hashtag trending logic:
    - Extract `hashtagTrending` from all items
    - Count unique hashtags
    - Boost score for outfits with 5+ trending hashtags

### 6. Integrate Matchers into enhanced-outfit-generator.ts
- In `generateOutfitsWithEnhancedFiltering()`:
  - **Step 1**: Apply Thai cultural filters
    ```typescript
    if (occasion === 'temple') {
      products = products.filter(p => p.thaiContext?.templeAppropriate === true)
    }
    ```
  - **Step 2**: Month-based filtering
    ```typescript
    const currentMonth = new Date().getMonth()
    products = filterByMonth(products, currentMonth)
    ```
  - **Step 3**: Visual matching during pairing
    ```typescript
    const compatScore = getSilhouetteCompatibility(top, bottom)
    if (compatScore < 60) continue // Skip incompatible pairs
    ```
  - **Step 4**: Cross-product validation
    ```typescript
    const pairingScore = calculatePairingScore(top, bottom)
    if (pairingScore < 70) continue
    ```
  - **Step 5**: Price optimization
    ```typescript
    outfits = optimizeOutfitBudget(outfits, userBudget)
    ```
  - **Step 6**: Social proof ranking
    ```typescript
    outfits = rankByTrendStatus(outfits)
    ```

### 7. Update outfit-combination-rules.ts with KB Rules
- Add Thai cultural validation in `validateOutfitComposition()`:
  ```typescript
  // Check temple appropriateness
  if (occasion === 'temple') {
    const allAppropriate = outfit.every(p => p.thaiContext?.templeAppropriate)
    if (!allAppropriate) {
      validationErrors.push('Not all items temple-appropriate')
    }
  }
  ```
- Add visual balance check:
  ```typescript
  const visualBalance = calculateVisualBalance(outfit)
  if (visualBalance.score < 60) {
    validationErrors.push('Poor visual balance')
  }
  ```
- Add pattern mixing safety:
  ```typescript
  const patterns = outfit.filter(p => p.visualMatching?.patternComplexity > 5)
  if (patterns.length > 1) {
    const allSafe = patterns.every(p => p.crossProductCompatibility?.patternMixingSafe)
    if (!allSafe) {
      validationErrors.push('Unsafe pattern mixing')
    }
  }
  ```

### 8. Update product-filters.ts with KB Filters
- Add `filterByThaiOccasion(products, occasion)`:
  ```typescript
  export function filterByThaiOccasion(
    products: EnhancedProduct[],
    occasion: ThaiOccasion
  ): EnhancedProduct[] {
    switch (occasion) {
      case 'temple':
        return products.filter(p => p.thaiContext?.templeAppropriate === true)
      case 'wedding':
        return products.filter(p => p.thaiContext?.weddingAppropriate !== 'none')
      case 'funeral':
        return products.filter(p => p.thaiContext?.funeralAppropriate === true)
      // ... other occasions
    }
  }
  ```
- Add `filterByTrendStatus(products, status)`:
  ```typescript
  export function filterByTrendStatus(
    products: EnhancedProduct[],
    status: TrendLifecycle[]
  ): EnhancedProduct[] {
    return products.filter(p =>
      status.includes(p.socialProof?.trendStatus as TrendLifecycle)
    )
  }
  ```
- Add `filterByVisualWeight(products, weightLevel)`:
  ```typescript
  export function filterByVisualWeight(
    products: EnhancedProduct[],
    weightLevel: VisualWeightLevel[]
  ): EnhancedProduct[] {
    return products.filter(p =>
      weightLevel.includes(p.visualMatching?.visualWeightLevel as VisualWeightLevel)
    )
  }
  ```

### 9. Enhance ai-chat-service.ts with KB Context
- In query analysis, detect Thai cultural occasions:
  ```typescript
  if (query.includes('วัด') || query.includes('temple')) {
    occasion = 'temple'
    products = filterByThaiOccasion(products, 'temple')
  }
  if (query.includes('งานแต่ง') || query.includes('wedding')) {
    occasion = 'wedding'
    products = filterByThaiOccasion(products, 'wedding')
  }
  ```
- Add budget optimization using costPerWear:
  ```typescript
  if (userBudget) {
    outfits = optimizeOutfitBudget(outfits, userBudget)
    // Add AI context: "Optimized for cost-per-wear"
  }
  ```
- Add trend awareness to prompt:
  ```typescript
  const trendContext = `Current trends: ${getTrendingItems(products).join(', ')}`
  systemPrompt += `\n\n${trendContext}`
  ```

### 10. Add KB Attribute Scoring to Outfit Generation
- Create unified scoring function in `enhanced-outfit-generator.ts`:
  ```typescript
  function scoreOutfitWithKB(outfit: EnhancedProduct[], context: OutfitContext): number {
    let score = 100

    // Thai cultural appropriateness (weight: 30%)
    const thaiValidation = validateThaiOccasion(outfit, context.occasion)
    score += thaiValidation.score * 0.3

    // Visual matching (weight: 25%)
    const visualBalance = calculateVisualBalance(outfit)
    score += visualBalance.score * 0.25

    // Cross-product compatibility (weight: 20%)
    const compatScore = calculateOutfitCompatibility(outfit)
    score += compatScore * 0.20

    // Price intelligence (weight: 15%)
    const priceScore = calculatePriceScore(outfit, context.budget)
    score += priceScore * 0.15

    // Social proof (weight: 10%)
    const trendScore = getTrendConfidence(outfit)
    score += trendScore * 0.10

    return Math.min(100, Math.max(0, score))
  }
  ```

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. TypeScript compilation
cd /Users/naruechon/OOTD/apps/web
pnpm exec tsc --noEmit

# 2. Run unit tests for new matchers
pnpm test -- matching/

# 3. Test Thai cultural filtering
node -e "
const { filterByThaiOccasion } = require('./lib/utils/product-filters');
const { loadProductsServerSide } = require('./lib/server-product-loader');
loadProductsServerSide().then(products => {
  const templeItems = filterByThaiOccasion(products, 'temple');
  console.log('Temple-appropriate items:', templeItems.length);
  console.log('Sample:', templeItems[0]?.name);
});
"

# 4. Test visual balance scoring
node -e "
const { calculateVisualBalance } = require('./lib/matching/visual-matching-scorer');
const testOutfit = [
  { visualMatching: { silhouetteFit: 'fitted', silhouetteVolume: 'low', visualWeightScore: 3 } },
  { visualMatching: { silhouetteFit: 'relaxed', silhouetteVolume: 'high', visualWeightScore: 7 } }
];
const balance = calculateVisualBalance(testOutfit);
console.log('Visual balance score:', balance.score);
"

# 5. Test price intelligence optimization
node -e "
const { optimizeOutfitBudget } = require('./lib/matching/price-intelligence-optimizer');
const testOutfits = [
  { items: [{ priceIntelligence: { costPerWear: 50 } }], totalPrice: 2000 },
  { items: [{ priceIntelligence: { costPerWear: 20 } }], totalPrice: 1500 }
];
const optimized = optimizeOutfitBudget(testOutfits, 2000);
console.log('Optimized outfits:', optimized.length);
"

# 6. Integration test - temple visit outfit
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "อยากได้ชุดไปวัดวันนี้",
    "userId": "test-user"
  }'
# Should return outfits with templeAppropriate: true

# 7. Integration test - wedding guest outfit
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "ชุดไปงานแต่งงานเพื่อน budget 5000 บาท",
    "userId": "test-user"
  }'
# Should return outfits with weddingAppropriate !== 'none' and optimized costPerWear

# 8. Check console logs for KB attribute usage
# After running the app, search logs for:
# - "Thai cultural filter applied"
# - "Visual balance score"
# - "Cross-product compatibility check"
# - "Price optimization active"
# - "Trend ranking applied"
```

## Notes

### Integration Philosophy
- **Graceful degradation**: If KB attributes missing, fall back to existing logic
- **Weighted scoring**: Combine multiple KB signals for holistic outfit scoring
- **Cultural first**: Thai cultural appropriateness is highest priority (30% weight)
- **Progressive enhancement**: Existing outfits still work, KB makes them better

### Performance Optimization
- **Lazy evaluation**: Only calculate KB scores when products have KB attributes
- **Caching**: Cache visual balance and compatibility scores per outfit signature
- **Early filtering**: Apply Thai cultural filters early to reduce candidate pool
- **Parallel scoring**: Calculate all KB scores in parallel where possible

### User Experience Impact
Expected improvements:
- **Culturally appropriate**: 100% temple/wedding/funeral outfits follow Thai norms
- **Better visual balance**: Outfit silhouette scores increase by ~20%
- **Price optimization**: Users save ~15% on cost-per-wear vs raw price
- **Trend awareness**: 80% of recommendations include emerging/peak trends
- **Perfect matches**: When available, 50% of outfits use perfectMatchSkus

### Fallback Strategy
For products without KB attributes (v0 format):
- **Thai cultural**: Infer from existing attributes (coverage from category, formality for wedding)
- **Visual matching**: Use existing fitType and silhouetteType as proxies
- **Compatibility**: Use existing pairingCategories
- **Price**: Use raw price instead of costPerWear
- **Social proof**: Assume neutral trend status

### Logging and Monitoring
Add detailed logging for:
- KB attribute usage rate (% of products with KB vs without)
- Filter effectiveness (how many products filtered by each KB filter)
- Score distribution (histogram of outfit KB scores)
- Fallback frequency (how often v0 fallback logic used)
- Performance metrics (KB scoring time per outfit)

### Future Enhancements
After this chore, potential next steps:
- **User preference learning**: Capture user selections to refine KB scoring weights
- **Seasonal trending**: Update trendStatus monthly based on actual sales data
- **A/B testing**: Compare KB-enhanced vs baseline recommendations
- **Real-time social proof**: Fetch live hashtag trending data from Instagram/TikTok
- **Collaborative filtering**: Use commonPairings to learn from other users' outfits
