/**
 * Data Loader
 * Loads and transforms product data from API to EnhancedProduct format
 */

import type { Product } from './types'
import type { EnhancedProduct } from './types/product-types'
import { transformCentralProduct } from './transformers/central-to-product'
import { enrichProductData } from './transformers/product-enrichment'
import { validateProduct } from './validation/product-validator'
import { setEnhancedProductCatalog, setProductCatalog } from './product-data'

/**
 * Load products from API and transform to EnhancedProduct format
 */
export async function loadEnhancedProducts(): Promise<EnhancedProduct[]> {
  try {
    // Determine the correct URL based on context
    const url = typeof window !== 'undefined'
      ? '/api/products' // Client-side: relative URL
      : `http://localhost:${process.env.PORT || 3000}/api/products` // Server-side: absolute URL

    // Fetch products from API
    const response = await fetch(url, {
      cache: 'force-cache',
    })

    if (!response.ok) {
      console.error('Failed to load products:', response.statusText)
      return []
    }

    const data = await response.json()
    const products: Product[] = data.products || []

    console.log(`[DataLoader] Loaded ${products.length} products from API`)

    // Transform to EnhancedProduct format
    const enhancedProducts: EnhancedProduct[] = []

    for (const product of products) {
      try {
        // Create scraped product structure
        const scrapedProduct = {
          product_name: product.name,
          product_desc: '',
          product_link: product.onlineUrl || '',
          product_size: product.sizes?.join(', ') || '',
          product_price: `฿${product.price.toLocaleString()}`,
          product_image: product.imageUrl,
        }

        // Detect gender from category
        const gender = product.category?.toLowerCase().includes('women')
          ? 'women'
          : product.category?.toLowerCase().includes('men')
            ? 'men'
            : undefined

        // Transform to enhanced format
        let transformed = transformCentralProduct(scrapedProduct, {
          gender,
        })

        // Enrich with inferred attributes
        transformed = enrichProductData(transformed)

        // Validate
        const validation = validateProduct(transformed)

        if (validation.valid && transformed.id && transformed.sku) {
          enhancedProducts.push(transformed as EnhancedProduct)
        } else {
          console.warn(`[DataLoader] Invalid product skipped: ${product.name}`, validation.errors)
        }
      } catch (error) {
        console.error(`[DataLoader] Error transforming product ${product.name}:`, error)
      }
    }

    console.log(`[DataLoader] Successfully transformed ${enhancedProducts.length} products to EnhancedProduct format`)

    // Update global catalogs
    setProductCatalog(products)
    setEnhancedProductCatalog(enhancedProducts)

    return enhancedProducts
  } catch (error) {
    console.error('[DataLoader] Error loading enhanced products:', error)
    return []
  }
}

/**
 * Initialize product catalog on app startup
 */
export async function initializeProductCatalog(): Promise<{
  legacy: Product[]
  enhanced: EnhancedProduct[]
}> {
  try {
    console.log('[DataLoader] Initializing product catalog...')

    // Load and transform products
    const enhanced = await loadEnhancedProducts()

    // Determine the correct URL based on context
    const url = typeof window !== 'undefined'
      ? '/api/products' // Client-side: relative URL
      : `http://localhost:${process.env.PORT || 3000}/api/products` // Server-side: absolute URL

    // Fetch legacy products
    const response = await fetch(url, {
      cache: 'force-cache',
    })

    const data = await response.json()
    const legacy: Product[] = data.products || []

    console.log(
      `[DataLoader] Catalog initialized: ${legacy.length} legacy products, ${enhanced.length} enhanced products`
    )

    return {
      legacy,
      enhanced,
    }
  } catch (error) {
    console.error('[DataLoader] Failed to initialize product catalog:', error)
    return {
      legacy: [],
      enhanced: [],
    }
  }
}
