# Chore: Fix Style Carousel Scrolling Issue

## Metadata
adw_id: `d5466179`
prompt: `Fix the style carousel scrolling issue in OnboardingStyle.tsx - currently shows only 5 of 10 styles without clear scrolling affordance. Issue: Users cannot easily discover that there are more styles to scroll through (10 total styles). Required fixes: embla-carousel horizontal scrolling, partial cards visible on edges, touch/swipe gestures, scroll indicators, proper card width and gap spacing.`

## Chore Description
The OnboardingStyle.tsx component displays a horizontal carousel of 10 fashion styles (Minimal, Luxury, Eccentric, Business, Vanilla, Sporty, Edgy, Bohemian, Classic, Mystery) using embla-carousel. Currently, users only see approximately 5 styles without any clear visual indication that more content exists beyond the viewport.

Based on the reference designs in `/onboarding/Style/preference/*.png`, the carousel should:
1. Show partial cards peeking from the edges (~20-30px) to indicate scrollable content
2. Support smooth horizontal swiping on mobile and drag scrolling on desktop
3. Optionally include dot indicators to show current position among all 10 styles
4. Have properly sized cards (~160px width) with appropriate gap spacing
5. Feel natural and intuitive to scroll through

The current implementation has `containScroll: 'trimSnaps'` which may be limiting the scroll affordance. The container also has `pr-8` padding which may not be providing enough peek for the next card.

## Relevant Files
Use these files to complete the chore:

- **frontend/components/onboarding/OnboardingStyle.tsx** - Main component containing the style carousel that needs fixing. Uses embla-carousel with `align: 'start'` and `containScroll: 'trimSnaps'` configuration.
- **frontend/components/ui/SelectionCarousel.tsx** - Reusable carousel component with identical implementation. Should be updated in parallel to maintain consistency across the codebase.
- **frontend/components/outfit/OutfitDiscovery.tsx** - Another carousel implementation for reference. Has the same embla-carousel pattern.
- **frontend/lib/data/fashion-styles.json** - Data source containing all 10 style definitions (confirms 10 styles exist).
- **onboarding/Style/preference/*.png** - Reference design images showing expected carousel behavior with partial cards visible on edges.

### New Files
- **frontend/components/ui/CarouselDots.tsx** (optional) - Reusable dot indicator component to show current carousel position.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Embla Carousel Configuration in OnboardingStyle.tsx
- Change the embla-carousel options to improve scroll affordance:
  - Remove or modify `containScroll: 'trimSnaps'` to `containScroll: false` to allow more natural scrolling
  - Keep `align: 'start'` to ensure first card aligns with container start
  - Add `dragFree: true` for smoother free-scrolling feel (optional but recommended for this use case)
- Extract the emblaApi from useEmblaCarousel to enable scroll tracking: `const [emblaRef, emblaApi] = useEmblaCarousel({...})`

### 2. Adjust Container and Card Styling for Peek Effect
- Modify the carousel container div to remove `overflow-hidden` and use proper overflow handling:
  - Keep `overflow-hidden` on outer container but ensure inner flex container allows peek
- Update the inner flex container padding:
  - Change from `pl-4 pr-8` to `pl-0 pr-0` or adjust based on design
  - The container should allow cards to peek from the right edge by ~20-30px
- Ensure card width remains at `flex-[0_0_160px]` with `gap-4` (16px) spacing
- Add negative margin or adjust container width to show partial card on right edge

### 3. Implement Scroll Position Indicator (Dots)
- Add state to track current scroll index: `const [selectedIndex, setSelectedIndex] = useState(0)`
- Add state for total scroll snaps: `const [scrollSnaps, setScrollSnaps] = useState<number[]>([])`
- Create useEffect to initialize and listen to embla scroll events:
  ```typescript
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);
  ```
- Add dot indicators below the carousel showing current position among total items (or groups)

### 4. Create Reusable CarouselDots Component (Optional)
- Create `/frontend/components/ui/CarouselDots.tsx` with props:
  - `selectedIndex: number`
  - `scrollSnaps: number[]`
  - `onDotClick?: (index: number) => void`
- Style dots with small circles (6-8px), crimson active state, gray inactive state
- Add smooth transition animation between states

### 5. Apply Same Fixes to SelectionCarousel.tsx
- Update the embla-carousel configuration with same options as OnboardingStyle
- Extract emblaApi for scroll tracking
- Add scroll position tracking state and effects
- Add optional dot indicators (controlled via props)
- Ensure backwards compatibility with existing usage

### 6. Add Touch/Swipe Gesture Support Verification
- Embla-carousel has built-in touch/drag support, but verify:
  - Mobile swipe gestures work smoothly
  - Desktop drag-to-scroll works
  - Mouse wheel horizontal scrolling works (if applicable)
- Test on iOS Safari and Android Chrome behavior simulation
- No additional code should be needed as embla handles this natively

### 7. Add CSS Scroll Snap Fallback (Optional Enhancement)
- Add CSS scroll-snap-type as fallback styling for browsers without JS:
  ```css
  scroll-snap-type: x mandatory;
  scroll-snap-align: start;
  ```
- This provides native scroll snap behavior as progressive enhancement

### 8. Validate All 10 Styles Are Accessible
- Manually verify scrolling reaches all 10 styles:
  1. Minimal
  2. Luxury
  3. Eccentric
  4. Business
  5. Vanilla
  6. Sporty
  7. Edgy
  8. Bohemian
  9. Classic
  10. Mystery
- Verify dot indicators (if implemented) show correct position for all styles
- Verify partial card peek is visible on both left (after scrolling) and right edges

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm lint` - Run linting to ensure no TypeScript/ESLint errors
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm build` - Build the project to verify compilation succeeds
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm dev` - Start dev server and manually test carousel at the style selection step (step 5 of onboarding)

### Manual Testing Checklist:
1. Navigate to onboarding step 5 (style selection)
2. Verify partial card is visible on the right edge indicating more content
3. Swipe/drag left to scroll through styles
4. Verify all 10 styles are reachable
5. Verify smooth scrolling animation
6. Verify dot indicators show current position (if implemented)
7. Test on mobile viewport (375px width) using browser dev tools
8. Test selection/deselection still works after scrolling

## Notes
- The reference designs show a clean carousel with partial cards peeking from edges - this is the primary visual cue users need to understand more content exists
- Dot indicators are a secondary enhancement; the partial card peek is the primary scroll affordance
- embla-carousel already handles touch gestures natively, so no additional gesture libraries are needed
- The same fix should be applied to SelectionCarousel.tsx to maintain design consistency
- Consider accessibility: ensure carousel can be navigated with keyboard (left/right arrows) - embla supports this but may need explicit enabling
- The `containScroll: 'trimSnaps'` option in current implementation prevents the last items from being fully visible at the end - removing this will allow full scroll range
