# Chore: Implement TypeScript Interfaces for Knowledge Base Expansion

## Metadata
adw_id: `to`
prompt: `implement TypeScript Interface`

## Chore Description

Extend the TypeScript type system to incorporate the 6 new knowledge base sections created during the February 2026 KB expansion. This chore creates type-safe interfaces that enable AI-powered look recommendations and product matching by codifying the vocabulary from:

1. **Visual Matching Intelligence** (KB Section 15)
2. **Outfit Composition Rules** (KB Section 16)
3. **Cross-Product Compatibility** (KB Section 17)
4. **Thai Micro-Season Fashion Calendar** (KB Section 12)
5. **Price Intelligence** (KB Section 13)
6. **Social Proof Signals** (Special Topic)

The implementation extends existing interfaces (`EnhancedProductV3`, `enums.ts`) rather than creating parallel structures, maintaining backward compatibility with current product data.

## Relevant Files

### Existing Type Definitions (to extend)
- `apps/web/lib/types/enums.ts` - Core enum types to extend with new vocabularies
- `apps/web/lib/types/product-types.ts` - `EnhancedProduct` interface (official product model)
- `apps/web/lib/mock-data03.ts` - `EnhancedProductV3` interface (extended attributes)
- `apps/web/lib/types.ts` - Central type exports

### Knowledge Base References
- `data/personas/knowledge_base/implementation/15_visual_matching_intelligence.md` - Visual vocabulary
- `data/personas/knowledge_base/implementation/16_outfit_composition_rules.md` - Outfit formulas
- `data/personas/knowledge_base/implementation/17_cross_product_compatibility.md` - Pairing rules
- `data/personas/knowledge_base/advanced/12_thai_micro_seasons.md` - Thai fashion calendar
- `data/personas/knowledge_base/advanced/13_price_intelligence.md` - Value metrics
- `data/personas/knowledge_base/special/social_proof_signals.md` - Trend indicators

### New Files

- `apps/web/lib/types/ai-matching-types.ts` - AI matching interface definitions
- `apps/web/lib/types/thai-context-types.ts` - Thai cultural context types

## Step by Step Tasks

### 1. Extend Enum Types (enums.ts)

Add new enum types for KB expansion vocabulary:

- Add `SilhouetteShape` enum: `'a-line' | 'h-line' | 'x-line' | 'i-line' | 'o-line' | 'fitted' | 'oversized' | 'boxy' | 'relaxed' | 'structured'`
- Add `VisualWeightLevel` enum: `'light' | 'medium' | 'heavy'`
- Add `ProportionRatio` enum: `'top-heavy' | 'balanced' | 'bottom-heavy'`
- Add `TextureType` enum: `'matte' | 'sheen' | 'glossy' | 'textured' | 'mixed'`
- Add `OutfitRoleType` enum: `'anchor' | 'supporting' | 'accent' | 'statement'`
- Add `ProductRelationship` enum: `'perfect-match' | 'great-pair' | 'works-well' | 'acceptable' | 'avoid'`
- Add `TrendLifecycle` enum: `'emerging' | 'trending' | 'peak' | 'classic' | 'timeless' | 'declining' | 'revival'`
- Add `PopularityTier` enum: `'viral' | 'hot' | 'popular' | 'steady' | 'niche' | 'new'`
- Add `ThaiMonth` enum: `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12`
- Add `ThaiDayOfWeek` enum: `'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'`
- Add `CostPerWearTier` enum: `'excellent' | 'good' | 'moderate' | 'poor'`

### 2. Create Thai Context Types (thai-context-types.ts)

Create new file with Thai cultural context interfaces:

- Define `ThaiDayColor` interface mapping days to auspicious colors
- Define `ThaiClimateContext` interface with:
  - `thaiClimateRating`: 1-10 suitability score
  - `acFriendly`: boolean for AC environment
  - `monthSuitability`: number[] (12 values, Jan-Dec)
  - `templeAppropriate`: boolean
  - `weddingAppropriate`: 'any' | 'morning' | 'evening' | 'outdoor' | 'indoor'
  - `funeralAppropriate`: boolean
  - `songkranSuitable`: 'temple-morning' | 'water-play' | 'both' | 'neither'
  - `loyKrathongSuitable`: boolean
  - `coverage`: { shoulders, knees } for temple compliance
- Define `ThaiFortuneColors` interface with birth day lucky colors
- Create helper functions: `getLuckyColorsForDay()`, `isLuckyColorForDay()`, `shouldAvoidColorForDay()`

### 3. Create AI Matching Types (ai-matching-types.ts)

Create new file with AI matching interfaces:

- Define `VisualMatchingAttributes` interface:
  - `silhouetteShape`: SilhouetteShape
  - `visualWeightScore`: 1-10
  - `visualWeightLevel`: VisualWeightLevel
  - `proportionRatio`: ProportionRatio
  - `proportionEffect`: { torsoLengthening, legLengthening, heightEffect, widthEffect }
  - `patternComplexity`: 1-10
  - `textureType`: TextureType
  - `outfitRoleType`: OutfitRoleType
  - `thaiProportionScore`: 1-10 (for Thai body frames)
  - `statementPotential`: boolean
  - `styleMoods`: string[]

- Define `CrossProductCompatibility` interface:
  - `pairingScore`: 0-100
  - `essentialPairings`: string[] (required companions)
  - `avoidPairings`: string[]
  - `versatilityScore`: 1-10
  - `layerCompatibility`: ('fitted' | 'structured' | 'loose')[]
  - `outfitCompleteness`: 'standalone' | 'needs-top' | 'needs-bottom' | 'needs-both'
  - `formalityTolerance`: number (±range for pairing)
  - `patternMixingSafe`: boolean
  - `perfectMatchSkus`: string[]

- Define `PriceIntelligence` interface:
  - `costPerWear`: number
  - `costPerWearTier`: CostPerWearTier
  - `investmentScore`: 0-100
  - `qualityTier`: 1-5
  - `timelessScore`: 1-10
  - `isInvestmentPiece`: boolean
  - `isCapsuleWardrobe`: boolean
  - `saleLikelihood`: 'rare' | 'seasonal' | 'frequent'
  - `bestPurchaseTiming`: string

- Define `SocialProofSignals` interface:
  - `popularityScore`: 0-100
  - `popularityTier`: PopularityTier
  - `trendStatus`: TrendLifecycle
  - `trendConfidence`: 0-100
  - `celebrityAssociations`: string[]
  - `hashtagTrending`: string[]
  - `reviewSentiment`: 0-100
  - `reviewCount`: number
  - `recommendRate`: 0-100
  - `influencerFeatures`: number

### 4. Extend EnhancedProductV3 Interface (mock-data03.ts)

Add 5 optional attribute groups to `EnhancedProductV3`:

- Add `thaiContext?: ThaiClimateContext` (KB Expansion Feb 2026)
- Add `visualMatching?: VisualMatchingAttributes` (KB Expansion Feb 2026)
- Add `crossProductCompatibility?: CrossProductCompatibility` (KB Expansion Feb 2026)
- Add `priceIntelligence?: PriceIntelligence` (KB Expansion Feb 2026)
- Add `socialProof?: SocialProofSignals` (KB Expansion Feb 2026)

Import new type modules at file top.

### 5. Add Example Product Data (mock-data03.ts)

Extend CG001 (Classic White Button Shirt) with all 5 new attribute groups:

- Add `thaiContext` with Thai climate, cultural, and festival appropriateness
- Add `visualMatching` with silhouette, visual weight, and proportion data
- Add `crossProductCompatibility` with pairing rules and perfect matches
- Add `priceIntelligence` with cost-per-wear and investment metrics
- Add `socialProof` with popularity and trend indicators

This serves as the reference implementation for enriching other products.

### 6. Update Central Type Exports (types.ts)

- Export `thai-context-types` module
- Export `ai-matching-types` module
- Add KB Expansion Feb 2026 label comments

### 7. Validate Type Consistency

- Run TypeScript compiler to verify no type errors
- Verify imports resolve correctly across modules
- Check that optional properties don't break existing product data
- Confirm all enum values align with KB documentation vocabulary

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compilation succeeds
- `ls -la apps/web/lib/types/` - Verify ai-matching-types.ts and thai-context-types.ts exist
- `grep -c "ThaiClimateContext\|VisualMatchingAttributes\|CrossProductCompatibility\|PriceIntelligence\|SocialProofSignals" apps/web/lib/mock-data03.ts` - Verify 5+ references
- `grep "KB Expansion Feb 2026" apps/web/lib/types.ts` - Verify export labels exist
- `grep -c "thaiContext\|visualMatching\|crossProductCompatibility\|priceIntelligence\|socialProof" apps/web/lib/mock-data03.ts` - Verify CG001 has all 5 attributes (should return 5+)

## Notes

### Design Philosophy

This implementation follows TypeScript best practices:
- **Optional Properties**: New attributes are optional (`?:`) to maintain backward compatibility
- **Grouped Interfaces**: Related attributes are grouped into semantic interfaces
- **Enum Types**: Fixed vocabularies use union types for type safety
- **Helper Functions**: Thai-specific logic encapsulated in utility functions
- **Documentation**: JSDoc comments link types to KB section numbers

### Type Statistics After Completion

- New Enum Types: 11
- New Interfaces: 6 (ThaiClimateContext, ThaiDayColor, ThaiFortuneColors, VisualMatchingAttributes, CrossProductCompatibility, PriceIntelligence, SocialProofSignals)
- New Type Files: 2 (thai-context-types.ts, ai-matching-types.ts)
- Extended Interface: 1 (EnhancedProductV3 with 5 new optional groups)
- Example Product Enriched: 1 (CG001)

### Integration with Knowledge Base

Each interface maps to specific KB sections:
| Interface | KB Section(s) |
|-----------|---------------|
| ThaiClimateContext | 01, 02, 07, 12 |
| VisualMatchingAttributes | 15 |
| CrossProductCompatibility | 17 |
| PriceIntelligence | 13 |
| SocialProofSignals | Special Topics |

### Future Considerations

- These types enable vector embedding generation for semantic product search
- Cross-product compatibility scores can power outfit recommendation algorithms
- Thai context types support festival-aware styling suggestions
- Social proof signals enable trend-responsive product ranking
