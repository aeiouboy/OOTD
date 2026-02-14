import { createServerClient } from './client'
import type { OccasionType } from './types'

export async function getProductsByOccasion(occasion: OccasionType, limit = 20, offset = 0) {
  const supabase = createServerClient()
  const occasionColumn = `occasion_${occasion}` as const

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('primary_occasion', occasion)
    .order(occasionColumn, { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getTopProducts(occasion: OccasionType, limit = 10) {
  const supabase = createServerClient()
  const occasionColumn = `occasion_${occasion}` as const

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order(occasionColumn, { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function searchProductsBySimilarity(
  queryEmbedding: number[],
  occasionFilter?: string,
  limit = 20,
  genderFilter?: string,
) {
  const supabase = createServerClient()

  // IMPORTANT: Always provide gender_filter (even if null) to disambiguate
  // between the 4-param and 5-param versions of search_products RPC.
  // Without this, Supabase throws PGRST203 function overloading error.
  const { data, error } = await supabase.rpc('search_products', {
    query_embedding: JSON.stringify(queryEmbedding),
    occasion_filter: occasionFilter || null,
    match_threshold: 0.25,
    match_count: limit,
    gender_filter: genderFilter || null,
  })

  if (error) throw error
  return data
}

export async function getAllProducts(limit = 100, offset = 0) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getProductCount(occasion?: OccasionType): Promise<number> {
  const supabase = createServerClient()
  const query = supabase.from('products').select('*', { count: 'exact', head: true })
  if (occasion) {
    query.eq('primary_occasion', occasion)
  }
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}
