# Chore: Fix Similar Outfits AI Flat-Lay Generation Issues

## Metadata
adw_id: `d7a9e43e`
prompt: `Fix Similar Outfits AI flat-lay generation issues in SimilarOutfits.tsx and useFlatLayGeneration.ts. Current problems: 1) Click on Similar Outfit cards feels unresponsive - the wrapper div with ref blocks proper click feedback, should move ref to a different element or use a better pattern. 2) CSS composite shows as initial placeholder instead of loading skeleton - change initial state to show loading skeleton immediately when card is visible, not CSS composite. 3) Retry queue mechanism broken - hasAttemptedRef prevents cards from retrying when concurrent limit is reached. Fix: track queue position properly, use a global queue array instead of setTimeout retries. 4) Cache not persisting across outfit changes - when user clicks different outfit, generation restarts. Fix: check localStorage cache BEFORE showing placeholder. 5) Add visual loading feedback - show shimmer/pulse animation on cards waiting in queue. 6) Increase MAX_CONCURRENT_GENERATIONS from 2 to 3 to speed up generation.`

## Chore Description
This chore fixes multiple issues with the AI flat-lay image generation system in the Similar Outfits component:

1. **Unresponsive Click Feedback**: The wrapper `<div ref={observerRef}>` around the Card component intercepts click events and prevents proper visual feedback. The ref should be moved to a non-blocking element.

2. **CSS Composite Shown Initially**: When a card becomes visible, it shows the CSS composite fallback instead of a loading skeleton. The initial state (before intersection triggers) should immediately show a loading skeleton.

3. **Broken Retry Queue**: The `hasAttemptedRef.current = true` is set BEFORE the concurrent check, preventing cards from ever retrying when the limit is reached. The current setTimeout-based retry is unreliable. A proper global queue array is needed.

4. **Cache Not Persisting**: When user switches outfits, the cache check happens in a useEffect that races with intersection observer. Need to check cache synchronously in initial render.

5. **No Queue Visual Feedback**: Cards waiting in the generation queue show as CSS composite instead of indicating they're queued for generation.

6. **Low Concurrent Limit**: MAX_CONCURRENT_GENERATIONS is 2, which is too conservative. Increase to 3 for faster generation.

## Relevant Files
Use these files to complete the chore:

- **apps/web/components/outfit/SimilarOutfits.tsx** - Main component that renders similar outfit cards. Contains the wrapper div issue, click handling, and display logic that needs to show loading skeleton instead of CSS composite.

- **apps/web/lib/hooks/useFlatLayGeneration.ts** - Core hook with the broken retry queue mechanism, cache logic, and concurrent generation limit. Contains `hasAttemptedRef`, `MAX_CONCURRENT_GENERATIONS`, and the setTimeout-based retry.

- **apps/web/components/ui/skeleton.tsx** - Existing Skeleton component used for loading states.

- **apps/web/components/outfit/FlatLayComposite.tsx** - CSS composite fallback component, should only show on error, not as initial/queued state.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Implement Global Queue System in useFlatLayGeneration.ts
- Create a global queue array `const generationQueue: Array<() => void> = []` to track pending generation requests
- Create a `processQueue()` function that runs next queued generation when slot opens
- Remove the setTimeout-based retry approach
- Move the `hasAttemptedRef.current = true` assignment to AFTER the concurrent check passes (inside the actual generation block)
- Add a new state `isQueued` to indicate card is waiting in queue
- Increase `MAX_CONCURRENT_GENERATIONS` from 2 to 3

### 2. Add isQueued State and Queue Position Tracking
- Add `isQueued` boolean state to the hook return value
- When concurrent limit is reached, add request to queue and set `isQueued = true`
- When generation starts (slot available), set `isQueued = false` and `isGenerating = true`
- Expose `queuePosition` optionally for debugging

### 3. Fix Cache Check Timing
- In `useFlatLayGeneration`, check cache synchronously during initial state initialization using lazy state initializer
- Change `useState<string | undefined>(undefined)` to `useState<string | undefined>(() => getCachedImage(outfitId))`
- Update the `isFromCache` state to also initialize based on cached value
- Keep the useEffect for outfitId changes but ensure no race condition

### 4. Fix Click Handling in SimilarOutfits.tsx
- Move the `ref={observerRef}` from the outer wrapper div to an inner element (e.g., a span or div inside the card that doesn't block clicks)
- Alternative: Apply the ref directly to the Card component if it supports ref forwarding
- Ensure click propagation works properly for the Card's onClick handler

### 5. Update Display Logic for Loading States
- Change the initial state (before intersection, no cache) to show loading skeleton with "Waiting..." text instead of CSS composite
- Show animated loading skeleton when `isQueued` is true (waiting in queue)
- Show active loading skeleton with bouncing dots when `isGenerating` is true
- Only show CSS composite `FlatLayComposite` as error fallback

### 6. Add Shimmer/Pulse Animation for Queued State
- Create a distinct visual state for queued cards (shimmer animation)
- Use Tailwind's `animate-pulse` class on the skeleton for queued state
- Show different text: "รอคิว..." (Waiting in queue) vs "กำลังสร้างภาพ..." (Generating)

### 7. Validate Implementation
- Test that clicking outfit cards responds immediately with visual feedback
- Test that cards show loading skeleton immediately when scrolled into view
- Test that queue processes correctly when multiple cards are visible
- Test that cache persists when switching between outfits
- Test with 4+ cards visible to verify queue works properly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure no TypeScript errors and build succeeds
- `cd apps/web && pnpm lint` - Verify no linting errors
- Manual test: Open app, navigate to outfit detail, scroll to Similar Outfits section
  - Verify cards show loading skeleton immediately (not CSS composite)
  - Verify clicking cards has immediate visual feedback
  - Verify multiple cards generate in parallel (up to 3)
  - Verify queue indicator shows for cards waiting

## Notes
- The global queue array (`generationQueue`) is module-scoped, not component-scoped, so it persists across component re-renders
- When incrementing/decrementing `currentGenerations`, always call `processQueue()` afterward to start next queued generation
- The cache check must happen synchronously on initial render to prevent flicker
- Consider adding a small delay before showing "กำลังสร้างภาพ" to prevent flash for cached images
- The intersection observer should still trigger the generation, but the visual state should be loading from the start if no cache exists
