/**
 * Outfit Generator
 *
 * Generates fashion outfit recommendations from product catalog
 * Enhanced with Pinterest 2026 trending styles and color palettes
 *
 * ## Gender Filtering Strategy
 *
 * For OOTD women's fashion department, strict gender validation ensures
 * only women-appropriate products appear in outfit recommendations:
 *
 * 1. **Primary Check**: Product category must include "women"
 * 2. **Exclusion Check**: Product category must NOT include "men"
 * 3. **Footwear Validation**: Excludes masculine footwear styles:
 *    - Oxford shoes (men's lace-up dress shoes)
 *    - Derby shoes (men's dress style)
 *    - Brogues (wingtip, perforated patterns)
 *    - Wingtip dress shoes
 *
 * 4. **Women's Work Footwear** (Pinterest 2026 Corporate Chic):
 *    - Heels (pumps, stilettos, block heels)
 *    - Women's loafers (pointed-toe, gold hardware)
 *    - Mules (heeled or flat, backless)
 *    - Ballet flats (pointed-toe, rounded)
 *    - Slingback heels
 *    - Women's sneakers (minimal, white leather)
 *
 * @see filterProductsByGender() - Gender filtering implementation
 * @see isWomenFootwear() - Women's footwear validation
 */

import type { Product, Outfit, EnhancedMockProduct, ColorTone } from './types'
import type { AestheticCategory, ColorPalette, FormalityLevel, StyleTag, OutfitRole } from './types/enums'
import type { UserProfile } from './types/user-profile-types'
import {
  applyTrendBasedCombination,
  validateOutfitComposition,
  deduplicateOutfitCategories,
} from './styling/outfit-combination-rules'
import {
  getDominantPalette,
  calculateColorCoordination,
  areColorTonesCompatible,
  areAllColorTonesCompatible,
} from './styling/color-palette-matcher'
import { detectAestheticFromKeywords } from './styling/pinterest-2026-trends'
import {
  getUserPreferenceContext,
  personalizeOutfitTitle,
  type UserPreferenceContext,
} from './utils/user-preference-mapper'
import {
  validateProductVisualConsistency,
  isVisuallyConsistentForWomen,
  getImageGenderCategory,
} from './utils/product-visual-validator'

/**
 * Product category types for outfit composition
 */
export type ProductCategory = 'tops' | 'bottoms' | 'shoes' | 'dresses' | 'accessories' | 'other'

export interface CategorizedProducts {
  tops: Product[]
  bottoms: Product[]
  shoes: Product[]
  dresses: Product[]
  accessories: Product[]
  other: Product[]
}

/**
 * Outfit style templates
 */
export type OutfitStyle = 'business' | 'casual' | 'formal' | 'weekend' | 'date' | 'workout' | 'any'

/**
 * Categorize a product based on its name and sub-category
 */
export function categorizeProduct(product: Product): ProductCategory {
  const name = product.name.toLowerCase()
  const subCategory = (product as any).subCategory?.toLowerCase() || ''
  const combined = `${name} ${subCategory}`

  // Dresses (standalone outfit items for women)
  if (combined.includes('dress') || combined.includes('กระโปรง')) {
    return 'dresses'
  }

  // Tops (shirts, blouses, t-shirts, tops, blazers, jackets)
  if (
    combined.includes('shirt') ||
    combined.includes('blouse') ||
    combined.includes('t-shirt') ||
    combined.includes('tee') ||
    combined.includes('top') ||
    combined.includes('blazer') ||
    combined.includes('jacket') ||
    combined.includes('coat') ||
    combined.includes('sweater') ||
    combined.includes('hoodie') ||
    combined.includes('เสื้อ')
  ) {
    return 'tops'
  }

  // Bottoms (pants, trousers, jeans, shorts, skirts)
  if (
    combined.includes('pants') ||
    combined.includes('trousers') ||
    combined.includes('jeans') ||
    combined.includes('shorts') ||
    combined.includes('skirt') ||
    combined.includes('กางเกง')
  ) {
    return 'bottoms'
  }

  // Shoes (shoes, boots, sneakers, sandals)
  if (
    combined.includes('shoe') ||
    combined.includes('boot') ||
    combined.includes('sneaker') ||
    combined.includes('sandal') ||
    combined.includes('loafer') ||
    combined.includes('heel') ||
    combined.includes('รองเท้า')
  ) {
    return 'shoes'
  }

  // Accessories (bags, belts, watches, sunglasses, jewelry)
  if (
    combined.includes('bag') ||
    combined.includes('belt') ||
    combined.includes('watch') ||
    combined.includes('sunglass') ||
    combined.includes('jewelry') ||
    combined.includes('necklace') ||
    combined.includes('bracelet') ||
    combined.includes('ring') ||
    combined.includes('earring') ||
    combined.includes('scarf') ||
    combined.includes('hat') ||
    combined.includes('กระเป๋า') ||
    combined.includes('เข็มขัด')
  ) {
    return 'accessories'
  }

  return 'other'
}

/**
 * Categorize a list of products into categories
 */
export function categorizeProducts(products: Product[]): CategorizedProducts {
  const categorized: CategorizedProducts = {
    tops: [],
    bottoms: [],
    shoes: [],
    dresses: [],
    accessories: [],
    other: [],
  }

  for (const product of products) {
    const category = categorizeProduct(product)
    categorized[category].push(product)
  }

  return categorized
}

/**
 * Get random item from array
 */
function randomPick<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Get multiple random items from array
 */
function randomPickMultiple<T>(items: T[], count: number): T[] {
  if (items.length === 0) return []
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, items.length))
}

/**
 * Generate outfit title based on products and aesthetic
 */
function generateOutfitTitle(items: Product[], style: OutfitStyle, aesthetic?: AestheticCategory): string {
  // Pinterest 2026 Aesthetic Titles (Thai)
  if (aesthetic) {
    const aestheticTitles: Record<AestheticCategory, string[]> = {
      'clean-girl': ['ลุคสาวคลีนมินิมอล', 'สไตล์เฟรชเกิร์ล', 'ลุคเรียบง่ายแบบนอร์ดิก'],
      'scandinavian-minimal': ['สไตล์สแกนดิเนเวียน', 'ลุคมินิมอลสุดชิค', 'แบบฉบับนอร์ดิก'],
      'street-style': ['ลุคสตรีทสไตล์', 'สไตล์เออร์เบิร์น', 'แฟชั่นข้างถนน', 'ลุคโอเวอร์ไซส์'],
      'casual-chic': ['ลุคแคชชวลชิค', 'สบายแต่ดูดี', 'สไตล์สบายสุดเก๋'],
      'y2k-revival': ['ลุค Y2K รีไววัล', 'สไตล์เรโทร 2000', 'แฟชั่นย้อนยุค'],
      'corporate-chic': ['ลุคออฟฟิศชิค', 'สไตล์ผู้บริหารสมัยใหม่', 'ทำงานแบบมืออาชีพ'],
      'quiet-luxury': ['ลุค Quiet Luxury', 'สไตล์หรูเรียบหรู', 'ความหรูแบบเนื้อๆ'],
      'minimalist-office': ['ออฟฟิศมินิมอล', 'ลุคทำงานเรียบง่าย', 'สไตล์เกิร์ลบอส'],
      'dark-academia': ['ลุค Dark Academia', 'สไตล์วินเทจ สี Brown', 'แฟชั่นสไตล์นักอ่าน'],
    }

    const options = aestheticTitles[aesthetic]
    if (options) {
      return randomPick(options) || 'แฟชั่นนำเทรนด์'
    }
  }

  // Try to create product-based titles
  if (items.length > 0) {
    const brands = Array.from(new Set(items.map(p => p.brand).filter(Boolean)))
    const categories: string[] = []

    items.forEach(item => {
      const category = categorizeProduct(item)
      if (category === 'tops') categories.push('Top')
      if (category === 'bottoms') categories.push('Bottoms')
      if (category === 'dresses') categories.push('Dress')
      if (category === 'shoes') categories.push('Shoes')
    })

    // If we have a recognizable brand, use it
    if (brands.length > 0 && brands[0]) {
      const mainBrand = brands[0]
      if (categories.length > 0) {
        return `${mainBrand} ${categories.slice(0, 2).join(' & ')}`
      }
      return `${mainBrand} Outfit`
    }

    // Otherwise use category combinations
    if (categories.length >= 2) {
      return `${categories[0]} & ${categories[1]} Ensemble`
    }
  }

  // Fallback to style-based titles
  const styleLabels: Record<OutfitStyle, string[]> = {
    business: ['ลุคทำงานมืออาชีพ', 'สไตล์ผู้บริหาร', 'ชุดทำงานพร้อมลุย', 'ลุคสาวออฟฟิศสุดชิค'],
    casual: ['ลุควันสบายๆ', 'สไตล์ชิลๆ', 'ชุดใส่เล่นดูดี', 'แคชชวลสไตล์'],
    formal: ['ลุคออกงานหรู', 'ชุดทางการ', 'สไตล์เรียบหรู', 'สวยสง่าออกงาน'],
    weekend: ['ลุควันหยุดสุดสัปดาห์', 'ชุดเที่ยววันหยุด', 'ชุดไปคาเฟ่', 'วันหยุดสบายๆ'],
    date: ['ชุดออกเดท', 'ลุคดินเนอร์สุดโรแมนติก', 'สวยหวานมัดใจ', 'เดทไนท์ลุค'],
    workout: ['ลุคออกกำลังกาย', 'ชุดฟิตเนส', 'สปอร์ตเกิร์ล', 'แฟชั่นชุดกีฬา'],
    any: ['ลุคสุดคอมพลีท', 'แมทช์มาให้แล้ว', 'แฟชั่นนำเทรนด์', 'ลุคนี้ต้องโดน'],
  }

  const options = styleLabels[style] || styleLabels.any
  return randomPick(options) || 'Fashion Ensemble'
}

/**
 * Generate outfit description based on products and aesthetic
 */
function generateOutfitDescription(items: Product[], style: OutfitStyle, aesthetic?: AestheticCategory, colorPalette?: ColorPalette): string {
  // Pinterest 2026 Aesthetic Descriptions (Thai)
  if (aesthetic) {
    const aestheticDescriptions: Record<AestheticCategory, string[]> = {
      'clean-girl': [
        'ลุคมินิมอลด้วยโทนสีนู้ดและเนื้อผ้าที่นุ่มนวล เรียบง่ายแต่ดูดี',
        'สไตล์สาวคลีนด้วยสีเบจและครีมที่ดูเป็นธรรมชาติ',
        'ลุคเฟรชเกิร์ลที่ใส่สบายและดูมีคลาส',
      ],
      'scandinavian-minimal': [
        'แบบฉบับสแกนดิเนเวียนด้วยสีนู้ดและเส้นสายที่เรียบง่าย',
        'คุณภาพเหนือราคาด้วยผ้าดีและดีไซน์เรียบหรู',
        'มินิมอลสไตล์นอร์ดิกที่ดูหรูและมีระดับ',
      ],
      'street-style': [
        'ลุคสตรีทสไตล์ด้วยเสื้อโอเวอร์ไซส์และกางเกงขากว้าง ดูเท่ไม่ซ้ำใคร',
        'แฟชั่นข้างถนนด้วยการเลเยอร์เสื้อผ้าและรองเท้าสนีกเกอร์',
        'สไตล์เออร์เบิร์นที่ผสมผสานความสบายกับแฟชั่นสุดเท่',
      ],
      'casual-chic': [
        'ดูดีแบบไม่ต้องพยายามด้วยการจับคู่ที่ลงตัว',
        'สบายแต่ยังคงดูมีคลาสและเก๋ไก๋',
        'ลุคแคชชวลที่มีความเป็นตัวของตัวเอง',
      ],
      'y2k-revival': [
        'ย้อนยุคสู่ความหวานและสนุกสนานของยุค 2000',
        'สไตล์เรโทรด้วยรองเท้าแพลตฟอร์มและเสื้อผ้าสีสันสดใส',
        'แฟชั่น Y2K ที่กลับมาเทรนด์อีกครั้ง',
      ],
      'corporate-chic': [
        'ลุคทำงานสมัยใหม่ด้วยเสื้อฟิตและกางเกงขากว้างเอวสูง',
        'มืออาชีพแต่ยังคงแฟชั่นด้วยเสื้อคลุมและกระเป๋าหนัง',
        'สไตล์ออฟฟิศที่ทั้งสมาร์ทและชิค',
      ],
      'quiet-luxury': [
        'ความหรูแบบเนื้อๆ ด้วยผ้าคุณภาพและดีไซน์เรียบหรู',
        'สไตล์หรูที่ไม่ต้องโอ้อวด แต่ดูมีระดับ',
        'ลุคพรีเมียมด้วยเนื้อผ้าคาชเมียร์และโทนสีนู้ด',
      ],
      'minimalist-office': [
        'ออฟฟิศลุคด้วยสีนู้ดและเส้นสายเรียบง่าย',
        'ทำงานแบบมืออาชีพด้วยลุคมินิมอลและทันสมัย',
        'สไตล์เกิร์ลบอสที่เรียบง่ายแต่ดูดี',
      ],
      'dark-academia': [
        'สไตล์วินเทจด้วยโทนสีน้ำตาลและการเลเยอร์เสื้อผ้า',
        'แฟชั่นสไตล์นักอ่านด้วยเสื้อคาร์ดิแกนและกางเกงขายาว',
        'ลุค Dark Academia ที่คลาสสิกและมีเสน่ห์',
      ],
    }

    const options = aestheticDescriptions[aesthetic]
    if (options) {
      return randomPick(options) || 'แฟชั่นตามเทรนด์ Pinterest 2026'
    }
  }

  // Color palette descriptions
  if (colorPalette) {
    const paletteDescriptions: Record<ColorPalette, string> = {
      'neutral-earth-tones': 'การจับคู่สีเอิร์ธโทนที่ดูอบอุ่นและมีสไตล์',
      'monochromatic-beige': 'ชุดโทนสีเบจที่ดูหรูและเรียบหรู',
      'monochromatic-brown': 'โทนสีน้ำตาลที่ให้ความรู้สึกอบอุ่นและคลาสสิก',
      'monochromatic-blue': 'ชุดโทนสีน้ำเงินที่ดูสดชื่นและทันสมัย',
      'monochromatic-black': 'ลุคออลแบล็คที่ดูเท่และมีสไตล์',
      'work-olive-black': 'การผสมผสานสีโอลีฟและดำที่เหมาะกับการทำงาน',
      'work-brown-cream': 'โทนสีน้ำตาลและครีมที่ดูอบอุ่นและเป็นมืออาชีพ',
      'all-black-texture': 'ลุคออลแบล็คด้วยเนื้อผ้าที่หลากหลาย',
    }

    const paletteDesc = paletteDescriptions[colorPalette]
    if (paletteDesc) return paletteDesc
  }

  const styleDescriptions: Record<OutfitStyle, string[]> = {
    business: [
      'เหมาะสำหรับการประชุมสำคัญและการนำเสนองาน',
      'ลุคทำงานที่ดูดีและเป็นมืออาชีพ',
      'สร้างความเชื่อมั่นด้วยลุคผู้บริหารสุดเท่',
    ],
    casual: [
      'ใส่สบายและดูแลดูดีได้ทุกวัน',
      'เท่แบบไม่ต้องพยายามสำหรับวันหยุด',
      'สไตล์ผ่อนคลายที่ยังคงความดูดี',
    ],
    formal: [
      'สวยสง่าและดูแพงสำหรับโอกาสพิเศษ',
      'โดดเด่นสะดุดตาในงานสำคัญ',
      'ความเรียบหรูที่เหนือกาลเวลา',
    ],
    weekend: [
      'เหมาะสำหรับไปเดินช้อปปิ้งหรือทานมื้อเที่ยง',
      'สไตล์สบายๆ สำหรับวันพักผ่อนของคุณ',
      'ชุดวันหยุดที่ดูชิลแต่ยังคงแฟชั่น',
    ],
    date: [
      'โรแมนติกและมีเสน่ห์สำหรับคืนพิเศษ',
      'มั่นใจเกินร้อยในเดทสำคัญของคุณ',
      'ผสมผสานความสวยและดูแพงอย่างลงตัว',
    ],
    workout: [
      'คล่องตัวพร้อมดีไซน์สวยเท่',
      'ใส่สบายตลอดการออกกำลังกาย',
      'แฟชั่นชุดกีฬาที่ใช้งานได้จริง',
    ],
    any: [
      'ชุดสวยที่ใส่ได้หลากหลายโอกาส',
      'การจับคู่ที่ลงตัวในทุกมุมมอง',
      'คอมพลีทลุคของคุณด้วยชุดนี้',
    ],
  }

  const options = styleDescriptions[style] || styleDescriptions.any
  return randomPick(options) || 'A carefully curated outfit combination'
}

/**
 * Apply Pinterest 2026 trend-based outfit combination
 */
function applyTrendBasedOutfit(
  categorized: CategorizedProducts,
  style: OutfitStyle,
  aesthetic?: AestheticCategory,
  colorPalette?: ColorPalette
): Product[] {
  // Convert style to occasion type
  const occasionMap: Record<OutfitStyle, 'work' | 'casual'> = {
    business: 'work',
    casual: 'casual',
    formal: 'casual',
    weekend: 'casual',
    date: 'casual',
    workout: 'casual',
    any: 'casual',
  }

  const occasion = occasionMap[style] || 'casual'

  // Apply trend-based combination rules
  const trendItems = applyTrendBasedCombination(categorized, {
    occasion,
    aesthetic,
    colorPalette,
  })

  return trendItems.length > 0 ? trendItems : []
}

/**
 * Generate a single outfit from categorized products
 * Enhanced with Pinterest 2026 trends support and user preference personalization
 */
export function generateOutfit(
  categorized: CategorizedProducts,
  style: OutfitStyle = 'any',
  gender?: 'men' | 'women',
  options?: {
    aesthetic?: AestheticCategory
    colorPalette?: ColorPalette
    useTrends?: boolean
    userProfile?: UserProfile | null
  }
): Outfit | null {
  const { aesthetic, colorPalette, useTrends = true, userProfile } = options || {}

  // Get user preference context if profile exists
  const userContext: UserPreferenceContext | null = userProfile ? getUserPreferenceContext(userProfile) : null

  // Use user's preferred aesthetics if available, otherwise use provided aesthetic
  let targetAesthetic = aesthetic
  if (userContext && userContext.ageAppropriateAesthetics.length > 0 && !aesthetic) {
    // Use first age-appropriate aesthetic from user preferences
    targetAesthetic = userContext.ageAppropriateAesthetics[0]
  }

  let items: Product[] = []

  // Try Pinterest 2026 trend-based combination first
  if (useTrends && (targetAesthetic || colorPalette || style === 'business' || style === 'casual')) {
    items = applyTrendBasedOutfit(categorized, style, targetAesthetic, colorPalette)

    // Deduplicate categories after trend-based combination
    if (items.length > 0) {
      items = deduplicateOutfitCategories(items, {
        aesthetic,
        colorPalette,
        occasion: style === 'business' ? 'work' : 'casual',
      })
    }
  }

  // Fallback to traditional outfit generation if trend-based didn't work
  if (items.length < 2) {
    // Strategy 1: Women's dress-based outfit
    if (gender === 'women' && categorized.dresses.length > 0) {
      const dress = randomPick(categorized.dresses)
      if (dress) items.push(dress)

      // Add shoes
      const shoes = randomPick(categorized.shoes)
      if (shoes) items.push(shoes)

      // Add accessory
      const accessory = randomPick(categorized.accessories)
      if (accessory) items.push(accessory)
    }
    // Strategy 2: Traditional top + bottom + shoes outfit
    else {
      const top = randomPick(categorized.tops)
      const bottom = randomPick(categorized.bottoms)
      const shoes = randomPick(categorized.shoes)

      if (top) items.push(top)
      if (bottom) items.push(bottom)
      if (shoes) items.push(shoes)

      // Add accessory for variety
      if (Math.random() > 0.5) {
        const accessory = randomPick(categorized.accessories)
        if (accessory) items.push(accessory)
      }
    }

    // Deduplicate categories after fallback strategy
    if (items.length > 0) {
      items = deduplicateOutfitCategories(items, {
        aesthetic,
        colorPalette,
        occasion: style === 'business' ? 'work' : 'casual',
      })
    }
  }

  // Need at least 2 items to make an outfit
  if (items.length < 2) {
    return null
  }

  // Final validation before creating outfit object
  const validationResult = validateOutfitComposition(items)
  if (!validationResult.isValid) {
    console.warn('[OutfitGenerator] Invalid composition detected, applying deduplication:', validationResult.issues)
    items = deduplicateOutfitCategories(items, {
      aesthetic,
      colorPalette,
      occasion: style === 'business' ? 'work' : 'casual',
    })
  }

  const totalPrice = items.reduce((sum, p) => sum + p.price, 0)

  // Detect aesthetic from items if not provided
  const detectedAesthetic = aesthetic || (() => {
    const keywords = items.flatMap(item =>
      `${item.name} ${item.visualDescription || ''}`.toLowerCase().split(/\s+/)
    )
    return detectAestheticFromKeywords(keywords) || undefined
  })()

  // Detect color palette from items if not provided
  const detectedPalette = colorPalette || getDominantPalette(items) || undefined

  // Generate title and personalize with user's name if available
  const baseTitle = generateOutfitTitle(items, style, detectedAesthetic)
  const personalizedTitle = userContext?.userName
    ? personalizeOutfitTitle(baseTitle, userContext.userName)
    : baseTitle

  const outfit: Outfit = {
    id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: personalizedTitle,
    description: generateOutfitDescription(items, style, detectedAesthetic, detectedPalette),
    totalPrice,
    items,
    imageUrl: items[0]?.imageUrl,
    aesthetic: detectedAesthetic,
    colorPalette: detectedPalette,
  }

  // Re-validate to ensure deduplication worked
  const finalValidation = validateOutfitComposition(items)

  console.log('[OutfitGenerator] Generated outfit:', {
    title: outfit.title,
    itemCount: outfit.items.length,
    hasImage: !!outfit.imageUrl,
    aesthetic: outfit.aesthetic,
    colorPalette: outfit.colorPalette,
    colorCoordination: calculateColorCoordination(items),
    validationStatus: finalValidation.isValid ? 'PASSED' : 'FAILED',
  })

  return outfit
}

/**
 * Filter products by gender based on category field with strict validation
 * Enhanced with visual consistency validation to ensure product thumbnails
 * match product descriptions (prevents flat-lay/thumbnail mismatch issue)
 *
 * For women's products:
 * - Category must include "women"
 * - Category must NOT include "men" (unless explicitly "women" is also present)
 * - Product name must NOT include masculine style keywords (oxford shoes, derby, brogue, men's cut)
 * - Product image URL must NOT suggest masculine product (e.g., /oxford/, /derby/ patterns)
 *
 * For men's products:
 * - Category must include "men"
 * - Category must NOT include "women"
 *
 * @param products - Array of products to filter
 * @param gender - Target gender ('men' or 'women')
 * @param options - Additional filtering options
 * @returns Filtered array of products matching the gender criteria
 */
export function filterProductsByGender(
  products: Product[],
  gender: 'men' | 'women',
  options?: { enableVisualValidation?: boolean }
): Product[] {
  const { enableVisualValidation = true } = options || {}
  const masculineFootwearKeywords = ['oxford shoe', 'derby shoe', 'brogue shoe', 'wingtip', "men's dress shoe", "men's oxford", "men's derby"]

  return products.filter((product) => {
    const category = (product as any).category?.toLowerCase() || ''
    const productName = (product.name || '').toLowerCase()

    if (gender === 'men') {
      return category.includes('men') && !category.includes('women')
    } else {
      // For women's products: strict validation
      const hasWomenCategory = category.includes('women')
      const hasMenCategory = category.includes('men') && !category.includes('women')
      const hasMasculineFootwear = masculineFootwearKeywords.some(keyword => productName.includes(keyword))

      // Visual consistency validation - check if product image suggests wrong gender
      let hasVisualMismatch = false
      if (enableVisualValidation) {
        // Check if it's footwear and validate visual consistency
        const isFootwear = categorizeProduct(product) === 'shoes'
        if (isFootwear) {
          const imageGender = getImageGenderCategory(product.imageUrl)
          if (imageGender === 'masculine') {
            hasVisualMismatch = true
            console.debug(`[Gender Filter] Visual mismatch detected for footwear:`, {
              name: product.name,
              imageUrl: product.imageUrl,
              imageGender,
              reason: 'Image URL pattern suggests masculine footwear'
            })
          }
        }

        // Full visual consistency check for any product type
        if (!hasVisualMismatch && !isVisuallyConsistentForWomen(product, { enableLogging: false })) {
          hasVisualMismatch = true
          console.debug(`[Gender Filter] Visual consistency check failed:`, {
            name: product.name,
            reason: 'Product visual elements suggest masculine product'
          })
        }
      }

      const isValid = hasWomenCategory && !hasMenCategory && !hasMasculineFootwear && !hasVisualMismatch

      // Debug logging for filtered items
      if (!isValid && (hasMenCategory || hasMasculineFootwear || hasVisualMismatch)) {
        console.debug(`[Gender Filter] Excluded from women's products:`, {
          name: product.name,
          category: category,
          reason: hasMenCategory ? 'men category' : hasMasculineFootwear ? 'masculine footwear keyword' : 'visual mismatch'
        })
      }

      return isValid
    }
  })
}

/**
 * Check if a product is women's appropriate footwear
 * Enhanced with image URL pattern validation to ensure visual consistency
 *
 * Women's footwear includes:
 * - Heels, pumps, stilettos, block heels
 * - Women's loafers (pointed-toe, tassel, gold hardware)
 * - Mules (heeled or flat, backless)
 * - Ballet flats, pointed-toe flats
 * - Slingback heels
 * - Women's sneakers, sandals
 *
 * Excludes masculine footwear:
 * - Oxford shoes, derby shoes, brogues
 * - Wingtips, men's dress shoes
 * - Products with masculine image URL patterns
 *
 * @param product - Product to check
 * @param options - Additional validation options
 * @returns true if the product is women's appropriate footwear
 */
export function isWomenFootwear(
  product: Product,
  options?: { enableVisualValidation?: boolean }
): boolean {
  const { enableVisualValidation = true } = options || {}

  const productName = (product.name || '').toLowerCase()
  const description = (product.visualDescription || '').toLowerCase()
  const combined = `${productName} ${description}`

  // Women's footwear keywords
  const womensFootwear = [
    'heel', 'pump', 'stiletto', 'block heel',
    'women\'s loafer', 'women loafer', 'pointed-toe loafer',
    'mule', 'slingback',
    'ballet flat', 'pointed-toe flat', 'rounded flat',
    'women\'s sneaker', 'women sneaker',
    'sandal', 'women\'s sandal',
    'boot', 'ankle boot', 'knee boot' // women's boots
  ]

  // Masculine footwear keywords (to exclude)
  const masculineFootwear = [
    'oxford shoe', 'derby shoe', 'brogue',
    'wingtip', 'men\'s dress shoe',
    'men\'s oxford', 'men\'s derby',
    'men\'s loafer', 'men loafer' // unless specifically women's
  ]

  // Check if it's masculine footwear (should be excluded)
  const isMasculineText = masculineFootwear.some(keyword => combined.includes(keyword))
  if (isMasculineText) {
    console.debug(`[Footwear Filter] Excluded masculine footwear (text):`, productName)
    return false
  }

  // Check image URL patterns for visual consistency
  if (enableVisualValidation) {
    const imageGender = getImageGenderCategory(product.imageUrl)
    if (imageGender === 'masculine') {
      console.debug(`[Footwear Filter] Excluded footwear due to masculine image URL pattern:`, {
        name: productName,
        imageUrl: product.imageUrl,
        imageGender,
      })
      return false
    }

    // Full visual validation
    const validation = validateProductVisualConsistency(product, { enableLogging: false })
    if (!validation.isConsistent && validation.imageGender === 'masculine') {
      console.debug(`[Footwear Filter] Excluded footwear due to visual mismatch:`, {
        name: productName,
        issues: validation.issues,
      })
      return false
    }
  }

  // Check if it's women's footwear
  const isWomens = womensFootwear.some(keyword => combined.includes(keyword))

  return isWomens
}

/**
 * Generate multiple outfits from product catalog
 * Enhanced with user preference personalization
 */
export function generateOutfits(
  products: Product[],
  options: {
    count?: number
    style?: OutfitStyle
    gender?: 'men' | 'women'
    priceRange?: { min: number; max: number }
    userProfile?: UserProfile | null
  } = {}
): Outfit[] {
  const { count = 5, style = 'any', gender, priceRange, userProfile } = options

  // Get user preference context if profile exists
  const userContext = userProfile ? getUserPreferenceContext(userProfile) : null

  // Use gender from user profile if available, otherwise use provided gender
  const targetGender = userProfile?.gender || gender

  // Filter by gender if specified
  let filteredProducts = targetGender ? filterProductsByGender(products, targetGender) : products

  // Filter by price range if specified
  if (priceRange) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max
    )
  }

  // Filter out out-of-stock products
  filteredProducts = filteredProducts.filter((p) => p.availability !== 'out_of_stock')

  // Filter out products with placeholder images (they show as empty in outfit detail)
  filteredProducts = filteredProducts.filter((p) => {
    const imageUrl = p.imageUrl || ''
    const hasPlaceholder = imageUrl.includes('placeholder') ||
                           imageUrl === '' ||
                           imageUrl.includes('?text=') ||
                           !imageUrl.startsWith('/')
    if (hasPlaceholder && imageUrl !== '') {
      console.debug(`[OutfitGenerator] Excluding product with placeholder image: ${p.name} (${imageUrl})`)
    }
    return !hasPlaceholder || imageUrl === ''  // Allow products without imageUrl (will use flat-lay)
  })

  // Filter by style/occasion if products have tags
  if (style && style !== 'any') {
    const targetOccasion = style === 'business' ? 'work' : style;
    // Only filter if the product HAS an occasion tag. If not, assume it's versatile (mock Central products usually versatile).
    // Actually, for better accuracy, let's filter those that DO have tags.
    // SFERA items have tags. Central mocks don't.
    // If I enforce strict filtering, Central items (without tags) might disappear if they are not compatible?
    // Let's check matching.
    filteredProducts = filteredProducts.filter(p => {
      if (!p.occasion || p.occasion.length === 0) return true; // Keep products without tags (generic)
      return p.occasion.some(occ => occ === targetOccasion || occ === style);
    });
  }

  const categorized = categorizeProducts(filteredProducts)
  const outfits: Outfit[] = []
  const usedCombinations = new Set<string>() // Track used product combinations

  // Try to generate requested number of outfits
  let attempts = 0
  const maxAttempts = count * 5 // Increased attempts to find uniques

  const usedPrimarySkus = new Set<string>()

  while (outfits.length < count && attempts < maxAttempts) {
    // Pass user profile to outfit generation with preferred aesthetics
    const aestheticOption = userContext?.ageAppropriateAesthetics[0]
    const outfit = generateOutfit(categorized, style, targetGender, {
      aesthetic: aestheticOption,
      userProfile,
    })
    if (outfit && outfit.items.length > 0) {
      // Create a unique signature for this outfit based on product SKUs
      const signature = outfit.items.map(p => p.sku).sort().join('-')
      const primarySku = outfit.items[0].sku // Assume first item is primary (Top/Dress)

      // Check if we've already used this combination OR this primary item
      if (!usedCombinations.has(signature) && !usedPrimarySkus.has(primarySku)) {
        // Check if outfit fits price range
        if (!priceRange || (outfit.totalPrice >= priceRange.min && outfit.totalPrice <= priceRange.max)) {
          outfits.push(outfit)
          usedCombinations.add(signature)
          usedPrimarySkus.add(primarySku)
        }
      }
    }
    attempts++
  }

  return outfits
}

/**
 * Generate men's outfits
 */
export function generateMensOutfits(products: Product[], count: number = 5, style?: OutfitStyle): Outfit[] {
  return generateOutfits(products, { count, style, gender: 'men' })
}

/**
 * Generate women's outfits
 */
export function generateWomensOutfits(products: Product[], count: number = 5, style?: OutfitStyle): Outfit[] {
  return generateOutfits(products, { count, style, gender: 'women' })
}

/**
 * Generate outfit based on query context
 * Enhanced with user preference personalization
 */
export function generateOutfitsFromQuery(
  products: Product[],
  query: string,
  userProfile?: UserProfile | null
): Outfit[] {
  const lowerQuery = query.toLowerCase()

  // Determine gender from query (Default to Women for OOTDay or use user profile)
  let gender: 'men' | 'women' | undefined = userProfile?.gender || 'women'
  if (lowerQuery.includes('men') && !lowerQuery.includes('women')) {
    gender = 'men'
  } else if (lowerQuery.includes('women') || lowerQuery.includes('woman')) {
    gender = 'women'
  }

  // Determine style from query
  let style: OutfitStyle = 'any'
  if (lowerQuery.includes('business') || lowerQuery.includes('work') || lowerQuery.includes('office') || lowerQuery.includes('ทำงาน') || lowerQuery.includes('ประชุม')) {
    style = 'business'
  } else if (lowerQuery.includes('casual') || lowerQuery.includes('everyday') || lowerQuery.includes('relax') || lowerQuery.includes('เที่ยว') || lowerQuery.includes('สบาย') || lowerQuery.includes('ชิล')) {
    style = 'casual'
  } else if (lowerQuery.includes('party') || lowerQuery.includes('formal') || lowerQuery.includes('event') || lowerQuery.includes('งานแต่ง') || lowerQuery.includes('ราตรี')) {
    style = 'formal'
  } else if (lowerQuery.includes('weekend') || lowerQuery.includes('saturday') || lowerQuery.includes('sunday') || lowerQuery.includes('brunch')) {
    style = 'weekend'
  } else if (lowerQuery.includes('date') || lowerQuery.includes('dinner') || lowerQuery.includes('romantic') || lowerQuery.includes('เดท') || lowerQuery.includes('แฟน') || lowerQuery.includes('กินข้าว') || lowerQuery.includes('ทานข้าว') || lowerQuery.includes('ดินเนอร์') || lowerQuery.includes('ร้านอาหาร')) {
    style = 'date'
  } else if (lowerQuery.includes('workout') || lowerQuery.includes('gym') || lowerQuery.includes('sport') || lowerQuery.includes('active') || lowerQuery.includes('ออกกำลังกาย')) {
    style = 'workout'
  }

  return generateOutfits(products, { count: 5, style, gender, userProfile })
}

// ============================================================================
// Enhanced Outfit Generation (using EnhancedMockProduct attributes)
// ============================================================================

/**
 * Formality level tolerance for outfit matching
 * Items within ±2 formality levels are considered compatible
 */
export const FORMALITY_TOLERANCE = 2

/**
 * Enhanced outfit context for scoring products
 */
export interface EnhancedOutfitContext {
  targetAesthetic?: AestheticCategory
  targetFormality?: FormalityLevel
  colorTone?: ColorTone
  existingStyleTags?: StyleTag[]
  existingPairingCategories?: string[]
}

/**
 * Options for generating enhanced outfits
 */
export interface EnhancedOutfitOptions {
  count?: number
  style?: OutfitStyle
  gender?: 'men' | 'women'
  priceRange?: { min: number; max: number }
  targetFormality?: FormalityLevel
  targetAesthetic?: AestheticCategory
  colorTonePreference?: ColorTone
}

/**
 * Enhanced validation result with detailed issues
 */
export interface EnhancedValidationResult {
  isValid: boolean
  score: number
  issues: string[]
  colorToneCompatibility: boolean
  formalityCompatibility: boolean
  styleTagOverlap: number
  pairingCompatibility: boolean
}

/**
 * Categorized enhanced products by outfit role
 */
export interface CategorizedEnhancedProducts {
  tops: EnhancedMockProduct[]
  bottoms: EnhancedMockProduct[]
  dresses: EnhancedMockProduct[]
  outerwear: EnhancedMockProduct[]
  footwear: EnhancedMockProduct[]
  accessories: EnhancedMockProduct[]
}

// ============================================================================
// Formality Level Matching Utilities
// ============================================================================

/**
 * Check if two formality levels are compatible
 * Returns true if the difference is within FORMALITY_TOLERANCE
 *
 * @param level1 - First formality level (1-10)
 * @param level2 - Second formality level (1-10)
 * @returns true if levels are compatible
 */
export function isFormalityCompatible(level1: FormalityLevel, level2: FormalityLevel): boolean {
  return Math.abs(level1 - level2) <= FORMALITY_TOLERANCE
}

/**
 * Calculate the average formality level of a set of enhanced products
 *
 * @param items - Array of enhanced mock products
 * @returns Average formality level
 */
export function calculateAverageFormalityLevel(items: EnhancedMockProduct[]): number {
  if (items.length === 0) return 5 // Default to middle value

  const sum = items.reduce((acc, item) => acc + item.formalityLevel, 0)
  return sum / items.length
}

/**
 * Check if all items have consistent formality levels
 * Returns true if all pairs are within FORMALITY_TOLERANCE
 *
 * @param items - Array of enhanced mock products
 * @returns true if formality levels are consistent
 */
export function areAllFormalityLevelsConsistent(items: EnhancedMockProduct[]): boolean {
  if (items.length < 2) return true

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (!isFormalityCompatible(items[i].formalityLevel, items[j].formalityLevel)) {
        return false
      }
    }
  }

  return true
}

// ============================================================================
// Pairing Category Validation
// ============================================================================

/**
 * Validate if two products are compatible based on pairingCategories
 * Uses case-insensitive matching and supports partial matches
 *
 * @param product1 - First enhanced mock product
 * @param product2 - Second enhanced mock product
 * @returns true if products are compatible for pairing
 */
export function validatePairingCompatibility(
  product1: EnhancedMockProduct,
  product2: EnhancedMockProduct
): boolean {
  const normalizeString = (str: string) => str.toLowerCase().trim()

  // Get normalized pairing categories and product identifiers
  const pairing1 = product1.pairingCategories.map(normalizeString)
  const pairing2 = product2.pairingCategories.map(normalizeString)

  const subCat1 = normalizeString(product1.subCategory || '')
  const subCat2 = normalizeString(product2.subCategory || '')
  const role1 = normalizeString(product1.outfitRole)
  const role2 = normalizeString(product2.outfitRole)
  const name1 = normalizeString(product1.name)
  const name2 = normalizeString(product2.name)

  // Check if product1's pairingCategories include product2's subCategory, role, or name
  const product1AcceptsProduct2 = pairing1.some(cat =>
    subCat2.includes(cat) ||
    cat.includes(subCat2) ||
    role2.includes(cat) ||
    cat.includes(role2) ||
    name2.includes(cat)
  )

  // Check if product2's pairingCategories include product1's subCategory, role, or name
  const product2AcceptsProduct1 = pairing2.some(cat =>
    subCat1.includes(cat) ||
    cat.includes(subCat1) ||
    role1.includes(cat) ||
    cat.includes(role1) ||
    name1.includes(cat)
  )

  // Compatible if either direction matches
  return product1AcceptsProduct2 || product2AcceptsProduct1
}

/**
 * Find all products that are compatible with a given product based on pairing categories
 *
 * @param product - The reference product
 * @param candidates - Array of candidate products to filter
 * @returns Array of compatible products
 */
export function findCompatiblePairings(
  product: EnhancedMockProduct,
  candidates: EnhancedMockProduct[]
): EnhancedMockProduct[] {
  return candidates.filter(candidate => {
    // Don't pair with self
    if (candidate.sku === product.sku) return false

    return validatePairingCompatibility(product, candidate)
  })
}

// ============================================================================
// Style Tag Matching Utilities
// ============================================================================

/**
 * Calculate the percentage of overlapping style tags between two arrays
 *
 * @param tags1 - First array of style tags
 * @param tags2 - Second array of style tags
 * @returns Overlap percentage (0 to 1)
 */
export function calculateStyleOverlap(tags1: StyleTag[], tags2: StyleTag[]): number {
  if (tags1.length === 0 || tags2.length === 0) return 0

  const set1 = new Set(tags1)
  const overlapping = tags2.filter(tag => set1.has(tag))

  // Calculate as percentage of the smaller set
  const minSize = Math.min(tags1.length, tags2.length)
  return overlapping.length / minSize
}

/**
 * Check if at least one style tag is shared across all items
 *
 * @param items - Array of enhanced mock products
 * @returns true if at least one tag is common to all items
 */
export function hasCommonStyleTag(items: EnhancedMockProduct[]): boolean {
  if (items.length < 2) return true

  // Get all tags from first item
  const firstItemTags = items[0].styleTags

  // Check if any tag is present in all other items
  for (const tag of firstItemTags) {
    let isCommon = true
    for (let i = 1; i < items.length; i++) {
      if (!items[i].styleTags.includes(tag)) {
        isCommon = false
        break
      }
    }
    if (isCommon) return true
  }

  return false
}

/**
 * Get all unique style tags from a set of products
 *
 * @param items - Array of enhanced mock products
 * @returns Array of unique style tags
 */
export function getUniqueStyleTags(items: EnhancedMockProduct[]): StyleTag[] {
  const tags = new Set<StyleTag>()
  items.forEach(item => item.styleTags.forEach(tag => tags.add(tag)))
  return Array.from(tags)
}

// ============================================================================
// Enhanced Product Scoring Function
// ============================================================================

/**
 * Score an enhanced product for outfit inclusion based on context
 *
 * Scoring weights:
 * - Aesthetic match: 25%
 * - Formality match: 25%
 * - Color tone match: 20%
 * - Style tag overlap: 15%
 * - Pairing compatibility: 15%
 *
 * @param product - The product to score
 * @param context - The outfit context for scoring
 * @param existingItems - Already selected items (for pairing validation)
 * @returns Score from 0 to 100
 */
export function scoreEnhancedProductForOutfit(
  product: EnhancedMockProduct,
  context: EnhancedOutfitContext,
  existingItems: EnhancedMockProduct[] = []
): number {
  let score = 0

  // Aesthetic match: 25%
  if (context.targetAesthetic) {
    if (product.aesthetic === context.targetAesthetic) {
      score += 25
    } else {
      // Partial points for related aesthetics
      const relatedAesthetics: Record<AestheticCategory, AestheticCategory[]> = {
        'clean-girl': ['scandinavian-minimal', 'minimalist-office'],
        'scandinavian-minimal': ['clean-girl', 'minimalist-office', 'quiet-luxury'],
        'street-style': ['casual-chic', 'y2k-revival'],
        'casual-chic': ['street-style', 'clean-girl'],
        'y2k-revival': ['street-style'],
        'corporate-chic': ['quiet-luxury', 'minimalist-office'],
        'quiet-luxury': ['corporate-chic', 'scandinavian-minimal'],
        'minimalist-office': ['corporate-chic', 'clean-girl', 'scandinavian-minimal'],
        'dark-academia': ['quiet-luxury'],
      }

      const related = relatedAesthetics[context.targetAesthetic] || []
      if (related.includes(product.aesthetic)) {
        score += 15 // Partial credit for related aesthetic
      }
    }
  } else {
    score += 12.5 // Half credit if no target aesthetic specified
  }

  // Formality match: 25%
  if (context.targetFormality) {
    const diff = Math.abs(product.formalityLevel - context.targetFormality)
    if (diff === 0) {
      score += 25
    } else if (diff <= FORMALITY_TOLERANCE) {
      score += 25 - (diff * 5) // Graduated scoring
    }
  } else {
    score += 12.5 // Half credit if no target formality
  }

  // Color tone match: 20%
  if (context.colorTone) {
    if (areColorTonesCompatible(product.colorTone, context.colorTone)) {
      score += 20
    }
  } else {
    score += 10 // Half credit if no color tone preference
  }

  // Style tag overlap: 15%
  if (context.existingStyleTags && context.existingStyleTags.length > 0) {
    const overlap = calculateStyleOverlap(product.styleTags, context.existingStyleTags)
    score += overlap * 15
  } else {
    score += 7.5 // Half credit if no existing style tags
  }

  // Pairing compatibility: 15%
  // Check against existingPairingCategories from context (if provided)
  // or validate against existing items
  if (context.existingPairingCategories && context.existingPairingCategories.length > 0) {
    // Check if product's pairingCategories match any existingPairingCategories
    const normalizedProductCategories = product.pairingCategories.map(c => c.toLowerCase().trim())
    const normalizedExistingCategories = context.existingPairingCategories.map(c => c.toLowerCase().trim())

    const hasMatch = normalizedProductCategories.some(pc =>
      normalizedExistingCategories.some(ec =>
        pc.includes(ec) || ec.includes(pc)
      )
    )
    score += hasMatch ? 15 : 0
  } else if (existingItems.length > 0) {
    const compatibleCount = existingItems.filter(item =>
      validatePairingCompatibility(product, item)
    ).length
    const compatibilityRatio = compatibleCount / existingItems.length
    score += compatibilityRatio * 15
  } else {
    score += 7.5 // Half credit if no existing items or categories
  }

  return score
}

// ============================================================================
// Categorize Enhanced Products
// ============================================================================

/**
 * Categorize enhanced products by their outfit role
 *
 * @param products - Array of enhanced mock products
 * @returns Categorized products by role
 */
export function categorizeEnhancedProducts(
  products: EnhancedMockProduct[]
): CategorizedEnhancedProducts {
  const categorized: CategorizedEnhancedProducts = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    footwear: [],
    accessories: [],
  }

  for (const product of products) {
    switch (product.outfitRole) {
      case 'top':
        categorized.tops.push(product)
        break
      case 'bottom':
        categorized.bottoms.push(product)
        break
      case 'dress':
        categorized.dresses.push(product)
        break
      case 'outerwear':
        categorized.outerwear.push(product)
        break
      case 'footwear':
        categorized.footwear.push(product)
        break
      case 'accessory':
      case 'bag':
        categorized.accessories.push(product)
        break
      default:
        // Use text-based categorization as fallback
        const category = categorizeProduct(product)
        if (category === 'tops') categorized.tops.push(product)
        else if (category === 'bottoms') categorized.bottoms.push(product)
        else if (category === 'dresses') categorized.dresses.push(product)
        else if (category === 'shoes') categorized.footwear.push(product)
        else if (category === 'accessories') categorized.accessories.push(product)
    }
  }

  return categorized
}

// ============================================================================
// Enhanced Outfit Validation
// ============================================================================

/**
 * Validate an enhanced outfit composition
 * Checks color tone compatibility, formality consistency, style tag overlap,
 * pairing validity, and outfit role duplication
 *
 * @param items - Array of enhanced mock products in the outfit
 * @returns Detailed validation result
 */
export function validateEnhancedOutfit(
  items: EnhancedMockProduct[]
): EnhancedValidationResult {
  const issues: string[] = []

  // Check color tone compatibility
  const colorToneCompatibility = areAllColorTonesCompatible(items)
  if (!colorToneCompatibility) {
    const tones = items.map(i => `${i.name}: ${i.colorTone}`)
    issues.push(`Incompatible color tones: ${tones.join(', ')}`)
  }

  // Check formality consistency
  const formalityCompatibility = areAllFormalityLevelsConsistent(items)
  if (!formalityCompatibility) {
    const levels = items.map(i => `${i.name}: ${i.formalityLevel}`)
    issues.push(`Inconsistent formality levels (tolerance: ±${FORMALITY_TOLERANCE}): ${levels.join(', ')}`)
  }

  // Calculate style tag overlap as a numeric value
  let styleTagOverlap = 0
  if (items.length >= 2) {
    // Calculate average pairwise overlap
    let totalOverlap = 0
    let pairCount = 0
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        totalOverlap += calculateStyleOverlap(items[i].styleTags, items[j].styleTags)
        pairCount++
      }
    }
    styleTagOverlap = pairCount > 0 ? totalOverlap / pairCount : 0
  } else if (items.length === 1) {
    styleTagOverlap = 1 // Single item has perfect self-overlap
  }

  // Check if at least one tag is common
  const hasCommonTag = hasCommonStyleTag(items)
  if (!hasCommonTag && items.length >= 2) {
    issues.push('No common style tag across all items')
  }

  // Check pairing validity
  let pairingCompatibility = true
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (!validatePairingCompatibility(items[i], items[j])) {
        pairingCompatibility = false
        issues.push(`Pairing incompatibility: ${items[i].name} <-> ${items[j].name}`)
      }
    }
  }

  // Check for duplicate outfit roles (except accessories)
  const roleCounts = new Map<OutfitRole, number>()
  for (const item of items) {
    const count = roleCounts.get(item.outfitRole) || 0
    roleCounts.set(item.outfitRole, count + 1)
  }

  Array.from(roleCounts.entries()).forEach(([role, count]) => {
    if (role !== 'accessory' && role !== 'bag' && count > 1) {
      issues.push(`Duplicate outfit role: ${role} (${count} items)`)
    }
  })

  // Calculate overall score based on passing checks (0-100 scale)
  let score = 0
  if (colorToneCompatibility) score += 25
  if (formalityCompatibility) score += 25
  score += styleTagOverlap * 25 // 0-25 based on overlap percentage
  if (pairingCompatibility) score += 25

  return {
    isValid: issues.length === 0,
    score,
    issues,
    colorToneCompatibility,
    formalityCompatibility,
    styleTagOverlap,
    pairingCompatibility,
  }
}

// ============================================================================
// Generate Enhanced Outfits
// ============================================================================

/**
 * Generate outfits from enhanced mock products using fashion attributes
 *
 * Uses the 14 fashion attributes (styleTags, formalityLevel, colorTone,
 * pairingCategories, aesthetic, outfitRole, etc.) for smarter outfit matching.
 *
 * @param products - Array of enhanced mock products
 * @param options - Generation options
 * @returns Array of validated outfits
 */
export function generateEnhancedOutfits(
  products: EnhancedMockProduct[],
  options: EnhancedOutfitOptions = {}
): Outfit[] {
  const {
    count = 5,
    style = 'any',
    gender,
    priceRange,
    targetFormality,
    targetAesthetic,
    colorTonePreference,
  } = options

  // Filter products by gender if specified
  let filteredProducts = products
  if (gender) {
    filteredProducts = filteredProducts.filter(p => {
      const category = p.category?.toLowerCase() || ''
      if (gender === 'women') {
        return category.includes('women') && !category.includes('men')
      } else {
        return category.includes('men') && !category.includes('women')
      }
    })
  }

  // Filter by availability
  filteredProducts = filteredProducts.filter(p => p.availability !== 'out_of_stock')

  // Categorize products by outfit role
  const categorized = categorizeEnhancedProducts(filteredProducts)

  const outfits: Outfit[] = []
  const usedCombinations = new Set<string>()

  let attempts = 0
  const maxAttempts = count * 10

  while (outfits.length < count && attempts < maxAttempts) {
    attempts++

    // Build outfit context for scoring
    const context: EnhancedOutfitContext = {
      targetAesthetic,
      targetFormality,
      colorTone: colorTonePreference,
      existingStyleTags: [],
    }

    const outfitItems: EnhancedMockProduct[] = []

    // Strategy 1: Dress-based outfit (for women)
    if (gender === 'women' && categorized.dresses.length > 0 && Math.random() > 0.5) {
      // Score and select best dress
      const scoredDresses = categorized.dresses.map(dress => ({
        product: dress,
        score: scoreEnhancedProductForOutfit(dress, context, outfitItems),
      }))
      scoredDresses.sort((a, b) => b.score - a.score)

      const selectedDress = scoredDresses[Math.floor(Math.random() * Math.min(3, scoredDresses.length))].product
      outfitItems.push(selectedDress)

      // Update context with dress's style tags
      context.existingStyleTags = [...selectedDress.styleTags]
      context.colorTone = context.colorTone || selectedDress.colorTone

      // Find compatible footwear
      const compatibleFootwear = findCompatiblePairings(selectedDress, categorized.footwear)
        .filter(f => isFormalityCompatible(selectedDress.formalityLevel, f.formalityLevel))
        .filter(f => areColorTonesCompatible(selectedDress.colorTone, f.colorTone))

      if (compatibleFootwear.length > 0) {
        const scoredFootwear = compatibleFootwear.map(f => ({
          product: f,
          score: scoreEnhancedProductForOutfit(f, context, outfitItems),
        }))
        scoredFootwear.sort((a, b) => b.score - a.score)
        outfitItems.push(scoredFootwear[0].product)
      } else if (categorized.footwear.length > 0) {
        // Fallback to any footwear
        outfitItems.push(categorized.footwear[Math.floor(Math.random() * categorized.footwear.length)])
      }

      // Add accessory if available
      if (categorized.accessories.length > 0 && outfitItems.length < 4) {
        const compatibleAccessories = categorized.accessories
          .filter(a => areColorTonesCompatible(selectedDress.colorTone, a.colorTone))

        if (compatibleAccessories.length > 0) {
          const scoredAccessories = compatibleAccessories.map(a => ({
            product: a,
            score: scoreEnhancedProductForOutfit(a, context, outfitItems),
          }))
          scoredAccessories.sort((a, b) => b.score - a.score)
          outfitItems.push(scoredAccessories[0].product)
        }
      }
    }
    // Strategy 2: Top + Bottom outfit
    else if (categorized.tops.length > 0 && categorized.bottoms.length > 0) {
      // Score and select best top
      const scoredTops = categorized.tops.map(top => ({
        product: top,
        score: scoreEnhancedProductForOutfit(top, context, outfitItems),
      }))
      scoredTops.sort((a, b) => b.score - a.score)

      const selectedTop = scoredTops[Math.floor(Math.random() * Math.min(3, scoredTops.length))].product
      outfitItems.push(selectedTop)

      // Update context
      context.existingStyleTags = [...selectedTop.styleTags]
      context.colorTone = context.colorTone || selectedTop.colorTone

      // Find compatible bottoms using pairingCategories
      const compatibleBottoms = findCompatiblePairings(selectedTop, categorized.bottoms)
        .filter(b => isFormalityCompatible(selectedTop.formalityLevel, b.formalityLevel))
        .filter(b => areColorTonesCompatible(selectedTop.colorTone, b.colorTone))

      if (compatibleBottoms.length > 0) {
        const scoredBottoms = compatibleBottoms.map(b => ({
          product: b,
          score: scoreEnhancedProductForOutfit(b, context, outfitItems),
        }))
        scoredBottoms.sort((a, b) => b.score - a.score)
        outfitItems.push(scoredBottoms[0].product)
      } else if (categorized.bottoms.length > 0) {
        // Fallback: pick bottom with closest formality
        const sortedByFormality = [...categorized.bottoms].sort((a, b) =>
          Math.abs(a.formalityLevel - selectedTop.formalityLevel) -
          Math.abs(b.formalityLevel - selectedTop.formalityLevel)
        )
        outfitItems.push(sortedByFormality[0])
      }

      // Find compatible footwear
      if (outfitItems.length >= 2 && categorized.footwear.length > 0) {
        const avgFormality = calculateAverageFormalityLevel(outfitItems)
        const roundedFormality = Math.round(avgFormality) as FormalityLevel

        const compatibleFootwear = categorized.footwear
          .filter(f => isFormalityCompatible(roundedFormality, f.formalityLevel))
          .filter(f => areColorTonesCompatible(context.colorTone || 'neutral', f.colorTone))

        if (compatibleFootwear.length > 0) {
          const scoredFootwear = compatibleFootwear.map(f => ({
            product: f,
            score: scoreEnhancedProductForOutfit(f, context, outfitItems),
          }))
          scoredFootwear.sort((a, b) => b.score - a.score)
          outfitItems.push(scoredFootwear[0].product)
        } else {
          outfitItems.push(categorized.footwear[Math.floor(Math.random() * categorized.footwear.length)])
        }
      }

      // Add outerwear if formality is high (6+)
      if (categorized.outerwear.length > 0) {
        const avgFormality = calculateAverageFormalityLevel(outfitItems)
        if (avgFormality >= 6) {
          const compatibleOuterwear = categorized.outerwear
            .filter(o => isFormalityCompatible(Math.round(avgFormality) as FormalityLevel, o.formalityLevel))
            .filter(o => areColorTonesCompatible(context.colorTone || 'neutral', o.colorTone))

          if (compatibleOuterwear.length > 0) {
            const scoredOuterwear = compatibleOuterwear.map(o => ({
              product: o,
              score: scoreEnhancedProductForOutfit(o, context, outfitItems),
            }))
            scoredOuterwear.sort((a, b) => b.score - a.score)
            outfitItems.push(scoredOuterwear[0].product)
          }
        }
      }

      // Add accessory if slot available and items < 5
      if (categorized.accessories.length > 0 && outfitItems.length < 5) {
        const compatibleAccessories = categorized.accessories
          .filter(a => areColorTonesCompatible(context.colorTone || 'neutral', a.colorTone))

        if (compatibleAccessories.length > 0) {
          const scoredAccessories = compatibleAccessories.map(a => ({
            product: a,
            score: scoreEnhancedProductForOutfit(a, context, outfitItems),
          }))
          scoredAccessories.sort((a, b) => b.score - a.score)
          outfitItems.push(scoredAccessories[0].product)
        }
      }
    }

    // Validate outfit has minimum items
    if (outfitItems.length < 2) {
      continue
    }

    // Validate outfit composition
    const validation = validateEnhancedOutfit(outfitItems)

    // Create signature to prevent duplicates
    const signature = outfitItems.map(p => p.sku).sort().join('-')
    if (usedCombinations.has(signature)) {
      continue
    }

    // Check price range if specified
    const totalPrice = outfitItems.reduce((sum, p) => sum + p.price, 0)
    if (priceRange && (totalPrice < priceRange.min || totalPrice > priceRange.max)) {
      continue
    }

    // Log validation for debugging
    if (!validation.isValid) {
      console.debug('[EnhancedOutfitGenerator] Validation issues:', validation.issues)
    }

    // Determine aesthetic and palette
    const outfitAesthetic = targetAesthetic || outfitItems[0]?.aesthetic
    const outfitPalette = outfitItems[0]?.colorPalette || getDominantPalette(outfitItems)

    // Create outfit object
    const outfit: Outfit = {
      id: `enhanced-outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: generateOutfitTitle(outfitItems, style, outfitAesthetic),
      description: generateOutfitDescription(outfitItems, style, outfitAesthetic, outfitPalette),
      totalPrice,
      items: outfitItems,
      imageUrl: outfitItems[0]?.imageUrl,
      aesthetic: outfitAesthetic,
      colorPalette: outfitPalette,
    }

    outfits.push(outfit)
    usedCombinations.add(signature)

    console.log('[EnhancedOutfitGenerator] Generated outfit:', {
      title: outfit.title,
      itemCount: outfitItems.length,
      avgFormality: calculateAverageFormalityLevel(outfitItems).toFixed(1),
      colorTones: outfitItems.map(i => i.colorTone),
      validation: validation.isValid ? 'PASSED' : `ISSUES: ${validation.issues.length}`,
    })
  }

  return outfits
}
