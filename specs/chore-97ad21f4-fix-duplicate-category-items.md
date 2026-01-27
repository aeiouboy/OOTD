# Chore: Fix Outfit Generation Duplicate Category Items

## Metadata
adw_id: `97ad21f4`
prompt: `Fix outfit generation to prevent duplicate category items (like 2 blazers in one outfit) and improve outfit composition based on Pinterest 2026 styling rules`

## Chore Description

The outfit generator currently allows multiple items from the same category in a single outfit (e.g., 2 blazers - black and navy), which is a styling error. This chore implements category deduplication and proper outfit composition rules to ensure:

1. **One item per category rule**: Only ONE item from each category (outerwear, bottoms, etc.)
2. **Proper layering**: Allow 1 base top + 1 layering piece (cardigan OR blazer, not both)
3. **Pinterest 2026 composition rules**: Implement correct outfit formulas for work and casual styles
4. **Validation**: Add outfit validation before returning results

### Root Cause Analysis

The issue stems from three main problems:

1. **No category deduplication**: The trend-based combination rules in `outfit-combination-rules.ts` can add multiple blazers/cardigans/jackets without checking if one already exists
2. **Missing validation**: Neither `outfit-generator.ts` nor `enhanced-outfit-generator.ts` validates the final outfit composition
3. **Unclear layering logic**: The layering rules don't enforce "ONE outerwear maximum" principle

### Impact

- Users receive nonsensical outfit recommendations (2 blazers in one look)
- Reduces trust in AI fashion recommendations
- Violates basic fashion styling principles
- Pinterest 2026 trends implementation is compromised

## Relevant Files

### Existing Files to Modify

- **apps/web/lib/outfit-generator.ts** (596 lines)
  - Main outfit generation logic
  - Currently calls trend-based combination without validation
  - Needs: Category deduplication after trend-based combination
  - Needs: Outfit validation before returning result

- **apps/web/lib/enhanced-outfit-generator.ts** (395 lines)
  - Enhanced product outfit generation
  - Uses role-based categorization (top, bottom, dress, outerwear, footwear, accessory, bag)
  - Needs: Same category deduplication and validation logic

- **apps/web/lib/styling/outfit-combination-rules.ts** (499 lines)
  - Implements Pinterest 2026 trend-based combination
  - Contains `applyWorkTrendRules()` and `applyCasualTrendRules()`
  - Currently can add blazer AND cardigan to same outfit
  - Needs: Enforce "one outerwear per outfit" rule
  - Needs: Add validation function for outfit composition

- **apps/web/lib/types/enums.ts** (160 lines)
  - Defines `OutfitRole` type with values: top, bottom, dress, outerwear, footwear, accessory, bag, complete-outfit
  - May need review to ensure all categories are covered
  - Currently complete - no changes needed

### New Files

None required. All fixes will be implemented in existing files.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Outfit Validation Utilities to outfit-combination-rules.ts

- Create `validateOutfitComposition()` function that checks:
  - Maximum ONE outerwear (blazer/jacket/coat/cardigan) per outfit
  - Maximum ONE bottom (pants/skirt/shorts) per outfit
  - Maximum ONE dress per outfit (dresses are standalone)
  - Allow layering: 1 base top + 1 outerwear (not multiple outerwear pieces)
- Create `deduplicateOutfitCategories()` function that:
  - Takes an array of Product items
  - Categorizes each item by its role/type
  - If multiple items in same category, keeps the best-scoring one
  - Returns deduplicated Product array
- Create `getProductCategory()` helper that determines item category:
  - Check product name/visualDescription for keywords
  - Map to categories: outerwear, top, bottom, dress, shoes, accessory
  - Use keyword matching (blazer/jacket/coat/cardigan → outerwear)
- Add scoring function `scoreProductForOutfit()` that prioritizes:
  - Higher price items (premium quality)
  - Items matching color palette
  - Items matching aesthetic
  - Better fit with outfit context (work vs casual)

### 2. Enforce One-Outerwear Rule in applyWorkTrendRules()

- Modify work outfit composition logic (lines 290-379):
  - Generate fitted top
  - Generate wide-leg/high-waisted trousers
  - Generate **either** blazer **or** cardigan (not both)
  - Use random selection: 70% blazer, 30% cardigan for work
  - Add color compatibility check before adding outerwear
  - Add structured tote bag
  - Add shoes
- Add validation check at end of function:
  - Call `validateOutfitComposition()` on result
  - If validation fails, remove duplicate categories
- Add logging for debugging: "Work outfit: [X] items, [Y] outerwear pieces"

### 3. Enforce One-Outerwear Rule in applyCasualTrendRules()

- Modify casual outfit composition logic (lines 203-281):
  - Generate layered tops (base layer + optional top layer)
  - If layering includes outerwear (cardigan/jacket), mark as "has_outerwear"
  - Generate baggy/wide-leg bottoms
  - Generate platform/chunky footwear
  - Only add structured bag OR jewelry (not outerwear) if layering already added one
- Add validation check at end of function:
  - Call `validateOutfitComposition()` on result
  - Remove duplicates if found
- Add logging: "Casual outfit: [X] items, has layering: [true/false]"

### 4. Update applyLayeringRules() to Prevent Duplicate Outerwear

- Modify layering function (lines 157-194):
  - When selecting base layer and top layer, ensure they are different items
  - If top layer is outerwear (blazer/cardigan), mark outfit as having outerwear
  - Return metadata: `{ items: Product[], hasOuterwear: boolean }`
  - Update all callers to handle new return type
- Add check: if baseLayer.sku === topLayer.sku, pick different topLayer

### 5. Add Deduplication to outfit-generator.ts

- After line 386 (trend-based combination), add deduplication:
  ```typescript
  if (items.length > 0) {
    items = deduplicateOutfitCategories(items)
  }
  ```
- After fallback strategies (lines 388-418), add same deduplication
- Before returning outfit (line 439), add final validation:
  ```typescript
  const validationResult = validateOutfitComposition(items)
  if (!validationResult.isValid) {
    console.warn('[OutfitGenerator] Invalid composition:', validationResult.issues)
    items = deduplicateOutfitCategories(items)
  }
  ```
- Add validation logging to console output (line 450)

### 6. Add Deduplication to enhanced-outfit-generator.ts

- After line 100 (dress-based strategy), add deduplication check
- After line 124 (top+bottom strategy), add deduplication check
- Before returning outfit (line 148), add validation:
  ```typescript
  // Validate outfit composition - no duplicate categories
  const validation = validateOutfitComposition(products)
  if (!validation.isValid) {
    products = deduplicateOutfitCategories(products)
  }
  ```
- Import validation functions from `../styling/outfit-combination-rules`

### 7. Implement Pinterest 2026 Outfit Formulas

- Add composition rules documentation to outfit-combination-rules.ts:
  ```typescript
  /**
   * Pinterest 2026 Work Outfit Formula:
   * - 1 fitted top (blouse/shirt) OR 1 base layer + 1 blazer
   * - 1 wide-leg/tailored trouser (high-waisted preferred)
   * - 1 footwear (heels/loafers)
   * - 1-2 accessories (bag, belt, jewelry)
   * - Total: 3-5 items
   */

  /**
   * Pinterest 2026 Casual Outfit Formula:
   * - 1 top OR 1 base layer + 1 cardigan/sweater
   * - 1 bottom (jeans/pants - wide-leg/baggy preferred)
   * - 1 footwear (platform sneakers/chunky shoes)
   * - 1-2 accessories (structured bag, gold jewelry)
   * - Total: 3-5 items
   */
  ```
- Ensure applyWorkTrendRules() follows work formula exactly
- Ensure applyCasualTrendRules() follows casual formula exactly

### 8. Add Comprehensive Validation Tests

- Create validation test cases in outfit-combination-rules.ts:
  - Test case 1: Outfit with 2 blazers → should remove duplicate
  - Test case 2: Outfit with blazer + cardigan → should keep one
  - Test case 3: Outfit with 2 pants → should keep best one
  - Test case 4: Valid outfit with 1 of each → should pass
  - Test case 5: Dress-based outfit → should not require top+bottom
- Add validation result type:
  ```typescript
  interface ValidationResult {
    isValid: boolean
    issues: string[]
    duplicateCategories?: string[]
  }
  ```

### 9. Update Type Definitions if Needed

- Review OutfitRole enum in types/enums.ts (lines 75-83)
- Ensure all categories are covered:
  - top ✓
  - bottom ✓
  - dress ✓
  - outerwear ✓
  - footwear ✓
  - accessory ✓
  - bag ✓
  - complete-outfit ✓
- No changes needed - types are complete

### 10. Add Debug Logging

- Add detailed logging to all validation functions:
  - Log category counts: "Outfit has 2 outerwear items: [blazer-123, cardigan-456]"
  - Log deduplication actions: "Removed duplicate outerwear: cardigan-456 (kept blazer-123)"
  - Log validation results: "Outfit validation: PASSED/FAILED, issues: [...]"
- Add logging to trend-based rules:
  - "Applying work trend rules: fitted top + wide-leg bottom + blazer"
  - "Applying casual trend rules: oversized layering + baggy bottom"
- Use console.log with [OutfitValidator] prefix

### 11. Test with Real Data

- Generate work outfit and verify:
  - Maximum 1 blazer OR 1 cardigan (not both)
  - Exactly 1 bottom
  - 3-5 items total
  - No duplicate categories
- Generate casual outfit and verify:
  - If layering present, only 1 outerwear piece
  - Exactly 1 bottom
  - 3-5 items total
  - No duplicate categories
- Generate multiple outfits (5+) and verify no duplicates in any

### 12. Update Documentation

- Add inline comments explaining validation logic
- Document the "one per category" rule clearly
- Add examples of valid vs invalid outfit compositions
- Update function JSDoc comments with validation details

## Validation Commands

Execute these commands to validate the chore is complete:

### TypeScript Compilation
```bash
cd apps/web
pnpm run build
```
- Should compile without errors
- Validates all type definitions are correct

### Linting
```bash
cd apps/web
pnpm run lint
```
- Should pass with no errors
- Validates code style and best practices

### Manual Testing - Work Outfit
```bash
cd apps/web
pnpm dev
# Navigate to http://localhost:3000
# Send message: "Show me 5 work outfits"
# Verify each outfit has:
#   - Maximum 1 blazer OR 1 cardigan (not both)
#   - Exactly 1 bottom (pants/skirt)
#   - No duplicate items in same category
```

### Manual Testing - Casual Outfit
```bash
# In running dev server
# Send message: "Show me 5 casual outfits"
# Verify each outfit has:
#   - If layered, only 1 outerwear piece
#   - Exactly 1 bottom
#   - No duplicate categories
```

### Console Log Verification
```bash
# Check browser console for validation logs:
# - "[OutfitValidator] Validating outfit composition..."
# - "[OutfitValidator] Outfit validation: PASSED"
# - No "[OutfitValidator] Removed duplicate..." messages
# - No validation failures
```

### Code Review Checklist
- [ ] `validateOutfitComposition()` function implemented
- [ ] `deduplicateOutfitCategories()` function implemented
- [ ] `applyWorkTrendRules()` enforces one-outerwear rule
- [ ] `applyCasualTrendRules()` enforces one-outerwear rule
- [ ] `applyLayeringRules()` prevents duplicate outerwear
- [ ] `outfit-generator.ts` calls validation before returning
- [ ] `enhanced-outfit-generator.ts` calls validation before returning
- [ ] Debug logging added to all validation points
- [ ] Work outfit follows Pinterest 2026 formula (3-5 items)
- [ ] Casual outfit follows Pinterest 2026 formula (3-5 items)
- [ ] All TypeScript compiles successfully
- [ ] All linting passes
- [ ] Manual testing shows no duplicate categories

## Notes

### Category Deduplication Priority

When duplicate categories are found, keep the item with the highest score based on:

1. **Price** (30% weight): Higher price = better quality
2. **Color match** (30% weight): Matches outfit color palette
3. **Aesthetic match** (20% weight): Matches Pinterest 2026 aesthetic
4. **Formality** (20% weight): Appropriate for occasion

### Layering vs Outerwear Distinction

- **Layering**: Base top (t-shirt/blouse) + Top layer (cardigan/blazer)
- **Outerwear**: Standalone jacket/coat worn over a complete top
- Rule: ONE outerwear piece maximum, whether layered or standalone

### Edge Cases to Handle

1. **Dress-based outfits**: Dresses don't need top+bottom validation
2. **Complete outfit items**: Products marked as 'complete-outfit' should be standalone
3. **Accessories**: Bags and jewelry can have 1-2 items (not strict single rule)
4. **Color coordination**: Deduplication should preserve color harmony

### Performance Considerations

- Validation adds minimal overhead (O(n) where n = outfit items, typically 3-5)
- Deduplication uses Set for O(1) category lookup
- Scoring function called only when duplicates found

### Testing Strategy

1. Unit test validation functions with mock product data
2. Integration test with real product catalog
3. Visual inspection of generated outfits in UI
4. Monitor console logs for validation failures
5. Track outfit quality metrics (no duplicates rate)
