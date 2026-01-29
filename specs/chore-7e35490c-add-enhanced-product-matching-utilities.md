# Chore: Add Missing Fashion Attribute Matching Utilities

## Metadata
adw_id: `7e35490c`
prompt: `Add missing fashion attribute matching utilities to apps/web/lib/outfit-generator.ts as specified in specs/chore-1b20493d-integrate-enhanced-mock-products.md. Implement the following functions: areColorTonesCompatible, isFormalityCompatible, validatePairingCompatibility, calculateStyleOverlap, scoreEnhancedProductForOutfit, and validateEnhancedOutfit.`

## Chore Description
This chore adds utility functions to the outfit generator that leverage `EnhancedMockProduct` attributes for smarter outfit matching. These functions were specified in the previous integration spec but not fully implemented. The utilities enable:

1. **Color Tone Matching** - Validates color temperature compatibility (warm/cool/neutral)
2. **Formality Matching** - Ensures outfit items have consistent formality levels (±2 tolerance)
3. **Pairing Validation** - Uses `pairingCategories` to validate item compatibility
4. **Style Tag Overlap** - Calculates percentage of shared style tags between items
5. **Enhanced Product Scoring** - Weighted scoring function for outfit candidate selection
6. **Enhanced Outfit Validation** - Comprehensive validation with detailed result reporting

Note: `areColorTonesCompatible` already exists in `color-palette-matcher.ts` but the prompt requests it in `outfit-generator.ts`. We will import and re-export it rather than duplicate the implementation.

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify

- **`apps/web/lib/outfit-generator.ts`** - Main target file. Add all new utility functions here. Already imports `EnhancedMockProduct`, `ColorTone`, `FormalityLevel`, `StyleTag`, `OutfitRole`, and color tone utilities from `color-palette-matcher.ts`.

- **`apps/web/lib/types.ts`** - May need to export new interfaces (`EnhancedOutfitContext`, `EnhancedValidationResult`) for broader application use.

### Files for Reference (Read-Only)

- **`apps/web/lib/mock-data02.ts`** - Contains `EnhancedMockProduct` interface definition with all 14 fashion attributes including `colorTone`, `formalityLevel`, `styleTags`, `pairingCategories`, `aesthetic`, and `outfitRole`.

- **`apps/web/lib/styling/color-palette-matcher.ts`** - Already has `areColorTonesCompatible()`, `areAllColorTonesCompatible()`, and `calculateColorToneHarmony()` functions. Import these rather than duplicating.

- **`apps/web/lib/types/enums.ts`** - Type definitions for `FormalityLevel` (1-10), `StyleTag`, `OutfitRole`, `AestheticCategory`.

- **`specs/chore-1b20493d-integrate-enhanced-mock-products.md`** - Original specification with detailed requirements for each function.

### New Files to Create

None - all changes are additions to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add EnhancedOutfitContext and EnhancedValidationResult Interfaces
- Add `EnhancedOutfitContext` interface to `outfit-generator.ts` with fields:
  - `targetAesthetic?: AestheticCategory`
  - `targetFormality?: FormalityLevel`
  - `colorTone?: ColorTone`
  - `existingStyleTags?: StyleTag[]`
  - `existingPairingCategories?: string[]`
- Add `EnhancedValidationResult` interface with fields:
  - `isValid: boolean`
  - `score: number`
  - `issues: string[]`
  - `colorToneCompatibility: boolean`
  - `formalityCompatibility: boolean`
  - `styleTagOverlap: number`
  - `pairingCompatibility: boolean`

### 2. Implement isFormalityCompatible Function
- Add constant `FORMALITY_TOLERANCE = 2`
- Implement `isFormalityCompatible(level1: FormalityLevel, level2: FormalityLevel): boolean`
  - Return `Math.abs(level1 - level2) <= FORMALITY_TOLERANCE`
- Export the function

### 3. Implement validatePairingCompatibility Function
- Implement `validatePairingCompatibility(product1: EnhancedMockProduct, product2: EnhancedMockProduct): boolean`
- Check if `product1.pairingCategories` includes `product2.subCategory` (case-insensitive)
- OR check if `product2.pairingCategories` includes `product1.subCategory` (case-insensitive)
- Handle partial matches (e.g., "Pants" matches "Suit Pants")
- Return `true` if either direction matches, `false` otherwise
- Export the function

### 4. Implement calculateStyleOverlap Function
- Implement `calculateStyleOverlap(tags1: StyleTag[], tags2: StyleTag[]): number`
- Calculate intersection of style tags
- Return percentage as 0-1 value: `intersection.length / Math.max(tags1.length, tags2.length, 1)`
- Handle empty arrays gracefully (return 0 if both empty, 0 if one empty)
- Export the function

### 5. Implement scoreEnhancedProductForOutfit Function
- Implement `scoreEnhancedProductForOutfit(product: EnhancedMockProduct, context: EnhancedOutfitContext): number`
- Calculate weighted score (0-1 scale) based on:
  - **Aesthetic match (25%)**: 1.0 if matches `targetAesthetic`, 0.5 if similar category, 0.0 otherwise
  - **Formality match (25%)**: 1.0 if within tolerance, scaled reduction beyond tolerance
  - **Color tone match (20%)**: 1.0 if compatible via `areColorTonesCompatible`, 0.0 otherwise
  - **Style tag overlap (15%)**: Result of `calculateStyleOverlap` with `existingStyleTags`
  - **Pairing compatibility (15%)**: 1.0 if any `pairingCategories` match `existingPairingCategories`, 0.0 otherwise
- Return weighted sum of all scores
- Export the function

### 6. Implement validateEnhancedOutfit Function
- Implement `validateEnhancedOutfit(items: EnhancedMockProduct[]): EnhancedValidationResult`
- Perform validation checks:
  - **Color tone compatibility**: Use `areAllColorTonesCompatible` from color-palette-matcher
  - **Formality compatibility**: Check all pairs within ±2 tolerance using `isFormalityCompatible`
  - **Style tag overlap**: Check if at least one tag is shared across all items
  - **Pairing compatibility**: Validate using `validatePairingCompatibility` for adjacent items
  - **Outfit role uniqueness**: Check no duplicate roles (except accessories)
- Populate `issues` array with specific validation failures
- Calculate overall `score` based on passing checks
- Return `EnhancedValidationResult` object
- Export the function

### 7. Re-export areColorTonesCompatible for Convenience
- The function already exists in `color-palette-matcher.ts` and is imported in `outfit-generator.ts`
- Add a re-export: `export { areColorTonesCompatible } from './styling/color-palette-matcher'`
- This allows consumers to import from `outfit-generator.ts` as specified in the prompt

### 8. Export All New Interfaces and Functions
- Ensure all new functions are exported from `outfit-generator.ts`:
  - `isFormalityCompatible`
  - `validatePairingCompatibility`
  - `calculateStyleOverlap`
  - `scoreEnhancedProductForOutfit`
  - `validateEnhancedOutfit`
  - `EnhancedOutfitContext` (interface)
  - `EnhancedValidationResult` (interface)
- Re-export `areColorTonesCompatible` from color-palette-matcher

### 9. Validate Implementation
- Run TypeScript compilation to ensure no type errors
- Verify all functions are properly exported
- Test that enhanced attributes are correctly accessed

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm exec tsc --noEmit` - Verify TypeScript compilation passes with no type errors
- `cd apps/web && pnpm lint` - Run ESLint to check code quality and style
- `node -e "const m = require('./apps/web/lib/outfit-generator'); console.log(Object.keys(m).filter(k => ['isFormalityCompatible', 'validatePairingCompatibility', 'calculateStyleOverlap', 'scoreEnhancedProductForOutfit', 'validateEnhancedOutfit'].includes(k)))"` - Verify new functions are exported (requires build)

## Notes
- `areColorTonesCompatible` already exists in `color-palette-matcher.ts` at line 368. Instead of duplicating, we re-export it from `outfit-generator.ts` for API convenience as specified in the prompt.
- The `FORMALITY_TOLERANCE = 2` constant allows formality level 6 to pair with levels 4-8, providing reasonable outfit variation.
- Pairing validation uses case-insensitive matching and partial matching to handle variations like "Pants" vs "Suit Pants" or "pants".
- Style tag overlap uses `Math.max` of both arrays to normalize the score, avoiding division by zero and handling asymmetric arrays.
- The scoring function in `scoreEnhancedProductForOutfit` uses the exact weights from the spec: aesthetic 25%, formality 25%, colorTone 20%, styleTags 15%, pairing 15%.
- Outfit role uniqueness allows multiple accessories but prevents duplicate tops, bottoms, footwear, etc.
