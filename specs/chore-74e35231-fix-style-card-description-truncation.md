# Chore: Fix Style Card Description Truncation on OnboardingStyle Page

## Metadata
adw_id: `74e35231`
prompt: `Fix style card description truncation on OnboardingStyle page. Current issues: 1) Description text is cut off/truncated - in frontend/components/onboarding/OnboardingStyle.tsx line 150, remove 'line-clamp-2' class so full description text is visible like the design specs show (e.g., 'Less is more, clean, simple, neutral palette, pieces that last forever' should be fully visible, not truncated), 2) Card content area has fixed height h-[72px] on line 142 - change to min-h-[72px] or h-auto to allow content to expand and show full description text. Reference design from /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/ shows descriptions are fully visible without truncation. Keep card layout consistent but allow text to wrap and display completely.`

## Chore Description

The OnboardingStyle component currently truncates style card descriptions, cutting off important text that should be fully visible. The design specifications show that full descriptions like "Less is more, clean, simple, neutral palette, pieces that last forever" should display completely without truncation.

There are two specific CSS issues:
1. Line 150 has a `line-clamp-2` class that limits description text to 2 lines
2. Line 142 has a fixed height `h-[72px]` on the card content area that prevents text from expanding

These constraints need to be adjusted to allow descriptions to display fully while maintaining consistent card layout and visual hierarchy.

## Relevant Files

- `frontend/components/onboarding/OnboardingStyle.tsx` (lines 142, 150) - The main component file containing the style card rendering logic with the truncation issues
- `frontend/lib/data/fashion-styles.json` - Contains the full cardDescription text that should be visible (e.g., "Less is more, clean, simple, neutral palette, pieces that last forever")
- `onboarding/Style/preference/5.1Onboarding-Style.png` - Design reference showing full description text visibility

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Text Truncation Class
- Open `frontend/components/onboarding/OnboardingStyle.tsx`
- Locate line 150 where the cardDescription paragraph is rendered
- Remove the `line-clamp-2` class from the paragraph element
- Keep all other classes intact (text-xs, text-gray-700, text-center, mt-2)

### 2. Update Card Content Height Constraint
- In the same file, locate line 142 where the card content div is defined
- Change the fixed height `h-[72px]` to a minimum height `min-h-[72px]`
- This allows the card to expand vertically to accommodate longer descriptions
- Ensure the flex layout properties remain unchanged (flex flex-col justify-start)

### 3. Visual Validation
- Review the changes to ensure card descriptions are now fully visible
- Verify that cards with shorter descriptions (e.g., "Smart, structured, and professional") maintain proper spacing
- Verify that cards with longer descriptions (e.g., "Less is more, clean, simple, neutral palette, pieces that last forever") display completely without truncation
- Compare with design reference images in `onboarding/Style/preference/` to ensure visual consistency

### 4. Test Across Multiple Style Cards
- Check all 10 style options (Minimal, Luxury, Eccentric, Business, Vanilla, Sporty, Edgy, Bohemian, Classic, Mystery) to ensure descriptions display properly
- Verify carousel scrolling still works smoothly with variable card heights
- Ensure selected/unselected states still display correctly with the new card heights

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run lint` - Ensure no TypeScript or linting errors were introduced
- `cd frontend && npm run build` - Verify the component compiles successfully
- Manual visual test: Run `cd frontend && npm run dev`, navigate to the OnboardingStyle step, and verify all card descriptions are fully visible without truncation

## Notes

The design reference shows that full descriptions should be visible, which improves user understanding of each style category. Using `min-h-[72px]` instead of removing the height constraint entirely ensures cards maintain a minimum baseline height for visual consistency while allowing expansion when needed for longer text.
