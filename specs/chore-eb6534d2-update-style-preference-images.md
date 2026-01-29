# Chore: Update OnboardingStyle Component with New Style Preference Images

## Metadata
adw_id: `eb6534d2`
prompt: `Update the OnboardingStyle component to use the new style preference images from data/assets/onboarding/preference/. The task involves: 1. Copy the 10 new style images from data/assets/onboarding/preference/ to apps/web/public/images/styles/preference/ (create the folder if needed). 2. Update apps/web/lib/data/fashion-styles.json to use the new image paths with URL-encoded special characters. 3. Test that the images load correctly by verifying the paths are valid.`

## Chore Description
Replace the existing generic style images (Group 31.png through Group 40.png) with the new properly-named style preference images. The new images are located in `data/assets/onboarding/preference/` and need to be copied to the web application's public folder. The `fashion-styles.json` file must be updated to reference these new images with properly URL-encoded paths to handle special characters (·, 🎲, and spaces).

Current state:
- Images are in `data/assets/onboarding/preference/` with names like "Minimal · Timeless.png"
- The `fashion-styles.json` references images in `/images/styles/Group XX.png` format
- The OnboardingStyle component uses `imageUrl` from the JSON data

Target state:
- New images in `apps/web/public/images/styles/preference/`
- JSON references URL-encoded paths like `/images/styles/preference/Minimal%20%C2%B7%20Timeless.png`

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/data/fashion-styles.json** - Contains the style definitions with `imageUrl` properties that need to be updated to point to the new images
- **apps/web/components/onboarding/OnboardingStyle.tsx** - The component that renders style cards using the image URLs (no changes needed, uses JSON data)
- **apps/web/public/images/styles/** - Existing styles image directory containing old Group XX.png files

### Source Files (to copy from)
- `data/assets/onboarding/preference/Minimal · Timeless.png`
- `data/assets/onboarding/preference/Luxury · Elegant.png`
- `data/assets/onboarding/preference/Eccentric · Creative.png`
- `data/assets/onboarding/preference/Business · Refined.png`
- `data/assets/onboarding/preference/Vanilla · Clean.png`
- `data/assets/onboarding/preference/Sporty · Active.png`
- `data/assets/onboarding/preference/Edgy · Trendy.png`
- `data/assets/onboarding/preference/Bohemian · Natural.png`
- `data/assets/onboarding/preference/Classic · Old Money.png`
- `data/assets/onboarding/preference/Mystery Style 🎲.png`

### New Files
- **apps/web/public/images/styles/preference/** - New directory to hold the style preference images

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create the Destination Directory
- Create the directory `apps/web/public/images/styles/preference/` if it doesn't exist
- Command: `mkdir -p apps/web/public/images/styles/preference/`

### 2. Copy All Style Preference Images
- Copy each of the 10 images from `data/assets/onboarding/preference/` to `apps/web/public/images/styles/preference/`
- Use shell commands that properly handle special characters in filenames
- Commands:
  ```bash
  cp "data/assets/onboarding/preference/Minimal · Timeless.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Luxury · Elegant.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Eccentric · Creative.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Business · Refined.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Vanilla · Clean.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Sporty · Active.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Edgy · Trendy.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Bohemian · Natural.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Classic · Old Money.png" "apps/web/public/images/styles/preference/"
  cp "data/assets/onboarding/preference/Mystery Style 🎲.png" "apps/web/public/images/styles/preference/"
  ```

### 3. Update fashion-styles.json with URL-Encoded Paths
- Update each style's `imageUrl` property in `apps/web/lib/data/fashion-styles.json`
- URL-encode special characters:
  - Space → `%20`
  - `·` (middle dot U+00B7) → `%C2%B7`
  - `🎲` (dice emoji) → `%F0%9F%8E%B2`

- Mapping of style IDs to new encoded URLs:
  | Style ID | New imageUrl |
  |----------|--------------|
  | minimal | `/images/styles/preference/Minimal%20%C2%B7%20Timeless.png` |
  | luxury | `/images/styles/preference/Luxury%20%C2%B7%20Elegant.png` |
  | eccentric | `/images/styles/preference/Eccentric%20%C2%B7%20Creative.png` |
  | business | `/images/styles/preference/Business%20%C2%B7%20Refined.png` |
  | vanilla | `/images/styles/preference/Vanilla%20%C2%B7%20Clean.png` |
  | sporty | `/images/styles/preference/Sporty%20%C2%B7%20Active.png` |
  | edgy | `/images/styles/preference/Edgy%20%C2%B7%20Trendy.png` |
  | bohemian | `/images/styles/preference/Bohemian%20%C2%B7%20Natural.png` |
  | classic | `/images/styles/preference/Classic%20%C2%B7%20Old%20Money.png` |
  | mystery | `/images/styles/preference/Mystery%20Style%20%F0%9F%8E%B2.png` |

### 4. Verify File Copy Success
- List the destination directory to confirm all 10 images were copied
- Command: `ls -la apps/web/public/images/styles/preference/`
- Expected: 10 PNG files with matching names

### 5. Validate Image Paths Work in Browser
- Start the development server: `cd apps/web && pnpm dev`
- Navigate to the onboarding style selection page
- Verify all 10 style images load correctly without fallback to the default emoji placeholder

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -la apps/web/public/images/styles/preference/ | wc -l` - Should output 11 (10 files + 1 total line)
- `ls -la apps/web/public/images/styles/preference/` - Verify all 10 PNG files are present
- `cat apps/web/lib/data/fashion-styles.json | grep "imageUrl"` - Verify all imageUrl values point to `/images/styles/preference/` with encoded paths
- `cd apps/web && pnpm build` - Ensure the build succeeds with the new image references

## Notes
- The original `Group XX.png` images in `apps/web/public/images/styles/` can be retained for now as they are not referenced after this change
- The middle dot character `·` (U+00B7) must be distinguished from the similar-looking colon `:` - ensure proper encoding
- The dice emoji `🎲` is a 4-byte UTF-8 character that encodes to `%F0%9F%8E%B2`
- Next.js handles URL-encoded paths in the public directory correctly, no additional configuration needed
