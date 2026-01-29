/**
 * Hybrid Flat-Lay Service
 * Orchestrates the generation of Pinterest-quality flat-lay images
 * by combining AI-generated backgrounds with real product images.
 *
 * Pipeline:
 * 1. Generate AI background (textured based on aesthetic)
 * 2. Fetch & process product images (parallel)
 * 3. Composite products onto background
 * 4. Return final image
 */

import type {
  FlatLayItem,
  BackgroundStyle,
  UserAesthetic,
  HybridFlatLayRequest,
  HybridFlatLayResponse,
} from '@/lib/types/image-types';
import { processProductImagesParallel } from '@/lib/utils/product-image-processor';
import {
  compositeImages,
  createWhiteBackground,
  base64ToBuffer,
  bufferToBase64,
} from '@/lib/utils/image-compositor';
import { OpenRouterImageClient } from './image-generation-service';

/**
 * Default canvas dimensions for hybrid flat-lay
 */
const DEFAULT_CANVAS = {
  width: 1024,
  height: 1024,
};

/**
 * Maps user aesthetics to appropriate background styles
 */
const AESTHETIC_TO_BACKGROUND: Record<UserAesthetic, BackgroundStyle> = {
  'clean-girl': 'linen-natural',
  'quiet-luxury': 'marble-white',
  'corporate-chic': 'marble-grey',
  'dark-academia': 'wood-dark',
  'scandinavian-minimal': 'white-clean',
  'casual-chic': 'linen-grey',
  'bohemian': 'wood-light',
  'streetwear': 'white-clean',
  'romantic': 'linen-natural',
};

/**
 * Background style to AI prompt mapping
 */
const BACKGROUND_PROMPTS: Record<BackgroundStyle, string> = {
  'white-clean': `
Generate a pure white background image for flat-lay photography.
REQUIREMENTS:
- Completely flat, solid white background (#FFFFFF)
- No textures, patterns, or variations
- No shadows or gradients
- Perfect for product photography
- Square format (1:1 aspect ratio)
- Completely empty, no objects or elements
`.trim(),

  'marble-white': `
Generate a luxurious white marble texture background for flat-lay fashion photography.
REQUIREMENTS:
- Elegant white Carrara marble surface
- Subtle grey veining patterns
- Soft, sophisticated look
- High-end luxury aesthetic
- Square format (1:1 aspect ratio)
- Clean surface with no objects
- Perfect for quiet-luxury fashion styling
`.trim(),

  'marble-grey': `
Generate a sophisticated grey marble texture background for flat-lay fashion photography.
REQUIREMENTS:
- Refined grey marble surface
- Elegant dark veining patterns
- Professional, corporate aesthetic
- Timeless and sophisticated look
- Square format (1:1 aspect ratio)
- Clean surface with no objects
- Perfect for business fashion styling
`.trim(),

  'wood-light': `
Generate a natural light wood texture background for flat-lay fashion photography.
REQUIREMENTS:
- Warm, light oak or birch wood surface
- Natural wood grain patterns
- Organic, natural aesthetic
- Soft, inviting warmth
- Square format (1:1 aspect ratio)
- Clean surface with no objects
- Perfect for bohemian or natural fashion styling
`.trim(),

  'wood-dark': `
Generate a rich dark wood texture background for flat-lay fashion photography.
REQUIREMENTS:
- Deep walnut or mahogany wood surface
- Sophisticated dark wood grain
- Dark academia aesthetic
- Scholarly, refined atmosphere
- Square format (1:1 aspect ratio)
- Clean surface with no objects
- Perfect for dark academia fashion styling
`.trim(),

  'linen-natural': `
Generate a natural linen fabric texture background for flat-lay fashion photography.
REQUIREMENTS:
- Soft, natural linen texture
- Warm beige/cream color
- Clean-girl aesthetic
- Fresh, organic feel
- Square format (1:1 aspect ratio)
- Flat surface with no folds or wrinkles
- Perfect for effortless chic fashion styling
`.trim(),

  'linen-grey': `
Generate a sophisticated grey linen fabric texture background for flat-lay fashion photography.
REQUIREMENTS:
- Elegant grey linen texture
- Subtle weave pattern
- Casual-chic aesthetic
- Modern, understated elegance
- Square format (1:1 aspect ratio)
- Flat surface with no folds or wrinkles
- Perfect for casual everyday fashion styling
`.trim(),
};

/**
 * Maps user aesthetic to background style
 *
 * @param aesthetic - User's aesthetic preference
 * @returns Appropriate background style
 */
export function mapAestheticToBackground(aesthetic?: UserAesthetic): BackgroundStyle {
  if (!aesthetic) {
    return 'white-clean';
  }
  return AESTHETIC_TO_BACKGROUND[aesthetic] || 'white-clean';
}

/**
 * Builds the AI prompt for background generation
 *
 * @param style - Background style to generate
 * @returns Prompt string for AI generation
 */
export function buildBackgroundPrompt(style: BackgroundStyle): string {
  return BACKGROUND_PROMPTS[style] || BACKGROUND_PROMPTS['white-clean'];
}

/**
 * Generates a textured background using AI
 *
 * @param style - Background style to generate
 * @param apiKey - OpenRouter API key
 * @returns Promise resolving to background image buffer
 */
async function generateAIBackground(
  style: BackgroundStyle,
  apiKey: string
): Promise<Buffer> {
  const prompt = buildBackgroundPrompt(style);

  console.log(`[HybridFlatLay] Generating ${style} background...`);

  const client = new OpenRouterImageClient(apiKey);

  // Make request using the existing flat-lay method which handles image generation
  const response = await client.generateOutfitImage(prompt, {
    composition: 'flat-lay',
    lighting: 'studio',
    photographyStyle: 'product',
  });

  if (!response.success || !response.imageBase64) {
    throw new Error(response.error || 'Failed to generate background');
  }

  console.log(`[HybridFlatLay] Background generated successfully`);

  return base64ToBuffer(response.imageBase64);
}

/**
 * Main entry point for hybrid flat-lay generation
 * Orchestrates the full pipeline from background to composite
 *
 * @param request - Hybrid flat-lay request
 * @param apiKey - OpenRouter API key for background generation
 * @returns Promise resolving to hybrid flat-lay response
 */
export async function generateHybridFlatLay(
  request: HybridFlatLayRequest,
  apiKey: string
): Promise<HybridFlatLayResponse> {
  const startTime = Date.now();
  const response: HybridFlatLayResponse = {
    success: false,
    processedProducts: [],
    failedProducts: [],
  };

  try {
    const { items, backgroundStyle, userAesthetic, canvasDimensions } = request;

    if (!items || items.length === 0) {
      response.error = 'No items provided for flat-lay generation';
      response.message = 'At least one item is required';
      return response;
    }

    const canvasWidth = canvasDimensions?.width || DEFAULT_CANVAS.width;
    const canvasHeight = canvasDimensions?.height || DEFAULT_CANVAS.height;

    // Determine background style
    const effectiveBackgroundStyle = backgroundStyle || mapAestheticToBackground(userAesthetic);
    response.backgroundStyle = effectiveBackgroundStyle;

    console.log(`[HybridFlatLay] Starting hybrid generation:`, {
      itemCount: items.length,
      backgroundStyle: effectiveBackgroundStyle,
      canvas: `${canvasWidth}x${canvasHeight}`,
    });

    // Step 1 & 2: Generate background and process products in parallel
    const [backgroundBuffer, processedProducts] = await Promise.all([
      // Generate AI background (or fallback to white)
      generateAIBackground(effectiveBackgroundStyle, apiKey).catch((err) => {
        console.warn(`[HybridFlatLay] Background generation failed, using white:`, err.message);
        return createWhiteBackground(canvasWidth, canvasHeight);
      }),
      // Process product images
      processProductImagesParallel(items),
    ]);

    // Track successful and failed products
    for (const product of processedProducts) {
      if (product.success) {
        response.processedProducts.push(product.sku);
      } else {
        response.failedProducts.push(product.sku);
      }
    }

    // Check if we have any successful products
    const successfulProducts = processedProducts.filter((p) => p.success);
    if (successfulProducts.length === 0) {
      response.error = 'All product images failed to process';
      response.message = 'Could not process any product images. Please try again.';
      return response;
    }

    console.log(`[HybridFlatLay] Processed ${successfulProducts.length}/${items.length} products`);

    // Step 3: Composite products onto background
    const compositeBuffer = await compositeImages(
      backgroundBuffer,
      processedProducts, // Pass all, compositor will skip failed ones
      undefined, // Let compositor calculate layout
      canvasWidth,
      canvasHeight
    );

    // Convert to base64
    response.imageBase64 = bufferToBase64(compositeBuffer);
    response.success = true;
    response.message = `Hybrid flat-lay generated with ${successfulProducts.length} products`;

    const duration = Date.now() - startTime;
    console.log(`[HybridFlatLay] Completed in ${duration}ms:`, {
      success: true,
      processedProducts: response.processedProducts.length,
      failedProducts: response.failedProducts.length,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[HybridFlatLay] Failed after ${duration}ms:`, error);

    response.error = error instanceof Error ? error.message : 'Unknown error';
    response.message = 'Failed to generate hybrid flat-lay. Please try again.';
  }

  return response;
}

/**
 * Generates a hybrid flat-lay with automatic fallback to AI-only generation
 *
 * @param request - Hybrid flat-lay request
 * @param apiKey - OpenRouter API key
 * @param fallbackToAIOnly - Whether to fall back to AI-only on failure (default: true)
 * @returns Promise resolving to generation response
 */
export async function generateHybridFlatLayWithFallback(
  request: HybridFlatLayRequest,
  apiKey: string,
  fallbackToAIOnly: boolean = true
): Promise<HybridFlatLayResponse> {
  // Try hybrid generation first
  const result = await generateHybridFlatLay(request, apiKey);

  if (result.success) {
    return result;
  }

  // If fallback is disabled or no items, return the failure
  if (!fallbackToAIOnly || !request.items || request.items.length === 0) {
    return result;
  }

  console.log(`[HybridFlatLay] Falling back to AI-only generation...`);

  // Fallback to AI-only flat-lay generation
  try {
    const client = new OpenRouterImageClient(apiKey);

    const aiResult = await client.generateFlatLayImage({
      items: request.items,
      occasionContext: request.occasionContext,
      totalItems: request.items.length,
    });

    if (aiResult.success && aiResult.imageBase64) {
      return {
        success: true,
        imageBase64: aiResult.imageBase64,
        imageUrl: aiResult.imageUrl,
        backgroundStyle: 'white-clean',
        processedProducts: [],
        failedProducts: request.items.map((i) => i.sku || 'unknown'),
        message: 'Generated using AI-only fallback',
      };
    }
  } catch (fallbackError) {
    console.error(`[HybridFlatLay] AI-only fallback also failed:`, fallbackError);
  }

  // Both attempts failed
  return {
    ...result,
    message: 'Both hybrid and AI-only generation failed. Please try again.',
  };
}
