# Chore: Remove Duplicate Text from Style Cards

## Metadata
adw_id: `80dbe69a`
prompt: `Remove duplicate text from style cards. The image files in /public/images/styles/ already contain the style name and description text at the bottom of each image. The code in frontend/components/onboarding/OnboardingStyle.tsx ALSO renders an h3 heading with '{style.name} · {style.description}' and a p tag with cardDescription. This creates visual duplication. SOLUTION: Remove the h3 element (lines 144-146) and the cardDescription p element (lines 149-152) from the card content since this text is already visible in the images. Keep only the image div. The reference design at /Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png shows each card should display the image which already contains the text - no additional text elements needed below the image.`

## Chore Description

The style selection cards in the onboarding flow currently display duplicate text content. The style images (located in `/public/images/styles/`) already contain the style name and description text embedded at the bottom of each image. However, the component code also renders this same information as separate text elements below the image:

1. An `<h3>` element displaying `{style.name} · {style.description}` (lines 144-146)
2. A `<p>` element displaying `{style.cardDescription}` (lines 149-152)

This creates visual duplication where users see the same information twice. According to the reference design at `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png`, each style card should only display the image itself, which already contains all necessary text information.

The solution is to remove the redundant text elements and keep only the image div, allowing the embedded text in the images to be the sole source of style information.

## Relevant Files

- `frontend/components/onboarding/OnboardingStyle.tsx` - The component that renders the style selection carousel. Lines 144-152 contain the duplicate text elements that need to be removed.
- `frontend/lib/data/fashion-styles.json` - Data source containing style information (no changes needed, for reference only)
- `frontend/public/images/styles/*.png` - Style images that already contain the text (no changes needed, for reference only)
- `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png` - Reference design showing the intended UI (external reference)

## Step by Step Tasks

### 1. Remove Duplicate Text Elements from Style Cards

- Open `frontend/components/onboarding/OnboardingStyle.tsx`
- Locate the card content section (lines 141-154)
- Remove the `<h3>` element that displays `{style.name} · {style.description}` (lines 144-146)
- Remove the conditional `<p>` element that displays `{style.cardDescription}` (lines 149-152)
- Remove the entire `<div className="p-3 flex flex-col justify-start flex-shrink-0">` wrapper (lines 142-154) since it will be empty after removing the text elements
- Ensure the closing `</button>` tag (line 155) remains properly positioned after the image div

### 2. Verify Visual Layout

- Check that the card structure now contains only:
  - The button wrapper with border styling
  - The image div (lines 125-139)
- Confirm that no empty divs or padding elements remain
- Ensure the border styling and selection state classes remain functional

### 3. Test the Component

- Run the development server
- Navigate to the onboarding style selection page
- Verify that:
  - Style cards display only the image with embedded text
  - No duplicate text appears below the images
  - Card selection (border highlighting) still works correctly
  - The layout matches the reference design

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd frontend && npm run dev` - Start the development server and manually test the onboarding style selection page
- `cd frontend && npm run build` - Ensure the TypeScript compilation succeeds with no errors
- Visual verification: Compare the rendered UI against `/Users/naruechon/Documents/Project/OOTDay2/onboarding/5.1Onboarding-Style.png` to confirm it matches the design

## Notes

- The style images (`/public/images/styles/Group *.png`) already contain all necessary text embedded within them, so no data or image changes are needed
- The `cardDescription` field in `fashion-styles.json` may still be used elsewhere in the application (e.g., for long descriptions or tooltips), so the data structure should remain unchanged
- This change is purely visual and should not affect the functionality of style selection or data flow
- The card height should automatically adjust after removing the text elements since the flex-shrink-0 class on the padding div will be removed
