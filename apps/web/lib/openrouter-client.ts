/**
 * OpenRouter API Client for LLM Model Testing
 * Handles API requests to OpenRouter with error handling and retry logic
 */

import { OpenRouterResponse, OpenRouterError, TokenUsage } from './types/test-types';
import type { ProductContext } from './utils/product-context-serializer';
import { formatProductContextForPrompt } from './utils/product-context-serializer';
import { SYSTEM_PROMPT_V2 } from './prompts/system-prompt-v2';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  modelId: string;
  systemPrompt?: string; // Optional - uses default System Prompt v2.2 if not provided
  userMessage: string;
  conversationHistory?: Message[]; // Full conversation history for context awareness
  productContext?: ProductContext; // Product data for fashion recommendations
  timeout?: number;
  maxRetries?: number;
}

export interface ChatCompletionResult {
  content: string;
  tokenUsage: TokenUsage;
  responseTime: number;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private systemPromptCache: string | null = null;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_MAX_RETRIES = 3;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required. Set NEXT_PUBLIC_OPENROUTER_API_KEY in .env.local');
    }
  }

  /**
   * Get default system prompt
   * Now uses System Prompt v2.0 with enhanced features
   * - Friendly conversational tone
   * - Duplicate prevention awareness
   * - Smart clarification instructions
   * - Topic guardrails
   */
  private getSystemPrompt(): string {
    if (this.systemPromptCache) {
      return this.systemPromptCache;
    }

    // Use System Prompt v2.0
    this.systemPromptCache = SYSTEM_PROMPT_V2;

    return this.systemPromptCache;
  }

  /**
   * Exponential backoff delay calculation
   */
  private getBackoffDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send chat completion request to OpenRouter API
   */
  async sendChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const {
      modelId,
      systemPrompt: customSystemPrompt,
      userMessage,
      conversationHistory,
      productContext,
      timeout = this.DEFAULT_TIMEOUT,
      maxRetries = this.DEFAULT_MAX_RETRIES
    } = options;

    // Get system prompt (uses cache after first load)
    let systemPrompt = customSystemPrompt || this.getSystemPrompt();

    // Enhance system prompt with product context if provided
    if (productContext) {
      const productData = formatProductContextForPrompt(productContext);
      systemPrompt = `${systemPrompt}

=== PRODUCT CATALOG ===
You have access to ${productContext.totalCount} products from Central Group.
Below are the most relevant products for this query:

${productData}

🚨 CRITICAL PRODUCT RECOMMENDATION RULES:
1. **ONLY recommend products listed in the catalog above** - DO NOT invent or hallucinate products
2. **Verify every product you recommend appears in the catalog** - Check the product name matches exactly
3. **Match gender correctly**: If user asks for "ผู้ชาย" (men), ONLY recommend products with Gender: men
4. **Match gender correctly**: If user asks for "ผู้หญิง" (women), ONLY recommend products with Gender: women
5. **Use EXACT product information** from the catalog (Name, Brand, Price, Gender, URL)
6. **INCLUDE THE ACTUAL URL IN YOUR RESPONSE** - Copy the full URL from "URL: https://..." field and paste it directly in your response
7. **URL FORMAT REQUIREMENT**: When mentioning a product, include the URL like this: "🔗 https://www.central.co.th/..." (full clickable URL, NOT "[Central Online Link]" or any placeholder text)
8. **If no suitable products exist** in the catalog for the user's criteria, say so honestly

❌ FORBIDDEN:
- Recommending products not in the catalog
- Wrong gender products
- Making up product details
- Using "[Central Online Link]" or placeholder text instead of actual URLs
- Omitting product URLs from your response

✅ REQUIRED:
- Only suggest products that are explicitly listed above with matching gender
- Include the FULL URL for each product (e.g., "🔗 https://www.central.co.th/en/...")
`;
    }

    // Build messages array
    // If conversationHistory is provided, use it; otherwise just send current message
    let messages: Array<{ role: string; content: string }>;

    if (conversationHistory && conversationHistory.length > 0) {
      // Use full conversation history for context awareness
      messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];
    } else {
      // Fallback: single turn conversation (backward compatible)
      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];
    }

    // DEBUG: Log API request details
    console.log('[DEBUG] ========================================');
    console.log('[DEBUG] OPENROUTER API REQUEST:');
    console.log('[DEBUG]   Model:', modelId);
    console.log('[DEBUG]   Conversation history messages:', conversationHistory?.length || 0);
    console.log('[DEBUG]   Total messages in request:', messages.length);
    console.log('[DEBUG]   System prompt length:', systemPrompt.length, 'chars');
    if (productContext) {
      console.log('[DEBUG]   Product context included: YES');
      console.log('[DEBUG]   Products in context:', productContext.totalCount);
      console.log('[DEBUG]   System prompt contains "PRODUCT CATALOG":', systemPrompt.includes('PRODUCT CATALOG'));
    } else {
      console.log('[DEBUG]   Product context included: NO');
    }
    console.log('[DEBUG] ========================================');

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ootday.app', // Optional: your app URL
            'X-Title': 'OOTDay Fashion Assistant' // Optional: your app name
          },
          body: JSON.stringify({
            model: modelId,
            messages
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        // Handle HTTP errors
        if (!response.ok) {
          const errorData: OpenRouterError = await response.json().catch(() => ({
            error: {
              message: response.statusText,
              type: 'unknown',
              code: response.status
            }
          }));

          // Rate limit error - retry with exponential backoff
          if (response.status === 429) {
            if (attempt < maxRetries) {
              const delay = this.getBackoffDelay(attempt);
              console.warn(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
              await this.sleep(delay);
              continue;
            }
            throw new Error(`Rate limit exceeded after ${maxRetries} retries`);
          }

          // Invalid API key
          if (response.status === 401) {
            throw new Error('Invalid OpenRouter API key. Please check your NEXT_PUBLIC_OPENROUTER_API_KEY in .env.local');
          }

          // Other errors
          throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        // Parse successful response
        const data: OpenRouterResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from model');
        }

        return {
          content: data.choices[0].message.content,
          tokenUsage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          },
          responseTime
        };

      } catch (error: any) {
        lastError = error;

        // Don't retry for certain errors
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        if (error.message?.includes('Invalid OpenRouter API key')) {
          throw error; // Don't retry for auth errors
        }

        // Retry for network errors
        if (attempt < maxRetries && (error.message?.includes('fetch') || error.message?.includes('network'))) {
          const delay = this.getBackoffDelay(attempt);
          console.warn(`Network error. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await this.sleep(delay);
          continue;
        }

        // No more retries
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Get the cached system prompt (useful for testing)
   */
  getDefaultSystemPrompt(): string {
    return this.getSystemPrompt();
  }
}
