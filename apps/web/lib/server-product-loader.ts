/**
 * Server-side Product Loader
 * Loads product data directly from filesystem for server-side operations
 *
 * Updated for chore-kb002: Supports both v0 (legacy) and v1 (KB-enriched) formats
 */

import fs from 'fs'
import path from 'path'
import type { Product } from './types'
import type { EnhancedProduct } from './types/product-types'
import type { ProductMasterItem, ProductMasterV1Item, ProductVersion } from './types/kb-expansion-types'
import type { DbProduct } from './supabase/types'
import { transformCentralProduct } from './transformers/central-to-product'
import { enrichProductData, hasKBAttributes } from './transformers/product-enrichment'
import { validateProduct } from './validation/product-validator'
import { parseKBAttributes, validateAllKBEnums } from './transformers/kb-attribute-parser'
import { detectProductVersion } from './types/kb-expansion-types'

/**
 * Load and transform products directly from filesystem (server-side only)
 * Supports both v0 (product_master.json) and v1 (product_master_v1.json) formats
 */
export async function loadProductsServerSide(): Promise<EnhancedProduct[]> {
  const startTime = Date.now()

  try {
    // Try multiple possible paths for products directory
    const possiblePaths = [
      path.join(process.cwd(), '..', '..', 'data', 'products'), // From apps/web
      path.join(process.cwd(), '..', 'data', 'products'), // One level up
      path.join(process.cwd(), 'data', 'products'), // From project root
      path.join('/Users/naruechon/OOTD', 'data', 'products'), // Absolute fallback
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

    // Try v1 first, fallback to v0
    const possibleFiles = [
      'product_master_v1.json',  // KB-enriched format (preferred)
      'product_master.json',      // Legacy format (fallback)
    ]

    let productMasterPath = ''
    let usingV1Format = false
    for (const fileName of possibleFiles) {
      const testPath = path.join(productsDir, fileName)
      if (fs.existsSync(testPath)) {
        productMasterPath = testPath
        usingV1Format = fileName === 'product_master_v1.json'
        console.log(`[ServerProductLoader] Using ${fileName}`)
        break
      }
    }

    if (!productMasterPath) {
      console.error('[ServerProductLoader] No product_master file found')
      return []
    }

    console.log('[ServerProductLoader] Loading from:', productMasterPath)
    const masterContent = fs.readFileSync(productMasterPath, 'utf-8')
    const masterData: ProductMasterItem[] = JSON.parse(masterContent)

    if (!Array.isArray(masterData)) {
      console.error('[ServerProductLoader] Invalid product data format')
      return []
    }

    // Transform to EnhancedProduct format
    const enhancedProducts: EnhancedProduct[] = []
    let v0Count = 0
    let v1Count = 0
    let kbValidationErrors = 0

    for (const item of masterData) {
      try {
        const version = detectProductVersion(item)

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

        // Step 1: Transform basic attributes (existing logic)
        let transformed = transformCentralProduct(scrapedProduct, { gender })

        // Step 2: Parse KB attributes if v1 format
        if (version === 'v1') {
          const kbAttrs = parseKBAttributes(item as ProductMasterV1Item)
          if (kbAttrs) {
            // Merge KB attributes into transformed product
            transformed = {
              ...transformed,
              thaiContext: kbAttrs.thaiContext,
              visualMatching: kbAttrs.visualMatching,
              crossProductCompatibility: kbAttrs.crossProductCompatibility,
              priceIntelligence: kbAttrs.priceIntelligence,
              socialProof: kbAttrs.socialProof,
            } as any

            // Validate KB enums (warn but don't reject)
            const enumErrors = validateAllKBEnums(kbAttrs)
            if (enumErrors.length > 0) {
              kbValidationErrors++
              if (kbValidationErrors <= 5) {
                console.warn(`[KB Validation] ${item.product_name.substring(0, 40)}...`, enumErrors.slice(0, 3))
              }
            }

            v1Count++
          } else {
            // KB parsing failed, fallback to enrichment
            transformed = enrichProductData(transformed)
            v0Count++
          }
        } else {
          // V0 format: use existing enrichment pipeline
          transformed = enrichProductData(transformed)
          v0Count++
        }

        // Step 3: Validate
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
    const loadTime = Date.now() - startTime

    console.log(`[ServerProductLoader] Version distribution:`)
    console.log(`  - V0 products (enriched): ${v0Count}`)
    console.log(`  - V1 products (KB-enriched): ${v1Count}`)
    if (kbValidationErrors > 0) {
      console.log(`  - KB validation warnings: ${kbValidationErrors}`)
    }
    console.log(`[ServerProductLoader] Gender distribution:`)
    console.log(`  - Men's products: ${menCount}`)
    console.log(`  - Women's products: ${womenCount}`)
    console.log(`[ServerProductLoader] Total enhanced products: ${enhancedProducts.length}`)
    console.log(`[ServerProductLoader] Load time: ${loadTime}ms`)

    return enhancedProducts
  } catch (error) {
    console.error('[ServerProductLoader] Error loading products:', error)
    return []
  }
}

/**
 * Load products from Supabase when SUPABASE_PRODUCTS_ENABLED is true.
 * Returns null if Supabase is disabled or unavailable, signaling callers to use JSON fallback.
 */
export async function loadProductsFromSupabase(
  occasionFilter?: string,
  limit = 100
): Promise<DbProduct[] | null> {
  if (process.env.SUPABASE_PRODUCTS_ENABLED !== 'true') {
    return null
  }

  try {
    const { createServerClient } = await import('./supabase/client')
    const supabase = createServerClient()

    let query = supabase.from('products').select('*')

    if (occasionFilter) {
      query = query.eq('primary_occasion', occasionFilter)
    }

    const { data, error } = await query.limit(limit)
    if (error) throw error

    return data
  } catch (error) {
    console.error('[ServerProductLoader] Failed to load from Supabase, will fallback to JSON:', error)
    return null
  }
}
