# Chore: Fix Similar Outfits to Display Flat-Lay Format

## Metadata
adw_id: `fa2cf018`
prompt: `Fix similar outfits to display flat-lay format like main outfit recommendations. Root cause: Similar outfits use lazy Intersection Observer generation while main outfits use proactive generation. Fix by: 1) In OutfitDetail.tsx, add useEffect to proactively generate flat-lay images for similarOutfits using the same generateFlatLayForOutfit pattern from ChatAssistant.tsx. 2) Track generation state for similar outfits and update them with flatLayImageUrl/flatLayImageBase64 before passing to SimilarOutfits component. 3) Show loading skeleton until flat-lay is ready, then display the generated flat-lay image. Key files: apps/web/components/outfit/OutfitDetail.tsx (add proactive generation), apps/web/components/outfit/SimilarOutfits.tsx (ensure it uses flatLayImageUrl when available), apps/web/lib/hooks/useFlatLayGeneration.ts (reuse generation logic). Expected result: All similar outfits display flat-lay composite images matching main outfit format.`

## Chore Description
The Similar Outfits section in OutfitDetail currently relies on lazy loading via Intersection Observer, which means flat-lay images are only generated when the user scrolls down to view them. This creates an inconsistent user experience where:

1. **Main outfit recommendations** in ChatAssistant use proactive generation - flat-lay images are generated immediately when outfits are created
2. **Similar outfits** in OutfitDetail use lazy generation - images only generate when scrolled into view, showing loading skeletons initially

The fix requires OutfitDetail to proactively generate flat-lay images for similar outfits using the same pattern as ChatAssistant.tsx, ensuring all similar outfits already have their flat-lay images ready when displayed.

## Relevant Files
Use these files to complete the chore:

- **apps/web/components/outfit/OutfitDetail.tsx** - Main component that needs modification to add proactive flat-lay generation for similar outfits. Currently passes `similarOutfits` directly to SimilarOutfits without pre-generating images.

- **apps/web/components/outfit/SimilarOutfits.tsx** - Already handles flat-lay display correctly (checks `flatLayImageUrl || flatLayImageBase64` at line 37 and 190). The lazy generation via Intersection Observer should be kept as a fallback but won't trigger if outfits already have flat-lay images.

- **apps/web/lib/hooks/useFlatLayGeneration.ts** - Contains the flat-lay generation logic including API calls, caching (localStorage with 7-day TTL), and queue management. The `useFlatLayGeneration` hook can be used, but OutfitDetail needs a different pattern since it manages multiple outfits.

- **apps/web/components/chat/ChatAssistant.tsx** - Reference implementation for proactive generation (lines 119-260). The `generateFlatLayForOutfit` function demonstrates the pattern: call `/api/generate-image` with `generationType: 'flat-lay'`, transform items to `FlatLayItem[]`, and update outfit with `flatLayImageUrl`/`flatLayImageBase64`.

- **apps/web/lib/types.ts** - Outfit interface already supports `flatLayImageUrl`, `flatLayImageBase64`, and `isGeneratingFlatLay` fields.

- **apps/web/app/page.tsx** - Parent component that passes `similarOutfits` to OutfitDetail (line 194). Understanding the data flow helps confirm where state should be managed.

- **apps/web/lib/utils/product-visual-validator.ts** - Contains `findReplacementsForInconsistentProducts` for visual consistency (optional, for parity with ChatAssistant).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add State and Imports to OutfitDetail.tsx
- Add `useState` and `useEffect` imports from React
- Add `useCallback` for generation function
- Import `FlatLayItem` type from `@/lib/types`
- Add state to track similar outfits with generated flat-lay images: `const [enhancedSimilarOutfits, setEnhancedSimilarOutfits] = useState<Outfit[]>(similarOutfits)`
- Add state to track which outfits are currently generating: `const [generatingOutfitIds, setGeneratingOutfitIds] = useState<Set<string>>(new Set())`

### 2. Create generateFlatLayForSimilarOutfit Function
- Add a `useCallback` function `generateFlatLayForSimilarOutfit` that:
  - Takes an outfit as parameter
  - Checks localStorage cache first using the same cache key pattern (`flat-lay-${outfit.id}`)
  - If cached, returns the cached image immediately
  - If not cached, calls `/api/generate-image` with:
    - `generationType: 'flat-lay'`
    - `flatLayItems`: Transform `outfit.items` to `FlatLayItem[]` (name, category, color, visualDescription)
    - `occasionContext`: `outfit.description`
  - On success, caches the result in localStorage and updates the outfit with `flatLayImageUrl`/`flatLayImageBase64`
  - Implements MAX_CONCURRENT_GENERATIONS limit (3) using a ref to track active generations

### 3. Add useEffect for Proactive Generation
- Add a `useEffect` that triggers when `similarOutfits` prop changes
- Reset `enhancedSimilarOutfits` to the incoming `similarOutfits`
- For each similar outfit that doesn't have `flatLayImageUrl` or `flatLayImageBase64`:
  - Check localStorage cache first
  - If cached, immediately update `enhancedSimilarOutfits` with the cached image
  - If not cached, queue for generation (respecting concurrency limit)
- Use `Promise.all` with a queue pattern to generate images for up to 3 outfits concurrently
- Update `enhancedSimilarOutfits` as each generation completes

### 4. Update SimilarOutfits Component Call
- Pass `enhancedSimilarOutfits` instead of `similarOutfits` to the SimilarOutfits component
- This ensures similar outfits already have `flatLayImageUrl`/`flatLayImageBase64` populated when they check at line 37 in SimilarOutfitCard

### 5. Add Loading State Indicator (Optional Enhancement)
- Consider adding a subtle loading indicator in the "Similar outfits" header while any outfits are still generating
- The SimilarOutfitCard already handles the fallback display correctly via its existing logic

### 6. Verify SimilarOutfits Component Handles Pre-populated Images
- Confirm that SimilarOutfitCard at line 37 correctly checks `outfit.flatLayImageUrl || outfit.flatLayImageBase64` as `existingFlatLay`
- Confirm that when `existingFlatLay` exists, the Intersection Observer callback (lines 53-59) does NOT trigger `generateFlatLay()` since the condition `!existingFlatLay && !flatLayImageBase64` will be false
- No changes needed to SimilarOutfits.tsx if these conditions are satisfied

### 7. Validate the Implementation
- Run TypeScript compilation: `cd apps/web && pnpm tsc --noEmit`
- Run ESLint: `cd apps/web && pnpm eslint components/outfit/OutfitDetail.tsx`
- Verify the application builds: `cd apps/web && pnpm build`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/OOTD/apps/web && pnpm tsc --noEmit` - Verify TypeScript compilation passes
- `cd /Users/naruechon/OOTD/apps/web && pnpm eslint components/outfit/OutfitDetail.tsx components/outfit/SimilarOutfits.tsx` - Verify no ESLint errors
- `cd /Users/naruechon/OOTD/apps/web && pnpm build` - Verify production build succeeds
- Manual verification: Open the app, click on an outfit to view details, confirm similar outfits display flat-lay images without visible lazy loading delay

## Notes

### Cache Key Consistency
The localStorage cache key pattern `flat-lay-${outfitId}` is already used in `useFlatLayGeneration.ts`. Use the same pattern in OutfitDetail.tsx to ensure cache hits for previously generated images.

### Concurrency Management
ChatAssistant.tsx doesn't explicitly limit concurrency, but `useFlatLayGeneration.ts` does (MAX_CONCURRENT_GENERATIONS = 3). For similar outfits (up to 6), implementing a simple queue ensures we don't overload the API.

### Visual Consistency Replacements
The ChatAssistant implementation includes product replacement logic via `findReplacementsForInconsistentProducts`. For simplicity, this can be omitted in the initial implementation since similar outfits are typically pre-validated. If needed, it can be added as a follow-up enhancement.

### Existing Lazy Loading as Fallback
The current Intersection Observer logic in SimilarOutfitCard serves as a fallback if proactive generation fails or is slow. This provides graceful degradation without requiring changes to SimilarOutfits.tsx.
