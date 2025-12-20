# Chore: Fix Onboarding Department Filter Not Being Applied

## Metadata
adw_id: `f91d5afa`
prompt: `CRITICAL FIX: The onboarding department filter is not being applied correctly. After a user completes onboarding and selects 'Women's Fashion', the main page still shows 'All' category selected instead of 'Women'. The issue is in the initialization timing - the useOutfitDiscovery hook in lib/hooks/useOutfitDiscovery.ts initializes filters BEFORE the user profile is available from useUserProfile hook. Fix this by: 1) In useOutfitDiscovery.ts, add a useEffect that updates the filters when profile.gender changes - when profile loads/changes and filters.gender is 'all', update it to profile.gender. 2) The initial useState should start with 'all', but a useEffect should sync it with profile.gender once the profile is loaded. 3) Make sure the URL params still take priority over profile (only apply profile.gender when no URL gender param exists). 4) Test by clearing localStorage, completing onboarding with Women's Fashion, and verifying the Category filter shows 'Women' selected on the main page.`

## Chore Description

After completing the onboarding flow and selecting "Women's Fashion", users expect the main page Category filter to automatically display "Women" as selected. However, due to a timing issue in the `useOutfitDiscovery` hook, the filter initializes to "All" before the user profile data is loaded from localStorage.

The root cause is in the hook initialization sequence:
1. `useOutfitDiscovery` hook initializes with `parseFiltersFromUrl(searchParams, profile?.gender)`
2. At this point, `profile?.gender` is `undefined` because `useUserProfile` is still loading from localStorage
3. The filter defaults to 'all' instead of waiting for the profile to load
4. Even after the profile loads with `gender: 'women'`, the filter state is never updated

The fix requires adding a synchronization mechanism that:
- Initializes filters with 'all' as a safe default
- Adds a `useEffect` to watch for profile changes and update the gender filter accordingly
- Only applies profile.gender when no URL gender parameter exists (URL params take priority)
- Only updates when filters.gender is 'all' to avoid overwriting user selections

## Relevant Files

- **frontend/lib/hooks/useOutfitDiscovery.ts** - Main file to modify. Contains the `useOutfitDiscovery` hook that manages filter state. Need to add a `useEffect` to sync `filters.gender` with `profile.gender` after profile loads.

- **frontend/lib/hooks/useUserProfile.ts** (read-only) - Provides the `profile` object and `isLoading` state. Understanding this helps ensure we handle the async profile loading correctly.

- **frontend/lib/utils/url-params.ts** (read-only) - Contains `parseFiltersFromUrl` which handles URL parameter priority. We need to respect this priority in our fix.

- **frontend/lib/types.ts** (read-only) - Contains `FilterState` type definition with `gender?: 'all' | 'men' | 'women'`.

- **frontend/lib/types/user-profile-types.ts** (read-only) - Contains `UserProfile` type with `gender: 'women'` (currently fixed to women-only).

- **frontend/app/page.tsx** (read-only) - Main page that uses `useOutfitDiscovery` hook. Helpful for understanding the complete flow and testing context.

- **frontend/components/navigation/NavigationFilters.tsx** (read-only) - Displays the Category filter UI. Understanding this helps validate the fix visually.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read and Understand Current Implementation
- Read `frontend/lib/hooks/useOutfitDiscovery.ts` to understand current initialization logic
- Read `frontend/lib/utils/url-params.ts` to understand URL parameter priority handling
- Note the current initialization: `parseFiltersFromUrl(searchParams, profile?.gender)` runs before profile is loaded

### 2. Add Profile Gender Synchronization in useOutfitDiscovery
- Keep the initial `useState` initialization as-is (using `parseFiltersFromUrl` which defaults to 'all' when profile is undefined)
- Add a new `useEffect` that runs when `profile` or `searchParams` change
- Inside the effect:
  - Check if profile is loaded (`profile !== null`)
  - Check if there's NO URL gender parameter (`!searchParams.get('gender')`)
  - Check if current filter is set to 'all' (`filters.gender === 'all'`)
  - If all conditions are true, update filters to use `profile.gender`
- This ensures URL params always take priority over profile preferences
- Add comments explaining the synchronization logic for future maintainers

### 3. Ensure Proper Dependency Array
- Verify the `useEffect` dependency array includes: `profile`, `searchParams`, and potentially `filters.gender`
- Consider using `useEffect` with `profile` and `searchParams` only, then checking `filters.gender` inside
- Ensure the effect doesn't cause infinite loops by updating filters conditionally

### 4. Test the Fix Locally
- Clear localStorage: `localStorage.clear()` in browser console
- Navigate to the application root
- Complete the onboarding flow, selecting "Women's Fashion" as the department
- Verify you're redirected to the main page
- Check that the Category filter in the left sidebar shows "Women" selected (not "All")
- Verify outfit results are filtered to women's products only
- Test URL parameter priority: manually add `?gender=men` to URL and verify it overrides profile preference

### 5. Validate Edge Cases
- Test behavior when profile doesn't exist (new user before onboarding)
- Test behavior when user manually changes filter from 'women' to 'all' or 'men'
- Ensure the fix doesn't override user's manual filter selections
- Test that URL params continue to work correctly
- Verify the fix works on both desktop and mobile layouts

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd frontend && npm run lint` - Ensure no linting errors were introduced
- `cd frontend && npm run type-check` or `npx tsc --noEmit` - Verify TypeScript types are correct
- Manual test: Clear localStorage, complete onboarding with "Women's Fashion", verify Category shows "Women" on main page
- Manual test: Add `?gender=men` to URL and verify it overrides the profile preference
- Manual test: Remove URL param and refresh, verify it returns to profile preference ("Women")
- Manual test: Manually change filter to "All" and verify it stays as "All" (doesn't get overridden)

## Notes

**Key Implementation Considerations:**

1. **Timing is Critical**: The profile loads asynchronously from localStorage via `useUserProfile`. The fix must handle this async nature properly.

2. **Priority Order**: URL params > user manual selection > profile preference. Never override URL params or user's explicit choices.

3. **Current User Profile Constraint**: Currently `profile.gender` is typed as `'women'` (not optional, always women). This may change in the future, so the fix should be robust.

4. **Avoid Infinite Loops**: Be careful with the `useEffect` dependency array. Updating `filters` inside a `useEffect` that depends on `filters` can cause loops.

5. **Solution Approach**: Use a pattern like:
   ```typescript
   useEffect(() => {
     const urlGender = searchParams.get('gender')
     if (!urlGender && profile && filters.gender === 'all') {
       setFilters(prev => ({ ...prev, gender: profile.gender }))
     }
   }, [profile, searchParams])
   ```

6. **Testing Strategy**: The best way to test is to clear localStorage, complete onboarding, and observe the Category filter state on the main page. The filter should show "Women" selected, not "All".
