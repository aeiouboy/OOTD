/**
 * RAG Module - Public API
 *
 * Unified exports for the Fashion Expert Agent RAG system.
 * Provides a high-level RAGService class and all individual module exports.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

// Type exports
export type {
  KnowledgeCategory,
  GenderFilter,
  ThaiSeason,
  KnowledgeDocument,
  KnowledgeDocumentMetadata,
  RetrievalOptions,
  RetrievalFilters,
  RetrievalResult,
  RetrievalResultMetadata,
  EmbeddingResult,
  BatchEmbeddingResult,
  VectorStoreEntry,
  VectorSearchResult,
  DocumentChunk,
  ChunkingConfig,
  FormattedContext,
  RAGServiceConfig,
  RAGServiceStats,
} from './types';

// Config exports
export {
  RAG_CONFIG,
  getRAGConfig,
  validateRAGConfig,
  getCategoryConfig,
  getAllCategories,
} from './config';

// Embedding exports
export {
  generateEmbedding,
  generateBatchEmbeddings,
  clearEmbeddingCache,
  getEmbeddingCacheStats,
  precomputeEmbeddings,
} from './embeddings';

// Vector store exports
export {
  initializeVectorStore,
  addDocument,
  addDocuments,
  getDocument,
  deleteDocument,
  deleteDocuments,
  similaritySearch,
  searchByCategory,
  searchWithFilters,
  getDocumentCount,
  listDocumentIds,
  clearIndex,
  isVectorStoreInitialized,
  getVectorStoreStats,
  closeVectorStore,
} from './vector-store';

// Knowledge base exports
export {
  chunkDocument,
  indexDocument,
  indexDocuments,
  removeDocument,
  updateDocument,
  getKnowledgeBaseStats,
  clearKnowledgeBase,
  createKnowledgeDocument,
  validateKnowledgeDocument,
  estimateDocumentStorage,
} from './knowledge-base';

// Retrieval exports
export {
  retrieve,
  retrieveByCategory,
  retrieveForOccasion,
  retrieveMultiQuery,
  quickSearch,
  normalizeQuery,
  detectQueryLanguage,
  extractFiltersFromQuery,
} from './retrieval';

// Prompt builder exports
export {
  formatDocumentsAsContext,
  buildEnhancedPrompt,
  buildFashionContext,
  buildMinimalContext,
  buildFollowUpContext,
  getContextStats,
} from './prompt-builder';

// Capabilities exports (Phase 4)
export {
  analyzeStyle,
  getStyleRecommendations,
  matchStylingRules,
  getCurrentTrends,
  getTrendingForOccasion,
  detectCurrentThaiSeason,
  getSeasonName,
  fashionExpertCapabilities,
} from './capabilities';

export type {
  StyleAnalysisResult,
  StyleRecommendationResult,
  StylingRulesResult,
  TrendResult,
  OccasionTrendResult,
  FashionExpertCapabilities,
} from './capabilities';

// Import for RAGService class
import { getRAGConfig, validateRAGConfig, getAllCategories } from './config';
import {
  initializeVectorStore,
  getVectorStoreStats,
  closeVectorStore,
  isVectorStoreInitialized,
} from './vector-store';
import {
  indexDocument,
  indexDocuments,
  removeDocument,
  getKnowledgeBaseStats,
  clearKnowledgeBase,
  createKnowledgeDocument,
} from './knowledge-base';
import {
  retrieve,
  retrieveByCategory,
  retrieveForOccasion,
  quickSearch,
} from './retrieval';
import {
  buildEnhancedPrompt,
  buildFashionContext,
  formatDocumentsAsContext,
} from './prompt-builder';
import { clearEmbeddingCache } from './embeddings';
import type {
  KnowledgeDocument,
  KnowledgeCategory,
  RetrievalOptions,
  RetrievalResult,
  RAGServiceConfig,
  RAGServiceStats,
} from './types';

/**
 * RAGService - Unified interface for the RAG system
 *
 * Provides a high-level API for common RAG operations including
 * initialization, indexing, retrieval, and prompt enhancement.
 */
export class RAGService {
  private initialized: boolean = false;

  /**
   * Initialize the RAG service
   *
   * @returns Promise resolving to initialization success status
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    // Validate configuration
    const configValidation = validateRAGConfig();
    if (!configValidation.valid) {
      console.error('[RAGService] Configuration errors:', configValidation.errors);
      return false;
    }

    // Initialize vector store
    const storeInitialized = await initializeVectorStore();
    if (!storeInitialized) {
      console.error('[RAGService] Failed to initialize vector store');
      return false;
    }

    this.initialized = true;
    console.log('[RAGService] Initialized successfully');
    return true;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized && isVectorStoreInitialized();
  }

  /**
   * Get service configuration
   */
  getConfig(): RAGServiceConfig {
    const config = getRAGConfig();
    return {
      isInitialized: this.initialized,
      vectorStorePath: config.vectorStore.path,
      indexName: config.vectorStore.indexName,
      embeddingModel: config.embedding.model,
      embeddingDimensions: config.embedding.dimensions,
    };
  }

  /**
   * Get service statistics
   */
  async getStats(): Promise<RAGServiceStats> {
    const kbStats = await getKnowledgeBaseStats();
    const vsStats = await getVectorStoreStats();

    return {
      documentCount: vsStats.documentCount,
      chunkCount: kbStats.totalChunks,
      categories: getAllCategories(),
      lastUpdated: kbStats.lastUpdated,
      indexSizeBytes: 0, // Would need file system access to calculate
    };
  }

  /**
   * Index a single knowledge document
   */
  async index(document: KnowledgeDocument): Promise<number> {
    await this.ensureInitialized();
    return indexDocument(document);
  }

  /**
   * Index multiple knowledge documents
   */
  async indexBatch(documents: KnowledgeDocument[]): Promise<number> {
    await this.ensureInitialized();
    return indexDocuments(documents);
  }

  /**
   * Remove a document from the index
   */
  async remove(documentId: string): Promise<number> {
    await this.ensureInitialized();
    return removeDocument(documentId);
  }

  /**
   * Retrieve relevant knowledge for a query
   */
  async retrieve(query: string, options?: RetrievalOptions): Promise<RetrievalResult> {
    await this.ensureInitialized();
    return retrieve(query, options);
  }

  /**
   * Retrieve by specific category
   */
  async retrieveByCategory(
    query: string,
    category: KnowledgeCategory,
    options?: Omit<RetrievalOptions, 'filters'>
  ): Promise<RetrievalResult> {
    await this.ensureInitialized();
    return retrieveByCategory(query, category, options);
  }

  /**
   * Retrieve for a specific occasion
   */
  async retrieveForOccasion(
    query: string,
    occasion: string,
    options?: Omit<RetrievalOptions, 'filters'>
  ): Promise<RetrievalResult> {
    await this.ensureInitialized();
    return retrieveForOccasion(query, occasion, options);
  }

  /**
   * Quick search with lower threshold
   */
  async quickSearch(query: string): Promise<RetrievalResult> {
    await this.ensureInitialized();
    return quickSearch(query);
  }

  /**
   * Build an enhanced prompt with retrieved knowledge
   */
  async enhancePrompt(
    basePrompt: string,
    query: string,
    options?: RetrievalOptions
  ): Promise<string> {
    const retrievalResult = await this.retrieve(query, options);
    return buildEnhancedPrompt(basePrompt, retrievalResult);
  }

  /**
   * Build fashion-specific context for a query
   */
  async buildContext(query: string, options?: RetrievalOptions): Promise<string> {
    const retrievalResult = await this.retrieve(query, options);
    return buildFashionContext(retrievalResult, query);
  }

  /**
   * Format retrieved documents as context
   */
  formatAsContext(
    retrievalResult: RetrievalResult,
    maxTokens?: number
  ): { context: string; tokenCount: number } {
    const formatted = formatDocumentsAsContext(
      retrievalResult.documents,
      retrievalResult.scores,
      maxTokens
    );
    return {
      context: formatted.context,
      tokenCount: formatted.tokenCount,
    };
  }

  /**
   * Create a knowledge document from raw data
   */
  createDocument(data: Parameters<typeof createKnowledgeDocument>[0]): KnowledgeDocument {
    return createKnowledgeDocument(data);
  }

  /**
   * Clear all indexed documents
   */
  async clearAll(): Promise<number> {
    await this.ensureInitialized();
    const count = await clearKnowledgeBase();
    clearEmbeddingCache();
    return count;
  }

  /**
   * Close the service and release resources
   */
  async close(): Promise<void> {
    await closeVectorStore();
    clearEmbeddingCache();
    this.initialized = false;
    console.log('[RAGService] Closed');
  }

  /**
   * Ensure service is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error('RAGService failed to initialize');
      }
    }
  }
}

/**
 * Default RAG service instance
 */
let defaultInstance: RAGService | null = null;

/**
 * Get the default RAG service instance (singleton)
 */
export function getRAGService(): RAGService {
  if (!defaultInstance) {
    defaultInstance = new RAGService();
  }
  return defaultInstance;
}

/**
 * Create a new RAG service instance
 */
export function createRAGService(): RAGService {
  return new RAGService();
}

export default RAGService;
