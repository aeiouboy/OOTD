/**
 * Server-side Product Loader
 * Loads product data directly from filesystem for server-side operations
 */

import fs from 'fs'
import path from 'path'
import type { Product } from './types'
import type { EnhancedProduct } from './types/product-types'
import { transformCentralProduct } from './transformers/central-to-product'
import { enrichProductData } from './transformers/product-enrichment'
import { validateProduct } from './validation/product-validator'

interface ProductMasterItem {
  category: string
  price: string
  original_price: string
  brand: string
  product_name: string
  link: string
  image_url: string
  availability: string
  product_description: string
}

/**
 * Load and transform products directly from filesystem (server-side only)
 */
export async function loadProductsServerSide(): Promise<EnhancedProduct[]> {
  try {
    // Try multiple possible paths for products directory
    const possiblePaths = [
      path.join(process.cwd(), '..', 'products'), // One level up (normal runtime)
      path.join(process.cwd(), '..', '..', 'products'), // Two levels up (during build)
      path.join('/Users/naruechon/Documents/Project/OOTDay', 'products'), // Absolute fallback
    ]

    let productsDir = ''
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        productsDir = testPath
        break
      }
    }

    if (!productsDir) {
      console.error('[ServerProductLoader] Products directory not found. Tried:', possiblePaths)
      return []
    }

    const productMasterPath = path.join(productsDir, 'product_master.json')

    if (!fs.existsSync(productMasterPath)) {
      console.error('[ServerProductLoader] product_master.json not found')
      return []
    }

    console.log('[ServerProductLoader] Loading product_master.json from:', productMasterPath)
    const masterContent = fs.readFileSync(productMasterPath, 'utf-8')
    const masterData: ProductMasterItem[] = JSON.parse(masterContent)

    if (!Array.isArray(masterData)) {
      console.error('[ServerProductLoader] Invalid product data format')
      return []
    }

    // Transform to EnhancedProduct format
    const enhancedProducts: EnhancedProduct[] = []

    for (const item of masterData) {
      try {
        // Create scraped product structure
        const scrapedProduct = {
          product_name: item.product_name,
          product_desc: item.product_description || '',
          product_link: item.link,
          product_size: '',
          product_price: item.price,
          product_image: item.image_url,
        }

        // Detect gender from category
        const gender = item.category === 'men_clothing' ? 'men' :
                      item.category === 'women_clothing' ? 'women' : undefined

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
        }
      } catch (error) {
        console.error(`[ServerProductLoader] Error transforming product ${item.product_name}:`, error)
      }
    }

    const menCount = enhancedProducts.filter(p => p.classification.gender === 'men').length
    const womenCount = enhancedProducts.filter(p => p.classification.gender === 'women').length

    console.log(`[ServerProductLoader] Loaded ${menCount} men's products`)
    console.log(`[ServerProductLoader] Loaded ${womenCount} women's products`)
    console.log(`[ServerProductLoader] Total enhanced products: ${enhancedProducts.length}`)

    return enhancedProducts
  } catch (error) {
    console.error('[ServerProductLoader] Error loading products:', error)
    return []
  }
}