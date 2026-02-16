/**
 * Vector Store Wrapper — DEPRECATED STUBS
 *
 * Vectra was removed in Feb 2026. RAG now uses Supabase pgvector exclusively.
 * These stubs keep the module exports so that knowledge-base.ts, retrieval.ts,
 * and index.ts still compile without changes. All functions throw at runtime.
 *
 * @deprecated Use supabase-retrieval.ts instead
 */

import { RAG_CONFIG } from './config';
import type { VectorStoreEntry, VectorSearchResult, KnowledgeCategory } from './types';

const DEPRECATED_MSG = 'Vectra vector-store is deprecated. Use Supabase pgvector via supabase-retrieval.ts instead.';

export async function initializeVectorStore(): Promise<boolean> {
  console.warn('[VectorStore]', DEPRECATED_MSG);
  return false;
}

export async function addDocument(_entry: VectorStoreEntry): Promise<string> {
  throw new Error(DEPRECATED_MSG);
}

export async function addDocuments(_entries: VectorStoreEntry[]): Promise<string[]> {
  throw new Error(DEPRECATED_MSG);
}

export async function getDocument(_id: string): Promise<VectorStoreEntry | null> {
  return null;
}

export async function deleteDocument(_id: string): Promise<boolean> {
  throw new Error(DEPRECATED_MSG);
}

export async function deleteDocuments(_ids: string[]): Promise<number> {
  throw new Error(DEPRECATED_MSG);
}

export async function similaritySearch(
  _queryVector: number[],
  _topK: number = RAG_CONFIG.retrieval.topK,
  _threshold: number = RAG_CONFIG.retrieval.similarityThreshold,
  _filter?: (metadata: Record<string, unknown>) => boolean
): Promise<VectorSearchResult[]> {
  return [];
}

export async function searchByCategory(
  _queryVector: number[],
  _category: KnowledgeCategory,
  _topK?: number,
  _threshold?: number
): Promise<VectorSearchResult[]> {
  return [];
}

export async function searchWithFilters(
  _queryVector: number[],
  _filters: {
    category?: KnowledgeCategory;
    gender?: string;
    occasion?: string;
    topics?: string[];
  },
  _topK?: number,
  _threshold?: number
): Promise<VectorSearchResult[]> {
  return [];
}

export async function getDocumentCount(): Promise<number> {
  return 0;
}

export async function listDocumentIds(): Promise<string[]> {
  return [];
}

export async function clearIndex(): Promise<number> {
  return 0;
}

export function isVectorStoreInitialized(): boolean {
  return false;
}

export async function getVectorStoreStats(): Promise<{
  isInitialized: boolean;
  documentCount: number;
  indexPath: string;
}> {
  return { isInitialized: false, documentCount: 0, indexPath: '' };
}

export async function closeVectorStore(): Promise<void> {
  // no-op
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
