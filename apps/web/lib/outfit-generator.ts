/**
 * Outfit Generator
 *
 * Generates fashion outfit recommendations from product catalog
 */

import type { Product, Outfit } from './types'

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
 * Generate outfit title based on products
 */
function generateOutfitTitle(items: Product[], style: OutfitStyle): string {
  // Try to create product-based titles
  if (items.length > 0) {
    const brands = [...new Set(items.map(p => p.brand).filter(Boolean))]
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
 * Generate outfit description based on products
 */
function generateOutfitDescription(items: Product[], style: OutfitStyle): string {
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
 * Generate a single outfit from categorized products
 */
export function generateOutfit(
  categorized: CategorizedProducts,
  style: OutfitStyle = 'any',
  gender?: 'men' | 'women'
): Outfit | null {
  const items: Product[] = []

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

  // Need at least 2 items to make an outfit
  if (items.length < 2) {
    return null
  }

  const totalPrice = items.reduce((sum, p) => sum + p.price, 0)

  const outfit = {
    id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: generateOutfitTitle(items, style),
    description: generateOutfitDescription(items, style),
    totalPrice,
    items,
    imageUrl: items[0]?.imageUrl,
  }

  console.log('[OutfitGenerator] Generated outfit:', {
    title: outfit.title,
    itemCount: outfit.items.length,
    hasImage: !!outfit.imageUrl,
    imageUrl: outfit.imageUrl
  })

  return outfit
}

/**
 * Filter products by gender based on category field
 */
export function filterProductsByGender(products: Product[], gender: 'men' | 'women'): Product[] {
  return products.filter((product) => {
    const category = (product as any).category?.toLowerCase() || ''
    if (gender === 'men') {
      return category.includes('men') && !category.includes('women')
    } else {
      return category.includes('women')
    }
  })
}

/**
 * Generate multiple outfits from product catalog
 */
export function generateOutfits(
  products: Product[],
  options: {
    count?: number
    style?: OutfitStyle
    gender?: 'men' | 'women'
    priceRange?: { min: number; max: number }
  } = {}
): Outfit[] {
  const { count = 5, style = 'any', gender, priceRange } = options

  // Filter by gender if specified
  let filteredProducts = gender ? filterProductsByGender(products, gender) : products

  // Filter by price range if specified
  if (priceRange) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max
    )
  }

  // Filter out out-of-stock products
  filteredProducts = filteredProducts.filter((p) => p.availability !== 'out_of_stock')

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
    const outfit = generateOutfit(categorized, style, gender)
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
 */
export function generateOutfitsFromQuery(products: Product[], query: string): Outfit[] {
  const lowerQuery = query.toLowerCase()

  // Determine gender from query (Default to Women for OOTDay)
  let gender: 'men' | 'women' | undefined = 'women'
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
  } else if (lowerQuery.includes('date') || lowerQuery.includes('dinner') || lowerQuery.includes('romantic') || lowerQuery.includes('เดท') || lowerQuery.includes('แฟน')) {
    style = 'date'
  } else if (lowerQuery.includes('workout') || lowerQuery.includes('gym') || lowerQuery.includes('sport') || lowerQuery.includes('active') || lowerQuery.includes('ออกกำลังกาย')) {
    style = 'workout'
  }

  return generateOutfits(products, { count: 5, style, gender })
}
