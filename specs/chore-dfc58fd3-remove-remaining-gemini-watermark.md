# Chore: Remove Remaining Gemini Star Watermark from Women's Fashion Image

## Metadata
adw_id: `dfc58fd3`
prompt: `Remove remaining Gemini star watermark from Women's Fashion image. The previous crop to 2300px height was not enough - the star watermark is still visible in the bottom-right corner. The image is at apps/web/public/images/onboarding/womens-fashion.png (currently 1792x2300px). Use Python PIL/Pillow to crop to 1792x2200px (remove another 100px from the bottom). Also update apps/web/components/onboarding/OnboardingDepartment.tsx to change the Image height from 348 to 319 to maintain the new aspect ratio (260 * 2200/1792 = 319). Save the cropped image and verify the watermark is completely removed.`

## Chore Description
The Women's Fashion onboarding image still contains a visible Gemini star watermark in the bottom-right corner despite a previous attempt to remove it by cropping to 2300px height. This chore involves:

1. Cropping the image further from 1792x2300px to 1792x2200px (removing an additional 100px from the bottom)
2. Updating the React component to reflect the new aspect ratio by changing the Image height from 348 to 319 pixels
3. Verifying the watermark is completely removed

The existing `scripts/image_processing/remove_watermark.py` script will be modified to crop an additional 100px from the current image.

## Relevant Files
Files to be modified:

- **apps/web/public/images/onboarding/womens-fashion.png** - The source image file that will be cropped from 1792x2300px to 1792x2200px to completely remove the Gemini watermark
- **apps/web/components/onboarding/OnboardingDepartment.tsx:50** - React component displaying the image; needs height updated from 348 to 319 to maintain correct aspect ratio (260 * 2200/1792 = 319)
- **scripts/image_processing/remove_watermark.py** - Existing Python script for watermark removal; will be reused to crop the additional 100px from bottom

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Current Image State
- Check the current dimensions of `apps/web/public/images/onboarding/womens-fashion.png` to confirm it is 1792x2300px
- Optionally take a visual inspection to confirm the watermark is still visible in the bottom-right corner

### 2. Run the Watermark Removal Script
- Execute the existing `scripts/image_processing/remove_watermark.py` script to crop another 100px from the bottom
- The script will crop the image from 1792x2300px to 1792x2200px
- Verify the script completes successfully and reports the correct final dimensions

### 3. Verify Image Cropping
- Check the final dimensions of the cropped image to confirm it is 1792x2200px
- Optionally view the image to visually confirm the watermark has been completely removed

### 4. Update React Component Height
- Edit `apps/web/components/onboarding/OnboardingDepartment.tsx` at line 50
- Change the Image height prop from `348` to `319` to maintain the correct aspect ratio
- The calculation is: 260 (width) * 2200 / 1792 = 319 (new height)

### 5. Validate the Changes
- Run the development server to view the onboarding flow
- Navigate to the Department selection step (step 3) to confirm the image displays correctly with no watermark and proper proportions

## Validation Commands
Execute these commands to validate the chore is complete:

- `file apps/web/public/images/onboarding/womens-fashion.png` - Verify the image is PNG format and check dimensions
- `python3 -c "from PIL import Image; img = Image.open('apps/web/public/images/onboarding/womens-fashion.png'); print(f'Dimensions: {img.size}')"` - Confirm image is exactly 1792x2200px
- `cd apps/web && pnpm build` - Ensure the Next.js build succeeds with the updated component
- Visual inspection: Run `cd apps/web && pnpm dev` and navigate to the onboarding Department step to confirm the image displays correctly without watermark

## Notes
- The existing `remove_watermark.py` script is already configured to crop 100px from the bottom and operates in-place (overwrites the original file)
- The aspect ratio calculation: 260 * (2200 / 1792) = 260 * 1.2277... = 319.196... ≈ 319 pixels
- The script uses PIL/Pillow which is already installed according to `scripts/image_processing/requirements.txt`
- This is a second pass at watermark removal; the first pass cropped from 2400px to 2300px, this pass crops from 2300px to 2200px
