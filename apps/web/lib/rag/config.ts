/**
 * RAG Module Configuration
 *
 * Central configuration for the Fashion Expert Agent RAG system.
 * Includes embedding, retrieval, and vector store settings.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import type { ChunkingConfig, KnowledgeCategory } from './types';

/**
 * Main RAG configuration object
 */
export const RAG_CONFIG = {
  /**
   * Embedding configuration
   */
  embedding: {
    /** API provider for embeddings */
    provider: 'openrouter' as const,

    /** Embedding model identifier */
    model: 'openai/text-embedding-3-small',

    /** Embedding vector dimensions */
    dimensions: 1536,

    /** Maximum batch size for embedding requests */
    batchSize: 50,

    /** Request timeout in milliseconds */
    timeout: 30000,

    /** Maximum retries for failed requests */
    maxRetries: 3,

    /** Cache TTL for query embeddings in milliseconds (1 hour) */
    cacheTTL: 3600000,
  },

  /**
   * Retrieval configuration
   */
  retrieval: {
    /** Default number of documents to retrieve */
    topK: 5,

    /** Minimum similarity threshold (0-1) */
    similarityThreshold: 0.7,

    /** Maximum tokens for retrieved context */
    maxContextTokens: 1500,

    /** Whether to include Thai content by default */
    includeThai: true,

    /** Boost factor for priority documents */
    priorityBoost: 1.2,

    /** Minimum documents to return regardless of threshold */
    minDocuments: 1,

    /** Maximum documents to return */
    maxDocuments: 10,
  },

  /**
   * Vector store configuration
   */
  vectorStore: {
    /** Base path for vector store data */
    path: './data/vector-store',

    /** Index name for fashion knowledge */
    indexName: 'fashion-knowledge',

    /** Whether to persist index to disk */
    persist: true,

    /** Auto-save interval in milliseconds (5 minutes) */
    autoSaveInterval: 300000,
  },

  /**
   * Chunking configuration for document processing
   */
  chunking: {
    /** Target chunk size in tokens */
    targetTokens: 300,

    /** Minimum chunk size in tokens */
    minTokens: 200,

    /** Maximum chunk size in tokens */
    maxTokens: 400,

    /** Overlap between chunks in tokens */
    overlapTokens: 50,
  } as ChunkingConfig,

  /**
   * Knowledge categories with descriptions
   */
  categories: {
    styling_rules: {
      name: 'Styling Rules',
      description: 'Fashion fundamentals, color theory, fit guidelines',
      priority: 1.0,
    },
    color_theory: {
      name: 'Color Theory',
      description: 'Color combinations, outfit balance, Thai auspicious colors',
      priority: 1.0,
    },
    body_types: {
      name: 'Body Types',
      description: 'Body type styling, petite guidelines, problem area solutions',
      priority: 0.9,
    },
    occasions: {
      name: 'Occasions',
      description: 'Dress codes for work, social events, shopping',
      priority: 1.0,
    },
    thai_culture: {
      name: 'Thai Culture',
      description: 'Cultural context, regional differences, etiquette',
      priority: 1.1,
    },
    brand_intelligence: {
      name: 'Brand Intelligence',
      description: 'Central Group brands, sizing guides, brand recommendations',
      priority: 0.9,
    },
    seasonal_trends: {
      name: 'Seasonal Trends',
      description: 'Thai climate considerations, seasonal fashion advice',
      priority: 0.8,
    },
  } as Record<KnowledgeCategory, { name: string; description: string; priority: number }>,

  /**
   * Text normalization settings
   */
  normalization: {
    /** Convert to lowercase */
    lowercase: true,

    /** Remove extra whitespace */
    trimWhitespace: true,

    /** Normalize Thai characters */
    normalizeThaiChars: true,

    /** Remove special characters */
    removeSpecialChars: false,
  },

  /**
   * Caching configuration
   */
  cache: {
    /** Enable query embedding cache */
    enableQueryCache: true,

    /** Maximum cache entries */
    maxCacheSize: 1000,

    /** Enable document embedding cache */
    enableDocumentCache: true,
  },

  /**
   * Logging configuration
   */
  logging: {
    /** Enable debug logging */
    debug: process.env.NODE_ENV === 'development',

    /** Log retrieval operations */
    logRetrieval: true,

    /** Log embedding operations */
    logEmbeddings: false,
  },
};

/**
 * RAG configuration type (for type-safe access)
 */
export type RAGConfigType = typeof RAG_CONFIG;

/**
 * Mutable configuration for environment overrides
 */
interface MutableRAGConfig {
  embedding: RAGConfigType['embedding'];
  retrieval: RAGConfigType['retrieval'];
  vectorStore: {
    path: string;
    indexName: string;
    persist: boolean;
    autoSaveInterval: number;
  };
  chunking: RAGConfigType['chunking'];
  categories: RAGConfigType['categories'];
  normalization: RAGConfigType['normalization'];
  cache: {
    enableQueryCache: boolean;
    maxCacheSize: number;
    enableDocumentCache: boolean;
  };
  logging: {
    debug: boolean;
    logRetrieval: boolean;
    logEmbeddings: boolean;
  };
}

/**
 * Environment-specific configuration overrides
 */
export function getRAGConfig(): MutableRAGConfig {
  const config: MutableRAGConfig = {
    embedding: { ...RAG_CONFIG.embedding },
    retrieval: { ...RAG_CONFIG.retrieval },
    vectorStore: { ...RAG_CONFIG.vectorStore },
    chunking: { ...RAG_CONFIG.chunking },
    categories: { ...RAG_CONFIG.categories },
    normalization: { ...RAG_CONFIG.normalization },
    cache: { ...RAG_CONFIG.cache },
    logging: { ...RAG_CONFIG.logging },
  };

  // Production overrides
  if (process.env.NODE_ENV === 'production') {
    config.logging.debug = false;
    config.logging.logEmbeddings = false;
  }

  // Test environment overrides
  if (process.env.NODE_ENV === 'test') {
    config.vectorStore.path = './data/vector-store-test';
    config.cache.enableQueryCache = false;
    config.cache.enableDocumentCache = false;
  }

  return config;
}

/**
 * Validate RAG configuration
 */
export function validateRAGConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate embedding config
  if (RAG_CONFIG.embedding.dimensions < 1) {
    errors.push('Embedding dimensions must be positive');
  }
  if (RAG_CONFIG.embedding.batchSize < 1) {
    errors.push('Batch size must be at least 1');
  }

  // Validate retrieval config
  if (RAG_CONFIG.retrieval.topK < 1) {
    errors.push('topK must be at least 1');
  }
  if (RAG_CONFIG.retrieval.similarityThreshold < 0 || RAG_CONFIG.retrieval.similarityThreshold > 1) {
    errors.push('Similarity threshold must be between 0 and 1');
  }
  if (RAG_CONFIG.retrieval.maxContextTokens < 100) {
    errors.push('Max context tokens should be at least 100');
  }

  // Validate chunking config
  if (RAG_CONFIG.chunking.minTokens > RAG_CONFIG.chunking.maxTokens) {
    errors.push('Min tokens cannot exceed max tokens');
  }
  if (RAG_CONFIG.chunking.overlapTokens >= RAG_CONFIG.chunking.minTokens) {
    errors.push('Overlap tokens should be less than min tokens');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get category configuration by name
 */
export function getCategoryConfig(category: KnowledgeCategory) {
  return RAG_CONFIG.categories[category] || null;
}

/**
 * Get all category names
 */
export function getAllCategories(): KnowledgeCategory[] {
  return Object.keys(RAG_CONFIG.categories) as KnowledgeCategory[];
}

export default RAG_CONFIG;
