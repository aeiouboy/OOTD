"""Classification rules for 30 occasions for women's clothing."""

from typing import Dict, List, Optional, Set
import re

# Define all 30 occasions with their classification rules
OCCASION_RULES = {
    # =========================================
    # Work & Professional (5)
    # =========================================
    'work_formal': {
        'description': 'Formal office wear for corporate environments',
        'include_types': ['blazer', 'dress', 'midi_dress', 'blouse', 'pants', 'skirt', 'shirt', 'sweater', 'coat', 'vest'],
        'include_keywords': ['blazer', 'suit', 'formal', 'office', 'professional', 'tailored', 'pencil', 'structured', 'shirt', 'coat', 'vest'],
        'exclude_keywords': ['crop', 'mini', 'shorts', 'tank', 'bikini', 'sport', 'gym', 'beach', 'swimwear', 'distressed'],
        'require_coverage': {'shoulders': 'covered'},
        'min_price': 1000,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'mini_dress'],
    },
    'work_casual': {
        'description': 'Smart casual for relaxed office environments',
        'include_types': ['blouse', 'shirt', 'pants', 'skirt', 'dress', 'cardigan', 'midi_dress', 'sweater', 'jeans', 'blazer', 'vest', 'coat'],
        'include_keywords': ['blouse', 'shirt', 'casual', 'comfortable', 'smart', 'office', 'polo', 'pullover', 'jumper', 'blazer', 'vest', 'gilet', 'coat', 'knit'],
        'exclude_keywords': ['bikini', 'swimwear', 'sport', 'gym', 'beach', 'distressed', 'ripped'],
        'require_coverage': {'shoulders': 'covered'},
        'exclude_types': ['bikini', 'swimsuit', 'shorts'],
    },
    'business_meeting': {
        'description': 'Professional attire for business meetings',
        'include_types': ['blazer', 'dress', 'midi_dress', 'blouse', 'pants', 'skirt', 'shirt', 'sweater', 'coat', 'vest'],
        'include_keywords': ['blazer', 'suit', 'formal', 'professional', 'tailored', 'elegant', 'shirt', 'coat', 'vest'],
        'exclude_keywords': ['crop', 'mini', 'shorts', 'tank', 'bikini', 'sport', 'gym', 'beach'],
        'require_coverage': {'shoulders': 'covered'},
        'min_price': 1500,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'mini_dress', 'jeans'],
    },
    'interview': {
        'description': 'Conservative professional attire for job interviews',
        'include_types': ['blazer', 'dress', 'midi_dress', 'blouse', 'pants', 'skirt', 'shirt', 'sweater', 'coat', 'vest'],
        'include_keywords': ['blazer', 'suit', 'formal', 'professional', 'classic', 'conservative', 'shirt', 'coat', 'vest'],
        'exclude_keywords': ['crop', 'mini', 'shorts', 'tank', 'bikini', 'sport', 'gym', 'bright', 'loud'],
        'require_coverage': {'shoulders': 'covered'},
        'include_colors': ['Black', 'Navy', 'Grey', 'White', 'Beige', 'Charcoal', 'Brown', 'Olive'],
        'min_price': 1500,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'mini_dress', 'jeans'],
    },
    'presentation': {
        'description': 'Professional attire for presentations and public speaking',
        'include_types': ['blazer', 'dress', 'midi_dress', 'blouse', 'pants', 'skirt', 'shirt', 'sweater', 'coat', 'vest'],
        'include_keywords': ['blazer', 'suit', 'formal', 'professional', 'structured', 'polished', 'shirt', 'coat', 'vest'],
        'exclude_keywords': ['crop', 'mini', 'shorts', 'tank', 'bikini', 'sport', 'gym'],
        'require_coverage': {'shoulders': 'covered'},
        'min_price': 1200,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'mini_dress'],
    },

    # =========================================
    # Social & Events (7)
    # =========================================
    'date': {
        'description': 'Romantic and feminine attire for dates',
        'include_types': ['dress', 'midi_dress', 'mini_dress', 'blouse', 'skirt', 'top'],
        'include_keywords': ['dress', 'elegant', 'romantic', 'pretty', 'cute', 'feminine', 'floral', 'lace'],
        'exclude_keywords': ['sport', 'gym', 'swimwear', 'pajama', 'work', 'office'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer'],
    },
    'party': {
        'description': 'Fun and stylish party wear',
        'include_types': ['dress', 'mini_dress', 'top', 'jumpsuit', 'skirt'],
        'include_keywords': ['party', 'sequin', 'glitter', 'sparkle', 'cocktail', 'evening', 'night', 'shiny', 'metallic'],
        'include_materials': ['sequin', 'satin', 'silk', 'velvet', 'metallic', 'chiffon'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer', 'coat'],
    },
    'clubbing': {
        'description': 'Bold and trendy clubwear',
        'include_types': ['dress', 'mini_dress', 'top', 'skirt', 'jumpsuit'],
        'include_keywords': ['party', 'sequin', 'glitter', 'sparkle', 'bodycon', 'tight', 'sexy', 'mini', 'crop', 'metallic'],
        'include_materials': ['sequin', 'satin', 'velvet', 'metallic', 'leather', 'latex'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer', 'coat', 'cardigan'],
        'exclude_keywords': ['office', 'work', 'formal', 'conservative'],
    },
    'dinner': {
        'description': 'Elegant dinner attire',
        'include_types': ['dress', 'midi_dress', 'blouse', 'pants', 'skirt', 'jumpsuit'],
        'include_keywords': ['dinner', 'elegant', 'evening', 'sophisticated', 'chic', 'refined'],
        'exclude_keywords': ['sport', 'gym', 'swimwear', 'beach', 'casual', 'distressed'],
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'jeans'],
        'min_price': 800,
    },
    'brunch': {
        'description': 'Stylish casual brunch attire',
        'include_types': ['dress', 'midi_dress', 'blouse', 'skirt', 'pants', 'top', 'shirt', 'sweater', 'cardigan', 'jeans'],
        'include_keywords': ['brunch', 'casual', 'chic', 'pretty', 'floral', 'light', 'fresh', 'polo', 'pullover', 'jumper'],
        'exclude_keywords': ['sport', 'gym', 'formal', 'evening', 'night'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer', 'coat'],
    },
    'concert': {
        'description': 'Comfortable and stylish concert attire',
        'include_types': ['top', 'jeans', 'pants', 'dress', 'skirt', 'shorts', 'shirt', 'sweater'],
        'include_keywords': ['casual', 'comfortable', 'cool', 'trendy', 'edgy', 'graphic', 'polo', 'tank', 'pullover', 'jumper'],
        'exclude_keywords': ['formal', 'office', 'work', 'business'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer'],
    },
    'wedding_guest': {
        'description': 'Elegant wedding guest attire',
        'include_types': ['dress', 'midi_dress', 'maxi_dress', 'jumpsuit'],
        'include_keywords': ['dress', 'elegant', 'formal', 'sophisticated', 'chic', 'floral', 'lace'],
        'include_materials': ['silk', 'chiffon', 'lace', 'organza', 'satin'],
        'exclude_keywords': ['bikini', 'swimwear', 'sport', 'gym', 'casual', 'distressed'],
        'exclude_colors': ['White', 'Ivory', 'Cream'],  # Don't upstage the bride
        'require_coverage': {'shoulders': 'covered'},
        'min_price': 1500,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'jeans', 't-shirt'],
    },

    # =========================================
    # Casual & Lifestyle (6)
    # =========================================
    'casual': {
        'description': 'Everyday casual wear',
        'include_types': ['top', 'jeans', 'pants', 'shorts', 'dress', 'skirt', 'shirt', 'blouse', 'sweater', 'cardigan'],
        'include_keywords': ['casual', 'comfortable', 'everyday', 'relaxed', 'easy', 'pullover', 'jumper', 'polo', 'tank', 'jegging'],
        'exclude_keywords': ['formal', 'evening', 'gala', 'wedding'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer'],
    },
    'cafe': {
        'description': 'Stylish cafe and coffee shop attire',
        'include_types': ['dress', 'blouse', 'skirt', 'jeans', 'top', 'pants', 'shirt', 'sweater', 'cardigan'],
        'include_keywords': ['dress', 'blouse', 'skirt', 'casual', 'cute', 'chic', 'pretty', 'polo', 'pullover', 'jumper'],
        'exclude_keywords': ['sport', 'gym', 'active', 'swimwear', 'formal', 'evening'],
        'price_range': [500, 20000],
        'exclude_types': ['bikini', 'swimsuit', 'blazer'],
    },
    'shopping': {
        'description': 'Comfortable and stylish shopping attire',
        'include_types': ['top', 'jeans', 'pants', 'dress', 'skirt', 'shorts', 'shirt', 'sweater', 'cardigan'],
        'include_keywords': ['casual', 'comfortable', 'easy', 'chic', 'trendy', 'polo', 'pullover', 'jumper', 'jegging', 'tank'],
        'exclude_keywords': ['formal', 'evening', 'gala'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer', 'coat'],
    },
    'travel': {
        'description': 'Comfortable and practical travel wear',
        'include_types': ['top', 'pants', 'jeans', 'dress', 'cardigan', 'jacket', 'sweater', 'shirt'],
        'include_keywords': ['comfortable', 'easy', 'travel', 'casual', 'versatile', 'wrinkle-free', 'pullover', 'jumper', 'polo', 'jegging'],
        'exclude_keywords': ['formal', 'evening', 'delicate', 'dry-clean'],
        'include_materials': ['cotton', 'jersey', 'stretch', 'knit'],
        'exclude_types': ['bikini', 'swimsuit'],
    },
    'beach': {
        'description': 'Beach and resort wear',
        'include_types': ['bikini', 'swimsuit', 'shorts', 'dress', 'top', 'maxi_dress'],
        'include_keywords': ['beach', 'swim', 'bikini', 'resort', 'summer', 'tropical', 'cover-up', 'linen'],
        'include_materials': ['linen', 'cotton', 'rayon', 'polyester', 'swim', 'quick-dry'],
        'exclude_keywords': ['formal', 'office', 'work', 'business', 'wool'],
    },
    'weekend': {
        'description': 'Relaxed weekend wear',
        'include_types': ['top', 'jeans', 'pants', 'shorts', 'dress', 'skirt', 'cardigan', 'sweater', 'shirt'],
        'include_keywords': ['casual', 'comfortable', 'relaxed', 'easy', 'weekend', 'pullover', 'jumper', 'polo', 'jegging', 'tank'],
        'exclude_keywords': ['formal', 'office', 'work', 'business', 'evening'],
        'exclude_types': ['bikini', 'swimsuit', 'blazer'],
    },

    # =========================================
    # Formal & Ceremonies (4)
    # =========================================
    'graduation': {
        'description': 'Elegant graduation ceremony attire',
        'include_types': ['dress', 'midi_dress', 'maxi_dress', 'blouse', 'skirt'],
        'include_keywords': ['dress', 'elegant', 'formal', 'sophisticated', 'classic'],
        'exclude_keywords': ['bikini', 'swimwear', 'sport', 'gym', 'casual', 'distressed'],
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'min_price': 1500,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'jeans'],
    },
    'gala': {
        'description': 'Glamorous gala and formal event attire',
        'include_types': ['dress', 'maxi_dress', 'midi_dress', 'jumpsuit'],
        'include_keywords': ['gala', 'evening', 'formal', 'elegant', 'glamorous', 'luxurious', 'sequin', 'silk', 'satin'],
        'include_materials': ['silk', 'satin', 'velvet', 'sequin', 'chiffon', 'organza', 'taffeta'],
        'min_price': 3000,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'jeans', 'top'],
    },
    'ceremony': {
        'description': 'Formal ceremony attire (awards, official events)',
        'include_types': ['dress', 'midi_dress', 'maxi_dress', 'blazer', 'blouse', 'skirt'],
        'include_keywords': ['formal', 'elegant', 'sophisticated', 'classic', 'ceremony'],
        'exclude_keywords': ['bikini', 'swimwear', 'sport', 'gym', 'casual', 'distressed'],
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'min_price': 2000,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'jeans'],
    },
    'funeral': {
        'description': 'Respectful funeral and mourning attire',
        'include_types': ['dress', 'midi_dress', 'blouse', 'pants', 'skirt', 'blazer'],
        'include_colors': ['Black', 'Navy', 'Charcoal', 'Dark'],
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'exclude_keywords': ['bright', 'colorful', 'party', 'sequin', 'sparkle', 'floral', 'print'],
        'exclude_colors': ['Red', 'Pink', 'Yellow', 'Orange', 'White', 'Gold'],
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'mini_dress'],
    },

    # =========================================
    # Thai Cultural (5)
    # =========================================
    'temple': {
        'description': 'Modest attire for Thai temple visits',
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'include_types': ['dress', 'midi_dress', 'maxi_dress', 'blouse', 'pants', 'skirt'],
        'exclude_keywords': ['crop', 'mini', 'shorts', 'tank', 'sleeveless', 'off-shoulder', 'strapless', 'bikini', 'swimwear', 'tight', 'bodycon'],
        'exclude_types': ['bikini', 'swimsuit', 'mini_dress', 'shorts', 'tank'],
    },
    'thai_wedding': {
        'description': 'Elegant Thai wedding guest attire',
        'include_types': ['dress', 'midi_dress', 'maxi_dress', 'blouse', 'skirt'],
        'include_keywords': ['elegant', 'formal', 'sophisticated', 'silk', 'lace', 'traditional'],
        'include_colors': ['Gold', 'Pink', 'Purple', 'Blue', 'Green', 'Red', 'Burgundy'],
        'exclude_colors': ['White', 'Ivory', 'Cream', 'Black'],  # Black is bad luck
        'require_coverage': {'shoulders': 'covered', 'knees': 'covered'},
        'min_price': 1500,
        'exclude_types': ['bikini', 'swimsuit', 'shorts', 'jeans'],
    },
    'songkran': {
        'description': 'Fun and practical Songkran festival attire',
        'include_types': ['top', 'shorts', 'dress', 'pants', 'shirt', 'jeans'],
        'include_keywords': ['casual', 'comfortable', 'light', 'quick-dry', 'colorful', 'polo', 'tank'],
        'include_materials': ['cotton', 'polyester', 'quick-dry', 'synthetic'],
        'include_colors': ['White', 'Blue', 'Pink', 'Multi', 'Floral', 'Yellow', 'Orange', 'Green'],
        'exclude_keywords': ['formal', 'silk', 'dry-clean', 'delicate'],
        'exclude_materials': ['silk', 'velvet', 'wool'],
        'exclude_types': ['blazer', 'coat', 'maxi_dress'],
    },
    'loy_krathong': {
        'description': 'Beautiful Loy Krathong festival attire',
        'include_types': ['dress', 'midi_dress', 'maxi_dress', 'blouse', 'skirt', 'top'],
        'include_keywords': ['dress', 'pretty', 'feminine', 'romantic', 'elegant', 'floral', 'thai', 'blouse'],
        'include_colors': ['Pink', 'Purple', 'Blue', 'Gold', 'Green', 'White', 'Lavender', 'Navy', 'Beige'],
        'exclude_keywords': ['sport', 'gym'],
        'exclude_types': ['bikini', 'swimsuit', 'shorts'],
    },
    'cny': {
        'description': 'Festive Chinese New Year attire',
        'include_types': ['dress', 'midi_dress', 'blouse', 'top', 'skirt', 'pants', 'shirt', 'sweater', 'cardigan'],
        'include_colors': ['Red', 'Gold', 'Pink', 'Orange', 'Burgundy', 'Coral', 'Maroon', 'Rose'],
        'exclude_colors': ['Black', 'White'],
        'include_keywords': ['festive', 'elegant', 'celebration', 'red', 'pink', 'gold'],
        'exclude_keywords': ['funeral', 'mourning'],
        'exclude_types': ['bikini', 'swimsuit'],
    },

    # =========================================
    # Active & Sports (3)
    # =========================================
    'sport': {
        'description': 'Athletic and sportswear',
        'include_types': ['top', 'shorts', 'pants', 'jacket'],
        'include_keywords': ['sport', 'athletic', 'active', 'gym', 'workout', 'fitness', 'running', 'training'],
        'include_materials': ['polyester', 'nylon', 'spandex', 'lycra', 'mesh', 'stretch', 'moisture-wicking', 'breathable'],
        'include_brands': ['ADIDAS', 'NIKE', 'PUMA', 'UNDER ARMOUR', 'REEBOK', 'NEW BALANCE', 'MARDI MERCREDI ACTIF'],
        'exclude_types': ['dress', 'skirt', 'blouse', 'blazer'],
    },
    'yoga': {
        'description': 'Comfortable yoga and pilates attire',
        'include_types': ['top', 'pants', 'shorts'],
        'include_keywords': ['yoga', 'pilates', 'stretch', 'comfortable', 'flexible', 'leggings'],
        'include_materials': ['stretch', 'spandex', 'cotton', 'breathable'],
        'include_brands': ['ADIDAS', 'NIKE', 'PUMA', 'LULULEMON', 'MARDI MERCREDI ACTIF'],
        'exclude_types': ['dress', 'skirt', 'blouse', 'blazer', 'jeans'],
    },
    'outdoor': {
        'description': 'Outdoor activity and adventure wear',
        'include_types': ['top', 'pants', 'shorts', 'jacket'],
        'include_keywords': ['outdoor', 'hiking', 'adventure', 'casual', 'comfortable', 'sporty'],
        'include_materials': ['cotton', 'polyester', 'nylon', 'quick-dry', 'breathable'],
        'exclude_keywords': ['formal', 'evening', 'delicate', 'silk'],
        'exclude_types': ['dress', 'skirt', 'blouse', 'blazer', 'heels'],
    },
}


def classify_product_occasions(product: dict) -> Dict[str, bool]:
    """
    Classify a product into applicable occasions based on rules.

    Args:
        product: Product dictionary with fields like product_name, price,
                 thaiContext, brand, etc. May include scraped attributes:
                 material, subcategory, color_from_page, sleeve_type, length_type

    Returns:
        Dictionary mapping occasion names to boolean values
    """
    occasions_result = {occasion: False for occasion in OCCASION_RULES.keys()}

    # Extract product info
    product_name = product.get('product_name', '').lower()
    price_str = product.get('price', '0')
    try:
        price = float(str(price_str).replace(',', ''))
    except (ValueError, TypeError):
        price = 0

    brand = product.get('brand', '').upper()

    # Get thaiContext coverage info
    thai_context = product.get('thaiContext', {})
    coverage = thai_context.get('coverage', {})
    shoulders = coverage.get('shoulders', 'unknown')
    knees = coverage.get('knees', 'unknown')

    # Get color - prioritize scraped color_from_page over name extraction
    color = product.get('color_from_page', '') or extract_color_from_name(product_name)

    # Get product type from name
    product_type = extract_product_type_from_name(product_name)

    # Get scraped attributes (all lowercase for matching)
    material = product.get('material', '').lower()
    subcategory = product.get('subcategory', '').lower()
    sleeve_type = product.get('sleeve_type', '').lower()
    length_type = product.get('length_type', '').lower()

    for occasion, rules in OCCASION_RULES.items():
        is_suitable = True
        score = 0

        # Check required coverage
        if 'require_coverage' in rules:
            req_cov = rules['require_coverage']
            if 'shoulders' in req_cov and shoulders != req_cov['shoulders']:
                is_suitable = False
                continue
            if 'knees' in req_cov and knees != req_cov['knees']:
                is_suitable = False
                continue

        # Check excluded types
        if 'exclude_types' in rules and product_type:
            if product_type in rules['exclude_types']:
                is_suitable = False
                continue

        # Check excluded keywords
        if 'exclude_keywords' in rules:
            if any(kw in product_name for kw in rules['exclude_keywords']):
                is_suitable = False
                continue

        # Check excluded colors
        if 'exclude_colors' in rules and color:
            if color in rules['exclude_colors']:
                is_suitable = False
                continue

        # Check minimum price
        if 'min_price' in rules:
            if price < rules['min_price']:
                is_suitable = False
                continue

        # Check price range
        if 'price_range' in rules:
            min_p, max_p = rules['price_range']
            if not (min_p <= price <= max_p):
                is_suitable = False
                continue

        # Positive matching - add score for matches
        # Check included types
        if 'include_types' in rules and product_type:
            if product_type in rules['include_types']:
                score += 2

        # Check included keywords
        if 'include_keywords' in rules:
            matches = sum(1 for kw in rules['include_keywords'] if kw in product_name)
            score += matches

        # Check included colors
        if 'include_colors' in rules and color:
            if color in rules['include_colors']:
                score += 2

        # Check included brands
        if 'include_brands' in rules:
            if brand in rules['include_brands']:
                score += 3

        # Check included materials (scraped attribute)
        if 'include_materials' in rules and material:
            material_matches = sum(1 for mat in rules['include_materials'] if mat in material)
            if material_matches > 0:
                score += 2 * material_matches  # +2 per material match

        # Subcategory validation (scraped attribute)
        # Boost score if Central.co.th categorization aligns with occasion
        if subcategory:
            subcategory_boost = 0

            # Evening/Formal occasions
            if occasion in ['gala', 'dinner', 'party', 'wedding_guest', 'ceremony']:
                if any(term in subcategory for term in ['evening', 'formal', 'gala', 'cocktail', 'party']):
                    subcategory_boost = 3

            # Work/Professional occasions
            elif occasion in ['work_formal', 'business_meeting', 'interview', 'presentation']:
                if any(term in subcategory for term in ['blazer', 'suit', 'office', 'business', 'professional']):
                    subcategory_boost = 3

            # Active/Sports occasions
            elif occasion in ['sport', 'yoga', 'outdoor']:
                if any(term in subcategory for term in ['active', 'sport', 'athletic', 'gym', 'yoga', 'outdoor']):
                    subcategory_boost = 3

            # Casual occasions
            elif occasion in ['casual', 'cafe', 'shopping', 'weekend', 'travel']:
                if any(term in subcategory for term in ['casual', 'everyday', 'basic', 'tee', 'top']):
                    subcategory_boost = 2

            # Beach/Resort occasions
            elif occasion == 'beach':
                if any(term in subcategory for term in ['swim', 'beach', 'resort', 'bikini']):
                    subcategory_boost = 3

            score += subcategory_boost

        # Sleeve type matching (scraped attribute)
        if sleeve_type:
            sleeve_boost = 0

            # Formal occasions prefer long sleeves or structured sleeves
            if occasion in ['work_formal', 'business_meeting', 'interview', 'presentation', 'ceremony', 'funeral']:
                if sleeve_type in ['long', 'short', '3/4']:
                    sleeve_boost = 1

            # Temple/conservative occasions require covered shoulders
            elif occasion in ['temple', 'thai_wedding', 'graduation']:
                if sleeve_type in ['long', 'short', '3/4', 'cap']:
                    sleeve_boost = 1

            # Party/clubbing can use any sleeve including sleeveless
            elif occasion in ['party', 'clubbing', 'date']:
                if sleeve_type in ['sleeveless', 'strapless', 'off-shoulder']:
                    sleeve_boost = 1

            score += sleeve_boost

        # Length type matching (scraped attribute)
        if length_type:
            length_boost = 0

            # Formal occasions prefer midi/maxi lengths
            if occasion in ['gala', 'ceremony', 'graduation', 'thai_wedding', 'wedding_guest']:
                if length_type in ['midi', 'maxi', 'floor', 'knee']:
                    length_boost = 1

            # Party/clubbing often use mini lengths
            elif occasion in ['party', 'clubbing', 'date']:
                if length_type in ['mini', 'crop']:
                    length_boost = 1

            # Work formal prefers knee/midi
            elif occasion in ['work_formal', 'business_meeting', 'interview', 'presentation']:
                if length_type in ['knee', 'midi']:
                    length_boost = 1

            score += length_boost

        # Determine final suitability
        # If there are positive criteria, require at least some matches
        has_positive_criteria = any(
            key.startswith('include_') for key in rules.keys()
        )

        if has_positive_criteria:
            # Need at least 1 positive match
            if score >= 1 and is_suitable:
                occasions_result[occasion] = True
        else:
            # No positive criteria - just need to pass negative filters
            if is_suitable:
                occasions_result[occasion] = True

    return occasions_result


def extract_color_from_name(product_name: str) -> Optional[str]:
    """Extract color from product name."""
    colors = [
        'Blue', 'Black', 'White', 'Red', 'Pink', 'Green', 'Yellow',
        'Brown', 'Grey', 'Gray', 'Beige', 'Navy', 'Purple', 'Orange',
        'Cream', 'Gold', 'Silver', 'Burgundy', 'Olive', 'Khaki',
        'Coral', 'Mint', 'Teal', 'Maroon', 'Rose', 'Lavender',
        'Ivory', 'Tan', 'Nude', 'Blush', 'Peach', 'Charcoal',
        'Multi', 'Multicolor', 'Floral'
    ]

    color_pattern = r'\b(' + '|'.join(colors) + r')\b'
    match = re.search(color_pattern, product_name, re.IGNORECASE)

    if match:
        color = match.group(1).title()
        if color == 'Gray':
            return 'Grey'
        return color

    return None


def extract_product_type_from_name(product_name: str) -> Optional[str]:
    """Extract product type from product name."""
    name_lower = product_name.lower()

    # Order matters - more specific patterns first
    product_types = [
        ('mini dress', 'mini_dress'),
        ('midi dress', 'midi_dress'),
        ('maxi dress', 'maxi_dress'),
        ('jumpsuit', 'jumpsuit'),
        ('romper', 'romper'),
        ('blazer', 'blazer'),
        ('cardigan', 'cardigan'),
        ('pullover', 'sweater'),
        ('jumper', 'sweater'),
        ('sweater', 'sweater'),
        ('knitwear', 'sweater'),
        ('knit', 'sweater'),
        ('hoodie', 'sweater'),
        ('jacket', 'jacket'),
        ('coat', 'coat'),
        ('gilet', 'vest'),
        ('vest', 'vest'),
        ('blouse', 'blouse'),
        ('polo', 'shirt'),
        ('cottonhirt', 'shirt'),  # Common typo without space
        ('shirt', 'shirt'),
        ('thirt', 'shirt'),  # Common typo
        ('tshirt', 'top'),
        ('t-shirt', 'top'),
        ('tee', 'top'),
        ('tank', 'top'),
        ('camisole', 'top'),
        ('top', 'top'),
        ('bermuda', 'shorts'),
        ('pant', 'pants'),  # Singular form
        ('pants', 'pants'),
        ('trouser', 'pants'),
        ('trousers', 'pants'),
        ('legging', 'pants'),
        ('jegging', 'jeans'),
        ('jeans', 'jeans'),
        ('denim', 'jeans'),
        ('jean', 'jeans'),
        ('shorts', 'shorts'),
        ('short', 'shorts'),
        ('skirt', 'skirt'),
        ('straight leg', 'pants'),
        ('wide leg', 'pants'),
        ('ankle', 'pants'),
        ('dress', 'dress'),
        ('bikini', 'bikini'),
        ('swimsuit', 'swimsuit'),
        ('swimwear', 'swimsuit'),
    ]

    for pattern, ptype in product_types:
        if pattern in name_lower:
            return ptype

    return None


def get_occasion_distribution(products: List[dict]) -> Dict[str, int]:
    """
    Get distribution of occasions across products.

    Args:
        products: List of product dictionaries with occasions field

    Returns:
        Dictionary mapping occasion names to counts
    """
    counts = {occasion: 0 for occasion in OCCASION_RULES.keys()}

    for product in products:
        occasions = product.get('occasions', {})
        for occasion, is_suitable in occasions.items():
            if is_suitable:
                counts[occasion] += 1

    return counts


def validate_classification(products: List[dict]) -> dict:
    """
    Validate classification results.

    Args:
        products: List of classified products

    Returns:
        Validation report dictionary
    """
    total = len(products)
    no_occasion = []
    occasion_counts = get_occasion_distribution(products)

    for product in products:
        occasions = product.get('occasions', {})
        if not any(occasions.values()):
            no_occasion.append(product.get('product_name', 'Unknown'))

    return {
        'total_products': total,
        'products_with_no_occasion': len(no_occasion),
        'no_occasion_products': no_occasion[:10],  # First 10 examples
        'occasion_distribution': occasion_counts,
        'occasions_with_zero': [occ for occ, count in occasion_counts.items() if count == 0],
    }
