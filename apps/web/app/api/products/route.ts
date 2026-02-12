/**
 * Product Catalog API Route
 *
 * Loads product data from JSON files and returns as JSON
 * Runs server-side only, has access to filesystem
 */

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Product } from '@/lib/types'

interface CentralProductJSON {
  product_name: string
  product_desc: string
  product_link: string
  product_size: string
  product_price: string
  product_image: string
}

interface ProductJSONFile {
  products: CentralProductJSON[]
}

// Helper function to parse Thai Baht price string to number
function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr.trim() === '') {
    return 0
  }
  // Remove ฿ symbol and commas, then parse
  const cleanPrice = priceStr.replace(/[฿,]/g, '').trim()
  const price = parseFloat(cleanPrice)
  return isNaN(price) ? 0 : price
}

// Helper function to extract brand from product name
function extractBrand(productName: string): string {
  // Try to extract brand from Thai product names
  // Many products have brand names in English or specific patterns
  const brandPatterns = [
    /LACOSTE/i,
    /G2000/i,
    /Paul Smith/i,
    /EP\s/i,
    /expressions/i,
    /easypieces/i,
    /lolita/i,
  ]

  for (const pattern of brandPatterns) {
    if (pattern.test(productName)) {
      const match = productName.match(pattern)
      return match ? match[0] : 'Central'
    }
  }

  // Default to Central if no brand detected
  return 'Central'
}

// Helper function to extract SKU from product URL
function extractSKU(url: string): string {
  // Extract the last part of the URL as SKU
  const parts = url.split('/')
  const lastPart = parts[parts.length - 1]

  // Extract the ID part (e.g., "grmkppr000148277" from URL)
  const skuMatch = lastPart.match(/gr[a-z]{3}\w+/i)
  if (skuMatch) {
    return skuMatch[0]
  }

  // Fallback to using the entire last segment
  return lastPart || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to detect gender from filename
function detectGender(fileName: string): string {
  if (fileName.includes('women')) {
    return 'women'
  } else if (fileName.includes('men')) {
    return 'men'
  }
  return 'unisex'
}

function parseProductJSON(jsonData: ProductJSONFile, category: string): Product[] {
  try {
    const products: Product[] = jsonData.products
      .filter((item) => {
        // Filter out products without essential data
        return (
          item.product_name &&
          item.product_link &&
          item.product_image
        )
      })
      .map((item) => {
        const price = parsePrice(item.product_price)

        const product: Product = {
          sku: extractSKU(item.product_link),
          name: item.product_name.trim(),
          brand: extractBrand(item.product_name),
          price: price,
          imageUrl: item.product_image.trim(),
          onlineUrl: item.product_link.trim(),
          availability: price > 0 ? 'in_stock' : 'out_of_stock',
          category: category,
        }

        return product
      })

    return products
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return []
  }
}

export async function GET() {
  try {
    // Try multiple possible paths for products directory
    const possiblePaths = [
      path.join(process.cwd(), '..', '..', 'data', 'products'), // apps/web -> data/products
      path.join(process.cwd(), '..', 'data', 'products'),
      path.join(process.cwd(), 'data', 'products'),
      path.join(process.cwd(), '..', 'products'), // legacy
      path.join(process.cwd(), '..', '..', 'products'), // legacy
      path.join('/Users/naruechon/Documents/Project/OOTDay', 'products'), // Absolute legacy fallback
    ]

    let productsDir = ''
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        productsDir = testPath
        break
      }
    }

    if (!productsDir) {
      console.error('Products directory not found. Tried:', possiblePaths)
      return NextResponse.json(
        { products: [], count: 0, warning: 'Product catalog not found on filesystem' },
        { status: 200 }
      )
    }

    console.log('Loading JSON from:', productsDir)

    // Load from the new product_master.json file
    const productMasterPath = path.join(productsDir, 'product_master.json')

    let allProducts: Product[] = []

    if (fs.existsSync(productMasterPath)) {
      console.log('Loading product_master.json')
      const masterContent = fs.readFileSync(productMasterPath, 'utf-8')
      const masterData = JSON.parse(masterContent)

      // Parse products from the master file
      // The master file has a different structure - products are directly in an array
      if (Array.isArray(masterData)) {
        allProducts = masterData
          .filter((item: any) => {
            return item.product_name && item.link && item.image_url
          })
          .map((item: any) => {
            // Detect gender from category
            const gender = item.category === 'men_clothing' ? 'men' :
                          item.category === 'women_clothing' ? 'women' : 'unisex'

            const price = parseFloat(item.price) || 0

            const product: Product = {
              sku: extractSKU(item.link),
              name: item.product_name.trim(),
              brand: item.brand || extractBrand(item.product_name),
              price: price,
              imageUrl: item.image_url.trim(),
              onlineUrl: item.link.trim(),
              availability: item.availability === 'In Stock' ? 'in_stock' :
                           item.availability === 'Low Stock' ? 'low_stock' : 'out_of_stock',
              category: gender,
            }

            return product
          })

        const menCount = allProducts.filter(p => p.category === 'men').length
        const womenCount = allProducts.filter(p => p.category === 'women').length

        console.log(`Loaded ${menCount} men's products`)
        console.log(`Loaded ${womenCount} women's products`)
        console.log(`Total products loaded: ${allProducts.length}`)
      }
    } else {
      // Fallback to old JSON files if product_master.json doesn't exist
      console.log('product_master.json not found, trying legacy files')

      const menJsonPath = path.join(productsDir, 'central-men-clothing.json')
      const womenJsonPath = path.join(productsDir, 'central-women-dresses.json')

      if (fs.existsSync(menJsonPath)) {
        const menJsonContent = fs.readFileSync(menJsonPath, 'utf-8')
        const menJsonData: ProductJSONFile = JSON.parse(menJsonContent)
        const menProducts = parseProductJSON(menJsonData, 'men')
        allProducts = [...allProducts, ...menProducts]
        console.log(`Loaded ${menProducts.length} men's products from legacy file`)
      }

      if (fs.existsSync(womenJsonPath)) {
        const womenJsonContent = fs.readFileSync(womenJsonPath, 'utf-8')
        const womenJsonData: ProductJSONFile = JSON.parse(womenJsonContent)
        const womenProducts = parseProductJSON(womenJsonData, 'women')
        allProducts = [...allProducts, ...womenProducts]
        console.log(`Loaded ${womenProducts.length} women's products from legacy file`)
      }
    }

    // Return products with cache headers
    return NextResponse.json(
      { products: allProducts, count: allProducts.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('Error loading product catalog:', error)
    return NextResponse.json(
      { error: 'Failed to load product catalog', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
