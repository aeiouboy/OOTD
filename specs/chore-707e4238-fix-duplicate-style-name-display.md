# Chore: Fix Duplicate Style Name Display on Onboarding Style Page

## Metadata
adw_id: `707e4238`
prompt: `Fix duplicate style name display on 'What's your style?' onboarding page. The source style images have style names and descriptions BAKED INTO the image at the bottom. The OnboardingStyle component also renders this text programmatically, causing duplicate display.`

## Chore Description
The "What's your style?" onboarding page displays style names and descriptions twice:
1. **Baked into the source images** - The PNG files in `frontend/public/images/styles/` (Group 31.png through Group 40.png) have text labels at the bottom with a white background (e.g., "Minimal · Timeless" and description text)
2. **Rendered programmatically** - The OnboardingStyle component displays the same text below the image via the `fashion-styles.json` data

The design reference (`onboarding/Style/preference/5.1Onboarding-Style.png`) shows clean images WITHOUT baked-in text, with only ONE set of text labels rendered below the image.

**Solution**: Use CSS to crop the bottom portion of the images where the baked-in text appears (~60px), hiding the duplicate text while preserving the model/outfit imagery.

## Relevant Files
Use these files to complete the chore:

- **frontend/components/onboarding/OnboardingStyle.tsx** - The main component that renders the style carousel. Lines 156-171 define the image container that needs CSS cropping adjustment
- **frontend/public/images/styles/Group 31.png through Group 40.png** - The source images with baked-in text at the bottom (for reference only - not modifying these)
- **onboarding/Style/preference/5.1Onboarding-Style.png** - Design reference showing the expected clean appearance
- **frontend/lib/data/fashion-styles.json** - Data source for style names and descriptions (for reference only)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Image Dimensions and Baked-in Text Area
- The source images have approximately 60px of baked-in text at the bottom (white background with "Name · Description" in bold black and description text below)
- Current implementation uses `h-[220px]` container with `object-cover object-top`
- The baked-in text is still visible because the container height is too tall

### 2. Implement CSS Cropping Solution in OnboardingStyle.tsx
Modify the image container (lines 156-171) to crop the bottom of the image:

- Change the outer container to use a fixed aspect ratio approach with overflow hidden
- Add a taller inner image that extends beyond the container, effectively hiding the bottom portion
- Use `pb-[xxx%]` for aspect ratio control with `absolute` positioned image inside

**Specific CSS technique**:
```tsx
{/* Style Image - Cropped to hide baked-in text at bottom */}
<div className="w-full aspect-[3/4] overflow-hidden rounded-t-2xl relative">
  {style.imageUrl && !failedImages.has(style.id) ? (
    <img
      src={style.imageUrl}
      alt={`${style.name} style`}
      loading="lazy"
      onError={() => handleImageError(style.id)}
      className="absolute inset-0 w-full h-[120%] object-cover object-top"
    />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <span className="text-4xl">👗</span>
    </div>
  )}
</div>
```

This approach:
- Sets a fixed aspect ratio (3:4) for consistent card heights
- Makes the image 120% height, causing the bottom 20% (containing the baked-in text) to overflow and be hidden
- Uses `object-top` to ensure the top of the image (model's head) is always visible
- `overflow-hidden` on the container clips the overflowing bottom portion

### 3. Update Selected Style Thumbnails (Optional)
- The selected style thumbnails (lines 118-123) may also benefit from similar cropping
- These are smaller (60x80px) but should remain consistent

### 4. Validate the Fix Visually
- Run the development server
- Navigate to the onboarding flow
- Verify each style card shows:
  1. Model/outfit image only (NO baked-in text visible)
  2. "Name · Description" in crimson text (ONE TIME ONLY)
  3. Gray card description text below

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run dev` - Start the development server
- Navigate to http://localhost:3000 (or appropriate port)
- Complete onboarding steps 1-4 to reach "What's your style?" page
- Visually inspect ALL 10 style cards by scrolling through the carousel:
  - Group 31.png (Minimal · Timeless)
  - Group 32.png (Luxury · Elegant)
  - Group 33.png (Eccentric · Creative)
  - Group 34.png (Business · Refined)
  - Group 35.png (Vanilla · Clean)
  - Group 36.png (Sporty · Active)
  - Group 37.png (Edgy · Trendy)
  - Group 38.png (Bohemian · Natural)
  - Group 39.png (Classic · Old Money)
  - Group 40.png (Mystery Style · 🔮)
- Select 2-3 styles and verify the thumbnail images also don't show duplicate text
- `cd frontend && npm run build` - Verify production build succeeds

## Notes
- The CSS cropping approach is preferred over replacing images because:
  1. It requires no image asset changes
  2. It's maintainable through code
  3. The original images remain available if needed for other purposes
- The aspect ratio (3:4) should be fine-tuned if cards appear too tall or too short
- The 120% height value may need adjustment if some images show more or less of the baked-in text
- Test on mobile viewport sizes as well since this is a carousel component
