/**
 * Embedding Service for RAG Module
 *
 * Handles embedding generation using OpenRouter API.
 * Includes caching, batch processing, and error handling.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import { RAG_CONFIG, getRAGConfig } from './config';
import type { EmbeddingResult, BatchEmbeddingResult } from './types';

/**
 * Cache entry structure
 */
interface CacheEntry {
  embedding: number[];
  timestamp: number;
  tokenCount: number;
}

/**
 * Query embedding cache (LRU-style)
 */
const embeddingCache = new Map<string, CacheEntry>();

/**
 * Generate a cache key from text
 */
function generateCacheKey(text: string): string {
  // Simple hash for cache key
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `emb_${hash}_${text.length}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  const config = getRAGConfig();
  return Date.now() - entry.timestamp < config.embedding.cacheTTL;
}

/**
 * Manage cache size (evict oldest entries)
 */
function manageCache(): void {
  const config = getRAGConfig();
  if (embeddingCache.size > config.cache.maxCacheSize) {
    // Remove oldest entries
    const entries = Array.from(embeddingCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, Math.floor(entries.length / 4));
    toRemove.forEach(([key]) => embeddingCache.delete(key));
  }
}

/**
 * Get cached embedding if available
 */
function getCachedEmbedding(text: string): number[] | null {
  const config = getRAGConfig();
  if (!config.cache.enableQueryCache) return null;

  const key = generateCacheKey(text);
  const entry = embeddingCache.get(key);

  if (entry && isCacheValid(entry)) {
    return entry.embedding;
  }

  // Remove expired entry
  if (entry) {
    embeddingCache.delete(key);
  }

  return null;
}

/**
 * Cache an embedding
 */
function cacheEmbedding(text: string, embedding: number[], tokenCount: number): void {
  const config = getRAGConfig();
  if (!config.cache.enableQueryCache) return;

  const key = generateCacheKey(text);
  embeddingCache.set(key, {
    embedding,
    timestamp: Date.now(),
    tokenCount,
  });

  manageCache();
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 10000);
}

/**
 * Get OpenRouter API key
 */
function getApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
  if (!apiKey) {
    throw new Error('OpenRouter API key is required. Set OPENROUTER_API_KEY or NEXT_PUBLIC_OPENROUTER_API_KEY in .env.local');
  }
  return apiKey;
}

/**
 * Generate embedding for a single text
 *
 * @param text - Text to embed
 * @param useCache - Whether to use caching (default: true)
 * @returns Embedding result with vector and metadata
 */
export async function generateEmbedding(
  text: string,
  useCache: boolean = true
): Promise<EmbeddingResult> {
  const config = getRAGConfig();

  // Check cache first
  if (useCache) {
    const cached = getCachedEmbedding(text);
    if (cached) {
      if (config.logging.logEmbeddings) {
        console.log('[Embeddings] Cache hit for text:', text.substring(0, 50) + '...');
      }
      return {
        embedding: cached,
        dimensions: cached.length,
        tokenCount: 0, // Unknown from cache
      };
    }
  }

  const apiKey = getApiKey();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.embedding.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.embedding.timeout);

      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ootday.app',
          'X-Title': 'OOTDay Fashion Assistant',
        },
        body: JSON.stringify({
          model: config.embedding.model,
          input: text,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: response.statusText },
        }));

        // Rate limit - retry with backoff
        if (response.status === 429 && attempt < config.embedding.maxRetries) {
          const delay = getBackoffDelay(attempt);
          console.warn(`[Embeddings] Rate limited. Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        throw new Error(
          errorData.error?.message || `Embedding request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.data || !data.data[0]?.embedding) {
        throw new Error('Invalid embedding response format');
      }

      const embedding = data.data[0].embedding;
      const tokenCount = data.usage?.total_tokens || 0;

      // Cache the result
      if (useCache) {
        cacheEmbedding(text, embedding, tokenCount);
      }

      if (config.logging.logEmbeddings) {
        console.log('[Embeddings] Generated embedding:', {
          textLength: text.length,
          dimensions: embedding.length,
          tokens: tokenCount,
        });
      }

      return {
        embedding,
        dimensions: embedding.length,
        tokenCount,
      };
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if ((lastError as { name?: string }).name === 'AbortError') {
        throw new Error(`Embedding request timeout after ${config.embedding.timeout}ms`);
      }

      // Retry for network errors
      if (
        attempt < config.embedding.maxRetries &&
        (lastError.message?.includes('fetch') || lastError.message?.includes('network'))
      ) {
        const delay = getBackoffDelay(attempt);
        console.warn(`[Embeddings] Network error. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new Error('Embedding generation failed after all retries');
}

/**
 * Generate embeddings for multiple texts in batch
 *
 * @param texts - Array of texts to embed
 * @param useCache - Whether to use caching (default: true)
 * @returns Batch embedding result with all vectors
 */
export async function generateBatchEmbeddings(
  texts: string[],
  useCache: boolean = true
): Promise<BatchEmbeddingResult> {
  const config = getRAGConfig();

  if (texts.length === 0) {
    return {
      embeddings: [],
      dimensions: config.embedding.dimensions,
      totalTokens: 0,
      successCount: 0,
      failureCount: 0,
    };
  }

  const results: (number[] | null)[] = new Array(texts.length).fill(null);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];
  let totalTokens = 0;

  // Check cache for each text
  if (useCache) {
    texts.forEach((text, index) => {
      const cached = getCachedEmbedding(text);
      if (cached) {
        results[index] = cached;
      } else {
        uncachedIndices.push(index);
        uncachedTexts.push(text);
      }
    });

    if (config.logging.logEmbeddings) {
      console.log(`[Embeddings] Batch: ${texts.length - uncachedTexts.length} cached, ${uncachedTexts.length} to generate`);
    }
  } else {
    texts.forEach((text, index) => {
      uncachedIndices.push(index);
      uncachedTexts.push(text);
    });
  }

  // Process uncached texts in batches
  const batchSize = config.embedding.batchSize;
  let successCount = texts.length - uncachedTexts.length;
  let failureCount = 0;

  for (let i = 0; i < uncachedTexts.length; i += batchSize) {
    const batchTexts = uncachedTexts.slice(i, i + batchSize);
    const batchIndices = uncachedIndices.slice(i, i + batchSize);

    try {
      const apiKey = getApiKey();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.embedding.timeout);

      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ootday.app',
          'X-Title': 'OOTDay Fashion Assistant',
        },
        body: JSON.stringify({
          model: config.embedding.model,
          input: batchTexts,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Batch embedding request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid batch embedding response format');
      }

      // Process batch results
      data.data.forEach((item: { embedding: number[]; index?: number }, idx: number) => {
        const originalIndex = batchIndices[item.index ?? idx];
        const embedding = item.embedding;

        if (embedding && Array.isArray(embedding)) {
          results[originalIndex] = embedding;
          successCount++;

          // Cache the result
          if (useCache) {
            cacheEmbedding(batchTexts[item.index ?? idx], embedding, 0);
          }
        } else {
          failureCount++;
        }
      });

      totalTokens += data.usage?.total_tokens || 0;
    } catch (error) {
      console.error('[Embeddings] Batch processing error:', error);
      failureCount += batchTexts.length;
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < uncachedTexts.length) {
      await sleep(100);
    }
  }

  // Filter out null results and create final embeddings array
  const embeddings = results.filter((r): r is number[] => r !== null);

  return {
    embeddings,
    dimensions: embeddings[0]?.length || config.embedding.dimensions,
    totalTokens,
    successCount,
    failureCount,
  };
}

/**
 * Clear the embedding cache
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  console.log('[Embeddings] Cache cleared');
}

/**
 * Get embedding cache statistics
 */
export function getEmbeddingCacheStats(): {
  size: number;
  maxSize: number;
  hitRate: number;
} {
  const config = getRAGConfig();
  return {
    size: embeddingCache.size,
    maxSize: config.cache.maxCacheSize,
    hitRate: 0, // Would need to track hits/misses for accurate rate
  };
}

/**
 * Precompute and cache embeddings for common queries
 *
 * @param queries - Array of common queries to precompute
 */
export async function precomputeEmbeddings(queries: string[]): Promise<void> {
  console.log(`[Embeddings] Precomputing ${queries.length} embeddings...`);

  const result = await generateBatchEmbeddings(queries, true);

  console.log(`[Embeddings] Precomputed ${result.successCount}/${queries.length} embeddings`);
}

export default {
  generateEmbedding,
  generateBatchEmbeddings,
  clearEmbeddingCache,
  getEmbeddingCacheStats,
  precomputeEmbeddings,
};
