# Chore: Remove Duplicate Small Gray Label from Style Cards

## Metadata
adw_id: `446867d8`
prompt: `URGENT: Remove the duplicate small gray label from style cards. In frontend/components/onboarding/OnboardingStyle.tsx, the card currently renders TWO title elements: 1) A small gray label showing '{style.name} · {style.description}' using classes like 'text-xs' or 'text-sm' and 'text-gray-500' - this appears BETWEEN the image and the h3 heading, 2) The h3 heading showing the same text in crimson color. Find the FIRST element (the small gray one) and DELETE IT COMPLETELY. The element is likely a <p> or <span> tag right after the image container and before the h3. Look for text styling like text-xs, text-sm, text-gray-500, text-gray-600, or text-gray-700 combined with style.name. REMOVE that entire element. After fix, card structure should be: [img element] -> [h3 crimson title] -> [p gray description]. Only ONE title element per card. Search the entire component file for duplicate rendering of style.name.`

## Chore Description
Remove duplicate title rendering in the OnboardingStyle component's style cards. Currently, each style card is rendering the same title information twice:
1. A small gray label between the image and main heading (MUST BE DELETED)
2. The main crimson h3 heading (KEEP THIS)

The goal is to have only ONE title element per card showing `{style.name} · {style.description}` in crimson color, with the card structure being: image → h3 title → description paragraph.

## Relevant Files

### Existing Files
- **`frontend/components/onboarding/OnboardingStyle.tsx`** (lines 108-159) - The main component file containing the style card carousel. The duplicate label rendering occurs in the card content section around lines 142-154. Need to search for and remove any `<p>` or `<span>` element between the image container (ending ~line 139) and the h3 element (lines 144-146) that displays `style.name`.

- **`frontend/lib/data/fashion-styles.json`** - Referenced to understand the StylePreference data structure and ensure no duplicate data is being passed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Inspect Current Component Structure
- Read the complete `frontend/components/onboarding/OnboardingStyle.tsx` file
- Identify the card rendering section (lines 108-159)
- Locate the exact position of the duplicate gray label element between the image container and h3 heading
- Document the current DOM structure of the card content area (lines 142-154)

### 2. Search for Duplicate Style.Name Rendering
- Search the entire component file for all occurrences of `{style.name}`
- Check for any `<p>`, `<span>`, or `<div>` elements that render style.name with gray text styling
- Look for CSS classes: `text-xs`, `text-sm`, `text-gray-500`, `text-gray-600`, `text-gray-700`
- Verify if there's a label rendering between lines 139-143 (between image div closing and h3 opening)

### 3. Remove Duplicate Gray Label Element
- Delete the FIRST occurrence of the title element (the small gray one)
- Ensure the element removed includes:
  - The opening tag (`<p>`, `<span>`, or similar)
  - The content: `{style.name} · {style.description}` or similar pattern
  - Gray text styling classes
  - The closing tag
- Preserve the h3 element (lines 144-146) with crimson styling

### 4. Verify Card Structure After Removal
- Confirm the final card structure matches: `[image div] → [h3 crimson title] → [p gray description]`
- Ensure only ONE element renders `style.name` per card
- Check that the h3 title remains at line ~144-146 with classes: `text-sm font-bold text-[var(--onboarding-primary)] text-center`
- Verify the cardDescription paragraph remains at line ~149-153

### 5. Validate Component Functionality
- Check that no TypeScript/React errors are introduced
- Ensure the component still properly renders style options
- Verify the card selection and carousel functionality remain intact
- Confirm no broken references to removed elements

## Validation Commands
Execute these commands to validate the chore is complete:

- **Build Check**: `cd frontend && npm run build` - Verify the Next.js build succeeds without errors
- **Type Check**: `cd frontend && npx tsc --noEmit` - Ensure no TypeScript errors are present
- **Lint Check**: `cd frontend && npm run lint` - Verify ESLint passes with no warnings about the modified component
- **Visual Inspection**: Run `cd frontend && npm run dev` and navigate to the onboarding style selection page - Confirm only ONE title appears per card (crimson h3), with the gray description below it
- **Search Verification**: `grep -n "style.name" frontend/components/onboarding/OnboardingStyle.tsx` - Should show only ONE occurrence in the carousel cards section (around line 145)

## Notes
- The current code review shows the h3 element at line 144-146 as the primary title element
- If no duplicate element is found in the current code, it may have already been removed or the issue might be in CSS/styling
- The card content section (lines 142-154) should contain exactly two text elements after the fix: the h3 title and the cardDescription paragraph
- Preserve all other functionality including image loading, error handling, selection state, and carousel behavior
- The h3 title uses Tailwind CSS custom properties: `text-[var(--onboarding-primary)]` for crimson color
