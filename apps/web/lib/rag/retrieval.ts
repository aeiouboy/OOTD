/**
 * Retrieval Pipeline
 *
 * Handles query preprocessing, embedding generation, vector search,
 * and result formatting for the RAG system.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import { RAG_CONFIG, getRAGConfig } from './config';
import { generateEmbedding } from './embeddings';
import {
  initializeVectorStore,
  similaritySearch,
  searchWithFilters,
  isVectorStoreInitialized,
} from './vector-store';
import type {
  RetrievalOptions,
  RetrievalResult,
  RetrievalFilters,
  RetrievalResultMetadata,
  KnowledgeDocument,
  KnowledgeCategory,
  VectorSearchResult,
} from './types';

/**
 * Thai character normalization map
 */
const THAI_NORMALIZATION_MAP: Record<string, string> = {
  // Common variant characters
  '\u0E4D': '\u0E4D', // NIKHAHIT
  '\u0E3A': '', // PHINTHU (often removed)
};

/**
 * Normalize Thai text for better matching
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeThaiText(text: string): string {
  let normalized = text;

  // Apply character normalization
  for (const [from, to] of Object.entries(THAI_NORMALIZATION_MAP)) {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  }

  // Remove Thai tone marks for fuzzy matching (optional - may want to keep for accuracy)
  // const toneMarks = /[\u0E48-\u0E4B]/g;
  // normalized = normalized.replace(toneMarks, '');

  return normalized;
}

/**
 * Normalize query text for retrieval
 *
 * @param query - Raw query text
 * @returns Normalized query
 */
export function normalizeQuery(query: string): string {
  const config = getRAGConfig();
  let normalized = query;

  // Trim whitespace
  if (config.normalization.trimWhitespace) {
    normalized = normalized.replace(/\s+/g, ' ').trim();
  }

  // Lowercase
  if (config.normalization.lowercase) {
    normalized = normalized.toLowerCase();
  }

  // Normalize Thai characters
  if (config.normalization.normalizeThaiChars) {
    normalized = normalizeThaiText(normalized);
  }

  // Remove special characters (optional)
  if (config.normalization.removeSpecialChars) {
    // Keep Thai characters, alphanumeric, and basic punctuation
    normalized = normalized.replace(/[^\u0E00-\u0E7F\w\s.,!?]/g, '');
  }

  return normalized;
}

/**
 * Detect language of query (Thai vs English dominant)
 *
 * @param query - Query text
 * @returns 'thai' | 'english' | 'mixed'
 */
export function detectQueryLanguage(query: string): 'thai' | 'english' | 'mixed' {
  const thaiPattern = /[\u0E00-\u0E7F]/g;
  const thaiMatches = query.match(thaiPattern);
  const thaiCount = thaiMatches ? thaiMatches.length : 0;
  const totalChars = query.replace(/\s/g, '').length;

  if (totalChars === 0) return 'english';

  const thaiRatio = thaiCount / totalChars;

  if (thaiRatio > 0.7) return 'thai';
  if (thaiRatio < 0.3) return 'english';
  return 'mixed';
}

/**
 * Extract potential filters from query text
 *
 * @param query - Query text
 * @returns Detected filters
 */
export function extractFiltersFromQuery(query: string): Partial<RetrievalFilters> {
  const filters: Partial<RetrievalFilters> = {};
  const lowerQuery = query.toLowerCase();

  // Gender detection
  if (/\b(men|man|male|ผู้ชาย|ชาย)\b/i.test(query)) {
    filters.gender = 'men';
  } else if (/\b(women|woman|female|ผู้หญิง|หญิง)\b/i.test(query)) {
    filters.gender = 'women';
  }

  // Occasion detection
  const occasionPatterns: Record<string, RegExp> = {
    wedding: /\b(wedding|แต่งงาน|งานแต่ง)\b/i,
    funeral: /\b(funeral|งานศพ|ฌาปนกิจ)\b/i,
    work: /\b(work|office|ทำงาน|ออฟฟิศ)\b/i,
    temple: /\b(temple|วัด|ไหว้พระ)\b/i,
    casual: /\b(casual|ลำลอง|ชิลล์)\b/i,
    formal: /\b(formal|ทางการ|พิธีการ)\b/i,
    party: /\b(party|ปาร์ตี้|งานเลี้ยง)\b/i,
  };

  for (const [occasion, pattern] of Object.entries(occasionPatterns)) {
    if (pattern.test(query)) {
      filters.occasion = occasion;
      break;
    }
  }

  // Season detection
  if (/\b(hot|ร้อน|summer|หน้าร้อน)\b/i.test(query)) {
    filters.season = 'hot';
  } else if (/\b(rain|rainy|ฝน|หน้าฝน)\b/i.test(query)) {
    filters.season = 'rainy';
  } else if (/\b(cool|cold|หนาว|เย็น)\b/i.test(query)) {
    filters.season = 'cool';
  }

  // Category detection based on keywords
  const categoryPatterns: Record<KnowledgeCategory, RegExp> = {
    color_theory: /\b(color|colour|สี|มงคล|lucky color)\b/i,
    body_types: /\b(body|รูปร่าง|เตี้ย|สูง|อ้วน|ผอม|petite)\b/i,
    occasions: /\b(occasion|งาน|event|wedding|funeral|work)\b/i,
    thai_culture: /\b(thai|ไทย|culture|วัฒนธรรม|ประเพณี)\b/i,
    brand_intelligence: /\b(brand|แบรนด์|size|ไซส์|zara|uniqlo|jaspal)\b/i,
    seasonal_trends: /\b(trend|เทรนด์|season|weather|อากาศ)\b/i,
    styling_rules: /\b(style|styling|mix|match|แมทช์|coordin)\b/i,
  };

  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(query)) {
      filters.category = category as KnowledgeCategory;
      break;
    }
  }

  return filters;
}

/**
 * Convert vector search results to knowledge documents
 *
 * @param results - Vector search results
 * @returns Array of knowledge documents (reconstructed from chunks)
 */
function reconstructDocuments(results: VectorSearchResult[]): KnowledgeDocument[] {
  return results.map((result) => {
    const metadata = result.metadata;

    return {
      id: (metadata.documentId as string) || result.id,
      category: (metadata.category as KnowledgeCategory) || 'styling_rules',
      title: (metadata.title as string) || 'Untitled',
      content: result.text,
      metadata: {
        topics: (metadata.topics as string[]) || [],
        occasions: metadata.occasions as string[] | undefined,
        gender: metadata.gender as ('men' | 'women' | 'unisex')[] | undefined,
        seasonality: metadata.seasonality as ('hot' | 'rainy' | 'cool' | 'all')[] | undefined,
        lastUpdated: (metadata.lastUpdated as string) || new Date().toISOString(),
        source: metadata.source as string | undefined,
        priority: metadata.priority as number | undefined,
      },
    };
  });
}

/**
 * Calculate total token count for retrieved documents
 */
function calculateTokenCount(results: VectorSearchResult[]): number {
  return results.reduce((total, result) => {
    const tokenCount = result.metadata.tokenCount as number | undefined;
    return total + (tokenCount || Math.ceil(result.text.length / 4));
  }, 0);
}

/**
 * Main retrieval function
 *
 * @param query - User query text
 * @param options - Retrieval options
 * @returns Promise resolving to retrieval results
 */
export async function retrieve(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const config = getRAGConfig();
  const startTime = Date.now();

  // Ensure vector store is initialized
  if (!isVectorStoreInitialized()) {
    await initializeVectorStore();
  }

  // Normalize query
  const normalizedQuery = normalizeQuery(query);

  // Extract filters from query if not provided
  const detectedFilters = extractFiltersFromQuery(query);
  const appliedFilters: RetrievalFilters = {
    ...detectedFilters,
    ...options.filters, // User-provided filters override detected ones
  };

  // Retrieval parameters
  const topK = options.topK || config.retrieval.topK;
  const threshold = options.threshold || config.retrieval.similarityThreshold;
  const maxTokens = options.maxTokens || config.retrieval.maxContextTokens;

  if (config.logging.logRetrieval) {
    console.log('[Retrieval] Query:', query);
    console.log('[Retrieval] Normalized:', normalizedQuery);
    console.log('[Retrieval] Filters:', appliedFilters);
  }

  // Generate query embedding
  const embeddingResult = await generateEmbedding(normalizedQuery, true);

  // Perform vector search
  let searchResults: VectorSearchResult[];

  if (Object.keys(appliedFilters).length > 0) {
    searchResults = await searchWithFilters(
      embeddingResult.embedding,
      {
        category: appliedFilters.category,
        gender: appliedFilters.gender,
        occasion: appliedFilters.occasion,
        topics: appliedFilters.topics,
      },
      topK * 2, // Get more to filter by tokens
      threshold
    );
  } else {
    searchResults = await similaritySearch(
      embeddingResult.embedding,
      topK * 2,
      threshold
    );
  }

  // Enforce token limit
  let totalTokens = 0;
  const filteredResults: VectorSearchResult[] = [];

  for (const result of searchResults) {
    const tokenCount =
      (result.metadata.tokenCount as number) || Math.ceil(result.text.length / 4);

    if (totalTokens + tokenCount <= maxTokens) {
      filteredResults.push(result);
      totalTokens += tokenCount;
    }

    if (filteredResults.length >= topK) {
      break;
    }
  }

  // Ensure minimum documents
  if (
    filteredResults.length < config.retrieval.minDocuments &&
    searchResults.length > filteredResults.length
  ) {
    // Add more even if over token limit
    for (let i = filteredResults.length; i < searchResults.length; i++) {
      if (filteredResults.length >= config.retrieval.minDocuments) break;
      if (!filteredResults.includes(searchResults[i])) {
        filteredResults.push(searchResults[i]);
      }
    }
  }

  const retrievalTime = Date.now() - startTime;

  // Build result
  const documents = reconstructDocuments(filteredResults);
  const scores = filteredResults.map((r) => r.score);
  const finalTokenCount = calculateTokenCount(filteredResults);

  const metadata: RetrievalResultMetadata = {
    retrievalTimeMs: retrievalTime,
    query,
    normalizedQuery,
    appliedFilters,
    tokenCount: finalTokenCount,
  };

  if (config.logging.logRetrieval) {
    console.log('[Retrieval] Found:', documents.length, 'documents');
    console.log('[Retrieval] Tokens:', finalTokenCount);
    console.log('[Retrieval] Time:', retrievalTime, 'ms');
  }

  return {
    documents,
    scores,
    totalFound: searchResults.length,
    metadata,
  };
}

/**
 * Retrieve with category focus
 *
 * @param query - User query
 * @param category - Category to focus on
 * @param options - Additional retrieval options
 * @returns Promise resolving to retrieval results
 */
export async function retrieveByCategory(
  query: string,
  category: KnowledgeCategory,
  options: Omit<RetrievalOptions, 'filters'> = {}
): Promise<RetrievalResult> {
  return retrieve(query, {
    ...options,
    filters: { category },
  });
}

/**
 * Retrieve for a specific occasion
 *
 * @param query - User query
 * @param occasion - Occasion type
 * @param options - Additional retrieval options
 * @returns Promise resolving to retrieval results
 */
export async function retrieveForOccasion(
  query: string,
  occasion: string,
  options: Omit<RetrievalOptions, 'filters'> = {}
): Promise<RetrievalResult> {
  return retrieve(query, {
    ...options,
    filters: { occasion },
  });
}

/**
 * Multi-query retrieval (combine results from multiple queries)
 *
 * @param queries - Array of query strings
 * @param options - Retrieval options
 * @returns Promise resolving to combined retrieval results
 */
export async function retrieveMultiQuery(
  queries: string[],
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const config = getRAGConfig();
  const startTime = Date.now();

  // Retrieve for each query
  const allResults = await Promise.all(
    queries.map((q) => retrieve(q, { ...options, topK: Math.ceil((options.topK || config.retrieval.topK) / queries.length) }))
  );

  // Merge and deduplicate results
  const documentMap = new Map<string, { doc: KnowledgeDocument; score: number }>();

  for (const result of allResults) {
    for (let i = 0; i < result.documents.length; i++) {
      const doc = result.documents[i];
      const score = result.scores[i];
      const existing = documentMap.get(doc.id);

      // Keep higher score
      if (!existing || score > existing.score) {
        documentMap.set(doc.id, { doc, score });
      }
    }
  }

  // Sort by score and limit
  const merged = Array.from(documentMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, options.topK || config.retrieval.topK);

  const documents = merged.map((m) => m.doc);
  const scores = merged.map((m) => m.score);

  return {
    documents,
    scores,
    totalFound: documentMap.size,
    metadata: {
      retrievalTimeMs: Date.now() - startTime,
      query: queries.join(' | '),
      normalizedQuery: queries.map(normalizeQuery).join(' | '),
      appliedFilters: options.filters || {},
      tokenCount: documents.reduce(
        (sum, doc) => sum + Math.ceil(doc.content.length / 4),
        0
      ),
    },
  };
}

/**
 * Quick search for simple queries (lower threshold, fewer results)
 *
 * @param query - User query
 * @returns Promise resolving to retrieval results
 */
export async function quickSearch(query: string): Promise<RetrievalResult> {
  return retrieve(query, {
    topK: 3,
    threshold: 0.6,
    maxTokens: 800,
  });
}

export default {
  retrieve,
  retrieveByCategory,
  retrieveForOccasion,
  retrieveMultiQuery,
  quickSearch,
  normalizeQuery,
  detectQueryLanguage,
  extractFiltersFromQuery,
};
