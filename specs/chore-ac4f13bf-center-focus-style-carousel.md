# Chore: Center-Focus Style Carousel with 3D Depth Effect

## Metadata
adw_id: `ac4f13bf`
prompt: `Improve OnboardingStyle carousel interaction to match design mockups at /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/preference/. Current implementation at frontend/components/onboarding/OnboardingStyle.tsx uses basic Embla carousel with fixed 160px cards.

  Required changes:
  1. CENTER-FOCUS CAROUSEL: Implement center-snap carousel where active/center card is larger and prominent, side cards are smaller/scaled (inspired by 3D card carousel at https://webartdevelopers.com/blog/card-carousel/)
  2. CARD CONTENT: Add style name (e.g., 'Minimal · Timeless') and description text below each card image as shown in design mockups
  3. VISUAL HIERARCHY: Center card should have larger scale (1.0), side cards should have reduced scale (~0.85) with smooth transition effects
  4. SMOOTH ANIMATION: Add CSS transforms for perspective/depth effect - use translateZ, scale, and opacity transitions for engaging scroll interaction
  5. SNAP BEHAVIOR: Change Embla config from dragFree to center-snap alignment so cards snap to center position

  Reference the fashion-styles.json for style names and cardDescription fields. Keep the selected thumbnails feature at top. Ensure mobile-responsive design.`

## Chore Description
Redesign the OnboardingStyle carousel to implement a center-focus 3D-style carousel that matches the design mockups. The current implementation uses a basic Embla carousel with:
- Fixed 160px card width
- `dragFree: true` allowing free scrolling
- `align: 'start'` alignment
- Cards showing only images without text content

The design mockups (5.1-5.10Onboarding-Style.png) show:
- Center card prominently displayed at full scale
- Side cards partially visible with smaller scale
- Each card displays: style image + style name (e.g., "Minimal · Timeless") + description text
- Cards snap to center position when scrolling
- Visual depth effect with scale/opacity transitions

Key data from `fashion-styles.json`:
- `name`: Style name (e.g., "Minimal")
- `description`: Style descriptor (e.g., "Timeless")
- `cardDescription`: Card description text (e.g., "Less is more, clean, simple, neutral palette, pieces that last forever")

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main component file to modify; contains the carousel implementation with Embla
- `frontend/lib/data/fashion-styles.json` - Data source for style names, descriptions, and cardDescription fields
- `frontend/app/globals.css` - Contains existing carousel styles (`.embla`, `.selection-carousel-card`, `.carousel-card-*`) and onboarding animations
- `frontend/lib/types/user-profile-types.ts` - TypeScript types for StylePreference (verify it includes cardDescription)
- `onboarding/preference/*.png` - Design mockup references showing expected visual output

### Reference Files (Read-Only)
- `onboarding/preference/5.1Onboarding-Style.png` - Shows center card "Minimal · Timeless" with description
- `onboarding/preference/5.2Onboarding-Style.png` - Shows center card "Luxury · Elegant"
- `onboarding/preference/5.3Onboarding-Style.png` - Shows center card "Eccentric · Creative"

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify TypeScript Types
- Read `frontend/lib/types/user-profile-types.ts` to check StylePreference interface
- Ensure `cardDescription` field is included in the type definition
- If missing, add optional `cardDescription?: string` field to StylePreference interface

### 2. Update Embla Carousel Configuration
- Change `align: 'start'` to `align: 'center'` for center-snap behavior
- Change `dragFree: true` to `dragFree: false` for snap-to-position behavior
- Add `containScroll: 'keepSnaps'` to prevent over-scrolling
- Import and use `useCallback` and `useEffect` hooks for scroll event handling

### 3. Implement Scroll Progress Tracking
- Add state to track the current selected index: `const [selectedIndex, setSelectedIndex] = useState(0)`
- Add state for scroll progress: `const [scrollSnaps, setScrollSnaps] = useState<number[]>([])`
- Use Embla's `onSelect` callback to track which card is centered
- Extract `emblaApi` from useEmblaCarousel hook: `const [emblaRef, emblaApi] = useEmblaCarousel(...)`

### 4. Create Scale/Opacity Transform Logic
- Implement a function to calculate scale based on distance from center:
  ```typescript
  const getSlideStyles = (index: number) => {
    const distance = Math.abs(index - selectedIndex);
    const scale = distance === 0 ? 1 : Math.max(0.85, 1 - distance * 0.15);
    const opacity = distance === 0 ? 1 : Math.max(0.6, 1 - distance * 0.3);
    return { transform: `scale(${scale})`, opacity };
  };
  ```
- Apply these transforms to each card wrapper element

### 5. Update Card Layout with Text Content
- Increase card width from 160px to 220px (or use responsive widths)
- Add text section below image with:
  - Style name + description (e.g., "Minimal · Timeless") - bold, crimson color
  - Card description text - gray, smaller font, max 3 lines
- Structure card as flex column with image (70%) and text content (30%)
- Use existing `.line-clamp-3` utility for description truncation

### 6. Add CSS Styles for 3D Depth Effect
- Add perspective container wrapper for 3D depth effect
- Add CSS transitions for smooth scale/opacity animations:
  ```css
  .carousel-slide-3d {
    transition: transform 0.4s ease, opacity 0.4s ease;
    transform-origin: center center;
  }
  ```
- Add subtle shadow increase for center card
- Ensure transitions are smooth (300-400ms duration with ease timing)

### 7. Update Card Styling to Match Mockups
- Card background: white with rounded corners (2xl)
- Border: light pinkish border (`var(--onboarding-card-border)`)
- Selected state: darker border (`var(--onboarding-card-border-selected)`)
- Center card: subtle box-shadow for depth
- Side cards: reduced shadow or none

### 8. Ensure Mobile Responsiveness
- Use responsive card widths: 200px mobile, 240px tablet, 280px desktop
- Adjust text sizes for mobile: smaller font for description
- Test touch gestures work smoothly with snap behavior
- Ensure carousel doesn't overflow screen edges

### 9. Preserve Existing Functionality
- Keep selected thumbnails section at top (unchanged)
- Maintain `toggleStyle` and `removeStyle` functions
- Keep the circular red next button at bottom
- Preserve back button functionality

### 10. Validate Implementation
- Run development server: `cd frontend && pnpm dev`
- Test carousel snaps to center on scroll/drag
- Verify center card appears larger than side cards
- Confirm style name and description display correctly
- Test selection/deselection updates thumbnails
- Check responsive behavior on mobile viewport

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm lint` - Verify no linting errors
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm build` - Ensure production build succeeds
- Visual validation: Start dev server with `pnpm dev` and navigate to onboarding style step to verify:
  1. Carousel snaps cards to center position
  2. Center card is larger (scale 1.0) than side cards (scale ~0.85)
  3. Each card shows image + "Name · Description" + cardDescription text
  4. Smooth scale/opacity transitions when scrolling
  5. Selected thumbnails appear at top when styles are chosen
  6. Responsive design works on mobile viewport (375px width)

## Notes
- The design mockups show cards with approximately 70% image height and 30% text content area
- Use existing CSS variables from globals.css for consistent theming (--onboarding-primary, --onboarding-card-border, etc.)
- The fashion-styles.json already has `cardDescription` fields for all styles - no data changes needed
- Embla carousel provides smooth native scrolling; avoid overriding with heavy custom animations
- Consider using `will-change: transform` CSS property for better animation performance
- The center card in mockups shows a subtle pink/rose border tint when centered
