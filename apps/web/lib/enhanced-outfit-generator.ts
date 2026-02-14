/**
 * Enhanced Outfit Generator
 * Generates outfit recommendations using EnhancedProduct data model
 * Integrates with occasion mapping and product categorization
 */

import type { EnhancedProduct } from './types/product-types'
import type { OccasionType, Gender, OutfitRole } from './types/enums'
import type { Product } from './types'
import type { UserProfile } from './types/user-profile-types'
import { mapProductToOccasions } from './categorization/occasion-mapper'
import { getProductName, getProductPrice, getProductImageUrl } from './utils/product-utils'
import { filterByGender, filterByOccasion, filterByThaiOccasion, filterByMonthSuitability } from './utils/product-filters'
import {
  validateOutfitComposition,
  deduplicateOutfitCategories,
} from './styling/outfit-combination-rules'
import {
  getUserPreferenceContext,
  personalizeOutfitTitle,
  type UserPreferenceContext,
} from './utils/user-preference-mapper'
// KB003: Import matching modules for KB-powered scoring
import {
  validateThaiOccasion,
  detectThaiOccasion,
  getThaiClimateScore,
  type ThaiOccasion,
  type ThaiValidationResult,
} from './matching/thai-cultural-matcher'
import {
  calculateVisualBalance,
  getSilhouetteCompatibility,
  type VisualBalanceScore,
} from './matching/visual-matching-scorer'
import {
  calculatePairingScore,
  calculateOutfitCompatibility,
  checkOutfitCompleteness,
} from './matching/cross-product-matcher'
import {
  calculateValueScore,
  calculateOutfitCostPerWear,
  optimizeOutfitBudget,
} from './matching/price-intelligence-optimizer'
import {
  calculateTrendScore,
  getPopularityScore,
  rankByTrendStatus,
} from './matching/social-proof-ranker'

export interface EnhancedOutfit {
  id: string
  title: string
  description: string
  totalPrice: number
  products: EnhancedProduct[]
  occasion?: OccasionType
  formality?: number
  primaryImage?: string
}

interface CategorizedEnhancedProducts {
  top: EnhancedProduct[]
  bottom: EnhancedProduct[]
  dress: EnhancedProduct[]
  outerwear: EnhancedProduct[]
  footwear: EnhancedProduct[]
  accessory: EnhancedProduct[]
  bag: EnhancedProduct[]
}

/**
 * KB003: Outfit context for KB-powered scoring
 */
interface OutfitContext {
  occasion?: OccasionType
  thaiOccasion?: ThaiOccasion
  month?: number
  maxBudget?: number
  preferTrending?: boolean
}

/**
 * KB003: KB-powered outfit scoring result
 */
export interface KBOutfitScore {
  overall: number
  thaiCultural: number
  visualBalance: number
  crossProduct: number
  priceValue: number
  socialProof: number
  issues: string[]
}

/**
 * KB003: Check if product has KB attributes
 */
function hasKBAttributes(product: EnhancedProduct): boolean {
  const p = product as any
  return !!(p.thaiContext || p.visualMatching || p.crossProductCompatibility || p.priceIntelligence || p.socialProof)
}

/**
 * KB003: Score outfit using KB attributes with weighted scoring
 * Weights: Thai 30%, Visual 25%, Cross-Product 20%, Price 15%, Social 10%
 */
export function scoreOutfitWithKB(outfit: EnhancedProduct[], context: OutfitContext = {}): KBOutfitScore {
  const issues: string[] = []

  // Default scores if no KB data
  let thaiCultural = 70
  let visualBalance = 70
  let crossProduct = 70
  let priceValue = 70
  let socialProof = 70

  // Check if any products have KB attributes
  const hasKB = outfit.some(hasKBAttributes)

  if (!hasKB) {
    // Return default scores for v0 products
    return {
      overall: 70,
      thaiCultural,
      visualBalance,
      crossProduct,
      priceValue,
      socialProof,
      issues: ['Products missing KB attributes - using default scoring'],
    }
  }

  // 1. Thai Cultural Score (30%)
  if (context.thaiOccasion) {
    const thaiResult = validateThaiOccasion(outfit, context.thaiOccasion)
    thaiCultural = thaiResult.score
    if (!thaiResult.valid) {
      issues.push(...thaiResult.issues)
    }
  } else {
    // Use climate score as fallback
    thaiCultural = getThaiClimateScore(outfit) * 10 // Scale 1-10 to 10-100
  }

  // 2. Visual Balance Score (25%)
  const visualResult = calculateVisualBalance(outfit)
  visualBalance = visualResult.overall

  // 3. Cross-Product Compatibility (20%)
  const compatResult = calculateOutfitCompatibility(outfit)
  crossProduct = compatResult.score
  if (!compatResult.completeness.complete) {
    issues.push(...compatResult.completeness.suggestions)
  }

  // 4. Price Value Score (15%)
  priceValue = calculateValueScore(outfit)

  // 5. Social Proof Score (10%)
  socialProof = calculateTrendScore(outfit)

  // Calculate weighted overall score
  const overall = Math.round(
    thaiCultural * 0.30 +
    visualBalance * 0.25 +
    crossProduct * 0.20 +
    priceValue * 0.15 +
    socialProof * 0.10
  )

  return {
    overall,
    thaiCultural,
    visualBalance,
    crossProduct,
    priceValue,
    socialProof,
    issues,
  }
}

/**
 * Categorize enhanced products by their outfit role
 */
export function categorizeEnhancedProducts(products: EnhancedProduct[]): CategorizedEnhancedProducts {
  const categorized: CategorizedEnhancedProducts = {
    top: [],
    bottom: [],
    dress: [],
    outerwear: [],
    footwear: [],
    accessory: [],
    bag: [],
  }

  for (const product of products) {
    const role = product.classification?.role
    if (role === 'top') categorized.top.push(product)
    else if (role === 'bottom') categorized.bottom.push(product)
    else if (role === 'dress') categorized.dress.push(product)
    else if (role === 'outerwear') categorized.outerwear.push(product)
    else if (role === 'footwear') categorized.footwear.push(product)
    else if (role === 'accessory') categorized.accessory.push(product)
    else if (role === 'bag') categorized.bag.push(product)
  }

  return categorized
}

/**
 * Random pick helper
 */
function randomPick<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Convert EnhancedProduct to Product for validation
 */
function toProduct(enhanced: EnhancedProduct): Product {
  const status = enhanced.availability?.status || 'in_stock'
  // Map AvailabilityStatus to Product availability type
  const availability: 'in_stock' | 'low_stock' | 'out_of_stock' =
    status === 'pre_order' ? 'in_stock' : status

  return {
    sku: enhanced.id,
    name: getProductName(enhanced),
    brand: enhanced.brand,
    price: getProductPrice(enhanced),
    imageUrl: getProductImageUrl(enhanced) || '',
    availability,
    visualDescription: enhanced.description?.th || enhanced.description?.en || '',
  }
}

/**
 * Generate a single outfit from categorized products
 * Enhanced with user preference personalization
 */
export function generateEnhancedOutfit(
  categorized: CategorizedEnhancedProducts,
  options: {
    occasion?: OccasionType
    gender?: Gender
    maxPrice?: number
    formalityLevel?: number
    userProfile?: UserProfile | null
    thaiOccasion?: ThaiOccasion
  } = {}
): EnhancedOutfit | null {
  const { occasion, gender, maxPrice, formalityLevel, userProfile, thaiOccasion } = options

  // Get user preference context if profile exists
  const userContext: UserPreferenceContext | null = userProfile ? getUserPreferenceContext(userProfile) : null

  const products: EnhancedProduct[] = []

  // Strategy 1: Dress-based outfit (common for women)
  if (categorized.dress.length > 0 && gender === 'women') {
    const dress = randomPick(categorized.dress)
    if (dress) {
      products.push(dress)

      // Add footwear
      const footwear = randomPick(categorized.footwear)
      if (footwear) products.push(footwear)

      // Add accessory or bag
      if (Math.random() > 0.3) {
        const accessory = randomPick([...categorized.accessory, ...categorized.bag])
        if (accessory) products.push(accessory)
      }
    }

    // Validate dress-based outfit composition
    const dressValidation = validateOutfitComposition(products.map(toProduct))
    if (!dressValidation.isValid) {
      const deduplicated = deduplicateOutfitCategories(products.map(toProduct), { occasion })
      products.length = 0
      products.push(...deduplicated.map(p => {
        // Map back to EnhancedProduct by finding the original
        const original = [dress, ...categorized.footwear, ...categorized.accessory, ...categorized.bag]
          .find(ep => ep && ep.id === p.sku)
        return original!
      }).filter(Boolean))
    }
  }
  // Strategy 2: Top + Bottom outfit
  else {
    const top = randomPick(categorized.top)
    const bottom = randomPick(categorized.bottom)

    if (top) products.push(top)
    if (bottom) products.push(bottom)

    // Add outerwear for formal occasions or higher formality
    if (occasion === 'work' || occasion === 'wedding' || (formalityLevel && formalityLevel >= 7)) {
      const outerwear = randomPick(categorized.outerwear)
      if (outerwear) products.push(outerwear)
    }

    // Add footwear
    const footwear = randomPick(categorized.footwear)
    if (footwear) products.push(footwear)

    // Add accessories
    if (Math.random() > 0.5) {
      const accessory = randomPick(categorized.accessory)
      if (accessory) products.push(accessory)
    }

    // Validate top+bottom outfit composition
    const topBottomValidation = validateOutfitComposition(products.map(toProduct))
    if (!topBottomValidation.isValid) {
      const deduplicated = deduplicateOutfitCategories(products.map(toProduct), { occasion })
      products.length = 0
      products.push(...deduplicated.map(p => {
        // Map back to EnhancedProduct by finding the original
        const original = [...categorized.top, ...categorized.bottom, ...categorized.outerwear,
          ...categorized.footwear, ...categorized.accessory, ...categorized.bag]
          .find(ep => ep && ep.id === p.sku)
        return original!
      }).filter(Boolean))
    }
  }

  // Need at least 2 products to make an outfit
  if (products.length < 2) {
    return null
  }

  // Final validation before creating outfit object
  const finalValidation = validateOutfitComposition(products.map(toProduct))
  if (!finalValidation.isValid) {
    console.warn('[EnhancedOutfitGenerator] Invalid composition detected:', finalValidation.issues)
    const deduplicated = deduplicateOutfitCategories(products.map(toProduct), { occasion })
    products.length = 0
    products.push(...deduplicated.map(p => {
      // Map back to EnhancedProduct by finding the original
      const allProducts = Object.values(categorized).flat()
      const original = allProducts.find(ep => ep && ep.id === p.sku)
      return original!
    }).filter(Boolean))
  }

  // Calculate total price
  const totalPrice = products.reduce((sum, p) => sum + getProductPrice(p), 0)

  // Check if outfit exceeds max price
  if (maxPrice && totalPrice > maxPrice) {
    return null
  }

  // KB003: Score outfit with KB attributes
  const kbScore = scoreOutfitWithKB(products, {
    occasion,
    thaiOccasion,
    month: new Date().getMonth(),
    maxBudget: maxPrice,
  })

  // KB003: Skip outfits with poor KB scores (below 50)
  if (kbScore.overall < 50) {
    console.warn('[EnhancedOutfitGenerator] KB score too low:', kbScore.overall, kbScore.issues)
    return null
  }

  // Calculate average formality
  const avgFormality =
    products.reduce((sum, p) => sum + (p.style?.formalityLevel || 5), 0) / products.length

  // Generate title and description
  const baseTitle = generateOutfitTitle(products, occasion)
  const personalizedTitle = userContext?.userName
    ? personalizeOutfitTitle(baseTitle, userContext.userName)
    : baseTitle
  const description = generateOutfitDescription(products, occasion, avgFormality)

  return {
    id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: personalizedTitle,
    description,
    totalPrice,
    products,
    occasion,
    formality: Math.round(avgFormality),
    primaryImage: getProductImageUrl(products[0]),
  }
}

/**
 * Generate outfit title
 */
function generateOutfitTitle(products: EnhancedProduct[], occasion?: OccasionType): string {
  const occasionTitles: Record<OccasionType, string[]> = {
    work: ['ชุดออฟฟิศมั่นใจ', 'ลุคทำงานสวยปัง', 'สไตล์การทำงาน', 'ออฟฟิศสวยเท่'],
    chill: ['ลุคชิลล์สบายๆ', 'วันหยุดสบายสไตล์', 'ชุดพักผ่อนสบาย', 'สไตล์วันชิลล์'],
    wedding: ['ชุดงานแต่งงานหรู', 'ลุคงานพิธี', 'ชุดสง่างาม', 'สไตล์งานพิเศษ'],
    sport: ['ลุคสปอร์ตแอคทีฟ', 'ชุดออกกำลังกาย', 'สไตล์แอคทีฟ', 'ชุดฟิตเนส'],
    travel: ['ชุดท่องเที่ยว', 'ลุคเที่ยวสบาย', 'สไตล์นักเดินทาง', 'ชุดเดินทาง'],
    date: ['ชุดเดทหวาน', 'ลุคโรแมนติก', 'สไตล์เดท', 'ชุดสุดพิเศษ'],
    dinner: ['ชุดดินเนอร์หรู', 'ลุคร้านอาหารหรู', 'สไตล์รับประทานอาหาร', 'ชุดไปทานข้าว'],
    cafe: ['ชุดไปคาเฟ่', 'ลุคสไตล์คาเฟ่', 'สไตล์บรันช์', 'ชุดไปกินกาแฟ'],
    party: ['ชุดปาร์ตี้', 'ลุคงานเลี้ยง', 'สไตล์งานสังสรรค์', 'ชุดงานแฮปปี้'],
  }

  if (occasion && occasionTitles[occasion]) {
    const options = occasionTitles[occasion]
    return randomPick(options) || 'ชุดแต่งตัวสวย'
  }

  // Fallback to brand-based title
  const brands = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean)
  if (brands.length > 0) {
    return `${brands[0]} Ensemble`
  }

  return 'ชุดแต่งตัวสวย'
}

/**
 * Generate outfit description
 */
function generateOutfitDescription(
  products: EnhancedProduct[],
  occasion?: OccasionType,
  formality?: number
): string {
  const occasionDescriptions: Record<OccasionType, string[]> = {
    work: [
      'เหมาะสำหรับการทำงาน ดูเป็นมืออาชีพและมั่นใจ',
      'ลุคออฟฟิศที่ใส่แล้วดูดีมีสไตล์',
      'สวมใส่สบาย เหมาะกับการทำงานทั้งวัน',
    ],
    chill: [
      'ชุดสบายๆ เหมาะกับวันหยุดพักผ่อน',
      'สไตล์สบายแต่ดูดี',
      'เหมาะกับการออกไปเดินเล่นหรือทำกิจกรรมสบายๆ',
    ],
    wedding: [
      'เหมาะกับงานพิธีที่สำคัญ ดูสง่าและหรูหรา',
      'ชุดที่ดูเป็นทางการและสวยงาม',
      'สวมใส่ไปงานแต่งงานได้อย่างเหมาะสม',
    ],
    sport: [
      'เหมาะกับการออกกำลังกายและกิจกรรมกลางแจ้ง',
      'สวมใส่สบาย เคลื่อนไหวได้คล่องตัว',
      'สไตล์สปอร์ตที่ดูดีและใช้งานได้จริง',
    ],
    travel: [
      'เหมาะกับการเดินทางท่องเที่ยว',
      'สวมใส่สบายตลอดทริป',
      'สไตล์ที่เหมาะกับนักเดินทาง',
    ],
    date: [
      'ลุคโรแมนติกเหมาะกับการออกเดท',
      'ชุดที่ทำให้คุณดูน่ารักและมั่นใจ',
      'สวมใส่ไปเดทได้อย่างสบายใจ',
    ],
    dinner: [
      'เหมาะกับการไปทานอาหารที่ร้านหรู',
      'ลุคที่ดูดีและเหมาะสมกับบรรยากาศร้านอาหาร',
      'ชุดที่ทำให้คุณดูเป็นผู้ใหญ่',
    ],
    cafe: [
      'เหมาะกับการไปนั่งคาเฟ่กับเพื่อน',
      'สไตล์สบายๆ แต่ดูดี',
      'ชุดที่เหมาะกับการทานอาหารเช้าหรือบรันช์',
    ],
    party: [
      'เหมาะกับงานปาร์ตี้และงานสังสรรค์',
      'ลุคที่ดูโดดเด่นและสนุกสนาน',
      'ชุดที่ทำให้คุณโดดเด่นในงาน',
    ],
  }

  if (occasion && occasionDescriptions[occasion]) {
    const options = occasionDescriptions[occasion]
    return randomPick(options) || 'ชุดที่ประกอบด้วยสินค้าคุณภาพจากเซ็นทรัล'
  }

  // Fallback based on formality
  if (formality && formality >= 7) {
    return 'ชุดที่ดูเป็นทางการและเหมาะกับโอกาสพิเศษ'
  } else if (formality && formality <= 3) {
    return 'ชุดสบายๆ เหมาะกับการใส่ในชีวิตประจำวัน'
  }

  return 'ชุดที่ประกอบด้วยสินค้าคุณภาพจากเซ็นทรัล'
}

/**
 * Generate multiple outfits
 * Enhanced with user preference personalization
 */
export function generateEnhancedOutfits(
  products: EnhancedProduct[],
  options: {
    count?: number
    occasion?: OccasionType
    gender?: Gender
    maxPrice?: number
    minFormality?: number
    maxFormality?: number
    userProfile?: UserProfile | null
    thaiOccasion?: ThaiOccasion
    applyMonthFilter?: boolean
  } = {}
): EnhancedOutfit[] {
  const { count = 5, occasion, gender, maxPrice, minFormality, maxFormality, userProfile, thaiOccasion, applyMonthFilter = true } = options

  // Get user preference context if profile exists
  const userContext = userProfile ? getUserPreferenceContext(userProfile) : null

  // Use gender from user profile if available
  const targetGender = userProfile?.gender || gender

  // Filter products
  let filtered = [...products]

  // Filter by gender
  if (targetGender) {
    filtered = filterByGender(filtered, targetGender)
  }

  // KB003: Filter by Thai occasion if specified
  if (thaiOccasion) {
    filtered = filterByThaiOccasion(filtered, thaiOccasion)
    console.log(`[EnhancedOutfitGenerator] Thai occasion filter (${thaiOccasion}): ${filtered.length} products`)
  }

  // KB003: Filter by current month suitability
  if (applyMonthFilter) {
    const currentMonth = new Date().getMonth()
    filtered = filterByMonthSuitability(filtered, currentMonth, 5) // Min score 5
    console.log(`[EnhancedOutfitGenerator] Month filter (month ${currentMonth}): ${filtered.length} products`)
  }

  // Filter by occasion
  if (occasion) {
    filtered = filterByOccasion(filtered, occasion)
  }

  // Filter by price
  if (maxPrice) {
    filtered = filtered.filter((p) => getProductPrice(p) <= maxPrice)
  }

  // Filter by formality
  if (minFormality !== undefined || maxFormality !== undefined) {
    filtered = filtered.filter((p) => {
      const formality = p.style?.formalityLevel || 5
      if (minFormality !== undefined && formality < minFormality) return false
      if (maxFormality !== undefined && formality > maxFormality) return false
      return true
    })
  }

  // Filter by availability
  filtered = filtered.filter((p) => p.availability?.status !== 'out_of_stock')

  // Categorize filtered products
  const categorized = categorizeEnhancedProducts(filtered)

  // Generate outfits
  const outfits: EnhancedOutfit[] = []
  const usedCombinations = new Set<string>()
  let attempts = 0
  const maxAttempts = count * 3

  while (outfits.length < count && attempts < maxAttempts) {
    const outfit = generateEnhancedOutfit(categorized, {
      occasion,
      gender: targetGender,
      maxPrice,
      formalityLevel: minFormality,
      userProfile,
      thaiOccasion,
    })

    if (outfit) {
      // Create unique signature
      const signature = outfit.products
        .map((p) => p.id)
        .sort()
        .join('-')

      if (!usedCombinations.has(signature)) {
        outfits.push(outfit)
        usedCombinations.add(signature)
      }
    }

    attempts++
  }

  // KB003: Rank outfits by trend status if we have enough
  if (outfits.length > 1) {
    const outfitProducts = outfits.map(o => o.products)
    const ranked = rankByTrendStatus(outfitProducts)

    // Re-order outfits based on trend ranking
    const rankedOutfits: EnhancedOutfit[] = []
    for (const rankedOutfit of ranked.outfits) {
      const matching = outfits.find(o =>
        o.products.map(p => p.id).sort().join('-') ===
        rankedOutfit.products.map(p => p.id).sort().join('-')
      )
      if (matching) rankedOutfits.push(matching)
    }

    return rankedOutfits.length > 0 ? rankedOutfits : outfits
  }

  return outfits
}

/**
 * Generate outfits from user query
 * Enhanced with user preference personalization
 */
export function generateOutfitsFromQuery(
  products: EnhancedProduct[],
  query: string,
  count: number = 5,
  userProfile?: UserProfile | null
): EnhancedOutfit[] {
  const lowerQuery = query.toLowerCase()

  // KB003: Detect Thai cultural occasion first
  const thaiOccasion = detectThaiOccasion(query)
  if (thaiOccasion) {
    console.log(`[EnhancedOutfitGenerator] Detected Thai occasion: ${thaiOccasion}`)
  }

  // Detect occasion
  let occasion: OccasionType | undefined
  if (lowerQuery.includes('work') || lowerQuery.includes('office') || lowerQuery.includes('ทำงาน')) {
    occasion = 'work'
  } else if (lowerQuery.includes('chill') || lowerQuery.includes('weekend') || lowerQuery.includes('ชิลล์')) {
    occasion = 'chill'
  } else if (lowerQuery.includes('wedding') || lowerQuery.includes('แต่งงาน')) {
    occasion = 'wedding'
  } else if (lowerQuery.includes('sport') || lowerQuery.includes('gym') || lowerQuery.includes('ออกกำลัง')) {
    occasion = 'sport'
  } else if (lowerQuery.includes('travel') || lowerQuery.includes('trip') || lowerQuery.includes('ท่องเที่ยว')) {
    occasion = 'travel'
  } else if (lowerQuery.includes('date') || lowerQuery.includes('เดท')) {
    occasion = 'date'
  } else if (lowerQuery.includes('dinner') || lowerQuery.includes('ดินเนอร์')) {
    occasion = 'dinner'
  } else if (lowerQuery.includes('cafe') || lowerQuery.includes('coffee') || lowerQuery.includes('คาเฟ่')) {
    occasion = 'cafe'
  } else if (lowerQuery.includes('party') || lowerQuery.includes('ปาร์ตี้')) {
    occasion = 'party'
  }

  // Detect gender (default to user profile gender if available)
  let gender: Gender | undefined = userProfile?.gender
  if (lowerQuery.includes('women') || lowerQuery.includes('ผู้หญิง')) {
    gender = 'women'
  } else if (lowerQuery.includes('men') || lowerQuery.includes('ผู้ชาย')) {
    gender = 'men'
  }

  // Detect budget
  const budgetMatch = lowerQuery.match(/(\d{1,3}(?:,\d{3})*)\s*(?:baht|บาท|thb)/i)
  const maxPrice = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : undefined

  return generateEnhancedOutfits(products, {
    count,
    occasion,
    gender,
    maxPrice,
    userProfile,
    thaiOccasion: thaiOccasion || undefined,
  })
}
