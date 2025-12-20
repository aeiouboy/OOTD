/**
 * Product Data Provider
 *
 * Provides product catalog data for the application
 * Supports both legacy Product and EnhancedProduct types
 */

import type { Product, EnhancedProduct, Gender } from './types'
import { searchProductsEnhanced, filterByGender } from './utils/product-filters'

// Product catalogs
let productCatalog: Product[] = []
let enhancedProductCatalog: EnhancedProduct[] = []

/**
 * Set the product catalog (used by data loader)
 */
export function setProductCatalog(products: Product[]): void {
  productCatalog = products
}

/**
 * Set enhanced product catalog
 */
export function setEnhancedProductCatalog(products: EnhancedProduct[]): void {
  enhancedProductCatalog = products
}

/**
 * Get all products from the catalog
 */
export function getAllProducts(): Product[] {
  return productCatalog
}

/**
 * Get all enhanced products
 */
export function getAllEnhancedProducts(): EnhancedProduct[] {
  return enhancedProductCatalog
}

/**
 * Get products by gender category
 */
export function getProductsByGender(gender: 'men' | 'women' | 'all' = 'all'): Product[] | EnhancedProduct[] {
  // Try enhanced catalog first
  if (enhancedProductCatalog.length > 0) {
    if (gender === 'all') return enhancedProductCatalog
    return filterByGender(enhancedProductCatalog, gender as Gender)
  }

  // Fallback to legacy catalog
  return productCatalog
}

/**
 * Get a product by SKU
 */
export function getProductBySKU(sku: string): Product | EnhancedProduct | undefined {
  // Try enhanced catalog first
  const enhanced = enhancedProductCatalog.find((p) => p.sku === sku || p.id === sku)
  if (enhanced) return enhanced

  // Fallback to legacy
  return productCatalog.find((p) => p.sku === sku)
}

/**
 * Search products by name or brand
 */
export function searchProducts(query: string): Product[] | EnhancedProduct[] {
  // Try enhanced catalog with advanced search
  if (enhancedProductCatalog.length > 0) {
    return searchProductsEnhanced(enhancedProductCatalog, query)
  }

  // Fallback to legacy simple search
  const lowerQuery = query.toLowerCase()
  return productCatalog.filter(
    (p) => p.name.toLowerCase().includes(lowerQuery) || p.brand.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get random products (for suggestions)
 */
export function getRandomProducts(count: number = 10): Product[] | EnhancedProduct[] {
  const catalog = enhancedProductCatalog.length > 0 ? enhancedProductCatalog : productCatalog
  const shuffled = [...catalog].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Get catalog stats
 */
export function getCatalogStats() {
  return {
    legacy: productCatalog.length,
    enhanced: enhancedProductCatalog.length,
    total: productCatalog.length + enhancedProductCatalog.length,
  }
}
