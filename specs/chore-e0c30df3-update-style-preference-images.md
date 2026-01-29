# Chore: Update Style Preference Images

## Metadata
adw_id: `e0c30df3`
prompt: `Update the OnboardingStyle component to use new style preference images. Copy images from data/assets/onboarding/preference/ to apps/web/public/images/styles/preference/, update fashion-styles.json imageUrl fields with URL-encoded paths, and verify all images load correctly.`

## Chore Description
Update the OnboardingStyle component to display new style preference images. This involves:
1. Creating a new `preference/` subdirectory in the public images folder
2. Copying the 10 new style images from the data assets folder to the web public folder
3. Updating the `fashion-styles.json` file to reference the new images with properly URL-encoded paths (handling spaces, middle dots `·`, and emoji characters)
4. Verifying all images exist and paths resolve correctly in the browser

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/data/fashion-styles.json** - Contains style definitions with `imageUrl` fields that need updating. Currently references old images like `/images/styles/Group 31.png`
- **apps/web/components/onboarding/OnboardingStyle.tsx** - Component that consumes `fashion-styles.json` and displays style cards with images. Has error handling for failed images
- **data/assets/onboarding/preference/** - Source directory containing 10 new style images with descriptive names

### New Files
- **apps/web/public/images/styles/preference/** - New directory to create for storing the preference images

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Target Directory
- Create the `preference/` subdirectory at `apps/web/public/images/styles/preference/`
- Verify the directory was created successfully

### 2. Copy Images to Public Folder
- Copy all 10 PNG images from `data/assets/onboarding/preference/` to `apps/web/public/images/styles/preference/`
- Source images to copy:
  - `Minimal · Timeless.png`
  - `Luxury · Elegant.png`
  - `Eccentric · Creative.png`
  - `Business · Refined.png`
  - `Vanilla · Clean.png`
  - `Sporty · Active.png`
  - `Edgy · Trendy.png`
  - `Bohemian · Natural.png`
  - `Classic · Old Money.png`
  - `Mystery Style 🎲.png`

### 3. Update fashion-styles.json with URL-Encoded Paths
- Update each style's `imageUrl` field to point to the new images in `/images/styles/preference/`
- URL-encode special characters:
  - Space (` `) → `%20`
  - Middle dot (`·`) → `%C2%B7`
  - Dice emoji (`🎲`) → `%F0%9F%8E%B2`
- Mapping:
  - `minimal` → `/images/styles/preference/Minimal%20%C2%B7%20Timeless.png`
  - `luxury` → `/images/styles/preference/Luxury%20%C2%B7%20Elegant.png`
  - `eccentric` → `/images/styles/preference/Eccentric%20%C2%B7%20Creative.png`
  - `business` → `/images/styles/preference/Business%20%C2%B7%20Refined.png`
  - `vanilla` → `/images/styles/preference/Vanilla%20%C2%B7%20Clean.png`
  - `sporty` → `/images/styles/preference/Sporty%20%C2%B7%20Active.png`
  - `edgy` → `/images/styles/preference/Edgy%20%C2%B7%20Trendy.png`
  - `bohemian` → `/images/styles/preference/Bohemian%20%C2%B7%20Natural.png`
  - `classic` → `/images/styles/preference/Classic%20%C2%B7%20Old%20Money.png`
  - `mystery` → `/images/styles/preference/Mystery%20Style%20%F0%9F%8E%B2.png`

### 4. Validate File Existence and Paths
- Verify all 10 images exist in the target directory
- Verify the JSON file is valid and parseable
- Verify each URL-encoded path resolves to an existing file

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -la apps/web/public/images/styles/preference/` - Confirm all 10 images are present in target directory
- `cat apps/web/lib/data/fashion-styles.json | python3 -m json.tool > /dev/null && echo "JSON is valid"` - Verify JSON syntax is correct
- `cd apps/web && pnpm build` - Build the Next.js app to catch any import/reference errors
- Start dev server and visually verify images load on the onboarding style selection page

## Notes
- The OnboardingStyle component already has error handling (`handleImageError`) that will display a fallback if images fail to load, but all images should load correctly with properly URL-encoded paths
- The old images (`Group 31.png` through `Group 40.png`) in `/images/styles/` can be removed in a future cleanup chore if no longer needed
- URL encoding is critical because browsers interpret special characters differently; the middle dot `·` is a Unicode character (U+00B7) that encodes to `%C2%B7`
