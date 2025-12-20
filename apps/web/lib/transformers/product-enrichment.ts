/**
 * Product Enrichment
 * Enriches product data with inferred attributes and defaults
 */

import type { EnhancedProduct } from '../types/product-types'
import type { FormalityLevel, OccasionType, SeasonType, StyleTag, OutfitRole } from '../types/enums'

/**
 * Enrich product with inferred attributes (Task 3.5)
 */
export function enrichProductData(product: Partial<EnhancedProduct>): Partial<EnhancedProduct> {
  const enriched = { ...product }

  // Enrich category if missing
  if (!enriched.classification?.category?.category) {
    enriched.classification = {
      ...enriched.classification,
      category: {
        ...enriched.classification?.category,
        ...inferCategory(product.name?.th || product.name?.en || ''),
      },
    } as any
  }

  // Infer outfit role
  if (!enriched.classification?.role) {
    enriched.classification = {
      ...enriched.classification,
      role: inferOutfitRole(product.name?.th || product.name?.en || ''),
    } as any
  }

  // Enrich style attributes
  if (!enriched.style?.styleAttributes || enriched.style.styleAttributes.length === 0) {
    enriched.style = {
      ...enriched.style,
      styleAttributes: inferStyleAttributes(product.name?.th || product.name?.en || ''),
    } as any
  }

  // Calculate formality level if default
  if (!enriched.style?.formalityLevel || enriched.style.formalityLevel === 5) {
    enriched.style = {
      ...enriched.style,
      formalityLevel: inferFormalityLevel(
        product.name?.th || product.name?.en || '',
        enriched.classification?.category?.category || ''
      ),
    } as any
  }

  // Infer occasions
  if (!enriched.classification?.tags?.occasion || enriched.classification.tags.occasion.length === 0) {
    const occasions = inferOccasions(
      product.name?.th || product.name?.en || '',
      enriched.style?.formalityLevel || 5,
      enriched.classification?.role
    )

    enriched.classification = {
      ...enriched.classification,
      tags: {
        ...enriched.classification?.tags,
        occasion: occasions,
      },
    } as any
  }

  // Infer seasonality if default
  if (
    !enriched.style?.seasonality ||
    (enriched.style.seasonality.length === 1 && enriched.style.seasonality[0] === 'all-season')
  ) {
    enriched.style = {
      ...enriched.style,
      seasonality: inferSeasonality(product.name?.th || product.name?.en || ''),
    } as any
  }

  return enriched
}

/**
 * Infer category from product name
 */
function inferCategory(name: string): { category?: string; subcategory?: string } {
  const lowerName = name.toLowerCase()

  // Tops
  if (lowerName.includes('เสื้อเชิ้ต') || lowerName.includes('shirt')) {
    return { category: 'tops', subcategory: 'shirts' }
  }
  if (lowerName.includes('เสื้อยืด') || lowerName.includes('t-shirt') || lowerName.includes('tee')) {
    return { category: 'tops', subcategory: 'tshirts' }
  }
  if (lowerName.includes('โปโล') || lowerName.includes('polo')) {
    return { category: 'tops', subcategory: 'polos' }
  }
  if (lowerName.includes('สเวตเตอร์') || lowerName.includes('sweater')) {
    return { category: 'tops', subcategory: 'sweaters' }
  }

  // Bottoms
  if (lowerName.includes('กางเกง') || lowerName.includes('pants') || lowerName.includes('trousers')) {
    return { category: 'bottoms', subcategory: 'pants' }
  }
  if (lowerName.includes('ยีนส์') || lowerName.includes('jeans') || lowerName.includes('denim')) {
    return { category: 'bottoms', subcategory: 'jeans' }
  }
  if (lowerName.includes('กระโปรง') || lowerName.includes('skirt')) {
    return { category: 'bottoms', subcategory: 'skirts' }
  }
  if (lowerName.includes('ขาสั้น') || lowerName.includes('shorts')) {
    return { category: 'bottoms', subcategory: 'shorts' }
  }

  // Dresses
  if (lowerName.includes('เดรส') || lowerName.includes('dress')) {
    if (lowerName.includes('ยาว') || lowerName.includes('maxi')) {
      return { category: 'dresses', subcategory: 'maxi-dresses' }
    }
    if (lowerName.includes('midi')) {
      return { category: 'dresses', subcategory: 'midi-dresses' }
    }
    return { category: 'dresses', subcategory: 'casual-dresses' }
  }

  // Outerwear
  if (lowerName.includes('แจ็คเก็ต') || lowerName.includes('jacket')) {
    return { category: 'outerwear', subcategory: 'jackets' }
  }
  if (lowerName.includes('เบลเซอร์') || lowerName.includes('blazer')) {
    return { category: 'outerwear', subcategory: 'blazers' }
  }
  if (lowerName.includes('คาร์ดิแกน') || lowerName.includes('cardigan')) {
    return { category: 'outerwear', subcategory: 'cardigans' }
  }

  // Footwear
  if (lowerName.includes('รองเท้า') || lowerName.includes('shoes') || lowerName.includes('boots')) {
    return { category: 'footwear' }
  }

  // Accessories
  if (lowerName.includes('กระเป๋า') || lowerName.includes('bag')) {
    return { category: 'accessories', subcategory: 'bags' }
  }

  return {}
}

/**
 * Infer outfit role from product name
 */
function inferOutfitRole(name: string): OutfitRole {
  const lowerName = name.toLowerCase()

  // Dresses and jumpsuits are complete
  if (lowerName.includes('เดรส') || lowerName.includes('dress') || lowerName.includes('jumpsuit')) {
    return 'dress'
  }

  // Tops
  if (
    lowerName.includes('เสื้อ') ||
    lowerName.includes('shirt') ||
    lowerName.includes('top') ||
    lowerName.includes('blouse') ||
    lowerName.includes('polo') ||
    lowerName.includes('tee')
  ) {
    return 'top'
  }

  // Bottoms
  if (
    lowerName.includes('กางเกง') ||
    lowerName.includes('pants') ||
    lowerName.includes('jeans') ||
    lowerName.includes('trousers') ||
    lowerName.includes('กระโปรง') ||
    lowerName.includes('skirt') ||
    lowerName.includes('shorts')
  ) {
    return 'bottom'
  }

  // Outerwear
  if (
    lowerName.includes('jacket') ||
    lowerName.includes('blazer') ||
    lowerName.includes('coat') ||
    lowerName.includes('cardigan') ||
    lowerName.includes('แจ็คเก็ต') ||
    lowerName.includes('เบลเซอร์')
  ) {
    return 'outerwear'
  }

  // Footwear
  if (lowerName.includes('รองเท้า') || lowerName.includes('shoes') || lowerName.includes('boots')) {
    return 'footwear'
  }

  // Bags
  if (lowerName.includes('กระเป๋า') || lowerName.includes('bag')) {
    return 'bag'
  }

  return 'accessory'
}

/**
 * Infer style attributes from product name and details
 */
function inferStyleAttributes(name: string): StyleTag[] {
  const lowerName = name.toLowerCase()
  const styles: StyleTag[] = []

  // Classic indicators
  if (
    lowerName.includes('classic') ||
    lowerName.includes('traditional') ||
    lowerName.includes('timeless') ||
    lowerName.includes('iconic')
  ) {
    styles.push('classic')
  }

  // Modern indicators
  if (lowerName.includes('modern') || lowerName.includes('contemporary') || lowerName.includes('new')) {
    styles.push('modern')
  }

  // Casual indicators
  if (lowerName.includes('casual') || lowerName.includes('relaxed') || lowerName.includes('comfort')) {
    styles.push('casual')
  }

  // Formal indicators
  if (
    lowerName.includes('formal') ||
    lowerName.includes('dress') ||
    lowerName.includes('suit') ||
    lowerName.includes('elegant')
  ) {
    styles.push('formal')
  }

  // Minimalist indicators
  if (lowerName.includes('simple') || lowerName.includes('minimal') || lowerName.includes('basic')) {
    styles.push('minimalist')
  }

  // Default to classic if nothing matched
  if (styles.length === 0) {
    styles.push('classic')
  }

  return styles
}

/**
 * Infer formality level (1-10)
 */
function inferFormalityLevel(name: string, category: string): FormalityLevel {
  const lowerName = name.toLowerCase()

  // Very formal (9-10)
  if (
    lowerName.includes('tuxedo') ||
    lowerName.includes('gown') ||
    lowerName.includes('evening') ||
    lowerName.includes('ราตรี')
  ) {
    return 9
  }

  // Formal (7-8)
  if (
    lowerName.includes('suit') ||
    lowerName.includes('blazer') ||
    lowerName.includes('formal') ||
    lowerName.includes('เบลเซอร์')
  ) {
    return 7
  }

  // Business casual (5-6)
  if (
    lowerName.includes('shirt') ||
    lowerName.includes('polo') ||
    lowerName.includes('เสื้อเชิ้ต') ||
    lowerName.includes('โปโล')
  ) {
    return 6
  }

  // Casual (3-4)
  if (
    lowerName.includes('t-shirt') ||
    lowerName.includes('เสื้อยืด') ||
    lowerName.includes('casual') ||
    lowerName.includes('jeans') ||
    lowerName.includes('ยีนส์')
  ) {
    return 3
  }

  // Very casual (1-2)
  if (
    lowerName.includes('sport') ||
    lowerName.includes('athletic') ||
    lowerName.includes('gym') ||
    lowerName.includes('shorts')
  ) {
    return 2
  }

  // Default based on category
  if (category.includes('dress')) return 7
  if (category.includes('outerwear')) return 6
  if (category.includes('tops')) return 5
  if (category.includes('bottoms')) return 4

  return 5 // Default middle
}

/**
 * Infer occasions from product attributes
 */
function inferOccasions(name: string, formality: FormalityLevel, role?: OutfitRole): OccasionType[] {
  const lowerName = name.toLowerCase()
  const occasions: OccasionType[] = []

  // High formality (7-10)
  if (formality >= 7) {
    occasions.push('wedding', 'dinner')
    if (formality >= 9) occasions.push('party')
  }

  // Business appropriate (5-8)
  if (formality >= 5 && formality <= 8) {
    occasions.push('work')
  }

  // Date appropriate (4-7)
  if (formality >= 4 && formality <= 7) {
    occasions.push('date')
  }

  // Casual occasions (1-5)
  if (formality <= 5) {
    occasions.push('chill', 'cafe')
  }

  // Sport specific
  if (lowerName.includes('sport') || lowerName.includes('gym') || lowerName.includes('athletic')) {
    occasions.length = 0 // Clear others
    occasions.push('sport')
  }

  // Travel friendly
  if (lowerName.includes('comfort') || lowerName.includes('stretch') || role === 'bottom') {
    occasions.push('travel')
  }

  // Ensure at least one occasion
  if (occasions.length === 0) {
    occasions.push('chill')
  }

  // Remove duplicates and limit to most relevant
  return [...new Set(occasions)].slice(0, 4)
}

/**
 * Infer seasonality from product details
 */
function inferSeasonality(name: string): SeasonType[] {
  const lowerName = name.toLowerCase()
  const seasons: SeasonType[] = []

  // Summer/Hot season indicators
  if (
    lowerName.includes('short') ||
    lowerName.includes('sleeveless') ||
    lowerName.includes('ขาสั้น') ||
    lowerName.includes('แขนสั้น') ||
    lowerName.includes('linen')
  ) {
    seasons.push('hot-season')
  }

  // Cool season indicators
  if (
    lowerName.includes('sweater') ||
    lowerName.includes('jacket') ||
    lowerName.includes('long sleeve') ||
    lowerName.includes('แขนยาว') ||
    lowerName.includes('สเวตเตอร์') ||
    lowerName.includes('wool')
  ) {
    seasons.push('cool-season')
  }

  // Rainy season indicators
  if (lowerName.includes('waterproof') || lowerName.includes('raincoat') || lowerName.includes('กันฝน')) {
    seasons.push('rainy-season')
  }

  // Default to all-season if no specific indicators
  if (seasons.length === 0) {
    seasons.push('all-season')
  }

  return seasons
}

/**
 * Batch enrich products
 */
export function enrichProducts(products: Partial<EnhancedProduct>[]): Partial<EnhancedProduct>[] {
  return products.map((product) => enrichProductData(product))
}
