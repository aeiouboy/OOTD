# Chore: Redesign 'What's your style?' onboarding page

## Metadata
adw_id: `e94c177d`
prompt: `Redesign the 'What's your style?' onboarding page in frontend/components/ui/SelectionCarousel.tsx and related components to match the design specifications.`

## Chore Description
Redesign the onboarding style selection page to match the Figma mockups (5.1-5.10Onboarding-Style.png). The current implementation is functional but needs visual refinements to match the exact design specifications. Key changes include:

1. **Header Section**: Title "What's your style?" in crimson (#C41E3A) bold with subtitle "Choose style that sparks you" in dark gray, followed by selected thumbnails row (60x80px) with pink X remove buttons.

2. **Carousel Section**: Horizontal scrolling carousel with 10 style cards (~160px wide), rounded corners, white background, left crimson border accent (4px) when selected. Card content includes full-height image (220px), style name in crimson ("Name · Description" format), and gray description text.

3. **Footer Section**: Circular crimson arrow button (56px diameter) centered at bottom, disabled (gray) when no selection.

4. **The 10 Fashion Styles**: Minimal, Luxury, Eccentric, Business, Vanilla, Sporty, Edgy, Bohemian, Classic, Mystery Style.

5. **Interaction Behavior**: Multi-select allowed, horizontal swipe/scroll through all 10 cards, selected cards show crimson left border + thumbnail in header row, tap X to deselect, arrow button navigates when at least 1 selected.

## Relevant Files
Use these files to complete the chore:

- `frontend/components/ui/SelectionCarousel.tsx` - Main reusable carousel component that needs redesign to match design specs
- `frontend/components/ui/SelectionThumbnail.tsx` - Thumbnail component (60x80px) with X close button - needs styling refinements
- `frontend/components/ui/CarouselDots.tsx` - Carousel position indicator dots (may need styling updates)
- `frontend/components/onboarding/OnboardingStyle.tsx` - Onboarding page that uses the carousel - verify integration works
- `frontend/lib/types/selection-types.ts` - Type definitions for carousel items
- `frontend/lib/data/fashion-styles.json` - Data source with 10 fashion styles (already correctly configured)
- `specs/fashion-styles-output.json` - Reference spec for style data (used for validation)
- `frontend/app/globals.css` - CSS variables for brand colors (--onboarding-bg: #F5F0EB, --onboarding-primary: #C41E3A)

### Design Reference Images
- `onboarding/Style/preference/5.1Onboarding-Style.png` through `5.10Onboarding-Style.png` - Figma mockups showing exact visual spec

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Design Specifications Against Current Implementation
- Examine all 10 design reference images in `onboarding/Style/preference/` to understand exact visual requirements
- Compare current `SelectionCarousel.tsx` implementation against the design
- Document specific differences that need addressing (spacing, colors, typography, card dimensions)

### 2. Update CSS Variables and Global Styles
- Verify CSS variables in `frontend/app/globals.css` match the design:
  - Background: `--onboarding-bg: #F5F0EB` (warm beige)
  - Primary: `--onboarding-primary: #C41E3A` (crimson)
  - Add any missing CSS utilities for carousel card styling if needed

### 3. Update SelectionThumbnail Component
- Ensure thumbnail dimensions are exactly 60x80px as per design
- Verify crimson border styling on selected thumbnails
- Ensure X remove button has proper pink/crimson styling and positioning (top-right corner)
- Make sure hover/tap states are smooth

### 4. Refine SelectionCarousel Component Layout
- **Header Section**:
  - Title: 3xl font, bold, crimson text, left-aligned
  - Subtitle: base size, dark gray (text-gray-900), left-aligned
  - Add proper spacing between title and selected thumbnails row

- **Selected Thumbnails Row**:
  - Display selected items as 60x80px thumbnails below header
  - Horizontal scrollable if many items selected
  - Each thumbnail shows style image with X remove button

- **Carousel Section**:
  - Cards: 160px width, rounded-2xl corners, white background
  - 4px left border accent when selected (crimson color)
  - Card image: 220px height, object-cover, object-top positioning
  - Card content: centered text with "Name · Description" in crimson, gray description below
  - Gap between cards: 16px (gap-4)
  - Negative margin to allow cards to be visible at edges (-mx-6)

- **Footer Section**:
  - Circular button: 56px diameter (w-14 h-14)
  - Crimson background when enabled, gray when disabled
  - Centered horizontally
  - Arrow icon inside

### 5. Ensure Embla Carousel Configuration is Correct
- Verify embla-carousel settings for horizontal scrolling:
  - `align: 'start'` for left-aligned snapping
  - `containScroll: false` to allow full horizontal scrolling of all 10 cards
  - `dragFree: true` for smooth drag behavior
- Ensure scroll snap works properly with `scrollSnapAlign: 'start'`
- Verify all 10 style cards are scrollable (not just visible ones)

### 6. Update CarouselDots Component (if needed)
- Ensure dots styling matches the brand design
- Active dot: crimson background with slightly wider width
- Inactive dots: gray background

### 7. Verify Type Definitions
- Review `frontend/lib/types/selection-types.ts` to ensure all required fields are present:
  - `id`, `name`, `description`, `cardDescription`, `imageUrl`
- Ensure `StylePreference` type in `frontend/lib/types/user-profile-types.ts` is compatible

### 8. Test Integration with OnboardingStyle Component
- Verify `OnboardingStyle.tsx` correctly uses the updated carousel
- Test selection/deselection behavior
- Test thumbnail display and removal
- Test navigation button enable/disable state
- Ensure all 10 fashion styles render correctly

### 9. Validate Responsive Design
- Test on 375px viewport width (mobile-first design)
- Ensure cards maintain proper dimensions
- Verify horizontal scrolling works smoothly
- Check that selected thumbnails row scrolls properly when many items selected

### 10. Final Visual QA
- Compare final implementation against all 10 design reference images
- Verify color accuracy (#C41E3A crimson, #F5F0EB background)
- Check typography sizing and weights
- Verify spacing and dimensions match design specs

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run lint` - Run ESLint to check for code issues
- `cd frontend && npm run build` - Build the frontend to catch TypeScript errors
- `cd frontend && npm run dev` - Start dev server and manually test the onboarding style page at `/onboarding`
- Visual comparison: Take screenshots of implementation and compare against design reference images in `onboarding/Style/preference/`

## Notes

### Current State Analysis
The existing implementation in `SelectionCarousel.tsx` and `OnboardingStyle.tsx` is already functional with most of the required structure:
- Embla carousel is configured
- Card layout with 160px width exists
- Left border accent on selection exists
- Thumbnail selection row exists
- Circular arrow button exists

### Key Differences to Address
Based on design image review, the main areas needing refinement are:
1. Fine-tuning spacing and dimensions to exactly match design
2. Ensuring card styling matches (rounded corners, shadow, border)
3. Verifying selected thumbnail styling with X button positioning
4. Ensuring Mystery Style card (10th card) has special styling if needed

### Data Source
The fashion styles data is sourced from `frontend/lib/data/fashion-styles.json` which already contains all 10 styles with correct structure including `cardDescription` field for the gray text below the title.

### CSS Variables Available
```css
--onboarding-bg: #F5F0EB;
--onboarding-primary: #C41E3A;
--onboarding-primary-hover: #A01730;
```
