# Chore: Remove Duplicate Style Card Description in OnboardingStyle.tsx

## Metadata
adw_id: `65e951d8`
prompt: `Fix OnboardingStyle.tsx - the style cards still show TWO descriptions: 1) A gray text description INSIDE the card below the image showing old/inconsistent data, 2) A description BELOW the card title showing correct data from fashion-styles.json. Looking at the current screenshot, cards like Minimal and Luxury show 'Less is more, clean, simple...' inside the card which is wrong. The fix should REMOVE the gray description text that appears inside the card (between the image and the card border), keeping ONLY the description that appears below the red style title. The card should show: [Image] -> [Style Name · Subtitle in red] -> [Description in black]. Remove the intermediate gray description completely.`

## Chore Description
The OnboardingStyle component is displaying duplicate descriptions for each style card:
1. **Unwanted**: A gray `longDescription` text inside the card (between image and card border) showing old/inconsistent data
2. **Correct**: The style name and subtitle displayed in red below the image using `{style.name} · {style.description}`

The issue is at lines 148-152 in `OnboardingStyle.tsx` where `longDescription` is rendered as gray text inside the card. This needs to be completely removed so the card structure is:
- Style Image (top)
- Style Name · Subtitle in red (e.g., "Minimal · Timeless")
- Selected badge if applicable

The `longDescription` field from `fashion-styles.json` should NOT be displayed in the card UI. Only `name` and `description` should be shown.

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - The main component file containing the duplicate description rendering (lines 148-152 need to be removed)
- `frontend/lib/data/fashion-styles.json` - The data source defining style properties (reference only, no changes needed)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Duplicate Description Rendering
- Open `frontend/components/onboarding/OnboardingStyle.tsx`
- Locate lines 148-152 which render the `longDescription` inside the card:
  ```tsx
  {style.longDescription && (
    <p className="text-sm text-gray-500 text-center mt-1 px-2">
      {style.longDescription}
    </p>
  )}
  ```
- Delete these lines completely
- Ensure the card structure now only contains:
  - Image (lines 128-142)
  - Style name and subtitle in red (lines 145-147)
  - Selected badge if applicable (lines 155-159)

### 2. Verify Card Layout Structure
- Confirm the button structure inside the carousel now has:
  - Style Image container (`<div className="w-full h-72 rounded-xl mb-2 overflow-hidden">`)
  - Style Name heading (`<h3>` with red text showing `{style.name} · {style.description}`)
  - Selected Badge (conditional rendering)
- Ensure no other text elements are between the image and the style name
- Verify the gray text description is completely removed

### 3. Test Visual Rendering
- Start the development server: `cd frontend && npm run dev`
- Navigate to the onboarding style selection page (step 5 of onboarding)
- Verify each style card shows:
  - Only the image at the top
  - Only "Style Name · Subtitle" in red below the image
  - No gray description text inside the card
- Check multiple style cards (Minimal, Luxury, Eccentric) to ensure consistency
- Verify the layout matches the expected design: [Image] → [Style Name · Subtitle in red] → [Selected badge if selected]

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run build` - Ensure the build completes without errors
- `cd frontend && npm run lint` - Verify no linting errors are introduced
- Visual inspection: Verify in browser that style cards no longer show the gray `longDescription` text inside the card

## Notes
- The `longDescription` field in `fashion-styles.json` is NOT being removed from the data model, only from the UI rendering
- This fix ensures consistency with the design specification where only the style name and short description (subtitle) are shown
- The change is purely presentational and does not affect the data structure or selection logic
