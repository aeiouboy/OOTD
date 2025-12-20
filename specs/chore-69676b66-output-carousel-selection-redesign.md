# Chore: Output Carousel Selection Redesign

## Metadata
adw_id: `69676b66`
prompt: `Analyze and redesign the output choose display layout to match the style preference carousel design from /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/*.png images. Design reference: Header (pink title + gray subtitle), Selected items row (60x80px thumbnails with X close buttons), Horizontal embla-carousel cards (160px width, 220px image, white bg, left-border accent when selected, centered pink 'Name · Description' title, gray description text), Circular pink arrow button (w-14 h-14) at bottom. Background warm beige (#F5F0EB). Reference implementation: frontend/components/onboarding/OnboardingStyle.tsx. Create/update components to implement this carousel-style selection pattern for displaying and choosing output options matching brand design system.`

## Chore Description
Redesign the output/outfit selection display to match the brand's style preference carousel design system. The goal is to create a consistent visual pattern across the application by implementing the same carousel-based selection UI used in the onboarding flow for choosing outfits or other output options.

Key design elements to implement:
1. **Header Section**: Pink/crimson title (#C41E3A) with gray subtitle below
2. **Selected Items Row**: Horizontal row of 60x80px thumbnails with X close buttons for removing selections
3. **Horizontal Carousel**: Embla-carousel powered cards with:
   - 160px card width
   - 220px image height
   - White background
   - Left-border accent (crimson) when selected
   - Centered pink "Name · Description" title
   - Gray description text below
4. **Navigation Button**: Circular crimson arrow button (w-14 h-14 / 56x56px) at bottom center
5. **Background**: Warm beige (#F5F0EB) using `--onboarding-bg` CSS variable

## Relevant Files
Use these files to complete the chore:

### Reference Implementation
- `frontend/components/onboarding/OnboardingStyle.tsx` - **Primary reference** for the carousel pattern, selection state, and component structure
- `frontend/app/globals.css` - Design system CSS variables including `--onboarding-bg`, `--onboarding-primary`, `--onboarding-primary-hover`
- `frontend/lib/data/fashion-styles.json` - Data structure pattern for selectable items

### Design References
- `onboarding/Style/preference/5.1Onboarding-Style.png` through `5.10Onboarding-Style.png` - Visual design mockups showing the carousel pattern

### Target Components to Update
- `frontend/components/outfit/OutfitDiscovery.tsx` - Main outfit discovery/selection view that needs carousel redesign
- `frontend/components/outfit/OutfitCard.tsx` - Individual outfit card component to be adapted for carousel layout
- `frontend/components/outfit/OutfitGrid.tsx` - Grid layout that will be refactored to carousel pattern

### Supporting Components
- `frontend/components/chat/OutfitRecommendationCard.tsx` - Chat-based outfit cards to potentially align with new design
- `frontend/components/ui/button.tsx` - Button component for circular arrow button styling

### New Files
- `frontend/components/ui/SelectionCarousel.tsx` - Reusable carousel selection component following OnboardingStyle pattern
- `frontend/components/ui/SelectionThumbnail.tsx` - Reusable thumbnail with X close button for selected items row

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Reusable SelectionThumbnail Component
- Create `frontend/components/ui/SelectionThumbnail.tsx`
- Implement 60x80px thumbnail with image/fallback display
- Add crimson border-2 styling on container
- Add positioned X button (top-right, w-5 h-5, crimson bg, white icon)
- Accept props: `imageUrl`, `alt`, `onRemove`, `className`
- Add hover state for X button visibility

### 2. Create Reusable SelectionCarousel Component
- Create `frontend/components/ui/SelectionCarousel.tsx`
- Import and configure embla-carousel with `align: 'start'`, `containScroll: 'trimSnaps'`
- Implement header section with:
  - H1 title using `text-[var(--onboarding-primary)]` (crimson)
  - Subtitle in gray text
- Add selected items row using `SelectionThumbnail` components
- Build carousel container with proper gap and padding
- Create generic card component with:
  - `flex-[0_0_160px]` sizing
  - White background, rounded-2xl, shadow-sm
  - 220px image container with object-cover
  - Left border accent (4px, crimson when selected, transparent otherwise)
  - Centered title section with pink "Name · Description"
  - Gray description text with line-clamp-3
- Add circular arrow button at bottom center (w-14 h-14)
- Use `--onboarding-bg` (#F5F0EB) for background
- Accept generic props for flexibility: `items`, `selectedItems`, `onSelect`, `onRemove`, `title`, `subtitle`

### 3. Create SelectionCarouselItem Type Definition
- Add type definition in `frontend/lib/types/selection-types.ts`
- Define interface with: `id`, `name`, `description`, `cardDescription?`, `imageUrl?`
- Ensure compatibility with existing types (StylePreference, Outfit)

### 4. Update OutfitDiscovery Component
- Refactor `frontend/components/outfit/OutfitDiscovery.tsx` to use new carousel pattern
- Replace grid layout with `SelectionCarousel` component
- Map Outfit data to SelectionCarouselItem format
- Maintain existing filter and search functionality
- Update background to warm beige
- Keep accessibility features (sr-only headings, keyboard nav)

### 5. Create OutfitCarouselCard Component
- Create `frontend/components/outfit/OutfitCarouselCard.tsx`
- Specialized card for outfit display in carousel context
- Include: outfit image (220px height), title, description, price
- Follow the card styling pattern from OnboardingStyle
- Add selection state with left-border accent

### 6. Update CSS for Carousel Animations
- Add any additional embla carousel styles to `globals.css` if needed
- Ensure smooth transitions for selection states
- Add hover effects for cards
- Ensure touch/swipe interactions work on mobile

### 7. Validate Component Integration
- Test SelectionCarousel with sample outfit data
- Verify selection/deselection behavior works correctly
- Test thumbnail row updates when items are added/removed
- Ensure circular arrow button triggers appropriate action
- Verify responsive behavior on mobile and desktop

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run lint` - Ensure no linting errors in new/updated components
- `cd frontend && npm run type-check` - Verify TypeScript types are correct
- `cd frontend && npm run build` - Confirm production build succeeds
- `cd frontend && npm run dev` - Start dev server and manually verify:
  1. Navigate to outfit discovery page
  2. Confirm carousel layout matches design reference images
  3. Test selection/deselection of outfit items
  4. Verify selected items appear in thumbnail row
  5. Test X button removes items from selection
  6. Confirm circular arrow button is visible and styled correctly
  7. Check background color is warm beige (#F5F0EB)
  8. Test carousel swipe/scroll on mobile viewport

## Notes
- The design system uses CSS custom properties (CSS variables) for consistent theming - always reference these rather than hardcoding colors
- The crimson color is `#C41E3A` (available as `--onboarding-primary` or `--ootday-crimson`)
- The warm beige background is `#F5F0EB` (available as `--onboarding-bg` or `--ootday-cream`)
- Embla-carousel is already a dependency in the project (used in OnboardingStyle)
- Consider making SelectionCarousel fully reusable for other selection scenarios in the app
- The component should support both single and multi-select modes
- Mobile-first design with proper touch targets (min 44x44px)
