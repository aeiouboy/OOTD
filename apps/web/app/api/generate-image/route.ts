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
import type { ImageGenerationRequest } from '@/lib/types/image-types';
import fs from 'fs';
import path from 'path';

/**
 * Rate limiting configuration
 * Tracks request counts per IP address
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10;

/**
 * Checks if request is rate limited
 *
 * @param ip - Client IP address
 * @returns true if rate limited, false if allowed
 */
function isRateLimited(ip: string): boolean {
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
    const { description, style } = body;

    if (!description || typeof description !== 'string' || description.trim() === '') {
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

    // Validate description length
    if (description.length > 1000) {
      console.error('[API] Description too long:', description.length);
      return NextResponse.json(
        {
          success: false,
          error: 'DESCRIPTION_TOO_LONG',
          message: 'Outfit description is too long. Please keep it under 1000 characters.',
        },
        { status: 400 }
      );
    }

    console.log('[API] Generating image for description:', {
      descriptionLength: description.length,
      style: style || 'default',
    });

    // Create image client and generate image
    const imageClient = new OpenRouterImageClient(apiKey);

    const result = await imageClient.generateOutfitImage(description, style);

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
