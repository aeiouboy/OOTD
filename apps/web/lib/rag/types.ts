/**
 * RAG Module Type Definitions
 *
 * TypeScript interfaces for the Fashion Expert Agent RAG system.
 * Defines knowledge documents, retrieval options, and result structures.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

/**
 * Knowledge document categories for fashion expertise
 */
export type KnowledgeCategory =
  | 'styling_rules'
  | 'color_theory'
  | 'body_types'
  | 'occasions'
  | 'thai_culture'
  | 'brand_intelligence'
  | 'seasonal_trends'
  | 'foundation'
  | 'advanced'
  | 'implementation'
  | 'special';

/**
 * Gender options for filtering
 */
export type GenderFilter = 'men' | 'women' | 'unisex';

/**
 * Thai seasonal options
 */
export type ThaiSeason = 'hot' | 'rainy' | 'cool' | 'all';

/**
 * Knowledge document structure for RAG indexing
 */
export interface KnowledgeDocument {
  /** Unique identifier for the document */
  id: string;

  /** Category classification for filtering */
  category: KnowledgeCategory;

  /** Human-readable title */
  title: string;

  /** Main content in English */
  content: string;

  /** Optional Thai language content for bilingual support */
  contentThai?: string;

  /** Metadata for filtering and context */
  metadata: KnowledgeDocumentMetadata;
}

/**
 * Metadata schema for knowledge documents
 */
export interface KnowledgeDocumentMetadata {
  /** Topics covered in the document */
  topics: string[];

  /** Relevant occasions (e.g., 'wedding', 'work', 'casual') */
  occasions?: string[];

  /** Target gender demographics */
  gender?: GenderFilter[];

  /** Seasonal applicability for Thai climate */
  seasonality?: ThaiSeason[];

  /** ISO date string of last update */
  lastUpdated: string;

  /** Optional source reference */
  source?: string;

  /** Optional priority weight for retrieval (higher = more important) */
  priority?: number;
}

/**
 * Options for customizing retrieval queries
 */
export interface RetrievalOptions {
  /** Number of top results to return (default: 5) */
  topK?: number;

  /** Minimum similarity threshold (0-1, default: 0.7) */
  threshold?: number;

  /** Metadata filters for narrowing results */
  filters?: RetrievalFilters;

  /** Maximum tokens for combined context (default: 1500) */
  maxTokens?: number;

  /** Whether to include bilingual content */
  includeThai?: boolean;
}

/**
 * Filter options for retrieval queries
 */
export interface RetrievalFilters {
  /** Filter by knowledge category */
  category?: KnowledgeCategory;

  /** Filter by target gender */
  gender?: GenderFilter;

  /** Filter by occasion type */
  occasion?: string;

  /** Filter by season */
  season?: ThaiSeason;

  /** Filter by specific topics */
  topics?: string[];
}

/**
 * Result structure for retrieval queries
 */
export interface RetrievalResult {
  /** Retrieved knowledge documents */
  documents: KnowledgeDocument[];

  /** Similarity scores for each document (0-1) */
  scores: number[];

  /** Total number of matching documents before topK limit */
  totalFound: number;

  /** Query processing metadata */
  metadata: RetrievalResultMetadata;
}

/**
 * Metadata about the retrieval operation
 */
export interface RetrievalResultMetadata {
  /** Time taken for retrieval in milliseconds */
  retrievalTimeMs: number;

  /** Original query text */
  query: string;

  /** Normalized/processed query */
  normalizedQuery: string;

  /** Filters that were applied */
  appliedFilters: RetrievalFilters;

  /** Total token count of retrieved context */
  tokenCount: number;
}

/**
 * Embedding generation result
 */
export interface EmbeddingResult {
  /** The embedding vector */
  embedding: number[];

  /** Dimension of the embedding */
  dimensions: number;

  /** Token count of input text */
  tokenCount: number;
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
  /** Array of embedding vectors */
  embeddings: number[][];

  /** Dimensions of each embedding */
  dimensions: number;

  /** Total tokens processed */
  totalTokens: number;

  /** Number of successful embeddings */
  successCount: number;

  /** Number of failed embeddings */
  failureCount: number;
}

/**
 * Vector store document entry
 */
export interface VectorStoreEntry {
  /** Document ID */
  id: string;

  /** Embedding vector */
  vector: number[];

  /** Associated metadata */
  metadata: Record<string, unknown>;

  /** Original text content */
  text: string;
}

/**
 * Vector search result
 */
export interface VectorSearchResult {
  /** Document ID */
  id: string;

  /** Similarity score (0-1) */
  score: number;

  /** Associated metadata */
  metadata: Record<string, unknown>;

  /** Original text content */
  text: string;
}

/**
 * Document chunk for indexing
 */
export interface DocumentChunk {
  /** Chunk ID (document_id + chunk_index) */
  id: string;

  /** Parent document ID */
  documentId: string;

  /** Chunk index within the document */
  chunkIndex: number;

  /** Chunk text content */
  content: string;

  /** Optional Thai content */
  contentThai?: string;

  /** Token count of the chunk */
  tokenCount: number;

  /** Inherited metadata from parent document */
  metadata: KnowledgeDocumentMetadata;
}

/**
 * Chunking configuration
 */
export interface ChunkingConfig {
  /** Target chunk size in tokens (default: 300) */
  targetTokens: number;

  /** Minimum chunk size in tokens (default: 200) */
  minTokens: number;

  /** Maximum chunk size in tokens (default: 400) */
  maxTokens: number;

  /** Overlap between chunks in tokens (default: 50) */
  overlapTokens: number;
}

/**
 * Formatted context for prompt injection
 */
export interface FormattedContext {
  /** Formatted context string */
  context: string;

  /** Total token count */
  tokenCount: number;

  /** Source document IDs */
  sourceIds: string[];

  /** Categories included */
  categories: KnowledgeCategory[];
}

/**
 * RAG service configuration
 */
export interface RAGServiceConfig {
  /** Whether the service is initialized */
  isInitialized: boolean;

  /** Vector store path */
  vectorStorePath: string;

  /** Index name */
  indexName: string;

  /** Embedding model ID */
  embeddingModel: string;

  /** Embedding dimensions */
  embeddingDimensions: number;
}

/**
 * RAG service statistics
 */
export interface RAGServiceStats {
  /** Total documents indexed */
  documentCount: number;

  /** Total chunks indexed */
  chunkCount: number;

  /** Categories indexed */
  categories: KnowledgeCategory[];

  /** Last index update timestamp */
  lastUpdated: string | null;

  /** Index size in bytes (approximate) */
  indexSizeBytes: number;
}
