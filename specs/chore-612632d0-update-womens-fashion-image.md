# Chore: Update Women's Fashion Image on 'What's your vibe?' Page

## Metadata
adw_id: `612632d0`
prompt: `Update Women's Fashion image on 'What's your vibe?' page. 1) Copy data/assets/onboarding/Gemini_Generated_Image_pzksj8pzksj8pzks.png to apps/web/public/images/onboarding/womens-fashion.png (overwrite existing). 2) In apps/web/components/onboarding/OnboardingDepartment.tsx: Update the Image component dimensions to width={320} height={428} to maintain the 1792:2400 aspect ratio at mobile-friendly size. 3) Keep quality={100} for best quality. 4) Keep className='w-full h-auto object-contain' for responsive layout. 5) Update alt text to 'Women's Fashion' if needed. The source image is 1792x2400px which provides excellent quality for retina displays.`

## Chore Description
This chore updates the Women's Fashion image displayed on the onboarding "What's your vibe?" page. The task involves:
- Replacing the existing womens-fashion.png with a new high-quality 1792x2400px image
- Updating the Image component dimensions to maintain the correct aspect ratio (1792:2400 = 320:428) at a mobile-friendly size
- Ensuring quality settings and responsive layout remain optimal for retina displays

## Relevant Files

- `data/assets/onboarding/Gemini_Generated_Image_pzksj8pzksj8pzks.png` - Source image (1792x2400px, 5.3MB) that will replace the current image
- `apps/web/public/images/onboarding/womens-fashion.png` - Destination image file (currently 46KB) that will be overwritten
- `apps/web/components/onboarding/OnboardingDepartment.tsx` - Component that displays the image and needs dimension updates (currently using width={286} height={382})

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Copy New Image File
- Copy `data/assets/onboarding/Gemini_Generated_Image_pzksj8pzksj8pzks.png` to `apps/web/public/images/onboarding/womens-fashion.png`
- Overwrite the existing file (current size: 46KB → new size: ~5.5MB)
- Verify the file was copied successfully

### 2. Update Image Component Dimensions
- Open `apps/web/components/onboarding/OnboardingDepartment.tsx`
- Locate the Image component on line 45-52
- Update `width={286}` to `width={320}`
- Update `height={382}` to `height={428}`
- This maintains the 1792:2400 aspect ratio (0.7467) at mobile-friendly dimensions

### 3. Verify Image Settings
- Confirm `quality={100}` is set (already correct on line 50)
- Confirm `className="w-full h-auto object-contain"` is set (already correct on line 51)
- Update `alt` text from "Women Fashion Flat Lay" to "Women's Fashion" on line 47

### 4. Validate Changes
- Check that the image file exists at the correct location
- Verify the component syntax is correct
- Ensure all required props are present

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -lh apps/web/public/images/onboarding/womens-fashion.png` - Verify the new image file exists and is approximately 5.5MB
- `grep -A 5 "src=\"/images/onboarding/womens-fashion.png\"" apps/web/components/onboarding/OnboardingDepartment.tsx` - Verify Image component has correct dimensions (width={320} height={428})
- `cd apps/web && pnpm build` - Ensure the Next.js build completes successfully without errors

## Notes
- The new image is significantly larger (5.5MB vs 46KB), which will provide excellent quality for retina displays but may impact initial load time
- The aspect ratio 320:428 ≈ 0.7467 matches the source 1792:2400 ≈ 0.7467 to prevent image distortion
- The `w-full h-auto object-contain` classes ensure the image scales responsively while maintaining aspect ratio
- Next.js Image component will optimize the image automatically during build
