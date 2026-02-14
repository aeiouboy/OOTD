'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Outfit, FilterState } from '@/lib/types'
import { filterOutfits } from '@/lib/utils/outfit-filter'
import { parseFiltersFromUrl, filtersToUrlParams } from '@/lib/utils/url-params'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

export function useOutfitDiscovery(allOutfits: Outfit[]) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { profile } = useUserProfile()

  // Initialize state from URL with user profile fallback
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromUrl(searchParams, profile?.gender)
  )

  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [viewMode, setViewMode] = useState<'chat' | 'detail'>('chat')

  // Sync gender filter with user profile when profile loads
  // Priority: URL params > user manual selection > profile preference
  useEffect(() => {
    const urlGender = searchParams.get('gender')
    // Only sync if: no URL gender param, profile is loaded, and filter is currently 'all'
    if (!urlGender && profile && filters.gender === 'all') {
      setFilters(prev => ({ ...prev, gender: profile.gender }))
    }
  }, [profile, searchParams])

  // Load selected outfit from URL on mount
  useEffect(() => {
    const outfitId = searchParams.get('outfit')
    if (outfitId) {
      const outfit = allOutfits.find(o => o.id === outfitId)
      if (outfit) {
        setSelectedOutfit(outfit)
        setViewMode('detail')
      }
    }
  }, []) // Run only on mount

  // Memoized filtered outfits
  const filteredOutfits = useMemo(() => {
    return filterOutfits(allOutfits, filters)
  }, [allOutfits, filters])

  // Sync URL with state (debounced to avoid excessive updates)
  useEffect(() => {
    const params = filtersToUrlParams(filters, selectedOutfit?.id)
    const newUrl = params ? `${pathname}?${params}` : pathname

    // Only update if URL actually changed
    const currentUrl = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    if (newUrl !== currentUrl) {
      window.history.pushState({}, '', newUrl)
    }
  }, [filters, selectedOutfit, pathname])

  // Handlers - memoized to prevent infinite re-renders
  const selectOutfit = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit)
    setViewMode('detail')
  }, [])

  const backToChat = useCallback(() => {
    setSelectedOutfit(null)
    setViewMode('chat')
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      gender: profile?.gender || 'all',
      occasion: [],
      priceRange: { min: 0, max: 20000 },
      searchQuery: ''
    })
  }, [profile?.gender])

  return {
    filters,
    setFilters,
    filteredOutfits,
    selectedOutfit,
    viewMode,
    selectOutfit,
    backToChat,
    resetFilters
  }
}
