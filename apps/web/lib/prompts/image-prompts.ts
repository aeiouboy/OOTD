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
  };

  const lowerCategory = category.toLowerCase().trim();
  return categoryMap[lowerCategory] || category;
}

// ---------------------------------------------------------------------------
// 1. Flat-lay prompt
// ---------------------------------------------------------------------------

/**
 * Builds a narrative flat-lay prompt from an array of outfit items.
 * Uses only generic category + colour descriptions to keep the generated
 * image free of rendered text labels.
 */
export function buildFlatLayPrompt(
  items: FlatLayItem[],
  occasionContext?: string,
): string {
  const itemDescriptions = items
    .map((item) => {
      // Prefer a clean visual description when available
      if (item.visualDescription && !containsProductNameOrSku(item.visualDescription)) {
        return `a ${item.category.toLowerCase()} described as ${item.visualDescription}`;
      }
      // Fallback to category + colour only
      const colorInfo = item.color ? `${item.color} ` : '';
      const clean = cleanCategoryForPrompt(item.category);
      return `a ${colorInfo}${clean.toLowerCase()}`;
    })
    .join(', ');

  const itemCount = items.length;
  const occasionLine = occasionContext ? ` Styled for ${occasionContext}.` : '';

  return `A high-resolution, studio-lit flat-lay photograph showing ${itemCount} fashion items arranged as a single coordinated outfit on a pristine white surface. The items are: ${itemDescriptions}. The composition uses balanced spacing with each piece clearly visible and proportionally sized. Photographed from directly overhead with soft, diffused three-point lighting that eliminates harsh shadows and preserves accurate colours. Professional e-commerce product photography quality with sharp focus across all items. Clean, minimal styling typical of luxury fashion editorial flat-lay.${occasionLine} Square 1:1 format.`;
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
