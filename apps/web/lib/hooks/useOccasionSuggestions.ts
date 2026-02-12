import { useState, useEffect, useCallback } from 'react'
import type { OccasionType } from '@/lib/supabase/types'

export interface SuggestionProduct {
  id: string
  sku: string | null
  product_name: string
  brand: string | null
  price: number | null
  original_price: number | null
  image_url: string | null
  link: string | null
  availability: string | null
  product_description: string | null
  primary_occasion: OccasionType | null
}

export function useOccasionSuggestions(occasion: OccasionType | null, query?: string) {
  const [products, setProducts] = useState<SuggestionProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [occasion, query])

  const fetchSuggestions = useCallback(async () => {
    if (!occasion) {
      setProducts([])
      setTotal(0)
      setTotalPages(0)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ occasion, limit: '20' })
      params.set('page', String(page))
      if (query) {
        params.set('query', query)
      }
      const res = await fetch(`/api/suggestions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch suggestions')
      const data = await res.json()
      setProducts(data.data ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [occasion, query, page])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  return { products, isLoading, error, refetch: fetchSuggestions, page, totalPages, total, setPage }
}
