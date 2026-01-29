# Chore: Fix outfit product list not reflecting visual consistency replacements

## Metadata
adw_id: `effc3a43`
prompt: `Fix outfit product list not reflecting visual consistency replacements`

## Chore Description

The flat-lay AI image generation correctly shows feminine heels based on product text descriptions and visual consistency validation. However, the "Items in this outfit" section in `OutfitDetail` still displays the ORIGINAL product with a masculine oxford shoe thumbnail, creating a visual mismatch.

**Current Behavior:**
- Flat-lay image: Shows correct feminine stiletto heels (generated from text description)
- Product list: Shows incorrect masculine oxford shoes thumbnail (from original product data)

**Root Cause:**
The visual consistency validation and product replacement logic exists and works correctly in:
- `apps/web/lib/utils/product-visual-validator.ts` (findVisuallyConsistentReplacement)
- `apps/web/components/chat/ChatAssistant.tsx` (applyProductReplacements, generateFlatLayForOutfit)

The `generateFlatLayForOutfit` function in ChatAssistant DOES update the message state with replaced items. However, there's a timing/data flow issue:

1. `OutfitRecommendationCard` receives outfit as a prop from parent message state
2. When user clicks "View Outfit", it calls `onViewOutfit(outfit)` passing the outfit reference
3. The `selectOutfit` function in `useOutfitDiscovery` stores this outfit in state
4. `OutfitDetail` receives this stored outfit via props

The issue: React's rendering cycle may cause the outfit passed to `onViewOutfit` to be stale (from before the async flat-lay generation completed and updated message state). Additionally, if the user clicks "View Outfit" before flat-lay generation completes, they'll see the original unreplaced items.

**Expected Behavior:**
Both the flat-lay image AND product list should display the SAME products. If visually inconsistent products were replaced during flat-lay generation, the OutfitDetail product list MUST show the replacement products.

## Relevant Files

### Files to Modify

- **apps/web/components/chat/ChatAssistant.tsx**
  - The `generateFlatLayForOutfit` function already updates message state with `effectiveOutfit.items`
  - Need to ensure the outfit object stored in message state is the source of truth for OutfitDetail
  - Lines 119-290: generateFlatLayForOutfit with product replacement logic

- **apps/web/components/chat/OutfitRecommendationCard.tsx**
  - Currently passes `outfit` prop directly to `onViewOutfit(outfit)` (line 221)
  - This may pass stale outfit data if flat-lay generation is still in progress or just completed
  - The outfit prop may not reflect the latest state from parent

- **apps/web/app/page.tsx**
  - The `selectOutfit` function stores outfit in `useOutfitDiscovery` state (line 189)
  - This creates a copy at that moment, potentially before message state is updated

- **apps/web/lib/hooks/useOutfitDiscovery.ts**
  - The `selectedOutfit` state stores the outfit when `selectOutfit` is called (lines 64-67)
  - This is a snapshot that doesn't update when ChatAssistant updates message state

### Reference Files (No Changes Needed)

- **apps/web/components/outfit/OutfitDetail.tsx**
  - Receives `outfit` prop and displays `outfit.items` in `OutfitProductList` (line 82-84)
  - No changes needed here - it correctly displays what it receives

- **apps/web/lib/utils/product-visual-validator.ts**
  - Contains `findReplacementsForInconsistentProducts` function
  - Product replacement logic is correct, no changes needed

- **apps/web/lib/hooks/useFlatLayGeneration.ts**
  - Contains `onProductsReplaced` callback mechanism (lines 84, 567-570)
  - Could be used as alternative approach but not primary fix

## Step by Step Tasks

### 1. Update OutfitRecommendationCard to Track Latest Outfit State

The component receives `outfit` prop but this may be stale. Update to watch for outfit item changes:

- Add `useEffect` to track when `outfit.items` changes (after replacements)
- Store the latest outfit reference internally
- Pass the latest outfit to `onViewOutfit` when user clicks "View Outfit"

### 2. Ensure ChatAssistant Message State Updates Are Propagated

The `generateFlatLayForOutfit` already updates `msg.outfits[].items` in message state. Verify this update propagates correctly:

- Check that React detects the state change (deep object mutation vs new object)
- Ensure the outfit object passed to OutfitRecommendationCard reflects the updated items
- The current implementation uses spread operators which should create new references

### 3. Prevent Viewing Outfit Before Flat-lay Generation Completes (Optional UX Enhancement)

Consider disabling "View Outfit" button while `isGeneratingFlatLay` is true:

- This ensures user always sees the final state with correct products
- Add loading indicator or disabled state to the button
- This is optional but improves UX consistency

### 4. Alternative Approach: Have OutfitDetail Fetch Latest Outfit from Message State

If the above doesn't fully solve the issue, implement a lookup mechanism:

- Pass a callback or context that allows OutfitDetail to get the latest outfit data
- Instead of storing outfit in `useOutfitDiscovery` state, store just the outfit ID
- Have OutfitDetail look up the outfit from ChatAssistant's message state by ID

### 5. Validation and Testing

- Test the full flow: Send message → Receive outfit recommendation → Wait for flat-lay generation → Click "View Outfit"
- Verify the product thumbnails in OutfitDetail match the items shown in the flat-lay image
- Test edge case: Click "View Outfit" while flat-lay is still generating
- Check console logs for replacement messages to confirm replacements are happening

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - TypeScript compilation check
- `cd apps/web && pnpm lint` - ESLint validation
- `cd apps/web && pnpm build` - Full production build to catch any errors
- Manual test: Send a chat message that triggers outfit recommendations, wait for flat-lay generation, click "View Outfit", verify product thumbnails match flat-lay image

## Notes

### Key Insight on Data Flow

The current data flow is:
```
ChatAssistant → message.outfits → OutfitRecommendationCard (prop) → onViewOutfit(outfit)
                                                                          ↓
                                  OutfitDetail ← selectedOutfit ← useOutfitDiscovery
```

The issue is that `selectedOutfit` in `useOutfitDiscovery` is a snapshot taken when user clicks, not a reactive reference to the message state. Any subsequent updates to message.outfits don't propagate to OutfitDetail.

### Recommended Fix Strategy

The simplest fix is to ensure `OutfitRecommendationCard` always passes the current prop value when clicked. Since React should re-render the component with updated props after `setMessages` in ChatAssistant, the `outfit` prop should be current at click time. However, there may be subtle race conditions or closure issues.

The most robust fix would be:
1. Add outfit ID tracking instead of full outfit object in `useOutfitDiscovery`
2. Have a centralized outfit state/context that both ChatAssistant and OutfitDetail can access
3. When viewing outfit, look up by ID from this centralized state

### Visual Consistency Replacement Flow

When `generateFlatLayForOutfit` runs:
1. Calls `findReplacementsForInconsistentProducts(outfit.items, productCatalog, { targetGender: 'women' })`
2. Gets `replacementResult.replacements` map (originalSKU → replacement Product)
3. Creates `effectiveOutfit` with replaced items via `applyProductReplacements`
4. Updates message state: `msg.outfits[].items = effectiveOutfit.items`
5. Generates flat-lay using `effectiveOutfit.items` (correct products)

The flat-lay image and message state items are now in sync. The issue is that OutfitDetail doesn't read from this updated message state.
