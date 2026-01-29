# Chore: Fix localStorage Cache Quota Exceeded Error

## Metadata
adw_id: `9f601f0b`
prompt: `Fix localStorage cache quota exceeded error in useFlatLayGeneration.ts. When setCachedImage fails with QuotaExceededError, implement cache eviction: 1) Get all flat-lay cache keys, 2) Sort by timestamp (oldest first), 3) Remove oldest entries until there is enough space, 4) Retry the setItem. Add a try-catch with eviction logic in setCachedImage function.`

## Chore Description
The `useFlatLayGeneration.ts` hook currently stores generated flat-lay images in localStorage as base64-encoded strings. When localStorage quota is exceeded (typically 5-10MB depending on browser), the `setCachedImage` function silently fails with a warning. This results in lost cache opportunities and potential performance degradation.

This chore implements an intelligent cache eviction strategy that:
1. Detects `QuotaExceededError` when attempting to cache images
2. Retrieves all existing flat-lay cache entries (keys starting with `CACHE_PREFIX`)
3. Sorts entries by timestamp (oldest first)
4. Removes the oldest entries one by one until enough space is freed
5. Retries the original cache operation
6. Handles edge cases (all entries removed but still no space, corrupted cache data)

## Relevant Files

- **apps/web/lib/hooks/useFlatLayGeneration.ts** (lines 129-143)
  - Contains the `setCachedImage` function that needs the eviction logic
  - Already has cache constants (`CACHE_PREFIX`, `CACHE_TTL_MS`)
  - Has a related `cleanupExpiredCache` function for reference (lines 149-178)
  - Uses `CachedImage` interface with `imageBase64` and `timestamp` fields

## Step by Step Tasks

### 1. Implement Cache Eviction Helper Function
- Create a new helper function `evictOldestCacheEntries` that:
  - Accepts a parameter for how many entries to evict (default 1)
  - Retrieves all flat-lay cache keys from localStorage
  - Parses each cache entry to extract timestamps
  - Sorts entries by timestamp (oldest first)
  - Removes the specified number of oldest entries
  - Returns the number of entries actually evicted
- Place this function after `cleanupExpiredCache` (around line 179)

### 2. Enhance setCachedImage with Quota Error Handling
- Wrap the `localStorage.setItem` call in a try-catch block that specifically catches `QuotaExceededError`
- When `QuotaExceededError` is caught:
  - Call `evictOldestCacheEntries` to remove old entries
  - Retry the `setItem` operation
  - If retry still fails, attempt progressive eviction (remove more entries)
  - Maximum retry attempts: 3 (evict 1, then 2, then all remaining)
  - Log informative messages about eviction progress
- Handle edge case where even after evicting all entries, the new image is still too large
- Preserve existing error handling for other localStorage errors

### 3. Add Detailed Logging and Error Handling
- Add console logs to track:
  - When quota is exceeded and eviction starts
  - Number of entries found and evicted
  - Success/failure of retry attempts
  - Final outcome (cached successfully or gave up)
- Ensure the function fails gracefully without throwing errors
- Update existing console.warn to provide more context

### 4. Test Edge Cases
- Consider scenarios:
  - localStorage completely full with non-cache data
  - Corrupted cache entries that fail to parse
  - Single image larger than entire localStorage quota
  - Multiple simultaneous cache operations
- Ensure robustness against these edge cases

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm type-check` - Verify TypeScript types are correct
- `cd apps/web && pnpm lint` - Ensure code follows linting standards
- Manual testing in browser:
  - Open browser DevTools → Application → Local Storage
  - Generate multiple flat-lay images until quota is reached
  - Verify oldest entries are evicted automatically
  - Check console logs for eviction messages
  - Confirm new images are successfully cached after eviction

## Notes

- The `CACHE_PREFIX` constant is `'flat-lay-'` which helps identify cache entries
- Each cached entry contains `imageBase64` (base64 string) and `timestamp` (number)
- Typical base64 image sizes range from 100KB to 500KB+ depending on complexity
- localStorage quota varies by browser but is typically 5-10MB
- The existing `cleanupExpiredCache` function can serve as a reference for iterating over cache entries
- Consider that the eviction logic should be conservative to avoid removing recently used images
