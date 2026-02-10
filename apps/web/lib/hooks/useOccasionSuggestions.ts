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

  const fetchSuggestions = useCallback(async () => {
    if (!occasion) {
      setProducts([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ occasion, limit: '20' })
      if (query) {
        params.set('query', query)
      }
      const res = await fetch(`/api/suggestions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch suggestions')
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [occasion, query])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  return { products, isLoading, error, refetch: fetchSuggestions }
}
