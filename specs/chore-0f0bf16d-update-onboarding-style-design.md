# Chore: Update OnboardingStyle.tsx to Match Design

## Metadata
adw_id: `0f0bf16d`
prompt: `Update OnboardingStyle.tsx to match the design in onboarding/5.1Onboarding-Style.png`

## Chore Description
Update the OnboardingStyle component to match the Figma design mockup. This involves:
1. Copying local style card images from `onboarding/Style/` to the frontend public directory
2. Updating the styleOptions array with new styles, local image paths, and longer descriptions
3. Adding a `longDescription` field to the StylePreference type
4. Redesigning the selected styles display from text pills to thumbnail images with X overlays
5. Updating style card rendering to show "Name · Description" format with longDescription below
6. Removing emoji fallback for Mystery Style since it now has a proper image

The design shows:
- Selected styles displayed as small square thumbnails (~60px) with X button overlay in top-right corner
- Style cards showing title as "Minimal · Timeless" format
- Long description text below the title in smaller gray text
- Horizontal scrollable row for selected thumbnails

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main component to update with new styleOptions, thumbnail display, and card rendering
- `frontend/lib/types/user-profile-types.ts` - Add optional `longDescription` field to StylePreference interface
- `onboarding/Style/Group 31.png` through `Group 40.png` - Source images to copy (10 images total)
- `onboarding/5.1Onboarding-Style.png` - Design reference showing expected UI

### New Files
- `frontend/public/images/styles/` - Directory to create for style card images
- `frontend/public/images/styles/Group 31.png` through `Group 40.png` - Copied style images

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Directory and Copy Style Images
- Create directory `frontend/public/images/styles/` if it doesn't exist
- Copy all 10 images from `onboarding/Style/` to `frontend/public/images/styles/`:
  - Group 31.png (Minimal)
  - Group 32.png (Luxury)
  - Group 33.png (Eccentric)
  - Group 34.png (Business)
  - Group 35.png (Vanilla)
  - Group 36.png (Sporty)
  - Group 37.png (Edgy)
  - Group 38.png (Bohemian)
  - Group 39.png (Classic)
  - Group 40.png (Mystery)

### 2. Update StylePreference Type
- Edit `frontend/lib/types/user-profile-types.ts`
- Add optional `longDescription?: string` field to the StylePreference interface

### 3. Update styleOptions Array in OnboardingStyle.tsx
- Replace the current styleOptions array with the new styles:
  - minimal: name='Minimal', description='Timeless', longDescription='Less is more, clean, simple, neutral palette, pieces that last forever', imageUrl='/images/styles/Group 31.png'
  - luxury: name='Luxury', description='Elegant', longDescription='Less is more, clean, simple, neutral palette, pieces that last forever', imageUrl='/images/styles/Group 32.png'
  - eccentric: name='Eccentric', description='Creative', longDescription='Highly artistic and individual; uses unique shapes, bold colors, and clashing patterns and playful', imageUrl='/images/styles/Group 33.png'
  - business: name='Business', description='Refined', longDescription='Smart, structured, and professional', imageUrl='/images/styles/Group 34.png'
  - vanilla: name='Vanilla', description='Clean', longDescription='Soft neutrals, fresh, and cozy in light tones', imageUrl='/images/styles/Group 35.png'
  - sporty: name='Sporty', description='Active', longDescription='Athletic wear, functional, ready for movement and confident', imageUrl='/images/styles/Group 36.png'
  - edgy: name='Edgy', description='Trendy', longDescription='Bold, modern, and daring; follows the very latest fashion trends', imageUrl='/images/styles/Group 37.png'
  - bohemian: name='Bohemian', description='Natural', longDescription='Relaxed, earthy, featuring flowly silhouettes and natural fabrics', imageUrl='/images/styles/Group 38.png'
  - classic: name='Classic', description='Old Money', longDescription='Understated quiet luxury built on timeless, tailored, and preppy pieces', imageUrl='/images/styles/Group 39.png'
  - mystery: name='Mystery Style', description='Random style', longDescription='Random style', imageUrl='/images/styles/Group 40.png'
- Note: Remove 'streetwear' and 'romantic' styles as they are not in the new design

### 4. Update Selected Styles Display
- Replace the text pill display (lines 142-158) with thumbnail images:
  - Create a horizontally scrollable container with `overflow-x-auto`
  - Display each selected style as a ~60px square thumbnail image
  - Add X button overlay positioned in the top-right corner of each thumbnail
  - Use the style's imageUrl for the thumbnail
  - Remove the text-based pill styling

### 5. Update Style Card Rendering
- Update the card title display (around line 200-205):
  - Change format from separate name and description to "Name · Description" (e.g., "Minimal · Timeless")
  - Add longDescription display below in smaller gray text
  - Use CSS class like `text-sm text-gray-500 text-center mt-1` for long description

### 6. Remove Mystery Style Emoji Fallback
- Update the image fallback logic (lines 182-196)
- Since Mystery Style now has a proper image, remove the special emoji case for `style.id === 'mystery'`
- Keep generic fallback for any unexpected image load failures

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -la frontend/public/images/styles/` - Verify all 10 style images are copied
- `cd frontend && npm run build` - Ensure TypeScript compiles without errors
- `cd frontend && npm run lint` - Check for linting errors
- Open browser at `http://localhost:3000` and navigate to onboarding step 5 to visually verify:
  - Style cards show local images
  - Title format is "Name · Description"
  - Long description appears below title
  - Selected styles appear as thumbnails with X overlay
  - Mystery Style shows proper image instead of emoji

## Notes
- The design shows thumbnails with rounded corners and a small red X button in the corner
- Selected thumbnails should have a pink/red border to match the selected card styling
- Consider adding `aspect-square` and `object-cover` classes for consistent thumbnail sizing
- The imageUrl paths use `/images/styles/` which maps to `frontend/public/images/styles/` in Next.js
