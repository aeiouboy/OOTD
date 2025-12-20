# Chore: Redesign OnboardingStyle.tsx to Match Reference Design

## Metadata
adw_id: `89162fb2`
prompt: `Redesign OnboardingStyle.tsx to match the reference design at /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/5.1Onboarding-Style.png. Key differences to implement: 1) Header: Red 'What's your style?' title at TOP LEFT (not centered), with 'Choose style that sparks you' subtitle below in dark text. 2) Selected thumbnails: Show selected styles as small thumbnails with X buttons at TOP, below the header. 3) Style cards: Clean white cards with LEFT red border accent, containing ONLY the image (no baked-in text visible - crop/mask image to hide text), then 'Minimal · Timeless' title in RED below image, then description in gray below title. 4) Card layout: Horizontal scrollable carousel. 5) Next button: Circular red button with arrow at BOTTOM CENTER. 6) Background: Beige/cream color. The current implementation has centered header, cards with visible baked-in image text, and different card styling. Match the exact visual hierarchy from the reference.`

## Chore Description

Redesign the OnboardingStyle.tsx component to precisely match the reference design provided at `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/5.1Onboarding-Style.png`.

The reference design shows a fundamentally different visual hierarchy and layout:

**Current Issues:**
- Header is centered instead of left-aligned
- Selected thumbnails are centered instead of being positioned below header
- Style cards have thick border (4px) and show selected badge overlay
- Card images show baked-in text from the image files themselves
- Card titles show both name and description inline (e.g., "Minimal · Timeless")
- Next button is positioned at the end (right) instead of bottom center

**Target Design:**
- Red "What's your style?" title at TOP LEFT with dark subtitle below
- Selected style thumbnails displayed below header with X remove buttons
- Clean white cards with subtle LEFT RED BORDER accent (not full border)
- Card images cropped/masked to hide any baked-in text overlay
- Card title in RED below image showing "Name · Description" format
- Gray long description text below title
- Horizontal scrollable carousel layout
- Circular red button with arrow at BOTTOM CENTER
- Beige/cream (#F5F0EB) background

## Relevant Files

Use these files to complete the chore:

- **frontend/components/onboarding/OnboardingStyle.tsx** - Main component file to redesign. Currently has centered header, selected badge overlay on cards, and different card styling. Needs complete visual restructuring to match reference.

- **frontend/app/globals.css** - Global CSS file with brand color variables. Already has correct colors defined: `--onboarding-bg: #F5F0EB`, `--onboarding-primary: #C41E3A`, `--ootday-crimson: #C41E3A`. May need additional utility classes for the left border accent.

- **frontend/lib/data/fashion-styles.json** - Fashion style data with `id`, `name`, `description`, `longDescription`, `keywords`, and `imageUrl`. The component correctly uses this data source. No changes needed.

- **specs/fashion-styles-output.json** - Same fashion style data, appears to be a duplicate. Used for reference to ensure data consistency.

- **onboarding/5.1Onboarding-Style.png** - Reference design image showing the target UI. Use this as the single source of truth for all visual decisions.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Header Layout to Left-Aligned
- Remove `text-center` class from header container
- Change to left-aligned layout with `text-left`
- Update title to use red color from `--onboarding-primary` variable
- Ensure subtitle uses dark text color (`text-gray-900` or similar)
- Remove or adjust max-width constraints to allow proper left alignment
- Position header at the top of the content area

### 2. Reposition Selected Thumbnails Below Header
- Move selected thumbnails section to appear directly below header (not centered)
- Remove `justify-center` class from thumbnails container
- Update thumbnails to align left, matching header alignment
- Ensure X remove buttons are clearly visible with proper contrast
- Adjust thumbnail spacing and sizing to match reference (currently 60x80px looks correct)

### 3. Redesign Style Cards with Left Border Accent
- Remove thick 4px border from cards (`border-4` class)
- Add subtle LEFT border accent using `border-l-4` with red color
- Update card background to pure white
- Remove hover border color changes (keep simple white card)
- Remove selected badge overlay ("Selected" badge at bottom)
- Adjust card padding and spacing to match reference design
- Card should have: left red border, white background, rounded corners

### 4. Crop/Mask Card Images to Hide Baked-in Text
- Apply CSS `object-fit: cover` with precise positioning to hide text overlays
- Use `object-position` or container clipping to crop out text portions
- Alternatively, wrap image in a container with `overflow: hidden` and scale/position image
- Test with all style images (Group 31-40.png) to ensure text is hidden
- Maintain aspect ratio while hiding text overlays

### 5. Update Card Text Layout and Styling
- Move title BELOW image (currently it's below but verify structure)
- Format title as "Name · Description" in RED color using `--onboarding-primary`
- Remove inline concatenation if using separate elements
- Add gray `longDescription` text below title
- Use appropriate text sizes: larger for title, smaller for description
- Ensure proper line spacing and text hierarchy

### 6. Adjust Carousel Layout and Behavior
- Verify Embla carousel configuration for horizontal scrolling
- Ensure cards are properly sized in carousel (currently `flex-[0_0_240px]`)
- May need to adjust card width to match reference design
- Test smooth scrolling behavior
- Ensure cards have appropriate gap spacing (currently `gap-4`)

### 7. Reposition Next Button to Bottom Center
- Remove `justify-end` class from button container
- Change to `justify-center` for centered positioning
- Verify button is at BOTTOM of the layout, not inline with content
- Ensure circular shape (currently `w-14 h-14 rounded-full` looks correct)
- Verify red background color (`bg-[var(--onboarding-primary)]`)
- Keep arrow icon centered in button

### 8. Verify Background Color
- Confirm background uses `bg-[var(--onboarding-bg)]` which maps to #F5F0EB
- Check that cream/beige color is applied to entire screen
- Ensure no conflicting background colors in nested containers

### 9. Test Responsive Behavior
- Test on mobile viewport (cards should scroll horizontally)
- Test on tablet and desktop viewports
- Verify selected thumbnails display correctly when multiple styles selected
- Test adding/removing styles via thumbnail X buttons
- Ensure carousel is usable on touch devices

### 10. Visual QA Against Reference Design
- Compare header: red title left-aligned, dark subtitle below
- Compare selected thumbnails: positioned below header with X buttons
- Compare cards: white with left red border, image with no visible text, red title, gray description
- Compare carousel: smooth horizontal scrolling
- Compare next button: circular red button centered at bottom
- Compare overall spacing and proportions to reference image

## Validation Commands

Execute these commands to validate the chore is complete:

- **Visual Inspection**: Open `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/5.1Onboarding-Style.png` side-by-side with the running application at the onboarding style step
- **Build Check**: `cd frontend && npm run build` - Ensure no TypeScript or build errors
- **Lint Check**: `cd frontend && npm run lint` - Ensure no linting errors
- **Dev Server**: `cd frontend && npm run dev` - Start development server and navigate to onboarding flow
- **Browser DevTools**: Use browser inspector to verify CSS classes match intended design (left border, centered button, left-aligned header)
- **Multi-Select Test**: Select 3-4 different styles and verify thumbnails display correctly below header with X buttons
- **Carousel Test**: Verify horizontal scrolling works smoothly across all style cards
- **Image Inspection**: Verify that no baked-in text from image files is visible on style cards

## Notes

### Design System Colors
The component should use existing CSS variables for consistency:
- Primary Red: `var(--onboarding-primary)` = `#C41E3A`
- Background Cream: `var(--onboarding-bg)` = `#F5F0EB`
- Hover Red: `var(--onboarding-primary-hover)` = `#A01730`

### Image Masking Strategy
The reference design shows images WITHOUT visible text overlays, but the actual image files (Group 31-40.png) appear to have text baked into them. Consider these approaches:
1. **CSS Cropping**: Use `object-fit` and `object-position` to crop the text area
2. **Container Masking**: Wrap image in a container with specific dimensions and overflow hidden
3. **Image Replacement**: If text persists, may need to request new image assets without text overlays (future task)

### Card Border Detail
The reference shows a subtle LEFT border accent, not a full 4px border around the entire card. This is achieved with:
- `border-l-4 border-[var(--onboarding-primary)]` for left border only
- Remove existing `border-4` class that creates full border

### Carousel Configuration
The component already uses Embla carousel (`useEmblaCarousel`). The configuration looks appropriate:
```typescript
const [emblaRef] = useEmblaCarousel({
  align: 'start',
  containScroll: 'trimSnaps',
});
```
This should provide the desired horizontal scrolling behavior shown in the reference.

### Component Dependencies
- Uses `embla-carousel-react` for carousel functionality
- Uses Lucide icons: `ArrowRight`, `ChevronLeft`, `X`
- Uses custom UI components: `Button` from `@/components/ui/button`
- Uses `OnboardingProgress` component for step indicator
- Uses `StylePreference` type from `@/lib/types/user-profile-types`

### Testing Considerations
After implementation, thoroughly test:
1. Selecting and deselecting multiple styles
2. Removing styles via thumbnail X buttons
3. Scrolling through all 10 style options
4. Responsive behavior on mobile, tablet, desktop
5. Next button enabled/disabled state based on selection
6. Visual match with reference design at all viewport sizes
