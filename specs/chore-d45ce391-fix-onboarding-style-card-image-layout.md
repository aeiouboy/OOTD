# Chore: Fix OnboardingStyle card layout to show full style images

## Metadata
adw_id: `d45ce391`
prompt: `Fix OnboardingStyle card layout to show full style images without cropping. The new style images are 175x306px (portrait 1:1.75 ratio) but currently only the top portion shows due to fixed height container with object-cover.`

## Chore Description
The OnboardingStyle component displays fashion style cards in a grid layout. Each card has an image section and a text section. The current implementation uses fixed heights (`h-[110px] sm:h-[140px]`) with `object-cover object-top` for images, which crops the bottom portion of portrait-oriented style images (175x306px, ratio 1:1.75).

The goal is to show the full body fashion images instead of just head/shoulders while maintaining a clean grid layout. The solution is to replace the fixed height with an aspect-ratio approach that preserves the full portrait image.

## Relevant Files
Use these files to complete the chore:

- **`apps/web/components/onboarding/OnboardingStyle.tsx`** - The main component file containing the style card layout. Lines 115-132 define the image container that needs modification.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update the image container to use aspect-ratio
- On line 116, change the image container `div` from:
  ```tsx
  <div className="relative w-full h-[110px] sm:h-[140px] overflow-hidden">
  ```
  to:
  ```tsx
  <div className="relative w-full aspect-[175/306] overflow-hidden">
  ```
- This removes the fixed height and uses the exact aspect ratio of the source images (175:306 ≈ 1:1.75)

### 2. Update the image styling
- On line 123, change the `img` className from:
  ```tsx
  className="absolute inset-0 w-full h-full object-cover object-top"
  ```
  to:
  ```tsx
  className="absolute inset-0 w-full h-full object-cover"
  ```
- Remove `object-top` since the full image will be displayed and no cropping bias is needed

### 3. Remove the card min-height constraint
- On lines 104, remove the `min-h-[180px] sm:min-h-[220px]` classes since the aspect-ratio container will naturally size the cards appropriately
- The card height will now be determined by the aspect-ratio image plus the text content section

### 4. Verify the gradient overlay is still effective
- The existing gradient overlay on line 131 (`h-8 bg-gradient-to-t from-white/80 to-transparent`) should remain as-is for text contrast
- No changes needed to this element

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm lint` - Ensure no linting errors are introduced
- `cd apps/web && pnpm build` - Verify the build succeeds without errors
- Visual verification: Start the dev server with `cd apps/web && pnpm dev` and navigate to the onboarding flow to confirm:
  1. Style images show full body (not cropped)
  2. Cards maintain a clean grid layout
  3. Text section (style name, description, card description) remains visible below each image
  4. Selected state styling still works correctly

## Notes
- The aspect ratio `175/306` can alternatively be written as `7/12` (approximately the same), but using the exact source dimensions is more precise
- Since cards no longer have a fixed minimum height, the grid will naturally adjust based on content. This should result in a more consistent and image-focused layout
- The fallback placeholder (emoji 👗) will still work within the aspect-ratio container
