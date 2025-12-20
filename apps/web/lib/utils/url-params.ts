import type { FilterState } from '@/lib/types'

export function parseFiltersFromUrl(
  searchParams: URLSearchParams,
  userGender?: 'women' | 'men'
): FilterState {
  // Priority: URL params > user profile > default 'all'
  const urlGender = searchParams.get('gender') as FilterState['gender']
  const gender = urlGender || userGender || 'all'

  return {
    gender,
    occasion: searchParams.get('occasion')?.split(',').filter(Boolean) || [],
    priceRange: {
      min: Number(searchParams.get('priceMin')) || 0,
      max: Number(searchParams.get('priceMax')) || 20000
    },
    searchQuery: searchParams.get('search') || ''
  }
}

export function filtersToUrlParams(filters: FilterState, selectedOutfitId?: string): string {
  const params = new URLSearchParams()

  if (filters.gender && filters.gender !== 'all') {
    params.set('gender', filters.gender)
  }
  if (filters.occasion && filters.occasion.length > 0) {
    params.set('occasion', filters.occasion.join(','))
  }
  if (filters.priceRange) {
    if (filters.priceRange.min > 0) {
      params.set('priceMin', String(filters.priceRange.min))
    }
    if (filters.priceRange.max < 20000) {
      params.set('priceMax', String(filters.priceRange.max))
    }
  }
  if (filters.searchQuery) {
    params.set('search', filters.searchQuery)
  }
  if (selectedOutfitId) {
    params.set('outfit', selectedOutfitId)
  }

  return params.toString()
}
