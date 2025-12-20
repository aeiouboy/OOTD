/**
 * Knowledge Base Manager
 *
 * Manages fashion knowledge documents, chunking, and indexing.
 * Supports bilingual content (Thai/English) and metadata filtering.
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import { RAG_CONFIG, getRAGConfig } from './config';
import { generateEmbedding, generateBatchEmbeddings } from './embeddings';
import {
  initializeVectorStore,
  addDocuments,
  deleteDocuments,
  getDocumentCount,
  listDocumentIds,
  clearIndex,
} from './vector-store';
import type {
  KnowledgeDocument,
  KnowledgeDocumentMetadata,
  KnowledgeCategory,
  DocumentChunk,
  ChunkingConfig,
  VectorStoreEntry,
} from './types';

// Simple token estimation (4 chars ~ 1 token for English, 2 chars ~ 1 token for Thai)
function estimateTokenCount(text: string): number {
  // Detect Thai characters
  const thaiPattern = /[\u0E00-\u0E7F]/g;
  const thaiMatches = text.match(thaiPattern);
  const thaiCharCount = thaiMatches ? thaiMatches.length : 0;
  const nonThaiCharCount = text.length - thaiCharCount;

  // Thai: ~2 chars per token, English: ~4 chars per token
  return Math.ceil(thaiCharCount / 2 + nonThaiCharCount / 4);
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  // Handle both Thai and English sentence endings
  const sentencePattern = /[.!?။ฯ]+[\s\n]+|[\n]{2,}/g;
  const sentences = text.split(sentencePattern).filter((s) => s.trim().length > 0);
  return sentences.map((s) => s.trim());
}

/**
 * Chunk a document into smaller pieces with overlap
 *
 * @param document - Knowledge document to chunk
 * @param config - Chunking configuration
 * @returns Array of document chunks
 */
export function chunkDocument(
  document: KnowledgeDocument,
  config: ChunkingConfig = RAG_CONFIG.chunking
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const sentences = splitIntoSentences(document.content);

  let currentChunk: string[] = [];
  let currentTokens = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceTokens = estimateTokenCount(sentence);

    // Check if adding this sentence would exceed max tokens
    if (currentTokens + sentenceTokens > config.maxTokens && currentChunk.length > 0) {
      // Create chunk from current content
      const chunkContent = currentChunk.join(' ');
      const chunkTokenCount = estimateTokenCount(chunkContent);

      // Only add if meets minimum token requirement
      if (chunkTokenCount >= config.minTokens) {
        chunks.push({
          id: `${document.id}_chunk_${chunkIndex}`,
          documentId: document.id,
          chunkIndex,
          content: chunkContent,
          contentThai: document.contentThai
            ? extractThaiChunkContent(document.contentThai, chunkIndex, chunks.length)
            : undefined,
          tokenCount: chunkTokenCount,
          metadata: document.metadata,
        });
        chunkIndex++;
      }

      // Calculate overlap - keep last N tokens worth of sentences
      const overlapSentences: string[] = [];
      let overlapTokens = 0;

      for (let j = currentChunk.length - 1; j >= 0 && overlapTokens < config.overlapTokens; j--) {
        overlapSentences.unshift(currentChunk[j]);
        overlapTokens += estimateTokenCount(currentChunk[j]);
      }

      currentChunk = overlapSentences;
      currentTokens = overlapTokens;
    }

    currentChunk.push(sentence);
    currentTokens += sentenceTokens;
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    const chunkContent = currentChunk.join(' ');
    const chunkTokenCount = estimateTokenCount(chunkContent);

    if (chunkTokenCount >= config.minTokens) {
      chunks.push({
        id: `${document.id}_chunk_${chunkIndex}`,
        documentId: document.id,
        chunkIndex,
        content: chunkContent,
        contentThai: document.contentThai
          ? extractThaiChunkContent(document.contentThai, chunkIndex, chunks.length)
          : undefined,
        tokenCount: chunkTokenCount,
        metadata: document.metadata,
      });
    } else if (chunks.length > 0) {
      // Merge with previous chunk if last chunk is too small
      const lastChunk = chunks[chunks.length - 1];
      lastChunk.content += ' ' + chunkContent;
      lastChunk.tokenCount = estimateTokenCount(lastChunk.content);
    } else {
      // Document is smaller than minTokens, include as single chunk
      chunks.push({
        id: `${document.id}_chunk_0`,
        documentId: document.id,
        chunkIndex: 0,
        content: chunkContent,
        contentThai: document.contentThai,
        tokenCount: chunkTokenCount,
        metadata: document.metadata,
      });
    }
  }

  return chunks;
}

/**
 * Extract corresponding Thai content for a chunk (simplified approach)
 */
function extractThaiChunkContent(
  thaiContent: string,
  chunkIndex: number,
  totalChunks: number
): string | undefined {
  if (!thaiContent) return undefined;

  const thaiSentences = splitIntoSentences(thaiContent);
  if (thaiSentences.length === 0) return undefined;

  // Proportional extraction
  const sentencesPerChunk = Math.ceil(thaiSentences.length / Math.max(totalChunks, 1));
  const startIdx = chunkIndex * sentencesPerChunk;
  const endIdx = Math.min(startIdx + sentencesPerChunk, thaiSentences.length);

  return thaiSentences.slice(startIdx, endIdx).join(' ') || undefined;
}

/**
 * Index a single knowledge document
 *
 * @param document - Document to index
 * @returns Promise resolving to number of chunks indexed
 */
export async function indexDocument(document: KnowledgeDocument): Promise<number> {
  const config = getRAGConfig();

  // Ensure vector store is initialized
  await initializeVectorStore();

  // Chunk the document
  const chunks = chunkDocument(document);

  if (config.logging.debug) {
    console.log(`[KnowledgeBase] Chunked document ${document.id} into ${chunks.length} chunks`);
  }

  // Generate embeddings for all chunks
  const chunkTexts = chunks.map((chunk) => {
    // Combine title and content for better embeddings
    return `${document.title}\n\n${chunk.content}`;
  });

  const embeddingResult = await generateBatchEmbeddings(chunkTexts, false);

  if (embeddingResult.failureCount > 0) {
    console.warn(
      `[KnowledgeBase] ${embeddingResult.failureCount} chunks failed embedding generation`
    );
  }

  // Create vector store entries
  const entries: VectorStoreEntry[] = [];

  for (let i = 0; i < chunks.length && i < embeddingResult.embeddings.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddingResult.embeddings[i];

    entries.push({
      id: chunk.id,
      vector: embedding,
      metadata: {
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        category: document.category,
        title: document.title,
        topics: chunk.metadata.topics,
        occasions: chunk.metadata.occasions,
        gender: chunk.metadata.gender,
        seasonality: chunk.metadata.seasonality,
        lastUpdated: chunk.metadata.lastUpdated,
        tokenCount: chunk.tokenCount,
      },
      text: chunk.content,
    });
  }

  // Add to vector store
  await addDocuments(entries);

  if (config.logging.debug) {
    console.log(`[KnowledgeBase] Indexed ${entries.length} chunks for document ${document.id}`);
  }

  return entries.length;
}

/**
 * Index multiple knowledge documents
 *
 * @param documents - Array of documents to index
 * @returns Promise resolving to total chunks indexed
 */
export async function indexDocuments(documents: KnowledgeDocument[]): Promise<number> {
  const config = getRAGConfig();
  let totalChunks = 0;

  console.log(`[KnowledgeBase] Indexing ${documents.length} documents...`);

  for (const document of documents) {
    try {
      const chunksIndexed = await indexDocument(document);
      totalChunks += chunksIndexed;
    } catch (error) {
      console.error(`[KnowledgeBase] Failed to index document ${document.id}:`, error);
    }
  }

  console.log(`[KnowledgeBase] Completed indexing: ${totalChunks} total chunks`);

  return totalChunks;
}

/**
 * Remove a document and all its chunks from the index
 *
 * @param documentId - Document ID to remove
 * @returns Promise resolving to number of chunks removed
 */
export async function removeDocument(documentId: string): Promise<number> {
  const allIds = await listDocumentIds();
  const documentChunkIds = allIds.filter((id) => id.startsWith(`${documentId}_chunk_`));

  if (documentChunkIds.length === 0) {
    return 0;
  }

  const deletedCount = await deleteDocuments(documentChunkIds);
  console.log(`[KnowledgeBase] Removed ${deletedCount} chunks for document ${documentId}`);

  return deletedCount;
}

/**
 * Update a document in the index (remove and re-index)
 *
 * @param document - Updated document
 * @returns Promise resolving to number of new chunks indexed
 */
export async function updateDocument(document: KnowledgeDocument): Promise<number> {
  await removeDocument(document.id);
  return indexDocument(document);
}

/**
 * Get statistics about the knowledge base
 *
 * @returns Promise resolving to knowledge base stats
 */
export async function getKnowledgeBaseStats(): Promise<{
  totalChunks: number;
  categories: Record<KnowledgeCategory, number>;
  lastUpdated: string | null;
}> {
  const allIds = await listDocumentIds();
  const categories: Record<KnowledgeCategory, number> = {
    styling_rules: 0,
    color_theory: 0,
    body_types: 0,
    occasions: 0,
    thai_culture: 0,
    brand_intelligence: 0,
    seasonal_trends: 0,
  };

  // Count by extracting document IDs and inferring categories
  // In a real implementation, you'd query metadata

  return {
    totalChunks: allIds.length,
    categories,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Clear the entire knowledge base
 *
 * @returns Promise resolving to number of chunks removed
 */
export async function clearKnowledgeBase(): Promise<number> {
  console.log('[KnowledgeBase] Clearing all indexed documents...');
  const count = await clearIndex();
  console.log(`[KnowledgeBase] Cleared ${count} chunks`);
  return count;
}

/**
 * Create a knowledge document from raw data
 *
 * @param data - Raw document data
 * @returns KnowledgeDocument with proper structure
 */
export function createKnowledgeDocument(data: {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  contentThai?: string;
  topics: string[];
  occasions?: string[];
  gender?: ('men' | 'women' | 'unisex')[];
  seasonality?: ('hot' | 'rainy' | 'cool' | 'all')[];
  source?: string;
  priority?: number;
}): KnowledgeDocument {
  return {
    id: data.id,
    category: data.category,
    title: data.title,
    content: data.content,
    contentThai: data.contentThai,
    metadata: {
      topics: data.topics,
      occasions: data.occasions,
      gender: data.gender,
      seasonality: data.seasonality,
      lastUpdated: new Date().toISOString(),
      source: data.source,
      priority: data.priority,
    },
  };
}

/**
 * Validate a knowledge document
 *
 * @param document - Document to validate
 * @returns Validation result with any errors
 */
export function validateKnowledgeDocument(document: KnowledgeDocument): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!document.id || document.id.trim().length === 0) {
    errors.push('Document ID is required');
  }

  if (!document.category) {
    errors.push('Document category is required');
  }

  if (!document.title || document.title.trim().length === 0) {
    errors.push('Document title is required');
  }

  if (!document.content || document.content.trim().length === 0) {
    errors.push('Document content is required');
  }

  if (!document.metadata) {
    errors.push('Document metadata is required');
  } else {
    if (!document.metadata.topics || document.metadata.topics.length === 0) {
      errors.push('At least one topic is required');
    }

    if (!document.metadata.lastUpdated) {
      errors.push('lastUpdated timestamp is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate storage requirements for a document
 *
 * @param document - Document to estimate
 * @returns Estimated storage in bytes
 */
export function estimateDocumentStorage(document: KnowledgeDocument): {
  estimatedChunks: number;
  estimatedTokens: number;
  estimatedBytes: number;
} {
  const config = getRAGConfig();
  const contentTokens = estimateTokenCount(document.content);
  const thaiTokens = document.contentThai ? estimateTokenCount(document.contentThai) : 0;
  const totalTokens = contentTokens + thaiTokens;

  const estimatedChunks = Math.ceil(contentTokens / config.chunking.targetTokens);

  // Each chunk stores: embedding (1536 * 4 bytes) + metadata (~500 bytes) + text
  const embeddingSize = config.embedding.dimensions * 4;
  const metadataSize = 500;
  const textSize = document.content.length * 2; // UTF-16

  const estimatedBytes = estimatedChunks * (embeddingSize + metadataSize) + textSize;

  return {
    estimatedChunks,
    estimatedTokens: totalTokens,
    estimatedBytes,
  };
}

export default {
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
};
