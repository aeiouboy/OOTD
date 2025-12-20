# Chore: Fix Onboarding Flow Not Showing for New Users

## Metadata
adw_id: `34757b43`
prompt: `Fix the onboarding flow not showing for new users when localStorage is empty. In frontend/app/page.tsx, the issue is that showOnboarding defaults to false and the useEffect check happens after initial render. Fix by: 1) Change initial state to show a loading state or check synchronously, 2) Consider initializing showOnboarding based on a synchronous localStorage check in useState initializer, or 3) Show a loading spinner while isLoadingProfile is true to prevent the main content from flashing before onboarding check completes. The fix should ensure that new users (with no ootday_user_profile in localStorage) always see the onboarding flow on first visit.`

## Chore Description

The onboarding flow currently has a race condition that prevents it from showing to new users on their first visit. The problem occurs because:

1. **Asynchronous State Loading**: The `useUserProfile` hook loads profile data from localStorage asynchronously in a `useEffect`, causing a delay between component mount and profile state availability.

2. **Incorrect Initial State**: In `frontend/app/page.tsx`, `showOnboarding` is initialized to `false`, which means the main application renders first.

3. **Late Check Execution**: The onboarding visibility check in the `useEffect` (lines 39-44) runs after the initial render, causing the main app to flash briefly before switching to onboarding.

4. **User Experience Issue**: New users see the main application interface momentarily before the onboarding flow appears, creating a jarring and unprofessional first impression.

The fix needs to ensure that:
- New users (with empty localStorage) see the onboarding flow immediately without any flash of main content
- The loading state is handled properly to prevent race conditions
- The solution is clean and doesn't introduce performance issues

## Relevant Files

- **frontend/app/page.tsx** (lines 30, 38-44, 302-304) - Contains the onboarding visibility logic that needs fixing. This is where `showOnboarding` state is initialized and the conditional render check happens.

- **frontend/lib/hooks/useUserProfile.ts** (lines 11-18, 23-35) - The hook that manages profile loading. The `isLoading` state is already exposed but needs to be properly utilized in the loading flow.

- **frontend/components/onboarding/OnboardingFlow.tsx** - The onboarding component that should be shown. No changes needed here, but useful for context.

- **frontend/lib/types/user-profile-types.ts** - Type definitions for UserProfile. Helps understand the profile structure, specifically the `onboardingCompleted` boolean flag.

## Step by Step Tasks

### 1. Update Initial State Logic in page.tsx
- Change `showOnboarding` initial state from `false` to `true` (default to showing onboarding)
- This ensures new users see onboarding by default until profile is loaded and verified

### 2. Add Loading State Handling
- Modify the conditional render logic to check `isLoadingProfile` before deciding what to show
- While `isLoadingProfile` is `true`, show a minimal loading state (blank or spinner)
- This prevents the main app from flashing during the profile load check

### 3. Update useEffect Onboarding Check
- Keep the existing `useEffect` logic (lines 39-44) but ensure it only updates state after loading completes
- When `isLoadingProfile` becomes `false`, check if `profile?.onboardingCompleted` is true
- If onboarding is completed, set `showOnboarding` to `false` to show main app
- If profile doesn't exist or onboarding not completed, keep `showOnboarding` as `true`

### 4. Refine Conditional Render Logic
- Update the render logic at lines 302-304 to handle three states:
  1. Loading: Show minimal loading UI (or blank screen)
  2. Onboarding needed: Show `<OnboardingFlow />`
  3. Onboarding complete: Show main app layouts

### 5. Test the Fix
- Clear localStorage and refresh the page to verify new users see onboarding immediately
- Complete onboarding and verify main app shows without flashing
- Refresh after completing onboarding to verify onboarding doesn't reappear
- Test that there's no flash of main content before onboarding appears

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm run build` - Ensure TypeScript compiles without errors
- Manual browser test: Open DevTools, go to Application > Local Storage, clear `ootday_user_profile`, and refresh page - onboarding should appear immediately without flashing main content
- Manual browser test: Complete onboarding flow, verify main app appears, refresh page - main app should stay visible without showing onboarding again
- Manual browser test: Check Network tab and Console for any errors during the onboarding visibility check

## Notes

**Recommended Implementation Approach:**

The cleanest solution is to:
1. Initialize `showOnboarding` to `true` (assume onboarding needed by default)
2. Add loading state render before onboarding check
3. Only set `showOnboarding` to `false` when we confirm `profile?.onboardingCompleted === true`

This "onboarding-first" approach is safer and provides better UX for new users, which is the critical first impression scenario.

**Alternative Approaches Considered:**

- Synchronous localStorage check in `useState` initializer: Would work but couples page.tsx to localStorage implementation details
- Separate loading spinner component: Adds complexity without significant UX benefit for this use case
- SSR/Server Components: Would require larger architectural changes beyond the scope of this chore

**Performance Considerations:**

The localStorage read operation in `useUserProfile` is already fast (typically <1ms), so showing a brief loading state won't negatively impact perceived performance. The key is preventing the flash of wrong content, not optimizing load time.
