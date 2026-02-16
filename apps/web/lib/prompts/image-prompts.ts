/**
 * Image Generation Prompt Templates
 *
 * Centralised prompt module for all AI image generation features.
 * Every prompt follows Google Gemini 2.5 Flash Image best practices:
 *   - Narrative-descriptive paragraphs (no keyword lists)
 *   - Positive framing only (zero negative instructions)
 *   - Commercial safety context (e-commerce / fashion catalog / editorial)
 *   - Explicit aspect-ratio hint at the end of each prompt
 */

import type { FlatLayItem, BackgroundStyle, ImageConfig } from '@/lib/types/image-types';
import { normalizeColorToken } from '@/lib/utils/color-normalizer';

// ---------------------------------------------------------------------------
// Utility helpers (moved from image-generation-service.ts)
// ---------------------------------------------------------------------------

/**
 * Checks whether a string looks like a product name or SKU code.
 * Product names often contain brand names, SKU codes, or marketing text
 * that would cause the AI to render unwanted text labels on the image.
 */
export function containsProductNameOrSku(text: string): boolean {
  // Check for SKU-like patterns (alphanumeric codes)
  const skuPattern = /[A-Z]{2,}[0-9]{4,}|[0-9]{8,}/i;
  if (skuPattern.test(text)) return true;

  // Check for season/collection codes: AW24, SS25, RS25, FW24, PF24, CR25
  const seasonPattern = /\b(SS|AW|FW|RS|PF|CR)\d{2,4}\b/i;
  if (seasonPattern.test(text)) return true;

  // Check for common product name indicators
  const productNameIndicators = [
    /\b(online exclusive|limited edition|new arrival)\b/i,
    /\b(korea|korean|japan|japanese)\b/i, // Region markers often in product names
    /[A-Z][a-z]+[A-Z]/, // CamelCase brand names
    /\b\w{10,}\b/, // Very long words (likely brand names or codes)
  ];

  return productNameIndicators.some(pattern => pattern.test(text));
}

/**
 * Strips SKU codes and marketing text from a product name while preserving
 * descriptive words (color, material, style, brand).
 */
export function stripSkuFromText(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/\b[A-Z]{2,}[-]?\d{3,}\b/gi, '');
  cleaned = cleaned.replace(/\b\d{8,}\b/g, '');
  cleaned = cleaned.replace(/\b(online exclusive|limited edition|new arrival)\b/gi, '');
  cleaned = cleaned.replace(/\bProduct\b/gi, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned;
}

/**
 * Normalises a product category string to a clean, singular fashion term
 * suitable for use inside an image prompt.
 */
export function cleanCategoryForPrompt(category: string): string {
  const categoryMap: Record<string, string> = {
    'dress': 'Dress',
    'dresses': 'Dress',
    'top': 'Top',
    'tops': 'Top',
    'blouse': 'Blouse',
    'blouses': 'Blouse',
    'shirt': 'Shirt',
    'shirts': 'Shirt',
    'pants': 'Pants',
    'trousers': 'Pants',
    'skirt': 'Skirt',
    'skirts': 'Skirt',
    'jacket': 'Jacket',
    'jackets': 'Jacket',
    'blazer': 'Blazer',
    'blazers': 'Blazer',
    'coat': 'Coat',
    'coats': 'Coat',
    'sweater': 'Sweater',
    'sweaters': 'Sweater',
    'cardigan': 'Cardigan',
    'cardigans': 'Cardigan',
    'shoes': 'Shoes',
    'shoe': 'Shoes',
    'footwear': 'Shoes',
    'heels': 'Heels',
    'sneakers': 'Sneakers',
    'sandals': 'Sandals',
    'boots': 'Boots',
    'bag': 'Bag',
    'bags': 'Bag',
    'handbag': 'Handbag',
    'handbags': 'Handbag',
    'accessory': 'Accessory',
    'accessories': 'Accessory',
    'jewelry': 'Jewelry',
    'watch': 'Watch',
    'watches': 'Watch',
    'belt': 'Belt',
    'belts': 'Belt',
    'scarf': 'Scarf',
    'scarves': 'Scarf',
    'hat': 'Hat',
    'hats': 'Hat',
    'leggings': 'Leggings',
    'shorts': 'Shorts',
    'jeans': 'Jeans',
    'jumpsuit': 'Jumpsuit',
    'romper': 'Romper',
    'women_clothing': 'Clothing',
    'women clothing': 'Clothing',
    'men_clothing': 'Clothing',
    'men clothing': 'Clothing',
  };

  const lowerCategory = category.toLowerCase().trim();
  return categoryMap[lowerCategory] || category;
}

/**
 * Cleans a raw product name for use in AI image-generation prompts.
 * Strips noise (brand names, SKU codes, season codes, gender prefixes,
 * marketing/fit text) while preserving descriptive fashion words.
 */
export function cleanProductNameForPrompt(
  name: string,
  category: string,
  color: string,
): string {
  let cleaned = name;

  // 0. Strip season/collection codes: AW24, SS25, RS25, FW24, PF24, CR25
  cleaned = cleaned.replace(/\b(SS|AW|FW|RS|PF|CR|Pre-?Fall|Resort)\s*\d{2,4}\b/gi, '');

  // 1. Strip known brand names ANYWHERE in the string
  const brandNames = [
    'Giordano', 'Marksspenceronline', 'Marks Spencer', 'Marks & Spencer',
    'Nextphase', 'Next Phase', 'Harbour Blue', 'CK Calvin Klein', 'Calvin Klein',
    'Diane Von Furstenberg', 'Karl Lagerfeld', 'Uniqlo', 'H&M', 'Zara',
    'Pomelo', 'Jaspal', 'CPS Chaps', 'Greyhound', 'Sretsis', 'Kloset',
    'Soda', 'CC Double O', 'ESP', 'Issue', 'Lyn', 'Charles Keith',
    'Charles & Keith', 'Pedro', 'Aldo', 'Alaia', 'ASAVA', 'ASV', 'SHU',
    'Celebheels', 'Vatanika', 'Rapin', 'Disaya', 'Maison Kitsune',
    'Gentlewoman', 'Hooks', 'Milin', 'Poem', 'Sirivannavari', 'Vickteerut',
    'Sarisa', 'Tawn C', 'Tory Burch', 'Coach', 'Kate Spade', 'Michael Kors',
    'Marc Jacobs', 'Levi', 'Levis', "Levi's", 'Lumina',
  ];
  const sortedBrands = [...brandNames].sort((a, b) => b.length - a.length);
  for (const brand of sortedBrands) {
    const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    cleaned = cleaned.replace(re, '');
  }
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // 3. Strip generic gender/clothing prefixes
  cleaned = cleaned.replace(
    /^(Women\s*'?s?\s*Clothing|Women\s+S\b|Womens?\b|Men\s*'?s?\s*Clothing|Men\s+S\b|Mens?\b)\s*/i,
    '',
  );
  cleaned = cleaned.replace(/\bwomen\b|\bmen\b/gi, '');

  // 4. Strip SKU/model codes
  cleaned = stripSkuFromText(cleaned);
  cleaned = cleaned.replace(/\bModel\s+\S+/gi, '');

  // 5. Strip collection/line names
  cleaned = cleaned.replace(/\b(RTW|Rtw|Couture|Atelier|Collection)\b/gi, '');

  // 6. Strip marketing / fit text
  cleaned = cleaned.replace(
    /\b(Regular\s+Fit|Slim\s+Fit|Relaxed\s+Fit|Loose\s+Fit|Oversized\s+Fit|Easy\s+Fit|Fit\s+Flare|Online\s+Exclusive|Limited\s+Edition|New\s+Arrival)\b/gi,
    '',
  );

  // 7. Strip redundant colour words that match the `color` parameter
  if (color && color.trim()) {
    const compoundColorPrefixes = ['off', 'soft', 'dark', 'light', 'bright', 'deep', 'pale', 'midnight', 'royal', 'baby', 'dusty', 'burnt', 'ice'];
    for (const prefix of compoundColorPrefixes) {
      const escaped = color.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const compoundRe = new RegExp(`\\b${prefix}\\s+${escaped}\\b`, 'gi');
      cleaned = cleaned.replace(compoundRe, '');
    }
    const colorWords = color.trim().split(/\s+/);
    const fullColorEscaped = colorWords
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('\\s+');
    cleaned = cleaned.replace(new RegExp(`\\b${fullColorEscaped}\\b`, 'gi'), '');
    for (const cw of colorWords) {
      if (cw.length >= 3) {
        const escaped = cw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
      }
    }
  }

  // 8. Strip noise words
  cleaned = cleaned.replace(/\bJourney\b/gi, '');

  // 9. Collapse whitespace and trim
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // 10. Lowercase for prompt consistency
  cleaned = cleaned.toLowerCase();

  // 11. Fallback to category if empty
  if (!cleaned) {
    return category.toLowerCase();
  }

  return cleaned;
}

/**
 * Extracts the real color from a product name string.
 * Product names on Central.co.th typically end with the color,
 * e.g., "Stand Collar Blouse Regular Fit Off White"
 *
 * Uses word-boundary regex to prevent false positives like "tailored" matching "red".
 */
export function extractColorFromProductName(name: string): string | null {
  if (!name) return null;

  // Compound colors checked first (longer matches take priority)
  const compoundColors: Array<[string, string]> = [
    ['off white', 'Off White'],
    ['off-white', 'Off White'],
    ['soft green', 'Soft Green'],
    ['soft pink', 'Soft Pink'],
    ['soft blue', 'Soft Blue'],
    ['soft grey', 'Soft Gray'],
    ['soft gray', 'Soft Gray'],
    ['soft yellow', 'Soft Yellow'],
    ['soft white', 'Soft White'],
    ['soft black', 'Soft Black'],
    ['dark blue', 'Dark Blue'],
    ['dark green', 'Dark Green'],
    ['dark grey', 'Dark Gray'],
    ['dark gray', 'Dark Gray'],
    ['dark brown', 'Dark Brown'],
    ['dark red', 'Dark Red'],
    ['dark navy', 'Dark Navy'],
    ['light blue', 'Light Blue'],
    ['light pink', 'Light Pink'],
    ['light green', 'Light Green'],
    ['light grey', 'Light Gray'],
    ['light gray', 'Light Gray'],
    ['light brown', 'Light Brown'],
    ['navy blue', 'Navy Blue'],
    ['royal blue', 'Royal Blue'],
    ['baby blue', 'Baby Blue'],
    ['baby pink', 'Baby Pink'],
    ['dusty pink', 'Dusty Pink'],
    ['dusty rose', 'Dusty Rose'],
    ['dusty blue', 'Dusty Blue'],
    ['hot pink', 'Hot Pink'],
    ['deep red', 'Deep Red'],
    ['bright red', 'Bright Red'],
    ['bright blue', 'Bright Blue'],
    ['bright green', 'Bright Green'],
    ['stone mauve', 'Stone Mauve'],
    ['dusty amethyst', 'Dusty Amethyst'],
    ['pale pink', 'Pale Pink'],
    ['pale blue', 'Pale Blue'],
    ['powder blue', 'Powder Blue'],
    ['burnt orange', 'Burnt Orange'],
    ['ice blue', 'Ice Blue'],
    ['midnight blue', 'Midnight Blue'],
    ['forest green', 'Forest Green'],
    ['sage green', 'Sage Green'],
    ['moss green', 'Moss Green'],
    ['olive green', 'Olive Green'],
    ['wine red', 'Wine Red'],
    ['rose gold', 'Rose Gold'],
    ['champagne gold', 'Champagne Gold'],
  ];

  // Use word-boundary regex to avoid false positives
  for (const [keyword, color] of compoundColors) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(name)) return color;
  }

  // Single-word colors (word-boundary to prevent "tailored" -> "red", "blackberry" -> "black")
  const singleColors: Array<[string, string]> = [
    ['navy', 'Navy'],
    ['burgundy', 'Burgundy'],
    ['charcoal', 'Charcoal'],
    ['ivory', 'Ivory'],
    ['khaki', 'Khaki'],
    ['olive', 'Olive'],
    ['coral', 'Coral'],
    ['mint', 'Mint'],
    ['lavender', 'Lavender'],
    ['maroon', 'Maroon'],
    ['teal', 'Teal'],
    ['nude', 'Nude'],
    ['taupe', 'Taupe'],
    ['camel', 'Camel'],
    ['white', 'White'],
    ['black', 'Black'],
    ['red', 'Red'],
    ['blue', 'Blue'],
    ['green', 'Green'],
    ['yellow', 'Yellow'],
    ['pink', 'Pink'],
    ['orange', 'Orange'],
    ['purple', 'Purple'],
    ['gray', 'Gray'],
    ['grey', 'Gray'],
    ['beige', 'Beige'],
    ['brown', 'Brown'],
    ['cream', 'Cream'],
    ['gold', 'Gold'],
    ['silver', 'Silver'],
  ];

  for (const [keyword, color] of singleColors) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(name)) return color;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Spatial layout engine for flat-lay prompt generation
// ---------------------------------------------------------------------------

/** Size classification for layout positioning */
export type ItemSizeClass = 'large' | 'medium' | 'small';

/** Layout result for a single item */
export interface FlatLayLayoutEntry {
  item: FlatLayItem;
  position: string;
  sizeHint: string;
  presentationHint: string;
}

/**
 * Classifies a category string into a size class for layout positioning.
 * Case-insensitive and handles common plurals.
 */
function classifyItemSize(category: string): ItemSizeClass {
  const cat = category.toLowerCase().trim();

  const largeCategories = [
    'dress', 'dresses', 'top', 'tops', 'bottom', 'bottoms',
    'pants', 'trousers', 'outerwear', 'jacket', 'blazer', 'coat',
    'jumpsuit', 'romper', 'shirt', 'blouse', 'sweater', 'cardigan',
    'skirt', 'jeans', 'shorts', 'leggings',
  ];

  const mediumCategories = [
    'shoes', 'shoe', 'footwear', 'bag', 'bags', 'handbag', 'handbags',
    'boots', 'heels', 'sneakers', 'sandals',
  ];

  const smallCategories = [
    'accessory', 'accessories', 'jewelry', 'watch', 'belt',
    'scarf', 'scarves', 'hat', 'earrings', 'necklace',
    'bracelet', 'ring', 'sunglasses',
  ];

  if (largeCategories.includes(cat)) return 'large';
  if (mediumCategories.includes(cat)) return 'medium';
  if (smallCategories.includes(cat)) return 'small';

  // Default to medium for unknown categories
  return 'medium';
}

/**
 * Returns a presentation hint based on size class.
 * Items are laid flat and straight for a clean, professional flat-lay look.
 */
function getPresentationHint(size: ItemSizeClass, index: number): string {
  const largeHints = [
    'laid out fully open and unfolded showing the complete silhouette, placed straight and flat',
    'spread flat with sleeves and details fully visible, aligned neatly',
  ];
  const mediumHints = [
    'placed neatly near the center of the composition, facing straight up',
    'positioned cleanly alongside the main garment, facing forward',
  ];
  const smallHints = [
    'placed neatly as a styling accent, facing straight up',
    'set down cleanly beside the outfit pieces',
  ];

  switch (size) {
    case 'large':
      return largeHints[index % largeHints.length];
    case 'medium':
      return mediumHints[index % mediumHints.length];
    case 'small':
      return smallHints[index % smallHints.length];
  }
}

/**
 * Returns the layout pattern label for a given item count.
 * Uses organic, editorial descriptions instead of rigid grid names
 * so the AI generates a natural styled flat-lay, not a collage.
 */
function getLayoutPattern(count: number): string {
  if (count <= 3) return 'organic triangular grouping with the hero garment at top-center';
  if (count === 4) return 'styled editorial spread with the hero garment as the anchor piece';
  if (count === 5) return 'natural radial arrangement around the central hero garment';
  return 'editorial spread with items fanning outward from center';
}

/**
 * Returns position labels based on item count.
 * Uses organic placement language instead of rigid grid coordinates.
 */
function getPositionLabels(count: number): string[] {
  if (count <= 3) {
    return ['TOP-CENTER as hero piece', 'LOWER-LEFT tucked beside the hero', 'LOWER-RIGHT tucked beside the hero'];
  }
  if (count === 4) {
    return ['CENTER-LEFT as hero piece', 'CENTER-RIGHT beside the hero', 'LOWER-LEFT near the hero hem', 'LOWER-RIGHT as a finishing accent'];
  }
  if (count === 5) {
    return ['CENTER as hero piece', 'UPPER-LEFT near the neckline area', 'UPPER-RIGHT balancing the opposite side', 'LOWER-LEFT near the hem area', 'LOWER-RIGHT as a finishing accent'];
  }
  // 6+ items: editorial fan spread
  return ['CENTER-TOP as hero piece', 'UPPER-LEFT beside the hero', 'UPPER-RIGHT beside the hero', 'LOWER-LEFT near the bottom', 'LOWER-CENTER beneath the hero', 'LOWER-RIGHT as a finishing accent'];
}

const SIZE_ORDER: Record<ItemSizeClass, number> = { large: 0, medium: 1, small: 2 };

/**
 * Computes spatial layout positions for flat-lay items.
 * Sorts items by size (large -> medium -> small) and assigns positions
 * so that larger items occupy more prominent positions.
 */
export function computeFlatLayLayout(items: FlatLayItem[]): FlatLayLayoutEntry[] {
  if (items.length === 0) return [];

  // Classify and sort by size (large first)
  const classified = items.map((item, idx) => ({
    item,
    size: classifyItemSize(item.category),
    originalIndex: idx,
  }));

  classified.sort((a, b) => SIZE_ORDER[a.size] - SIZE_ORDER[b.size]);

  const positions = getPositionLabels(classified.length);

  return classified.map((entry, idx) => ({
    item: entry.item,
    position: positions[idx] || `POSITION-${idx + 1}`,
    sizeHint: entry.size,
    presentationHint: getPresentationHint(entry.size, idx),
  }));
}

// ---------------------------------------------------------------------------
// 1. Flat-lay prompt
// ---------------------------------------------------------------------------

/**
 * Builds a narrative flat-lay prompt from an array of outfit items.
 * Uses spatial layout positioning and anti-text instructions to keep the
 * generated image free of rendered text labels.
 */
export function buildFlatLayPrompt(
  items: FlatLayItem[],
  occasionContext?: string,
  hasReferenceImages?: boolean,
): string {
  const itemCount = items.length;
  const layout = computeFlatLayLayout(items);
  const layoutPattern = getLayoutPattern(itemCount);
  const occasionLabel = occasionContext || 'coordinated';
  const colorResolvedLayout = layout.map((entry) => ({
    ...entry,
    resolvedColor: resolvePromptColor(entry.item.color),
    cleanedCategory: cleanCategoryForPrompt(entry.item.category),
  }));

  // Build item descriptions with spatial positions
  const itemLines = colorResolvedLayout.map((entry) => {
    const colorInfo = entry.resolvedColor ? `${entry.resolvedColor} ` : '';
    let itemDesc: string;
    if (entry.item.visualDescription && !containsProductNameOrSku(entry.item.visualDescription)) {
      itemDesc = `${colorInfo}${entry.item.visualDescription}`;
    } else {
      itemDesc = `${colorInfo}${entry.cleanedCategory.toLowerCase()}`;
    }
    return `- ${entry.position} (${entry.sizeHint}): a ${itemDesc}, ${entry.presentationHint}`;
  }).join('\n');

  const colorMappedItems = colorResolvedLayout.filter((entry) => entry.resolvedColor);
  const colorConsistencySection = colorMappedItems.length > 0
    ? `\n\nColor fidelity map:\n${colorMappedItems
      .map((entry) => `- ${entry.position}: ${entry.cleanedCategory.toLowerCase()} in ${entry.resolvedColor}`)
      .join('\n')}\nKeep each item's hue and tone aligned with this map for consistent styling.`
    : '';

  const garmentPattern = /\b(dress|top|shirt|blouse|pants|trouser|skirt|jacket|blazer|coat|outerwear|cardigan|sweater|jumpsuit|romper|เดรส|เสื้อ|กางเกง|กระโปรง|แจ็กเก็ต)\b/i;
  const footwearPattern = /\b(shoes?|footwear|heels?|sandals?|sneakers?|boots?|รองเท้า)\b/i;
  const bagPattern = /\b(bag|handbag|clutch|tote|crossbody|กระเป๋า)\b/i;
  const jewelryPattern = /\b(jewelry|earrings?|necklace|bracelet|ring|watch|เครื่องประดับ|นาฬิกา)\b/i;
  const garmentEntries = colorResolvedLayout.filter((entry) =>
    garmentPattern.test(`${entry.cleanedCategory} ${entry.item.category || ''}`)
  );
  const garmentCategories = Array.from(
    new Set(garmentEntries.map((entry) => entry.cleanedCategory.toLowerCase()))
  );
  const hasOuterwearInManifest = garmentEntries.some((entry) =>
    /\b(jacket|blazer|coat|cardigan|outerwear|แจ็กเก็ต|เสื้อคลุม)\b/i.test(
      `${entry.cleanedCategory} ${entry.item.category || ''} ${entry.item.name || ''}`
    )
  );
  const familyCounts = colorResolvedLayout.reduce(
    (acc, entry) => {
      const source = `${entry.cleanedCategory} ${entry.item.category || ''} ${entry.item.name || ''} ${entry.item.visualDescription || ''}`;
      if (garmentPattern.test(source)) {
        acc.garment += 1;
      } else if (footwearPattern.test(source)) {
        acc.footwear += 1;
      } else if (bagPattern.test(source)) {
        acc.bag += 1;
      } else if (jewelryPattern.test(source)) {
        acc.jewelry += 1;
      } else {
        acc.accessory += 1;
      }
      return acc;
    },
    { garment: 0, footwear: 0, bag: 0, jewelry: 0, accessory: 0 }
  );
  const itemManifestSection = `\n\nLocked item manifest:\n${colorResolvedLayout
    .map((entry, index) => {
      const descriptor = `${entry.resolvedColor ? `${entry.resolvedColor} ` : ''}${entry.cleanedCategory.toLowerCase()}`.trim();
      return `- #${index + 1}: ${descriptor} (${entry.position})`;
    })
    .join('\n')}`;
  const garmentLockSection = garmentCategories.length > 0
    ? `\nGarment scope lock:\n- Allowed garment categories in this look: ${garmentCategories.join(', ')}.\n- Do not introduce any additional garment category outside this list.\n- If only one garment category is listed, keep the image to a single main garment piece and style it only with listed footwear/accessories.`
    : '';
  const singleGarmentLockSection = familyCounts.garment === 1
    ? `\nSingle garment lock:\n- Render exactly ONE garment piece total.\n- Do not add a second clothing piece (no blazer, jacket, coat, cardigan, top, bottom, or layered garment).`
    : '';
  const noOuterwearSection = familyCounts.garment > 0 && !hasOuterwearInManifest
    ? `\nOuterwear exclusion lock:\n- This look has NO outerwear in the manifest.\n- Do NOT render any blazer, jacket, coat, cardigan, suit, or extra layer garment.`
    : '';
  const quantityLockSection = `\nQuantity lock:\n- Total visible items must be exactly ${itemCount}.\n- Each manifest entry appears exactly once (no substitutes, no duplicates).\n- Garments: exactly ${familyCounts.garment}.\n- Footwear pairs: exactly ${familyCounts.footwear}.\n- Bags: exactly ${familyCounts.bag}.\n- Jewelry items: exactly ${familyCounts.jewelry}.\n- Other accessories: exactly ${familyCounts.accessory}.`;

  let prompt = `Generate a single cohesive professional overhead flat-lay photograph styled like a fashion magazine editorial. NO text, labels, watermarks, or written words anywhere in the image. Products only: NO people, NO mannequin, NO body parts, NO hands, NO feet, NO face. All ${itemCount} fashion items are arranged together on ONE continuous clean light grey-white studio surface as a ${occasionLabel} outfit. This must look like ONE styled photograph, not a collage or grid of separate images. The composition is a ${layoutPattern}:\n${itemLines}\nItems are placed with natural, organic spacing. Edges of adjacent items may slightly overlap or touch to create a cohesive, styled grouping. Every item is laid perfectly flat and straight, viewed from directly above. All ${itemCount} items are fully visible within the frame. Preserve true product colors and textures, avoid overexposure, avoid blown highlights, avoid washed-out whites. Photographed from directly overhead with soft, diffused studio lighting casting gentle shadows beneath items. Professional fashion editorial flat-lay photography quality.

CRITICAL ITEM LOCK:
- The item list above is exhaustive and locked.
- Render EXACTLY ${itemCount} items and NOTHING ELSE.
- NEVER add extra garments, duplicate dresses/tops/bottoms, or alternative outfits.
- If uncertain about an item detail, keep the silhouette simple but do not invent new clothing pieces.${itemManifestSection}${garmentLockSection}${singleGarmentLockSection}${noOuterwearSection}${quantityLockSection}${colorConsistencySection} Square 1:1 format.`;

  // Append reference image mapping instructions when multi-modal images are provided
  if (hasReferenceImages) {
    const itemsWithImages = colorResolvedLayout.filter(entry => entry.item.thumbnailUrl?.startsWith('https://')).slice(0, 5);
    if (itemsWithImages.length > 0) {
      const imageMapping = itemsWithImages.map((entry, idx) => {
        const colorInfo = entry.resolvedColor ? `${entry.resolvedColor} ` : '';
        return `- Reference Image ${idx + 1} shows the ${colorInfo}${entry.cleanedCategory.toLowerCase()} at ${entry.position}`;
      }).join('\n');

      prompt += `\n\nReference product images are provided below in order. Match the exact color, pattern, texture, and silhouette from each reference image:\n${imageMapping}`;
    }
  }

  return prompt;
}

function resolvePromptColor(color?: string): string | null {
  if (!color || !color.trim()) {
    return null;
  }

  const raw = color.trim().toLowerCase();
  const canonical = normalizeColorToken(color);
  if (canonical) {
    // Keep explicit Latin color phrases (e.g., "navy blue", "burgundy")
    // to preserve shade specificity. Convert non-Latin aliases via canonical config.
    if (/[a-z]/i.test(raw)) {
      return raw;
    }
    return canonical.toLowerCase();
  }

  return raw;
}

// ---------------------------------------------------------------------------
// 2. Fashion / outfit prompt
// ---------------------------------------------------------------------------

/**
 * Builds a narrative fashion-outfit prompt for model-worn imagery.
 */
export function buildFashionPrompt(
  description: string,
  options?: {
    photographyStyle?: string;
    composition?: string;
    lighting?: string;
    aestheticContext?: string;
  },
): string {
  const photographyStyle = options?.photographyStyle || 'editorial fashion';
  const composition = options?.composition || 'full-body model shoot';
  const lighting = options?.lighting || 'studio';
  const aesthetic = options?.aestheticContext || 'modern international';

  return `A professional fashion editorial photograph of a real person wearing the following outfit: ${description}. The shot is composed as a ${composition} in ${photographyStyle} style with ${lighting} lighting that produces clean, even illumination and accurate colour reproduction. The background is minimal and uncluttered, letting the outfit remain the focal point. The overall aesthetic is ${aesthetic} fashion with an elegant, contemporary Thai sensibility. Every garment detail is rendered with sharp focus and true-to-life colour, meeting the standard expected of high-end fashion e-commerce product photography. Portrait 3:4 format.`;
}

// ---------------------------------------------------------------------------
// 3. Fitting model prompt (reference-based)
// ---------------------------------------------------------------------------

/**
 * Returns the narrative prompt for generating a fitting model from a
 * user's reference photo. The model wears a standard outfit
 * (white crop top + black shorts, barefoot).
 */
export function buildFittingModelPrompt(): string {
  return `A professional e-commerce fashion catalog photograph of a person matching the reference image exactly. The model stands in a symmetrical forward-facing pose with arms relaxed at sides and feet together, wearing a white spaghetti strap crop top paired with black high-waisted legging shorts, barefoot. The face, skin tone, hair, and body proportions are a precise match to the reference photo with no idealization or modification. The setting is a pure white infinity cove studio backdrop with bright, high-key front-facing softbox lighting that creates a clean, cutout-ready image with no visible floor, ground, or shadows on the backdrop. Professional product photography standard with sharp detail and accurate skin tone reproduction. Portrait 3:4 format.`;
}

// ---------------------------------------------------------------------------
// 4. Mystery model prompt (no reference photo)
// ---------------------------------------------------------------------------

/**
 * Returns the narrative prompt for generating a default "mystery" fitting
 * model when the user has not uploaded a reference photo.
 */
export function buildMysteryModelPrompt(): string {
  return `A professional e-commerce fashion catalog photograph of a young Thai woman with warm brown eyes, soft natural makeup, and shoulder-length straight black hair. She stands in a symmetrical forward-facing pose with arms relaxed at sides and feet together, wearing a white spaghetti strap crop top paired with black high-waisted legging shorts, barefoot. Her expression is friendly and confident with a natural, approachable beauty. The setting is a pure white infinity cove studio backdrop with bright, high-key front-facing softbox lighting that creates a clean, cutout-ready image with no visible floor, ground, or shadows on the backdrop. Professional product photography standard with sharp detail and accurate skin tone reproduction. Portrait 3:4 format.`;
}

// ---------------------------------------------------------------------------
// 5. Try-on prompt (single reference)
// ---------------------------------------------------------------------------

/**
 * Builds a narrative try-on prompt for showing an outfit on the user's
 * fitting model, given a single reference image.
 */
export function buildTryOnPrompt(
  items: Array<{ name: string; category?: string }>,
  outfitTitle?: string,
): string {
  const formatted = items
    .map((item) => item.name)
    .join(', ');

  const titleContext = outfitTitle ? ` (${outfitTitle})` : '';

  return `A professional e-commerce fashion catalog photograph of the person from the reference image wearing ${formatted}${titleContext}. The model's face, skin tone, hair, and body proportions are preserved exactly from the reference. The model stands in a confident forward-facing pose with feet together, filling 90-95% of the vertical frame. The outfit drapes naturally on the body with realistic fabric behavior, accurate colours, and proper layering. Set against a pure white infinity cove studio backdrop with high-key softbox lighting and no visible floor, ground, or backdrop shadows. Clean, cutout-ready product photo quality. Portrait 3:4 format.`;
}

// ---------------------------------------------------------------------------
// 6. Dual-reference try-on prompt (fitting model + flat-lay)
// ---------------------------------------------------------------------------

/**
 * Builds a narrative try-on prompt that references two images:
 *   IMAGE 1 — the user's fitting model (face/body)
 *   IMAGE 2 — the flat-lay showing the exact outfit items
 */
export function buildDualReferenceTryOnPrompt(
  items: Array<{ name: string; category?: string }>,
  outfitTitle?: string,
): string {
  const formatted = items
    .map((item) => item.name)
    .join(', ');

  const titleContext = outfitTitle ? ` (${outfitTitle})` : '';

  return `Transfer all fashion items from IMAGE 2 onto the person shown in IMAGE 1, creating a professional e-commerce fashion catalog photograph. The person's face, skin tone, hair, and body proportions from IMAGE 1 are preserved exactly. The model fills 90-95% of the vertical frame in a centred full-body standing pose. Every garment, accessory, and footwear piece visible in IMAGE 2 appears on the model with accurate colours, natural fabric draping, realistic shadows, and proper layering depth. Set against a pure white infinity cove studio backdrop with matching high-key softbox lighting and no visible floor or backdrop shadows. Items being shown: ${formatted}${titleContext}. Portrait 3:4 format.`;
}

// ---------------------------------------------------------------------------
// 7. Background prompts for hybrid flat-lay
// ---------------------------------------------------------------------------

const NARRATIVE_BACKGROUND_PROMPTS: Record<BackgroundStyle, string> = {
  'white-clean':
    'A pure white seamless surface photographed from directly overhead for flat-lay product photography. The surface is completely flat, solid white, and uniformly lit with soft diffused studio lighting that produces absolutely even illumination. The frame is entirely empty with a pristine, distraction-free finish suitable for premium e-commerce fashion imagery. Square 1:1 format.',

  'marble-white':
    'A luxurious white Carrara marble surface photographed from directly overhead for flat-lay fashion product photography. The surface features subtle natural grey veining patterns that evoke a quiet-luxury aesthetic. The marble is clean, smooth, and completely empty, styled as a premium backdrop for high-end fashion items. Soft diffused studio lighting creates even illumination across the entire surface. Square 1:1 format.',

  'marble-grey':
    'A polished grey marble surface with elegant white veining photographed from directly overhead for flat-lay fashion product photography. The tone is refined and professional, evoking a corporate-chic atmosphere suited to business and formalwear styling. The surface is completely empty and evenly lit with soft studio lighting that preserves the natural stone texture. Square 1:1 format.',

  'wood-light':
    'A light blonde oak wood grain surface photographed from directly overhead for flat-lay fashion product photography. The grain runs in gentle, natural lines with a warm Scandinavian feel that complements organic and bohemian fashion aesthetics. The surface is clean, completely empty, and lit with soft, even studio lighting that highlights the subtle wood texture. Square 1:1 format.',

  'wood-dark':
    'A rich dark walnut wood surface photographed from directly overhead for flat-lay fashion product photography. The deep, warm tones and refined grain create a dark-academia, scholarly library aesthetic. The surface is smooth, completely empty, and illuminated with soft diffused studio lighting that brings out the wood\'s natural depth. Square 1:1 format.',

  'linen-natural':
    'A natural undyed linen fabric surface photographed from directly overhead for flat-lay fashion product photography. The weave has a soft, organic texture in warm beige and cream tones, conveying a clean-girl effortless aesthetic. The fabric lies perfectly flat with a smooth finish and is completely empty, lit with gentle diffused studio lighting. Square 1:1 format.',

  'linen-grey':
    'A cool-toned grey linen fabric surface photographed from directly overhead for flat-lay fashion product photography. The subtle weave pattern creates a contemporary casual-chic backdrop with modern understated elegance. The fabric lies perfectly flat and smooth, completely empty, with even diffused studio lighting that preserves the textile detail. Square 1:1 format.',
};

/**
 * Returns a narrative background prompt for the given style.
 * Falls back to `white-clean` for unrecognised styles.
 */
export function buildBackgroundPrompt(style: BackgroundStyle): string {
  return NARRATIVE_BACKGROUND_PROMPTS[style] || NARRATIVE_BACKGROUND_PROMPTS['white-clean'];
}

// ---------------------------------------------------------------------------
// 10. Default image config
// ---------------------------------------------------------------------------

/**
 * Returns sensible default ImageConfig values (primarily aspect ratio)
 * for a given generation type.
 */
export function getDefaultImageConfig(generationType: string): ImageConfig {
  switch (generationType) {
    case 'flat-lay':
    case 'hybrid-flat-lay':
      return { aspect_ratio: '1:1' };
    case 'fitting-model':
    case 'try-on':
    case 'try-on-dual':
    case 'outfit':
    default:
      return { aspect_ratio: '3:4' };
  }
}
