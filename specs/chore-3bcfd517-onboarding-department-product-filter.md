# Chore: Fix Product Filtering to Respect Onboarding Department Selection

## Metadata
adw_id: `3bcfd517`
prompt: `Analyze the OOTDay frontend codebase to ensure product filtering respects user's department selection from onboarding. When a user selects 'Women's Fashion' department during onboarding (OnboardingGender step), the main page should ONLY display women's products. Search for: 1) Onboarding flow components that capture department/gender selection (components/onboarding/), 2) How user preferences are stored (localStorage, context, or state), 3) Product filtering logic in outfit-service.ts and data-loader.ts, 4) How the main page (app/page.tsx) initializes filters based on user preferences. Currently the app may show 'All' products by default instead of filtering by the user's selected department. Fix the product display logic to automatically filter products based on the user's onboarding department selection (women/men) when they first land on the main page after completing onboarding.`

## Chore Description

The OOTDay frontend application has an onboarding flow that captures the user's department preference (Women's Fashion or Men's Fashion). However, after completing onboarding, the main page displays products with the default filter of 'all' instead of respecting the user's selected department.

**Current Behavior:**
- User completes onboarding and selects "Women's Fashion" department
- Gender preference is stored in localStorage as `profile.gender = 'women'`
- Main page initializes with default filters: `gender: 'all'`
- User sees both men's and women's products instead of only women's products

**Expected Behavior:**
- After onboarding completion, main page should automatically filter products based on user's selected department
- If user selected "Women's Fashion", only women's products should be shown
- The filter should be initialized from the user profile stored in localStorage

**Root Cause:**
The `useOutfitDiscovery` hook in `frontend/lib/hooks/useOutfitDiscovery.ts` initializes filters from URL params but doesn't check the user profile. The default value for `gender` is set to `'all'` in the `resetFilters` function and when parsing from URL params.

## Relevant Files

### Core Files to Modify
- `frontend/lib/hooks/useOutfitDiscovery.ts` - Initialize filters based on user profile gender preference instead of defaulting to 'all'
- `frontend/lib/utils/url-params.ts` - Update default gender value to respect user profile when parsing URL params
- `frontend/app/page.tsx` - Ensure user profile is loaded before initializing filters

### Reference Files (Read-only)
- `frontend/components/onboarding/OnboardingDepartment.tsx` - Shows how department selection works (currently hardcoded to women)
- `frontend/components/onboarding/OnboardingFlow.tsx` - Shows how gender preference is saved: `updateProfile({ gender: 'women' })`
- `frontend/lib/hooks/useUserProfile.ts` - User profile management hook with localStorage persistence
- `frontend/lib/types/user-profile-types.ts` - UserProfile type definition with gender field
- `frontend/lib/services/outfit-service.ts` - Product filtering logic that respects gender filter
- `frontend/lib/types.ts` - FilterState type definition

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update `useOutfitDiscovery` Hook to Initialize from User Profile
- Import `useUserProfile` hook at the top of the file
- Call `useUserProfile()` to access the user profile
- Modify the `useState` initialization for filters to check user profile gender
- If `profile?.gender` exists, use it as the default gender filter instead of parsing from URL only
- Ensure URL params take precedence over profile (so users can manually change filters)
- Update the logic to:
  1. First try URL params
  2. If no gender in URL and user has profile, use profile gender
  3. Otherwise default to 'all'

### 2. Update `parseFiltersFromUrl` Function to Accept User Profile
- Modify function signature to accept optional `userGender` parameter: `parseFiltersFromUrl(searchParams: URLSearchParams, userGender?: 'women' | 'men')`
- Update the gender parsing logic:
  - If gender exists in URL params, use it (user's manual selection)
  - Else if `userGender` is provided, use it (from user profile)
  - Else default to 'all'
- This ensures user profile preference is respected when no URL filter is set

### 3. Update `resetFilters` Function to Respect User Profile
- Modify the `resetFilters` function in `useOutfitDiscovery` hook
- Instead of hardcoding `gender: 'all'`, use `gender: profile?.gender || 'all'`
- This ensures that resetting filters returns to the user's profile preference, not to showing all products

### 4. Update Main Page to Pass User Profile to Filter Initialization
- In `frontend/app/page.tsx`, ensure the user profile is loaded before initializing outfit discovery
- The current implementation already loads profile before showing main app (lines 38-47)
- Verify that filters are initialized after profile loads
- No changes needed if hooks are properly updated

### 5. Test Department Filter Behavior
- Clear localStorage and complete onboarding flow
- Verify that after onboarding, gender filter is set to 'women' (user's selection)
- Verify that only women's products are displayed
- Test that manual gender filter changes work correctly
- Test that "Clear all filters" resets to user's profile gender preference
- Test with URL params to ensure they override profile defaults

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run build` - Ensure TypeScript compilation succeeds without errors
- `cd frontend && npm run lint` - Ensure no linting errors are introduced
- **Manual Testing:**
  1. Clear browser localStorage
  2. Complete onboarding flow and select "Women's Fashion"
  3. Verify main page shows only women's products (gender filter = 'women')
  4. Click "Clear all filters" and verify gender stays as 'women'
  5. Manually change gender filter to 'men' and verify it works
  6. Refresh page and verify filter persists from URL or returns to profile default

## Notes

### Key Findings from Codebase Analysis

1. **User Profile Storage**: User preferences are stored in localStorage under key `ootday_user_profile` with structure:
   ```typescript
   {
     userName: string,
     gender: 'women', // Currently hardcoded to 'women' in onboarding
     ageRange: AgeRange,
     stylePreferences: StylePreference[],
     onboardingCompleted: boolean
   }
   ```

2. **Filter Initialization Flow**:
   - `useOutfitDiscovery` hook initializes filters from URL params only
   - URL params are parsed by `parseFiltersFromUrl` function
   - Default gender is `'all'` when no URL param exists
   - User profile is NOT consulted during filter initialization

3. **Product Filtering Logic**:
   - `outfit-service.ts` correctly filters products by gender (lines 10-16)
   - Filter matching: `p.category?.toLowerCase() === filters.gender`
   - Products have `category` field with values like "Men", "Women"

4. **Current Limitation**:
   - OnboardingDepartment component is currently fixed to "Women's Fashion" only
   - No UI exists for selecting men's department
   - Gender is hardcoded to 'women' in OnboardingFlow (line 36)
   - This chore fixes the filter initialization assuming future support for both departments

### Future Enhancements (Out of Scope)
- Add UI for selecting between Men's and Women's department during onboarding
- Make OnboardingDepartment component dynamic instead of hardcoded
- Support gender-neutral or mixed preferences
