# Chore: Fix Inconsistent Outfit Recommendation Image Format

## Metadata
adw_id: `74e07357`
prompt: `Investigate and fix inconsistent outfit recommendation image format in LooksInspiration component. Issue: Some outfit cards display mannequin-style images instead of flat-lay format. Expected behavior per data/personas/prompt_gen/looks.md: 'flat-lay image with each item individually placed and separated, styled in an elegant composition on a white background'. Root cause analysis needed.`

## Chore Description
The outfit recommendation cards in the chat interface are displaying inconsistent image formats. Some cards correctly show AI-generated flat-lay images (items individually placed on a white background), while others incorrectly show mannequin-style product images (thumbnails from the product catalog).

The expected behavior, as defined in `data/personas/prompt_gen/looks.md`, is that all outfit recommendations should display as:
> "flat-lay image with each item individually placed and separated, styled in an elegant composition on a white background"

This inconsistency degrades the user experience and visual coherence of the fashion recommendation interface.

## Relevant Files
Use these files to complete the chore:

### Primary Components (Investigation Required)
- **`apps/web/components/chat/OutfitRecommendationCard.tsx`** - The component that renders individual outfit cards. Lines 55-58 contain the image source logic that determines whether to display flat-lay or fallback images:
  ```typescript
  const flatLayImage = outfit.flatLayImageUrl || outfit.flatLayImageBase64
  const fallbackImage = outfit.imageUrl
  const displayImage = flatLayImage || fallbackImage
  ```
  This is the primary suspect for the inconsistency - when flat-lay generation fails or is slow, it falls back to `outfit.imageUrl` which is a mannequin-style product thumbnail.

- **`apps/web/components/chat/ChatAssistant.tsx`** - The parent component that manages outfit recommendations and triggers flat-lay generation. Lines 119-290 contain `generateFlatLayForOutfit()` which handles the AI image generation flow. If this function fails or takes too long, the card shows the fallback image.

- **`apps/web/components/chat/LooksInspiration.tsx`** - While this component handles AI-generated outfit images in chat messages, it's not directly involved in the outfit card display issue. The issue is in `OutfitRecommendationCard.tsx`.

### Image Generation Services
- **`apps/web/lib/services/image-generation-service.ts`** - The `OpenRouterImageClient.generateFlatLayImage()` method (lines 234-284) handles flat-lay generation. The `buildFlatLayPrompt()` method (lines 295-342) constructs the AI prompt that specifies flat-lay requirements.

- **`apps/web/app/api/generate-image/route.ts`** - The API endpoint that handles image generation requests. Lines 428-433 route flat-lay generation requests.

### Fallback Components
- **`apps/web/components/outfit/FlatLayComposite.tsx`** - A CSS-based fallback component that creates a flat-lay aesthetic composition from product thumbnails. This could be used as an intermediate fallback instead of showing mannequin images.

### Type Definitions
- **`apps/web/lib/types.ts`** - The `Outfit` interface (lines 30-55) defines the image fields:
  - `imageUrl?: string` - Product thumbnail (mannequin-style)
  - `flatLayImageUrl?: string` - AI-generated flat-lay image
  - `flatLayImageBase64?: string` - AI flat-lay as base64 fallback
  - `isGeneratingFlatLay?: boolean` - Loading state flag

### Reference Documentation
- **`data/personas/prompt_gen/looks.md`** - The canonical specification for flat-lay image format: "flat-lay image with each item individually placed and separated, styled in an elegant composition on a white background"

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Root Cause in OutfitRecommendationCard
- Confirm that the image inconsistency occurs when `flatLayImage` is falsy and the code falls back to `outfit.imageUrl`
- Check if `isGenerating` flag is properly synchronized with actual generation state
- Verify that flat-lay images are being generated and properly stored in outfit objects

### 2. Add FlatLayComposite as Intermediate Fallback
- Modify `OutfitRecommendationCard.tsx` to use `FlatLayComposite` when flat-lay generation is complete but failed (no AI image available)
- The fallback priority should be:
  1. AI-generated flat-lay image (`flatLayImageUrl` or `flatLayImageBase64`)
  2. CSS-based `FlatLayComposite` component (uses product thumbnails but arranges them in flat-lay style)
  3. Never show raw mannequin-style product thumbnail for the main card image

### 3. Update Image Display Logic
- In `OutfitRecommendationCard.tsx`, replace the simple fallback pattern:
  ```typescript
  // Current (problematic)
  const displayImage = flatLayImage || fallbackImage
  ```
  With a more sophisticated approach that uses `FlatLayComposite` when no AI flat-lay is available:
  ```typescript
  // Updated (uses FlatLayComposite fallback)
  const hasFlatLayImage = !!(outfit.flatLayImageUrl || outfit.flatLayImageBase64)
  // If no flat-lay image, render FlatLayComposite instead of fallback mannequin image
  ```

### 4. Handle Loading State Properly
- Ensure the loading skeleton is shown while `isGeneratingFlatLay` is true
- When generation completes (success or failure), the card should show either:
  - The AI flat-lay image (if successful)
  - The `FlatLayComposite` (if AI generation failed but items are available)

### 5. Verify Visual Consistency
- Test that all outfit cards in chat now display with consistent flat-lay aesthetic
- Verify no mannequin-style product images appear as the main card image
- Confirm loading states work correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm lint` - Ensure no TypeScript or ESLint errors
- `cd apps/web && pnpm build` - Verify production build succeeds
- `cd apps/web && pnpm dev` - Run development server and manually test:
  1. Start a chat session and request outfit recommendations
  2. Verify all outfit cards show flat-lay style images (not mannequin thumbnails)
  3. Test with and without OPENROUTER_API_KEY to verify fallback behavior
  4. Check that loading skeletons appear while generating

## Notes
- The `FlatLayComposite` component already exists and handles different item counts (1-item, 2-item, 3+ items) with appropriate compositions
- The component uses CSS transforms to create an artistic flat-lay aesthetic from product thumbnails
- This is a visual consistency fix that should not affect functionality or performance significantly
- The fix ensures that even when AI image generation fails or is unavailable, users see a visually consistent flat-lay presentation
