/**
 * Product Visual Validator
 *
 * Validates visual consistency between product data (name, description)
 * and product images (imageUrl, thumbnailUrl) to prevent mismatches
 * in flat-lay image generation and product list display.
 *
 * The primary issue: AI-generated flat-lay images may show feminine items
 * based on text descriptions, but the product thumbnails from the catalog
 * may show masculine items (e.g., "Formal Heels" but oxford shoe thumbnail).
 *
 * This validator detects such inconsistencies and provides strategies
 * for handling them.
 */

import type { Product } from '../types'

/**
 * Visual gender category for product classification
 */
export type VisualGenderCategory = 'masculine' | 'feminine' | 'neutral'

/**
 * Result of visual consistency validation
 */
export interface ProductVisualConsistency {
  /** Whether the product's visual elements are consistent */
  isConsistent: boolean
  /** List of detected issues */
  issues: string[]
  /** Inferred gender category from product text */
  textGender: VisualGenderCategory
  /** Inferred gender category from image URL patterns */
  imageGender: VisualGenderCategory
  /** Confidence score (0-1) for the assessment */
  confidence: number
}

/**
 * Configuration for visual validation
 */
export interface VisualValidationConfig {
  /** Whether to log validation results to console */
  enableLogging?: boolean
  /** Strictness level for validation (higher = more strict) */
  strictnessLevel?: 1 | 2 | 3
}

// Default configuration
const DEFAULT_CONFIG: VisualValidationConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  strictnessLevel: 2,
}

/**
 * Masculine footwear patterns in image URLs
 */
const MASCULINE_IMAGE_PATTERNS = [
  /\/oxford/i,
  /\/derby/i,
  /\/brogue/i,
  /\/wingtip/i,
  /\/men[_-]?shoe/i,
  /\/men[_-]?dress/i,
  /\/men[_-]?loafer/i,
  /\/men[_-]?boot/i,
  /\/monk[_-]?strap/i,
  /\/cap[_-]?toe/i,
  /\/dress[_-]?shoe[_-]?m/i, // dress-shoe-m for men
  /_m_/i, // common pattern for men's items
  /-m-/i,
  /[_-]mens?[_-]/i,
]

/**
 * Feminine footwear patterns in image URLs
 */
const FEMININE_IMAGE_PATTERNS = [
  /\/heel/i,
  /\/pump/i,
  /\/stiletto/i,
  /\/mule/i,
  /\/slingback/i,
  /\/ballet/i,
  /\/flat[_-]?shoe/i,
  /\/women[_-]?shoe/i,
  /\/women[_-]?sandal/i,
  /\/women[_-]?boot/i,
  /\/women[_-]?loafer/i,
  /\/womens[_-]?loafer/i, // handle "womens-loafer" pattern
  /\/pointed[_-]?toe/i,
  /\/kitten[_-]?heel/i,
  /\/block[_-]?heel/i,
  /\/wedge/i,
  /\/espadrille/i,
  /[_-]womens?[_-]/i,
  /womens-/i, // handle "womens-" prefix
  /_w_/i, // common pattern for women's items
  /-w-/i,
]

/**
 * Masculine keywords in product text (name, description)
 */
const MASCULINE_TEXT_KEYWORDS = [
  'oxford shoe',
  'derby shoe',
  'brogue',
  'wingtip',
  "men's shoe",
  'mens shoe',
  "men's loafer",
  "men's oxford",
  "men's derby",
  "men's boot",
  'monk strap',
  'cap toe dress',
  'formal men',
]

/**
 * Feminine keywords in product text (name, description)
 */
const FEMININE_TEXT_KEYWORDS = [
  'heel',
  'pump',
  'stiletto',
  'mule',
  'slingback',
  'ballet flat',
  "women's shoe",
  'womens shoe',
  "women's loafer",
  "women's sandal",
  "women's boot",
  'pointed toe',
  'kitten heel',
  'block heel',
  'wedge',
  'espadrille',
  'ankle boot',
  'knee boot',
  'peep toe',
]

/**
 * Detect visual gender category from image URL patterns
 */
export function getImageGenderCategory(imageUrl: string | undefined): VisualGenderCategory {
  if (!imageUrl) return 'neutral'

  const url = imageUrl.toLowerCase()

  // Check for masculine patterns
  const hasMasculinePattern = MASCULINE_IMAGE_PATTERNS.some((pattern) => pattern.test(url))

  // Check for feminine patterns
  const hasFemininePattern = FEMININE_IMAGE_PATTERNS.some((pattern) => pattern.test(url))

  if (hasMasculinePattern && !hasFemininePattern) return 'masculine'
  if (hasFemininePattern && !hasMasculinePattern) return 'feminine'
  if (hasMasculinePattern && hasFemininePattern) return 'neutral' // Conflicting signals

  return 'neutral'
}

/**
 * Detect visual gender category from product text (name, description)
 */
export function getTextGenderCategory(product: Product): VisualGenderCategory {
  const combined = `${product.name || ''} ${product.visualDescription || ''} ${product.subCategory || ''}`.toLowerCase()

  // Check for masculine keywords
  const hasMasculineText = MASCULINE_TEXT_KEYWORDS.some((keyword) => combined.includes(keyword))

  // Check for feminine keywords
  const hasFeminineText = FEMININE_TEXT_KEYWORDS.some((keyword) => combined.includes(keyword))

  if (hasMasculineText && !hasFeminineText) return 'masculine'
  if (hasFeminineText && !hasMasculineText) return 'feminine'
  if (hasMasculineText && hasFeminineText) return 'neutral' // Conflicting signals

  return 'neutral'
}

/**
 * Get overall visual gender category for a product
 * Combines text and image analysis
 */
export function getProductVisualCategory(product: Product): VisualGenderCategory {
  const textGender = getTextGenderCategory(product)
  const imageGender = getImageGenderCategory(product.imageUrl)

  // If both agree, use that
  if (textGender === imageGender) return textGender

  // If one is neutral, use the other
  if (textGender === 'neutral') return imageGender
  if (imageGender === 'neutral') return textGender

  // If they conflict, prioritize text (product name is more reliable than URL patterns)
  // But flag this as potentially inconsistent
  return textGender
}

/**
 * Validate visual consistency between product text and product image
 *
 * Returns detailed information about any mismatches detected
 */
export function validateProductVisualConsistency(
  product: Product,
  config: VisualValidationConfig = DEFAULT_CONFIG
): ProductVisualConsistency {
  const textGender = getTextGenderCategory(product)
  const imageGender = getImageGenderCategory(product.imageUrl)

  const issues: string[] = []
  let confidence = 1.0

  // Check for gender mismatch
  if (textGender !== 'neutral' && imageGender !== 'neutral' && textGender !== imageGender) {
    issues.push(
      `Gender mismatch: text suggests "${textGender}" but image URL suggests "${imageGender}"`
    )
    confidence = 0.3
  }

  // Check for specific problematic patterns
  const name = (product.name || '').toLowerCase()
  const imageUrl = (product.imageUrl || '').toLowerCase()

  // "Heels" in name but oxford/derby in image URL
  if (name.includes('heel') && (imageUrl.includes('oxford') || imageUrl.includes('derby') || imageUrl.includes('brogue'))) {
    issues.push('Product named "heels" but image URL contains masculine shoe pattern')
    confidence = 0.1
  }

  // "Formal Heels" but men's shoe in image URL
  if (name.includes('formal') && name.includes('heel') && MASCULINE_IMAGE_PATTERNS.some((p) => p.test(imageUrl))) {
    issues.push('Formal heels product with masculine shoe image URL')
    confidence = 0.1
  }

  // Women's product with masculine image patterns
  if ((product.category?.toLowerCase().includes('women') || textGender === 'feminine') && imageGender === 'masculine') {
    issues.push('Women\'s product category but image URL suggests masculine product')
    confidence = 0.2
  }

  const isConsistent = issues.length === 0

  // Log if enabled
  if (config.enableLogging && !isConsistent) {
    console.warn(
      `[VisualValidator] Product ${product.sku}: INCONSISTENT - ${issues.join('; ')}`
    )
  } else if (config.enableLogging && config.strictnessLevel === 3) {
    console.debug(
      `[VisualValidator] Product ${product.sku}: CONSISTENT (text: ${textGender}, image: ${imageGender})`
    )
  }

  return {
    isConsistent,
    issues,
    textGender,
    imageGender,
    confidence,
  }
}

/**
 * Check if a product is suitable for inclusion in a women's outfit
 * considering visual consistency
 */
export function isVisuallyConsistentForWomen(
  product: Product,
  config: VisualValidationConfig = DEFAULT_CONFIG
): boolean {
  const validation = validateProductVisualConsistency(product, config)

  // Reject if there are gender mismatches and image suggests masculine
  if (!validation.isConsistent && validation.imageGender === 'masculine') {
    return false
  }

  // Reject if explicitly masculine
  if (validation.textGender === 'masculine' || validation.imageGender === 'masculine') {
    return false
  }

  return true
}

/**
 * Filter products to only include those with consistent visuals for women's outfits
 */
export function filterVisuallyConsistentProducts(
  products: Product[],
  targetGender: 'women' | 'men' = 'women',
  config: VisualValidationConfig = DEFAULT_CONFIG
): Product[] {
  return products.filter((product) => {
    const validation = validateProductVisualConsistency(product, config)

    if (targetGender === 'women') {
      return isVisuallyConsistentForWomen(product, config)
    } else {
      // For men's products, reject if feminine
      return validation.textGender !== 'feminine' && validation.imageGender !== 'feminine'
    }
  })
}

/**
 * Get a summary of visual consistency issues for a set of products
 * Useful for debugging and data quality reporting
 */
export function getVisualConsistencySummary(
  products: Product[],
  config: VisualValidationConfig = DEFAULT_CONFIG
): {
  total: number
  consistent: number
  inconsistent: number
  issues: Array<{ sku: string; name: string; issues: string[] }>
} {
  const results = products.map((product) => ({
    product,
    validation: validateProductVisualConsistency(product, { ...config, enableLogging: false }),
  }))

  const consistent = results.filter((r) => r.validation.isConsistent).length
  const inconsistent = results.filter((r) => !r.validation.isConsistent)

  return {
    total: products.length,
    consistent,
    inconsistent: inconsistent.length,
    issues: inconsistent.map((r) => ({
      sku: r.product.sku,
      name: r.product.name,
      issues: r.validation.issues,
    })),
  }
}

/**
 * Validate that a product's thumbnail will match the flat-lay image description
 *
 * This is the key function for preventing the mismatch issue:
 * - If the product text describes feminine footwear (heels, pumps)
 * - But the product thumbnail shows masculine footwear (oxfords, derbies)
 * - The flat-lay will show heels but the product list will show oxfords
 */
export function validateFlatLayThumbnailMatch(
  product: Product,
  config: VisualValidationConfig = DEFAULT_CONFIG
): {
  matches: boolean
  reason?: string
  recommendation?: 'include' | 'exclude' | 'replace' | 'use-text-only'
} {
  const validation = validateProductVisualConsistency(product, config)

  if (validation.isConsistent) {
    return { matches: true, recommendation: 'include' }
  }

  // Specific case: feminine text but masculine image (the main bug scenario)
  if (validation.textGender === 'feminine' && validation.imageGender === 'masculine') {
    return {
      matches: false,
      reason: `Product "${product.name}" has feminine description but masculine image`,
      recommendation: 'exclude', // Prefer finding a replacement
    }
  }

  // Specific case: masculine text but feminine image (less common)
  if (validation.textGender === 'masculine' && validation.imageGender === 'feminine') {
    return {
      matches: false,
      reason: `Product "${product.name}" has masculine description but feminine image`,
      recommendation: 'exclude',
    }
  }

  // Unknown mismatch
  return {
    matches: false,
    reason: validation.issues.join('; '),
    recommendation: 'use-text-only', // Fall back to text description in flat-lay
  }
}

/**
 * Calculate similarity score between two products for replacement ranking
 *
 * Higher score = better replacement candidate
 * Factors: category match, price proximity, occasion overlap, color compatibility
 */
export function getSimilarityScore(original: Product, candidate: Product): number {
  let score = 0

  // Category match (30 points)
  const origCategory = (original.subCategory || original.category || '').toLowerCase()
  const candCategory = (candidate.subCategory || candidate.category || '').toLowerCase()
  if (origCategory === candCategory) {
    score += 30
  } else if (origCategory.includes(candCategory) || candCategory.includes(origCategory)) {
    score += 15
  }

  // Price proximity (25 points)
  // Perfect match at same price, decreasing as price difference grows
  const priceDiff = Math.abs(original.price - candidate.price)
  const priceRatio = priceDiff / original.price
  if (priceRatio <= 0.1) {
    score += 25 // Within 10% of original price
  } else if (priceRatio <= 0.2) {
    score += 20
  } else if (priceRatio <= 0.3) {
    score += 15
  } else if (priceRatio <= 0.5) {
    score += 5
  }

  // Occasion overlap (20 points)
  const origOccasions = original.occasion || []
  const candOccasions = candidate.occasion || []
  if (origOccasions.length > 0 && candOccasions.length > 0) {
    const overlap = origOccasions.filter(o => candOccasions.includes(o)).length
    score += Math.min(20, overlap * 10)
  } else if (origOccasions.length === 0 && candOccasions.length === 0) {
    score += 10 // Both have no occasion specified, neutral match
  }

  // Color compatibility (15 points)
  const origColors = original.colors || []
  const candColors = candidate.colors || []
  if (origColors.length > 0 && candColors.length > 0) {
    const colorMatch = origColors.some(c => candColors.includes(c))
    if (colorMatch) score += 15
  }

  // Brand consistency (10 points)
  if (original.brand && candidate.brand && original.brand.toLowerCase() === candidate.brand.toLowerCase()) {
    score += 10
  }

  return score
}

/**
 * Find a visually consistent replacement product when original has visual mismatch
 *
 * This function finds substitute products that:
 * 1. Have consistent visual elements (image matches text description)
 * 2. Match the original product's category
 * 3. Are within acceptable price range (±30% of original)
 * 4. Match occasion tags if present
 *
 * @param product - The original product with visual inconsistency
 * @param allProducts - Full product catalog to search for replacements
 * @param options - Optional configuration for replacement search
 * @returns Replacement product or null if none found
 */
export function findVisuallyConsistentReplacement(
  product: Product,
  allProducts: Product[],
  options: {
    priceRangeFactor?: number // Default 0.3 (30%)
    requireOccasionMatch?: boolean // Default false
    targetGender?: 'women' | 'men' // Default 'women'
    maxCandidates?: number // Max candidates to evaluate (performance)
  } = {}
): Product | null {
  const {
    priceRangeFactor = 0.3,
    requireOccasionMatch = false,
    targetGender = 'women',
    maxCandidates = 50,
  } = options

  // Calculate acceptable price range
  const minPrice = product.price * (1 - priceRangeFactor)
  const maxPrice = product.price * (1 + priceRangeFactor)

  // Get product category for matching
  const productSubCategory = (product.subCategory || '').toLowerCase()
  const productCategory = (product.category || '').toLowerCase()
  const productOccasions = product.occasion || []

  // Pre-filter candidates based on basic criteria
  const candidates = allProducts.filter(candidate => {
    // Skip same product
    if (candidate.sku === product.sku) return false

    // Skip if not in price range
    if (candidate.price < minPrice || candidate.price > maxPrice) return false

    // Must have same or similar category
    const candSubCategory = (candidate.subCategory || '').toLowerCase()
    const candCategory = (candidate.category || '').toLowerCase()
    const categoryMatch =
      candSubCategory === productSubCategory ||
      candCategory.includes(productCategory) ||
      productCategory.includes(candCategory) ||
      // Allow similar footwear categories
      (productSubCategory.includes('heel') && (candSubCategory.includes('heel') || candSubCategory.includes('pump'))) ||
      (productSubCategory.includes('pump') && (candSubCategory.includes('heel') || candSubCategory.includes('pump')))

    if (!categoryMatch) return false

    // Gender filter for women's products
    if (targetGender === 'women') {
      // Exclude products with men in category
      if (candCategory.includes('men') && !candCategory.includes('women')) return false
    }

    // Occasion match if required
    if (requireOccasionMatch && productOccasions.length > 0) {
      const candOccasions = candidate.occasion || []
      const hasOccasionOverlap = productOccasions.some(o => candOccasions.includes(o))
      if (!hasOccasionOverlap) return false
    }

    return true
  })

  // Limit candidates for performance
  const limitedCandidates = candidates.slice(0, maxCandidates)

  // Filter to visually consistent products and score them
  const scoredCandidates: Array<{ product: Product; score: number }> = []

  for (const candidate of limitedCandidates) {
    // Check visual consistency
    const isConsistent = targetGender === 'women'
      ? isVisuallyConsistentForWomen(candidate, { enableLogging: false })
      : validateProductVisualConsistency(candidate, { enableLogging: false }).isConsistent

    if (!isConsistent) continue

    // Calculate similarity score
    const score = getSimilarityScore(product, candidate)
    scoredCandidates.push({ product: candidate, score })
  }

  // Sort by score (descending) and return best match
  scoredCandidates.sort((a, b) => b.score - a.score)

  if (scoredCandidates.length > 0) {
    const best = scoredCandidates[0]
    console.log(
      `[VisualValidator] Found replacement for "${product.name}" (${product.sku}): ` +
      `"${best.product.name}" (${best.product.sku}) with score ${best.score}`
    )
    return best.product
  }

  console.log(
    `[VisualValidator] No suitable replacement found for "${product.name}" (${product.sku})`
  )
  return null
}

/**
 * Find replacements for all visually inconsistent products in an array
 *
 * @param products - Products to check and potentially replace
 * @param allProducts - Full product catalog for finding replacements
 * @param options - Configuration options
 * @returns Object with replaced products array and replacement map
 */
export function findReplacementsForInconsistentProducts(
  products: Product[],
  allProducts: Product[],
  options: {
    priceRangeFactor?: number
    requireOccasionMatch?: boolean
    targetGender?: 'women' | 'men'
  } = {}
): {
  /** Products with replacements applied where possible */
  products: Product[]
  /** Map of original SKU to replacement product (only for items that were replaced) */
  replacements: Map<string, Product>
  /** SKUs of items that had inconsistencies but couldn't be replaced */
  unreplaceableSkus: string[]
  /** Total number of items that had visual inconsistencies */
  inconsistentCount: number
} {
  const replacements = new Map<string, Product>()
  const unreplaceableSkus: string[] = []
  let inconsistentCount = 0

  const resultProducts = products.map(product => {
    const validation = validateProductVisualConsistency(product, { enableLogging: false })

    // If consistent, keep original
    if (validation.isConsistent) {
      return product
    }

    inconsistentCount++

    // Try to find replacement
    const replacement = findVisuallyConsistentReplacement(product, allProducts, options)

    if (replacement) {
      replacements.set(product.sku, replacement)
      return replacement
    }

    // No replacement found, keep original but track it
    unreplaceableSkus.push(product.sku)
    return product
  })

  return {
    products: resultProducts,
    replacements,
    unreplaceableSkus,
    inconsistentCount,
  }
}
