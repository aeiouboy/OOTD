/**
 * Supabase RAG Retrieval Adapter
 *
 * Wraps Supabase RPC calls (search_knowledge, search_products) to return
 * the same RetrievalResult / DbProduct types that the rest of the chat
 * pipeline expects. Acts as a drop-in replacement for Vectra-based retrieval
 * when the SUPABASE_RAG_ENABLED flag is set.
 */

import { generateEmbedding } from './embeddings'
import { searchKnowledge, getKnowledgeByOccasion } from '../supabase/knowledge'
import { searchProductsBySimilarity } from '../supabase/products'
import type {
  RetrievalResult,
  RetrievalOptions,
  KnowledgeDocument,
  KnowledgeCategory,
} from './types'
import type { DbProduct } from '../supabase/types'

/**
 * Retrieve knowledge documents from Supabase using vector similarity search.
 *
 * Generates an embedding for the query, calls the search_knowledge RPC,
 * and maps the result rows into the shared RetrievalResult format.
 *
 * On any error the function logs a warning and returns an empty result
 * so that callers can degrade gracefully.
 */
export async function retrieveFromSupabase(
  query: string,
  options?: RetrievalOptions
): Promise<RetrievalResult> {
  const startTime = Date.now()

  try {
    // 1. Generate embedding for the query
    const embeddingResult = await generateEmbedding(query, true)

    // 2. Extract filter / limit from options
    const categoryFilter = options?.filters?.category
    const topK = options?.topK ?? 5
    const matchThreshold = options?.threshold ?? 0.25

    // 3. Call Supabase RPC
    const rows = await searchKnowledge(
      embeddingResult.embedding,
      categoryFilter,
      topK,
      matchThreshold
    )
    console.log(`[supabase-retrieval] searchKnowledge returned ${rows.length} rows, top similarity=${rows[0]?.similarity?.toFixed(3) ?? 'N/A'}`)

    // 4. Map rows to KnowledgeDocument[]
    const documents: KnowledgeDocument[] = rows.map((row, index) => ({
      id: row.id,
      title: row.title || 'Untitled',
      content: row.content,
      category: row.category as KnowledgeCategory,
      metadata: {
        topics: [],
        lastUpdated: new Date().toISOString(),
        priority: rows.length - index, // first result = highest priority
        source: row.source_file,
      },
    }))

    // 5. Build scores array
    const scores: number[] = rows.map((row) => row.similarity)

    // 6. Assemble metadata
    const retrievalTimeMs = Date.now() - startTime

    return {
      documents,
      scores,
      totalFound: documents.length,
      metadata: {
        retrievalTimeMs,
        query,
        normalizedQuery: query.toLowerCase(),
        appliedFilters: options?.filters || {},
        tokenCount: embeddingResult.tokenCount,
      },
    }
  } catch (error) {
    const retrievalTimeMs = Date.now() - startTime
    console.warn(
      '[supabase-retrieval] retrieveFromSupabase failed:',
      error instanceof Error ? error.message : error
    )

    return {
      documents: [],
      scores: [],
      totalFound: 0,
      metadata: {
        retrievalTimeMs,
        query,
        normalizedQuery: query.toLowerCase(),
        appliedFilters: options?.filters || {},
        tokenCount: 0,
      },
    }
  }
}

/**
 * Search products from Supabase using vector similarity.
 *
 * Generates an embedding for the query and calls the search_products RPC.
 * Returns an array typed as DbProduct, but note that the RPC only returns
 * a subset of columns (id, product_name, brand, price, image_url, link,
 * primary_occasion, occasion scores, similarity). Fields like sku, category,
 * product_description, etc. will not be present on the returned objects.
 *
 * On any error the function logs a warning and returns an empty array.
 */
export async function searchProductsFromSupabase(
  query: string,
  occasionFilter?: string,
  limit?: number,
  genderFilter?: string
): Promise<DbProduct[]> {
  try {
    const embeddingResult = await generateEmbedding(query, true)

    const products = await searchProductsBySimilarity(
      embeddingResult.embedding,
      occasionFilter,
      limit || 20,
      genderFilter
    )

    return (products ?? []) as unknown as DbProduct[]
  } catch (error) {
    console.warn(
      '[supabase-retrieval] searchProductsFromSupabase failed:',
      error instanceof Error ? error.message : error
    )
    return []
  }
}

/**
 * Retrieve occasion-specific knowledge from Supabase using metadata filter.
 *
 * No embedding needed — filters `knowledge_chunks` by `metadata->'occasions'`.
 * Returns a formatted instruction block for injection into the AI prompt,
 * or an empty string if no results are found.
 */
export async function retrieveOccasionRules(
  occasion: string
): Promise<string> {
  const rows = await getKnowledgeByOccasion(occasion, 6)

  if (rows.length === 0) return ''

  const content = rows.map((r: { content: string }) => r.content).join('\n\n')
  return `[OCCASION KNOWLEDGE — ${occasion}]\n${content}\n[END OCCASION KNOWLEDGE]`
}
