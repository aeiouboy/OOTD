# Chore: Fix Style Card Styling on Onboarding Style Page

## Metadata
adw_id: `551f418e`
prompt: `Fix style card styling on 'What's your style?' onboarding page to match design specifications.`

## Chore Description
The "What's your style?" onboarding page has style cards with incorrect styling that doesn't match the design specifications. The issues include:

1. **Left Crimson Border**: Selected cards currently show a thick 4px left crimson border, but the design requires a subtle rounded border outline around the ENTIRE card
2. **Inconsistent Card Heights**: Cards vary in height based on description text length, but design requires all cards to have consistent/fixed height
3. **Style Name Color**: The style name (e.g., "Minimal · Timeless") is displayed in crimson/red color, but design shows it should be BLACK/dark text
4. **Description Text**: Text can wrap to multiple lines causing height inconsistency; should use line-clamp to maintain consistent card heights

Based on design reference images (5.1Onboarding-Style.png and 5.4Onboarding-Style.png), the correct implementation shows:
- Cards with subtle border outlines (not left border accent)
- Style names in black text like "Business · Refined"
- Consistent card heights across all style options
- Description text properly constrained

## Relevant Files
Use these files to complete the chore:

- **frontend/components/onboarding/OnboardingStyle.tsx** - Main component file containing the style card rendering logic (lines 148-188). Contains the card container, style name, and description styling that need to be updated.

- **frontend/app/globals.css** - Contains CSS classes for carousel cards including `.selection-carousel-card`, `.carousel-card-selected`, and `.carousel-card-border` (lines 360-398). These classes control transitions and selection states.

### Design Reference Files (Read-Only)
- `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/5.1Onboarding-Style.png` - Shows current state with issues
- `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/5.4Onboarding-Style.png` - Shows correct design with black text style names and proper border styling

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Card Container Styling in OnboardingStyle.tsx
- Remove the left border classes from the card button element (line 153):
  - Remove: `border-l-4`
  - Remove: `border-l-[var(--onboarding-primary)]` (selected state)
  - Remove: `border-l-transparent` (unselected state)
- Add proper border for all cards: `border border-gray-200 rounded-2xl`
- Update selected state to use: `border-[var(--onboarding-primary)]` or `border-2 border-[var(--onboarding-primary)]` for the full border highlight effect

### 2. Add Fixed Height to Card Container
- Add fixed height to ensure consistent card sizes: `min-h-[280px]` or similar appropriate value
- The button container should have consistent height regardless of content
- Consider using `flex flex-col` to properly distribute space between image and content areas

### 3. Update Style Name Text Color
- Change the style name h3 element (line 176) from:
  - `text-[var(--onboarding-primary)]`
  - To: `text-gray-900` or `text-black`
- Keep the font weight and centering intact

### 4. Constrain Description Text for Height Consistency
- Update the description paragraph (line 182) to use line-clamp-2 instead of line-clamp-3
- Ensure description doesn't cause height variation by using fixed height on text container if needed
- The description container (div on line 174) should have fixed height

### 5. Update CSS Classes in globals.css
- Modify `.carousel-card-selected` class (line 390-393):
  - Change from `border-left-color: var(--onboarding-primary)` to `border-color: var(--onboarding-primary)`
  - Keep or adjust the box-shadow effect
- Update `.carousel-card-border` class if needed to support full border transitions

### 6. Visual Validation
- Start the development server and navigate to the onboarding style page
- Verify all 10 style cards have identical heights
- Confirm no left crimson border appears on cards
- Ensure selected cards have subtle full border outline
- Verify style name text is black/dark (not crimson)
- Compare against design reference images

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm build` - Ensure the build compiles successfully with no TypeScript errors
- `cd frontend && pnpm lint` - Run linting to check for any code style issues
- `cd frontend && pnpm dev` - Start development server to visually verify changes
- Navigate to the onboarding flow and reach the "What's your style?" page to verify:
  1. All cards have consistent height
  2. Style names display in black text
  3. Selected cards have full border outline (not left border)
  4. Cards match the design reference images

## Notes
- The design reference shows that the selected state in 5.1Onboarding-Style.png (with left border) is the CURRENT incorrect implementation
- The 5.4Onboarding-Style.png shows the CORRECT design with proper styling
- CSS variables like `var(--onboarding-primary)` should continue to be used for the selected state border color to maintain theme consistency
- The `selection-carousel-card` class handles hover/active states and should remain unchanged
- Consider testing with both short and long description text to ensure height consistency
