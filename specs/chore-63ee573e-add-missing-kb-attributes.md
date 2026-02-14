# Chore: Add Missing KB Attributes to mock-data04.ts

## Metadata
adw_id: `63ee573e`
prompt: `Add missing KB attributes to mock-data04.ts: 1. thaiContext: Add 'cnySuitable' field (boolean or 'yes'|'no'|'maybe') - For red/gold items: true - For black/white/blue items: false - Reference: KB Section 12 (Chinese New Year in February) 2. visualMatching: Add 'silhouetteFit' field ('fitted'|'semi-fitted'|'relaxed'|'oversized'|'boxy'|'structured'|'fluid') - Reference: KB Section 15 - Fit Classifications 3. visualMatching: Add 'silhouetteVolume' field ('low'|'medium'|'high') - Reference: KB Section 15 - Volume Level. Update TypeScript interface in apps/web/lib/types/thai-context-types.ts and apps/web/lib/types/ai-matching-types.ts accordingly. Update all 14 products with appropriate values.`

## Chore Description
This chore adds three missing attributes to the KB expansion schema that were identified in Knowledge Base sections 12 and 15:

1. **`cnySuitable`** - Chinese New Year suitability field in the Thai Context attributes
   - KB Section 12 explicitly defines CNY fashion rules:
     - RED is mandatory (เสื้อแดง, กระเป๋าแดง, รองเท้าแดง)
     - Gold accents are encouraged
     - Black, white, and blue are inauspicious
   - This field determines if an item is appropriate for Chinese New Year celebrations

2. **`silhouetteFit`** - Fit classification for Visual Matching Intelligence
   - KB Section 15 defines 7 fit types: fitted, semi-fitted, relaxed, oversized, boxy, structured, fluid
   - Currently, the `VisualMatchingAttributes` interface only has `silhouetteShape` but lacks the granular fit classification

3. **`silhouetteVolume`** - Volume level for Visual Matching Intelligence
   - KB Section 15 defines volume as low, medium, or high (derived from fit type)
   - This provides a simplified metric for outfit balancing algorithms

## Relevant Files
Use these files to complete the chore:

### Type Definition Files
- **`apps/web/lib/types/thai-context-types.ts`** - Add `cnySuitable` field to `ThaiClimateContext` interface
- **`apps/web/lib/types/ai-matching-types.ts`** - Add `silhouetteFit` and `silhouetteVolume` to `VisualMatchingAttributes` interface
- **`apps/web/lib/types/enums.ts`** - Add new enum types: `CnySuitability`, `SilhouetteFit`, `SilhouetteVolume`

### Data Files
- **`apps/web/lib/mock-data04.ts`** - Update all 14 products with the new attribute values

### Reference Files
- **`data/personas/knowledge_base/advanced/12_thai_micro_seasons.md`** - CNY color rules reference (lines 63-95)
- **`data/personas/knowledge_base/implementation/15_visual_matching_intelligence.md`** - Fit and volume classifications (lines 34-57)

### New Files
None - all changes are additions to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add New Enum Types to enums.ts
- Add `CnySuitability` type after line 304 (after SongkranSuitability):
  ```typescript
  export type CnySuitability = 'suitable' | 'unsuitable' | 'neutral'
  ```
- Add `SilhouetteFit` type (reference KB Section 15 - 7 fit types):
  ```typescript
  export type SilhouetteFit = 'fitted' | 'semi-fitted' | 'relaxed' | 'oversized' | 'boxy' | 'structured' | 'fluid'
  ```
- Add `SilhouetteVolume` type:
  ```typescript
  export type SilhouetteVolume = 'low' | 'medium' | 'high'
  ```

### 2. Update ThaiClimateContext Interface in thai-context-types.ts
- Import the new `CnySuitability` type from `./enums`
- Add `cnySuitable` field to `ThaiClimateContext` interface after `loyKrathongSuitable`:
  ```typescript
  /** Chinese New Year suitability (red/gold = suitable, black/white/blue = unsuitable) */
  cnySuitable: CnySuitability
  ```

### 3. Update VisualMatchingAttributes Interface in ai-matching-types.ts
- Import `SilhouetteFit` and `SilhouetteVolume` types from `./enums`
- Add `silhouetteFit` field after `silhouetteShape`:
  ```typescript
  /** Garment fit classification */
  silhouetteFit: SilhouetteFit
  ```
- Add `silhouetteVolume` field after `silhouetteFit`:
  ```typescript
  /** Volume level (derived from fit) */
  silhouetteVolume: SilhouetteVolume
  ```

### 4. Update mock-data04.ts Product Data - Phase 1 (Products CG001-CG005)
Update thaiContext and visualMatching for each product:

#### CG001 - Classic White Button Shirt
- `thaiContext.cnySuitable`: `'unsuitable'` (white is inauspicious for CNY)
- `visualMatching.silhouetteFit`: `'semi-fitted'` (regular fit cotton shirt)
- `visualMatching.silhouetteVolume`: `'low'`

#### CG002 - Black Tailored Trousers
- `thaiContext.cnySuitable`: `'unsuitable'` (black is inauspicious for CNY)
- `visualMatching.silhouetteFit`: `'fitted'` (tailored trousers)
- `visualMatching.silhouetteVolume`: `'low'`

#### CG003 - Beige Midi Skirt
- `thaiContext.cnySuitable`: `'neutral'` (beige/neutral tone)
- `visualMatching.silhouetteFit`: `'relaxed'` (A-line midi)
- `visualMatching.silhouetteVolume`: `'medium'`

#### CG004 - Navy Blazer
- `thaiContext.cnySuitable`: `'unsuitable'` (blue is inauspicious for CNY)
- `visualMatching.silhouetteFit`: `'structured'`
- `visualMatching.silhouetteVolume`: `'medium'`

#### CG005 - Floral Print Dress
- `thaiContext.cnySuitable`: Check dominant color - set based on whether red/gold is present
- `visualMatching.silhouetteFit`: Based on dress silhouette
- `visualMatching.silhouetteVolume`: Based on dress construction

### 5. Update mock-data04.ts Product Data - Phase 2 (Products CG006-CG010)

#### CG006 - Oversized Blazer Jacket
- `thaiContext.cnySuitable`: Based on color (likely `'neutral'` or `'unsuitable'`)
- `visualMatching.silhouetteFit`: `'oversized'`
- `visualMatching.silhouetteVolume`: `'high'`

#### CG007 - Cotton T-Shirt
- `thaiContext.cnySuitable`: Based on color
- `visualMatching.silhouetteFit`: `'relaxed'` (casual tee)
- `visualMatching.silhouetteVolume`: `'low'`

#### CG008 - Leather Belt
- `thaiContext.cnySuitable`: Based on color (brown = `'neutral'`, black = `'unsuitable'`)
- `visualMatching.silhouetteFit`: `'fitted'` (accessory, close to body)
- `visualMatching.silhouetteVolume`: `'low'`

#### CG009 - Silk Blouse
- `thaiContext.cnySuitable`: Based on color
- `visualMatching.silhouetteFit`: `'fluid'` (silk drapes)
- `visualMatching.silhouetteVolume`: `'low'`

#### CG010 - Denim Jacket
- `thaiContext.cnySuitable`: `'unsuitable'` (blue denim)
- `visualMatching.silhouetteFit`: `'boxy'` (denim jacket structure)
- `visualMatching.silhouetteVolume`: `'medium'`

### 6. Update mock-data04.ts Product Data - Phase 3 (Products CG011-CG014 and SF products)
Update remaining products following the same pattern:
- Determine CNY suitability based on color:
  - Red, gold, bright colors → `'suitable'`
  - Black, white, blue → `'unsuitable'`
  - Beige, brown, green, pink, other → `'neutral'`
- Assign silhouetteFit based on garment type and existing attributes
- Assign silhouetteVolume based on fit:
  - fitted, semi-fitted, fluid → `'low'`
  - relaxed, structured → `'medium'`
  - oversized, boxy → `'high'`

### 7. Update Import Statements in mock-data04.ts
- Add new type imports in the enum import section:
  ```typescript
  import type {
    CnySuitability,
    SilhouetteFit,
    SilhouetteVolume,
  } from './types/enums'
  ```
- Note: If types are already covered by existing imports, skip this step

### 8. Validate TypeScript Compilation
- Run TypeScript compiler to ensure no type errors
- Fix any import or type mismatches

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compilation succeeds
- `cd apps/web && pnpm lint` - Check for linting errors
- `grep -c "cnySuitable" apps/web/lib/mock-data04.ts` - Should return 14 (one per product)
- `grep -c "silhouetteFit" apps/web/lib/mock-data04.ts` - Should return 14 (one per product)
- `grep -c "silhouetteVolume" apps/web/lib/mock-data04.ts` - Should return 14 (one per product)

## Notes

### CNY Color Rules (from KB Section 12)
```
Must Have: Something red (เสื้อแดง, กระเป๋าแดง, รองเท้าแดง)
Great Add: Gold jewelry, gold accents
Avoid: Black, white, blue (inauspicious)
Tip: New clothes = good luck for the year
```

### Fit-to-Volume Mapping (from KB Section 15)
| Fit Type | Volume Level |
|----------|--------------|
| Fitted | Low (Minimal) |
| Semi-Fitted | Low |
| Relaxed | Medium |
| Oversized | High |
| Boxy | Medium-High |
| Structured | Medium (Variable) |
| Fluid | Low-Medium |

### Product SKU Reference
The 14 products in mock-data04.ts:
1. CG001 - Classic White Button Shirt
2. CG002 - Black Tailored Trousers
3. CG003 - Beige Midi Skirt
4. CG004 - Navy Blazer
5. CG005 - Floral Print Dress
6. CG006 - Oversized Blazer Jacket
7. CG007 - Cotton T-Shirt
8. CG008 - Leather Belt
9. CG009 - Silk Blouse
10. CG010 - Denim Jacket
11. CG011 - (varies)
12. CG012 - (varies)
13. CG013 - (varies)
14. CG014 - (varies)
Plus any SF-prefixed products (SFERA brand)

Verify exact SKUs by reading mock-data04.ts before implementation.
