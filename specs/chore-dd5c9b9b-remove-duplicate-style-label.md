# Chore: Remove Duplicate Small Gray Style Label from Onboarding Style Cards

## Metadata
adw_id: `dd5c9b9b`
prompt: `Remove duplicate small gray style label from cards. In frontend/components/onboarding/OnboardingStyle.tsx there are still TWO text elements showing the style name on each card: 1) A small gray text 'Minimal · Timeless' appearing right below the image, 2) A bold crimson heading 'Minimal · Timeless' below that. REMOVE the first small gray text element completely. Search for a paragraph or span element that renders style.name and style.description as small gray text (likely using text-sm or text-xs and text-gray-500/600/700 classes). This element appears BEFORE the h3 heading element. DELETE this duplicate element entirely. The card should only have: [Image] -> [Bold crimson h3 title] -> [Gray description paragraph]. NO small gray label between image and title. Reference design /Users/naruechon/Documents/Project/OOTDay2/onboarding/ shows only ONE title per card.`

## Chore Description

Review the OnboardingStyle component to verify if there is a duplicate small gray text element displaying the style name/description between the image and the bold crimson h3 title. According to the user, there should be TWO text elements showing "Minimal · Timeless":
1. A small gray text appearing right below the image (to be removed)
2. A bold crimson heading below that (to keep)

After reviewing the reference design at `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png`, the correct structure should be:
- [Image]
- [Bold crimson h3 title combining name · description]
- [Gray description paragraph (cardDescription)]

## Relevant Files

### Existing Files
- `frontend/components/onboarding/OnboardingStyle.tsx` - Main component file to inspect and potentially modify. Currently contains the style card rendering logic at lines 142-154.
- `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png` - Reference design showing the correct single-title layout

## Step by Step Tasks

### 1. Inspect Current Code Structure
- Read the OnboardingStyle.tsx file carefully, specifically lines 124-157 (the card content section)
- Search for any `<p>`, `<span>`, or `<div>` elements that render `style.name` or `style.description` with small gray text classes
- Look for text-sm, text-xs classes combined with text-gray-500, text-gray-600, or text-gray-700
- Verify if there are TWO separate elements rendering the style name/description

### 2. Compare with Reference Design
- Verify the reference design at `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png`
- Confirm the expected structure: Image -> Bold Crimson Title -> Gray Description
- Identify any discrepancies between current implementation and design

### 3. Remove Duplicate Element (If Found)
- If a duplicate small gray text element exists before the h3 heading (lines 144-146), delete it completely
- Ensure only the bold crimson h3 title (line 144-146) and the gray cardDescription paragraph (lines 149-153) remain
- Maintain proper spacing and layout structure

### 4. Validate the Changes
- Review the updated component structure
- Ensure the card layout matches: [Image] -> [Bold crimson h3 title] -> [Gray description paragraph]
- Verify no duplicate style name/description elements exist
- Check that the implementation matches the reference design

## Validation Commands

Execute these commands to validate the chore is complete:

- `grep -n "style.name\|style.description" frontend/components/onboarding/OnboardingStyle.tsx` - Verify style.name and style.description usage locations
- `grep -n "text-gray-[567]00" frontend/components/onboarding/OnboardingStyle.tsx` - Check for gray text styling occurrences
- `npm run build` - Ensure the component compiles without errors (run from frontend directory)

## Notes

**IMPORTANT FINDING**: After inspecting the current code (OnboardingStyle.tsx lines 142-154), there appears to be NO duplicate small gray text element currently present. The structure already matches the design:

1. Lines 125-139: Style image
2. Lines 144-146: Single bold crimson h3 title showing `{style.name} · {style.description}`
3. Lines 149-153: Gray cardDescription paragraph (text-gray-700)

The user may be seeing a duplicate in the browser that doesn't match the source code, which could indicate:
- A caching issue requiring a hard refresh
- The dev server is serving stale code
- There's a different version deployed

**Recommended Action**: Verify the running application matches the current source code before making changes.
