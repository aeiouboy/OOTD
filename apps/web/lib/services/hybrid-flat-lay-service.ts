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
  ProcessedProductImage,
  BackgroundStyle,
  UserAesthetic,
  HybridFlatLayRequest,
  HybridFlatLayResponse,
} from '@/lib/types/image-types';
import { processProductImagesParallel } from '@/lib/utils/product-image-processor';
import { hasProblematicFlatLayImageUrl } from '@/lib/utils/product-visual-validator';
import {
  compositeImages,
  createWhiteBackground,
  base64ToBuffer,
  bufferToBase64,
} from '@/lib/utils/image-compositor';
import { OpenRouterImageClient } from './image-generation-service';
import { buildBackgroundPrompt } from '../prompts/image-prompts';

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

function inferItemFamily(text: string): 'main' | 'shoes' | 'accessory' | 'unknown' {
  const t = text.toLowerCase();
  if (/\b(dress|shirt|blouse|top|tee|t-shirt|pants|trouser|jeans|skirt|jumpsuit|romper|shorts|clothing)\b/.test(t)) return 'main';
  if (/\b(shoe|sandal|sneaker|heel|boot|loafer|pump|mule)\b/.test(t)) return 'shoes';
  if (/\b(bag|belt|hat|scarf|watch|necklace|earring|bracelet|accessor)\b/.test(t)) return 'accessory';
  return 'unknown';
}

function isMainGarmentProduct(product: ProcessedProductImage): boolean {
  const text = `${product.category} ${product.name}`.toLowerCase();
  return inferItemFamily(text) === 'main';
}

async function loadReplacementCandidates(
  originalItems: FlatLayItem[],
  maxCandidates = 80
): Promise<FlatLayItem[]> {
  try {
    const { loadProductsServerSide } = await import('@/lib/server-product-loader');
    const enhancedProducts = await loadProductsServerSide();
    if (!enhancedProducts.length) return [];

    const usedSkus = new Set(originalItems.map((i) => i.sku).filter(Boolean));
    const preferredFamilies = new Set(
      originalItems.map((i) => inferItemFamily(`${i.category} ${i.name}`)).filter((f) => f !== 'unknown')
    );

    const fallbackItems: Array<FlatLayItem & { __family?: 'main' | 'shoes' | 'accessory' | 'unknown' }> = [];
    for (const product of enhancedProducts as any[]) {
      const imageUrl: string | undefined = product?.centralIntegration?.images?.primary;
      if (!imageUrl || hasProblematicFlatLayImageUrl(imageUrl)) continue;

      const sku = product?.sku || product?.id;
      if (!sku || usedSkus.has(sku)) continue;

      const name = product?.name?.en || product?.name?.th || product?.name || '';
      if (!name) continue;

      const category =
        product?.classification?.category?.subCategory ||
        product?.classification?.category?.primary ||
        product?.classification?.category?.main ||
        product?.classification?.category ||
        'clothing';

      const family = inferItemFamily(`${category} ${name}`);
      if (preferredFamilies.size > 0 && family !== 'unknown' && !preferredFamilies.has(family)) {
        continue;
      }

      const color = product?.style?.colors?.primary;
      const visualDescription = product?.description?.en || product?.description?.th || undefined;

      fallbackItems.push({
        name,
        category: typeof category === 'string' ? category : 'clothing',
        color: typeof color === 'string' ? color : undefined,
        visualDescription: typeof visualDescription === 'string' ? visualDescription : undefined,
        sku,
        thumbnailUrl: imageUrl,
        __family: family,
      });

      if (fallbackItems.length >= maxCandidates) break;
    }

    // Prefer main garments first to satisfy quality gate earlier.
    fallbackItems.sort((a, b) => {
      const rank = (f?: string) => (f === 'main' ? 0 : f === 'shoes' ? 1 : f === 'accessory' ? 2 : 3);
      return rank(a.__family) - rank(b.__family);
    });

    return fallbackItems.map(({ __family: _ignore, ...item }) => item);
  } catch (error) {
    console.warn('[HybridFlatLay] Failed to load replacement candidates:', error);
    return [];
  }
}

async function gatherSuccessfulCandidates(
  candidates: FlatLayItem[],
  neededCount: number,
  needsMainGarment: boolean
): Promise<ProcessedProductImage[]> {
  if (neededCount <= 0 && !needsMainGarment) return [];

  const successful: ProcessedProductImage[] = [];
  const triedSkus = new Set<string>();
  const BATCH_SIZE = 6;
  const MAX_TOTAL_TRIES = 30;

  for (let start = 0; start < candidates.length && triedSkus.size < MAX_TOTAL_TRIES; start += BATCH_SIZE) {
    const batch = candidates
      .slice(start, start + BATCH_SIZE)
      .filter((item) => {
        const sku = item.sku || '';
        if (!sku || triedSkus.has(sku)) return false;
        triedSkus.add(sku);
        return true;
      });

    if (batch.length === 0) continue;

    const processed = await processProductImagesParallel(batch);
    for (const product of processed) {
      if (!product.success) continue;
      successful.push(product);
      const hasMain = successful.some((p) => isMainGarmentProduct(p));
      if (successful.length >= neededCount && (!needsMainGarment || hasMain)) {
        return successful;
      }
    }
  }

  return successful;
}

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

  // IMPORTANT: Use raw flat-lay generation here.
  // generateOutfitImage() wraps the prompt with a model-worn fashion prompt,
  // which can inject a person into the background image.
  const response = await client.generateRawFlatLay(prompt);

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
    const useAIBackground = process.env.HYBRID_FLATLAY_USE_AI_BACKGROUND === 'true';

    console.log(`[HybridFlatLay] Starting hybrid generation:`, {
      itemCount: items.length,
      backgroundStyle: effectiveBackgroundStyle,
      useAIBackground,
      canvas: `${canvasWidth}x${canvasHeight}`,
    });

    // Step 1 & 2: Generate background and process products in parallel
    const backgroundPromise = useAIBackground
      ? generateAIBackground(effectiveBackgroundStyle, apiKey).catch((err) => {
          console.warn(`[HybridFlatLay] Background generation failed, using white:`, err.message);
          return createWhiteBackground(canvasWidth, canvasHeight);
        })
      : createWhiteBackground(canvasWidth, canvasHeight);

    const [backgroundBuffer, processedProducts] = await Promise.all([
      backgroundPromise,
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
    let successfulProducts = processedProducts.filter((p) => p.success);

    // Log detailed failure reasons for debugging
    if (response.failedProducts.length > 0) {
      const failureReasons = processedProducts
        .filter((p) => !p.success)
        .map((p) => `${p.name}: ${p.error || 'unknown error'}`)
        .join('; ');
      console.warn(`[HybridFlatLay] ${response.failedProducts.length} products failed:`, failureReasons);
    }

    // Quality gate: avoid generating misleading "flat-lay" with too few surviving items.
    const minRequiredItems = items.length === 1 ? 1 : Math.max(2, Math.ceil(items.length * 0.5));
    let hasMainGarment = successfulProducts.some((p) => isMainGarmentProduct(p));

    // Auto-reselect: try adding alternative catalog items when current set is insufficient.
    if (successfulProducts.length < minRequiredItems || !hasMainGarment) {
      const missingItems = Math.max(0, minRequiredItems - successfulProducts.length);
      const candidateItems = await loadReplacementCandidates(items, Math.max(40, missingItems * 25));

      if (candidateItems.length > 0) {
        const candidateSuccess = await gatherSuccessfulCandidates(
          candidateItems,
          missingItems,
          !hasMainGarment
        );

        for (const candidate of candidateSuccess) {
          if (successfulProducts.length >= minRequiredItems && hasMainGarment) break;
          successfulProducts.push(candidate);
          response.processedProducts.push(candidate.sku);
          hasMainGarment = hasMainGarment || isMainGarmentProduct(candidate);
        }
      }
    }

    if (successfulProducts.length === 0) {
      response.error = 'All product images failed to process';
      response.message = 'Could not process any product images. Please try again.';
      return response;
    }

    if (successfulProducts.length < minRequiredItems || !hasMainGarment) {
      response.error = `Insufficient valid product images (${successfulProducts.length}/${items.length}, need ${minRequiredItems})`;
      response.message = 'Not enough clean product cutouts for reliable hybrid flat-lay.';
      console.warn('[HybridFlatLay] Quality gate failed:', {
        requested: items.length,
        successful: successfulProducts.length,
        minRequired: minRequiredItems,
        hasMainGarment,
        failureRate: `${((response.failedProducts.length / items.length) * 100).toFixed(0)}%`,
      });
      return response;
    }

    console.log(`[HybridFlatLay] Processed ${successfulProducts.length}/${items.length} products`);

    // Step 3: Composite products onto background
    const compositeBuffer = await compositeImages(
      backgroundBuffer,
      successfulProducts,
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

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    response.error = errorMessage;
    // Preserve connection error details for better debugging
    const isConnectionError = errorMessage.toLowerCase().includes('connection') ||
      errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('fetch');

    response.message = isConnectionError
      ? `Connection error: ${errorMessage}`
      : 'Failed to generate hybrid flat-lay. Please try again.';
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

  // Do NOT fallback to AI-only for product-asset quality failures.
  // AI-only fallback often introduces hallucinated/model images and breaks
  // "shop this look" consistency with catalog items.
  const errorText = `${result.error || ''} ${result.message || ''}`.toLowerCase();
  const isQualityFailure =
    errorText.includes('insufficient valid product images') ||
    errorText.includes('all product images failed to process') ||
    errorText.includes('not enough clean product cutouts') ||
    errorText.includes('model-shot');
  if (isQualityFailure) {
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
    message: result.error?.toLowerCase().includes('connection')
      ? result.message // Keep the connection error message from the hybrid attempt
      : 'Both hybrid and AI-only generation failed. Please try again.',
  };
}
