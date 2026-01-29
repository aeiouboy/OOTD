#!/usr/bin/python3
"""
Background Removal Script

Removes the cream/beige background from welcome-hero.png using color-based pixel manipulation.
The output is saved with a transparent background (RGBA format) while preserving the text and illustration.
"""

import os
import sys
from pathlib import Path
from PIL import Image
import math


def remove_background_by_color(input_path: str, output_path: str, target_color=(245, 240, 230), tolerance=35) -> bool:
    """
    Remove background from an image by making pixels matching a target color transparent.

    Args:
        input_path: Path to the input image
        output_path: Path to save the output image
        target_color: RGB tuple of the background color to remove (default: light beige)
        tolerance: Color distance threshold for matching (default: 35)

    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"Reading image from: {input_path}")

        # Check if input file exists
        if not os.path.exists(input_path):
            print(f"Error: Input file not found: {input_path}")
            return False

        # Open and convert image to RGBA
        img = Image.open(input_path)
        print(f"Original image: Mode={img.mode}, Size={img.size}")

        if img.mode != 'RGBA':
            print(f"Converting from {img.mode} to RGBA...")
            img = img.convert('RGBA')

        # Get pixel data
        pixels = img.load()
        width, height = img.size

        print(f"Removing background color {target_color} with tolerance {tolerance}...")

        # Track statistics
        pixels_modified = 0
        total_pixels = width * height

        # Iterate through all pixels
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]

                # Calculate color distance from target background color
                color_distance = math.sqrt(
                    (r - target_color[0]) ** 2 +
                    (g - target_color[1]) ** 2 +
                    (b - target_color[2]) ** 2
                )

                # If pixel matches background color within tolerance, make it transparent
                if color_distance <= tolerance:
                    pixels[x, y] = (r, g, b, 0)  # Set alpha to 0 (transparent)
                    pixels_modified += 1

            # Progress indicator every 100 rows
            if (y + 1) % 100 == 0:
                progress = ((y + 1) / height) * 100
                print(f"Progress: {progress:.1f}% ({y + 1}/{height} rows)")

        # Save the output image
        print(f"\nSaving image to: {output_path}")
        img.save(output_path, 'PNG')

        # Print statistics
        print(f"\n✓ Success!")
        print(f"  Pixels modified: {pixels_modified:,} / {total_pixels:,} ({(pixels_modified/total_pixels)*100:.1f}%)")
        print(f"  Output image: Mode={img.mode}, Size={img.size}")

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
    image_path = project_root / "apps" / "web" / "public" / "images" / "onboarding" / "welcome-hero.png"

    print("=" * 60)
    print("Welcome Logo Background Removal (Color-Based)")
    print("=" * 60)
    print(f"Project root: {project_root}")
    print(f"Image path: {image_path}")
    print()

    # Remove background and save to the same path
    # Target color: light beige/cream (RGB 245, 240, 230)
    # Tolerance: 35 to catch slight variations
    success = remove_background_by_color(
        str(image_path),
        str(image_path),
        target_color=(245, 240, 230),
        tolerance=35
    )

    if success:
        print()
        print("=" * 60)
        print("Background removal completed successfully!")
        print("=" * 60)
        sys.exit(0)
    else:
        print()
        print("=" * 60)
        print("Background removal failed!")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
