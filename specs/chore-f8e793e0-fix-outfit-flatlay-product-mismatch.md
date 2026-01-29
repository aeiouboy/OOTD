# Chore: Fix Outfit Flat-Lay Image to Product List Mismatch

## Metadata
adw_id: `f8e793e0`
prompt: `Fix mismatch between outfit flat lay image and product items list in outfit recommendation`

## Chore Description

The outfit detail view displays a flat-lay image that shows different items than what appears in the "Items in this outfit" product list. The issue manifests as:

1. **Flat-lay image shows**: Feminine items (e.g., pointed-toe pumps/heels)
2. **Product list shows**: Masculine items (e.g., "Formal Heels" but thumbnail is oxford shoes)

### Root Cause Analysis

After examining the codebase, the issue stems from a **disconnect in the data flow**:

1. **Flat-lay image generation** (`useFlatLayGeneration.ts` lines 291-298):
   - Uses `transformToFlatLayItems()` which extracts from the Product's `name`, `subCategory`, `colors`, and `visualDescription`
   - The prompt is sent to the AI image generator which creates items based on these descriptions

2. **Product list display** (`OutfitProductList.tsx`):
   - Displays the actual Product objects with their `imageUrl` (product thumbnails from catalog)
   - These thumbnails come from the product database, not the AI-generated content

3. **The disconnect**:
   - The AI image generator creates visually coherent feminine outfits based on text descriptions
   - But the underlying Product data may have incorrect gender classification or misleading images
   - Women's outfits may include products with thumbnails showing masculine footwear despite text describing feminine styles

### Technical Investigation Summary

**Files involved in data flow:**
- `apps/web/lib/outfit-generator.ts` - Creates outfits by selecting products
- `apps/web/lib/hooks/useFlatLayGeneration.ts` - Generates flat-lay images from outfit items
- `apps/web/components/chat/ChatAssistant.tsx` - Orchestrates flat-lay generation
- `apps/web/lib/services/image-generation-service.ts` - AI image generation service
- `apps/web/app/api/generate-image/route.ts` - API endpoint for image generation
- `apps/web/components/outfit/OutfitDetail.tsx` - Displays outfit with flat-lay + product list
- `apps/web/components/outfit/OutfitProductList.tsx` - Displays product items

**Key observations:**
1. `buildFlatLayPrompt()` (image-generation-service.ts:292-328) builds prompts from FlatLayItem objects
2. FlatLayItems are transformed from Product data (useFlatLayGeneration.ts:291-298)
3. The `visualDescription` field if present OR `{color} {name}` is used for image generation
4. Product thumbnails (`imageUrl`) are not validated against the generated image content

## Relevant Files
Use these files to complete the chore:

### Core Files to Modify
- **`apps/web/lib/hooks/useFlatLayGeneration.ts`** - Add validation to ensure FlatLayItem descriptions match product thumbnails; add option to use product images for composite generation
- **`apps/web/lib/outfit-generator.ts`** - Enhance product filtering to validate footwear images match descriptions; integrate with gender filtering already in place
- **`apps/web/lib/utils/product-filters.ts`** - Add visual consistency validation functions

### Files to Inspect/Reference
- **`apps/web/lib/types/image-types.ts`** - FlatLayItem interface definition
- **`apps/web/lib/types.ts`** - Product and Outfit type definitions
- **`apps/web/components/outfit/OutfitDetail.tsx`** - Current display implementation
- **`apps/web/components/outfit/OutfitProductList.tsx`** - Product list display
- **`apps/web/lib/services/image-generation-service.ts`** - Understand prompt building logic
- **`apps/web/components/chat/ChatAssistant.tsx`** - Understand flat-lay generation flow

### New Files
- **`apps/web/lib/utils/product-visual-validator.ts`** - New utility for validating product visual consistency

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Product Visual Validator Utility
- Create `apps/web/lib/utils/product-visual-validator.ts`
- Add function `validateProductVisualConsistency(product: Product): { isConsistent: boolean; issues: string[] }`
- Add function `getProductVisualCategory(product: Product): 'masculine' | 'feminine' | 'neutral'`
- Implement detection for common mismatches:
  - "heels" in name but oxford/derby/brogue in thumbnail URL patterns
  - "formal heels" or "women's shoes" but men's shoe keywords in image path
- Add type definitions for visual validation results

### 2. Enhance FlatLayItem Transformation
- Modify `transformToFlatLayItems()` in `useFlatLayGeneration.ts`
- Add visual consistency check before including item in flat-lay generation
- For footwear items, validate that the product's `visualDescription` or derived description matches the product image category
- Add warning log when visual mismatch detected
- Consider adding `thumbnailUrl` to FlatLayItem for optional composite image approach

### 3. Update Outfit Generator Product Selection
- Enhance `isWomenFootwear()` in `outfit-generator.ts` to also check image URL patterns
- Add new function `validateFootwearImageConsistency(product: Product): boolean`
- In `filterProductsByGender()`, add image-based validation for footwear products
- Ensure feminine outfits only include products whose thumbnails show feminine items
- Log discrepancies for data quality tracking

### 4. Add Product Image URL Pattern Detection
- In `product-visual-validator.ts`, add function to analyze image URLs
- Detect common patterns in image paths that indicate product style:
  - `/oxford/`, `/derby/`, `/brogue/`, `/wingtip/` = masculine
  - `/heel/`, `/pump/`, `/stiletto/`, `/mule/` = feminine
- Create mapping of URL patterns to gender categories

### 5. Implement Fallback Strategy for Mismatched Products
- When a visual mismatch is detected between flat-lay prompt and product thumbnail:
  - Option A: Exclude the product from the outfit and find a replacement
  - Option B: Update the flat-lay prompt to match the actual product image
  - Option C: Flag the product for review and use text description as primary
- Implement Option A as the primary strategy with Option B as fallback

### 6. Add Logging and Metrics
- Add structured logging for visual consistency checks
- Log format: `[VisualValidator] Product ${sku}: ${status} - ${details}`
- Track mismatched products for data quality improvement
- Add console warnings in development mode for easier debugging

### 7. Update Type Definitions
- Extend `FlatLayItem` interface in `image-types.ts` to include optional `thumbnailUrl` field
- Add `ProductVisualConsistency` type to track validation results
- Update `Product` interface documentation to clarify expected image content

### 8. Add Unit Tests for Visual Validation
- Create test file `apps/web/lib/utils/product-visual-validator.test.ts`
- Test cases:
  - Feminine product with feminine image URL = consistent
  - Feminine product with masculine image URL = inconsistent
  - Neutral product with any image = consistent
  - Edge cases: missing image URLs, unusual URL patterns

### 9. Validate Complete Data Flow
- Test the entire flow from outfit generation to flat-lay display
- Verify that product list thumbnails match the generated flat-lay image content
- Ensure no masculine footwear appears in feminine outfit recommendations
- Confirm logging captures any remaining mismatches

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm lint` - Ensure no linting errors in modified files
- `cd apps/web && pnpm build` - Verify TypeScript compilation succeeds
- `cd apps/web && pnpm test` - Run tests including new visual validator tests
- Manual test: Generate outfit recommendations and verify flat-lay matches product list

### Manual Verification Checklist
1. Navigate to chat and request a women's work outfit
2. View the outfit detail page
3. Verify the flat-lay image shows the same items as the product list
4. Pay special attention to footwear - heels should show heels, not oxfords
5. Check browser console for any `[VisualValidator]` warnings

## Notes

### Design Decisions
1. **Image URL pattern matching is heuristic** - This approach relies on common naming conventions in image URLs. It may not catch all mismatches if image files are generically named.

2. **Product data quality is the root cause** - The best long-term fix is to ensure product catalog data has accurate gender classification and consistent product images. This fix is a mitigation layer.

3. **Replacement strategy preferred over prompt modification** - Finding a correctly-matched product is preferable to modifying the AI prompt to generate images of items that don't match available products.

4. **Performance consideration** - Visual validation adds minimal overhead as it operates on string pattern matching, not actual image analysis.

### Future Improvements
- Consider implementing actual image analysis (ML-based) to detect product style from thumbnails
- Add admin dashboard flag for products with visual consistency issues
- Implement product catalog validation script to identify data quality issues at import time
