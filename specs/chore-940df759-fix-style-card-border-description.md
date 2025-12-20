# Chore: Fix Style Card Border and Description Issues

## Metadata
adw_id: `940df759`
prompt: `Fix remaining style card issues: 1) BORDER COLOR INCONSISTENCY - 'Business · Refined' card and some others have darker/gray border instead of soft rose. Ensure ALL cards use the SAME soft rose border color (#E8D5D5 unselected, #D4B5B5 selected). Check frontend/app/globals.css that --onboarding-card-border is #E8D5D5 (not gray or darker). In OnboardingStyle.tsx ensure border class applies consistently to all cards without any conditional that could override it. 2) DESCRIPTION TRUNCATION - text is cut off with ellipsis. The reference design from /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/ shows FULL descriptions visible. Remove line-clamp or increase card content height to h-[100px] or h-auto with min-h-[80px] to accommodate longest descriptions. Priority: full text visibility over strict uniform height - cards can have slight height variation if needed to show complete descriptions. 3) Verify CSS variable --onboarding-card-border exists and equals #E8D5D5 (soft rose), not any red/crimson/gray value.`

## Chore Description

Fix three critical issues with the onboarding style carousel cards:

1. **Border Color Inconsistency**: Some style cards (e.g., 'Business · Refined') display darker/gray borders instead of the designated soft rose color. All cards must use consistent border colors:
   - Unselected: #E8D5D5 (soft rose)
   - Selected: #D4B5B5 (darker soft rose)

2. **Description Truncation**: Card descriptions are being cut off with ellipsis (`line-clamp-3`), but reference designs show full descriptions should be visible. The card content area needs to expand to accommodate the longest descriptions without truncation.

3. **CSS Variable Verification**: Ensure the `--onboarding-card-border` CSS variable is properly defined as #E8D5D5 (soft rose) in `frontend/app/globals.css`, not using any red/crimson/gray values.

The fix must ensure all cards have uniform styling with no conditional logic that could override the border color, and prioritize full text visibility over strict uniform height.

## Relevant Files

- **frontend/app/globals.css** (lines 26-27): Contains the CSS custom properties for onboarding card borders. Currently defines `--onboarding-card-border: #E8D5D5` and `--onboarding-card-border-selected: #D4B5B5`, which are correct. Need to verify no other conflicting values exist.

- **frontend/components/onboarding/OnboardingStyle.tsx** (lines 116-154): The style carousel card component. Contains the border class application on line 121 and the card content area on line 142 with fixed height `h-[96px]`. The description text on line 150 has `line-clamp-3` which causes truncation.

- **frontend/lib/data/fashion-styles.json**: Contains the style data including `cardDescription` fields that are being truncated. Need to verify the longest descriptions to determine appropriate card height.

### New Files
None required - this is a styling fix to existing files.

## Step by Step Tasks

### 1. Verify CSS Variable Definition
- Open `frontend/app/globals.css`
- Confirm line 26 has `--onboarding-card-border: #E8D5D5;` (soft rose, not gray/crimson)
- Confirm line 27 has `--onboarding-card-border-selected: #D4B5B5;` (darker soft rose)
- Search for any conflicting border color definitions that might override these values
- Ensure no dark mode or other CSS rules are changing these border colors

### 2. Fix Description Truncation
- Open `frontend/components/onboarding/OnboardingStyle.tsx`
- Locate line 150 where `line-clamp-3` is applied to the card description
- Remove the `line-clamp-3` class to allow full text display
- Modify line 142 card content container from fixed `h-[96px]` to flexible height:
  - Change to `h-auto min-h-[80px]` or `h-auto min-h-[96px]` to allow expansion
  - Alternatively use `h-[100px]` if that accommodates all descriptions
- Test with the longest cardDescription to ensure it displays fully without ellipsis
- Ensure padding remains consistent (`p-3`)

### 3. Verify Border Class Consistency
- In `frontend/components/onboarding/OnboardingStyle.tsx` line 116-123
- Confirm the border class logic applies consistently to all cards:
  - Unselected cards: `border-[var(--onboarding-card-border)]`
  - Selected cards: `border-[var(--onboarding-card-border-selected)]`
- Ensure no conditional logic or additional classes override these border colors
- Verify the `border-2` width is applied to all cards
- Check that `carousel-card-border` transition class doesn't interfere

### 4. Visual Testing and Validation
- Start the development server with `npm run dev` or equivalent
- Navigate to the onboarding style selection page
- Verify all style cards have the soft rose border (#E8D5D5) when unselected
- Select each card individually and verify the selected border (#D4B5B5) appears correctly
- Check that all card descriptions display in full without truncation ellipsis
- Confirm cards with longer descriptions expand appropriately
- Compare against reference designs in `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/`

## Validation Commands

Execute these commands to validate the chore is complete:

- `grep -n "onboarding-card-border" frontend/app/globals.css` - Verify CSS variables are correctly defined as #E8D5D5 and #D4B5B5
- `grep -n "line-clamp" frontend/components/onboarding/OnboardingStyle.tsx` - Should return no results after removing the clamp
- `grep -n "h-\[96px\]" frontend/components/onboarding/OnboardingStyle.tsx` - Should return no results if changed to flexible height
- Manual visual inspection in browser at `http://localhost:3000` (or appropriate dev URL)

## Notes

- The current globals.css already has the correct soft rose border colors defined (#E8D5D5 and #D4B5B5), so the issue is likely in the component implementation or conflicting styles
- Priority is full text visibility - slight height variations between cards are acceptable to show complete descriptions
- Reference designs are in PNG format at `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/` - compare final result against these
- The `Business · Refined` card specifically mentioned as having the wrong border color - test this card thoroughly
