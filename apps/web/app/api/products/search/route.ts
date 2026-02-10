import { NextRequest, NextResponse } from 'next/server'
import { computeOccasionScores } from '@/lib/supabase/occasion-scoring'
import fs from 'fs'
import path from 'path'

interface SearchFilters {
  occasion?: string
  priceRange?: [number, number]
  brand?: string
}

interface ProductMasterEntry {
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

function loadJsonProducts(): ProductMasterEntry[] {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'products', 'product_master.json'),
    path.join(process.cwd(), '..', '..', 'data', 'products', 'product_master.json'),
    path.join(process.cwd(), '..', 'data', 'products', 'product_master.json'),
  ]

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content)
      if (Array.isArray(data)) return data
    }
  }

  return []
}

function jsonFallbackSearch(query: string | undefined, filters: SearchFilters | undefined) {
  const raw = loadJsonProducts()

  let results = raw.filter(
    (p) => p.product_name && p.image_url
  )

  // Apply text query filter
  if (query) {
    const lowerQuery = query.toLowerCase()
    results = results.filter(
      (p) =>
        p.product_name.toLowerCase().includes(lowerQuery) ||
        (p.brand && p.brand.toLowerCase().includes(lowerQuery)) ||
        (p.product_description && p.product_description.toLowerCase().includes(lowerQuery))
    )
  }

  // Apply brand filter
  if (filters?.brand) {
    const lowerBrand = filters.brand.toLowerCase()
    results = results.filter(
      (p) => p.brand && p.brand.toLowerCase().includes(lowerBrand)
    )
  }

  // Apply price range filter
  if (filters?.priceRange) {
    const [min, max] = filters.priceRange
    results = results.filter((p) => {
      const price = parseFloat(p.price)
      return !isNaN(price) && price >= min && price <= max
    })
  }

  // Apply occasion filter via scoring
  if (filters?.occasion) {
    results = results.filter((p) => {
      const scores = computeOccasionScores({
        product_name: p.product_name,
        brand: p.brand || null,
        price: p.price ? parseFloat(p.price) : null,
      })
      return scores.primary_occasion === filters.occasion
    })
  }

  const products = results.slice(0, 20).map((p) => {
    const scores = computeOccasionScores({
      product_name: p.product_name,
      brand: p.brand || null,
      price: p.price ? parseFloat(p.price) : null,
    })

    return {
      id: p.link.split('/').pop() ?? p.product_name.slice(0, 20),
      sku: p.link.split('/').pop() ?? null,
      product_name: p.product_name,
      brand: p.brand || null,
      category: p.category,
      price: p.price ? parseFloat(p.price) : null,
      original_price: p.original_price ? parseFloat(p.original_price) : null,
      image_url: p.image_url,
      link: p.link,
      availability: p.availability,
      product_description: p.product_description || null,
      occasion_weekend_social: scores.weekend_social,
      occasion_date_night: scores.date_night,
      occasion_everyday_casual: scores.everyday_casual,
      primary_occasion: scores.primary_occasion,
    }
  })

  return NextResponse.json({
    products,
    total: products.length,
    source: 'json',
  })
}

// POST /api/products/search
// Body: { query: string, filters?: { occasion?: string, priceRange?: [number, number], brand?: string } }
export async function POST(request: NextRequest) {
  let query: string | undefined
  let filters: SearchFilters | undefined

  try {
    const body = await request.json()
    query = body.query
    filters = body.filters
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    const supabaseEnabled =
      process.env.SUPABASE_PRODUCTS_ENABLED === 'true'

    if (!supabaseEnabled) {
      return jsonFallbackSearch(query, filters)
    }

    // Use Supabase direct query with filters
    const { createServerClient } = await import('@/lib/supabase/client')

    let supabase
    try {
      supabase = createServerClient()
    } catch {
      // Missing env vars - fall back to JSON
      return jsonFallbackSearch(query, filters)
    }

    let queryBuilder = supabase.from('products').select('*')

    if (filters?.occasion) {
      queryBuilder = queryBuilder.eq('primary_occasion', filters.occasion)
    }
    if (filters?.priceRange) {
      queryBuilder = queryBuilder
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
    }
    if (filters?.brand) {
      queryBuilder = queryBuilder.ilike('brand', `%${filters.brand}%`)
    }
    if (query) {
      queryBuilder = queryBuilder.ilike('product_name', `%${query}%`)
    }

    const { data, error } = await queryBuilder.limit(20)
    if (error) throw error

    return NextResponse.json({
      products: data ?? [],
      total: data?.length ?? 0,
      source: 'supabase',
    })
  } catch (error) {
    console.error('[products/search] Supabase error, falling back to JSON:', error)
    return jsonFallbackSearch(query, filters)
  }
}
