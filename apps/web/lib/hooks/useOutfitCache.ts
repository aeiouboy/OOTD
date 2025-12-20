import { useState, useCallback } from 'react'
import type { Outfit, FilterState } from '@/lib/types'

interface OutfitCacheEntry {
  outfits: Outfit[]
  timestamp: number
}

// In-memory cache (resets on page reload)
const outfitCache = new Map<string, OutfitCacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCacheKey(filters: FilterState): string {
  return JSON.stringify({
    gender: filters.gender,
    occasion: filters.occasion?.sort(),
    priceRange: filters.priceRange
  })
}

export function useOutfitCache() {
  const getFromCache = useCallback((filters: FilterState): Outfit[] | null => {
    const key = getCacheKey(filters)
    const entry = outfitCache.get(key)

    if (!entry) return null

    // Check if cache is still valid
    const now = Date.now()
    if (now - entry.timestamp > CACHE_DURATION) {
      outfitCache.delete(key)
      return null
    }

    return entry.outfits
  }, [])

  const saveToCache = useCallback((filters: FilterState, outfits: Outfit[]) => {
    const key = getCacheKey(filters)
    outfitCache.set(key, {
      outfits,
      timestamp: Date.now()
    })
  }, [])

  const clearCache = useCallback(() => {
    outfitCache.clear()
  }, [])

  return { getFromCache, saveToCache, clearCache }
}
