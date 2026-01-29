/**
 * Outfit Combination Rules Engine
 *
 * Implements intelligent outfit combination logic based on Pinterest 2026 trends,
 * including layering rules, occasion-specific styling, and aesthetic matching
 */

import type { Product } from '../types'
import type { OccasionType } from '../types/enums'
import type { CategorizedProducts } from '../outfit-generator'
import {
  AestheticCategory,
  ColorPalette,
  LayeringPattern,
  getLayeringPattern,
  getCasualLayeringPatterns,
  getWorkLayeringPatterns,
  getTrendingBottomStyles,
  getTrendingFootwear,
  getTrendingAccessories,
  getAestheticDefinition,
  AESTHETIC_DEFINITIONS,
} from './pinterest-2026-trends'
import {
  detectProductColor,
  areColorsCompatible,
  isProductInPalette,
  getNeutralEarthToneProducts,
  getProductsByPalette,
} from './color-palette-matcher'
import {
  validateProductVisualConsistency,
  isVisuallyConsistentForWomen,
  getImageGenderCategory,
} from '../utils/product-visual-validator'

// ============================================================================
// Type Definitions
// ============================================================================

export interface LayeringRule {
  pattern: LayeringPattern
  baseLayerProducts: Product[]
  topLayerProducts: Product[]
}

export interface OutfitCompositionRule {
  occasion: OccasionType | 'casual'
  aesthetic?: AestheticCategory
  colorPalette?: ColorPalette
  requiredPieces: {
    top?: boolean
    bottom?: boolean
    outerwear?: boolean
    shoes?: boolean
    accessories?: boolean
  }
  layeringPreference?: 'required' | 'optional' | 'none'
  silhouettePreference?: string[]
}

export interface ValidationResult {
  isValid: boolean
  issues: string[]
  duplicateCategories?: string[]
}

/**
 * Pinterest 2026 Work Outfit Formula:
 * - 1 fitted top (blouse/shirt) OR 1 base layer + 1 blazer
 * - 1 wide-leg/tailored trouser (high-waisted preferred)
 * - 1 footwear (heels/loafers)
 * - 1-2 accessories (bag, belt, jewelry)
 * - Total: 3-5 items
 */

/**
 * Pinterest 2026 Casual Outfit Formula:
 * - 1 top OR 1 base layer + 1 cardigan/sweater
 * - 1 bottom (jeans/pants - wide-leg/baggy preferred)
 * - 1 footwear (platform sneakers/chunky shoes)
 * - 1-2 accessories (structured bag, gold jewelry)
 * - Total: 3-5 items
 */

// ============================================================================
// Product Matching Helpers
// ============================================================================

/**
 * Check if product matches keywords
 */
function productMatchesKeywords(product: Product, keywords: string[]): boolean {
  const text = `${product.name} ${product.visualDescription || ''}`.toLowerCase()
  return keywords.some(keyword => text.includes(keyword.toLowerCase()))
}

/**
 * Check if product is oversized
 */
function isOversized(product: Product): boolean {
  const oversizedKeywords = ['oversized', 'loose', 'baggy', 'relaxed', 'slouchy', 'boyfriend']
  return productMatchesKeywords(product, oversizedKeywords)
}

/**
 * Check if product is fitted
 */
function isFitted(product: Product): boolean {
  const fittedKeywords = ['fitted', 'slim', 'tailored', 'bodysuit', 'tight', 'skinny']
  return productMatchesKeywords(product, fittedKeywords)
}

/**
 * Check if product is wide-leg
 */
function isWideLeg(product: Product): boolean {
  const wideLegKeywords = ['wide-leg', 'wide leg', 'palazzo', 'flare', 'baggy']
  return productMatchesKeywords(product, wideLegKeywords)
}

/**
 * Check if product is high-waisted
 */
function isHighWaisted(product: Product): boolean {
  const highWaistedKeywords = ['high-waisted', 'high waist', 'high rise', 'high-rise']
  return productMatchesKeywords(product, highWaistedKeywords)
}

/**
 * Check if product is structured
 */
function isStructured(product: Product): boolean {
  const structuredKeywords = ['structured', 'tailored', 'blazer', 'jacket', 'tote', 'formal']
  return productMatchesKeywords(product, structuredKeywords)
}

/**
 * Check if product is a platform or chunky shoe
 */
function isPlatformOrChunky(product: Product): boolean {
  const keywords = ['platform', 'chunky', 'thick sole', 'dad sneakers', 'gazelle', 'timberland']
  return productMatchesKeywords(product, keywords)
}

// ============================================================================
// Outfit Validation and Deduplication
// ============================================================================

/**
 * Determine product category for outfit composition validation
 * Maps products to outfit roles: outerwear, top, bottom, dress, shoes, accessory
 */
export function getProductCategory(product: Product): string {
  const text = `${product.name} ${product.visualDescription || ''}`.toLowerCase()

  // Check for outerwear (blazers, jackets, coats, cardigans)
  if (
    text.includes('blazer') ||
    text.includes('jacket') ||
    text.includes('coat') ||
    text.includes('cardigan') ||
    text.includes('cardi') ||
    text.includes('suit jacket')
  ) {
    return 'outerwear'
  }

  // Check for dress (standalone item)
  if (text.includes('dress') || text.includes('กระโปรง')) {
    return 'dress'
  }

  // Check for bottoms (pants, skirts, shorts)
  if (
    text.includes('pants') ||
    text.includes('trousers') ||
    text.includes('jeans') ||
    text.includes('shorts') ||
    text.includes('skirt') ||
    text.includes('กางเกง')
  ) {
    return 'bottom'
  }

  // Check for shoes
  if (
    text.includes('shoe') ||
    text.includes('boot') ||
    text.includes('sneaker') ||
    text.includes('sandal') ||
    text.includes('loafer') ||
    text.includes('heel') ||
    text.includes('รองเท้า')
  ) {
    return 'shoes'
  }

  // Check for bags
  if (
    text.includes('bag') ||
    text.includes('tote') ||
    text.includes('handbag') ||
    text.includes('purse') ||
    text.includes('กระเป๋า')
  ) {
    return 'bag'
  }

  // Check for accessories (jewelry, belts, scarves, hats)
  if (
    text.includes('jewelry') ||
    text.includes('necklace') ||
    text.includes('bracelet') ||
    text.includes('earring') ||
    text.includes('ring') ||
    text.includes('belt') ||
    text.includes('scarf') ||
    text.includes('hat') ||
    text.includes('watch') ||
    text.includes('sunglass') ||
    text.includes('เข็มขัด')
  ) {
    return 'accessory'
  }

  // Default to top for other clothing items
  if (
    text.includes('shirt') ||
    text.includes('blouse') ||
    text.includes('t-shirt') ||
    text.includes('tee') ||
    text.includes('top') ||
    text.includes('sweater') ||
    text.includes('hoodie') ||
    text.includes('เสื้อ')
  ) {
    return 'top'
  }

  return 'other'
}

/**
 * Score product for outfit composition
 * Higher score = better fit for the outfit
 */
export function scoreProductForOutfit(
  product: Product,
  outfitContext: {
    aesthetic?: AestheticCategory
    colorPalette?: ColorPalette
    occasion?: OccasionType | 'casual'
  }
): number {
  let score = 0
  const text = `${product.name} ${product.visualDescription || ''}`.toLowerCase()

  // Price weight (30%): Higher price = better quality
  score += (product.price / 10000) * 30

  // Color match weight (30%): Matches outfit color palette
  if (outfitContext.colorPalette) {
    if (isProductInPalette(product, outfitContext.colorPalette)) {
      score += 30
    }
  }

  // Aesthetic match weight (20%): Matches Pinterest 2026 aesthetic
  if (outfitContext.aesthetic) {
    const definition = getAestheticDefinition(outfitContext.aesthetic)
    if (definition) {
      const matchesKeywords = definition.keywords.some(keyword =>
        text.includes(keyword.toLowerCase())
      )
      if (matchesKeywords) {
        score += 20
      }
    }
  }

  // Formality weight (20%): Appropriate for occasion
  const isWorkOccasion = outfitContext.occasion === 'work'
  if (isWorkOccasion) {
    if (isStructured(product) || isFitted(product)) {
      score += 20
    }
  } else {
    // Casual occasions prefer oversized/relaxed
    if (isOversized(product)) {
      score += 20
    }
  }

  return score
}

/**
 * Deduplicate outfit categories by keeping the best-scoring item per category
 * Ensures only ONE item per category (outerwear, bottom, dress, etc.)
 */
export function deduplicateOutfitCategories(
  items: Product[],
  outfitContext: {
    aesthetic?: AestheticCategory
    colorPalette?: ColorPalette
    occasion?: OccasionType | 'casual'
  } = {}
): Product[] {
  // Group items by category
  const categoryMap = new Map<string, Product[]>()

  for (const item of items) {
    const category = getProductCategory(item)
    if (!categoryMap.has(category)) {
      categoryMap.set(category, [])
    }
    categoryMap.get(category)!.push(item)
  }

  // For each category, keep only the best-scoring item
  const deduplicated: Product[] = []

  for (const [category, products] of Array.from(categoryMap.entries())) {
    if (products.length === 1) {
      // Check for gender-inappropriate items even if only one
      const product = products[0]
      const productCategory = (product as any).category?.toLowerCase() || ''
      const hasMenCategory = productCategory.includes('men') && !productCategory.includes('women')

      if (hasMenCategory) {
        console.warn(`[OutfitValidator] Gender warning for ${category}:`, {
          product: product.name,
          category: productCategory,
          reason: 'men category in women\'s outfit'
        })
      }

      deduplicated.push(product)
    } else if (products.length > 1) {
      // Multiple items in same category - keep the best one
      const scored = products.map(p => ({
        product: p,
        score: scoreProductForOutfit(p, outfitContext),
      }))

      // Sort by score descending
      scored.sort((a, b) => b.score - a.score)

      // Keep the highest scoring item
      const kept = scored[0].product
      const removed = scored.slice(1).map(s => s.product)

      console.log(`[OutfitValidator] Removed duplicate ${category}:`, {
        kept: `${kept.name} (score: ${scored[0].score.toFixed(1)})`,
        removed: removed.map(p => p.name),
      })

      deduplicated.push(kept)
    }
  }

  return deduplicated
}

/**
 * Validate outfit composition according to Pinterest 2026 rules
 * Returns validation result with issues list
 */
export function validateOutfitComposition(items: Product[]): ValidationResult {
  const issues: string[] = []
  const duplicateCategories: string[] = []

  // Count items by category
  const categoryCounts = new Map<string, number>()
  const categoryItems = new Map<string, string[]>()

  for (const item of items) {
    const category = getProductCategory(item)
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)

    if (!categoryItems.has(category)) {
      categoryItems.set(category, [])
    }
    categoryItems.get(category)!.push(item.name)
  }

  // Validate: Maximum ONE outerwear per outfit
  const outerwearCount = categoryCounts.get('outerwear') || 0
  if (outerwearCount > 1) {
    issues.push(`Multiple outerwear items (${outerwearCount}): ${categoryItems.get('outerwear')?.join(', ')}`)
    duplicateCategories.push('outerwear')
  }

  // Validate: Maximum ONE bottom per outfit
  const bottomCount = categoryCounts.get('bottom') || 0
  if (bottomCount > 1) {
    issues.push(`Multiple bottom items (${bottomCount}): ${categoryItems.get('bottom')?.join(', ')}`)
    duplicateCategories.push('bottom')
  }

  // Validate: Maximum ONE dress per outfit (dresses are standalone)
  const dressCount = categoryCounts.get('dress') || 0
  if (dressCount > 1) {
    issues.push(`Multiple dress items (${dressCount}): ${categoryItems.get('dress')?.join(', ')}`)
    duplicateCategories.push('dress')
  }

  // Validate: If dress exists, should not have top+bottom
  if (dressCount > 0 && (categoryCounts.get('top') || 0) > 0) {
    issues.push('Outfit has both dress and top - dresses are standalone items')
  }

  // Validate: Maximum ONE pair of shoes
  const shoesCount = categoryCounts.get('shoes') || 0
  if (shoesCount > 1) {
    issues.push(`Multiple shoes (${shoesCount}): ${categoryItems.get('shoes')?.join(', ')}`)
    duplicateCategories.push('shoes')
  }

  // Validate: Check for masculine footwear in women's outfits (text-based)
  const shoes = items.filter(item => getProductCategory(item) === 'shoes')
  for (const shoe of shoes) {
    const name = (shoe.name || '').toLowerCase()
    const masculineKeywords = ['oxford shoe', 'derby shoe', 'brogue', 'wingtip', "men's dress shoe", "men's oxford"]

    if (masculineKeywords.some(kw => name.includes(kw))) {
      issues.push(`Masculine footwear detected in women's outfit: ${shoe.name}`)
      console.warn('[OutfitValidator] Gender-inappropriate footwear:', {
        product: shoe.name,
        category: getProductCategory(shoe),
        reason: 'masculine style keyword'
      })
    }

    // Visual consistency validation: check if image URL suggests masculine footwear
    const imageGender = getImageGenderCategory(shoe.imageUrl)
    if (imageGender === 'masculine') {
      issues.push(`Footwear image suggests masculine product: ${shoe.name}`)
      console.warn('[OutfitValidator] Visual mismatch detected for footwear:', {
        product: shoe.name,
        imageUrl: shoe.imageUrl,
        imageGender,
        reason: 'Image URL pattern suggests masculine footwear'
      })
    }
  }

  // Full visual consistency check for all items
  for (const item of items) {
    const validation = validateProductVisualConsistency(item, { enableLogging: false })
    if (!validation.isConsistent) {
      issues.push(`Visual inconsistency: ${item.name} - ${validation.issues.join('; ')}`)
    }
  }

  // Validate: Check for men's category in women's outfits
  for (const item of items) {
    const category = (item as any).category?.toLowerCase() || ''
    if (category.includes('men') && !category.includes('women')) {
      issues.push(`Men's product in women's outfit: ${item.name}`)
      console.warn('[OutfitValidator] Gender mismatch:', {
        product: item.name,
        category: category,
        reason: 'men category tag'
      })
    }
  }

  // Log validation result
  if (issues.length > 0) {
    console.warn('[OutfitValidator] Outfit composition validation FAILED:', {
      issues,
      categoryCounts: Object.fromEntries(categoryCounts),
    })
  } else {
    console.log('[OutfitValidator] Outfit validation: PASSED', {
      categoryCounts: Object.fromEntries(categoryCounts),
    })
  }

  return {
    isValid: issues.length === 0,
    issues,
    duplicateCategories: duplicateCategories.length > 0 ? duplicateCategories : undefined,
  }
}

// ============================================================================
// Layering Logic
// ============================================================================

/**
 * Find products suitable for layering based on pattern
 */
export function findLayeringProducts(
  pattern: LayeringPattern,
  categorized: CategorizedProducts
): LayeringRule | null {
  const patternDef = getLayeringPattern(pattern)
  if (!patternDef) return null

  const allTops = [...categorized.tops]

  // Find base layer products
  const baseLayerProducts = allTops.filter(product =>
    productMatchesKeywords(product, patternDef.baseLayer)
  )

  // Find top layer products
  const topLayerProducts = allTops.filter(product =>
    productMatchesKeywords(product, patternDef.topLayer)
  )

  if (baseLayerProducts.length === 0 || topLayerProducts.length === 0) {
    return null
  }

  return {
    pattern,
    baseLayerProducts,
    topLayerProducts,
  }
}

/**
 * Apply layering rules to select layered outfit components
 * Returns array with base layer and optional top layer (if layering is possible)
 */
export function applyLayeringRules(
  occasion: OccasionType | 'casual',
  categorized: CategorizedProducts
): Product[] {
  // Get appropriate layering patterns for occasion
  const isWorkOccasion = occasion === 'work'
  const patterns = isWorkOccasion
    ? getWorkLayeringPatterns()
    : getCasualLayeringPatterns()

  // Try each pattern until we find matching products
  for (const pattern of patterns) {
    const layering = findLayeringProducts(pattern, categorized)
    if (layering) {
      // Pick one from each layer
      const baseLayer = layering.baseLayerProducts[
        Math.floor(Math.random() * layering.baseLayerProducts.length)
      ]
      let topLayer = layering.topLayerProducts[
        Math.floor(Math.random() * layering.topLayerProducts.length)
      ]

      // Ensure baseLayer and topLayer are different items
      if (baseLayer.sku === topLayer.sku && layering.topLayerProducts.length > 1) {
        // Pick a different top layer
        const alternativeTopLayers = layering.topLayerProducts.filter(p => p.sku !== baseLayer.sku)
        if (alternativeTopLayers.length > 0) {
          topLayer = alternativeTopLayers[Math.floor(Math.random() * alternativeTopLayers.length)]
        }
      }

      // Check color compatibility
      const baseColors = detectProductColor(baseLayer)
      const topColors = detectProductColor(topLayer)

      if (areColorsCompatible(baseColors, topColors) && baseLayer.sku !== topLayer.sku) {
        // Check if top layer is outerwear
        const topLayerCategory = getProductCategory(topLayer)
        const hasOuterwear = topLayerCategory === 'outerwear'

        console.log('[OutfitValidator] Layering applied:', {
          baseLayer: baseLayer.name,
          topLayer: topLayer.name,
          hasOuterwear,
        })

        return [baseLayer, topLayer]
      }
    }
  }

  // Fallback: return single top if layering not possible
  if (categorized.tops.length > 0) {
    return [categorized.tops[Math.floor(Math.random() * categorized.tops.length)]]
  }

  return []
}

// ============================================================================
// Casual Trend Rules (Pinterest 2026)
// ============================================================================

/**
 * Apply Pinterest 2026 casual/everyday trend rules
 */
export function applyCasualTrendRules(
  products: CategorizedProducts,
  colorPalette?: ColorPalette
): Product[] {
  const outfit: Product[] = []

  // Filter products by color palette if specified
  let filteredProducts = { ...products }
  if (colorPalette) {
    filteredProducts = {
      tops: getProductsByPalette(products.tops, colorPalette),
      bottoms: getProductsByPalette(products.bottoms, colorPalette),
      shoes: getProductsByPalette(products.shoes, colorPalette),
      dresses: getProductsByPalette(products.dresses, colorPalette),
      accessories: getProductsByPalette(products.accessories, colorPalette),
      other: products.other,
    }
  } else {
    // Default to neutral earth tones for casual
    filteredProducts = {
      tops: getNeutralEarthToneProducts(products.tops),
      bottoms: getNeutralEarthToneProducts(products.bottoms),
      shoes: products.shoes, // Don't filter shoes as strictly
      dresses: getNeutralEarthToneProducts(products.dresses),
      accessories: products.accessories,
      other: products.other,
    }
  }

  // Pinterest Casual Trend: Oversized layering
  const layeredTops = applyLayeringRules('casual', filteredProducts)
  let hasOuterwear = false

  if (layeredTops.length > 0) {
    outfit.push(...layeredTops)

    // Check if layering includes outerwear
    hasOuterwear = layeredTops.some(item => getProductCategory(item) === 'outerwear')
  } else {
    // Fallback: single oversized top
    const oversizedTops = filteredProducts.tops.filter(isOversized)
    if (oversizedTops.length > 0) {
      outfit.push(oversizedTops[Math.floor(Math.random() * oversizedTops.length)])
    } else if (filteredProducts.tops.length > 0) {
      outfit.push(filteredProducts.tops[Math.floor(Math.random() * filteredProducts.tops.length)])
    }
  }

  // Pinterest Casual Trend: Baggy/wide-leg bottoms
  const wideLegBottoms = filteredProducts.bottoms.filter(isWideLeg)
  const baggyBottoms = filteredProducts.bottoms.filter(product =>
    productMatchesKeywords(product, ['baggy', 'loose', 'relaxed'])
  )

  const trendyBottoms = [...wideLegBottoms, ...baggyBottoms]
  if (trendyBottoms.length > 0) {
    outfit.push(trendyBottoms[Math.floor(Math.random() * trendyBottoms.length)])
  } else if (filteredProducts.bottoms.length > 0) {
    outfit.push(filteredProducts.bottoms[Math.floor(Math.random() * filteredProducts.bottoms.length)])
  }

  // Pinterest Casual Trend: Platform sneakers or chunky footwear
  const platformShoes = filteredProducts.shoes.filter(isPlatformOrChunky)
  if (platformShoes.length > 0) {
    outfit.push(platformShoes[Math.floor(Math.random() * platformShoes.length)])
  } else if (filteredProducts.shoes.length > 0) {
    outfit.push(filteredProducts.shoes[Math.floor(Math.random() * filteredProducts.shoes.length)])
  }

  // Pinterest Casual Trend: Black structured bag or gold jewelry
  // Only add if we don't already have outerwear from layering
  const structuredBags = filteredProducts.accessories.filter(product =>
    productMatchesKeywords(product, ['bag', 'tote', 'handbag', 'structured', 'black'])
  )
  const goldJewelry = filteredProducts.accessories.filter(product =>
    productMatchesKeywords(product, ['jewelry', 'necklace', 'gold', 'chain', 'layered'])
  )

  const trendyAccessories = [...structuredBags, ...goldJewelry]
  if (trendyAccessories.length > 0) {
    outfit.push(trendyAccessories[Math.floor(Math.random() * trendyAccessories.length)])
  }

  // Validate and deduplicate before returning
  const validation = validateOutfitComposition(outfit)
  if (!validation.isValid) {
    console.warn('[OutfitValidator] Casual outfit has duplicates, deduplicating...')
    return deduplicateOutfitCategories(outfit, { colorPalette })
  }

  console.log('[OutfitValidator] Casual outfit composition:', {
    itemCount: outfit.length,
    hasLayering: layeredTops.length > 1,
    hasOuterwear,
  })

  return outfit
}

// ============================================================================
// Work/Office Trend Rules (Pinterest 2026)
// ============================================================================

/**
 * Apply Pinterest 2026 work/office trend rules
 */
export function applyWorkTrendRules(products: CategorizedProducts): Product[] {
  const outfit: Product[] = []

  // Filter for work-appropriate color palettes
  const workPalettes: ColorPalette[] = ['work-olive-black', 'work-brown-cream', 'all-black-texture']
  let workColoredProducts: Product[] = []

  workPalettes.forEach(palette => {
    workColoredProducts = [
      ...workColoredProducts,
      ...getProductsByPalette([...products.tops, ...products.bottoms], palette),
    ]
  })

  // If no work-colored products, use neutral earth tones
  if (workColoredProducts.length === 0) {
    workColoredProducts = getNeutralEarthToneProducts([...products.tops, ...products.bottoms])
  }

  const workTops = workColoredProducts.filter(p =>
    products.tops.some(t => t.sku === p.sku)
  )
  const workBottoms = workColoredProducts.filter(p =>
    products.bottoms.some(b => b.sku === p.sku)
  )

  // Pinterest Work Trend: Fitted top
  const fittedTops = workTops.filter(isFitted)
  if (fittedTops.length > 0) {
    outfit.push(fittedTops[Math.floor(Math.random() * fittedTops.length)])
  } else if (workTops.length > 0) {
    outfit.push(workTops[Math.floor(Math.random() * workTops.length)])
  } else if (products.tops.length > 0) {
    outfit.push(products.tops[Math.floor(Math.random() * products.tops.length)])
  }

  // Pinterest Work Trend: Wide-leg, high-waisted trousers
  const wideLegBottoms = workBottoms.filter(isWideLeg)
  const highWaistedBottoms = workBottoms.filter(isHighWaisted)
  const idealBottoms = wideLegBottoms.filter(isHighWaisted)

  if (idealBottoms.length > 0) {
    outfit.push(idealBottoms[Math.floor(Math.random() * idealBottoms.length)])
  } else if (wideLegBottoms.length > 0) {
    outfit.push(wideLegBottoms[Math.floor(Math.random() * wideLegBottoms.length)])
  } else if (highWaistedBottoms.length > 0) {
    outfit.push(highWaistedBottoms[Math.floor(Math.random() * highWaistedBottoms.length)])
  } else if (workBottoms.length > 0) {
    outfit.push(workBottoms[Math.floor(Math.random() * workBottoms.length)])
  } else if (products.bottoms.length > 0) {
    outfit.push(products.bottoms[Math.floor(Math.random() * products.bottoms.length)])
  }

  // Pinterest Work Trend: Blazer or cardigan layering (ONE outerwear only)
  // 70% blazer, 30% cardigan for work
  const blazers = products.tops.filter(product =>
    productMatchesKeywords(product, ['blazer', 'jacket', 'suit jacket', 'structured'])
  )
  const cardigans = products.tops.filter(product =>
    productMatchesKeywords(product, ['cardigan', 'cardi', 'open front', 'knit jacket'])
  )

  // Choose either blazer OR cardigan, not both
  let layerPiece: Product | undefined
  const shouldUseBlazer = Math.random() < 0.7 // 70% chance for blazer

  if (shouldUseBlazer && blazers.length > 0) {
    layerPiece = blazers[Math.floor(Math.random() * blazers.length)]
  } else if (cardigans.length > 0) {
    layerPiece = cardigans[Math.floor(Math.random() * cardigans.length)]
  } else if (blazers.length > 0) {
    // Fallback to blazer if no cardigans available
    layerPiece = blazers[Math.floor(Math.random() * blazers.length)]
  }

  // Add the selected outerwear if color compatible
  if (layerPiece && outfit.length > 0) {
    // Check color compatibility with existing outfit
    const outfitColors = outfit.flatMap(p => detectProductColor(p))
    const layerColors = detectProductColor(layerPiece)

    if (areColorsCompatible(outfitColors, layerColors)) {
      outfit.push(layerPiece)
      console.log('[OutfitValidator] Added work outerwear:', layerPiece.name)
    }
  }

  // Pinterest Work Trend: Structured leather tote
  const structuredTotes = products.accessories.filter(product =>
    productMatchesKeywords(product, ['tote', 'bag', 'leather', 'structured', 'work bag'])
  )

  if (structuredTotes.length > 0) {
    outfit.push(structuredTotes[Math.floor(Math.random() * structuredTotes.length)])
  }

  // Pinterest Work Trend: Women's appropriate footwear
  // Priority: heels, loafers, mules, pointed-toe flats
  // Exclude: oxford shoes, derby shoes, brogues (masculine styles)
  if (products.shoes.length > 0) {
    const womensWorkFootwear = products.shoes.filter(shoe => {
      const name = (shoe.name || '').toLowerCase()
      const desc = (shoe.visualDescription || '').toLowerCase()
      const combined = `${name} ${desc}`

      // Exclude masculine footwear
      const masculineKeywords = ['oxford shoe', 'derby shoe', 'brogue', 'wingtip', "men's dress shoe", "men's oxford", "men's derby"]
      const isMasculine = masculineKeywords.some(kw => combined.includes(kw))

      if (isMasculine) {
        console.debug('[Work Outfit] Excluded masculine footwear:', shoe.name)
        return false
      }

      // Prefer women's work-appropriate footwear
      const womensWorkKeywords = [
        'heel', 'pump', 'loafer', 'mule',
        'pointed-toe', 'slingback', 'block heel',
        'women\'s', 'ladies'
      ]
      const isWomensWork = womensWorkKeywords.some(kw => combined.includes(kw))

      return isWomensWork || !isMasculine // Include if women's style or not masculine
    })

    if (womensWorkFootwear.length > 0) {
      outfit.push(womensWorkFootwear[Math.floor(Math.random() * womensWorkFootwear.length)])
      console.log('[Work Outfit] Added women\'s footwear:', womensWorkFootwear[womensWorkFootwear.length - 1].name)
    } else {
      // Fallback to any shoe if no specific women's work footwear found
      outfit.push(products.shoes[Math.floor(Math.random() * products.shoes.length)])
      console.warn('[Work Outfit] No women\'s work footwear found, using fallback shoe')
    }
  }

  // Validate and deduplicate before returning
  const validation = validateOutfitComposition(outfit)
  if (!validation.isValid) {
    console.warn('[OutfitValidator] Work outfit has duplicates, deduplicating...')
    return deduplicateOutfitCategories(outfit, { occasion: 'work' })
  }

  console.log('[OutfitValidator] Work outfit composition:', {
    itemCount: outfit.length,
    outerwearType: layerPiece ? getProductCategory(layerPiece) : 'none',
  })

  return outfit
}

// ============================================================================
// Aesthetic-Based Filtering
// ============================================================================

/**
 * Filter products by aesthetic compatibility
 */
export function getAestheticCompatibleProducts(
  aesthetic: AestheticCategory,
  products: Product[]
): Product[] {
  const definition = getAestheticDefinition(aesthetic)
  if (!definition) return products

  return products.filter(product => {
    const text = `${product.name} ${product.visualDescription || ''}`.toLowerCase()

    // Check if product matches aesthetic keywords
    const matchesKeywords = definition.keywords.some(keyword =>
      text.includes(keyword.toLowerCase())
    )

    // Check if product matches aesthetic color palettes
    const productColors = detectProductColor(product)
    const matchesPalette = definition.colorPalettes.some(palette =>
      isProductInPalette(product, palette)
    )

    return matchesKeywords || matchesPalette
  })
}

/**
 * Apply aesthetic-based outfit composition
 */
export function applyAestheticRules(
  aesthetic: AestheticCategory,
  products: CategorizedProducts,
  occasion?: OccasionType | 'casual'
): Product[] {
  const definition = getAestheticDefinition(aesthetic)
  if (!definition) return []

  // Filter all products by aesthetic
  const aestheticProducts: CategorizedProducts = {
    tops: getAestheticCompatibleProducts(aesthetic, products.tops),
    bottoms: getAestheticCompatibleProducts(aesthetic, products.bottoms),
    shoes: getAestheticCompatibleProducts(aesthetic, products.shoes),
    dresses: getAestheticCompatibleProducts(aesthetic, products.dresses),
    accessories: getAestheticCompatibleProducts(aesthetic, products.accessories),
    other: products.other,
  }

  // Apply occasion-specific rules with aesthetic filtering
  switch (aesthetic) {
    case 'street-style':
    case 'casual-chic':
    case 'clean-girl':
    case 'scandinavian-minimal':
      // Use casual trend rules with aesthetic products
      return applyCasualTrendRules(aestheticProducts)

    case 'corporate-chic':
    case 'quiet-luxury':
    case 'minimalist-office':
      // Use work trend rules with aesthetic products
      return applyWorkTrendRules(aestheticProducts)

    case 'dark-academia':
      // Brown-focused layered look
      const brownProducts: CategorizedProducts = {
        tops: getProductsByPalette(aestheticProducts.tops, 'monochromatic-brown'),
        bottoms: getProductsByPalette(aestheticProducts.bottoms, 'monochromatic-brown'),
        shoes: aestheticProducts.shoes,
        dresses: getProductsByPalette(aestheticProducts.dresses, 'monochromatic-brown'),
        accessories: aestheticProducts.accessories,
        other: aestheticProducts.other,
      }
      return applyCasualTrendRules(brownProducts, 'monochromatic-brown')

    case 'y2k-revival':
      // Colorful, playful combinations
      return applyCasualTrendRules(aestheticProducts)

    default:
      return applyCasualTrendRules(aestheticProducts)
  }
}

// ============================================================================
// Main Combination Engine
// ============================================================================

/**
 * Apply trend-based outfit combination rules
 * Enhanced with user preference support
 */
export function applyTrendBasedCombination(
  products: CategorizedProducts,
  options: {
    occasion?: OccasionType | 'casual'
    aesthetic?: AestheticCategory
    colorPalette?: ColorPalette
    userPreferredAesthetics?: AestheticCategory[]
  } = {}
): Product[] {
  const { occasion = 'casual', aesthetic, colorPalette, userPreferredAesthetics } = options

  // If user has preferred aesthetics and no specific aesthetic is provided, use first preference
  const targetAesthetic = aesthetic || (userPreferredAesthetics && userPreferredAesthetics.length > 0 ? userPreferredAesthetics[0] : undefined)

  // If aesthetic is specified (or derived from user preferences), use aesthetic-based rules
  if (targetAesthetic) {
    return applyAestheticRules(targetAesthetic, products, occasion)
  }

  // Otherwise, use occasion-based rules
  const isWorkOccasion = occasion === 'work'
  if (isWorkOccasion) {
    return applyWorkTrendRules(products)
  }

  return applyCasualTrendRules(products, colorPalette)
}
