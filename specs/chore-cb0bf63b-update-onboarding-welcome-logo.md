# Chore: Update Onboarding Welcome Page Logo

## Metadata
adw_id: `cb0bf63b`
prompt: `Update welcome page logo to new image. 1) Copy data/assets/onboarding/Gemini_Generated_Image_b1w5g4b1w5g4b1w5.png to apps/web/public/images/onboarding/welcome-hero.png (rename for cleaner path). 2) In apps/web/components/onboarding/OnboardingWelcome.tsx: Update Image src to '/images/onboarding/welcome-hero.png', change dimensions to width={320} height={423} to maintain 1792:2368 aspect ratio at good mobile size, keep priority and rounded-2xl styling. 3) Optionally delete the old logo.png from public/images/onboarding/ if no longer needed.`

## Chore Description
Replace the current onboarding welcome page logo with a new generated image. This involves copying the new image asset to the public directory with a cleaner filename, updating the component to reference the new image with appropriate dimensions that maintain the original aspect ratio, and cleaning up the old asset if it's no longer needed elsewhere.

The new image has dimensions of 1792x2368 pixels, and we want to display it at a mobile-friendly size of 320x423 pixels, which maintains the original 1792:2368 aspect ratio (approximately 3:4 or 0.757:1).

## Relevant Files
Use these files to complete the chore:

- `data/assets/onboarding/Gemini_Generated_Image_b1w5g4b1w5g4b1w5.png` - Source image to copy (1792x2368px)
- `apps/web/components/onboarding/OnboardingWelcome.tsx` - Component that displays the welcome logo image (lines 13-20)
- `apps/web/public/images/onboarding/logo.png` - Current logo that may be replaced or removed
- `apps/web/public/images/onboarding/welcome-hero.png` - New destination path for the image (to be created)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Copy New Image Asset
- Copy `data/assets/onboarding/Gemini_Generated_Image_b1w5g4b1w5g4b1w5.png` to `apps/web/public/images/onboarding/welcome-hero.png`
- Verify the file was copied successfully and has the correct dimensions (1792x2368px)

### 2. Update OnboardingWelcome Component
- Open `apps/web/components/onboarding/OnboardingWelcome.tsx`
- Update the Image component src from `/images/onboarding/logo.png` to `/images/onboarding/welcome-hero.png`
- Change width from 512 to 320
- Change height from 512 to 423
- Keep the `priority` prop (for above-the-fold loading optimization)
- Keep the `className="rounded-2xl"` styling
- Ensure the alt text is appropriate for the new image

### 3. Verify Old Logo Usage
- Search the codebase to determine if `logo.png` is used in any other components or files
- If not used elsewhere, delete `apps/web/public/images/onboarding/logo.png`
- If used elsewhere, document where it's still needed and skip deletion

### 4. Validate Changes
- Run the development server to verify the image displays correctly
- Check that the image loads with proper dimensions and styling
- Verify no broken image references exist

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -lh apps/web/public/images/onboarding/welcome-hero.png` - Verify new image exists with correct file size (~6.7MB)
- `grep -n "welcome-hero.png" apps/web/components/onboarding/OnboardingWelcome.tsx` - Confirm component uses new image path
- `grep -rn "logo.png" apps/web/components/ apps/web/app/` - Check if old logo is still referenced elsewhere
- `cd apps/web && pnpm dev` - Start development server and manually verify image displays correctly at http://localhost:3000

## Notes
- The aspect ratio calculation: 1792:2368 = 320:423.2 ≈ 320:423 (rounded)
- The new dimensions (320x423) provide a good mobile-optimized size while maintaining the original image proportions
- Next.js Image component will automatically optimize the image for web delivery
- The `priority` prop ensures the image loads immediately since it's above the fold on the welcome screen
