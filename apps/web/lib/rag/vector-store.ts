/**
 * Vector Store Wrapper using Vectra
 *
 * ⚠️ DEPRECATED (Feb 2026): This file is no longer used in production.
 * RAG pipeline now uses Supabase pgvector exclusively (see supabase-retrieval.ts).
 * Vectra dependency removed from package.json to avoid errors.
 *
 * This file is kept for reference only and may be removed in future cleanup.
 *
 * @deprecated Use supabase-retrieval.ts instead
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

import { LocalIndex } from 'vectra';
import * as path from 'path';
import * as fs from 'fs';
import { RAG_CONFIG, getRAGConfig } from './config';
import type { VectorStoreEntry, VectorSearchResult, KnowledgeCategory } from './types';

/**
 * Vectra index instance
 */
let indexInstance: LocalIndex | null = null;

/**
 * Index initialization state
 */
let isInitialized = false;

/**
 * Get the vector store path
 */
function getStorePath(): string {
  const config = getRAGConfig();
  return path.join(process.cwd(), config.vectorStore.path, config.vectorStore.indexName);
}

/**
 * Ensure the vector store directory exists
 */
async function ensureDirectoryExists(): Promise<void> {
  const storePath = getStorePath();
  const dirPath = path.dirname(storePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Initialize the vector store
 *
 * @returns Promise resolving to true if initialization successful
 */
export async function initializeVectorStore(): Promise<boolean> {
  if (isInitialized && indexInstance) {
    return true;
  }

  const config = getRAGConfig();

  try {
    await ensureDirectoryExists();
    const storePath = getStorePath();

    if (config.logging.debug) {
      console.log('[VectorStore] Initializing at:', storePath);
    }

    indexInstance = new LocalIndex(storePath);

    // Check if index exists, create if not
    const exists = await indexInstance.isIndexCreated();
    if (!exists) {
      await indexInstance.createIndex();
      if (config.logging.debug) {
        console.log('[VectorStore] Created new index');
      }
    } else {
      if (config.logging.debug) {
        console.log('[VectorStore] Loaded existing index');
      }
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('[VectorStore] Initialization failed:', error);
    isInitialized = false;
    return false;
  }
}

/**
 * Get the initialized index instance
 */
async function getIndex(): Promise<LocalIndex> {
  if (!isInitialized || !indexInstance) {
    await initializeVectorStore();
  }

  if (!indexInstance) {
    throw new Error('Vector store not initialized');
  }

  return indexInstance;
}

/**
 * Add a document to the vector store
 *
 * @param entry - Document entry to add
 * @returns Promise resolving to the document ID
 */
export async function addDocument(entry: VectorStoreEntry): Promise<string> {
  const index = await getIndex();
  const config = getRAGConfig();

  try {
    await index.insertItem({
      id: entry.id,
      vector: entry.vector,
      metadata: {
        ...entry.metadata,
        text: entry.text,
      },
    });

    if (config.logging.debug) {
      console.log('[VectorStore] Added document:', entry.id);
    }

    return entry.id;
  } catch (error) {
    console.error('[VectorStore] Failed to add document:', entry.id, error);
    throw error;
  }
}

/**
 * Add multiple documents to the vector store in batch
 *
 * @param entries - Array of document entries to add
 * @returns Promise resolving to array of added document IDs
 */
export async function addDocuments(entries: VectorStoreEntry[]): Promise<string[]> {
  const index = await getIndex();
  const config = getRAGConfig();
  const addedIds: string[] = [];

  try {
    await index.beginUpdate();

    for (const entry of entries) {
      await index.insertItem({
        id: entry.id,
        vector: entry.vector,
        metadata: {
          ...entry.metadata,
          text: entry.text,
        },
      });
      addedIds.push(entry.id);
    }

    await index.endUpdate();

    if (config.logging.debug) {
      console.log('[VectorStore] Added', addedIds.length, 'documents in batch');
    }

    return addedIds;
  } catch (error) {
    console.error('[VectorStore] Batch add failed:', error);
    // Try to end update even on error
    try {
      await index.endUpdate();
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Get a document by ID
 *
 * @param id - Document ID to retrieve
 * @returns Promise resolving to the document entry or null if not found
 */
export async function getDocument(id: string): Promise<VectorStoreEntry | null> {
  const index = await getIndex();

  try {
    const item = await index.getItem(id);

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      vector: item.vector,
      metadata: item.metadata as Record<string, unknown>,
      text: (item.metadata?.text as string) || '',
    };
  } catch (error) {
    console.error('[VectorStore] Failed to get document:', id, error);
    return null;
  }
}

/**
 * Delete a document by ID
 *
 * @param id - Document ID to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteDocument(id: string): Promise<boolean> {
  const index = await getIndex();
  const config = getRAGConfig();

  try {
    await index.deleteItem(id);

    if (config.logging.debug) {
      console.log('[VectorStore] Deleted document:', id);
    }

    return true;
  } catch (error) {
    console.error('[VectorStore] Failed to delete document:', id, error);
    return false;
  }
}

/**
 * Delete multiple documents by ID
 *
 * @param ids - Array of document IDs to delete
 * @returns Promise resolving to number of documents deleted
 */
export async function deleteDocuments(ids: string[]): Promise<number> {
  const index = await getIndex();
  let deletedCount = 0;

  try {
    await index.beginUpdate();

    for (const id of ids) {
      try {
        await index.deleteItem(id);
        deletedCount++;
      } catch {
        // Document might not exist
      }
    }

    await index.endUpdate();
    return deletedCount;
  } catch (error) {
    console.error('[VectorStore] Batch delete failed:', error);
    try {
      await index.endUpdate();
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Perform similarity search
 *
 * @param queryVector - Query embedding vector
 * @param topK - Number of results to return
 * @param threshold - Minimum similarity score (0-1)
 * @param filter - Optional metadata filter function
 * @returns Promise resolving to array of search results
 */
export async function similaritySearch(
  queryVector: number[],
  topK: number = RAG_CONFIG.retrieval.topK,
  threshold: number = RAG_CONFIG.retrieval.similarityThreshold,
  filter?: (metadata: Record<string, unknown>) => boolean
): Promise<VectorSearchResult[]> {
  const index = await getIndex();
  const config = getRAGConfig();

  try {
    // Vectra queryItems signature: (vector, query, topK, filter?, isBm25?)
    // We pass empty string for query since we're using vector search only
    const results = await index.queryItems(queryVector, '', topK * 2); // Get more to filter

    if (config.logging.logRetrieval) {
      console.log('[VectorStore] Search returned', results.length, 'raw results');
    }

    // Filter and transform results
    const filteredResults: VectorSearchResult[] = [];

    for (const result of results) {
      // Check similarity threshold
      if (result.score < threshold) {
        continue;
      }

      // Apply custom filter if provided
      const metadata = result.item.metadata as Record<string, unknown>;
      if (filter && !filter(metadata)) {
        continue;
      }

      filteredResults.push({
        id: result.item.id,
        score: result.score,
        metadata,
        text: (metadata.text as string) || '',
      });

      // Stop if we have enough results
      if (filteredResults.length >= topK) {
        break;
      }
    }

    if (config.logging.logRetrieval) {
      console.log('[VectorStore] Returning', filteredResults.length, 'filtered results');
    }

    return filteredResults;
  } catch (error) {
    console.error('[VectorStore] Similarity search failed:', error);
    throw error;
  }
}

/**
 * Search with category filter
 *
 * @param queryVector - Query embedding vector
 * @param category - Category to filter by
 * @param topK - Number of results to return
 * @param threshold - Minimum similarity score
 * @returns Promise resolving to filtered search results
 */
export async function searchByCategory(
  queryVector: number[],
  category: KnowledgeCategory,
  topK: number = RAG_CONFIG.retrieval.topK,
  threshold: number = RAG_CONFIG.retrieval.similarityThreshold
): Promise<VectorSearchResult[]> {
  return similaritySearch(queryVector, topK, threshold, (metadata) => {
    return metadata.category === category;
  });
}

/**
 * Search with multiple filters
 *
 * @param queryVector - Query embedding vector
 * @param filters - Object containing filter criteria
 * @param topK - Number of results to return
 * @param threshold - Minimum similarity score
 * @returns Promise resolving to filtered search results
 */
export async function searchWithFilters(
  queryVector: number[],
  filters: {
    category?: KnowledgeCategory;
    gender?: string;
    occasion?: string;
    topics?: string[];
  },
  topK: number = RAG_CONFIG.retrieval.topK,
  threshold: number = RAG_CONFIG.retrieval.similarityThreshold
): Promise<VectorSearchResult[]> {
  return similaritySearch(queryVector, topK, threshold, (metadata) => {
    // Category filter
    if (filters.category && metadata.category !== filters.category) {
      return false;
    }

    // Gender filter
    if (filters.gender) {
      const genders = metadata.gender as string[] | undefined;
      if (genders && !genders.includes(filters.gender) && !genders.includes('unisex')) {
        return false;
      }
    }

    // Occasion filter
    if (filters.occasion) {
      const occasions = metadata.occasions as string[] | undefined;
      if (occasions && !occasions.includes(filters.occasion)) {
        return false;
      }
    }

    // Topics filter (any match)
    if (filters.topics && filters.topics.length > 0) {
      const docTopics = metadata.topics as string[] | undefined;
      if (docTopics) {
        const hasMatch = filters.topics.some((topic) =>
          docTopics.some((docTopic) =>
            docTopic.toLowerCase().includes(topic.toLowerCase())
          )
        );
        if (!hasMatch) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Get total document count in the index
 *
 * @returns Promise resolving to document count
 */
export async function getDocumentCount(): Promise<number> {
  const index = await getIndex();

  try {
    const stats = await index.listItems();
    return stats.length;
  } catch (error) {
    console.error('[VectorStore] Failed to get document count:', error);
    return 0;
  }
}

/**
 * List all document IDs in the index
 *
 * @returns Promise resolving to array of document IDs
 */
export async function listDocumentIds(): Promise<string[]> {
  const index = await getIndex();

  try {
    const items = await index.listItems();
    return items.map((item) => item.id);
  } catch (error) {
    console.error('[VectorStore] Failed to list documents:', error);
    return [];
  }
}

/**
 * Clear all documents from the index
 *
 * @returns Promise resolving to number of documents deleted
 */
export async function clearIndex(): Promise<number> {
  const index = await getIndex();
  const config = getRAGConfig();

  try {
    const items = await index.listItems();
    const count = items.length;

    // Delete the index and recreate
    await index.deleteIndex();
    await index.createIndex();

    if (config.logging.debug) {
      console.log('[VectorStore] Cleared', count, 'documents');
    }

    return count;
  } catch (error) {
    console.error('[VectorStore] Failed to clear index:', error);
    throw error;
  }
}

/**
 * Check if the vector store is initialized
 *
 * @returns Whether the store is initialized
 */
export function isVectorStoreInitialized(): boolean {
  return isInitialized && indexInstance !== null;
}

/**
 * Get vector store statistics
 *
 * @returns Promise resolving to store statistics
 */
export async function getVectorStoreStats(): Promise<{
  isInitialized: boolean;
  documentCount: number;
  indexPath: string;
}> {
  const storePath = getStorePath();
  let documentCount = 0;

  if (isInitialized) {
    documentCount = await getDocumentCount();
  }

  return {
    isInitialized,
    documentCount,
    indexPath: storePath,
  };
}

/**
 * Close the vector store connection
 */
export async function closeVectorStore(): Promise<void> {
  if (indexInstance) {
    // Vectra LocalIndex doesn't have an explicit close method
    // Just clear the reference
    indexInstance = null;
    isInitialized = false;
    console.log('[VectorStore] Connection closed');
  }
}

export default {
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
};
