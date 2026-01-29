# Chore: Fix Logo Background Removal to Keep OOTDay Text

## Metadata
adw_id: `dbc1c131`
prompt: `Fix logo background removal to keep OOTDay text. The previous rembg approach removed the text along with background. Use a color-based approach instead: 1) First restore the original image by copying data/assets/onboarding/Gemini_Generated_Image_b1w5g4b1w5g4b1w5.png back to apps/web/public/images/onboarding/welcome-hero.png, 2) Use Python PIL/Pillow to remove only the cream/beige background color (approximately RGB 245,240,230 or similar light beige tones) by converting matching pixels to transparent, 3) Use a tolerance threshold of around 30-40 to catch slight color variations, 4) Keep all non-background pixels (the illustration and OOTDay text) intact, 5) Save as PNG with alpha transparency.`

## Chore Description
The previous background removal implementation using the `rembg` library inadvertently removed the OOTDay text along with the background. This chore replaces that approach with a color-based background removal method that targets only the cream/beige background color while preserving all other content including the illustration and text.

The solution uses PIL/Pillow's pixel manipulation capabilities to identify and make transparent only pixels matching the background color (within a tolerance threshold), ensuring the OOTDay text and illustration remain intact.

## Relevant Files

- `data/assets/onboarding/Gemini_Generated_Image_b1w5g4b1w5g4b1w5.png` - Original source image with background (6.7 MB) that needs to be restored as the starting point
- `apps/web/public/images/onboarding/welcome-hero.png` - Current processed image (2.4 MB) that will be replaced with the properly processed version
- `scripts/image_processing/remove_background.py` - Existing background removal script that needs to be updated to use color-based approach instead of rembg
- `scripts/image_processing/requirements.txt` - Dependency file (already has Pillow, rembg can be removed)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Restore Original Image
- Copy the original image from `data/assets/onboarding/Gemini_Generated_Image_b1w5g4b1w5g4b1w5.png` to `apps/web/public/images/onboarding/welcome-hero.png`
- This ensures we start with the complete image including the OOTDay text
- Verify the copy operation completes successfully and file sizes match (approximately 6.7 MB)

### 2. Update Background Removal Script
- Modify `scripts/image_processing/remove_background.py` to implement color-based background removal
- Replace the rembg approach with PIL/Pillow pixel manipulation
- Implement the following algorithm:
  - Load the image using PIL Image.open()
  - Convert to RGBA mode if not already
  - Define target background color: approximately RGB(245, 240, 230) or similar light beige tones
  - Set tolerance threshold: 30-40 to catch color variations
  - Iterate through pixels and make transparent those matching the background color within tolerance
  - Use color distance calculation: sqrt((r1-r2)² + (g1-g2)² + (b1-b2)²) < threshold
- Preserve all non-background pixels (illustration and text)
- Save as PNG with alpha transparency

### 3. Update Dependencies
- Update `scripts/image_processing/requirements.txt` if needed
- Pillow is already included (version 10.4.0), which is sufficient
- Consider removing rembg dependency as it's no longer needed (optional)

### 4. Execute Color-Based Background Removal
- Run the updated script: `python scripts/image_processing/remove_background.py`
- Monitor the output for any errors or warnings
- Verify the script completes successfully

### 5. Validate the Output
- Check the output image has transparent background where cream/beige was
- Verify the OOTDay text is intact and visible
- Confirm the illustration/graphics remain unchanged
- Verify file format is PNG with alpha channel (RGBA mode)
- Visually inspect the image to ensure text and graphics quality
- Check file size is reasonable (should be smaller than original due to transparency)

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -lh apps/web/public/images/onboarding/welcome-hero.png` - Check file exists and size is reasonable
- `python -c "from PIL import Image; img = Image.open('apps/web/public/images/onboarding/welcome-hero.png'); print(f'Mode: {img.mode}, Size: {img.size}')"` - Should output Mode: RGBA confirming transparency support
- `file apps/web/public/images/onboarding/welcome-hero.png` - Should show PNG format with alpha channel
- Visual inspection: Open the image in an image viewer that supports transparency (e.g., Preview on macOS, GIMP, Photoshop) to verify:
  - Background is transparent (shows checkerboard pattern)
  - OOTDay text is clearly visible and intact
  - Illustration/graphics are preserved

## Notes

- The color-based approach is more predictable than AI-based background removal when dealing with solid/uniform backgrounds
- The tolerance threshold (30-40) may need fine-tuning based on actual background color variations in the source image
- Consider sampling actual background pixels from the original image to determine the exact target RGB values
- If edges look jagged, consider implementing anti-aliasing or edge smoothing
- The original image (Gemini_Generated_Image_b1w5g4b1w5g4b1w5.png) should be preserved in data/assets/ as the source of truth
