# Chore: Replace Outfit Card Thumbnail with Flat-Lay LOOKs Image

## Metadata
adw_id: `87ec5500`
prompt: `Replace outfit recommendation card thumbnail with flat-lay LOOKs image showing all recommended items, keeping ดูลุค button.`

## Chore Description
Currently, the outfit recommendation card shows a single product thumbnail (just a dress on a mannequin). This chore changes the card to display a flat-lay image showing ALL recommended items (dress + shoes + accessories) laid out together on a white background.

The card structure remains the same (title, item count, price, and buttons: ดูลุค, heart, share), but the image area now shows the generated flat-lay composition instead of a single product thumbnail.

Additionally, the separate LooksInspiration component that currently appears as a separate message below the card should be removed - the flat-lay image is now embedded directly in the card itself.

**Key Changes:**
1. OutfitRecommendationCard displays flat-lay image instead of product thumbnail
2. Loading skeleton shown while flat-lay is generating
3. Separate LooksInspiration message after card is removed (redundant)
4. All existing button functionality preserved (ดูลุค, heart, share)

## Relevant Files
Use these files to complete the chore:

- **apps/web/components/chat/OutfitRecommendationCard.tsx** - Main card component to modify. Currently uses `outfit.imageUrl` which is the first product thumbnail. Needs to accept `flatLayImageUrl` prop and show loading state.

- **apps/web/components/chat/ChatAssistant.tsx** - Orchestrates the chat flow. Currently generates flat-lay image AFTER showing the card, then displays LooksInspiration as separate message. Needs to:
  1. Generate flat-lay BEFORE/WHILE rendering outfit card
  2. Pass flat-lay imageUrl to OutfitRecommendationCard
  3. Remove the separate LooksInspiration message rendering

- **apps/web/components/chat/ChatMessage.tsx** - Renders chat messages. Contains LooksInspiration rendering for image messages. May need minor updates for message type handling.

- **apps/web/components/chat/LooksInspiration.tsx** - Existing component for displaying generated outfit images. The loading skeleton and image display logic can be referenced for the card.

- **apps/web/lib/types.ts** - Contains ChatMessage and Outfit types. May need to add `flatLayImageUrl` to Outfit type.

- **apps/web/lib/types/image-types.ts** - Contains FlatLayItem type and image-related interfaces.

### New Files
No new files needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Outfit Type with Flat-Lay Image URL
- In `apps/web/lib/types.ts`, add `flatLayImageUrl?: string` property to the `Outfit` interface
- Add `flatLayImageBase64?: string` for base64 fallback support
- Add `isGeneratingFlatLay?: boolean` for loading state tracking

### 2. Update OutfitRecommendationCard Component
- Modify `apps/web/components/chat/OutfitRecommendationCard.tsx` to:
  - Accept flat-lay image URL/base64 from outfit prop
  - Change image display area from 20x24 thumbnail to larger aspect-square container for flat-lay
  - Add loading skeleton when `outfit.isGeneratingFlatLay` is true
  - Use `outfit.flatLayImageUrl || outfit.flatLayImageBase64` for image source when available
  - Fallback to first product thumbnail `outfit.imageUrl` when flat-lay is not available
  - Keep all existing buttons (ดูลุค, heart, share) positioned at bottom
  - Adjust card layout to accommodate larger flat-lay image area

### 3. Modify ChatAssistant to Generate Flat-Lay for Card
- In `apps/web/components/chat/ChatAssistant.tsx`:
  - When outfit recommendation is received from API, immediately trigger flat-lay generation
  - Store flat-lay generation state per outfit (loading, imageUrl, error)
  - Pass flat-lay imageUrl to outfit object before rendering OutfitRecommendationCard
  - Show loading message 'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨' as text message while generating
  - When flat-lay generation completes, update the outfit object with `flatLayImageUrl`
  - Remove the code that adds separate LooksInspiration image message after outfit card

### 4. Remove Separate LooksInspiration Message Flow
- In `apps/web/components/chat/ChatAssistant.tsx`:
  - Identify and remove the code block that creates `imageMessage: ChatMessageType` with displayMode 'flat-lay' after outfit recommendations
  - The flat-lay is now embedded in the card, not a separate message
  - Keep the acknowledgment message 'กำลังสร้างภาพ LOOKs...' as it appears during loading
  - After flat-lay generation completes, just update the outfit object in place (no new message)

### 5. Update Message Flow and State Management
- In `apps/web/components/chat/ChatAssistant.tsx`:
  - Create a helper function `generateFlatLayForOutfit(outfit)` that handles the API call
  - Use `useState` to track flat-lay generation state per outfit ID
  - When flat-lay completes, use `setMessages` to update the existing message's outfit with the new image
  - Ensure React re-renders the OutfitRecommendationCard with the new image

### 6. Adjust Card Layout for Flat-Lay Display
- In `apps/web/components/chat/OutfitRecommendationCard.tsx`:
  - Change image container from `w-20 h-24` to responsive aspect-square
  - Use `object-contain` for flat-lay images (not `object-cover`)
  - Add subtle border or shadow to flat-lay image container
  - Ensure card still fits well in the chat flow (max-width constraint)

### 7. Validate Implementation
- Verify flat-lay image appears in outfit recommendation card
- Verify loading skeleton shows while image is generating
- Verify 'ดูลุค' button still works and shows outfit details
- Verify heart and share buttons remain functional
- Verify no separate LooksInspiration message appears below card
- Verify fallback to product thumbnail when flat-lay generation fails

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm lint` - Ensure no linting errors
- `cd apps/web && pnpm build` - Ensure production build succeeds
- Manual testing: Start dev server and test chat flow with outfit recommendation

## Notes
- The loading state should show skeleton in the card's image area, not a separate component
- Keep the existing LooksInspiration component as-is (it may be used elsewhere)
- The acknowledgment message 'กำลังสร้างภาพ LOOKs...' should still appear as a chat message during loading
- Consider adding retry functionality if flat-lay generation fails (show fallback thumbnail with retry button)
- The flat-lay image should use `displayMode: 'flat-lay'` (1:1 aspect ratio) not portrait (3:4)
