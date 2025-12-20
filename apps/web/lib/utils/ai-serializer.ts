/**
 * AI Serializer
 * Creates token-efficient product summaries for AI prompts
 */

import type { EnhancedProduct, ProductSummary } from '../types/product-types'

/**
 * Serialize product for AI (Task 5.6)
 * Creates token-efficient summary for AI prompts
 */
export function serializeForAI(product: EnhancedProduct): ProductSummary {
  return {
    id: product.id,
    name: product.name?.th || product.name?.en || '',
    brand: product.brand,
    price: product.pricing?.currentPrice || 0,
    category: getCategoryString(product),
    gender: product.classification?.gender || 'unisex',
    occasions: product.classification?.tags?.occasion || [],
    formality: product.style?.formalityLevel || 5,
    colors: [product.style?.colors?.primary, ...(product.style?.colors?.secondary || [])].filter(Boolean),
    style: product.style?.styleAttributes || [],
    season: product.style?.seasonality || ['all-season'],
    role: product.classification?.role,
  }
}

/**
 * Get product summary for AI (Task 5.8)
 * Human-readable description for AI context
 */
export function getProductSummary(product: EnhancedProduct, language: 'th' | 'en' = 'en'): string {
  const name = product.name?.[language] || product.name?.th || product.name?.en || 'Product'
  const brand = product.brand
  const price = formatPrice(product.pricing?.currentPrice || 0, product.pricing?.currency || 'THB')
  const category = getCategoryString(product)
  const formality = getFormalityDescription(product.style?.formalityLevel || 5)
  const occasions = product.classification?.tags?.occasion?.join(', ') || 'versatile'
  const colors = [product.style?.colors?.primary, ...(product.style?.colors?.secondary || [])].filter(Boolean).join(', ')

  if (language === 'th') {
    return `${name} จาก ${brand} ราคา ${price} - ${category} ระดับความเป็นทางการ: ${formality} เหมาะกับโอกาส: ${occasions} สี: ${colors}`
  }

  return `${name} by ${brand} at ${price} - ${category}, ${formality} formality, suitable for: ${occasions}, colors: ${colors}`
}

/**
 * Serialize multiple products for AI context
 */
export function serializeProductsForAI(products: EnhancedProduct[]): ProductSummary[] {
  return products.map((p) => serializeForAI(p))
}

/**
 * Create AI prompt context from products
 */
export function createAIContext(products: EnhancedProduct[], options?: { maxProducts?: number; language?: 'th' | 'en' }): string {
  const maxProducts = options?.maxProducts || 10
  const language = options?.language || 'en'
  const limited = products.slice(0, maxProducts)

  const summaries = limited.map((product, index) => {
    return `${index + 1}. ${getProductSummary(product, language)}`
  })

  const header =
    language === 'th'
      ? `มีสินค้าทั้งหมด ${products.length} รายการ (แสดง ${limited.length} รายการ):\n`
      : `Available products: ${products.length} (showing ${limited.length}):\n`

  return header + summaries.join('\n')
}

/**
 * Get category as string
 */
function getCategoryString(product: EnhancedProduct): string {
  const cat = product.classification?.category
  const parts = [cat?.department, cat?.category, cat?.subcategory, cat?.type].filter(Boolean)
  return parts.join(' > ') || 'Clothing'
}

/**
 * Get formality description
 */
function getFormalityDescription(level: number): string {
  if (level >= 9) return 'very formal'
  if (level >= 7) return 'formal'
  if (level >= 5) return 'business casual'
  if (level >= 3) return 'casual'
  return 'very casual'
}

/**
 * Format price
 */
function formatPrice(price: number, currency: string): string {
  if (currency === 'THB') {
    return `฿${price.toLocaleString('en-US')}`
  }
  return `${currency} ${price.toLocaleString('en-US')}`
}

/**
 * Create outfit recommendation prompt
 */
export function createOutfitPrompt(
  occasion: string,
  products: EnhancedProduct[],
  userPreferences?: {
    budget?: number
    style?: string[]
    colors?: string[]
  }
): string {
  const context = createAIContext(products, { maxProducts: 20 })

  let prompt = `Create an outfit recommendation for a ${occasion}.\n\n`
  prompt += `Available products:\n${context}\n\n`

  if (userPreferences) {
    prompt += 'User preferences:\n'
    if (userPreferences.budget) prompt += `- Budget: ฿${userPreferences.budget}\n`
    if (userPreferences.style) prompt += `- Style: ${userPreferences.style.join(', ')}\n`
    if (userPreferences.colors) prompt += `- Preferred colors: ${userPreferences.colors.join(', ')}\n`
    prompt += '\n'
  }

  prompt +=
    'Please recommend a complete outfit by selecting appropriate products from the list. Consider:\n'
  prompt += '1. Occasion appropriateness\n'
  prompt += '2. Style coherence\n'
  prompt += '3. Color harmony\n'
  prompt += '4. Budget constraints\n'
  prompt += '5. Cultural appropriateness for Thai context\n'

  return prompt
}

/**
 * Parse AI response to extract product IDs
 */
export function parseAIOutfitResponse(response: string): string[] {
  // Extract product IDs from AI response
  // Looks for patterns like "Product 1.", "ID: prod-001", etc.
  const productIds: string[] = []

  // Pattern 1: "1. Product Name by Brand" - extract from our context
  const numberPattern = /^\d+\./gm
  const matches = response.match(numberPattern)

  if (matches) {
    // Extract IDs based on numbered references
    matches.forEach((match) => {
      const num = parseInt(match)
      if (num) {
        productIds.push(`product-${num}`)
      }
    })
  }

  // Pattern 2: Direct ID references
  const idPattern = /\b(prod-\w+|sku-\w+|[a-z0-9]{8,})\b/gi
  const idMatches = response.match(idPattern)

  if (idMatches) {
    productIds.push(...idMatches)
  }

  return [...new Set(productIds)] // Remove duplicates
}
