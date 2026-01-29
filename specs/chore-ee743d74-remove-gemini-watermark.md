# Chore: Remove Gemini Star Watermark from Women's Fashion Image

## Metadata
adw_id: `ee743d74`
prompt: `Remove Gemini star watermark from Women's Fashion image. The image at apps/web/public/images/onboarding/womens-fashion.png has a small star watermark in the bottom-right corner. Use Python PIL/Pillow to crop off the bottom portion of the image to remove the watermark. The image is 1792x2400px. Crop to approximately 1792x2300px (removing bottom 100px) or find the star location and crop just enough to remove it. Save the cropped image back to the same path. Verify the watermark is removed.`

## Chore Description
The Women's Fashion onboarding image (`apps/web/public/images/onboarding/womens-fashion.png`) contains a Gemini star watermark in the bottom-right corner that needs to be removed. This chore involves creating a Python script using PIL/Pillow to crop the image to remove the watermark while preserving the main content.

The current image is 1792x2400 pixels. The watermark appears in the bottom-right corner, so we need to crop approximately 100 pixels from the bottom to remove it, resulting in a 1792x2300 pixel image.

## Relevant Files

**Existing Files:**
- `apps/web/public/images/onboarding/womens-fashion.png` - Target image with watermark (1792x2400px)
- `scripts/image_processing/requirements.txt` - Contains Pillow dependency
- `scripts/image_processing/remove_background.py` - Example script showing PIL/Pillow usage pattern

### New Files
- `scripts/image_processing/remove_watermark.py` - New script to crop and remove the star watermark from the Women's Fashion image

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Watermark Removal Script
- Create `scripts/image_processing/remove_watermark.py`
- Import PIL/Pillow libraries (Image module)
- Follow the code structure pattern from `remove_background.py` for consistency
- Add proper error handling and validation
- Include progress output for user feedback

### 2. Implement Image Cropping Logic
- Load the image from `apps/web/public/images/onboarding/womens-fashion.png`
- Verify image dimensions (should be 1792x2400px)
- Crop the image to remove bottom 100px (new size: 1792x2300px)
- Use PIL's crop method with coordinates (0, 0, 1792, 2300)
- Save the cropped image back to the same path

### 3. Add Verification and Backup
- Before cropping, display current image dimensions
- Create informative output showing the crop operation
- Save the cropped image in PNG format
- Display final image dimensions after cropping

### 4. Execute the Script
- Make the script executable (`chmod +x scripts/image_processing/remove_watermark.py`)
- Run the script: `python3 scripts/image_processing/remove_watermark.py`
- Verify the script executes without errors

### 5. Validate Watermark Removal
- Visually inspect the cropped image to confirm watermark is removed
- Verify the image dimensions are now 1792x2300px
- Ensure the main fashion outfit content is fully preserved
- Confirm image quality is maintained (no compression artifacts)

## Validation Commands
Execute these commands to validate the chore is complete:

- `python3 scripts/image_processing/remove_watermark.py` - Execute the watermark removal script
- `file apps/web/public/images/onboarding/womens-fashion.png` - Verify file exists and is a valid PNG
- `python3 -c "from PIL import Image; img = Image.open('apps/web/public/images/onboarding/womens-fashion.png'); print(f'Dimensions: {img.size}')"` - Verify new dimensions are 1792x2300px

## Notes
- The image uses a neutral beige/cream background, so cropping from the bottom should not affect the main fashion content
- The star watermark is located in the bottom-right corner, making a bottom crop the most effective approach
- Pillow is already listed in `scripts/image_processing/requirements.txt`, so no additional dependencies are needed
- The script follows the existing pattern from `remove_background.py` for code consistency
- The original image dimensions are 1792x2400px, and we're targeting 1792x2300px (removing 100px from bottom)
