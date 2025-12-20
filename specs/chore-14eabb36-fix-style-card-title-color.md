# Chore: Fix Style Card Title Color to Crimson Red

## Metadata
adw_id: `14eabb36`
prompt: `Fix remaining style card issues - DUPLICATE LABEL AND TITLE COLOR. In frontend/components/onboarding/OnboardingStyle.tsx: 1) REMOVE DUPLICATE LABEL - There are TWO elements showing 'Minimal · Timeless' on each card. One is small gray text appearing BETWEEN the image and the bold title. The other is the bold h3 heading. REMOVE the small gray duplicate text element completely. Find the element that renders '{style.name} · {style.description}' as small text above the h3 heading and DELETE it. Only keep ONE title per card (the h3 heading). 2) TITLE COLOR MUST BE CRIMSON RED - Change the h3 heading 'Minimal · Timeless' from BLACK to CRIMSON RED. The reference design /Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png clearly shows titles in crimson/red color. Change className from 'text-gray-900' to 'text-[var(--onboarding-primary)]' for the h3 element. The card structure after fix should be: [Image] -> [CRIMSON RED bold title 'Name · Adjective'] -> [Gray description]. NO duplicate labels.`

## Chore Description

Fix the style card title color in the OnboardingStyle component to match the reference design. The reference design shows the style card titles (e.g., "Minimal · Timeless") in crimson red color, but the current implementation displays them in black.

**Current state:**
- The h3 heading showing "{style.name} · {style.description}" is displayed in black (`text-gray-900`)
- No duplicate label element found in current code (may have been removed in a previous update)

**Target state:**
- The h3 heading should be displayed in crimson red using `text-[var(--onboarding-primary)]`
- Card structure: [Image] -> [CRIMSON RED bold title] -> [Gray description]
- The crimson color is defined in globals.css as `--onboarding-primary: #C41E3A`

## Relevant Files

### Existing Files
- **frontend/components/onboarding/OnboardingStyle.tsx** (line 144) - Contains the h3 heading element that needs the color class changed from `text-gray-900` to `text-[var(--onboarding-primary)]`
- **frontend/app/globals.css** (line 24) - Defines the CSS variable `--onboarding-primary: #C41E3A` (crimson red) that will be used for the title color
- **/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png** - Reference design showing the crimson red title color

## Step by Step Tasks

### 1. Verify Current Code Structure
- Read `frontend/components/onboarding/OnboardingStyle.tsx` to confirm the current implementation
- Verify there are no duplicate label elements between the image and h3 heading
- Identify the exact h3 element that needs the color change (currently at line 144)

### 2. Update Title Color to Crimson Red
- In `frontend/components/onboarding/OnboardingStyle.tsx`, locate the h3 heading element (line 144)
- Change the className from `text-sm font-bold text-gray-900 text-center` to `text-sm font-bold text-[var(--onboarding-primary)] text-center`
- This will change the style title from black to crimson red (#C41E3A)

### 3. Verify Visual Output Matches Reference Design
- Compare the updated component visually with the reference design at `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png`
- Ensure the title "Minimal · Timeless" (and other style names) now appears in crimson red
- Confirm the card structure is: [Image] -> [CRIMSON RED title] -> [Gray description]

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd frontend && npm run build` - Ensure the TypeScript code compiles without errors
- Visual inspection: Run `cd frontend && npm run dev` and navigate to the onboarding style page to verify the title color is crimson red matching the reference design

## Notes

- The CSS variable `--onboarding-primary` is already defined in `frontend/app/globals.css` with the correct crimson color (#C41E3A)
- The Tailwind CSS arbitrary value syntax `text-[var(--onboarding-primary)]` will correctly apply the CSS variable as the text color
- No duplicate label element was found in the current code, so only the color change is needed
- This change aligns the implementation with the brand color palette and reference design
