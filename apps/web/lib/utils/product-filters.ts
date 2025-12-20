/**
 * Product Filters
 * Advanced filtering logic for enhanced product model
 */

import type { EnhancedProduct, ProductFilterCriteria, ProductSortField } from '../types/product-types'
import type { OccasionType, Gender, FormalityLevel } from '../types/enums'

/**
 * Filter by occasion (Task 5.2)
 */
export function filterByOccasion(products: EnhancedProduct[], occasions: OccasionType | OccasionType[]): EnhancedProduct[] {
  const targetOccasions = Array.isArray(occasions) ? occasions : [occasions]

  return products.filter((product) => {
    const productOccasions = product.classification?.tags?.occasion || []
    return targetOccasions.some((occ) => productOccasions.includes(occ))
  })
}

/**
 * Filter by style attributes (Task 5.3)
 */
export function filterByStyle(products: EnhancedProduct[], styles: string[]): EnhancedProduct[] {
  return products.filter((product) => {
    const productStyles = product.style?.styleAttributes || []
    return styles.some((style) => productStyles.includes(style as any))
  })
}

/**
 * Filter by price range (Task 5.3)
 */
export function filterByPriceRange(
  products: EnhancedProduct[],
  range: { min: number; max: number }
): EnhancedProduct[] {
  return products.filter((product) => {
    const price = product.pricing?.currentPrice || 0
    return price >= range.min && price <= range.max
  })
}

/**
 * Filter by formality level (Task 5.3)
 */
export function filterByFormality(
  products: EnhancedProduct[],
  range: { min: FormalityLevel; max: FormalityLevel }
): EnhancedProduct[] {
  return products.filter((product) => {
    const formality = product.style?.formalityLevel || 5
    return formality >= range.min && formality <= range.max
  })
}

/**
 * Filter by season (Task 5.3)
 */
export function filterBySeason(products: EnhancedProduct[], seasons: string[]): EnhancedProduct[] {
  return products.filter((product) => {
    const productSeasons = product.style?.seasonality || []
    // Include if product has 'all-season' or matches any target season
    return (
      productSeasons.includes('all-season' as any) ||
      seasons.some((season) => productSeasons.includes(season as any))
    )
  })
}

/**
 * Filter by gender
 */
export function filterByGender(products: EnhancedProduct[], gender: Gender | Gender[]): EnhancedProduct[] {
  const targetGenders = Array.isArray(gender) ? gender : [gender]

  return products.filter((product) => {
    const productGender = product.classification?.gender
    // Include unisex for any gender filter
    return (productGender && targetGenders.includes(productGender)) || productGender === 'unisex'
  })
}

/**
 * Filter by brand
 */
export function filterByBrand(products: EnhancedProduct[], brands: string[]): EnhancedProduct[] {
  const lowerBrands = brands.map((b) => b.toLowerCase())

  return products.filter((product) => {
    return lowerBrands.includes(product.brand.toLowerCase())
  })
}

/**
 * Filter by availability
 */
export function filterByAvailability(products: EnhancedProduct[], statuses: string[]): EnhancedProduct[] {
  return products.filter((product) => {
    return product.availability?.status && statuses.includes(product.availability.status)
  })
}

/**
 * Filter by outfit role
 */
export function filterByRole(products: EnhancedProduct[], roles: string[]): EnhancedProduct[] {
  return products.filter((product) => {
    const productRole = product.classification?.role
    return productRole && roles.includes(productRole)
  })
}

/**
 * Apply multiple filters (comprehensive filtering)
 */
export function applyFilters(products: EnhancedProduct[], criteria: ProductFilterCriteria): EnhancedProduct[] {
  let filtered = products

  // Gender filter
  if (criteria.gender) {
    filtered = filterByGender(filtered, criteria.gender)
  }

  // Occasion filter
  if (criteria.occasions) {
    filtered = filterByOccasion(filtered, criteria.occasions)
  }

  // Price range filter
  if (criteria.priceRange) {
    filtered = filterByPriceRange(filtered, criteria.priceRange)
  }

  // Formality filter
  if (criteria.formality) {
    filtered = filterByFormality(filtered, criteria.formality)
  }

  // Color filter
  if (criteria.colors && criteria.colors.length > 0) {
    filtered = filtered.filter((product) => {
      const primaryColor = product.style?.colors?.primary?.toLowerCase() || ''
      const secondaryColors = (product.style?.colors?.secondary || []).map((c) => c.toLowerCase())
      return criteria.colors!.some(
        (color) => primaryColor.includes(color.toLowerCase()) || secondaryColors.some((sc) => sc.includes(color.toLowerCase()))
      )
    })
  }

  // Style filter
  if (criteria.styles && criteria.styles.length > 0) {
    filtered = filterByStyle(filtered, criteria.styles)
  }

  // Season filter
  if (criteria.seasons && criteria.seasons.length > 0) {
    filtered = filterBySeason(filtered, criteria.seasons)
  }

  // Brand filter
  if (criteria.brands && criteria.brands.length > 0) {
    filtered = filterByBrand(filtered, criteria.brands)
  }

  // Availability filter
  if (criteria.availability && criteria.availability.length > 0) {
    filtered = filterByAvailability(filtered, criteria.availability)
  }

  // Role filter
  if (criteria.roles && criteria.roles.length > 0) {
    filtered = filterByRole(filtered, criteria.roles)
  }

  return filtered
}

/**
 * Enhanced search across Thai and English (Task 5.4)
 */
export function searchProductsEnhanced(products: EnhancedProduct[], query: string): EnhancedProduct[] {
  if (!query || query.trim().length === 0) {
    return products
  }

  const lowerQuery = query.toLowerCase().trim()

  return products.filter((product) => {
    // Search in names (Thai and English)
    const nameTh = product.name.th?.toLowerCase() || ''
    const nameEn = product.name.en?.toLowerCase() || ''

    if (nameTh.includes(lowerQuery) || nameEn.includes(lowerQuery)) {
      return true
    }

    // Search in descriptions
    const descTh = product.description?.th?.toLowerCase() || ''
    const descEn = product.description?.en?.toLowerCase() || ''

    if (descTh.includes(lowerQuery) || descEn.includes(lowerQuery)) {
      return true
    }

    // Search in brand
    if (product.brand.toLowerCase().includes(lowerQuery)) {
      return true
    }

    // Search in tags
    const occasions = product.classification?.tags?.occasion || []
    if (occasions.some((occ) => occ.toLowerCase().includes(lowerQuery))) {
      return true
    }

    const styles = product.style?.styleAttributes || []
    if (styles.some((style) => style.toLowerCase().includes(lowerQuery))) {
      return true
    }

    // Search in category
    const category = product.classification?.category
    if (
      category?.department?.toLowerCase().includes(lowerQuery) ||
      category?.category?.toLowerCase().includes(lowerQuery) ||
      category?.subcategory?.toLowerCase().includes(lowerQuery)
    ) {
      return true
    }

    return false
  })
}

/**
 * Sort products (Task 5.5)
 */
export function sortProducts(products: EnhancedProduct[], sortBy: ProductSortField): EnhancedProduct[] {
  const sorted = [...products]

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.pricing?.currentPrice || 0) - (b.pricing?.currentPrice || 0))

    case 'price-desc':
      return sorted.sort((a, b) => (b.pricing?.currentPrice || 0) - (a.pricing?.currentPrice || 0))

    case 'formality-asc':
      return sorted.sort((a, b) => (a.style?.formalityLevel || 5) - (b.style?.formalityLevel || 5))

    case 'formality-desc':
      return sorted.sort((a, b) => (b.style?.formalityLevel || 5) - (a.style?.formalityLevel || 5))

    case 'popularity':
      return sorted.sort((a, b) => {
        const aViews = a.extended?.userInteractions?.views || 0
        const bViews = b.extended?.userInteractions?.views || 0
        return bViews - aViews
      })

    case 'newest':
      return sorted.sort((a, b) => {
        const aDate = a.metadata?.createdAt || new Date(0)
        const bDate = b.metadata?.createdAt || new Date(0)
        return bDate.getTime() - aDate.getTime()
      })

    case 'relevance':
    default:
      // Relevance sorting would require search context
      return sorted
  }
}

/**
 * Get unique values for filter options
 */
export function getFilterOptions(products: EnhancedProduct[]) {
  const brands = new Set<string>()
  const colors = new Set<string>()
  const styles = new Set<string>()
  const occasions = new Set<OccasionType>()
  const seasons = new Set<string>()

  products.forEach((product) => {
    brands.add(product.brand)
    if (product.style?.colors?.primary) colors.add(product.style.colors.primary)
    product.style?.colors?.secondary?.forEach((c) => colors.add(c))
    product.style?.styleAttributes?.forEach((s) => styles.add(s))
    product.classification?.tags?.occasion?.forEach((o) => occasions.add(o))
    product.style?.seasonality?.forEach((s) => seasons.add(s))
  })

  return {
    brands: Array.from(brands).sort(),
    colors: Array.from(colors).sort(),
    styles: Array.from(styles).sort(),
    occasions: Array.from(occasions).sort(),
    seasons: Array.from(seasons).sort(),
    priceRange: {
      min: Math.min(...products.map((p) => p.pricing?.currentPrice || 0)),
      max: Math.max(...products.map((p) => p.pricing?.currentPrice || 0)),
    },
  }
}
