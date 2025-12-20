# Chore: Redesign OnboardingStyle.tsx to Match Reference Design

## Metadata
adw_id: `1cc0ad67`
prompt: `Redesign OnboardingStyle.tsx to EXACTLY match reference design. IMPORTANT: Keep all 10 style cards in a horizontal scrollable carousel. CRITICAL changes: 1) CARD STRUCTURE - Each card contains ONLY: [Image ~80% height] → [Red title 'Minimal · Timeless'] → [Short gray description]. 2) REMOVE DUPLICATE CONTENT - Currently titles/descriptions appear both inside AND outside cards. Keep ONLY content INSIDE the white card, remove everything below/outside card. 3) IMAGE CROPPING - Use object-fit: cover and object-position: center top to hide baked-in text at bottom of images. 4) CARD STYLING - White card, subtle shadow, LEFT red vertical border accent line (thin stripe, not full border), rounded corners. Cards should be narrower and taller. 5) SELECTED THUMBNAILS - Small thumbnails at TOP with red X button overlay. 6) CAROUSEL - Horizontal scroll with embla-carousel, user can scroll to view and select from ALL 10 styles. 7) Use SHORT description field (style.description like 'Timeless') combined with name, and show the old-style tagline 'Less is more, clean, simple...' as the gray description text. 8) Ensure all 10 styles from fashion-styles.json are displayed and selectable. 9) Next button circular red at bottom center.`

## Chore Description

Complete redesign of the OnboardingStyle.tsx component to precisely match the reference design. The component must display all 10 fashion styles in a horizontally scrollable carousel where users can select their preferred styles.

**Critical Design Requirements:**

1. **Card Structure (Inside the white card only)**:
   - Image taking approximately 80% of card height
   - Red title below image: "Name · Description" format (e.g., "Minimal · Timeless")
   - Gray description text showing the longDescription field

2. **Remove Duplicate Content**:
   - Currently, card content may appear both inside and outside the card
   - All text content must be INSIDE the white card only
   - No floating text or titles outside the card boundary

3. **Image Cropping**:
   - Use `object-fit: cover` with `object-position: center top` to hide baked-in text at the bottom of images
   - Images should scale and crop to show the main content, hiding any text overlays

4. **Card Styling**:
   - White background
   - Subtle shadow for depth
   - LEFT red vertical border accent (thin stripe, not full 4px border)
   - Rounded corners
   - Cards should be narrower and taller (portrait orientation)

5. **Selected Thumbnails**:
   - Display at TOP of the page below the header
   - Small thumbnail images with red X button overlay for removal
   - Show only when styles are selected

6. **Carousel**:
   - Horizontal scrolling using embla-carousel
   - All 10 styles must be displayed and selectable
   - Smooth scroll behavior with proper snap points

7. **Text Content**:
   - Title: `{style.name} · {style.description}` in red
   - Description: `{style.longDescription}` in gray

8. **Next Button**:
   - Circular red button
   - Positioned at bottom center
   - Arrow icon inside
   - Disabled when no styles selected

## Relevant Files

Use these files to complete the chore:

- **frontend/components/onboarding/OnboardingStyle.tsx** - Main component to redesign. Currently has the carousel but needs visual restructuring for card layout, thumbnail positioning, and proper content organization.

- **frontend/lib/data/fashion-styles.json** - Contains all 10 fashion style definitions with `id`, `name`, `description`, `longDescription`, `keywords`, and `imageUrl` fields. This is the single source of truth for style data.

- **frontend/app/globals.css** - Global CSS with brand colors:
  - `--onboarding-bg: #F5F0EB` (cream background)
  - `--onboarding-primary: #C41E3A` (red accent)
  - `--onboarding-primary-hover: #A01730` (red hover)

- **frontend/lib/types/user-profile-types.ts** - TypeScript interface for `StylePreference` type used throughout the component.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Restructure Card Dimensions for Taller, Narrower Layout
- Change card width from `flex-[0_0_240px]` to a narrower size (approximately 200-220px)
- Ensure card has sufficient height for:
  - Image at ~80% height (approximately 280-300px)
  - Title text
  - Description text (~2-3 lines)
- Use min-height to maintain consistent card sizes across all styles
- Keep aspect ratio portrait-oriented

### 2. Update Card Styling with Left Border Accent and Shadow
- Apply white background to card: `bg-white`
- Add subtle shadow: `shadow-md` or custom box-shadow
- Change from current `border-l-4` to a thinner accent: `border-l-2` with `border-[var(--onboarding-primary)]`
- Add rounded corners: `rounded-xl` or `rounded-2xl`
- Remove any hover state that adds full border (keep only left accent)
- Ensure card has proper padding inside for content

### 3. Implement Image Cropping to Hide Baked-in Text
- Use container with fixed height: `h-[280px]` or similar
- Apply `overflow-hidden` to container
- On image, use:
  - `object-fit: cover` - ensures image fills container
  - `object-position: center top` - positions image to show top portion, cropping bottom
- Remove any scale transforms that might conflict
- Test with all 10 style images to verify text is hidden

### 4. Update Card Content Layout (Title and Description)
- Position title directly below image with proper spacing: `mt-3` or `mt-4`
- Format title as: `{style.name} · {style.description}` (e.g., "Minimal · Timeless")
- Apply red color to title: `text-[var(--onboarding-primary)]`
- Title styling: `text-lg font-bold`
- Add description below title: `{style.longDescription}`
- Description styling: `text-sm text-gray-500 mt-2`
- Use `line-clamp-3` on description to limit to 3 lines

### 5. Remove Any Duplicate Content Outside Cards
- Verify no text appears outside the white card boundary
- Remove any floating labels, badges, or overlays
- Selected state should only be indicated by:
  - Presence in thumbnail row
  - Visual styling change (left border accent more prominent if selected)
- Remove "Selected" badge if it exists

### 6. Position Selected Thumbnails at Top Below Header
- Keep selected thumbnails section positioned right after the header
- Container should be left-aligned (currently correct)
- Thumbnail size: 60x80px with `rounded-lg` and border
- Red X button overlay in top-right corner of each thumbnail
- Use `flex gap-3 overflow-x-auto` for horizontal scrolling of thumbnails
- Only show this section when `selectedStyles.length > 0`

### 7. Verify Carousel Contains All 10 Styles
- Ensure `styleOptions` is correctly imported from fashion-styles.json
- Map over all 10 styles without filtering
- Verify each style has:
  - Unique `id`
  - Correct `name`, `description`, `longDescription`
  - Valid `imageUrl` path
- Add error handling for missing images

### 8. Ensure Next Button is Circular and Centered at Bottom
- Verify button container has `flex justify-center`
- Button dimensions: `w-14 h-14` (56x56px)
- Button styling: `rounded-full bg-[var(--onboarding-primary)]`
- Arrow icon: `<ArrowRight className="w-6 h-6" />`
- Disabled state: `disabled:bg-gray-300 disabled:cursor-not-allowed`
- Proper spacing from carousel: `pt-6` or `mt-6`

### 9. Update Embla Carousel Configuration
- Verify carousel settings:
  ```typescript
  useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  })
  ```
- Ensure proper gap between cards: `gap-4` in flex container
- Add horizontal padding to carousel container for edge cards
- Test smooth scrolling behavior

### 10. Validate Against Reference Design
- Header: "What's your style?" in red, left-aligned
- Subtitle: "Choose style that sparks you" in dark text
- Selected thumbnails: Below header, left-aligned with X buttons
- Style cards: White, shadow, left red border accent, narrower/taller
- Card images: Top portion visible, bottom cropped
- Card title: Red, "Name · Description" format
- Card description: Gray, longDescription text
- Carousel: Horizontal scroll, all 10 styles accessible
- Next button: Circular red, bottom center

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd frontend && npm run build` - Verify no TypeScript or build errors
- `cd frontend && npm run lint` - Verify no linting errors
- `cd frontend && npm run dev` - Start dev server and test the component

**Manual Testing Checklist:**
1. Navigate to onboarding style selection step
2. Verify header is left-aligned with red title
3. Verify carousel shows all 10 style cards
4. Scroll through carousel to confirm all styles are visible
5. Select 2-3 styles and verify thumbnails appear below header
6. Click X on thumbnails to deselect styles
7. Verify card images don't show baked-in text
8. Verify card titles show "Name · Description" format
9. Verify gray description text is visible
10. Verify Next button is circular and centered
11. Verify Next button is disabled when no styles selected
12. Click Next and verify navigation works

## Notes

### Fashion Styles Data Structure
Each style in `fashion-styles.json` has:
```json
{
  "id": "minimal",
  "name": "Minimal",
  "description": "Timeless",
  "longDescription": "Clean lines, neutral palettes...",
  "keywords": ["minimalist", "neutral", ...],
  "imageUrl": "/images/styles/Group 31.png"
}
```

### CSS Variable References
- Background: `var(--onboarding-bg)` = `#F5F0EB`
- Primary (red): `var(--onboarding-primary)` = `#C41E3A`
- Hover (darker red): `var(--onboarding-primary-hover)` = `#A01730`

### Card Dimensions Recommendation
Based on the requirements for narrower, taller cards:
- Width: ~200px (`flex-[0_0_200px]`)
- Image height: ~280px (`h-[280px]`)
- Total card height: ~400px (auto based on content)
- Border left: 2-3px red accent

### Image Cropping Strategy
The style images (Group 31-40.png) have text baked into the bottom portion. Using:
```css
object-fit: cover;
object-position: center top;
```
This positions the image starting from the top, cropping the bottom where text typically appears.

### Embla Carousel Dependencies
The component uses `embla-carousel-react`. Ensure it's properly installed:
```bash
npm list embla-carousel-react
```

### Selected State Indicator
Rather than a "Selected" badge overlay, the selected state should be indicated by:
1. Thumbnail presence in the top selection row
2. Optionally: slightly more prominent left border or subtle background tint
