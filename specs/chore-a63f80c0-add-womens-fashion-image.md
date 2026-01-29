# Chore: Add Women's Fashion Image to Onboarding Department Page

## Metadata
adw_id: `a63f80c0`
prompt: `Add Women's Fashion image to the 'What's your vibe?' onboarding page. 1) Copy 'data/assets/onboarding/image 35.png' to 'apps/web/public/images/onboarding/womens-fashion.png' (URL-encode the space in source filename). 2) In apps/web/components/onboarding/OnboardingDepartment.tsx: Import next/image, replace the placeholder div (lines 43-49 with bg-gradient and text) with an actual Image component using src='/images/onboarding/womens-fashion.png', maintain the h-64 height with object-cover, add alt='Women Fashion Flat Lay'. Keep the 'Selected' badge overlay intact.`

## Chore Description
This chore replaces a placeholder gradient div with an actual image on the "What's your vibe?" onboarding page. The task involves:
1. Copying the source image file from the data directory to the web app's public images folder
2. Updating the OnboardingDepartment component to use Next.js Image component instead of a placeholder div
3. Maintaining the visual layout (h-64 height, object-cover) and the "Selected" badge overlay

## Relevant Files

- **data/assets/onboarding/image 35.png** - Source image file (46KB) that contains the women's fashion flat lay image
- **apps/web/public/images/onboarding/** - Destination directory for the image (already exists with welcome-hero.png)
- **apps/web/components/onboarding/OnboardingDepartment.tsx** - React component that needs to be updated (lines 43-49 contain the placeholder div to replace)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Copy Image File
- Copy `data/assets/onboarding/image 35.png` to `apps/web/public/images/onboarding/womens-fashion.png`
- Use proper path escaping/URL-encoding for the space in the source filename
- Verify the file was copied successfully

### 2. Update OnboardingDepartment Component
- Add import for Next.js Image component at the top of the file: `import Image from 'next/image';`
- Replace the placeholder div (lines 43-49) with an Image component
- Set `src='/images/onboarding/womens-fashion.png'`
- Set `alt='Women Fashion Flat Lay'`
- Apply `h-64` height constraint using className
- Add `object-cover` style to maintain proper image cropping
- Add `w-full` to maintain full width
- Ensure the "Selected" badge overlay (lines 50-54) remains intact and properly positioned over the image

### 3. Verify Implementation
- Check that the file structure is correct
- Verify the component syntax is valid TypeScript/React
- Confirm the Image component has all required props (src, alt)
- Ensure responsive behavior is maintained

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -lh apps/web/public/images/onboarding/womens-fashion.png` - Verify the image file exists and has reasonable file size (~46KB)
- `file apps/web/public/images/onboarding/womens-fashion.png` - Confirm it's a valid PNG image
- `grep -n "import Image from 'next/image'" apps/web/components/onboarding/OnboardingDepartment.tsx` - Verify Image import was added
- `grep -n "womens-fashion.png" apps/web/components/onboarding/OnboardingDepartment.tsx` - Verify the image path is referenced
- `cd apps/web && pnpm build` - Build the app to ensure TypeScript compilation succeeds

## Notes
- The Next.js Image component provides automatic optimization and lazy loading
- Using `object-cover` ensures the image fills the container while maintaining aspect ratio
- The "Selected" badge uses absolute positioning and should remain on top of the image using the existing z-index stacking
- The image file has a space in its name ("image 35.png"), which requires proper escaping when copying via shell commands
