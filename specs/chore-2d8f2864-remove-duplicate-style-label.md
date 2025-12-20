# Chore: Remove Duplicate Style Label from OnboardingStyle Cards

## Metadata
adw_id: `2d8f2864`
prompt: `CRITICAL FIX: Remove duplicate style label from OnboardingStyle cards. ISSUE: The style cards display TWO identical labels - a small dark/black 'Minimal · Timeless' text AND a larger crimson 'Minimal · Timeless' heading. The reference design at /Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png shows only ONE crimson title per card. In frontend/components/onboarding/OnboardingStyle.tsx, look for ANY element that renders style.name or style.description OUTSIDE of the main h3 heading. Check for: 1) Hidden span or p tags near the image, 2) Pseudo-elements in CSS (::before/::after), 3) Additional text nodes between the image div and the card content div, 4) Any aria-label or data attributes rendering as visible text. The card should show: IMAGE → h3 crimson title 'Name · Description' → p gray cardDescription. Remove any element rendering the style name between the image and the h3.`

## Chore Description

The OnboardingStyle component is currently displaying duplicate style labels on each style card. The issue manifests as:
- A small dark/black text displaying "Minimal · Timeless" (or equivalent for each style)
- A larger crimson heading displaying the same "Minimal · Timeless" text

According to the reference design at `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png`, each card should only display:
1. Style image at the top
2. ONE crimson title showing "Name · Description" (e.g., "Minimal · Timeless")
3. Gray cardDescription text below

The duplicate label needs to be identified and removed. Potential sources:
- Hidden span or p tags near the image
- CSS pseudo-elements (::before/::after)
- Additional text nodes between image div and card content div
- aria-label or data attributes rendering as visible text

## Relevant Files

- **frontend/components/onboarding/OnboardingStyle.tsx** - Main component file where the duplicate label is being rendered. This is the primary file to investigate and fix.
- **frontend/app/globals.css** - Global stylesheet that may contain pseudo-elements or custom styling affecting the cards (lines 361-427 contain onboarding-specific styles).
- **frontend/lib/data/fashion-styles.json** - Data source containing style information (name, description, cardDescription) to understand the data structure.
- **/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png** - Reference design showing the correct single-label display.

## Step by Step Tasks

### 1. Analyze Current Component Structure
- Read the OnboardingStyle.tsx file thoroughly (lines 116-158 contain the card rendering logic)
- Identify all locations where `style.name` or `style.description` are rendered
- Check for any text elements between the image div (lines 125-139) and the card content div (lines 142-154)
- Look for any conditional rendering or hidden elements that might be displaying text

### 2. Inspect CSS for Pseudo-elements
- Review frontend/app/globals.css for any ::before or ::after pseudo-elements
- Check the following CSS classes used in the component:
  - `.selection-carousel-card` (lines 362-373)
  - `.carousel-card-selected` (lines 392-395)
  - `.carousel-card-border` (lines 398-400)
  - `.style-card` (lines 413-427)
- Verify no pseudo-elements are adding text content

### 3. Check for Hidden Text Elements
- Examine the image container div (lines 125-139) for any text nodes or labels
- Check for aria-label, data-label, or title attributes that might be rendered visually
- Look for any screen reader text that might be visible due to CSS issues

### 4. Identify and Remove Duplicate Label
- Once the duplicate source is identified, remove the offending element/attribute/pseudo-element
- Ensure only the h3 element (lines 144-146) displays the "Name · Description" format
- Verify the cardDescription paragraph (lines 149-153) remains intact

### 5. Validate Fix Against Reference Design
- Compare the rendered output with the reference design at `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png`
- Confirm the card structure is: IMAGE → crimson h3 title → gray p cardDescription
- Verify no duplicate labels appear in any state (default, hover, selected)
- Test with multiple style cards (minimal, luxury, eccentric, etc.)

### 6. Test Component Functionality
- Run the development server and navigate to the onboarding style page
- Verify style selection still works correctly
- Check that thumbnails appear correctly when styles are selected
- Confirm all animations and interactions work as expected

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Start development server to test the component
cd frontend && npm run dev

# Validate TypeScript compilation
cd frontend && npx tsc --noEmit

# Run linting to ensure code quality
cd frontend && npm run lint
```

## Manual Validation Steps

1. Navigate to the onboarding style selection page in the browser
2. Inspect each style card visually and compare to the reference design
3. Verify each card shows only ONE crimson title (e.g., "Minimal · Timeless")
4. Confirm no dark/black duplicate label appears above, below, or near the image
5. Test selection functionality by clicking cards and verifying thumbnails appear correctly
6. Check responsive behavior on different screen sizes

## Notes

- The current component at lines 144-146 correctly renders the h3 title as: `{style.name} · {style.description}`
- The cardDescription is correctly displayed at lines 149-153
- Based on code review, there are no obvious duplicate text elements in the JSX
- The issue may be caused by:
  - CSS pseudo-elements injecting content
  - A parent component or layout wrapper adding text
  - Browser dev tools inspection needed to identify the exact source
  - Possibly a z-index or overlay issue making hidden text visible

- After identifying the duplicate, ensure the fix:
  - Maintains accessibility (proper alt text, aria labels where needed)
  - Preserves all styling and animations
  - Works across all style options in the fashion-styles.json data
