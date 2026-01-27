# Chore: Integrate Enhanced Mock Products into Outfit Recommendation System

## Metadata
adw_id: `1b20493d`
prompt: `Integrate enhancedMockProducts from apps/web/lib/mock-data02.ts into the outfit recommendation system. Update apps/web/lib/outfit-generator.ts to use the new fashion attributes (styleTags, formalityLevel, colorTone, pairingCategories, aesthetic) for smarter outfit matching. When generating outfits, use pairingCategories to validate item compatibility, match colorTone for color harmony, and ensure formalityLevel consistency across outfit items. Export a new function generateEnhancedOutfits that leverages these attributes.`

## Chore Description
This chore integrates the newly created `EnhancedMockProduct` data from `mock-data02.ts` into the outfit recommendation engine. The enhanced products contain 14 fashion-specific attributes that can significantly improve outfit matching logic:

1. **Style Tags** (`styleTags: StyleTag[]`): Multi-dimensional style classification (e.g., 'classic', 'minimalist', 'corporate-chic')
2. **Formality Level** (`formalityLevel: 1-10`): Numeric scale for formality matching
3. **Color Tone** (`colorTone: 'warm' | 'cool' | 'neutral'`): Color temperature for harmony
4. **Pairing Categories** (`pairingCategories: string[]`): Valid item pairings (e.g., 'Pants', 'Skirt', 'Blazer')
5. **Aesthetic** (`aesthetic: AestheticCategory`): Pinterest 2026 aesthetic classification
6. **Outfit Role** (`outfitRole: OutfitRole`): Product's role in outfit (top, bottom, dress, outerwear, footwear, accessory)

The new `generateEnhancedOutfits` function will:
- Validate item compatibility using `pairingCategories`
- Match `colorTone` across items for color harmony
- Ensure `formalityLevel` consistency (within ±2 levels)
- Leverage `styleTags` for style coherence
- Use `outfitRole` for proper outfit composition

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify

- **`apps/web/lib/outfit-generator.ts`** - Main outfit generation logic. Add new `generateEnhancedOutfits` function and helper utilities for enhanced attribute matching.

- **`apps/web/lib/mock-data02.ts`** - Source of `EnhancedMockProduct` interface and `enhancedMockProducts` array. Contains 14 products with comprehensive fashion attributes.

- **`apps/web/lib/styling/outfit-combination-rules.ts`** - Outfit composition validation and deduplication logic. May need updates to leverage new attributes in scoring.

- **`apps/web/lib/styling/color-palette-matcher.ts`** - Color detection and palette matching. Add support for `colorTone` attribute matching.

- **`apps/web/lib/types/enums.ts`** - Contains type definitions for `StyleTag`, `FormalityLevel`, `OutfitRole`, `AestheticCategory`, etc.

- **`apps/web/lib/types.ts`** - Main type exports. May need to re-export `EnhancedMockProduct` for broader use.

### Files for Reference (Read-Only)

- **`apps/web/lib/styling/pinterest-2026-trends.ts`** - Aesthetic definitions and trending patterns
- **`apps/web/lib/types/product-types.ts`** - Product type definitions

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Export EnhancedMockProduct Types from Main Types File
- Add re-export for `EnhancedMockProduct` and `ColorTone` from `mock-data02.ts` to `apps/web/lib/types.ts`
- Ensure the enhanced types are accessible throughout the application

### 2. Add Color Tone Matching Utilities to Color Palette Matcher
- Add new function `areColorTonesCompatible(tone1: ColorTone, tone2: ColorTone): boolean` in `color-palette-matcher.ts`
- Define compatibility rules:
  - `neutral` is compatible with both `warm` and `cool`
  - `warm` is compatible with `warm` and `neutral`
  - `cool` is compatible with `cool` and `neutral`
  - `warm` and `cool` are less compatible (return false)
- Add function `getProductColorTone(product: EnhancedMockProduct): ColorTone` that returns the `colorTone` attribute

### 3. Add Formality Level Matching Utilities to Outfit Generator
- Add constant `FORMALITY_TOLERANCE = 2` for acceptable formality range
- Add function `isFormalityCompatible(level1: FormalityLevel, level2: FormalityLevel): boolean`
  - Returns `true` if difference between levels is within `FORMALITY_TOLERANCE`
- Add function `calculateAverageFormalityLevel(items: EnhancedMockProduct[]): number`

### 4. Add Pairing Category Validation to Outfit Generator
- Add function `validatePairingCompatibility(product1: EnhancedMockProduct, product2: EnhancedMockProduct): boolean`
  - Check if `product1.pairingCategories` includes `product2.subCategory` or vice versa
  - Check if `product1.pairingCategories` includes a match for `product2.outfitRole`
- Add function `findCompatiblePairings(product: EnhancedMockProduct, candidates: EnhancedMockProduct[]): EnhancedMockProduct[]`
  - Filter candidates based on pairing validation

### 5. Add Style Tag Matching Utilities
- Add function `calculateStyleOverlap(tags1: StyleTag[], tags2: StyleTag[]): number`
  - Returns percentage of overlapping style tags (0 to 1)
- Add function `hasCommonStyleTag(items: EnhancedMockProduct[]): boolean`
  - Returns `true` if at least one style tag is shared across all items

### 6. Implement Enhanced Product Scoring Function
- Add function `scoreEnhancedProductForOutfit(product: EnhancedMockProduct, context: EnhancedOutfitContext): number`
  - Context includes: `targetAesthetic`, `targetFormality`, `colorTone`, `existingStyleTags`
  - Scoring weights:
    - Aesthetic match: 25%
    - Formality match: 25%
    - Color tone match: 20%
    - Style tag overlap: 15%
    - Pairing compatibility: 15%

### 7. Implement generateEnhancedOutfits Function
- Create main function `generateEnhancedOutfits(products: EnhancedMockProduct[], options: EnhancedOutfitOptions): Outfit[]`
- Options interface includes:
  - `count?: number` - Number of outfits to generate (default: 5)
  - `style?: OutfitStyle` - Target style/occasion
  - `gender?: 'men' | 'women'`
  - `priceRange?: { min: number; max: number }`
  - `targetFormality?: FormalityLevel` - Optional target formality level
  - `targetAesthetic?: AestheticCategory` - Optional target aesthetic
  - `colorTonePreference?: ColorTone` - Optional color tone preference
- Implementation steps:
  1. Filter products by gender and availability
  2. Categorize products by `outfitRole`
  3. For each outfit:
     a. Select primary item (top/dress) using enhanced scoring
     b. Find compatible bottoms using `pairingCategories` and `colorTone`
     c. Find compatible footwear using `formalityLevel` matching
     d. Optionally add outerwear if formality level is high (6+)
     e. Add accessories if slot available
  4. Validate outfit composition (no duplicates, color harmony, formality consistency)
  5. Generate title and description using aesthetic

### 8. Add Enhanced Outfit Validation
- Add function `validateEnhancedOutfit(items: EnhancedMockProduct[]): EnhancedValidationResult`
- Validation checks:
  - All items have compatible `colorTone`
  - All items have consistent `formalityLevel` (within tolerance)
  - At least one shared `styleTag`
  - `pairingCategories` validation passes
  - No duplicate `outfitRole` (except accessories)
- Return issues array with specific validation failures

### 9. Export New Functions and Types
- Export from `outfit-generator.ts`:
  - `generateEnhancedOutfits`
  - `validateEnhancedOutfit`
  - `scoreEnhancedProductForOutfit`
  - `EnhancedOutfitOptions` interface
  - `EnhancedValidationResult` interface
  - `EnhancedOutfitContext` interface

### 10. Validate Implementation
- Run TypeScript compilation to ensure no type errors
- Verify all new functions are properly exported
- Test that enhanced attributes are correctly accessed from `EnhancedMockProduct`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm exec tsc --noEmit` - Verify TypeScript compilation passes
- `cd apps/web && pnpm lint` - Run ESLint to check code quality
- `node -e "import('./apps/web/lib/outfit-generator.ts')"` - Verify module exports (may need build first)
- Manual verification: Check that `generateEnhancedOutfits` is exported and callable

## Notes
- The enhanced products in `mock-data02.ts` are a subset of 14 products. The implementation should gracefully handle both `EnhancedMockProduct` and regular `Product` types.
- The existing `generateOutfits` function should remain unchanged for backward compatibility.
- Formality level tolerance of ±2 allows for reasonable outfit variation (e.g., formality 6 top can pair with formality 4-8 bottom).
- Color tone matching should be soft (return true for neutral matches) to avoid overly restrictive filtering.
- The `pairingCategories` validation should use case-insensitive matching and handle partial matches (e.g., "Pants" matches "pants", "Suit Pants").
