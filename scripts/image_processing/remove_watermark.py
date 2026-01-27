#!/usr/bin/python3
"""
Watermark Removal Script

Removes the Gemini star watermark from the bottom-right corner of womens-fashion.png
by cropping the bottom portion of the image. The original image is 1792x2400px and
will be cropped to 1792x2300px to remove the watermark while preserving the main content.
"""

import os
import sys
from pathlib import Path
from PIL import Image


def crop_watermark(input_path: str, output_path: str, crop_bottom_px: int = 100) -> bool:
    """
    Remove watermark from an image by cropping the bottom portion.

    Args:
        input_path: Path to the input image
        output_path: Path to save the output image
        crop_bottom_px: Number of pixels to crop from the bottom (default: 100)

    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"Reading image from: {input_path}")

        # Check if input file exists
        if not os.path.exists(input_path):
            print(f"Error: Input file not found: {input_path}")
            return False

        # Open the image
        img = Image.open(input_path)
        print(f"Original image: Mode={img.mode}, Size={img.size}")

        # Get current dimensions
        width, height = img.size
        print(f"Current dimensions: {width}x{height}px")

        # Calculate new height after cropping
        new_height = height - crop_bottom_px
        print(f"Cropping bottom {crop_bottom_px}px...")
        print(f"New dimensions will be: {width}x{new_height}px")

        # Crop the image (left, upper, right, lower)
        # Keep the top portion, remove bottom pixels
        cropped_img = img.crop((0, 0, width, new_height))

        # Save the cropped image
        print(f"\nSaving cropped image to: {output_path}")
        cropped_img.save(output_path, 'PNG')

        # Verify final dimensions
        final_img = Image.open(output_path)
        print(f"Final image: Mode={final_img.mode}, Size={final_img.size}")

        # Print statistics
        print(f"\n✓ Success!")
        print(f"  Cropped: {crop_bottom_px}px from bottom")
        print(f"  Original size: {width}x{height}px")
        print(f"  Final size: {final_img.size[0]}x{final_img.size[1]}px")

        return True

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main entry point for the script."""
    # Get the project root directory
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent.parent

    # Define the image path
    image_path = project_root / "apps" / "web" / "public" / "images" / "onboarding" / "womens-fashion.png"

    print("=" * 60)
    print("Women's Fashion Image - Watermark Removal")
    print("=" * 60)
    print(f"Project root: {project_root}")
    print(f"Image path: {image_path}")
    print()

    # Crop 100px from bottom to remove the Gemini star watermark
    success = crop_watermark(
        str(image_path),
        str(image_path),
        crop_bottom_px=100
    )

    if success:
        print()
        print("=" * 60)
        print("Watermark removal completed successfully!")
        print("=" * 60)
        sys.exit(0)
    else:
        print()
        print("=" * 60)
        print("Watermark removal failed!")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
