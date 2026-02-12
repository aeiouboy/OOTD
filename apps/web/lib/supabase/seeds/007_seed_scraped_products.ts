import { config } from 'dotenv'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createServerClient } from '../client'

// Load .env and .env.local from apps/web/
config({ path: resolve(__dirname, '../../../.env.local') })
config({ path: resolve(__dirname, '../../../.env') })

interface ScrapedProduct {
  product_name: string
  brand: string
  category: string
  price: number
  original_price: number
  discount_percent: number
  url: string
  image_url: string | null
  material: string
  color: string
}

interface ProductToInsert {
  sku: string | null
  product_name: string
  brand: string | null
  category: string
  price: number | null
  original_price: number | null
  image_url: string | null
  link: string | null
  product_description?: string | null
  availability?: string
  occasion_weekend_social: number
  occasion_date_night: number
  occasion_everyday_casual: number
  primary_occasion: string
  embedding: null
}

const BATCH_SIZE = 100

// Keyword and brand patterns for occasion scoring
const OCCASION_PATTERNS = {
  work: {
    keywords: ['blazer', 'blouse', 'formal-shirt', 'formal shirt', 'suit-pants', 'suit pants', 'pencil-skirt', 'pencil skirt', 'button-up', 'button up'],
    brands: ['G2000', 'Theory', 'CHARLES & KEITH', 'Massimo Dutti'],
  },
  party: {
    keywords: ['evening-dress', 'evening dress', 'mini-dress', 'mini dress', 'corset-top', 'corset top', 'crop-top', 'crop top', 'sequin'],
    brands: ['ASAVA', 'Maje', 'Sandro', 'Ted Baker'],
  },
  wedding: {
    keywords: ['maxi-dress', 'maxi dress', 'midi-dress', 'midi dress', 'lace', 'floral', 'elegant'],
    brands: ['Maje', 'Sandro', 'ASAVA'],
  },
  dinner: {
    keywords: ['midi-dress', 'midi dress', 'elegant', 'blazer', 'blouse'],
    brands: ['Massimo Dutti', 'Maje', 'Sandro'],
  },
  travel: {
    keywords: ['t-shirt', 'polo', 'shorts', 'sneaker', 'hoodie', 'hoodie', 'loafer', 'slip-on', 'casual'],
    brands: ['Uniqlo', 'Giordano', 'LACOSTE'],
  },
  cafe: {
    keywords: ['t-shirt', 'casual-shirt', 'casual shirt', 'polo', 'sneaker', 'loafer', 'slip-on'],
    brands: ['Uniqlo', 'Giordano', 'LACOSTE'],
  },
  sport: {
    keywords: ['leggings', 'tank-top', 'tank top', 'hoodie', 'trainer', 'sneaker', 'workout', 'athletic'],
    brands: ['Nike', 'Adidas', 'Puma'],
  },
}

function matchesAny(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase()
  return patterns.some((pattern) => lower.includes(pattern.toLowerCase()))
}

function computeOccasionScores(product: ScrapedProduct): {
  occasion_weekend_social: number
  occasion_date_night: number
  occasion_everyday_casual: number
  primary_occasion: string
} {
  const name = product.product_name.toLowerCase()
  const category = product.category.toLowerCase()
  const brand = product.brand.toLowerCase()
  const price = product.price

  let occasion_weekend_social = 0.3
  let occasion_date_night = 0.3
  let occasion_everyday_casual = 0.3

  // Map new occasion patterns to the 3 schema columns
  // weekend_social: party, wedding, dinner, cafe
  // date_night: work, party, wedding, dinner
  // everyday_casual: travel, cafe, sport

  // WEEKEND SOCIAL (combines: party, wedding, cafe occasions)
  if (matchesAny(name + ' ' + category, OCCASION_PATTERNS.party.keywords) ||
      matchesAny(name + ' ' + category, OCCASION_PATTERNS.wedding.keywords) ||
      matchesAny(name + ' ' + category, OCCASION_PATTERNS.cafe.keywords)) {
    occasion_weekend_social += 0.4
  }
  if (matchesAny(brand, OCCASION_PATTERNS.party.brands) ||
      matchesAny(brand, OCCASION_PATTERNS.wedding.keywords)) {
    occasion_weekend_social += 0.15
  }
  if (price > 1500 && price < 5000) {
    occasion_weekend_social += 0.1
  }

  // DATE NIGHT (combines: work, dinner occasions - more formal)
  if (matchesAny(name + ' ' + category, OCCASION_PATTERNS.work.keywords) ||
      matchesAny(name + ' ' + category, OCCASION_PATTERNS.dinner.keywords)) {
    occasion_date_night += 0.4
  }
  if (matchesAny(brand, OCCASION_PATTERNS.work.brands) ||
      matchesAny(brand, OCCASION_PATTERNS.dinner.brands)) {
    occasion_date_night += 0.15
  }
  if (price > 2000) {
    occasion_date_night += 0.15
  }

  // EVERYDAY CASUAL (combines: travel, sport, casual items)
  if (matchesAny(name + ' ' + category, OCCASION_PATTERNS.travel.keywords) ||
      matchesAny(name + ' ' + category, OCCASION_PATTERNS.sport.keywords) ||
      matchesAny(name + ' ' + category, OCCASION_PATTERNS.cafe.keywords)) {
    occasion_everyday_casual += 0.4
  }
  if (matchesAny(brand, OCCASION_PATTERNS.travel.brands) ||
      matchesAny(brand, OCCASION_PATTERNS.sport.brands)) {
    occasion_everyday_casual += 0.15
  }
  if (price < 2000) {
    occasion_everyday_casual += 0.15
  }

  // Clamp all scores to 0-1
  occasion_weekend_social = Math.min(1, Math.max(0, occasion_weekend_social))
  occasion_date_night = Math.min(1, Math.max(0, occasion_date_night))
  occasion_everyday_casual = Math.min(1, Math.max(0, occasion_everyday_casual))

  // Determine primary occasion
  let maxScore = -1
  let primary_occasion = 'everyday_casual'

  const scores = {
    weekend_social: occasion_weekend_social,
    date_night: occasion_date_night,
    everyday_casual: occasion_everyday_casual,
  }

  for (const [key, val] of Object.entries(scores)) {
    if (val > maxScore) {
      maxScore = val
      primary_occasion = key
    }
  }

  return {
    occasion_weekend_social,
    occasion_date_night,
    occasion_everyday_casual,
    primary_occasion,
  }
}

async function main() {
  const productPath = resolve(__dirname, '../../../../../data/products/central-women-master.json')
  console.log(`Reading products from: ${productPath}`)

  const rawData = JSON.parse(readFileSync(productPath, 'utf-8'))
  const products: ScrapedProduct[] = rawData.products
  console.log(`Found ${products.length} products in master JSON`)

  const supabase = createServerClient()

  // Get all existing links AND SKUs to skip duplicates
  console.log('Fetching existing products from Supabase...')
  const { data: existingProducts, error: fetchError } = await supabase
    .from('products')
    .select('link, sku', { count: 'exact' })

  if (fetchError) {
    console.error('Error fetching existing products:', fetchError.message)
    throw fetchError
  }

  const existingLinks = new Set(existingProducts?.map((p: { link: string | null }) => p.link) || [])
  const existingSKUs = new Set(existingProducts?.map((p: { sku: string | null }) => p.sku) || [])
  console.log(`Found ${existingLinks.size} existing links and ${existingSKUs.size} existing SKUs in Supabase`)

  // Filter for new products (not by link and not by SKU)
  const newProducts = products.filter((p) => {
    const sku = p.url ? p.url.split('/').pop()?.split('?')[0] ?? null : null
    return !existingLinks.has(p.url) && !existingSKUs.has(sku)
  })
  console.log(`${newProducts.length} new products to insert (${products.length - newProducts.length} duplicates by link or SKU)`)

  if (newProducts.length === 0) {
    console.log('No new products to insert.')
    return
  }

  const totalBatches = Math.ceil(newProducts.length / BATCH_SIZE)
  let insertedTotal = 0
  let errorCount = 0
  let skippedInBatch = 0

  for (let i = 0; i < newProducts.length; i += BATCH_SIZE) {
    const batch = newProducts.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    const skusInBatch = new Set<string>()
    const rows: ProductToInsert[] = batch
      .map((p, idx) => {
        // Extract SKU from URL (last hyphen-separated segment)
        // e.g. "https://www.central.co.th/en/oversized-striped-linen-shirt-blue-grmkppr000189508" → "grmkppr000189508"
        let extractedSku = p.url ? p.url.split('/').pop()?.split('-').pop()?.split('?')[0] ?? null : null

        // Skip if SKU already exists in database (double-check)
        if (extractedSku && existingSKUs.has(extractedSku)) {
          skippedInBatch++
          return null
        }

        // If SKU is already in this batch, make it unique by appending a hash suffix
        if (extractedSku && skusInBatch.has(extractedSku)) {
          // Create a unique variant by appending hash of product name
          const hash = createHash('md5')
            .update(p.product_name + p.color + (idx * 1000).toString())
            .digest('hex')
            .substring(0, 8)
          extractedSku = `${extractedSku}-${hash}`
        }

        if (extractedSku) {
          skusInBatch.add(extractedSku)
          existingSKUs.add(extractedSku)
        }

        // Compute occasion scores
        const scores = computeOccasionScores(p)

        return {
          sku: extractedSku,
          product_name: p.product_name,
          brand: p.brand || null,
          category: p.category,
          price: p.price || null,
          original_price: p.original_price || null,
          image_url: p.image_url || null,
          link: p.url || null,
          product_description: `${p.material ? p.material + ' ' : ''}${p.color || ''}`.trim() || null,
          availability: 'In Stock',
          occasion_weekend_social: scores.occasion_weekend_social,
          occasion_date_night: scores.occasion_date_night,
          occasion_everyday_casual: scores.occasion_everyday_casual,
          primary_occasion: scores.primary_occasion,
          embedding: null,
        }
      })
      .filter((row): row is ProductToInsert => row !== null)

    if (rows.length === 0) {
      console.log(`Skipped batch ${batchNum}/${totalBatches} (all SKUs were duplicates)`)
      continue
    }

    // Insert rows directly (already filtered for new products)
    const { error } = await supabase.from('products').insert(rows)

    if (error) {
      console.error(`Error inserting batch ${batchNum}/${totalBatches}:`, error.message)
      errorCount++
    } else {
      insertedTotal += rows.length
      console.log(`Inserted batch ${batchNum}/${totalBatches} (${insertedTotal}/${newProducts.length - skippedInBatch} total)`)
    }

    // Update the SKU set to avoid duplicate SKU errors in subsequent batches
    rows.forEach((row) => {
      if (row.sku) {
        existingSKUs.add(row.sku)
      }
    })
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Total products in master JSON: ${products.length}`)
  console.log(`Duplicates skipped (by link): ${Array.from(existingLinks).length}`)
  console.log(`Duplicates skipped (by SKU): ${skippedInBatch}`)
  console.log(`New products identified: ${newProducts.length}`)
  console.log(`Successfully inserted: ${insertedTotal}`)
  console.log(`Batches with errors: ${errorCount}`)
  console.log('Done!')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
