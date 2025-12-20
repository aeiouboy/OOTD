# Chore: Fix OnboardingStyle.tsx Card Layout to Match Reference Design

## Metadata
adw_id: `20c322ec`
prompt: `Fix OnboardingStyle.tsx card layout to match reference EXACTLY. CRITICAL ISSUE: The red title and gray description must be INSIDE the white card, not outside. Reference shows: [White card with red left border containing: Image (cropped to hide text) + Red title 'Minimal · Timeless' + Gray description]. Currently the title and description render OUTSIDE the card boundary. Move the title (h3) and description (p) elements INSIDE the card button element, below the image but within the card's white background and border. Also crop images using object-fit: cover with object-position: top and reduce image container height to ~70% to hide the baked-in text at bottom of images. The entire card including image, title, and description should be one cohesive white rounded rectangle with the red left border accent.`

## Chore Description
The OnboardingStyle.tsx component displays fashion style cards in a carousel. The current implementation has a layout issue where the card appearance does not match the reference design. According to the reference design:

1. **Card Structure**: Each card should be a cohesive white rounded rectangle containing:
   - Image at the top (cropped to hide baked-in text at bottom)
   - Red title text (e.g., "Minimal · Timeless")
   - Gray description text

2. **Visual Accent**: A red left border should accent the card when selected

3. **Current Problem**: While the code structure already places h3 and p elements inside the button, the visual appearance may not match the reference due to:
   - Image container height potentially showing baked-in text at the bottom of images
   - Card styling may not create a fully cohesive white rectangle appearance
   - Border-left styling may not be visually prominent enough

4. **Required Changes**:
   - Reduce image container height to approximately 70% of current height to crop out baked-in text
   - Ensure the entire card (image + text content) appears as one unified white rounded rectangle
   - Confirm the red left border accent is properly visible when card is selected
   - Use `object-fit: cover` with `object-position: top` to crop from the bottom

## Relevant Files
Use these files to complete the chore:

- **`frontend/components/onboarding/OnboardingStyle.tsx`** - The main component file containing the style card carousel. This is the primary file to modify for fixing the card layout.
- **`frontend/app/globals.css`** - Contains CSS custom properties for onboarding colors (`--onboarding-bg`, `--onboarding-primary`, `--onboarding-primary-hover`). Reference only - no changes expected.
- **`frontend/lib/data/fashion-styles.json`** - Contains the style data with `imageUrl`, `name`, `description`, and `longDescription` fields. Reference only - no changes expected.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Reduce Image Container Height to Crop Bottom Text
- In `OnboardingStyle.tsx` line 124, change the image container height from `h-[280px]` to approximately `h-[200px]` (roughly 70% of original)
- This will crop out the baked-in text that appears at the bottom of style images
- The `object-cover object-top` classes are already correctly applied to ensure top portion of image is preserved

### 2. Enhance Card Container Styling for Cohesive Appearance
- Modify the button element (lines 115-122) to ensure the entire card appears as one unified white rounded rectangle
- Current classes: `w-full rounded-xl overflow-hidden transition-all duration-300 bg-white shadow-md border-l-2`
- Add `border` class to create a subtle border around the entire card for better definition
- Consider adding `border-gray-100` for a subtle outline that makes the card appear more cohesive

### 3. Improve Red Left Border Visibility for Selected State
- The current left border uses `border-l-2` which may be too thin to be visually prominent
- Change from `border-l-2` to `border-l-4` for better visibility of the selection indicator
- Update the conditional class from `border-[var(--onboarding-primary)]` to ensure proper color application on the left border only
- May need to restructure classes to apply left border separately from any overall border

### 4. Ensure Content Padding Creates Visual Unity
- Verify the `p-4` padding on the content div (line 141) provides adequate spacing
- The current padding should be sufficient, but verify it creates proper visual balance with the reduced image height
- Consider adjusting to `p-3` or `p-5` if the proportions look off with the new image height

### 5. Validate Visual Appearance in Browser
- Run the development server and navigate to the onboarding style selection step
- Verify that:
  - Images are properly cropped (bottom text hidden)
  - The entire card appears as one cohesive white rectangle
  - Red title text is clearly visible inside the card
  - Gray description text appears below the title inside the card
  - Red left border is visible on selected cards
  - Carousel navigation still works properly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm build` - Ensure the code compiles without TypeScript errors
- `cd frontend && pnpm lint` - Check for any linting issues
- `cd frontend && pnpm dev` - Start development server to visually verify the card layout at http://localhost:3000 (navigate to onboarding flow, step 5 - style selection)

## Notes
- The CSS custom properties for colors are defined in `frontend/app/globals.css`:
  - `--onboarding-bg: #F5F0EB` (beige background)
  - `--onboarding-primary: #C41E3A` (red accent color)
  - `--onboarding-primary-hover: #A01730` (darker red for hover)
- The image cropping strategy using `object-fit: cover` and `object-position: top` is already implemented; only the container height needs adjustment
- The reference design shows the card as a single visual unit with the red left border serving as a selection indicator
- Embla Carousel is used for the horizontal scrolling behavior - ensure no carousel functionality is broken
