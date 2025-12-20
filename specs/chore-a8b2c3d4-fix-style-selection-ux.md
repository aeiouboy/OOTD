# Chore: Fix Style Selection Page UX

## Metadata
adw_id: `a8b2c3d4`
prompt: `Fix the style selection page UX - cards are hard to select. Current issues: 1) Main selected card is large but other options (Luxury, Eccentric, Business, Vanilla) are tiny thumbnails hard to click, 2) Layout is unbalanced with one large card and tiny cards stacked, 3) Poor touch targets. Requirements: Make all style cards similar size and easy to tap/click, clear visual feedback for selection, better grid or carousel layout, minimum 44px touch targets. Target: frontend onboarding style selection component (What's your style? page).`

## Chore Description
The user is experiencing difficulty selecting style options on the "What's your style?" onboarding page. The screenshot shows a carousel layout with one large featured card and tiny thumbnails for other styles. However, the current code in `OnboardingStyle.tsx` has already been updated with a grid layout featuring equal-sized cards - the user is likely seeing a cached version.

**Current State Analysis:**
- `OnboardingStyle.tsx` was recently modified (Dec 20, 20:23) with a new grid layout
- The new code uses `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` for equal-sized cards
- Cards have `min-h-[180px] sm:min-h-[220px]` which exceeds 44px touch targets
- Selection states include checkmarks, borders, ring highlights, and scale transforms
- The README still references the old carousel design (outdated documentation)

**Root Cause:** User is seeing cached old carousel version, not the new grid layout.

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - The style selection component (already updated with grid)
- `frontend/.next/` - Next.js cache directory that may need clearing
- `frontend/components/onboarding/README.md` - Documentation (outdated, references carousel)
- `frontend/app/globals.css` - Contains carousel CSS classes that may no longer be needed

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Clear Next.js Cache and Restart Dev Server
- Remove the `.next` cache directory: `rm -rf frontend/.next`
- Kill any running dev server processes
- Restart the dev server: `cd frontend && pnpm dev`
- This ensures the new grid layout is served fresh

### 2. Verify the New Grid Layout is Working
- Navigate to http://localhost:3001 (or current port)
- Clear browser cache or use incognito mode
- Go through onboarding to step 5 (style selection)
- Verify all style cards are equal-sized in a 2-column grid (mobile) or 3-4 columns (desktop)
- Verify touch targets are 180px+ height (well above 44px minimum)
- Test selection feedback: checkmark, border highlight, scale effect

### 3. Update README Documentation
- Update `frontend/components/onboarding/README.md` line 57-58
- Change "Horizontal carousel with 10 style options" to "Grid layout with 10 style options"
- Change "Multi-select with embla-carousel" to "Multi-select grid layout"
- Remove reference to embla-carousel dependency if no longer used

### 4. Clean Up Unused Carousel CSS (Optional)
- Review `frontend/app/globals.css` lines 444-458 for unused 3D carousel styles
- If carousel is no longer used anywhere, consider removing:
  - `.carousel-perspective`
  - `.carousel-slide-3d`
  - `.carousel-card-selected` (if unused)
- Only remove if confirmed unused across entire codebase

### 5. Validate the Implementation
- Test on mobile viewport (375px width) - should show 2 columns
- Test on tablet viewport (768px width) - should show 3 columns
- Test on desktop viewport (1024px+ width) - should show 4 columns
- Test selection/deselection of multiple styles
- Verify the "Next" button enables when at least one style is selected
- Test keyboard navigation and focus states

## Validation Commands
Execute these commands to validate the chore is complete:

- `rm -rf frontend/.next && cd frontend && pnpm dev` - Clear cache and restart dev server
- Open browser in incognito mode and test the onboarding flow
- `grep -r "embla-carousel" frontend/components/onboarding/` - Verify no carousel references remain in onboarding components
- `pnpm test -- --run` - Ensure all tests still pass

## Notes
- The grid layout already exists in the codebase - this is primarily a cache clearing issue
- The user's screenshot shows the OLD carousel design, not the current code
- The README documentation needs updating to match the new grid implementation
- Consider adding E2E test for style selection page to prevent regression
