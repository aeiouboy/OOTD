# Chore: Fix Women's Fashion Image Display

## Metadata
adw_id: `0bcc5a52`
prompt: `Fix Women's Fashion image to show full image without cropping on OnboardingDepartment page. In apps/web/components/onboarding/OnboardingDepartment.tsx line 50: Change className from 'w-full h-64 object-cover' to 'w-full h-auto object-contain' to display the full image. Also update width/height props to larger values (width={400} height={534}) to maintain quality while letting CSS handle the actual display size. The image should show the complete flat lay (vest, pants, bag, sandals) without any cropping.`

## Chore Description
Fix the Women's Fashion image display on the OnboardingDepartment page to show the full image without cropping. Currently, the image uses `object-cover` with a fixed height of 64 (h-64), which crops the image to fit the container. This should be changed to `object-contain` with auto height to display the complete flat lay composition (vest, pants, bag, sandals) without any cropping. Additionally, update the width and height props to properly match the image's aspect ratio for better quality rendering.

## Relevant Files
Use these files to complete the chore:

- **apps/web/components/onboarding/OnboardingDepartment.tsx** (line 50) - The main component file where the Image component needs to be updated with new className and width/height props

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Image Component Properties
- Change the `className` from `'w-full h-64 object-cover'` to `'w-full h-auto object-contain'` on line 50
- Update the `width` prop from `143` to `400`
- Update the `height` prop from `191` to `534`
- This ensures the image displays its full content without cropping while maintaining quality

### 2. Validate the Changes
- Review the updated code to ensure all three changes are applied correctly
- Verify that the className uses `object-contain` and `h-auto` instead of `object-cover` and `h-64`
- Confirm that width and height props are set to 400 and 534 respectively

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Build the Next.js application to ensure no TypeScript errors
- `cd apps/web && pnpm lint` - Run ESLint to check for code quality issues
- Visual verification: Run `cd apps/web && pnpm dev` and navigate to the onboarding flow to verify the Women's Fashion image displays the complete flat lay without cropping

## Notes
- The change from `object-cover` to `object-contain` ensures the entire image is visible within its container
- The change from `h-64` to `h-auto` allows the container to adjust to the image's natural aspect ratio
- The updated width/height props (400x534) better represent the actual image dimensions, improving Next.js Image optimization while CSS handles the responsive display size
