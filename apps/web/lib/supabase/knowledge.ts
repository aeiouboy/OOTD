import { createServerClient } from './client'

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
