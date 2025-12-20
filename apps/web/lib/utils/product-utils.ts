import type { Product, EnhancedProduct } from '@/lib/types'

/**
 * Enhanced Product Utilities
 * Extended to support both legacy Product and EnhancedProduct interfaces
 */

export function getGenderSpecificUrl(product: Product | EnhancedProduct): string {
  // Check EnhancedProduct structure first
  if ('centralIntegration' in product) {
    return product.centralIntegration?.productUrl || ''
  }

  // Legacy Product structure - check category first
  const category = product.category?.toLowerCase() || ''

  // Check for women first (before men, since "women" contains "men")
  if (category.includes('women')) {
    return 'https://www.central.co.th/th/women'
  }

  // Check for men (exact match or substring)
  if (category === 'men' || category.includes('men')) {
    return 'https://www.central.co.th/th/men'
  }

  // For unknown categories, use onlineUrl if available
  if (product.onlineUrl) {
    return product.onlineUrl
  }

  // Fallback to base URL for products without recognized category
  return 'https://www.central.co.th'
}

export function getSimilarOutfits(currentOutfit: any, allOutfits: any[], maxResults: number = 6): any[] {
  return allOutfits
    .filter((outfit) => outfit.id !== currentOutfit.id)
    .filter((outfit) => {
      // Similar price range (±20%)
      const priceDiff = Math.abs(outfit.totalPrice - currentOutfit.totalPrice)
      return priceDiff <= currentOutfit.totalPrice * 0.2
    })
    .slice(0, maxResults)
}

/**
 * Get product display name (supports bilingual)
 */
export function getProductName(product: Product | EnhancedProduct, language: 'th' | 'en' = 'th'): string {
  if ('name' in product && typeof product.name === 'object') {
    // EnhancedProduct with LocalizedText
    return product.name[language] || product.name.th || product.name.en || ''
  }
  // Legacy Product
  return typeof product.name === 'string' ? product.name : ''
}

/**
 * Get product price
 */
export function getProductPrice(product: Product | EnhancedProduct): number {
  if ('pricing' in product) {
    return product.pricing?.currentPrice || 0
  }
  return product.price || 0
}

/**
 * Get product image URL
 */
export function getProductImageUrl(product: Product | EnhancedProduct): string {
  if ('centralIntegration' in product) {
    return product.centralIntegration?.images?.primary || ''
  }
  return product.imageUrl || ''
}

/**
 * Check if product is EnhancedProduct
 */
export function isEnhancedProduct(product: any): product is EnhancedProduct {
  return product && typeof product === 'object' && 'centralIntegration' in product && 'pricing' in product
}

/**
 * Convert legacy Product to partial EnhancedProduct
 */
export function legacyToEnhanced(product: Product): Partial<EnhancedProduct> {
  return {
    id: product.sku,
    sku: product.sku,
    name: {
      en: product.name,
    },
    brand: product.brand,
    pricing: {
      currentPrice: product.price,
      currency: 'THB',
    },
    classification: {
      category: {},
      gender: product.category?.toLowerCase() === 'women' ? 'women' : 'men',
      tags: {},
    },
    style: {
      colors: {
        primary: product.colors?.[0] || 'neutral',
      },
      formalityLevel: 5,
      styleAttributes: ['classic'],
      seasonality: ['all-season'],
    },
    sizing: {
      availableSizes: product.sizes || [],
    },
    availability: {
      status: product.availability,
    },
    thaiMarket: {
      culturalAppropriate: true,
    },
    centralIntegration: {
      centralSKU: product.sku,
      productUrl: product.onlineUrl || '',
      images: {
        primary: product.imageUrl,
      },
    },
  }
}

