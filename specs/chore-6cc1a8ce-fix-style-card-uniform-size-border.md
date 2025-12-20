# Chore: Fix Style Cards Uniform Size and Border Color

## Metadata
adw_id: `6cc1a8ce`
prompt: `Fix style cards to have uniform size and remove red line border. Current issues on OnboardingStyle page: 1) Cards have inconsistent heights - each card adjusts to its content making some taller than others (e.g., 'Eccentric · Creative' is taller than 'Business · Refined'). All cards should have the SAME fixed height regardless of description length. Set a consistent card height that accommodates the longest description and use overflow handling or consistent padding for shorter descriptions. 2) Red/crimson line border still visible on cards - the border color appears reddish (crimson) instead of soft rose. In frontend/components/onboarding/OnboardingStyle.tsx and frontend/app/globals.css, ensure border uses soft rose color (#E8D5D5 for unselected, #D4B5B5 for selected) NOT crimson/red (#C41E3A). Check CSS variables --onboarding-card-border and --onboarding-card-border-selected are properly defined and applied. All style cards must have: identical fixed height, uniform card dimensions, soft rose/pink border (not red), consistent spacing. Reference design: /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/`

## Chore Description

Fix the OnboardingStyle component to ensure all style cards have uniform dimensions and proper soft rose border colors matching the design specifications. Currently, cards have two critical issues:

1. **Inconsistent Card Heights**: Each card adjusts to its content length, causing visual inconsistency in the carousel. Cards with longer descriptions (e.g., "Eccentric · Creative") appear taller than those with shorter descriptions (e.g., "Minimal · Timeless").

2. **Incorrect Border Color**: Cards display a red/crimson border (#C41E3A) instead of the specified soft rose colors (#E8D5D5 for unselected, #D4B5B5 for selected).

The fix must ensure:
- All cards have identical fixed height regardless of description content
- Soft rose/pink border colors are applied consistently
- Card dimensions remain uniform across the entire carousel
- Proper overflow handling for varying description lengths
- Consistent spacing and padding

## Relevant Files

### Existing Files

- **frontend/components/onboarding/OnboardingStyle.tsx** (lines 142-154)
  - Contains the card content section with dynamic height (`min-h-[72px]`)
  - Need to change to fixed height to ensure uniform card sizing
  - Card border styling is applied here via className

- **frontend/app/globals.css** (lines 22-27)
  - Defines onboarding color CSS variables
  - Contains correct soft rose border colors: `--onboarding-card-border: #E8D5D5` and `--onboarding-card-border-selected: #D4B5B5`
  - Variables are correctly defined but may not be properly applied

- **frontend/app/globals.css** (lines 391-400)
  - Contains carousel card selection state styles
  - Defines border transition and selection styling
  - Need to verify border color application

### Reference Design Files

- **/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/5.1Onboarding-Style.png**
  - Shows "Minimal · Timeless" card with soft rose border
  - Demonstrates consistent card heights

- **/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/5.2Onboarding-Style.png**
  - Shows "Luxury · Elegant" card
  - Reference for uniform card sizing

- **/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/5.3Onboarding-Style.png**
  - Shows "Eccentric · Creative" card with longer description
  - Demonstrates how cards should maintain uniform height even with longer content

## Step by Step Tasks

### 1. Fix Card Content Section Height
- Change `min-h-[72px]` to a fixed height in OnboardingStyle.tsx line 142
- Calculate appropriate fixed height based on longest description content
- Set `h-[96px]` to accommodate all description lengths comfortably
- Ensure vertical alignment is consistent across all cards

### 2. Add Overflow Handling for Card Descriptions
- Add `overflow-hidden` class to card content wrapper (line 142)
- Apply `line-clamp-2` or similar to description text (line 150) to prevent text overflow
- Ensure title text (line 144) also has proper overflow handling if needed
- Test with longest descriptions to verify no content overflow

### 3. Verify and Fix Border Color Variables
- Confirm CSS variables in frontend/app/globals.css are correctly defined:
  - `--onboarding-card-border: #E8D5D5` (soft rose for unselected)
  - `--onboarding-card-border-selected: #D4B5B5` (darker rose for selected)
- Check that no crimson color (#C41E3A) is being applied to card borders
- Verify border-2 class is using the correct CSS variable

### 4. Update Card Border Styling
- In OnboardingStyle.tsx line 121, ensure border uses CSS variables correctly
- Verify the conditional class application: `border-[var(--onboarding-card-border-selected)]` for selected and `border-[var(--onboarding-card-border)]` for unselected
- Remove any conflicting border color classes
- Ensure `.carousel-card-border` class in globals.css properly applies the transition

### 5. Test Card Uniformity
- Visually inspect all style cards in the carousel
- Verify all cards have identical heights
- Confirm border colors are soft rose/pink, not crimson/red
- Check selected vs unselected states show proper border color difference
- Test carousel scrolling to ensure uniform appearance across all cards
- Verify spacing and padding remain consistent

### 6. Validate Against Design Reference
- Compare implementation against design files in `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/`
- Ensure card dimensions match the design specifications
- Verify border colors match the soft rose tones in the reference designs
- Check that card content alignment and spacing match the design

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Start the development server to test visually
cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && npm run dev
```

### Visual Validation Checklist

1. Navigate to the OnboardingStyle page
2. Verify all style cards have identical heights (no taller/shorter cards)
3. Confirm border colors are soft rose (#E8D5D5 unselected, #D4B5B5 selected) - NOT crimson/red
4. Check that descriptions with varying lengths don't affect card height
5. Test card selection to verify border color changes correctly
6. Scroll through entire carousel to ensure consistency across all cards

### Code Validation

```bash
# Check that no crimson color is applied to borders in OnboardingStyle component
cd /Users/naruechon/Documents/Project/OOTDay_Anti && grep -n "C41E3A" frontend/components/onboarding/OnboardingStyle.tsx

# Verify CSS variables are correctly defined
grep -n "onboarding-card-border" frontend/app/globals.css

# Ensure no inline styles override the border colors
grep -n "border.*#" frontend/components/onboarding/OnboardingStyle.tsx
```

## Notes

- The design reference shows cards with soft, muted rose/pink borders that create a subtle, elegant appearance
- The current crimson color (#C41E3A) is the brand's primary red and should only be used for the next button and selected thumbnails, not card borders
- Fixed height must accommodate the longest description ("Eccentric · Creative") while maintaining visual balance
- Consider using `line-clamp` for descriptions to ensure text truncation if needed
- The carousel uses Embla Carousel, so ensure fixed heights don't interfere with scroll behavior
