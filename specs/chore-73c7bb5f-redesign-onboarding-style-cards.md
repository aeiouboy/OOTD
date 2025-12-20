# Chore: Redesign OnboardingStyle Page to Match Design Specs

## Metadata
adw_id: `73c7bb5f`
prompt: `Redesign OnboardingStyle page to exactly match design specs from /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/ (images 5.1-5.10). Current issues: 1) CARD HEIGHT INCONSISTENCY - cards have very different heights (Eccentric is much taller than Business). Design shows cards should have UNIFORM height with content aligned. Set fixed card height that accommodates all content OR use CSS grid with align-items:stretch to make all cards same height. 2) BORDER COLOR - 'Business · Refined' card still has darker/different border. Ensure ALL cards use identical soft rose border (#E8D5D5 for unselected). Check if any inline styles or conditional classes override the border. 3) IMAGE AREA - images should have consistent aspect ratio and positioning within each card. Use fixed height for image container (aspect-[3/4]) with object-cover and object-top. 4) CARD LAYOUT - reference design shows: image takes ~70% of card height, text area takes ~30%. Style name 'Name · Adjective' in bold black, description in gray below. All cards should align at TOP and BOTTOM edges when displayed side by side. Use flex container with items-stretch or CSS grid for uniform card heights. Files to modify: frontend/components/onboarding/OnboardingStyle.tsx and frontend/app/globals.css`

## Chore Description
Redesign the OnboardingStyle component to exactly match the design specifications shown in reference images 5.1-5.10. The design shows a horizontal carousel of fashion style cards where users select their preferred styles. Key design elements from reference images:

**Card Design (from reference images):**
- Cards have a soft rose/pink border (#E8D5D5) when unselected
- Cards display a fashion image taking ~70% of the card height
- Text section (~30%) shows: "Style Name · Adjective" in bold black, description text in gray below
- All cards have UNIFORM height regardless of content length
- Cards are rounded with subtle shadow on hover/selection
- Selected cards show a deeper rose border (#D4B5B5)

**Current Issues to Fix:**
1. Card heights vary based on content (Eccentric card is much taller than Business)
2. Border colors may be inconsistent across cards
3. Image containers don't have consistent aspect ratio
4. Text content causes cards to have different heights

## Relevant Files
Use these files to complete the chore:

- **`frontend/components/onboarding/OnboardingStyle.tsx`** - Main component file containing the carousel and style card rendering logic. This is where card structure, styling classes, and layout are defined.

- **`frontend/app/globals.css`** - Global CSS file containing CSS custom properties for onboarding colors (`--onboarding-card-border`, `--onboarding-card-border-selected`) and animation classes for carousel cards.

- **`frontend/lib/data/fashion-styles.json`** - Data source for style options. Contains `cardDescription` field which varies in length causing height inconsistency. Understanding the data structure helps design appropriate text truncation.

- **Reference images** (`onboarding/Style/preference/5.1-5.10Onboarding-Style.png`) - Design specifications showing expected card layout, spacing, and styling.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Card Container to Use Fixed Height
- In `OnboardingStyle.tsx`, update the card wrapper div (line 111-114) to use a fixed height that accommodates all content
- Change from flexible height to a fixed card height (approximately 340px based on design proportions)
- Ensure the outer container uses `items-stretch` to align all cards at both top and bottom edges

### 2. Update Image Container Styling
- Modify the image container div (line 125) to use a fixed height instead of aspect ratio
- Set image container to approximately 200px height (70% of card)
- Ensure `object-cover` and `object-top` are applied consistently
- Remove the `h-[120%]` overflow hack and use proper containment

### 3. Fix Text Content Section for Uniform Height
- Update the text content div (line 142) to have a fixed height (approximately 96px minimum)
- Use `flex-grow` to allow text section to fill remaining card space
- Add text truncation (`line-clamp-2` or `line-clamp-3`) to `cardDescription` to prevent overflow
- Ensure title and description stack properly within fixed space

### 4. Ensure Consistent Border Colors
- Verify border color classes in the button element (lines 118-122)
- Remove any conditional border styles that might cause inconsistency
- Use only `border-[var(--onboarding-card-border)]` for unselected (#E8D5D5)
- Use only `border-[var(--onboarding-card-border-selected)]` for selected (#D4B5B5)
- Check that no inline styles or other classes override border color

### 5. Update CSS Variables and Utility Classes
- In `globals.css`, verify `--onboarding-card-border: #E8D5D5` is correct
- Add a utility class `.style-card` for consistent card styling if needed
- Add `.line-clamp-2` or `.line-clamp-3` utility if not already available via Tailwind

### 6. Polish Card Layout and Spacing
- Ensure padding inside text area matches design (p-3 or p-4)
- Verify style name uses correct typography: `text-sm font-bold text-gray-900`
- Verify description uses: `text-xs text-gray-700`
- Center-align both title and description text

### 7. Validate the Implementation
- Test carousel scrolling with all 10 style cards visible
- Verify all cards have identical heights when displayed side-by-side
- Check border colors in both selected and unselected states
- Test with varying description lengths (short like "Business" vs long like "Eccentric")
- Verify image positioning is consistent across all cards

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm build` - Ensure TypeScript compiles without errors
- `cd frontend && pnpm lint` - Check for linting issues
- `cd frontend && pnpm dev` - Run development server and manually verify:
  - Navigate to onboarding flow and reach the style selection step
  - Visually compare against reference images 5.1-5.5
  - Check that Eccentric and Business cards have same height
  - Verify border colors are uniform (#E8D5D5 for all unselected cards)
  - Test selection state border color change

## Notes
- The design uses a horizontal scrollable carousel implemented with Embla Carousel
- Card width is fixed at 160px (`flex-[0_0_160px]`)
- The current implementation uses `min-h-[96px]` for text area which allows variable height - this should be changed to fixed height
- Reference images show approximately 70/30 split between image and text areas
- Text should be truncated with ellipsis if it exceeds the available space
- The soft rose color (#E8D5D5) is already defined as `--onboarding-card-border` in CSS variables
