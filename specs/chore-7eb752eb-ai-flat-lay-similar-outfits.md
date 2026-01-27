# Chore: AI Flat-Lay Images for Similar Outfits

## Metadata
adw_id: `7eb752eb`
prompt: `Generate AI flat-lay images for Similar Outfits section instead of using CSS composite. Currently Similar Outfits in SimilarOutfits.tsx uses FlatLayComposite (CSS-based) which shows overlapping product images. The user wants REAL AI-generated flat-lay images like the chat session displays - showing all items artfully arranged together in ONE cohesive image on white background.`

## Chore Description
Replace the CSS-based `FlatLayComposite` component in the Similar Outfits section with real AI-generated flat-lay images. Currently, when a similar outfit doesn't have a pre-generated `flatLayImageUrl` or `flatLayImageBase64`, the system falls back to `FlatLayComposite` which creates a visual composition by overlapping individual product images using CSS transforms. This looks unprofessional compared to the chat session's AI-generated flat-lay images.

The goal is to:
1. Detect when a similar outfit lacks a flat-lay image
2. Trigger AI generation using the existing `/api/generate-image` endpoint with `generationType: 'flat-lay'`
3. Show a loading skeleton/placeholder during generation
4. Cache generated images to avoid re-generation
5. Generate lazily (on viewport visibility) to minimize API calls

## Relevant Files
Use these files to complete the chore:

- **`apps/web/components/outfit/SimilarOutfits.tsx`** - Main component to modify. Currently uses `FlatLayComposite` as fallback (line 38). Needs to trigger AI generation instead.
- **`apps/web/components/outfit/FlatLayComposite.tsx`** - CSS-based composite component to be replaced with AI generation. May be removed or kept as ultimate fallback.
- **`apps/web/app/api/generate-image/route.ts`** - API endpoint that handles `generationType: 'flat-lay'` (lines 306-317, 428-434). Already supports flat-lay generation with `flatLayItems` parameter.
- **`apps/web/lib/services/image-generation-service.ts`** - Contains `generateFlatLayImage()` method (lines 234-284) with the prompt format from `data/personas/prompt_gen/looks.md`.
- **`apps/web/lib/types/image-types.ts`** - Type definitions for `FlatLayItem`, `FlatLayRequest`, `ImageGenerationResponse`.
- **`apps/web/lib/types.ts`** - Contains `Outfit` and `Product` interfaces with `flatLayImageUrl`, `flatLayImageBase64`, `isGeneratingFlatLay` fields.
- **`apps/web/components/chat/OutfitRecommendationCard.tsx`** - Reference implementation showing how chat generates and displays flat-lay images with loading states (lines 46-50, 168-200).

### New Files
- **`apps/web/lib/hooks/useFlatLayGeneration.ts`** - New custom hook to encapsulate flat-lay generation logic with caching and viewport visibility detection.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create the useFlatLayGeneration Custom Hook
- Create `apps/web/lib/hooks/useFlatLayGeneration.ts`
- Implement state management for generation status (`isGenerating`, `imageBase64`, `error`)
- Add function to call `/api/generate-image` with `generationType: 'flat-lay'`
- Accept outfit items as input and transform to `FlatLayItem[]` format
- Implement localStorage caching strategy using outfit ID as key
- Add Intersection Observer integration for lazy loading (generate only when outfit card is visible)
- Export the hook with clear return type: `{ isGenerating, flatLayImageBase64, error, generateFlatLay }`

### 2. Update SimilarOutfits Component to Use AI Generation
- Import the new `useFlatLayGeneration` hook
- Import `Skeleton` from `@/components/ui/skeleton` for loading state
- For each outfit without `flatLayImageUrl`/`flatLayImageBase64`:
  - Check localStorage cache first for previously generated images
  - Use Intersection Observer to detect when the card enters viewport
  - Trigger flat-lay generation via the hook when visible and not cached
  - Display loading skeleton during generation (similar to OutfitRecommendationCard lines 170-184)
  - Display generated image once ready
  - Store generated base64 in localStorage cache with outfit.id as key
- Keep `FlatLayComposite` as ultimate fallback only if API call fails after retries
- Ensure each outfit card manages its own generation state independently

### 3. Implement Loading Skeleton UI in SimilarOutfits
- Add animated loading skeleton matching the card's aspect ratio (3:4)
- Show bouncing dots animation with "กำลังสร้างภาพ LOOKs..." text (consistent with OutfitRecommendationCard)
- Ensure skeleton fills the card image area completely

### 4. Add LocalStorage Caching for Generated Images
- Create cache key format: `flat-lay-${outfit.id}`
- Store base64 image data in localStorage
- Set cache TTL (e.g., 24 hours or 7 days) using stored timestamp
- Check cache before triggering API call
- Clear expired cache entries on component mount

### 5. Implement Intersection Observer for Lazy Generation
- Use React's `useRef` and `useEffect` to create Intersection Observer
- Observe each outfit card's container element
- Trigger generation only when `isIntersecting` is true
- Disconnect observer after image is generated or retrieved from cache
- Use threshold of 0.1 (10% visibility) to start generation early

### 6. Handle Error States Gracefully
- If API returns error, show `FlatLayComposite` as fallback (don't break UI)
- Log errors to console for debugging
- Consider retry logic (1 retry with exponential backoff)
- Don't cache failed attempts

### 7. Optimize Performance and Prevent Duplicate Calls
- Use `useCallback` for generation function
- Add ref tracking to prevent duplicate API calls for same outfit
- Debounce rapid visibility changes
- Limit concurrent generations (max 2-3 simultaneous API calls)

### 8. Validate the Implementation
- Test with outfits that have no existing flat-lay images
- Verify loading skeleton displays correctly
- Confirm images cache properly in localStorage
- Test lazy loading by scrolling Similar Outfits into view
- Verify fallback to FlatLayComposite on API error
- Check no duplicate API calls for same outfit

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `cd apps/web && pnpm lint` - Check for linting issues
- `cd apps/web && pnpm dev` - Start dev server and manually test:
  1. Open chat and get outfit recommendations
  2. Click on an outfit to open OutfitDetail modal
  3. Scroll down to "Similar Outfits" section
  4. Verify flat-lay images generate with loading skeleton
  5. Refresh page and verify cached images load instantly
  6. Clear localStorage and verify generation triggers again

## Notes
- The existing API endpoint at `/api/generate-image` already fully supports flat-lay generation with `generationType: 'flat-lay'` and `flatLayItems` array. No backend changes needed.
- The `generateFlatLayImage()` method in `image-generation-service.ts` builds prompts using the format: "Generate an accurate flat-lay fashion image with each item individually placed and separated, styled in an elegant composition on a white background"
- Consider rate limiting implications - the API has 10 requests/minute limit per IP. With max 6 similar outfits shown, this should be manageable but lazy loading helps.
- LocalStorage has ~5MB limit. Base64 images are typically 50-200KB each. With 6 outfits max, storage should be fine.
- The `Outfit` interface already has `isGeneratingFlatLay` flag that can be used for tracking generation state per outfit.
