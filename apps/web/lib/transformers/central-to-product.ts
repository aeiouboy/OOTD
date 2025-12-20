/**
 * Central Product Transformer
 * Transforms scraped Central Group JSON data to EnhancedProduct model
 */

import type { EnhancedProduct } from '../types/product-types'
import type { Gender } from '../types/enums'

/**
 * Raw scraped product from Central
 */
export interface CentralScrapedProduct {
  product_name: string
  product_desc?: string
  product_link: string
  product_size?: string
  product_price: string
  product_image: string
}

/**
 * Transform Central scraped product to EnhancedProduct (Task 3.1, 3.2)
 */
export function transformCentralProduct(
  scraped: CentralScrapedProduct,
  options: {
    gender?: Gender
    sourceFile?: string
  } = {}
): Partial<EnhancedProduct> {
  // Extract SKU from URL (Task 3.4)
  const sku = extractSKUFromUrl(scraped.product_link)

  // Parse price (Task 3.3)
  const price = parseThaiPrice(scraped.product_price)

  // Detect gender from source or name (Task 3.6)
  const gender = options.gender || detectGender(scraped.product_name, options.sourceFile)

  return {
    // Core info
    id: sku,
    sku,
    name: {
      th: scraped.product_name || '',
      en: undefined, // Will be enriched later if needed
    },
    description: scraped.product_desc
      ? {
          th: scraped.product_desc,
        }
      : undefined,
    brand: extractBrand(scraped.product_name),

    // Pricing
    pricing: {
      currentPrice: price,
      currency: 'THB',
    },

    // Classification
    classification: {
      category: {
        // Will be enriched by categorization system
      },
      gender,
      tags: {
        // Will be enriched by tagging system
      },
    },

    // Style - minimal defaults (Task 3.7)
    style: {
      colors: {
        primary: extractColor(scraped.product_name),
      },
      formalityLevel: 5, // Default, will be calculated
      styleAttributes: ['classic'], // Default
      seasonality: ['all-season'], // Default
    },

    // Sizing
    sizing: {
      availableSizes: parseSizes(scraped.product_size),
    },

    // Availability (Task 3.7)
    availability: {
      status: 'in_stock', // Default assumption
    },

    // Thai market
    thaiMarket: {
      culturalAppropriate: true, // Default, needs review
    },

    // Central integration
    centralIntegration: {
      centralSKU: sku,
      productUrl: scraped.product_link,
      images: {
        primary: scraped.product_image,
      },
    },
  }
}

/**
 * Extract SKU from Central product URL (Task 3.4)
 * Example: https://www.central.co.th/th/product-name-grmkppr000087261
 * Extracts: grmkppr000087261
 */
export function extractSKUFromUrl(url: string): string {
  // Remove query parameters before processing
  const cleanUrl = url.split('?')[0]

  // Try to extract the last part after the last dash
  const match = cleanUrl.match(/-(gr[a-z0-9]+)$/i) || cleanUrl.match(/-(mkp[a-z0-9]+)$/i) || cleanUrl.match(/-(cds[a-z0-9]+)$/i)

  if (match) {
    return match[1]
  }

  // Fallback: use last segment of URL
  const segments = cleanUrl.split('/')
  const lastSegment = segments[segments.length - 1]

  return lastSegment || `sku-${Date.now()}`
}

/**
 * Parse Thai Baht price format (Task 3.3)
 * Handles: "฿2,295", "2,295", "฿2,295.00", ""
 */
export function parseThaiPrice(priceStr: string): number {
  if (!priceStr) return 0

  // Remove currency symbol and commas
  const cleaned = priceStr.replace(/฿|,/g, '').trim()

  // Parse as float
  const price = parseFloat(cleaned)

  return isNaN(price) ? 0 : price
}

/**
 * Detect gender from product name or source file (Task 3.6)
 */
export function detectGender(productName: string, sourceFile?: string): Gender {
  const lowerName = productName.toLowerCase()
  const lowerSource = sourceFile?.toLowerCase() || ''

  // Check source file first
  if (lowerSource.includes('women') || lowerSource.includes('female')) {
    return 'women'
  }
  if (lowerSource.includes('men') || lowerSource.includes('male')) {
    return 'men'
  }

  // Check product name
  const womenKeywords = ['ผู้หญิง', 'women', 'lady', 'female', 'her', 'dress', 'skirt', 'blouse']
  const menKeywords = ['ผู้ชาย', 'men', 'male', 'gentleman', 'his']

  const hasWomenKeyword = womenKeywords.some((kw) => lowerName.includes(kw))
  const hasMenKeyword = menKeywords.some((kw) => lowerName.includes(kw))

  if (hasWomenKeyword) return 'women'
  if (hasMenKeyword) return 'men'

  // Default to unisex if can't determine
  return 'unisex'
}

/**
 * Extract brand from product name
 * Looks for common brand patterns
 */
export function extractBrand(productName: string): string {
  const commonBrands = [
    'lacoste',
    'ลาคอสท์', // Thai name for Lacoste
    'polo ralph lauren',
    'ralph lauren',
    'calvin klein',
    'tommy hilfiger',
    'nike',
    'adidas',
    'zara',
    'h&m',
    'uniqlo',
    'mango',
    'g2000',
    'jaspal',
    'central',
    'fred perry',
    'paul smith',
    'brooks brothers',
    'coach',
    'steve madden',
    'charles & keith',
    'pedro',
    'maisonkitsune',
    'maison kitsune',
    'evisu',
    'maje',
    'sfera',
    'espada',
    'lolita',
    'giordano',
    'expressions',
    'simplicity',
    'easy pieces',
    'easypieces',
  ]

  // Map Thai brand names to English equivalents
  const thaiToEnglish: Record<string, string> = {
    'ลาคอสท์': 'Lacoste',
  }

  const lowerName = productName.toLowerCase()

  for (const brand of commonBrands) {
    if (lowerName.includes(brand.toLowerCase()) || productName.includes(brand)) {
      // Check if this is a Thai brand name that should be mapped to English
      if (thaiToEnglish[brand]) {
        return thaiToEnglish[brand]
      }
      // Return properly capitalized brand name
      return brand
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
  }

  // Try to extract first word/phrase before common separators
  const firstPart = productName.split(/[-–—|:]/)[0].trim()
  if (firstPart && firstPart.length > 2 && firstPart.length < 30) {
    return firstPart
  }

  return 'Central' // Default to Central as retailer
}

/**
 * Extract color from product name
 */
export function extractColor(productName: string): string {
  // Use an array of tuples to control priority order
  // More specific colors (like "navy") should come before generic ones (like "blue")
  const colorPatterns: Array<[string, string]> = [
    // Thai colors first
    ['สีขาว', 'white'],
    ['สีดำ', 'black'],
    ['สีแดง', 'red'],
    ['สีกรมท่า', 'navy'], // Navy before blue in Thai
    ['สีน้ำเงิน', 'blue'],
    ['สีฟ้า', 'blue'],
    ['สีเขียว', 'green'],
    ['สีเหลือง', 'yellow'],
    ['สีชมพู', 'pink'],
    ['สีส้ม', 'orange'],
    ['สีม่วง', 'purple'],
    ['สีเทา', 'gray'],
    ['สีเบจ', 'beige'],
    ['สีน้ำตาล', 'brown'],
    ['สีทอง', 'gold'],
    ['สีเงิน', 'silver'],
    ['สีครีม', 'cream'],

    // English colors - more specific ones first
    ['navy', 'navy'], // Navy before blue
    ['white', 'white'],
    ['black', 'black'],
    ['red', 'red'],
    ['blue', 'blue'],
    ['green', 'green'],
    ['yellow', 'yellow'],
    ['pink', 'pink'],
    ['orange', 'orange'],
    ['purple', 'purple'],
    ['gray', 'gray'],
    ['grey', 'gray'],
    ['beige', 'beige'],
    ['brown', 'brown'],
    ['gold', 'gold'],
    ['silver', 'silver'],
    ['cream', 'cream'],
  ]

  const lowerName = productName.toLowerCase()

  for (const [keyword, color] of colorPatterns) {
    if (lowerName.includes(keyword.toLowerCase())) {
      return color
    }
  }

  return 'neutral' // Default
}

/**
 * Parse sizes from size string
 */
export function parseSizes(sizeStr?: string): string[] {
  if (!sizeStr) {
    // Return common default sizes
    return ['S', 'M', 'L', 'XL']
  }

  // If it's a single size
  if (sizeStr.length < 5) {
    return [sizeStr.toUpperCase()]
  }

  // Try to split by common separators
  const sizes = sizeStr.split(/[,\/|]/).map((s) => s.trim().toUpperCase())

  return sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL']
}

/**
 * Batch transform multiple products
 */
export function transformCentralProducts(
  scrapedProducts: CentralScrapedProduct[],
  options: {
    gender?: Gender
    sourceFile?: string
  } = {}
): Partial<EnhancedProduct>[] {
  return scrapedProducts.map((product) => transformCentralProduct(product, options))
}
