# Chore: Fix TypeScript Enum Value Mismatches in mock-data04.ts

## Metadata
adw_id: `d76a7c72`
prompt: `Fix TypeScript enum value mismatches in mock-data04.ts. The following replacements are needed across all 14 products: SongkranSuitability, CoverageType, TextureType, WeddingAppropriateType, LayerCompatibility, OutfitCompleteness, OutfitRoleType`

## Chore Description
The mock-data04.ts file contains enum values that don't match the definitions in enums.ts. This causes TypeScript compilation errors. The chore requires systematically replacing incorrect string literal values with the correct enum-defined values across all 14 products in the catalog.

**Enum Definitions (from enums.ts):**
- `SongkranSuitability`: 'temple-morning' | 'water-play' | 'both' | 'neither'
- `CoverageType`: 'covered' | 'partially-covered' | 'exposed'
- `TextureType`: 'matte' | 'sheen' | 'glossy' | 'textured' | 'mixed'
- `WeddingAppropriateType`: 'any' | 'morning' | 'evening' | 'outdoor' | 'indoor' | 'none'
- `LayerCompatibility`: 'fitted' | 'structured' | 'loose'
- `OutfitCompleteness`: 'standalone' | 'needs-top' | 'needs-bottom' | 'needs-both' | 'needs-layer' | 'needs-accessories'
- `OutfitRoleType`: 'anchor' | 'supporting' | 'accent' | 'statement'

**Required Replacements:**
| Field | Incorrect Value | Correct Value | Occurrences |
|-------|----------------|---------------|-------------|
| songkranSuitable | 'no' | 'neither' | 11 |
| shoulders/knees | 'not-applicable' | 'exposed' | 14 |
| shoulders | 'not-covered' | 'exposed' | 1 |
| textureType | 'smooth' | 'matte' | 5 |
| textureType | 'structured' | 'textured' | 3 |
| weddingAppropriate | 'not-appropriate' | 'none' | 2 |
| weddingAppropriate | 'conservative' | 'morning' | 2 |
| layerCompatibility | 'relaxed' | 'loose' | 11 |
| outfitCompleteness | 'complete' | 'standalone' | 2 |
| outfitCompleteness | 'needs-bottom-and-top' | 'needs-both' | 2 |
| outfitCompleteness | 'accessory' | 'needs-accessories' | 1 |
| outfitCompleteness | 'footwear' | 'needs-accessories' | 3 |
| outfitRoleType | 'neutral' | 'supporting' | 1 |

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/mock-data04.ts** - The main file containing all 14 products with incorrect enum values. This is the file to be edited.
- **apps/web/lib/types/enums.ts** - Reference file containing correct enum definitions. Use this to verify correct values (lines 218-326).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix SongkranSuitability Values
- Replace all occurrences of `songkranSuitable: 'no'` with `songkranSuitable: 'neither'`
- Expected: 11 replacements (lines 707, 1228, 1573, 1749, 1925, 2277, 2453, 2629, 2806)

### 2. Fix CoverageType Values for Shoulders
- Replace all occurrences of `shoulders: 'not-applicable'` with `shoulders: 'exposed'`
- Replace `shoulders: 'not-covered'` with `shoulders: 'exposed'`
- Expected: 8 replacements for 'not-applicable', 1 replacement for 'not-covered'

### 3. Fix CoverageType Values for Knees
- Replace all occurrences of `knees: 'not-applicable'` with `knees: 'exposed'`
- Expected: 6 replacements

### 4. Fix TextureType Values
- Replace all occurrences of `textureType: 'smooth'` with `textureType: 'matte'`
- Replace all occurrences of `textureType: 'structured'` with `textureType: 'textured'`
- Expected: 5 replacements for 'smooth', 3 replacements for 'structured'

### 5. Fix WeddingAppropriateType Values
- Replace all occurrences of `weddingAppropriate: 'not-appropriate'` with `weddingAppropriate: 'none'`
- Replace all occurrences of `weddingAppropriate: 'conservative'` with `weddingAppropriate: 'morning'`
- Expected: 2 replacements for 'not-appropriate', 2 replacements for 'conservative'

### 6. Fix LayerCompatibility Values
- Replace all occurrences of `'relaxed'` within `layerCompatibility` arrays with `'loose'`
- Note: 'relaxed' appears in other contexts (layeringStyle, fashionMoods, styleMoods) - only change values inside layerCompatibility arrays
- Expected: 11 replacements across various layerCompatibility arrays

### 7. Fix OutfitCompleteness Values
- Replace all occurrences of `outfitCompleteness: 'complete'` with `outfitCompleteness: 'standalone'`
- Replace all occurrences of `outfitCompleteness: 'needs-bottom-and-top'` with `outfitCompleteness: 'needs-both'`
- Replace all occurrences of `outfitCompleteness: 'accessory'` with `outfitCompleteness: 'needs-accessories'`
- Replace all occurrences of `outfitCompleteness: 'footwear'` with `outfitCompleteness: 'needs-accessories'`
- Expected: 2 for 'complete', 2 for 'needs-bottom-and-top', 1 for 'accessory', 3 for 'footwear'

### 8. Fix OutfitRoleType Values
- Replace all occurrences of `outfitRoleType: 'neutral'` with `outfitRoleType: 'supporting'`
- Expected: 1 replacement (line 2829)

### 9. Validate TypeScript Compilation
- Run TypeScript compiler to verify all enum values are now correct
- Ensure no type errors in mock-data04.ts

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && npx tsc --noEmit --skipLibCheck lib/mock-data04.ts` - Verify TypeScript compilation succeeds with no errors
- `grep -c "'no'" apps/web/lib/mock-data04.ts` - Should return 0 (no 'no' values in songkranSuitable)
- `grep -c "'not-applicable'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "'not-covered'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "textureType: 'smooth'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "textureType: 'structured'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "'not-appropriate'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "weddingAppropriate: 'conservative'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "outfitCompleteness: 'complete'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "'needs-bottom-and-top'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "outfitCompleteness: 'accessory'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "outfitCompleteness: 'footwear'" apps/web/lib/mock-data04.ts` - Should return 0
- `grep -c "outfitRoleType: 'neutral'" apps/web/lib/mock-data04.ts` - Should return 0

## Notes
- The `VisualRole` type (line 206) uses 'neutral' which is DIFFERENT from `OutfitRoleType` - do not change visualRole values
- The `ColorTone` type (line 92) uses 'neutral' which is correct - do not change colorTone values
- The `layeringStyle` property uses 'relaxed' which is allowed by `LayeringStyle` type - do not change these
- The `fashionMoods` and `styleMoods` arrays use 'relaxed' as a mood descriptor - do not change these
- Only change 'relaxed' values that appear specifically within `layerCompatibility` arrays
- The `outfitRole` property (lines 1505, 2559, 2736) uses 'accessory' and 'footwear' which is allowed by `OutfitRole` type - do not change these
- The `essentialPairings` arrays contain 'footwear' as a category reference - do not change these
