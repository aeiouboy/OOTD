/**
 * Fitting Model Generation Service
 * Generates AI-powered fitting model images using the user's uploaded photo
 *
 * Features:
 * - Photorealistic fitting model generation from user photo
 * - Mystery mode for users who don't upload photos
 * - Standard outfit: white crop top + black shorts + barefoot
 * - Try-on looks: outfit worn on user's fitting model (v6.0)
 */

/**
 * Response from fitting model generation
 */
export interface FittingModelResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  error?: string;
  message?: string;
}

/**
 * Request for try-on looks generation
 */
export interface TryOnLooksRequest {
  /** User's fitting model image URL from profile */
  fittingModelImageUrl: string;
  /** Recommended outfit items to display on the model */
  outfitItems: Array<{ name: string; category: string; color?: string }>;
  /** Optional outfit name/title for context */
  outfitTitle?: string;
  /** URL to the flat-lay image showing the exact outfit items */
  flatLayImageUrl?: string;
  /** Base64-encoded flat-lay image as fallback */
  flatLayImageBase64?: string;
}

/**
 * Fitting model prompt template based on fitting_model.md
 * Shortened to stay under 3000 character limit for fitting-model generation
 * Generates a person in standard outfit (white crop top + black shorts + barefoot)
 */
const FITTING_MODEL_PROMPT_TEMPLATE = `
Photorealistic fashion catalog image. Reference photo shows the person's face - match it EXACTLY.

FACE: Exact match to reference - same face shape, eyes, nose, mouth, skin tone, hair. No beautification.

BODY: Match body type from reference or use proportionate figure.

OUTFIT: White spaghetti strap crop top, black high-waisted legging shorts, barefoot.

POSE: Standing straight, facing camera, arms at sides, feet together.

MANDATORY BACKGROUND: Pure white infinity cove studio backdrop (RGB 255,255,255). The model floats in infinite white void with zero visible floor, ground, horizon line, or surface. No shadows on background whatsoever.

LIGHTING: Bright front-facing softbox, high-key lighting to eliminate all shadows on backdrop.

OUTPUT: E-commerce product photo quality, clean cutout-ready image.
`.trim();

/**
 * Mystery mode prompt template for users who don't upload photos
 * Shortened to stay under 1000 character limit for outfit generation
 */
const MYSTERY_MODEL_PROMPT = `
E-commerce fashion catalog photo of Thai woman, 25-30, natural beauty, warm brown eyes, shoulder-length black hair.

OUTFIT: White spaghetti strap crop top, black high-waisted legging shorts, barefoot.

POSE: Standing straight, facing camera, arms at sides, feet together.

MANDATORY BACKGROUND: Pure white infinity cove (RGB 255,255,255). Model floats in infinite white void - NO floor, NO ground, NO shadows on backdrop.

LIGHTING: High-key softbox, bright even illumination eliminating all backdrop shadows.

OUTPUT: Clean cutout-ready product photo.
`.trim();

/**
 * Generates a fitting model image from the user's photo
 *
 * @param userPhotoBase64 - Base64 encoded user photo (with data URL prefix)
 * @returns Promise resolving to fitting model response
 */
export async function generateFittingModel(
  userPhotoBase64: string
): Promise<FittingModelResponse> {
  try {
    console.log('[FittingModel] Generating fitting model from user photo');

    // Call the image generation API with reference image for multimodal generation
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: FITTING_MODEL_PROMPT_TEMPLATE,
        referenceImage: userPhotoBase64,
        generationType: 'fitting-model',
        style: {
          photographyStyle: 'professional studio',
          composition: 'full-body frontal shot',
          lighting: 'soft studio',
          aestheticContext: 'clean minimal fashion',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[FittingModel] API error:', data);
      return {
        success: false,
        error: data.error || 'GENERATION_FAILED',
        message: data.message || 'Failed to generate fitting model',
      };
    }

    if (data.success) {
      console.log('[FittingModel] Generation successful');
      return {
        success: true,
        imageUrl: data.imageUrl,
        imageBase64: data.imageBase64,
        message: 'Fitting model generated successfully',
      };
    }

    return {
      success: false,
      error: data.error || 'GENERATION_FAILED',
      message: data.message || 'Failed to generate fitting model',
    };
  } catch (error) {
    console.error('[FittingModel] Error generating fitting model:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Unable to connect to the image generation service',
    };
  }
}

/**
 * Generates a default fitting model for "Mystery" option
 * Creates an anonymous fitting model without a specific face reference
 *
 * @returns Promise resolving to fitting model response
 */
export async function generateDefaultFittingModel(): Promise<FittingModelResponse> {
  try {
    console.log('[FittingModel] Generating default mystery fitting model');

    // Call the image generation API with mystery prompt
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: MYSTERY_MODEL_PROMPT,
        generationType: 'fitting-model',
        style: {
          photographyStyle: 'professional studio',
          composition: 'full-body frontal shot',
          lighting: 'soft studio',
          aestheticContext: 'clean minimal fashion',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[FittingModel] API error:', data);
      return {
        success: false,
        error: data.error || 'GENERATION_FAILED',
        message: data.message || 'Failed to generate mystery fitting model',
      };
    }

    if (data.success) {
      console.log('[FittingModel] Mystery model generation successful');
      return {
        success: true,
        imageUrl: data.imageUrl,
        imageBase64: data.imageBase64,
        message: 'Mystery fitting model generated successfully',
      };
    }

    return {
      success: false,
      error: data.error || 'GENERATION_FAILED',
      message: data.message || 'Failed to generate mystery fitting model',
    };
  } catch (error) {
    console.error('[FittingModel] Error generating mystery fitting model:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Unable to connect to the image generation service',
    };
  }
}

/**
 * Try-on prompt template for showing outfit on fitting model (single image reference)
 * Emphasizes maintaining exact face/body from reference while changing outfit
 */
function buildTryOnPrompt(items: Array<{ name: string; category: string; color?: string }>, outfitTitle?: string): string {
  const itemDescriptions = items.map(item => {
    const color = item.color ? `${item.color} ` : '';
    return `${color}${item.name}`;
  }).join(', ');

  return `
Photorealistic fashion catalog image. Reference photo shows the person - match face and body EXACTLY.

FACE: Exact match to reference - same face shape, eyes, nose, mouth, skin tone, hair. No beautification.

BODY: Match body type from reference exactly.

OUTFIT: ${itemDescriptions}${outfitTitle ? ` (${outfitTitle})` : ''}

POSE: Standing straight, facing camera, confident pose, feet together.

MANDATORY BACKGROUND: Pure white infinity cove studio backdrop (RGB 255,255,255). Model floats in infinite white void - NO floor, NO ground, NO shadows on backdrop.

LIGHTING: Bright front-facing softbox, high-key lighting to eliminate all shadows on backdrop.

OUTPUT: E-commerce product photo quality, clean cutout-ready image, outfit clearly visible.
`.trim();
}

/**
 * Try-on prompt template for dual image reference (fitting model + flat-lay)
 * IMAGE 1 is the fitting model (face/body reference)
 * IMAGE 2 is the flat-lay showing exact outfit items to wear
 * Uses transfer-focused approach with mandatory checklists for outfit consistency
 */
function buildDualReferenceTryOnPrompt(items: Array<{ name: string; category: string; color?: string }>, outfitTitle?: string): string {
  const itemDescriptions = items.map(item => {
    const color = item.color ? `${item.color} ` : '';
    return `${color}${item.name}`;
  }).join(', ');

  return `
Apply ALL fashion items from IMAGE 2 onto the person in IMAGE 1, creating a photorealistic image where the person wears the complete styled outfit.

COMPOSITION:
- Full-body centered shot
- CRITICAL FRAMING: Model MUST fill 90-95% of the vertical frame. Head nearly touches top edge, feet nearly touch bottom edge. ZERO excessive whitespace above or below the model.
- CROP TIGHT: Frame the shot as a tight full-body crop with minimal margins (max 5% padding above head and below feet).
- Standing pose, facing camera, feet together

MANDATORY TRANSFER CHECKLIST - EVERY ITEM MUST APPEAR:
✓ Top/Upper garment
✓ Bottom/Lower garment or Dress
✓ Outerwear (if present in IMAGE 2)
✓ Footwear/Shoes (MANDATORY if in IMAGE 2)
✓ Accessories (bags, belts, jewelry, glasses if visible in IMAGE 2)

REALISM REQUIREMENTS:
- Preserve person's face, skin tone, hair, body proportions from IMAGE 1
- Generate natural shadows and highlights on ALL outfit pieces
- Ensure fabric draping responds to body position and gravity
- Match color accuracy from IMAGE 2 exactly
- Proper layering and depth

MANDATORY BACKGROUND:
- Pure white infinity cove studio backdrop (RGB 255,255,255)
- Model floats in infinite white void - NO floor, NO ground, NO shadows on backdrop

LIGHTING:
- Bright front-facing softbox, high-key lighting
- Match IMAGE 1's studio lighting style
- Eliminate all shadows on backdrop

REJECT IF MISSING:
❌ Any clothing item from IMAGE 2
❌ Any accessories (bag, sunglasses, watch, earrings, jewelry) visible in IMAGE 2
❌ Person still wearing IMAGE 1's original outfit pieces
❌ Model appears small with excessive whitespace (must fill 90%+ of frame)

OUTPUT SPECIFICATIONS:
- Photo quality: High-resolution, professional photography standard
- Realism: Photorealistic
- Face preservation: 100% similarity to IMAGE 1
- Complete outfit: 100% of items from IMAGE 2 must be present

Items being transferred: ${itemDescriptions}${outfitTitle ? ` (${outfitTitle})` : ''}
`.trim();
}

/**
 * Fetches an image from URL and converts to base64 data URL
 *
 * @param imageUrl - URL of the image to fetch
 * @returns Base64 data URL of the image
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  // If already a base64 data URL, return as-is
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  // Fetch the image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/png';

  return `data:${contentType};base64,${base64}`;
}

/**
 * Generates a try-on looks image showing the recommended outfit on the user's fitting model
 * Supports dual image reference when flat-lay image is provided for outfit consistency
 *
 * @param request - Try-on request with fitting model URL, outfit items, and optional flat-lay image
 * @returns Promise resolving to fitting model response with try-on image
 */
export async function generateTryOnLooks(
  request: TryOnLooksRequest
): Promise<FittingModelResponse> {
  try {
    // Determine if we have a flat-lay image for dual reference mode
    const flatLaySource = request.flatLayImageUrl || request.flatLayImageBase64;
    const hasFlatLayImage = !!flatLaySource;

    console.log('[FittingModel] Generating try-on looks:', {
      fittingModelUrl: request.fittingModelImageUrl.substring(0, 50) + '...',
      itemCount: request.outfitItems.length,
      outfitTitle: request.outfitTitle,
      hasFlatLayImage,
      mode: hasFlatLayImage ? 'dual-reference' : 'single-reference',
    });

    // Validate input
    if (!request.fittingModelImageUrl) {
      return {
        success: false,
        error: 'MISSING_FITTING_MODEL',
        message: 'Fitting model image is required for try-on generation',
      };
    }

    if (!request.outfitItems || request.outfitItems.length === 0) {
      return {
        success: false,
        error: 'MISSING_OUTFIT_ITEMS',
        message: 'At least one outfit item is required for try-on generation',
      };
    }

    // Fetch fitting model image and convert to base64
    let fittingModelBase64: string;
    try {
      fittingModelBase64 = await fetchImageAsBase64(request.fittingModelImageUrl);
    } catch (error) {
      console.error('[FittingModel] Failed to fetch fitting model image:', error);
      return {
        success: false,
        error: 'FETCH_FAILED',
        message: 'Failed to load fitting model image',
      };
    }

    // Fetch flat-lay image if available
    let flatLayBase64: string | undefined;
    if (hasFlatLayImage && flatLaySource) {
      try {
        flatLayBase64 = await fetchImageAsBase64(flatLaySource);
        console.log('[FittingModel] Flat-lay image fetched successfully');
      } catch (error) {
        console.warn('[FittingModel] Failed to fetch flat-lay image, falling back to single reference:', error);
        // Continue without flat-lay image - fallback to single reference mode
      }
    }

    // Build the appropriate prompt based on whether we have dual reference
    const useDualReference = !!flatLayBase64;
    const prompt = useDualReference
      ? buildDualReferenceTryOnPrompt(request.outfitItems, request.outfitTitle)
      : buildTryOnPrompt(request.outfitItems, request.outfitTitle);

    // Call the image generation API
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: prompt,
        referenceImage: fittingModelBase64,
        secondaryReferenceImage: flatLayBase64,
        generationType: useDualReference ? 'try-on-dual' : 'try-on',
        style: {
          photographyStyle: 'professional studio',
          composition: 'full-body frontal shot',
          lighting: 'soft studio',
          aestheticContext: 'clean minimal fashion',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[FittingModel] Try-on API error:', data);
      return {
        success: false,
        error: data.error || 'GENERATION_FAILED',
        message: data.message || 'Failed to generate try-on image',
      };
    }

    if (data.success) {
      console.log('[FittingModel] Try-on generation successful (mode:', useDualReference ? 'dual-reference' : 'single-reference', ')');
      return {
        success: true,
        imageUrl: data.imageUrl,
        imageBase64: data.imageBase64,
        message: 'Try-on image generated successfully',
      };
    }

    return {
      success: false,
      error: data.error || 'GENERATION_FAILED',
      message: data.message || 'Failed to generate try-on image',
    };
  } catch (error) {
    console.error('[FittingModel] Error generating try-on looks:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Unable to connect to the image generation service',
    };
  }
}
