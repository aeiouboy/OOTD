# Chore: Update OnboardingStyle to use new style preference images

## Metadata
adw_id: `6a783df0`
prompt: `Update OnboardingStyle to use new style images from data/assets/onboarding/preference/. Steps: 1) Copy all PNG images from data/assets/onboarding/preference/ to apps/web/public/images/styles/preference/ creating folder if needed. 2) Update apps/web/lib/data/fashion-styles.json imageUrl fields - map each style id to matching image by name pattern (minimal->Minimal, luxury->Luxury, eccentric->Eccentric, business->Business, vanilla->Vanilla, sporty->Sporty, edgy->Edgy, bohemian->Bohemian, classic->Classic, mystery->Mystery Style). 3) URL-encode the special characters in filenames for browser compatibility.`

## Chore Description
Update the onboarding style preference images by migrating from the old placeholder images (Group 31-40.png) to the new branded style images with descriptive names. This involves:

1. Creating a new subdirectory structure for preference images
2. Copying the new PNG images with proper naming (e.g., "Minimal · Timeless.png", "Luxury · Elegant.png")
3. Updating the fashion-styles.json data file to reference the new image paths
4. URL-encoding special characters (·, spaces, emoji) in the image paths for browser compatibility

The new images follow a naming pattern that matches style names with descriptive tags:
- Minimal · Timeless.png
- Luxury · Elegant.png
- Eccentric · Creative.png
- Business · Refined.png
- Vanilla · Clean.png
- Sporty · Active.png
- Edgy · Trendy.png
- Bohemian · Natural.png
- Classic · Old Money.png
- Mystery Style 🎲.png

## Relevant Files

### Existing Files
- `data/assets/onboarding/preference/*.png` - Source images with new branded style names (10 PNG files)
- `apps/web/lib/data/fashion-styles.json` - Fashion style configuration data that needs imageUrl updates
- `apps/web/public/images/styles/` - Current style images directory containing old Group XX.png files

### New Files
- `apps/web/public/images/styles/preference/` - New subdirectory to organize preference images separately from existing styles

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create target directory structure
- Create the `apps/web/public/images/styles/preference/` directory
- Verify the directory was created successfully

### 2. Copy PNG images from source to destination
- Copy all 10 PNG files from `data/assets/onboarding/preference/` to `apps/web/public/images/styles/preference/`
- Preserve original filenames with special characters (·, spaces, emoji)
- Verify all files were copied correctly

### 3. Update fashion-styles.json with new image paths
- Read the current `apps/web/lib/data/fashion-styles.json` file
- Update each style's imageUrl field based on the mapping:
  - minimal → "/images/styles/preference/Minimal%20%C2%B7%20Timeless.png"
  - luxury → "/images/styles/preference/Luxury%20%C2%B7%20Elegant.png"
  - eccentric → "/images/styles/preference/Eccentric%20%C2%B7%20Creative.png"
  - business → "/images/styles/preference/Business%20%C2%B7%20Refined.png"
  - vanilla → "/images/styles/preference/Vanilla%20%C2%B7%20Clean.png"
  - sporty → "/images/styles/preference/Sporty%20%C2%B7%20Active.png"
  - edgy → "/images/styles/preference/Edgy%20%C2%B7%20Trendy.png"
  - bohemian → "/images/styles/preference/Bohemian%20%C2%B7%20Natural.png"
  - classic → "/images/styles/preference/Classic%20%C2%B7%20Old%20Money.png"
  - mystery → "/images/styles/preference/Mystery%20Style%20%F0%9F%8E%B2.png"
- Save the updated JSON file with proper formatting

### 4. Validate the changes
- Verify all 10 PNG files exist in `apps/web/public/images/styles/preference/`
- Verify the JSON file is valid and properly formatted
- Check that all imageUrl paths use URL-encoded special characters
- Confirm the mapping between style IDs and image filenames is correct

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -1 apps/web/public/images/styles/preference/ | wc -l` - Should show 10 PNG files
- `ls -1 apps/web/public/images/styles/preference/` - List all copied images
- `cat apps/web/lib/data/fashion-styles.json | jq '.[].imageUrl'` - Verify all imageUrl paths are updated
- `cat apps/web/lib/data/fashion-styles.json | jq '.'` - Validate JSON syntax is correct
- `node -e "console.log(decodeURIComponent('/images/styles/preference/Minimal%20%C2%B7%20Timeless.png'))"` - Test URL decoding works

## Notes

**URL Encoding Reference:**
- Space: %20
- Middle dot (·): %C2%B7
- Emoji (🎲): %F0%9F%8E%B2

**Style ID to Filename Mapping:**
The style IDs in the JSON use lowercase/hyphenated names while the image filenames use Title Case with descriptive tags:
- Style names from JSON: minimal, luxury, eccentric, business, vanilla, sporty, edgy, bohemian, classic, mystery
- Image filename pattern: "[StyleName] · [Description].png" or "[StyleName] [Emoji].png"

**Browser Compatibility:**
URL encoding ensures that special characters in filenames work correctly across all browsers and web servers, preventing 404 errors or broken image links.
