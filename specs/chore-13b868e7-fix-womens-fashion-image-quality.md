# Chore: Fix Women's Fashion Image Quality

## Metadata
adw_id: `13b868e7`
prompt: `Fix Women's Fashion image quality by reducing display size to avoid excessive upscaling. The source image is 143x191 pixels but currently displayed at 400x534 causing blur. In apps/web/components/onboarding/OnboardingDepartment.tsx: Change Image width from 400 to 286 and height from 534 to 382 (2x native resolution for retina displays). This prevents quality loss from upscaling a small source image. Also add 'quality={100}' prop to the Image component to ensure maximum quality.`

## Chore Description
The women's fashion image in the onboarding department selection screen is displaying with poor quality due to excessive upscaling. The source image (`womens-fashion.png`) has native dimensions of 143x191 pixels, but is currently being rendered at 400x534 pixels - nearly 3x upscaling which causes noticeable blur.

This chore fixes the image quality by:
1. Reducing the display size to 286x382 pixels (exactly 2x the native resolution)
2. This provides optimal quality for retina displays while avoiding over-upscaling
3. Adding the `quality={100}` prop to ensure Next.js Image optimization doesn't compress the image further

## Relevant Files

- `apps/web/components/onboarding/OnboardingDepartment.tsx` - The component rendering the women's fashion image with incorrect dimensions (lines 45-51). This is the only file that needs modification.

- `apps/web/public/images/onboarding/womens-fashion.png` - The source image file (143x191 pixels). No changes needed to this file, but dimensions confirmed for reference.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Image Component Dimensions
- Locate the Image component in `OnboardingDepartment.tsx` (currently at lines 45-51)
- Change the `width` prop from `400` to `286`
- Change the `height` prop from `534` to `382`
- These new dimensions are exactly 2x the native resolution (143x2=286, 191x2=382)

### 2. Add Quality Optimization Prop
- Add `quality={100}` prop to the same Image component
- This ensures Next.js Image component serves the highest quality version
- Prevents additional compression that could degrade quality

### 3. Verify Visual Quality
- Start the development server (`pnpm dev` in apps/web)
- Navigate to the onboarding department selection screen
- Confirm the image displays with improved clarity
- Check that the aspect ratio is maintained correctly (should match 143:191)

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure the Next.js build completes successfully without errors
- `cd apps/web && pnpm lint` - Verify no linting errors were introduced
- Visual inspection: Load http://localhost:3000 (after `pnpm dev`) and navigate to the onboarding flow to verify image quality improvement

## Notes
- The 2x scaling factor (286x382) is optimal for retina displays, providing sharp rendering without over-upscaling
- The `quality={100}` prop prevents Next.js from applying default compression (usually 75%)
- The aspect ratio is preserved: 143:191 ≈ 0.749 and 286:382 ≈ 0.749
- No changes to the source image file are needed
