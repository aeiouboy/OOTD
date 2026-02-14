/**
 * Vision Description Service
 * Uses Gemini Vision API to extract product descriptions from images
 * for flat-lay generation.
 *
 * Flow: Product Image URL → Gemini Vision → Clean Text Description
 */

import type { FlatLayItem } from '@/lib/types/image-types';

/**
 * OpenRouter configuration for vision requests
 */
const VISION_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  model: 'google/gemini-2.0-flash-001', // Supports vision + fast
  timeout: 15000,
  maxRetries: 2,
};

/**
 * Result from vision description extraction
 */
export interface VisionDescriptionResult {
  success: boolean;
  description?: string;
  category?: string;
  color?: string;
  error?: string;
}

/**
 * Extracts a clean product description from an image URL using Gemini Vision API
 *
 * @param imageUrl - Product image URL
 * @param productName - Original product name (for context)
 * @param category - Product category hint
 * @returns Promise resolving to description result
 */
export async function extractProductDescription(
  imageUrl: string,
  productName: string,
  category: string
): Promise<VisionDescriptionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'OpenRouter API key not configured',
    };
  }

  try {
    // Build vision prompt
    const prompt = buildVisionPrompt(category);

    const response = await fetch(`${VISION_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ootday.com',
        'X-Title': 'OOTDay Fashion Assistant',
      },
      body: JSON.stringify({
        model: VISION_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.3, // Lower for more consistent descriptions
      }),
      signal: AbortSignal.timeout(VISION_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`Vision API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      throw new Error('No description returned from vision API');
    }

    // Parse response (expects JSON format)
    const parsed = parseVisionResponse(description);

    console.log(`[Vision] Extracted: "${parsed.description}" for ${category}`);

    return {
      success: true,
      description: parsed.description,
      category: parsed.category || category,
      color: parsed.color,
    };
  } catch (error) {
    console.error('[Vision] Failed to extract description:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown vision error',
    };
  }
}

/**
 * Builds a vision prompt optimized for product description extraction
 */
function buildVisionPrompt(category: string): string {
  return `Analyze this ${category} product image and provide a concise fashion description suitable for flat-lay generation.

Focus on:
- Style/cut/silhouette (e.g., "midi dress", "pointed-toe heels", "structured tote")
- Material/texture if visible (e.g., "leather", "knit", "satin")
- Key design details (e.g., "with gold hardware", "sleeveless", "button-front")
- Color (primary color only)

Ignore:
- People/models/hands
- Background/setting
- Brand names/logos
- Price/SKU information

Return ONLY a JSON object with this exact format:
{
  "description": "brief product description in English (max 10 words)",
  "category": "${category}",
  "color": "primary color"
}

Example for a dress: {"description": "beige sleeveless midi dress with fitted waist", "category": "dress", "color": "beige"}`;
}

/**
 * Parses vision API response (handles both JSON and plain text)
 */
function parseVisionResponse(text: string): {
  description: string;
  category?: string;
  color?: string;
} {
  try {
    // Try to parse as JSON first
    const json = JSON.parse(text);
    return {
      description: json.description || text,
      category: json.category,
      color: json.color,
    };
  } catch {
    // Fallback: use raw text as description
    return {
      description: text.substring(0, 100), // Cap at 100 chars
    };
  }
}

/**
 * Batch processes multiple product images in parallel
 *
 * @param items - Array of flat-lay items with image URLs
 * @param maxConcurrency - Maximum parallel vision requests (default: 3)
 * @returns Promise resolving to items with enhanced descriptions
 */
export async function batchExtractDescriptions(
  items: FlatLayItem[],
  maxConcurrency: number = 3
): Promise<FlatLayItem[]> {
  const results: FlatLayItem[] = [];

  // Process in batches to respect API rate limits
  for (let i = 0; i < items.length; i += maxConcurrency) {
    const batch = items.slice(i, i + maxConcurrency);

    const batchResults = await Promise.all(
      batch.map(async (item) => {
        if (!item.thumbnailUrl) {
          console.warn(`[Vision] No thumbnail URL for ${item.name}`);
          return item;
        }

        const visionResult = await extractProductDescription(
          item.thumbnailUrl,
          item.name,
          item.category
        );

        if (visionResult.success && visionResult.description) {
          return {
            ...item,
            visualDescription: visionResult.description,
            color: visionResult.color || item.color,
          };
        }

        // Fallback to original item if vision fails
        return item;
      })
    );

    results.push(...batchResults);
  }

  const successCount = results.filter((r) => r.visualDescription).length;
  console.log(`[Vision] Batch complete: ${successCount}/${items.length} descriptions extracted`);

  return results;
}
