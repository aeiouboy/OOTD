import { createServerClient } from './client'
import type { DbKnowledgeChunkInsert } from './types'
import { ALL_KNOWLEDGE_CATEGORIES, type KnowledgeCategoryKey } from '@/lib/constants/knowledge-categories'

export interface ListKnowledgeOptions {
  category?: KnowledgeCategoryKey
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface ListKnowledgeResult {
  chunks: KnowledgeChunkRecord[]
  total: number
  page: number
  limit: number
}

export interface KnowledgeChunkRecord {
  id: string
  source_file: string
  category: string
  tier: number
  title: string | null
  content: string
  metadata: Record<string, unknown> | null
  created_at: string | null
  updated_at: string | null
  is_active: boolean
}

export interface KnowledgeStats {
  total: number
  active: number
  inactive: number
  byCategory: Record<KnowledgeCategoryKey, number>
}

function sanitizePositiveNumber(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number') return fallback
  if (!Number.isFinite(value) || value <= 0) return fallback
  return Math.floor(value)
}

export async function searchKnowledge(
  queryEmbedding: number[],
  categoryFilter?: string,
  limit: number = 10,
  matchThreshold: number = 0.25
) {
  const supabase = createServerClient()
  const { data, error } = await supabase.rpc('search_knowledge', {
    query_embedding: JSON.stringify(queryEmbedding),
    category_filter: categoryFilter,
    match_threshold: matchThreshold,
    match_count: limit,
  })
  if (error) throw error
  return data ?? []
}

export async function getKnowledgeByOccasion(
  occasion: string,
  limit: number = 5
) {
  const supabase = createServerClient()
  const { data, error } = await supabase.rpc('search_knowledge_by_occasion', {
    occasion_type: occasion,
    max_results: limit,
  })
  if (error) throw error
  return data ?? []
}

export async function getKnowledgeByCategory(category: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('knowledge_chunks')
    .select('*')
    .eq('category', category)
    .order('tier', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listKnowledge(options: ListKnowledgeOptions = {}): Promise<ListKnowledgeResult> {
  const supabase = createServerClient()

  const page = sanitizePositiveNumber(options.page, 1)
  const limit = Math.min(sanitizePositiveNumber(options.limit, 25), 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('knowledge_chunks')
    .select('id, source_file, category, tier, title, content, metadata, created_at, updated_at, is_active', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (options.category) {
    query = query.eq('category', options.category)
  }

  if (typeof options.isActive === 'boolean') {
    query = query.eq('is_active', options.isActive)
  }

  if (options.search) {
    const escaped = options.search.trim().replace(/[,%._\\]/g, '')
    if (escaped.length > 0) {
      query = query.or(`title.ilike.%${escaped}%,content.ilike.%${escaped}%`)
    }
  }

  const { data, count, error } = await query
  if (error) throw error

  const chunks = (data ?? []).map((row) => ({
    ...(row as Omit<KnowledgeChunkRecord, 'is_active' | 'updated_at'> & {
      is_active?: boolean | null
      updated_at?: string | null
    }),
    is_active: row.is_active ?? true,
    updated_at: row.updated_at ?? row.created_at ?? null,
  }))

  return {
    chunks,
    total: count ?? 0,
    page,
    limit,
  }
}

export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('knowledge_chunks')
    .select('category, is_active')

  if (error) throw error

  const byCategory = ALL_KNOWLEDGE_CATEGORIES.reduce<Record<KnowledgeCategoryKey, number>>(
    (acc, category) => {
      acc[category.key] = 0
      return acc
    },
    {} as Record<KnowledgeCategoryKey, number>
  )

  let active = 0
  let inactive = 0

  for (const row of data ?? []) {
    const category = row.category as KnowledgeCategoryKey
    if (category in byCategory) {
      byCategory[category] += 1
    }

    if (row.is_active === false) {
      inactive += 1
    } else {
      active += 1
    }
  }

  return {
    total: (data ?? []).length,
    active,
    inactive,
    byCategory,
  }
}

export async function toggleKnowledgeChunkActive(id: string, isActive: boolean): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('knowledge_chunks')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

export async function deleteKnowledgeChunks(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('knowledge_chunks')
    .delete()
    .in('id', ids)
    .select('id')

  if (error) throw error
  return data?.length ?? 0
}

export async function insertKnowledgeChunks(chunks: DbKnowledgeChunkInsert[]): Promise<number> {
  if (chunks.length === 0) return 0

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('knowledge_chunks')
    .insert(chunks)
    .select('id')

  if (error) throw error
  return data?.length ?? 0
}
