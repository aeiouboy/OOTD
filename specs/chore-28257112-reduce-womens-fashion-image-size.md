# Chore: Reduce Women's Fashion Image Size for Better UI Visibility

## Metadata
adw_id: `28257112`
prompt: `Reduce Women's Fashion image size for better UI visibility. In apps/web/components/onboarding/OnboardingDepartment.tsx: Update the Image component dimensions from width={320} height={428} to width={260} height={348} to maintain the 1792:2400 aspect ratio at a more compact size. Keep quality={100} and className='w-full h-auto object-contain'. This will make the card less tall and improve overall page layout visibility.`

## Chore Description
This chore reduces the display dimensions of the Women's Fashion image in the onboarding department selection screen. The image component dimensions will be reduced from 320x428 pixels to 260x348 pixels while maintaining the original 1792:2400 aspect ratio (approximately 3:4). This change will make the card less tall and improve the overall page layout visibility, preventing the image from dominating the viewport.

The reduction maintains proportional scaling (both dimensions reduced by ~18.75%) to preserve the visual integrity of the image while making better use of screen real estate.

## Relevant Files
Files required to complete this chore:

- **apps/web/components/onboarding/OnboardingDepartment.tsx** (line 45-52) - Contains the Image component that needs dimension updates. This is the primary file where the width and height props will be modified.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Image Component Dimensions
- Open `apps/web/components/onboarding/OnboardingDepartment.tsx`
- Locate the Image component (lines 45-52) that displays `/images/onboarding/womens-fashion.png`
- Change the `width` prop from `{320}` to `{260}`
- Change the `height` prop from `{428}` to `{348}`
- Verify that `quality={100}` and `className="w-full h-auto object-contain"` remain unchanged

### 2. Visual Verification
- Run the development server with `cd apps/web && pnpm dev`
- Navigate to the onboarding flow in the browser (http://localhost:3000)
- Advance to the department selection step (step 3 of 7)
- Verify that the Women's Fashion image:
  - Displays at the new, smaller size
  - Maintains proper aspect ratio
  - Remains centered and properly contained within the card
  - Improves overall page layout without excessive vertical scrolling

### 3. Code Quality Check
- Run TypeScript compilation to ensure no type errors: `cd apps/web && pnpm build`
- Run linting to ensure code style compliance: `cd apps/web && pnpm lint`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Verify TypeScript compilation succeeds with no errors
- `cd apps/web && pnpm lint` - Verify code passes linting checks
- Visual check: Navigate to onboarding step 3 in browser to confirm the image displays at the reduced size

## Notes
- The aspect ratio calculation: 260/348 ≈ 0.747 and 320/428 ≈ 0.748, both approximating the original 1792/2400 ≈ 0.747 ratio
- The reduction percentage: (320-260)/320 = 18.75% width reduction, (428-348)/428 ≈ 18.69% height reduction
- This change only affects the display dimensions; the actual image file resolution remains unchanged
- The `w-full h-auto object-contain` classes ensure responsive behavior is maintained
