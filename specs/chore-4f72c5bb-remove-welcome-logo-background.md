# Chore: Remove Background from Welcome Logo Image

## Metadata
adw_id: `4f72c5bb`
prompt: `Remove background from welcome logo image. Use Python with rembg library to remove the cream/beige background from apps/web/public/images/onboarding/welcome-hero.png and save as transparent PNG. Steps: 1) Install rembg if needed (pip install rembg), 2) Read the image, 3) Remove background using rembg, 4) Save back to the same path with transparency. The output should be a PNG with transparent background instead of the cream color.`

## Chore Description
Remove the cream/beige background from the welcome hero image used in the onboarding flow and replace it with a transparent background. This will be accomplished using the `rembg` Python library, which uses AI models to automatically detect and remove backgrounds from images.

The target image is located at `apps/web/public/images/onboarding/welcome-hero.png` (1792 x 2368 PNG, 8-bit RGB). After processing, the output should be a PNG with an alpha channel (transparency) instead of the cream-colored background.

## Relevant Files

- `apps/web/public/images/onboarding/welcome-hero.png` - The source image that needs background removal (will be overwritten with the transparent version)

### New Files
- `scripts/image_processing/remove_background.py` - Python script to remove the background using rembg library
- `scripts/image_processing/requirements.txt` - Dependencies for the background removal script

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Image Processing Directory
- Create `scripts/image_processing/` directory if it doesn't exist
- This will house the background removal script and its dependencies

### 2. Create Requirements File
- Create `scripts/image_processing/requirements.txt` with the necessary dependencies
- Include `rembg[gpu]` (or `rembg` for CPU-only) and `Pillow` for image handling
- Pin versions for reproducibility

### 3. Create Background Removal Script
- Create `scripts/image_processing/remove_background.py`
- Import necessary libraries (rembg, PIL)
- Read the image from `apps/web/public/images/onboarding/welcome-hero.png`
- Use rembg to remove the background
- Save the result back to the same path with transparency preserved
- Add proper error handling and logging
- Make the script idempotent (safe to run multiple times)

### 4. Install Dependencies
- Install the required dependencies using pip
- Command: `pip install -r scripts/image_processing/requirements.txt`
- This will install rembg and its dependencies

### 5. Execute Background Removal
- Run the Python script to process the image
- Command: `python scripts/image_processing/remove_background.py`
- Verify the script completes without errors

### 6. Validate the Output
- Verify the output image has a transparent background
- Check that the image dimensions remain the same (1792 x 2368)
- Confirm the file format is still PNG with alpha channel
- Visually inspect the image to ensure quality

## Validation Commands
Execute these commands to validate the chore is complete:

- `file apps/web/public/images/onboarding/welcome-hero.png` - Should show PNG with alpha channel (RGBA instead of RGB)
- `python -c "from PIL import Image; img = Image.open('apps/web/public/images/onboarding/welcome-hero.png'); print(f'Mode: {img.mode}, Size: {img.size}')"` - Should output Mode: RGBA and Size: (1792, 2368)
- Visual inspection: Open the image in an image viewer that supports transparency to verify the background is removed

## Notes

- The `rembg` library uses AI models (u2net by default) to detect and remove backgrounds. The first run may take longer as it downloads the model.
- The original image will be overwritten. Consider backing it up before running if needed for rollback.
- The script is designed to be idempotent - it's safe to run multiple times on the same image.
- If GPU support is not available or needed, the regular `rembg` package (CPU-only) will work fine but may be slower.
