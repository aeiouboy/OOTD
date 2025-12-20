# Chore: Add 3 New Style Preferences to Onboarding

## Metadata
adw_id: `edc349f6`
prompt: `Add 3 new style preferences to the 'What's your style?' onboarding interface to bring the total from 7 to 10 styles.`

## Chore Description
Expand the style preferences in the onboarding flow from 7 to 10 options. The current 7 styles are: Minimal (Timeless), Luxury (Elegant), Business (Refined), Sporty (Active), Bohemian (Natural), Classic (Old Money), and Mystery Style (🎲).

Three new styles must be added before the Mystery Style option:
- **Streetwear** - 'Urban' - Modern street fashion with sneakers, hoodies, oversized fits
- **Romantic** - 'Feminine' - Soft colors, florals, delicate fabrics, flowing silhouettes
- **Edgy** - 'Bold' - Dark colors, leather, statement pieces, unconventional cuts

The Mystery Style (🎲) must remain as the last option in the carousel.

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Contains the `styleOptions` array that defines all style preferences. This is the primary file to modify.
- `frontend/lib/types/user-profile-types.ts` - Contains the `StylePreference` interface definition. Reference this to ensure new styles follow the correct structure.
- `frontend/components/onboarding/README.md` - Documentation for the onboarding flow that lists the style options. Must be updated to reflect the new 10 styles.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review StylePreference Interface
- Confirm the interface structure in `frontend/lib/types/user-profile-types.ts`:
  ```typescript
  interface StylePreference {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  }
  ```
- No changes needed to the interface - it supports the new styles as-is

### 2. Add New Style Preferences to OnboardingStyle.tsx
- Open `frontend/components/onboarding/OnboardingStyle.tsx`
- Locate the `styleOptions` array (lines 15-58)
- Add the three new style objects after 'Classic' and before 'Mystery Style':

```typescript
{
  id: 'streetwear',
  name: 'Streetwear',
  description: 'Urban',
  imageUrl: undefined,
},
{
  id: 'romantic',
  name: 'Romantic',
  description: 'Feminine',
  imageUrl: undefined,
},
{
  id: 'edgy',
  name: 'Edgy',
  description: 'Bold',
  imageUrl: undefined,
},
```

- Ensure the `mystery` style remains as the last item in the array

### 3. Update README Documentation
- Open `frontend/components/onboarding/README.md`
- Locate the Style Options section under Screen 5 (lines 60-68)
- Update the list to include all 10 styles:
  - Minimal · Timeless
  - Luxury · Elegant
  - Business · Refined
  - Sporty · Active
  - Bohemian · Natural
  - Classic · Old Money
  - Streetwear · Urban
  - Romantic · Feminine
  - Edgy · Bold
  - Mystery Style 🎲
- Update the "Horizontal carousel with 7 style options" text to "Horizontal carousel with 10 style options"

### 4. Validate Carousel Display
- Run the development server to test the carousel with 10 items
- Verify all 10 style cards render correctly in the carousel
- Test carousel scrolling/navigation with the additional items
- Confirm Mystery Style appears as the last option
- Test multi-select functionality still works with new styles
- Verify the selected styles thumbnail bar displays correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm lint` - Check for any linting issues
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && pnpm dev` - Start dev server and manually test the style selection carousel at the onboarding flow (step 5)

## Notes
- The carousel uses `embla-carousel-react` with `align: 'start'` and `containScroll: 'trimSnaps'` settings which should handle 10 items without layout issues
- Each style card has fixed width (`flex-[0_0_280px]`) so adding more items should not affect individual card sizing
- The `imageUrl` is set to `undefined` for all new styles, consistent with existing styles. Actual images can be added later.
- No changes to the `StylePreference` type definition are required as the existing interface supports all needed fields
