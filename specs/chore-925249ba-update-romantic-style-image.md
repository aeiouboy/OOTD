# Chore: Update Romantic Style Image URL

## Metadata
adw_id: `925249ba`
prompt: `Update the Romantic style image URL in frontend/components/onboarding/OnboardingStyle.tsx to use a more feminine/romantic fashion image. Change the current URL https://images.unsplash.com/photo-1518611012118-696072aa579a to https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop (romantic feminine dress) or another suitable romantic fashion image from Unsplash.`

## Chore Description
Update the image URL for the "Romantic" style option in the onboarding style selection component. The current image does not adequately represent a romantic/feminine fashion aesthetic. Replace it with a more suitable image showing romantic feminine fashion (flowing dress, soft colors, feminine silhouette).

The change is purely cosmetic and improves the visual representation of the "Romantic" style option during the onboarding flow, helping users better understand and select their preferred fashion style.

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Contains the `styleOptions` array at lines 15-76 where the romantic style configuration is defined (specifically line 62 with the imageUrl that needs updating)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Romantic Style Image URL
- Locate the `romantic` style object in the `styleOptions` array (lines 59-63)
- Replace the current `imageUrl` value on line 62 from `https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop` to `https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop`
- Ensure the URL format matches other style options (includes `w=400&h=300&fit=crop` parameters)

### 2. Validate the Change
- Verify the image URL is correctly updated in the file
- Ensure no syntax errors were introduced (proper string quotes, comma placement)
- Confirm the romantic style object structure remains intact with all required properties (id, name, description, imageUrl)

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -n "romantic" frontend/components/onboarding/OnboardingStyle.tsx` - Verify the romantic style entry exists and shows the updated URL
- `grep "photo-1469334031218-e382a71b716b" frontend/components/onboarding/OnboardingStyle.tsx` - Confirm the new image URL is present
- `cd frontend && npm run build` - Ensure the TypeScript code compiles without errors (optional but recommended)

## Notes
- The new image URL points to an Unsplash photo of a romantic feminine dress which better represents the "Romantic" style aesthetic
- No other style options or component logic needs to be modified
- This is a simple URL replacement with no functional changes to the component behavior
