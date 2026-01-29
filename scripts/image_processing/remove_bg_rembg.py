#!/usr/bin/env python3
"""
AI-Based Background Removal Script using rembg

Removes background from images using AI-based segmentation.
Specifically designed for person/model images to create transparent backgrounds.

Usage:
    python remove_bg_rembg.py <input_path> <output_path>

Example:
    python remove_bg_rembg.py input.png output.png
"""

import sys
import os
from pathlib import Path

try:
    from rembg import remove, new_session
    from PIL import Image, ImageFilter
    import io
except ImportError as e:
    print(f"Error: Required library not found: {e}", file=sys.stderr)
    print("Install required libraries with: pip install rembg pillow", file=sys.stderr)
    sys.exit(1)


# Create a session with the u2net model for better quality
SESSION = new_session("u2net")


def remove_background(input_path: str, output_path: str) -> bool:
    """
    Remove background from an image using AI-based segmentation.
    Uses alpha matting for cleaner edges and removes edge artifacts.

    Args:
        input_path: Path to the input image
        output_path: Path to save the output image with transparent background

    Returns:
        True if successful, False otherwise
    """
    try:
        # Validate input file exists
        if not os.path.exists(input_path):
            print(f"Error: Input file not found: {input_path}", file=sys.stderr)
            return False

        print(f"Processing: {input_path}", file=sys.stderr)

        # Read input image
        with open(input_path, 'rb') as f:
            input_data = f.read()

        # Remove background using rembg with alpha matting for cleaner edges
        output_data = remove(
            input_data,
            session=SESSION,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )

        # Post-process to clean up edge artifacts
        img = Image.open(io.BytesIO(output_data)).convert('RGBA')

        # Get alpha channel and clean it up
        r, g, b, a = img.split()

        # Apply slight erosion to alpha to remove edge halo
        # Convert alpha to image for processing
        a_img = a.point(lambda x: 0 if x < 20 else x)  # Remove very faint edges

        # Merge back
        img = Image.merge('RGBA', (r, g, b, a_img))

        # Save output image
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        img.save(output_path, 'PNG')

        print(f"Success: Saved to {output_path}", file=sys.stderr)
        return True

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False


def remove_background_from_base64(base64_data: str) -> str:
    """
    Remove background from a base64-encoded image.
    Uses alpha matting for cleaner edges.

    Args:
        base64_data: Base64-encoded image data (with or without data URL prefix)

    Returns:
        Base64-encoded image data with transparent background
    """
    import base64

    # Strip data URL prefix if present
    if ',' in base64_data:
        base64_data = base64_data.split(',')[1]

    # Decode base64 to bytes
    input_bytes = base64.b64decode(base64_data)

    # Remove background with alpha matting
    output_bytes = remove(
        input_bytes,
        session=SESSION,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    # Post-process to clean up edge artifacts
    img = Image.open(io.BytesIO(output_bytes)).convert('RGBA')
    r, g, b, a = img.split()
    a_img = a.point(lambda x: 0 if x < 20 else x)
    img = Image.merge('RGBA', (r, g, b, a_img))

    # Save to bytes
    output_buffer = io.BytesIO()
    img.save(output_buffer, 'PNG')
    output_buffer.seek(0)

    # Encode back to base64
    output_base64 = base64.b64encode(output_buffer.read()).decode('utf-8')

    return f"data:image/png;base64,{output_base64}"


def main():
    """Main entry point for command-line usage."""
    if len(sys.argv) < 3:
        print("Usage: python remove_bg_rembg.py <input_path> <output_path>", file=sys.stderr)
        print("       python remove_bg_rembg.py --base64  (reads base64 from stdin, outputs to stdout)", file=sys.stderr)
        sys.exit(1)

    if sys.argv[1] == '--base64':
        # Read base64 from stdin and output to stdout
        input_base64 = sys.stdin.read().strip()
        output_base64 = remove_background_from_base64(input_base64)
        print(output_base64)
    else:
        input_path = sys.argv[1]
        output_path = sys.argv[2]

        success = remove_background(input_path, output_path)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
