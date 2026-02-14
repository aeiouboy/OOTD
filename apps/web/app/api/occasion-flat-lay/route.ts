/**
 * Occasion Flat-Lay Generation API Route
 * POST /api/occasion-flat-lay
 *
 * Handles occasion-based outfit curation and flat-lay image generation
 *
 * Features:
 * - Server-side rate limiting (10 requests per minute per IP)
 * - Request validation with occasion preset checking
 * - Error handling with appropriate HTTP status codes
 * - Image saving to public directory
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateOccasionFlatLay } from '@/lib/services/occasion-flat-lay-service';
import type { OccasionFlatLayRequest, OccasionPreset } from '@/lib/types/image-types';
import fs from 'fs';
import path from 'path';

/**
 * Rate limiting configuration
 * Tracks request counts per IP address
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10;

/** Valid occasion presets accepted by this route */
const VALID_PRESETS: OccasionPreset[] = ['weekend-social', 'date-night', 'everyday-casual'];

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
 * POST handler for occasion flat-lay generation
 *
 * Request body:
 * {
 *   occasion: OccasionPreset,       // Required: 'weekend-social' | 'date-night' | 'everyday-casual'
 *   userName?: string,               // Optional: user display name
 *   userAge?: string,                // Optional: user age
 *   stylePreferences?: string[],     // Optional: style tags
 *   hasReferenceImage?: boolean      // Optional: whether user has uploaded a reference
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMITED',
          message: 'Too many requests. Please wait a minute.',
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
      return NextResponse.json(
        {
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'Image generation service is not configured.',
        },
        { status: 503 }
      );
    }

    // Parse request body
    let body: OccasionFlatLayRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REQUEST',
          message: 'Invalid request format',
        },
        { status: 400 }
      );
    }

    // Validate occasion preset
    if (!body.occasion || !VALID_PRESETS.includes(body.occasion)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_OCCASION',
          message: `Invalid occasion. Must be one of: ${VALID_PRESETS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    console.log('[API] Occasion flat-lay request:', {
      occasion: body.occasion,
      userName: body.userName || 'anonymous',
      hasStylePreferences: !!(body.stylePreferences?.length),
    });

    // Generate occasion flat-lay
    const result = await generateOccasionFlatLay(body, apiKey);

    const duration = Date.now() - startTime;
    console.log(`[API] Occasion flat-lay completed in ${duration}ms`, {
      success: result.success,
    });

    // Save image to disk if generation succeeded
    if (result.success && result.imageBase64) {
      try {
        const filename = `occasion-${body.occasion}-${Date.now()}.png`;
        const imageUrl = saveBase64Image(result.imageBase64, filename);
        result.imageUrl = imageUrl;
      } catch (saveError) {
        // Log error but don't fail the request - base64 is still available
        console.error('[API] Failed to save image:', saveError);
      }
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
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
      message: 'Use POST.',
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
