/**
 * Image Generation API Route
 * POST /api/generate-image
 *
 * Handles outfit image generation requests using OpenRouter's Gemini 2.5 Flash Preview model
 *
 * Features:
 * - Server-side rate limiting (10 requests per minute per IP)
 * - Request validation
 * - Error handling with appropriate HTTP status codes
 * - Logging for debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterImageClient } from '@/lib/services/image-generation-service';
import { generateHybridFlatLayWithFallback } from '@/lib/services/hybrid-flat-lay-service';
import { batchExtractDescriptions } from '@/lib/services/vision-description-service';
import type { ImageGenerationRequest, FlatLayItem, BackgroundStyle, UserAesthetic } from '@/lib/types/image-types';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

/**
 * Rate limiting configuration
 * Tracks request counts per IP address
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = Number.parseInt(
  process.env.IMAGE_GEN_RATE_LIMIT_MAX_REQUESTS || '10',
  10
);

function isLocalDevIP(ip: string): boolean {
  return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
}

/**
 * Checks if request is rate limited
 *
 * @param ip - Client IP address
 * @returns true if rate limited, false if allowed
 */
function isRateLimited(ip: string): boolean {
  // Local development can trigger multiple image calls per turn.
  // Skip hard throttling for localhost to avoid false "generation failed" UX while testing.
  if (isLocalDevIP(ip)) {
    return false;
  }

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // No record or window expired - create new record
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  // Increment count
  record.count++;

  // Check if over limit
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

/**
 * Gets client IP address from request
 *
 * @param request - Next.js request object
 * @returns IP address string
 */
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default value
  return 'unknown';
}

/**
 * Ensures a directory exists, creating it if necessary
 *
 * @param dirPath - Absolute path to the directory
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('[API] Created directory:', dirPath);
  }
}

/**
 * Generates a unique filename for an outfit image
 *
 * @returns Filename in format: outfit-{timestamp}.png
 */
function generateImageFilename(): string {
  const timestamp = Date.now();
  return `outfit-${timestamp}.png`;
}

/**
 * Removes background from an image file using rembg Python script
 *
 * @param inputPath - Absolute path to the input image
 * @param outputPath - Absolute path to save the output image
 * @returns Promise that resolves to true on success, false on failure
 */
async function removeBackgroundFromFile(inputPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), '..', '..', 'scripts', 'image_processing', 'remove_bg_rembg.py');

    console.log('[API] Running background removal:', { inputPath, outputPath, scriptPath });

    const python = spawn('python3', [scriptPath, inputPath, outputPath]);

    let stderr = '';

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('[API] Background removal:', data.toString().trim());
    });

    python.on('close', (code) => {
      if (code === 0) {
        console.log('[API] Background removal completed successfully');
        resolve(true);
      } else {
        console.error('[API] Background removal failed with code:', code);
        console.error('[API] stderr:', stderr);
        resolve(false);
      }
    });

    python.on('error', (err) => {
      console.error('[API] Failed to spawn background removal process:', err);
      resolve(false);
    });
  });
}

/**
 * Auto-crops image to the bounding box of non-transparent pixels with padding
 *
 * @param inputPath - Absolute path to the input image
 * @param outputPath - Absolute path to save the output image
 * @returns Promise that resolves to true on success, false on failure
 */
async function autoCropSubject(inputPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), '..', '..', 'scripts', 'image_processing', 'auto_crop_subject.py');

    console.log('[API] Running auto-crop:', { inputPath, outputPath, scriptPath });

    const python = spawn('python3', [scriptPath, inputPath, outputPath]);

    let stderr = '';

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('[API] Auto-crop:', data.toString().trim());
    });

    python.on('close', (code) => {
      if (code === 0) {
        console.log('[API] Auto-crop completed successfully');
        resolve(true);
      } else {
        console.error('[API] Auto-crop failed with code:', code);
        console.error('[API] stderr:', stderr);
        resolve(false);
      }
    });

    python.on('error', (err) => {
      console.error('[API] Failed to spawn auto-crop process:', err);
      resolve(false);
    });
  });
}

/**
 * Saves a base64-encoded image to disk as a PNG file
 *
 * @param base64Data - Base64 image data (with or without data URL prefix)
 * @param filename - Name of the file to save
 * @returns Relative public URL path to the saved image
 * @throws Error if file save fails
 */
function saveBase64Image(base64Data: string, filename: string): string {
  // Strip data URL prefix if present (e.g., "data:image/png;base64,")
  const base64Content = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data;

  // Construct absolute path to the public/generated-images directory
  const publicDir = path.join(process.cwd(), 'public', 'generated-images');
  ensureDirectoryExists(publicDir);

  const filePath = path.join(publicDir, filename);

  // Convert base64 to buffer and write to file
  const imageBuffer = Buffer.from(base64Content, 'base64');
  fs.writeFileSync(filePath, imageBuffer);

  console.log('[API] Saved image to:', filePath);

  // Return public URL path (relative)
  return `/generated-images/${filename}`;
}

/**
 * POST handler for image generation
 *
 * Request body:
 * {
 *   description: string,
 *   style?: {
 *     photographyStyle?: string,
 *     composition?: string,
 *     lighting?: string,
 *     aestheticContext?: string
 *   }
 * }
 *
 * Response on success:
 * {
 *   success: true,
 *   imageUrl: string,        // Public URL path (e.g., /generated-images/outfit-1732800000000.png)
 *   imageBase64: string,      // Base64-encoded image data
 *   error?: undefined,
 *   message?: undefined
 * }
 *
 * Response on failure:
 * {
 *   success: false,
 *   imageUrl?: undefined,
 *   imageBase64?: undefined,
 *   error: string,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    console.log('[API] Image generation request received from IP:', clientIP);

    // Check rate limiting
    if (isRateLimited(clientIP)) {
      console.warn('[API] Rate limit exceeded for IP:', clientIP);
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMITED',
          message: 'Too many requests. Please wait a minute before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    // Check if OPENROUTER_API_KEY is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[API] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'Image generation service is not configured. Please contact support.',
        },
        { status: 503 }
      );
    }

    // Parse request body
    let body: ImageGenerationRequest;
    try {
      body = await request.json();
    } catch (error) {
      console.error('[API] Invalid JSON in request body:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REQUEST',
          message: 'Invalid request format',
        },
        { status: 400 }
      );
    }

    // Validate request body
    const { description, style, referenceImage, secondaryReferenceImage, generationType, flatLayItems, occasionContext, backgroundStyle, userAesthetic } = body;

    // Flat-lay and hybrid-flat-lay generation require items instead of description
    if (generationType === 'flat-lay' || generationType === 'hybrid-flat-lay') {
      if (!flatLayItems || !Array.isArray(flatLayItems) || flatLayItems.length === 0) {
        console.error('[API] Missing or invalid items for flat-lay generation');
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_ITEMS',
            message: 'At least one item is required for flat-lay generation',
          },
          { status: 400 }
        );
      }
    } else if (!description || typeof description !== 'string' || description.trim() === '') {
      console.error('[API] Missing or invalid description');
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_DESCRIPTION',
          message: 'Outfit description is required',
        },
        { status: 400 }
      );
    }

    // Validate description length (3000 chars for fitting-model, 1000 for outfit)
    // Skip validation for flat-lay and hybrid-flat-lay since they use items instead of description
    if (generationType !== 'flat-lay' && generationType !== 'hybrid-flat-lay') {
      const maxDescriptionLength = (generationType === 'fitting-model' || generationType === 'try-on' || generationType === 'try-on-dual') ? 3000 : 1000;
      if (description && description.length > maxDescriptionLength) {
        console.error('[API] Description too long:', description.length);
        return NextResponse.json(
          {
            success: false,
            error: 'DESCRIPTION_TOO_LONG',
            message: `Description is too long. Please keep it under ${maxDescriptionLength} characters.`,
          },
          { status: 400 }
        );
      }
    }

    // Validate referenceImage format when provided with fitting-model, try-on, or try-on-dual generation
    if ((generationType === 'fitting-model' || generationType === 'try-on' || generationType === 'try-on-dual') && referenceImage) {
      if (typeof referenceImage !== 'string' || referenceImage.trim() === '') {
        console.error('[API] Invalid reference image for', generationType, 'generation');
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_REFERENCE_IMAGE',
            message: 'Reference image must be a valid string',
          },
          { status: 400 }
        );
      }

      if (!referenceImage.startsWith('data:image/')) {
        console.error('[API] Invalid reference image format');
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_REFERENCE_IMAGE_FORMAT',
            message: 'Reference image must be a base64 data URL (e.g., data:image/jpeg;base64,...)',
          },
          { status: 400 }
        );
      }
    }

    // Validate that try-on and try-on-dual generation require a reference image
    if ((generationType === 'try-on' || generationType === 'try-on-dual') && !referenceImage) {
      console.error('[API] Missing reference image for', generationType, 'generation');
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_REFERENCE_IMAGE',
          message: 'Reference image (fitting model) is required for try-on generation',
        },
        { status: 400 }
      );
    }

    // Validate secondaryReferenceImage format when provided (required for try-on-dual)
    if (generationType === 'try-on-dual') {
      if (!secondaryReferenceImage) {
        console.error('[API] Missing secondary reference image for try-on-dual generation');
        return NextResponse.json(
          {
            success: false,
            error: 'MISSING_SECONDARY_REFERENCE_IMAGE',
            message: 'Secondary reference image (flat-lay) is required for try-on-dual generation',
          },
          { status: 400 }
        );
      }

      if (typeof secondaryReferenceImage !== 'string' || !secondaryReferenceImage.startsWith('data:image/')) {
        console.error('[API] Invalid secondary reference image format');
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_SECONDARY_REFERENCE_IMAGE_FORMAT',
            message: 'Secondary reference image must be a base64 data URL (e.g., data:image/jpeg;base64,...)',
          },
          { status: 400 }
        );
      }
    }

    console.log('[API] Generating image:', {
      descriptionLength: description?.length || 0,
      style: style || 'default',
      generationType: generationType || 'outfit',
      hasReferenceImage: !!referenceImage,
      hasSecondaryReferenceImage: !!secondaryReferenceImage,
      flatLayItemCount: flatLayItems?.length || 0,
      backgroundStyle: backgroundStyle || 'auto',
      userAesthetic: userAesthetic || 'none',
    });

    // Create image client and generate image
    const imageClient = new OpenRouterImageClient(apiKey);

    // Route to appropriate generation method based on generationType
    let result;

    // Vision enrichment: Extract descriptions from images BEFORE any generation type
    // This ensures both hybrid and AI-only flat-lays use vision-extracted descriptions
    let enhancedFlatLayItems = flatLayItems;
    if ((generationType === 'flat-lay' || generationType === 'hybrid-flat-lay') && flatLayItems) {
      const useVisionDescriptions = process.env.FLAT_LAY_USE_VISION === 'true';
      const itemsHaveImages = flatLayItems.some(item => item.thumbnailUrl?.startsWith('https://'));

      if (useVisionDescriptions && !itemsHaveImages) {
        // Only run vision extraction when items DON'T have image URLs
        // Multi-modal mode sends images directly — vision extraction is redundant
        console.log('[API] Vision mode: extracting descriptions (no product images available)');
        try {
          enhancedFlatLayItems = await batchExtractDescriptions(flatLayItems, 3);
          const enrichedCount = enhancedFlatLayItems.filter((item) => item.visualDescription).length;
          console.log(`[API] Vision extraction: ${enrichedCount}/${flatLayItems.length} items enriched`);
        } catch (visionError) {
          console.warn('[API] Vision extraction failed, using original items:', visionError);
          // Fallback to original items if vision fails
          enhancedFlatLayItems = flatLayItems;
        }
      } else if (itemsHaveImages) {
        console.log('[API] Multi-modal mode: skipping vision extraction, sending product images directly');
      }
    }

    if (generationType === 'hybrid-flat-lay' && enhancedFlatLayItems) {
      // Hybrid flat-lay: AI background + real product images
      // Uses vision-enriched items for better AI fallback descriptions
      const strictProductOnly = process.env.FLAT_LAY_STRICT_PRODUCT_ONLY !== 'false';
      const requestedHybridAIFallback = process.env.HYBRID_FLATLAY_ALLOW_AI_FALLBACK === 'true';
      const allowHybridAIFallback = requestedHybridAIFallback && !strictProductOnly;

      if (requestedHybridAIFallback && strictProductOnly) {
        console.log('[API] HYBRID_FLATLAY_ALLOW_AI_FALLBACK overridden by FLAT_LAY_STRICT_PRODUCT_ONLY=true');
      }

      const hybridResult = await generateHybridFlatLayWithFallback(
        {
          items: enhancedFlatLayItems,
          backgroundStyle: backgroundStyle as BackgroundStyle | undefined,
          userAesthetic: userAesthetic as UserAesthetic | undefined,
          occasionContext: occasionContext,
        },
        apiKey,
        allowHybridAIFallback
      );

      // Convert hybrid response to standard ImageGenerationResponse format
      result = {
        success: hybridResult.success,
        imageBase64: hybridResult.imageBase64,
        imageUrl: hybridResult.imageUrl,
        error: hybridResult.error,
        message: hybridResult.message,
        metadata: {
          model: 'hybrid-flat-lay',
          generatedAt: new Date().toISOString(),
          prompt: `Hybrid flat-lay with ${hybridResult.processedProducts.length} products`,
        },
      };
    } else if (generationType === 'flat-lay' && enhancedFlatLayItems) {
      // Pure AI flat-lay generation with vision-enriched descriptions
      result = await imageClient.generateFlatLayImage({
        items: enhancedFlatLayItems,
        occasionContext: occasionContext,
        totalItems: enhancedFlatLayItems.length,
      });
    } else if (generationType === 'fitting-model' && referenceImage) {
      result = await imageClient.generateFittingModelImage(description, referenceImage);
    } else if (generationType === 'try-on-dual' && referenceImage && secondaryReferenceImage) {
      // Try-on with dual reference: fitting model (IMAGE 1) + flat-lay (IMAGE 2)
      result = await imageClient.generateTryOnWithDualReference(description, referenceImage, secondaryReferenceImage);
    } else if (generationType === 'try-on' && referenceImage) {
      // Try-on with single reference: fitting model only (fallback mode)
      result = await imageClient.generateFittingModelImage(description, referenceImage);
    } else {
      result = await imageClient.generateOutfitImage(description, style);
    }

    const duration = Date.now() - startTime;
    console.log('[API] Image generation completed in', duration, 'ms', {
      success: result.success,
      error: result.error || 'none',
    });

    // Return response with appropriate status code
    if (result.success) {
      // Save image to disk and add imageUrl to response
      if (result.imageBase64) {
        try {
          const filename = generateImageFilename();
          const imageUrl = saveBase64Image(result.imageBase64, filename);
          const publicDir = path.join(process.cwd(), 'public', 'generated-images');
          const filePath = path.join(publicDir, filename);

          // Apply background removal for fitting-model, try-on, and try-on-dual images
          if (generationType === 'fitting-model' || generationType === 'try-on' || generationType === 'try-on-dual') {
            console.log('[API] Applying background removal for', generationType);
            const bgRemovalSuccess = await removeBackgroundFromFile(filePath, filePath);

            if (bgRemovalSuccess) {
              // Re-read the processed image and update base64
              const processedImageBuffer = fs.readFileSync(filePath);
              result.imageBase64 = `data:image/png;base64,${processedImageBuffer.toString('base64')}`;
              console.log('[API] Background removed successfully');

              // Apply auto-crop to ensure model fills the frame
              console.log('[API] Applying auto-crop for', generationType);
              const autoCropSuccess = await autoCropSubject(filePath, filePath);

              if (autoCropSuccess) {
                // Re-read the cropped image and update base64
                const croppedImageBuffer = fs.readFileSync(filePath);
                result.imageBase64 = `data:image/png;base64,${croppedImageBuffer.toString('base64')}`;
                console.log('[API] Auto-crop completed successfully');
              } else {
                console.warn('[API] Auto-crop failed, using image with background removed');
              }
            } else {
              console.warn('[API] Background removal failed, using original image');
            }
          }

          // Add imageUrl to the result
          result.imageUrl = imageUrl;

          console.log('[API] Image saved successfully:', imageUrl);
        } catch (saveError) {
          // Log error but don't fail the request - base64 is still available
          console.error('[API] Failed to save image to disk:', saveError);
          console.warn('[API] Continuing without imageUrl - base64 still available');
        }
      }

      return NextResponse.json(result, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else {
      // Determine status code based on error type
      let statusCode = 500;
      if (result.error === 'RATE_LIMITED') {
        statusCode = 429;
      } else if (result.error === 'INVALID_DESCRIPTION') {
        statusCode = 400;
      } else if (result.error === 'SERVICE_UNAVAILABLE') {
        statusCode = 503;
      }

      return NextResponse.json(result, {
        status: statusCode,
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API] Unexpected error during image generation:', error);
    console.error('[API] Error occurred after', duration, 'ms');

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - not supported
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'GET method is not supported. Use POST to generate images.',
    },
    { status: 405 }
  );
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
