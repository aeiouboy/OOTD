/**
 * Occasion Flat-Lay Orchestration Service
 * Orchestrates AI curation + flat-lay image generation for occasion presets
 */

import type { OccasionFlatLayRequest, OccasionFlatLayResponse, FlatLayItem } from '../types/image-types';
import { buildOccasionFlatLaySystemPrompt, getOccasionPresetConfig } from '../prompts/occasion-flat-lay-prompt';
import { computeFlatLayLayout } from '../prompts/image-prompts';
import { OpenRouterImageClient } from './image-generation-service';

const LOG_PREFIX = '[OccasionFlatLay]';
const MIN_CURATED_ITEMS = 3;

/**
 * OpenRouter chat completion configuration for AI curation
 * Uses a text model (not image generation model) for outfit curation
 */
const CURATION_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  model: 'google/gemini-3-flash-preview',  // Text model for curation (same as ai-chat-service)
  timeout: 30000,
  maxTokens: 2048,
};

/**
 * Parse AI response to extract curated items and image prompt
 */
export function parseAIResponse(responseText: string): {
  curatedItems: FlatLayItem[];
  imagePrompt: string | null;
} {
  const curatedItems: FlatLayItem[] = [];
  let imagePrompt: string | null = null;

  // Extract CURATED_ITEMS section
  const itemsMatch = responseText.match(/CURATED_ITEMS:\s*\n([\s\S]*?)(?=IMAGE_PROMPT:|$)/i);
  if (itemsMatch) {
    const itemLines = itemsMatch[1].trim().split('\n').filter(line => line.trim());
    for (const line of itemLines) {
      // Parse: "1. Item Name | Category | Color | Visual Description"
      const match = line.match(/^\d+\.\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/);
      if (match) {
        curatedItems.push({
          name: match[1].trim(),
          category: match[2].trim(),
          color: match[3].trim(),
          visualDescription: match[4].trim(),
        });
      }
    }
  }

  // Deduplicate by category — keep first item per category (spec: no duplicate outfit items)
  const seenCategories = new Set<string>();
  const deduplicatedItems: FlatLayItem[] = [];
  for (const item of curatedItems) {
    const categoryKey = item.category.toLowerCase();
    if (!seenCategories.has(categoryKey)) {
      seenCategories.add(categoryKey);
      deduplicatedItems.push(item);
    }
  }

  // Extract IMAGE_PROMPT section
  const promptMatch = responseText.match(/IMAGE_PROMPT:\s*\n([\s\S]*?)$/i);
  if (promptMatch) {
    imagePrompt = promptMatch[1].trim();
  }

  return { curatedItems: deduplicatedItems, imagePrompt };
}

/**
 * Build a structured image generation prompt from parsed curated items.
 * Uses spatial layout positioning to ensure every curated item is explicitly
 * placed in the image with clear positional context for the image model.
 */
export function buildImagePromptFromItems(
  curatedItems: FlatLayItem[],
  occasionLabel: string
): string {
  const count = curatedItems.length;
  const layout = computeFlatLayLayout(curatedItems);

  // Determine layout pattern label
  let layoutPattern: string;
  if (count <= 3) layoutPattern = 'inverted triangle arrangement';
  else if (count === 4) layoutPattern = '2\u00D72 grid';
  else if (count === 5) layoutPattern = 'cross/diamond arrangement';
  else layoutPattern = '2\u00D73 grid';

  // Build item lines with spatial positions
  const itemLines = layout.map((entry) => {
    const colorInfo = entry.item.color ? `${entry.item.color.toLowerCase()} ` : '';
    return `- ${entry.position} (${entry.sizeHint}): a ${colorInfo}${entry.item.name.toLowerCase()} (${entry.item.category.toLowerCase()}), ${entry.presentationHint}`;
  }).join('\n');

  return `Generate a professional overhead flat-lay photograph with NO text, labels, watermarks, or written words of any kind. The image shows exactly ${count} fashion items arranged on a pristine white surface as a coordinated ${occasionLabel.toLowerCase()} outfit. The layout is a balanced ${layoutPattern}:\n${itemLines}\nEach item is clearly separated with generous spacing between pieces. All ${count} items are fully visible with no overlap or cropping. Photographed from directly overhead with soft, diffused studio lighting. Professional e-commerce product photography quality. Square 1:1 format.`;
}

/**
 * Call OpenRouter chat completion for AI outfit curation
 */
async function callAICuration(
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CURATION_CONFIG.timeout);

  try {
    const response = await fetch(`${CURATION_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ootday.com',
        'X-Title': 'OOTDay Fashion Assistant',
      },
      body: JSON.stringify({
        model: CURATION_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please curate an outfit for me based on the occasion and my profile, then generate the flat-lay image prompt.' },
        ],
        max_tokens: CURATION_CONFIG.maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${(errorData as any).error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = (data as any).choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('Empty or invalid response from AI curation');
    }

    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI curation request timed out');
    }
    throw error;
  }
}

/**
 * Main orchestration function: AI curation -> image prompt extraction -> image generation
 */
export async function generateOccasionFlatLay(
  request: OccasionFlatLayRequest,
  apiKey: string
): Promise<OccasionFlatLayResponse> {
  console.log(`${LOG_PREFIX} Starting generation for occasion: ${request.occasion}`);

  try {
    // Step 1: Build system prompt
    const systemPrompt = buildOccasionFlatLaySystemPrompt(request);
    console.log(`${LOG_PREFIX} System prompt built (${systemPrompt.length} chars)`);

    // Step 2: Call AI for outfit curation + image prompt
    console.log(`${LOG_PREFIX} Calling AI curation...`);
    const aiResponse = await callAICuration(systemPrompt, apiKey);
    console.log(`${LOG_PREFIX} AI curation response received (${aiResponse.length} chars)`);

    // Step 3: Parse AI response
    const { curatedItems, imagePrompt } = parseAIResponse(aiResponse);
    console.log(`${LOG_PREFIX} Parsed ${curatedItems.length} curated items`);

    if (!imagePrompt) {
      console.error(`${LOG_PREFIX} No image prompt found in AI response`);
      return {
        success: false,
        curatedItems,
        error: 'AI_PARSE_ERROR',
        message: 'Could not extract image prompt from AI response',
      };
    }

    if (curatedItems.length < MIN_CURATED_ITEMS) {
      console.error(`${LOG_PREFIX} Insufficient curated items: ${curatedItems.length} (minimum ${MIN_CURATED_ITEMS})`);
      return {
        success: false,
        curatedItems,
        imagePrompt,
        error: 'INSUFFICIENT_ITEMS',
        message: `AI returned ${curatedItems.length} items, but a complete look requires at least ${MIN_CURATED_ITEMS}`,
      };
    }

    console.log(`${LOG_PREFIX} AI image prompt extracted (${imagePrompt.length} chars)`);

    // Step 4: Build a structured image prompt from parsed items (not the AI's free-text)
    // Image models often drop items when described loosely in a paragraph.
    // By constructing the prompt from the structured curatedItems array with explicit
    // count reinforcement, every item is guaranteed to be listed for the image model.
    const config = getOccasionPresetConfig(request.occasion);
    const structuredImagePrompt = buildImagePromptFromItems(curatedItems, config.label);
    console.log(`${LOG_PREFIX} Structured image prompt built (${structuredImagePrompt.length} chars, ${curatedItems.length} items)`);

    console.log(`${LOG_PREFIX} Generating flat-lay image...`);
    const imageClient = new OpenRouterImageClient(apiKey);
    const imageResult = await imageClient.generateRawFlatLay(structuredImagePrompt);

    if (!imageResult.success) {
      console.error(`${LOG_PREFIX} Image generation failed:`, imageResult.error);
      return {
        success: false,
        curatedItems,
        imagePrompt: structuredImagePrompt,
        error: imageResult.error || 'IMAGE_GENERATION_FAILED',
        message: imageResult.message || 'Failed to generate flat-lay image',
      };
    }

    console.log(`${LOG_PREFIX} Flat-lay image generated successfully`);

    return {
      success: true,
      imageBase64: imageResult.imageBase64,
      imageUrl: imageResult.imageUrl,
      curatedItems,
      imagePrompt: structuredImagePrompt,
      message: 'Occasion flat-lay generated successfully',
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: 'GENERATION_ERROR',
      message: `Failed to generate occasion flat-lay: ${errorMessage}`,
    };
  }
}
