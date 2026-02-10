import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createServerClient } from '../client'
import { computeOccasionScores } from '../occasion-scoring'

// Load .env and .env.local from apps/web/
config({ path: resolve(__dirname, '../../../.env.local') })
config({ path: resolve(__dirname, '../../../.env') })

interface RawProduct {
  category: string
  price: string
  original_price: string
  brand: string
  product_name: string
  link: string
  image_url: string
  availability: string
  product_description: string
  thaiContext?: {
    thaiClimateRating?: number
    templeAppropriate?: boolean
    acFriendly?: boolean
  }
}

const BATCH_SIZE = 100

async function main() {
  const productPath = resolve(__dirname, '../../../../../data/products/product_master_v1.json')
  console.log(`Reading products from: ${productPath}`)

  const raw: RawProduct[] = JSON.parse(readFileSync(productPath, 'utf-8'))
  const womenProducts = raw.filter((p) => p.category === 'women_clothing')
  console.log(`Found ${raw.length} total products, ${womenProducts.length} women_clothing`)

  const supabase = createServerClient()
  const totalBatches = Math.ceil(womenProducts.length / BATCH_SIZE)
  let insertedTotal = 0

  for (let i = 0; i < womenProducts.length; i += BATCH_SIZE) {
    const batch = womenProducts.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    const rows = batch.map((p) => {
      const scores = computeOccasionScores({
        product_name: p.product_name,
        brand: p.brand,
        price: p.price,
      })

      // Extract SKU from the last segment of the Central URL
      // e.g. "https://www.central.co.th/en/dress-women-wmpodrsnfa20841-blue-grmkppr000174420" → "grmkppr000174420"
      const sku = p.link ? p.link.split('/').pop()?.split('?')[0] ?? null : null

      return {
        sku,
        product_name: p.product_name,
        brand: p.brand || null,
        category: p.category,
        price: p.price ? parseFloat(p.price) : null,
        original_price: p.original_price ? parseFloat(p.original_price) : null,
        image_url: p.image_url || null,
        link: p.link || null,
        availability: p.availability || 'In Stock',
        product_description: p.product_description || null,
        occasion_weekend_social: scores.weekend_social,
        occasion_date_night: scores.date_night,
        occasion_everyday_casual: scores.everyday_casual,
        primary_occasion: scores.primary_occasion,
        thai_climate_rating: p.thaiContext?.thaiClimateRating ?? null,
        temple_appropriate: p.thaiContext?.templeAppropriate ?? false,
        ac_friendly: p.thaiContext?.acFriendly ?? true,
        embedding: null,
      }
    })

    const { error } = await supabase.from('products').insert(rows)
    if (error) {
      console.error(`Error inserting batch ${batchNum}/${totalBatches}:`, error.message)
      throw error
    }

    insertedTotal += batch.length
    console.log(`Inserted batch ${batchNum}/${totalBatches} (${insertedTotal} products total)`)
  }

  console.log(`\nDone! Inserted ${insertedTotal} products into Supabase.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
