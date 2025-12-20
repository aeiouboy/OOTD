/**
 * Enhanced Outfit Generator
 * Generates outfit recommendations using EnhancedProduct data model
 * Integrates with occasion mapping and product categorization
 */

import type { EnhancedProduct } from './types/product-types'
import type { OccasionType, Gender, OutfitRole } from './types/enums'
import { mapProductToOccasions } from './categorization/occasion-mapper'
import { getProductName, getProductPrice, getProductImageUrl } from './utils/product-utils'
import { filterByGender, filterByOccasion } from './utils/product-filters'

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
 * Generate a single outfit from categorized products
 */
export function generateEnhancedOutfit(
  categorized: CategorizedEnhancedProducts,
  options: {
    occasion?: OccasionType
    gender?: Gender
    maxPrice?: number
    formalityLevel?: number
  } = {}
): EnhancedOutfit | null {
  const { occasion, gender, maxPrice, formalityLevel } = options
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
  }

  // Need at least 2 products to make an outfit
  if (products.length < 2) {
    return null
  }

  // Calculate total price
  const totalPrice = products.reduce((sum, p) => sum + getProductPrice(p), 0)

  // Check if outfit exceeds max price
  if (maxPrice && totalPrice > maxPrice) {
    return null
  }

  // Calculate average formality
  const avgFormality =
    products.reduce((sum, p) => sum + (p.style?.formalityLevel || 5), 0) / products.length

  // Generate title and description
  const title = generateOutfitTitle(products, occasion)
  const description = generateOutfitDescription(products, occasion, avgFormality)

  return {
    id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
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
  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean)
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
  } = {}
): EnhancedOutfit[] {
  const { count = 5, occasion, gender, maxPrice, minFormality, maxFormality } = options

  // Filter products
  let filtered = [...products]

  // Filter by gender
  if (gender) {
    filtered = filterByGender(filtered, gender)
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
      gender,
      maxPrice,
      formalityLevel: minFormality,
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

  return outfits
}

/**
 * Generate outfits from user query
 */
export function generateOutfitsFromQuery(
  products: EnhancedProduct[],
  query: string,
  count: number = 5
): EnhancedOutfit[] {
  const lowerQuery = query.toLowerCase()

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

  // Detect gender
  let gender: Gender | undefined
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
  })
}
