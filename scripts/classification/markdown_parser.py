"""Parse Central.co.th product page markdown to extract structured data."""

import re
import logging
from typing import Optional

# Set up logging
logger = logging.getLogger(__name__)


def parse_product_page_markdown(markdown: str) -> dict:
    """
    Parse complete Central.co.th product page markdown with enhanced extraction.

    This is the enhanced version that supports all scraping scenarios with
    multiple fallback patterns for robust extraction.

    Args:
        markdown: Raw markdown content from firecrawl_scrape

    Returns:
        Dictionary with all extracted fields (empty string for missing values)
    """
    result = {
        'subcategory': '',
        'material': '',
        'fit': '',
        'care': '',
        'color_from_page': '',
        'sleeve_type': '',
        'length_type': '',
        'description': ''
    }

    try:
        # Extract subcategory from breadcrumb with multiple fallback patterns
        # Primary: 5th breadcrumb level "5. [Subcategory](url)"
        breadcrumb_match = re.search(r'5\.\s*\[([^\]]+)\]', markdown)
        if breadcrumb_match:
            result['subcategory'] = breadcrumb_match.group(1).strip()
        else:
            # Secondary: Any category link after women/woman
            alt_breadcrumb = re.search(
                r'(?:women|woman)[^\]]*\[([^\]]+)\]\([^)]*(?:category|dept|cat)[^)]*\)',
                markdown, re.IGNORECASE
            )
            if alt_breadcrumb:
                result['subcategory'] = alt_breadcrumb.group(1).strip()
            else:
                # Tertiary: Extract from URL path
                url_category = re.search(
                    r'/(?:women|woman)/([^/]+)/',
                    markdown, re.IGNORECASE
                )
                if url_category:
                    category = url_category.group(1).replace('-', ' ').title()
                    result['subcategory'] = category

        # Extract material/fabric with multiple patterns
        # Primary: "Material/Fabric : <value>"
        material_match = re.search(
            r'Material/Fabric\s*:\s*(.+?)(?:\n|$)',
            markdown, re.IGNORECASE
        )
        if material_match:
            result['material'] = material_match.group(1).strip()
        else:
            # Secondary: "Material: <value>" or "Fabric: <value>"
            alt_material = re.search(
                r'(?:Material|Fabric)\s*:\s*(.+?)(?:\n|$)',
                markdown, re.IGNORECASE
            )
            if alt_material:
                result['material'] = alt_material.group(1).strip()
            else:
                # Tertiary: Inline material mentions (e.g., "100% Cotton")
                inline_material = re.search(
                    r'\b(\d+%\s*(?:Cotton|Polyester|Silk|Wool|Linen|Rayon|Nylon|Spandex|Lycra)(?:\s*blend)?)\b',
                    markdown, re.IGNORECASE
                )
                if inline_material:
                    result['material'] = inline_material.group(1).strip()

        # Extract fit with variant patterns
        fit_match = re.search(r'Fit\s*:\s*(.+?)(?:\n|$)', markdown, re.IGNORECASE)
        if fit_match:
            result['fit'] = fit_match.group(1).strip()
        else:
            # Alternative: "Style Fit: <value>"
            alt_fit = re.search(r'Style\s*Fit\s*:\s*(.+?)(?:\n|$)', markdown, re.IGNORECASE)
            if alt_fit:
                result['fit'] = alt_fit.group(1).strip()

        # Extract care instructions
        care_match = re.search(r'Care\s*:\s*(.+?)(?:\n|$)', markdown, re.IGNORECASE)
        if care_match:
            result['care'] = care_match.group(1).strip()
        else:
            # Alternative: "Care Instructions: <value>"
            alt_care = re.search(
                r'Care\s*Instructions\s*:\s*(.+?)(?:\n|$)',
                markdown, re.IGNORECASE
            )
            if alt_care:
                result['care'] = alt_care.group(1).strip()

        # Extract color with multi-source priority
        colors = [
            'Blue', 'Black', 'White', 'Red', 'Pink', 'Green', 'Yellow',
            'Brown', 'Grey', 'Gray', 'Beige', 'Navy', 'Purple', 'Orange',
            'Cream', 'Gold', 'Silver', 'Burgundy', 'Olive', 'Khaki',
            'Coral', 'Mint', 'Teal', 'Maroon', 'Rose', 'Lavender',
            'Ivory', 'Tan', 'Nude', 'Blush', 'Peach', 'Charcoal'
        ]
        color_pattern = r'\b(' + '|'.join(colors) + r')\b'

        # Priority 1: Product details section
        details_section = re.search(
            r'PRODUCT DETAILS.*?(?=DELIVERY|SIZE|$)',
            markdown, re.DOTALL | re.IGNORECASE
        )
        if details_section:
            color_in_details = re.search(color_pattern, details_section.group(0), re.IGNORECASE)
            if color_in_details:
                result['color_from_page'] = color_in_details.group(1).title()

        # Priority 2: Title/heading section (if not found in details)
        if not result['color_from_page']:
            title_match = re.search(r'^#.*$', markdown, re.MULTILINE)
            if title_match:
                color_in_title = re.search(color_pattern, title_match.group(0), re.IGNORECASE)
                if color_in_title:
                    result['color_from_page'] = color_in_title.group(1).title()

        # Priority 3: Anywhere in content (fallback)
        if not result['color_from_page']:
            color_match = re.search(color_pattern, markdown, re.IGNORECASE)
            if color_match:
                result['color_from_page'] = color_match.group(1).title()

        # Normalize Grey/Gray
        if result['color_from_page'] == 'Gray':
            result['color_from_page'] = 'Grey'

        # Extract description
        desc_match = re.search(
            r'PRODUCT DETAILS\s*\n\s*DELIVERY.*?\n\s*(.+?)(?:Material/Fabric|Fit|Care|$)',
            markdown, re.DOTALL | re.IGNORECASE
        )
        if desc_match:
            desc = desc_match.group(1).strip()
            desc = re.sub(r'\s+', ' ', desc)  # Normalize whitespace
            result['description'] = desc[:500]

        # Extract sleeve type
        sleeve_patterns = [
            (r'\b(sleeveless)\b', 'sleeveless'),
            (r'\b(short sleeve|short-sleeve)\b', 'short'),
            (r'\b(long sleeve|long-sleeve)\b', 'long'),
            (r'\b(cap sleeve)\b', 'cap'),
            (r'\b(3/4 sleeve|three-quarter)\b', '3/4'),
            (r'\b(off[- ]shoulder)\b', 'off-shoulder'),
            (r'\b(strapless)\b', 'strapless'),
        ]
        for pattern, sleeve_type in sleeve_patterns:
            if re.search(pattern, markdown, re.IGNORECASE):
                result['sleeve_type'] = sleeve_type
                break

        # Extract length type
        length_patterns = [
            (r'\b(mini)\b', 'mini'),
            (r'\b(midi)\b', 'midi'),
            (r'\b(maxi)\b', 'maxi'),
            (r'\b(crop|cropped)\b', 'crop'),
            (r'\b(knee[- ]length)\b', 'knee'),
            (r'\b(ankle[- ]length)\b', 'ankle'),
            (r'\b(floor[- ]length)\b', 'floor'),
        ]
        for pattern, length_type in length_patterns:
            if re.search(pattern, markdown, re.IGNORECASE):
                result['length_type'] = length_type
                break

    except Exception as e:
        logger.error(f"Error parsing markdown: {e}")

    return result


def parse_product_markdown(markdown: str) -> dict:
    """
    Parse Central.co.th product page markdown to extract structured data.

    Args:
        markdown: Raw markdown content from firecrawl_scrape

    Returns:
        Dictionary with extracted fields: subcategory, material, fit, care, color, description
    """
    result = {}

    # Extract subcategory from breadcrumb
    # Pattern: "5. [Mini Dresses](url)" or similar numbered breadcrumb
    breadcrumb_match = re.search(r'5\.\s*\[([^\]]+)\]', markdown)
    if breadcrumb_match:
        result['subcategory'] = breadcrumb_match.group(1).strip()
    else:
        # Alternative pattern: look for category in path
        alt_breadcrumb = re.search(r'(?:women|woman)[^\]]*\[([^\]]+)\]', markdown, re.IGNORECASE)
        if alt_breadcrumb:
            result['subcategory'] = alt_breadcrumb.group(1).strip()

    # Extract material/fabric
    material_match = re.search(r'Material/Fabric\s*:\s*(.+?)(?:\n|$)', markdown, re.IGNORECASE)
    if material_match:
        result['material'] = material_match.group(1).strip()
    else:
        # Alternative patterns
        alt_material = re.search(r'(?:Material|Fabric)\s*[:\-]\s*(.+?)(?:\n|$)', markdown, re.IGNORECASE)
        if alt_material:
            result['material'] = alt_material.group(1).strip()

    # Extract fit
    fit_match = re.search(r'Fit\s*:\s*(.+?)(?:\n|$)', markdown, re.IGNORECASE)
    if fit_match:
        result['fit'] = fit_match.group(1).strip()

    # Extract care instructions
    care_match = re.search(r'Care\s*:\s*(.+?)(?:\n|$)', markdown, re.IGNORECASE)
    if care_match:
        result['care'] = care_match.group(1).strip()

    # Extract color from title, product name, or content
    colors = [
        'Blue', 'Black', 'White', 'Red', 'Pink', 'Green', 'Yellow',
        'Brown', 'Grey', 'Gray', 'Beige', 'Navy', 'Purple', 'Orange',
        'Cream', 'Gold', 'Silver', 'Burgundy', 'Olive', 'Khaki',
        'Coral', 'Mint', 'Teal', 'Maroon', 'Rose', 'Lavender',
        'Ivory', 'Tan', 'Nude', 'Blush', 'Peach', 'Charcoal'
    ]
    color_pattern = r'\b(' + '|'.join(colors) + r')\b'
    color_match = re.search(color_pattern, markdown, re.IGNORECASE)
    if color_match:
        result['color'] = color_match.group(1).title()

    # Extract description (text between PRODUCT DETAILS and Material/Fabric)
    desc_match = re.search(
        r'PRODUCT DETAILS\s*\n\s*DELIVERY.*?\n\s*(.+?)(?:Material/Fabric|$)',
        markdown, re.DOTALL | re.IGNORECASE
    )
    if desc_match:
        desc = desc_match.group(1).strip()
        # Clean up the description
        desc = re.sub(r'\s+', ' ', desc)
        result['description'] = desc[:500]  # Limit length

    # Extract sleeve type
    sleeve_patterns = [
        (r'\b(sleeveless)\b', 'sleeveless'),
        (r'\b(short sleeve|short-sleeve)\b', 'short'),
        (r'\b(long sleeve|long-sleeve)\b', 'long'),
        (r'\b(cap sleeve)\b', 'cap'),
        (r'\b(3/4 sleeve|three-quarter)\b', '3/4'),
        (r'\b(off[- ]shoulder)\b', 'off-shoulder'),
        (r'\b(strapless)\b', 'strapless'),
    ]
    for pattern, sleeve_type in sleeve_patterns:
        if re.search(pattern, markdown, re.IGNORECASE):
            result['sleeve_type'] = sleeve_type
            break

    # Extract length type
    length_patterns = [
        (r'\b(mini)\b', 'mini'),
        (r'\b(midi)\b', 'midi'),
        (r'\b(maxi)\b', 'maxi'),
        (r'\b(crop|cropped)\b', 'crop'),
        (r'\b(knee[- ]length)\b', 'knee'),
        (r'\b(ankle[- ]length)\b', 'ankle'),
        (r'\b(floor[- ]length)\b', 'floor'),
    ]
    for pattern, length_type in length_patterns:
        if re.search(pattern, markdown, re.IGNORECASE):
            result['length_type'] = length_type
            break

    return result


def extract_product_type_from_name(product_name: str) -> Optional[str]:
    """
    Extract product type from product name.

    Args:
        product_name: Product name string

    Returns:
        Product type (e.g., 'dress', 'blouse', 'pants') or None
    """
    name_lower = product_name.lower()

    # Order matters - more specific patterns first
    product_types = [
        'mini dress', 'midi dress', 'maxi dress', 'jumpsuit', 'romper',
        'blazer', 'cardigan', 'sweater', 'jacket', 'coat', 'vest',
        'blouse', 'shirt', 'top', 't-shirt', 'tee',
        'pants', 'trousers', 'jeans', 'shorts', 'skirt',
        'dress', 'bikini', 'swimsuit', 'swimwear'
    ]

    for ptype in product_types:
        if ptype in name_lower:
            # Normalize some types
            if ptype in ['mini dress', 'midi dress', 'maxi dress']:
                return ptype.replace(' ', '_')
            if ptype in ['trousers']:
                return 'pants'
            if ptype in ['t-shirt', 'tee']:
                return 'top'
            return ptype

    return None


def extract_color_from_name(product_name: str) -> Optional[str]:
    """
    Extract color from product name.

    Args:
        product_name: Product name string

    Returns:
        Color name or None
    """
    colors = [
        'Blue', 'Black', 'White', 'Red', 'Pink', 'Green', 'Yellow',
        'Brown', 'Grey', 'Gray', 'Beige', 'Navy', 'Purple', 'Orange',
        'Cream', 'Gold', 'Silver', 'Burgundy', 'Olive', 'Khaki',
        'Coral', 'Mint', 'Teal', 'Maroon', 'Rose', 'Lavender',
        'Ivory', 'Tan', 'Nude', 'Blush', 'Peach', 'Charcoal',
        'Multi', 'Multicolor', 'Print', 'Floral', 'Stripe', 'Striped'
    ]

    color_pattern = r'\b(' + '|'.join(colors) + r')\b'
    match = re.search(color_pattern, product_name, re.IGNORECASE)

    if match:
        color = match.group(1).title()
        # Normalize
        if color == 'Gray':
            return 'Grey'
        return color

    return None
