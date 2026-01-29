# Chore: Fix Outfit Data Consistency and Similar Outfits Display in Detail Modal

## Metadata
adw_id: `54dca765`
prompt: `Fix outfit data consistency and similar outfits display in the outfit detail modal. There are two issues: 1) When clicking 'ดูลุค' (View Look) button on a chat outfit card, the items displayed in 'Items in this outfit' section don't match the outfit shown in chat - they appear to be placeholder/random items (e.g., chat shows 'Central Dress & Shoes' but detail shows 'Floral Summer Dress', 'Leather Oxford Shoes', 'Leather Belt'). The outfit detail modal should display the EXACT same products that were used to generate the outfit in the chat session. Trace the data flow from OutfitCard click -> outfit detail modal and ensure the correct outfit.items array is passed and rendered. 2) The 'Similar outfits' section at the bottom of the outfit detail modal displays individual product images instead of flat-lay outfit images. It should display flat-lay images consistent with how outfits appear in the chat session and main grid. Update the SimilarOutfits component to use the outfit's imageUrl (flat-lay) instead of showing individual product thumbnails. Check components/outfit/OutfitDetailModal.tsx, components/outfit/OutfitCard.tsx, and any related outfit rendering components.`

## Chore Description
This chore fixes two critical issues with the outfit detail modal:

### Issue 1: Outfit Items Data Inconsistency
When a user clicks the "ดูลุค" (View Look) button on an `OutfitRecommendationCard` in the chat, the `OutfitDetail` component displays different items than what was shown in the chat session. The problem occurs because:

1. The `OutfitRecommendationCard` correctly receives the outfit with its items from the chat response via `ChatAssistant`
2. When `onViewOutfit(outfit)` is called, it triggers `selectOutfit(outfit)` in `page.tsx`
3. The `useOutfitDiscovery` hook stores this outfit in `selectedOutfit` state
4. The `OutfitDetail` component receives `selectedOutfit` as its `outfit` prop
5. **The issue:** The `getSimilarOutfitsForSelected()` function uses `getSimilarOutfits(selectedOutfit, filteredOutfits, 6)` which may return outfits from the pre-generated `allOutfits` array, not from the chat response

However, upon closer code analysis, the actual data flow appears correct. The more likely cause is:
- The chat API returns outfits with items
- These items may have different data structure or be missing key properties
- The `OutfitDetail` component receives and displays `outfit.items` correctly
- **Real issue**: The outfits returned from the discovery grid (`allOutfits`) have different `items` than chat-generated outfits, and somewhere the wrong outfit is being displayed

**Key Finding**: When clicking "ดูลุค" from chat, the outfit passed should be the exact chat outfit. The issue may be that the selected outfit gets replaced or overwritten by a matching outfit from `allOutfits` by ID.

### Issue 2: Similar Outfits Display
The `SimilarOutfits` component at `apps/web/components/outfit/SimilarOutfits.tsx` already correctly uses `outfit.imageUrl` for the flat-lay image display. However, the `similarOutfits` array passed to it comes from `getSimilarOutfitsForSelected()` which pulls from `filteredOutfits` (discovery grid outfits), not chat-generated outfits. These discovery outfits may not have `imageUrl` or `flatLayImageUrl` populated.

## Relevant Files
Use these files to complete the chore:

- **`apps/web/app/page.tsx`** - Main page component that orchestrates the data flow. The `selectOutfit` function and `getSimilarOutfitsForSelected` need review. Line 189 passes `selectOutfit` to `ChatAssistant`, and lines 192-199 render `OutfitDetail` with `selectedOutfit`.

- **`apps/web/components/chat/OutfitRecommendationCard.tsx`** - Chat outfit card component. Line 221 triggers `onViewOutfit(outfit)` when clicking "ดูลุค". This passes the correct outfit data.

- **`apps/web/components/chat/ChatAssistant.tsx`** - Chat assistant managing outfit state. Line 396 passes `onViewOutfit` to cards. The outfit data here includes `flatLayImageUrl` and `flatLayImageBase64` from image generation.

- **`apps/web/lib/hooks/useOutfitDiscovery.ts`** - Hook managing outfit selection. Line 64-67 defines `selectOutfit` which directly stores the outfit in state. The outfit should be preserved as-is.

- **`apps/web/components/outfit/OutfitDetail.tsx`** - Main detail view component. Lines 82-85 render `OutfitProductList` with `outfit.items`. This correctly uses the passed outfit.

- **`apps/web/components/outfit/OutfitProductList.tsx`** - Renders the product list using passed `products` prop.

- **`apps/web/components/outfit/ProductItemCard.tsx`** - Individual product card renderer.

- **`apps/web/components/outfit/SimilarOutfits.tsx`** - Similar outfits grid. Already uses `outfit.imageUrl` correctly (lines 26-34), but receives outfits from discovery rather than chat.

- **`apps/web/lib/utils/product-utils.ts`** - Contains `getSimilarOutfits` function used for finding similar outfits.

- **`apps/web/lib/types.ts`** - Type definitions for `Outfit` and `Product` interfaces.

### New Files
None required.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Investigate the Data Flow for Issue 1
- Add console.log statements to trace the outfit data through the flow:
  - In `OutfitRecommendationCard.tsx` line 221, log the outfit being passed to `onViewOutfit`
  - In `page.tsx` `selectOutfit` callback, log the received outfit
  - In `OutfitDetail.tsx`, log the received `outfit` prop and its `items`
- Run the app and click "ดูลุค" from a chat outfit card
- Compare the logged outfit items at each step to identify where data is lost or changed

### 2. Debug the Similar Outfits Data Source
- Check the `getSimilarOutfitsForSelected()` function in `page.tsx` (line 147-150)
- Verify that `filteredOutfits` contains outfits with proper `imageUrl` values
- Log the `similarOutfits` array passed to `OutfitDetail` to check if they have `imageUrl`

### 3. Fix Outfit Items Preservation
- If the investigation reveals the issue, implement the fix
- Possible fixes:
  - Ensure `selectOutfit` in `useOutfitDiscovery.ts` preserves the full outfit object without modification
  - If there's a lookup by ID that replaces chat outfits with discovery outfits, remove that logic
  - Ensure the outfit.items array reference is preserved through the state updates

### 4. Enhance Similar Outfits for Chat Context
- Modify `page.tsx` to provide better similar outfits for chat-originated selections
- Consider keeping track of chat-generated outfits separately from discovery outfits
- Ensure similar outfits have `flatLayImageUrl` or `imageUrl` populated
- If similar outfits come from discovery and don't have images, consider:
  - Using product thumbnail grid as fallback
  - Generating flat-lay images on-demand
  - Filtering to only show outfits with images

### 5. Update SimilarOutfits Component Fallback
- In `SimilarOutfits.tsx`, add better handling for outfits without `imageUrl`:
  - Option A: Show a grid of product thumbnails from `outfit.items`
  - Option B: Show a placeholder image
  - Option C: Filter out outfits without images
- Update the component to prefer `flatLayImageUrl` over `imageUrl` for consistency

### 6. Validate the Fix
- Test the complete flow:
  1. Start a chat and request outfit recommendations
  2. Wait for flat-lay images to generate
  3. Click "ดูลุค" on a chat outfit card
  4. Verify the detail modal shows the EXACT same items as the chat card
  5. Verify the similar outfits section shows flat-lay images (not product thumbnails)
- Test edge cases:
  - Chat outfit before flat-lay generation completes
  - Discovery grid outfit selection (should still work)
  - Similar outfit click navigation

### 7. Clean Up Debug Code
- Remove any console.log statements added during investigation
- Ensure no debug artifacts remain in the code

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure the build succeeds with no TypeScript errors
- `cd apps/web && pnpm lint` - Ensure no linting errors
- `cd apps/web && pnpm dev` - Run the development server to manually test:
  1. Send a chat message requesting outfit recommendations
  2. Wait for flat-lay images to appear in outfit cards
  3. Click "ดูลุค" (View Look) button
  4. Verify "Items in this outfit" section shows exact same products as chat card
  5. Verify "Similar outfits" section shows flat-lay outfit images
  6. Click a similar outfit and verify navigation works

## Notes
- The chat outfit data includes dynamically generated `flatLayImageUrl` and `flatLayImageBase64` which should be preserved when viewing details
- Discovery grid outfits are pre-generated and may have different data structure than chat-generated outfits
- The `SimilarOutfits` component already has correct image handling (uses `outfit.imageUrl`) but the issue is likely the source data not having images populated
- Consider whether chat-generated outfits should be added to the discovery pool to enable proper similar outfit matching
- The Thai button label "ดูลุค" means "View Look" - ensure this button's click handler correctly passes the full outfit object
