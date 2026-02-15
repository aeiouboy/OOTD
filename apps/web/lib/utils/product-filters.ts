/**
 * Product Filters
 * Advanced filtering logic for enhanced product model
 *
 * chore-kb003: Added KB-powered filters for Thai occasions, trends, and visual weight
 */

import type { EnhancedProduct, ProductFilterCriteria, ProductSortField } from '../types/product-types'
import type { OccasionType, Gender, FormalityLevel, TrendLifecycle, VisualWeightLevel } from '../types/enums'
import type { ThaiOccasion } from '../matching/thai-cultural-matcher'
import { OCCASIONS } from '../constants/occasions'
import { expandColorMatchTokens } from './color-normalizer'

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
 * Check if a product is women's appropriate footwear (for EnhancedProduct)
 * Excludes masculine footwear styles like oxford shoes, derby shoes, brogues
 */
export function isWomensFootwearEnhanced(product: EnhancedProduct): boolean {
  const nameEn = (product.name.en || '').toLowerCase()
  const nameTh = (product.name.th || '').toLowerCase()
  const descEn = (product.description?.en || '').toLowerCase()
  const descTh = (product.description?.th || '').toLowerCase()
  const combined = `${nameEn} ${nameTh} ${descEn} ${descTh}`

  // Masculine footwear keywords (to exclude)
  const masculineFootwear = [
    'oxford shoe', 'derby shoe', 'brogue',
    'wingtip', 'men\'s dress shoe',
    'men\'s oxford', 'men\'s derby',
    'men\'s loafer', 'men loafer'
  ]

  // Check if it's masculine footwear (should be excluded)
  const isMasculine = masculineFootwear.some(keyword => combined.includes(keyword))
  if (isMasculine) {
    console.debug(`[Enhanced Footwear Filter] Excluded masculine footwear:`, product.name.en || product.name.th)
    return false
  }

  return true
}

/**
 * Filter by gender with strict validation
 *
 * For women's products:
 * - Gender must be 'women' or 'unisex'
 * - For footwear, must NOT include masculine styles (oxford shoes, derby, brogue)
 *
 * For men's products:
 * - Gender must be 'men' or 'unisex'
 */
export function filterByGender(products: EnhancedProduct[], gender: Gender | Gender[]): EnhancedProduct[] {
  const targetGenders = Array.isArray(gender) ? gender : [gender]

  return products.filter((product) => {
    const productGender = product.classification?.gender
    const isFootwear = product.classification?.role === 'footwear'

    // Include unisex for any gender filter
    const matchesGender = (productGender && targetGenders.includes(productGender)) || productGender === 'unisex'

    if (!matchesGender) {
      return false
    }

    // Additional validation for women's footwear
    if (targetGenders.includes('women') && isFootwear) {
      return isWomensFootwearEnhanced(product)
    }

    return true
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
    const colorTokens = expandColorMatchTokens(criteria.colors)
    filtered = filtered.filter((product) => {
      const primaryColor = product.style?.colors?.primary?.toLowerCase() || ''
      const secondaryColors = (product.style?.colors?.secondary || []).map((c) => c.toLowerCase())
      return colorTokens.some(
        (token) =>
          primaryColor.includes(token.toLowerCase()) ||
          secondaryColors.some((sc) => sc.includes(token.toLowerCase()))
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

/**
 * Filter by occasion with formality-based fallback
 *
 * First tries tag-based occasion filtering (like filterByOccasion).
 * If no results, falls back to formality range filtering using OCCASIONS definition.
 */
export function filterByOccasionWithFormality(
  products: EnhancedProduct[],
  occasion: OccasionType
): EnhancedProduct[] {
  // First try: tag-based occasion filter
  const tagFiltered = filterByOccasion(products, occasion)
  if (tagFiltered.length > 0) {
    return tagFiltered
  }

  // Fallback: formality range filter using OCCASIONS definition
  const occasionDef = OCCASIONS[occasion]
  if (occasionDef) {
    const formalityFiltered = filterByFormality(products, occasionDef.formalityRange)
    return formalityFiltered
  }

  return products
}

/**
 * Rank products by relevance for a given occasion and budget.
 *
 * Scoring:
 * - Occasion tag match: +30
 * - Formality range fit: +20
 * - Budget proximity: +10 if within budget, -5 per 1000 THB over budget
 *
 * Returns products sorted descending by score.
 * If no occasion is provided, returns products as-is (no sorting needed).
 */
export function rankProductsByRelevance(
  products: EnhancedProduct[],
  occasion?: OccasionType,
  budget?: number
): EnhancedProduct[] {
  if (!occasion) {
    return products
  }

  const occasionDef = OCCASIONS[occasion]
  if (!occasionDef) {
    return products
  }

  const scored = products.map((product) => {
    let score = 0

    // Occasion tag match: +30
    const productOccasions = product.classification?.tags?.occasion || []
    if (productOccasions.includes(occasion)) {
      score += 30
    }

    // Formality range fit: +20
    const formality = product.style?.formalityLevel || 5
    if (formality >= occasionDef.formalityRange.min && formality <= occasionDef.formalityRange.max) {
      score += 20
    }

    // Budget proximity: +10 if within budget, -5 per 1000 THB over
    if (budget) {
      const price = product.pricing?.currentPrice || 0
      if (price <= budget) {
        score += 10
      } else {
        const overBy = price - budget
        score -= Math.floor(overBy / 1000) * 5
      }
    }

    return { product, score }
  })

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score)

  return scored.map((s) => s.product)
}

// ============================================================================
// KB003: KB-Powered Filters
// ============================================================================

/**
 * Get Thai context from product (with fallback)
 */
function getThaiContext(product: EnhancedProduct): any {
  return (product as any).thaiContext || null
}

/**
 * Get visual matching from product (with fallback)
 */
function getVisualMatching(product: EnhancedProduct): any {
  return (product as any).visualMatching || null
}

/**
 * Get social proof from product (with fallback)
 */
function getSocialProof(product: EnhancedProduct): any {
  return (product as any).socialProof || null
}

/**
 * KB003: Filter by Thai cultural occasion
 * Uses thaiContext attributes for filtering
 */
export function filterByThaiOccasion(
  products: EnhancedProduct[],
  occasion: ThaiOccasion
): EnhancedProduct[] {
  return products.filter((product) => {
    const ctx = getThaiContext(product)
    if (!ctx) return true // Include products without Thai context

    switch (occasion) {
      case 'temple':
        return ctx.templeAppropriate === true
      case 'wedding-morning':
      case 'wedding-evening':
        return ctx.weddingAppropriate !== 'none'
      case 'funeral':
        return ctx.funeralAppropriate === true
      case 'songkran-temple':
        return ctx.songkranSuitable === 'temple-morning' || ctx.songkranSuitable === 'both'
      case 'songkran-water':
        return ctx.songkranSuitable === 'water-play' || ctx.songkranSuitable === 'both'
      case 'loy-krathong':
        return ctx.loyKrathongSuitable === true
      case 'chinese-new-year':
        return ctx.cnySuitable === 'suitable'
      case 'royal-event':
        return ctx.templeAppropriate === true // Similar modesty requirements
      case 'casual':
      default:
        return true
    }
  })
}

/**
 * KB003: Filter by trend status
 * Uses socialProof.trendStatus for filtering
 */
export function filterByTrendStatus(
  products: EnhancedProduct[],
  statuses: TrendLifecycle[]
): EnhancedProduct[] {
  return products.filter((product) => {
    const sp = getSocialProof(product)
    if (!sp || !sp.trendStatus) return true // Include products without social proof
    return statuses.includes(sp.trendStatus)
  })
}

/**
 * KB003: Filter by visual weight level
 * Uses visualMatching.visualWeightLevel for filtering
 */
export function filterByVisualWeight(
  products: EnhancedProduct[],
  levels: VisualWeightLevel[]
): EnhancedProduct[] {
  return products.filter((product) => {
    const vm = getVisualMatching(product)
    if (!vm || !vm.visualWeightLevel) return true // Include products without visual matching
    return levels.includes(vm.visualWeightLevel)
  })
}

/**
 * KB003: Filter by month suitability
 * Uses thaiContext.monthSuitability for filtering
 */
export function filterByMonthSuitability(
  products: EnhancedProduct[],
  month: number,
  minScore: number = 6
): EnhancedProduct[] {
  const monthIndex = Math.max(0, Math.min(11, month))

  return products.filter((product) => {
    const ctx = getThaiContext(product)
    if (!ctx || !ctx.monthSuitability || ctx.monthSuitability.length !== 12) {
      return true // Include products without month suitability
    }
    return ctx.monthSuitability[monthIndex] >= minScore
  })
}

/**
 * KB003: Filter by cost-per-wear tier
 * Uses priceIntelligence.costPerWear for filtering
 */
export function filterByCostPerWear(
  products: EnhancedProduct[],
  maxCostPerWear: number
): EnhancedProduct[] {
  return products.filter((product) => {
    const pi = (product as any).priceIntelligence
    if (!pi || typeof pi.costPerWear !== 'number') {
      // Estimate from price (assume 50 wears)
      const price = product.pricing?.currentPrice || 0
      return (price / 50) <= maxCostPerWear
    }
    return pi.costPerWear <= maxCostPerWear
  })
}

/**
 * KB003: Get trending products (emerging, peak, or trending status)
 */
export function getTrendingProducts(products: EnhancedProduct[]): EnhancedProduct[] {
  return filterByTrendStatus(products, ['emerging', 'peak', 'trending'] as TrendLifecycle[])
}

/**
 * KB003: Get timeless products (classic or timeless status)
 */
export function getTimelessProducts(products: EnhancedProduct[]): EnhancedProduct[] {
  return filterByTrendStatus(products, ['classic', 'timeless'] as TrendLifecycle[])
}
