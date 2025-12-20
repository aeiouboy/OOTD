import type { Outfit, FilterState } from '@/lib/types'

export function filterOutfits(
  outfits: Outfit[],
  filters: FilterState
): Outfit[] {
  return outfits.filter(outfit => {
    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      const hasMatchingGender = outfit.items.some(
        item => item.category?.toLowerCase() === filters.gender
      )
      if (!hasMatchingGender) return false
    }

    // Occasion filter
    // Note: This requires outfit.style field from Story 1.5
    // if (filters.occasion && filters.occasion.length > 0) {
    //   if (!filters.occasion.includes(outfit.style)) return false
    // }

    // Price range filter
    if (filters.priceRange) {
      if (outfit.totalPrice < filters.priceRange.min ||
          outfit.totalPrice > filters.priceRange.max) {
        return false
      }
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesTitle = outfit.title.toLowerCase().includes(query)
      const matchesDesc = outfit.description?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesDesc) return false
    }

    return true
  })
}
