/**
 * Image Generation Service
 * Client for OpenRouter API using Gemini 2.5 Flash Preview Image model for outfit visualization
 *
 * Features:
 * - Fashion-specific prompt engineering
 * - Error handling with retries
 * - Timeout protection
 * - Rate limiting awareness
 */

import type { ImageGenerationRequest, ImageGenerationResponse, FlatLayRequest } from '../types/image-types';
import { buildFlatLayPrompt, buildFashionPrompt } from '../prompts/image-prompts';

/**
 * OpenRouter API configuration
 */
const OPENROUTER_CONFIG = {
  /** OpenRouter API base URL */
  baseUrl: 'https://openrouter.ai/api/v1',
  /**
   * Model ID for Gemini 3 Pro Image Preview - Nano Banana Pro (text-to-image capable)
   * Google's most advanced image-generation and editing model
   */
  model: 'google/gemini-2.5-flash-image',
  /** Request timeout in milliseconds */
  timeout: 30000,
  /** Maximum retry attempts on failure */
  maxRetries: 2,
  /** Exponential backoff base delay (ms) */
  retryDelay: 1000,
};

/**
 * OpenRouter Image Generation Client
 * Handles communication with OpenRouter API for outfit image generation
 */
export class OpenRouterImageClient {
  private apiKey: string;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  /**
   * Creates a new OpenRouter image client
   *
   * @param apiKey - OpenRouter API key
   * @throws Error if API key is not provided
   */
  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Configuration for fitting model generation
   */
  private static readonly FITTING_MODEL_CONFIG = {
    /** Extended timeout for fitting model generation (60 seconds) */
    timeout: 60000,
  };

  /**
   * Generates an outfit image from description using Gemini 2.5 Flash Preview
   *
   * @param description - Outfit description extracted from conversation
   * @param options - Optional style parameters
   * @returns Promise resolving to image generation response
   *
   * @example
   * const client = new OpenRouterImageClient(apiKey);
   * const response = await client.generateOutfitImage(
   *   "White shirt with black pants for business meeting",
   *   { style: { composition: 'flat-lay' } }
   * );
   */
  async generateOutfitImage(
    description: string,
    options?: ImageGenerationRequest['style']
  ): Promise<ImageGenerationResponse> {
    // Validate input
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return {
        success: false,
        error: 'INVALID_DESCRIPTION',
        message: 'Outfit description is required',
      };
    }

    // Check client-side rate limiting (basic protection)
    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before trying again.',
      };
    }

    // Attempt generation with retries
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= OPENROUTER_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff delay
          const delay = OPENROUTER_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          console.log(`[ImageGen] Retry attempt ${attempt}/${OPENROUTER_CONFIG.maxRetries}`);
        }

        const result = await this.makeRequest(description, options);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`[ImageGen] Attempt ${attempt + 1} failed:`, error);

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: 'Unable to generate image. Please try again later.',
    };
  }

  /**
   * Generates a fitting model image using a reference image for face-matching.
   * Uses OpenRouter's multimodal content format to pass the reference image.
   *
   * @param prompt - Fitting model generation prompt with style requirements
   * @param referenceImageBase64 - Base64 encoded reference image (with data URL prefix)
   * @returns Promise resolving to image generation response
   *
   * @example
   * const client = new OpenRouterImageClient(apiKey);
   * const response = await client.generateFittingModelImage(
   *   "Create a photorealistic fitting model...",
   *   "data:image/jpeg;base64,/9j/4AAQ..."
   * );
   */
  async generateFittingModelImage(
    prompt: string,
    referenceImageBase64: string
  ): Promise<ImageGenerationResponse> {
    // Validate inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return {
        success: false,
        error: 'INVALID_PROMPT',
        message: 'Fitting model prompt is required',
      };
    }

    if (!referenceImageBase64 || typeof referenceImageBase64 !== 'string' || referenceImageBase64.trim() === '') {
      return {
        success: false,
        error: 'INVALID_REFERENCE_IMAGE',
        message: 'Reference image is required for fitting model generation',
      };
    }

    if (!referenceImageBase64.startsWith('data:image/')) {
      return {
        success: false,
        error: 'INVALID_REFERENCE_IMAGE_FORMAT',
        message: 'Reference image must be a base64 data URL (e.g., data:image/jpeg;base64,...)',
      };
    }

    // Check client-side rate limiting
    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before trying again.',
      };
    }

    // Attempt generation with retries
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= OPENROUTER_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff delay
          const delay = OPENROUTER_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          console.log(`[ImageGen] Fitting model retry attempt ${attempt}/${OPENROUTER_CONFIG.maxRetries}`);
        }

        const result = await this.makeFittingModelRequest(prompt, referenceImageBase64);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`[ImageGen] Fitting model attempt ${attempt + 1} failed:`, error);

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: 'Unable to generate fitting model image. Please try again later.',
    };
  }

  /**
   * Generates a flat-lay image from a pre-built prompt (no wrapping).
   * Sends the prompt directly to the image model with 1:1 aspect ratio.
   * Used by the occasion flat-lay pipeline where the AI has already crafted the prompt.
   *
   * @param prompt - Complete image generation prompt (already formatted)
   * @returns Promise resolving to image generation response
   */
  async generateRawFlatLay(prompt: string): Promise<ImageGenerationResponse> {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return {
        success: false,
        error: 'INVALID_PROMPT',
        message: 'Flat-lay prompt is required',
      };
    }

    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before trying again.',
      };
    }

    for (let attempt = 0; attempt <= OPENROUTER_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = OPENROUTER_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          console.log(`[ImageGen] Raw flat-lay retry attempt ${attempt}/${OPENROUTER_CONFIG.maxRetries}`);
        }

        const result = await this.makeFlatLayRequest(prompt);
        return result;
      } catch (error) {
        console.error(`[ImageGen] Raw flat-lay attempt ${attempt + 1} failed:`, error);

        if (this.isNonRetryableError(error)) {
          break;
        }
      }
    }

    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: 'Unable to generate flat-lay image. Please try again later.',
    };
  }

  /**
   * Generates a flat-lay image showing recommended items individually placed on a white background.
   *
   * @param request - Flat-lay request containing items to display
   * @returns Promise resolving to image generation response
   *
   * @example
   * const client = new OpenRouterImageClient(apiKey);
   * const response = await client.generateFlatLayImage({
   *   items: [
   *     { name: 'Navy blue button-front dress', category: 'Dress', color: 'navy blue' },
   *     { name: 'Black leather oxford shoes', category: 'Shoes', color: 'black' }
   *   ],
   *   occasionContext: 'work outfit'
   * });
   */
  async generateFlatLayImage(
    request: FlatLayRequest
  ): Promise<ImageGenerationResponse> {
    // Validate inputs
    if (!request.items || !Array.isArray(request.items) || request.items.length === 0) {
      return {
        success: false,
        error: 'INVALID_ITEMS',
        message: 'At least one item is required for flat-lay generation',
      };
    }

    // Check client-side rate limiting
    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before trying again.',
      };
    }

    // Attempt generation with retries
    for (let attempt = 0; attempt <= OPENROUTER_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff delay
          const delay = OPENROUTER_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          console.log(`[ImageGen] Flat-lay retry attempt ${attempt}/${OPENROUTER_CONFIG.maxRetries}`);
        }

        const prompt = buildFlatLayPrompt(request.items, request.occasionContext);
        const result = await this.makeFlatLayRequest(prompt);
        return result;
      } catch (error) {
        console.error(`[ImageGen] Flat-lay attempt ${attempt + 1} failed:`, error);

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: 'Unable to generate flat-lay image. Please try again later.',
    };
  }

  /**
   * Makes API request to OpenRouter for flat-lay generation
   *
   * @private
   */
  private async makeFlatLayRequest(prompt: string): Promise<ImageGenerationResponse> {
    // Build request body
    const requestBody = {
      model: OPENROUTER_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      modalities: ['text', 'image'], // Required for image generation
      max_tokens: 4096,
      image_config: { aspect_ratio: '1:1' as const },
    };

    console.log('[ImageGen] Sending flat-lay request to OpenRouter:', {
      model: requestBody.model,
      promptLength: prompt.length,
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_CONFIG.timeout);

    try {
      const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://ootday.com',
          'X-Title': 'OOTDay Fashion Assistant',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      // Parse response and extract image
      const imageData = this.parseImageResponse(data);

      return {
        success: true,
        imageBase64: imageData.base64,
        imageUrl: imageData.url,
        metadata: {
          model: OPENROUTER_CONFIG.model,
          generatedAt: new Date().toISOString(),
          prompt: prompt,
        },
        message: 'Flat-lay image generated successfully',
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - flat-lay generation took too long');
        }
        throw error;
      }

      throw new Error('Unknown error during flat-lay generation');
    }
  }

  /**
   * Generates a try-on image using dual image references:
   * - IMAGE 1 (fitting model): Used to match the person's face and body exactly
   * - IMAGE 2 (flat-lay): Used to show the exact outfit items the model must wear
   *
   * @param prompt - Try-on generation prompt with dual image instructions
   * @param fittingModelBase64 - Base64 encoded fitting model image (with data URL prefix)
   * @param flatLayBase64 - Base64 encoded flat-lay outfit image (with data URL prefix)
   * @returns Promise resolving to image generation response
   */
  async generateTryOnWithDualReference(
    prompt: string,
    fittingModelBase64: string,
    flatLayBase64: string
  ): Promise<ImageGenerationResponse> {
    // Validate inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return {
        success: false,
        error: 'INVALID_PROMPT',
        message: 'Try-on prompt is required',
      };
    }

    if (!fittingModelBase64 || !fittingModelBase64.startsWith('data:image/')) {
      return {
        success: false,
        error: 'INVALID_FITTING_MODEL_IMAGE',
        message: 'Fitting model image must be a base64 data URL',
      };
    }

    if (!flatLayBase64 || !flatLayBase64.startsWith('data:image/')) {
      return {
        success: false,
        error: 'INVALID_FLAT_LAY_IMAGE',
        message: 'Flat-lay image must be a base64 data URL',
      };
    }

    // Check client-side rate limiting
    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before trying again.',
      };
    }

    // Attempt generation with retries
    for (let attempt = 0; attempt <= OPENROUTER_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = OPENROUTER_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          console.log(`[ImageGen] Dual reference try-on retry attempt ${attempt}/${OPENROUTER_CONFIG.maxRetries}`);
        }

        const result = await this.makeDualReferenceRequest(prompt, fittingModelBase64, flatLayBase64);
        return result;
      } catch (error) {
        console.error(`[ImageGen] Dual reference try-on attempt ${attempt + 1} failed:`, error);

        if (this.isNonRetryableError(error)) {
          break;
        }
      }
    }

    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: 'Unable to generate try-on image. Please try again later.',
    };
  }

  /**
   * Makes multimodal API request with TWO reference images for try-on generation
   *
   * @private
   */
  private async makeDualReferenceRequest(
    prompt: string,
    fittingModelBase64: string,
    flatLayBase64: string
  ): Promise<ImageGenerationResponse> {
    // Build multimodal request body with text + 2 images
    // Order: text first, then images (IMAGE 1 = fitting model, IMAGE 2 = flat-lay)
    const requestBody = {
      model: OPENROUTER_CONFIG.model,
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
                url: fittingModelBase64,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: flatLayBase64,
              },
            },
          ],
        },
      ],
      modalities: ['text', 'image'],
      max_tokens: 4096,
      image_config: { aspect_ratio: '3:4' as const },
    };

    console.log('[ImageGen] Sending dual reference try-on request to OpenRouter:', {
      model: requestBody.model,
      promptLength: prompt.length,
      hasFittingModelImage: true,
      hasFlatLayImage: true,
    });

    // Create abort controller with extended timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      OpenRouterImageClient.FITTING_MODEL_CONFIG.timeout
    );

    try {
      const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://ootday.com',
          'X-Title': 'OOTDay Fashion Assistant',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const imageData = this.parseImageResponse(data);

      return {
        success: true,
        imageBase64: imageData.base64,
        imageUrl: imageData.url,
        metadata: {
          model: OPENROUTER_CONFIG.model,
          generatedAt: new Date().toISOString(),
          prompt: prompt,
        },
        message: 'Dual reference try-on image generated successfully',
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - dual reference try-on generation took too long');
        }
        throw error;
      }

      throw new Error('Unknown error during dual reference try-on generation');
    }
  }

  /**
   * Makes multimodal API request to OpenRouter for fitting model generation
   *
   * @private
   */
  private async makeFittingModelRequest(
    prompt: string,
    referenceImageBase64: string
  ): Promise<ImageGenerationResponse> {
    // Build multimodal request body with text + image content
    // OpenRouter expects text first, then images (per documentation)
    const requestBody = {
      model: OPENROUTER_CONFIG.model,
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
                url: referenceImageBase64,
              },
            },
          ],
        },
      ],
      modalities: ['text', 'image'], // Required for image generation output
      max_tokens: 4096,
      image_config: { aspect_ratio: '3:4' as const },
    };

    console.log('[ImageGen] Sending fitting model request to OpenRouter:', {
      model: requestBody.model,
      promptLength: prompt.length,
      hasReferenceImage: true,
    });

    // Create abort controller with extended timeout for fitting model
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      OpenRouterImageClient.FITTING_MODEL_CONFIG.timeout
    );

    try {
      const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://ootday.com',
          'X-Title': 'OOTDay Fashion Assistant',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      // Parse response and extract image using existing method
      const imageData = this.parseImageResponse(data);

      return {
        success: true,
        imageBase64: imageData.base64,
        imageUrl: imageData.url,
        metadata: {
          model: OPENROUTER_CONFIG.model,
          generatedAt: new Date().toISOString(),
          prompt: prompt,
        },
        message: 'Fitting model image generated successfully',
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - fitting model generation took too long');
        }
        throw error;
      }

      throw new Error('Unknown error during fitting model generation');
    }
  }

  /**
   * Makes the actual API request to OpenRouter
   *
   * @private
   */
  private async makeRequest(
    description: string,
    options?: ImageGenerationRequest['style']
  ): Promise<ImageGenerationResponse> {
    // Build fashion-specific prompt
    const prompt = buildFashionPrompt(description, options);

    // Create request payload - OpenRouter image generation requires messages format with modalities
    const requestBody = {
      model: OPENROUTER_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      modalities: ['text', 'image'], // Required for image generation
      max_tokens: 4096, // For image generation
      image_config: { aspect_ratio: '3:4' as const },
    };

    console.log('[ImageGen] Sending request to OpenRouter:', {
      model: requestBody.model,
      promptLength: prompt.length,
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_CONFIG.timeout);

    try {
      const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://ootday.com', // Optional: Your site URL
          'X-Title': 'OOTDay Fashion Assistant', // Optional: Your app name
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      // Parse response and extract image
      // Note: Gemini 2.5 Flash Preview returns image as base64 in content
      const imageData = this.parseImageResponse(data);

      return {
        success: true,
        imageBase64: imageData.base64,
        imageUrl: imageData.url,
        metadata: {
          model: OPENROUTER_CONFIG.model,
          generatedAt: new Date().toISOString(),
          prompt: prompt,
        },
        message: 'Image generated successfully',
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - image generation took too long');
        }
        throw error;
      }

      throw new Error('Unknown error during image generation');
    }
  }

  /**
   * Parses image response from OpenRouter API
   * OpenRouter returns images in an 'images' array within the assistant message
   *
   * @private
   */
  private parseImageResponse(data: any): { base64?: string; url?: string } {
    // OpenRouter returns images as base64 data URLs in the 'images' array
    // Format: { choices: [{ message: { content: "...", images: ["data:image/png;base64,..."] } }] }

    try {
      console.log('[ImageGen] Parsing response:', JSON.stringify(data).slice(0, 500));

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const message = data.choices[0].message;

        // Primary format: images array (OpenRouter standard)
        if (message.images && Array.isArray(message.images) && message.images.length > 0) {
          const imageData = message.images[0];
          console.log('[ImageGen] Found image in images array, type:', typeof imageData);

          // Images are returned as data URLs (data:image/png;base64,...)
          if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
            return { base64: imageData };
          }

          // Or as object with nested structure: {"type":"image_url","image_url":{"url":"data:..."}}
          if (typeof imageData === 'object') {
            // Check for image_url.url format (OpenRouter Gemini format)
            if (imageData.image_url?.url) {
              console.log('[ImageGen] Found image in image_url.url format');
              const url = imageData.image_url.url;
              if (url.startsWith('data:image')) {
                return { base64: url };
              }
              return { url };
            }
            // Check for b64_json format
            if (imageData.b64_json) {
              return { base64: `data:image/png;base64,${imageData.b64_json}` };
            }
            // Check for direct base64/url
            if (imageData.base64) {
              return { base64: imageData.base64.startsWith('data:') ? imageData.base64 : `data:image/png;base64,${imageData.base64}` };
            }
            if (imageData.url) {
              return { url: imageData.url };
            }
          }
        }

        // Check content for embedded base64 or URLs
        const content = message.content;
        if (typeof content === 'string') {
          // Check if content contains base64 image data
          const base64Match = content.match(/data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+/);
          if (base64Match) {
            console.log('[ImageGen] Found base64 image in content');
            return { base64: base64Match[0] };
          }

          // Check for URL in content
          const urlMatch = content.match(/(https?:\/\/[^\s<>"]+\.(png|jpg|jpeg|gif|webp))/i);
          if (urlMatch) {
            console.log('[ImageGen] Found URL in content');
            return { url: urlMatch[0] };
          }
        }

        // Check for structured image data (fallback)
        if (message.image) {
          console.log('[ImageGen] Found image in message.image');
          return {
            base64: message.image.base64 || (message.image.b64_json ? `data:image/png;base64,${message.image.b64_json}` : undefined),
            url: message.image.url,
          };
        }
      }

      // Fallback: return empty (will need to handle in caller)
      console.warn('[ImageGen] Could not parse image from response. Keys:', Object.keys(data));
      if (data.choices?.[0]?.message) {
        console.warn('[ImageGen] Message keys:', Object.keys(data.choices[0].message));
      }
      return {};
    } catch (error) {
      console.error('[ImageGen] Error parsing image response:', error);
      return {};
    }
  }

  /**
   * Client-side rate limiting check
   * Limits to approximately 10 requests per minute
   *
   * @private
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const minuteAgo = now - 60000;

    // Reset counter if a minute has passed
    if (this.lastRequestTime < minuteAgo) {
      this.requestCount = 0;
    }

    // Check if under limit
    if (this.requestCount >= 10) {
      return false;
    }

    // Update counters
    this.requestCount++;
    this.lastRequestTime = now;

    return true;
  }

  /**
   * Checks if error is non-retryable (auth, validation, etc.)
   *
   * @private
   */
  private isNonRetryableError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message || error.toString();

    // Don't retry authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      return true;
    }

    // Don't retry validation errors
    if (errorMessage.includes('400') || errorMessage.includes('INVALID')) {
      return true;
    }

    // Don't retry rate limit errors (need to wait)
    if (errorMessage.includes('429') || errorMessage.includes('RATE_LIMIT')) {
      return true;
    }

    return false;
  }

  /**
   * Sleep utility for retry delays
   *
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Creates a new OpenRouter image client with API key from environment
 *
 * @returns OpenRouterImageClient instance or null if API key not available
 *
 * @example
 * const client = createImageClient();
 * if (client) {
 *   const response = await client.generateOutfitImage(description);
 * }
 */
export function createImageClient(): OpenRouterImageClient | null {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn('[ImageGen] OPENROUTER_API_KEY not found in environment');
    return null;
  }

  try {
    return new OpenRouterImageClient(apiKey);
  } catch (error) {
    console.error('[ImageGen] Failed to create image client:', error);
    return null;
  }
}
