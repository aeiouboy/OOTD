/**
 * Product Catalog CSV Loader
 *
 * Loads and parses product catalog CSV files from Central Group
 * Maps CSV data to Product interface for use throughout the application
 */

import Papa from 'papaparse'
import { Product } from './types'
import fs from 'fs'
import path from 'path'

/**
 * CSV Row structure from Central Group product catalogs
 */
interface ProductCSVRow {
  'Category': string
  'Sub-Category': string
  'Product ID (SKU)': string
  'Product image': string
  'PIC': string
  'Product name': string
  'Brand': string
  'Description': string
  'Size': string
  'Original_Price': string
  'Discount (If any)': string
  'Current price': string
  'Sale link (central online link)': string
}

/**
 * Parse CSV file and transform to Product array
 * @param csvFilePath - Absolute path to CSV file
 * @returns Array of Product objects
 */
export function parseProductCSV(csvFilePath: string): Product[] {
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8')

    // Parse CSV with papaparse
    const parseResult = Papa.parse<ProductCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(), // Remove BOM and whitespace
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
    }

    // Transform CSV rows to Product objects
    const products: Product[] = parseResult.data
      .filter((row) => {
        // Filter out rows with missing required fields
        return (
          row['Product ID (SKU)'] &&
          row['Product name'] &&
          row['Brand'] &&
          row['Current price'] &&
          row['Product image']
        )
      })
      .map((row) => transformCSVRowToProduct(row))
      .filter((product): product is Product => product !== null)

    console.log(`Loaded ${products.length} products from ${path.basename(csvFilePath)}`)
    return products
  } catch (error) {
    console.error(`Error loading CSV file ${csvFilePath}:`, error)
    return []
  }
}

/**
 * Transform CSV row to Product interface
 * @param row - CSV row data
 * @returns Product object or null if transformation fails
 */
function transformCSVRowToProduct(row: ProductCSVRow): Product | null {
  try {
    // Parse price - remove commas and convert to number
    const priceStr = row['Current price']?.replace(/,/g, '') || '0'
    const price = parseFloat(priceStr)

    if (isNaN(price)) {
      console.warn(`Invalid price for SKU ${row['Product ID (SKU)']}: ${row['Current price']}`)
      return null
    }

    // Parse sizes - split by common delimiters
    const sizesStr = row['Size'] || ''
    const sizes = sizesStr
      ? sizesStr.split(/[,/]/).map((s) => s.trim()).filter(Boolean)
      : []

    // Map to Product interface
    const product: Product = {
      sku: row['Product ID (SKU)'].trim(),
      name: row['Product name'].trim(),
      brand: row['Brand'].trim(),
      price: price,
      imageUrl: row['Product image'].trim(),
      onlineUrl: row['Sale link (central online link)']?.trim() || undefined,
      sizes: sizes.length > 0 ? sizes : undefined,
      availability: 'in_stock', // Default to in_stock (can be enhanced later)
      category: row['Category']?.trim() || undefined, // Extract category (Men/Women)
    }

    return product
  } catch (error) {
    console.error(`Error transforming row for SKU ${row['Product ID (SKU)']}:`, error)
    return null
  }
}

/**
 * Load all product catalogs (Men's and Women's)
 * @param docsDir - Path to docs directory containing CSV files
 * @returns Combined array of all products
 */
export function loadAllProducts(docsDir: string): Product[] {
  const menCsvPath = path.join(docsDir, 'Product_Men.csv')
  const womenCsvPath = path.join(docsDir, 'Product_Woman.csv')

  const menProducts = parseProductCSV(menCsvPath)
  const womenProducts = parseProductCSV(womenCsvPath)

  const allProducts = [...menProducts, ...womenProducts]
  console.log(`Total products loaded: ${allProducts.length} (Men: ${menProducts.length}, Women: ${womenProducts.length})`)

  return allProducts
}

/**
 * Load products at build time or runtime
 * Use this function to get product catalog for the application
 */
export function getProductCatalog(): Product[] {
  // Determine docs directory path (relative to project root)
  const projectRoot = path.resolve(process.cwd(), '..')
  const docsDir = path.join(projectRoot, 'docs')

  // Check if docs directory exists
  if (!fs.existsSync(docsDir)) {
    console.warn('Docs directory not found, returning empty product catalog')
    return []
  }

  return loadAllProducts(docsDir)
}
