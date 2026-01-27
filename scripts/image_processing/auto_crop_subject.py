#!/usr/bin/env python3
"""
Auto-Crop Subject Script

Automatically crops PNG images to the bounding box of non-transparent pixels
with configurable padding. Designed for try-on images to ensure the model
fills the frame.

Usage:
    python auto_crop_subject.py <input_path> <output_path>

Example:
    python auto_crop_subject.py input.png output.png
"""

import sys
import os
from pathlib import Path

try:
    from PIL import Image
except ImportError as e:
    print(f"Error: Required library not found: {e}", file=sys.stderr)
    print("Install required libraries with: pip install pillow", file=sys.stderr)
    sys.exit(1)


def auto_crop_subject(input_path: str, output_path: str, padding_percent: float = 0.03) -> bool:
    """
    Auto-crop image to the bounding box of non-transparent pixels with padding.

    Args:
        input_path: Path to the input PNG image with transparency
        output_path: Path to save the cropped output image
        padding_percent: Padding to add on each side as a percentage (default: 0.03 = 3%)

    Returns:
        True if successful, False otherwise
    """
    try:
        # Validate input file exists
        if not os.path.exists(input_path):
            print(f"Error: Input file not found: {input_path}", file=sys.stderr)
            return False

        print(f"Processing: {input_path}", file=sys.stderr)

        # Load image in RGBA mode
        img = Image.open(input_path).convert('RGBA')
        width, height = img.size

        # Get alpha channel
        alpha = img.split()[3]

        # Get bounding box of non-transparent pixels
        bbox = alpha.getbbox()

        if bbox is None:
            print("Warning: Image is fully transparent, no subject to crop", file=sys.stderr)
            # Copy input to output unchanged
            img.save(output_path, 'PNG')
            return True

        left, top, right, bottom = bbox

        # Calculate padding in pixels
        bbox_width = right - left
        bbox_height = bottom - top
        padding_x = int(bbox_width * padding_percent)
        padding_y = int(bbox_height * padding_percent)

        # Add padding to bounding box, clamped to image boundaries
        left = max(0, left - padding_x)
        top = max(0, top - padding_y)
        right = min(width, right + padding_x)
        bottom = min(height, bottom + padding_y)

        print(f"Original size: {width}x{height}", file=sys.stderr)
        print(f"Detected bbox: ({bbox[0]}, {bbox[1]}) to ({bbox[2]}, {bbox[3]})", file=sys.stderr)
        print(f"Padding: {padding_x}px horizontal, {padding_y}px vertical", file=sys.stderr)
        print(f"Cropped bbox: ({left}, {top}) to ({right}, {bottom})", file=sys.stderr)

        # Crop to the padded bounding box
        cropped = img.crop((left, top, right, bottom))

        cropped_width, cropped_height = cropped.size
        print(f"Cropped size: {cropped_width}x{cropped_height}", file=sys.stderr)

        # Save output image
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        cropped.save(output_path, 'PNG')

        print(f"Success: Saved to {output_path}", file=sys.stderr)
        return True

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main entry point for command-line usage."""
    if len(sys.argv) < 3:
        print("Usage: python auto_crop_subject.py <input_path> <output_path>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    success = auto_crop_subject(input_path, output_path)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
