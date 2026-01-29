# Chore: Complete Visual Consistency Validation Integration

## Metadata
adw_id: `d409ab3e`
prompt: `Complete integration of visual consistency validation to ensure flat-lay images match product list`

## Chore Description

The visual consistency validation system (`product-visual-validator.ts`) was created to detect mismatches between product text descriptions and product thumbnail images. However, the integration is incomplete:

**Current State:**
- `product-visual-validator.ts` exists with detection functions (`validateProductVisualConsistency`, `validateFlatLayThumbnailMatch`, etc.)
- `useFlatLayGeneration.ts` logs warnings when mismatches are detected but does NOT replace or exclude mismatched products
- Outfit generator filters products at generation time, but flat-lay generation may still use mismatched items

**Problem:**
The flat-lay AI image is generated from product text descriptions (e.g., "Formal Heels"), but the product list thumbnail might show a different item (e.g., oxford shoes from the image URL). This creates a visual mismatch where:
- Flat-lay shows: feminine heels
- Product list shows: masculine oxford shoes

**Solution:**
Complete the integration by:
1. Finding visually consistent replacement products when mismatches are detected
2. Synchronizing the product list with the products actually used in flat-lay generation
3. Ensuring both the flat-lay image and product list display the SAME items

## Relevant Files

### Files to Modify

- **`apps/web/lib/utils/product-visual-validator.ts`** (lines 1-396)
  - Add `findVisuallyConsistentReplacement()` function to find substitute products when visual mismatch is detected
  - The replacement should match category, price range, and occasion while having consistent visuals

- **`apps/web/lib/hooks/useFlatLayGeneration.ts`** (lines 1-649)
  - Modify `transformToFlatLayItems()` to handle product replacement, not just log warnings
  - Add logic to either replace mismatched products or exclude them from flat-lay generation
  - Return both the flat-lay items AND any product replacements made

- **`apps/web/components/chat/ChatAssistant.tsx`** (lines 1-426)
  - Modify `generateFlatLayForOutfit()` to synchronize product list updates when products are replaced
  - Ensure the outfit's `items` array is updated when products are substituted for visual consistency

### Types Files (Reference Only)

- **`apps/web/lib/types.ts`** (lines 1-108)
  - Contains `Product` and `Outfit` interfaces - no changes needed but important for understanding data flow

- **`apps/web/lib/types/image-types.ts`** (lines 1-159)
  - Contains `FlatLayItem` interface with `isVisuallyConsistent` field - no changes needed

### Supporting Files (Context)

- **`apps/web/lib/outfit-generator.ts`** (lines 1-860)
  - Already has visual validation in `filterProductsByGender()` and `isWomenFootwear()`
  - Provides product filtering functions that can be used for finding replacements

- **`apps/web/components/outfit/OutfitDetail.tsx`** (lines 1-105)
  - Displays `outfit.items` from props - will automatically show updated items if ChatAssistant updates them

### New Files

No new files needed - all changes are to existing files.

## Step by Step Tasks

### 1. Add Product Replacement Finder Function

In `apps/web/lib/utils/product-visual-validator.ts`:

- Add new function `findVisuallyConsistentReplacement(product: Product, allProducts: Product[]): Product | null`
- Function should:
  - Accept the mismatched product and array of all available products
  - Filter candidates by same category (using `categorizeProduct()` from outfit-generator)
  - Filter candidates by gender-appropriate products
  - Validate each candidate with `isVisuallyConsistentForWomen()`
  - Match price range (within 30% of original price)
  - Match occasion tags if present
  - Return the best matching replacement or null if none found
- Add helper function `getSimilarityScore(original: Product, candidate: Product): number` for ranking replacements

### 2. Extend useFlatLayGeneration Hook

In `apps/web/lib/hooks/useFlatLayGeneration.ts`:

- Import the new `findVisuallyConsistentReplacement` function
- Modify `TransformResult` interface to include:
  - `replacements: Map<string, Product>` - maps original SKU to replacement product
  - `excludedSkus: string[]` - SKUs of items that couldn't be replaced
- Modify `transformToFlatLayItems()` function to:
  - Accept additional parameter `allProducts: Product[]` for replacement lookup
  - When visual mismatch is detected, attempt to find replacement
  - If replacement found, use replacement product data in FlatLayItem
  - If no replacement found, mark item for exclusion from flat-lay (but keep in product list with warning)
  - Return the full TransformResult with replacements map
- Update `performGeneration()` to pass replacement data back through state
- Add new state: `productReplacements: Map<string, Product>` to track which products were substituted

### 3. Add useFlatLayGeneration Options Interface Update

In `apps/web/lib/hooks/useFlatLayGeneration.ts`:

- Extend `UseFlatLayGenerationOptions` interface:
  - Add `allProducts?: Product[]` - optional full product catalog for finding replacements
  - Add `onProductsReplaced?: (replacements: Map<string, Product>) => void` - callback when products are substituted
- Extend `UseFlatLayGenerationResult` interface:
  - Add `productReplacements: Map<string, Product>` - map of original SKU to replacement product

### 4. Update ChatAssistant to Handle Product Replacements

In `apps/web/components/chat/ChatAssistant.tsx`:

- Modify `generateFlatLayForOutfit()` function:
  - Before generating flat-lay, run visual consistency validation on outfit items
  - If mismatches detected and replacements available, update `outfit.items` in message state
  - Update message state to include both the new flat-lay image AND the corrected product list
- Add helper function `applyProductReplacements(outfit: Outfit, replacements: Map<string, Product>): Outfit`:
  - Creates new outfit with items array where mismatched items are replaced
  - Recalculates `totalPrice` based on replacement prices
- Update message state management to:
  - Store both original and corrected outfit items
  - Ensure OutfitDetail receives the corrected items

### 5. Add Integration Between Hook and Component

In `apps/web/components/chat/ChatAssistant.tsx`:

- When calling flat-lay generation API, pass transformed items that already have replacements applied
- After successful flat-lay generation, update the outfit's items array in messages state to match what was actually generated
- Ensure the callback to `onProductsReplaced` propagates up to update UI state

### 6. Validate Implementation

Run validation commands to ensure:
- TypeScript compilation passes
- Lint checks pass
- Unit tests for product-visual-validator pass
- No runtime errors in development

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compilation succeeds
- `cd apps/web && pnpm lint` - Verify linting passes
- `cd apps/web && pnpm test -- --testPathPattern="product-visual-validator"` - Run unit tests for visual validator
- `cd apps/web && pnpm build` - Verify production build succeeds

## Notes

### Product Replacement Strategy

The replacement finder should prioritize:
1. **Same subcategory** - e.g., replace "Formal Heels" with another "Heels" product
2. **Similar price range** - within 30% of original price to maintain outfit total
3. **Same occasion tags** - if original is for "work", replacement should be too
4. **Visual consistency** - must pass `isVisuallyConsistentForWomen()` check

### Edge Cases to Handle

1. **No replacement found**: Keep original product in list but exclude from flat-lay generation prompt. The flat-lay will show fewer items, but product list shows all.

2. **Multiple mismatches**: Handle each independently. If outfit has 2 mismatches and only 1 can be replaced, replace that one and exclude the other.

3. **All items mismatched**: Extremely rare - fall back to original behavior (generate flat-lay with text descriptions, accept mismatch).

### Performance Considerations

- Replacement lookup should be O(n) where n is catalog size
- Cache replacement results per outfit to avoid repeated lookups
- Only run replacement logic when `hasInconsistentItems` is true

### Backward Compatibility

- All changes are additive - existing functionality preserved
- New parameters and callbacks are optional
- Components not using replacement feature continue to work as before
