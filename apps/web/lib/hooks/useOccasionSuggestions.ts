import { useState, useEffect, useCallback } from 'react'
import type { OccasionType } from '@/lib/types/enums'

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
  primary_occasion: string | null
}

export interface SuggestionFilters {
  gender?: 'all' | 'women' | 'men'
  priceMin?: number
  priceMax?: number
}

export type OccasionFilter = OccasionType | 'everyday_casual' | 'date_night' | 'weekend_social'

export function useOccasionSuggestions(
  occasion: OccasionFilter | null,
  query?: string,
  filters?: SuggestionFilters
) {
  const [products, setProducts] = useState<SuggestionProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [occasion, query, filters?.gender, filters?.priceMin, filters?.priceMax])

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ limit: '20' })
      params.set('page', String(page))
      if (occasion) {
        params.set('occasion', occasion)
      }
      if (query) {
        params.set('query', query)
      }
      if (filters?.gender && filters.gender !== 'all') {
        params.set('gender', filters.gender)
      }
      if (filters?.priceMin != null && filters.priceMin > 0) {
        params.set('price_min', String(filters.priceMin))
      }
      if (filters?.priceMax != null && filters.priceMax < 20000) {
        params.set('price_max', String(filters.priceMax))
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
  }, [occasion, query, page, filters?.gender, filters?.priceMin, filters?.priceMax])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  return { products, isLoading, error, refetch: fetchSuggestions, page, totalPages, total, setPage }
}
