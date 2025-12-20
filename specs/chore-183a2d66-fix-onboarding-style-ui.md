# Chore: Fix Onboarding Style Page UI Issues

## Metadata
adw_id: `183a2d66`
prompt: `Fix onboarding style page UI issues to match design specs from /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/. Issues to fix: 1) Description card has poor visibility - text should be clear and readable with proper contrast on cream/beige background, 2) Remove duplicate score bar - page currently shows 2 score bars but design shows only 1 progress indicator (the arrow button at bottom), 3) Remove red line/border from style cards - should use soft rose/pink border (like #E8D5D5 or similar) with rounded corners instead of harsh red line, 4) Complete style descriptions - each style card should show full description text.`

## Chore Description
This chore fixes multiple UI issues on the OnboardingStyle page to align with the design specifications shown in the reference images. The design shows:

1. **Style cards with soft rose/pink borders** - Cards should have a subtle rose/pink border (`#E8D5D5` or similar) with rounded corners, not the current harsh crimson (`#C41E3A`) border
2. **Single progress indicator** - Only the circular arrow button at the bottom serves as progression; the OnboardingProgress dot indicator and CarouselDots should both be removed
3. **Improved text visibility** - Style name in bold format "Name · Description" with clear description text below
4. **Complete style card layout** - Large image, bold title in "Style · Adjective" format, full description text in smaller font, soft rounded border, no internal score/progress elements

Based on the design reference images:
- Cards have a soft rose/pink border (selected cards have slightly more prominent border)
- Style title format: "Minimal · Timeless", "Luxury · Elegant", "Business · Refined", "Vanilla · Clean"
- Description text is clearly visible below the title
- No progress dots above the carousel or below it
- Only the circular arrow button at bottom for navigation

## Relevant Files
Use these files to complete the chore:

- **`frontend/components/onboarding/OnboardingStyle.tsx`** - Main component file containing the style selection carousel, progress indicators, and card rendering logic. This is the primary file to modify.
- **`frontend/app/globals.css`** - Contains CSS variables for onboarding colors (`--onboarding-primary`, `--onboarding-bg`) and carousel card styling classes. Need to add soft rose/pink border color variable.
- **`frontend/lib/data/fashion-styles.json`** - Contains style definitions with `name`, `description`, and `cardDescription` fields. Data is already complete and properly formatted.
- **`frontend/components/onboarding/OnboardingProgress.tsx`** - Progress dot indicator component that needs to be removed from the style page.
- **`frontend/components/ui/CarouselDots.tsx`** - Carousel position indicator that needs to be removed from the style page.

### Reference Files (Design Specs)
- **`onboarding/Style/preference/5.1Onboarding-Style.png`** through **`5.5Onboarding-Style.png`** - Design reference images showing expected UI appearance with soft borders, no progress bars, and proper text formatting.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Soft Rose Border Color Variable
- Open `frontend/app/globals.css`
- Add new CSS variable `--onboarding-card-border: #E8D5D5;` in the `:root` section alongside other onboarding colors
- Add `--onboarding-card-border-selected: #D4B5B5;` for selected card state (slightly darker rose)

### 2. Remove OnboardingProgress Component
- Open `frontend/components/onboarding/OnboardingStyle.tsx`
- Remove the import statement for `OnboardingProgress` component
- Remove the `<OnboardingProgress currentStep={5} totalSteps={7} />` JSX element from the render

### 3. Remove CarouselDots Component
- In `frontend/components/onboarding/OnboardingStyle.tsx`
- Remove the import statement for `CarouselDots` component
- Remove the related state: `scrollSnaps` and `selectedIndex` (can keep `selectedIndex` if needed for other logic)
- Remove the `useCallback` for `onSelect` if only used for dots
- Remove the `useEffect` that sets up `scrollSnaps` and `onSelect` listener
- Remove the `scrollTo` callback if only used for dots
- Remove the JSX block that renders `<CarouselDots ... />`

### 4. Update Style Card Border Styling
- In `frontend/components/onboarding/OnboardingStyle.tsx`
- Update the card button className to use soft rose border instead of crimson/gray
- Change from: `border-2 ${isSelected ? 'border-[var(--onboarding-primary)]' : 'border-gray-200'}`
- Change to: `border-2 ${isSelected ? 'border-[var(--onboarding-card-border-selected)]' : 'border-[var(--onboarding-card-border)]'}`
- Remove `carousel-card-selected` class reference since we're removing the crimson shadow effect
- Keep `carousel-card-border` class for smooth transition

### 5. Update Selected Card Visual Feedback
- In `frontend/app/globals.css`
- Update `.carousel-card-selected` class to use the soft rose color for shadow instead of crimson
- Change `box-shadow: 0 4px 15px -3px rgba(196, 30, 58, 0.2);` to `box-shadow: 0 4px 15px -3px rgba(212, 181, 181, 0.4);`

### 6. Improve Card Description Text Visibility
- In `frontend/components/onboarding/OnboardingStyle.tsx`
- Update the card description text styling for better contrast
- Change `text-gray-500` to `text-gray-700` for better visibility on cream background
- Ensure the title `{style.name} · {style.description}` has proper bold styling with `text-[var(--onboarding-primary)]` or dark color
- Consider using `text-gray-900` for the title for better consistency with design

### 7. Update Selected Thumbnail Border
- In `frontend/components/onboarding/OnboardingStyle.tsx`
- Update the selected style thumbnails row (at top) to use soft rose border
- Change `border-2 border-[var(--onboarding-primary)]` to `border-2 border-[var(--onboarding-card-border-selected)]`
- Update the X button background from `bg-[var(--onboarding-primary)]` to a more subtle color or keep as is for visibility

### 8. Clean Up Unused Imports and State
- In `frontend/components/onboarding/OnboardingStyle.tsx`
- Remove any unused imports after removing progress/dots components
- Remove unused state variables (`scrollSnaps` state if completely unused)
- Remove unused callbacks (`onSelect`, `scrollTo` if completely unused)
- Ensure embla carousel core functionality remains intact for scrolling

### 9. Validate Visual Appearance
- Run the development server: `cd frontend && pnpm dev`
- Navigate to the onboarding style page
- Verify:
  - No progress dots appear above the carousel
  - No carousel position dots appear below the carousel
  - Style cards have soft rose/pink borders
  - Selected cards have slightly darker rose border
  - Description text is clearly readable
  - Only the circular arrow button remains at bottom
  - Carousel still scrolls smoothly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm build` - Ensure the project builds without errors
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm lint` - Run linting to check for any issues
- Manual visual validation: Run `pnpm dev` and navigate to onboarding style page to confirm UI matches design specs

## Notes

- The fashion-styles.json data already contains complete style definitions with proper `name`, `description`, and `cardDescription` fields. No data changes are needed.
- The embla carousel functionality should remain intact for horizontal scrolling; we're only removing the visual dot indicators.
- The circular arrow button at the bottom is the intended single progress/navigation element per the design.
- The soft rose border color (#E8D5D5) is chosen to complement the cream background (#F5F0EB) while maintaining the warm, fashion-forward aesthetic.
- Selected thumbnails at the top may keep the crimson X button for clear visibility, or can be updated to match the softer aesthetic if preferred.
