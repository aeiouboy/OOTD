import { NextRequest, NextResponse } from 'next/server'
import { getProductsByOccasion, getAllProducts, searchProductsBySimilarity, getProductCount } from '@/lib/supabase/products'
import { computeOccasionScores } from '@/lib/supabase/occasion-scoring'
import { generateEmbedding } from '@/lib/rag/embeddings'
import type { OccasionType as EnumOccasionType } from '@/lib/types/enums'
import fs from 'fs'
import path from 'path'

const VALID_OCCASIONS: EnumOccasionType[] = [
  'work', 'chill', 'wedding', 'sport', 'travel', 'date', 'dinner', 'cafe', 'party',
]

// Direct DB primary_occasion values
const VALID_PRIMARY_OCCASIONS = ['everyday_casual', 'date_night', 'weekend_social']

// Map OccasionType → DB primary_occasion value
const OCCASION_TO_PRIMARY: Record<string, string> = {
  work: 'weekend_social',
  chill: 'everyday_casual',
  wedding: 'date_night',
  sport: 'everyday_casual',
  travel: 'everyday_casual',
  date: 'date_night',
  dinner: 'date_night',
  cafe: 'everyday_casual',
  party: 'date_night',
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

function fallbackJsonResponse(
  occasion: string | null,
  limit: number,
  page: number,
  offset: number,
  gender?: string,
  priceMin?: number,
  priceMax?: number,
) {
  const raw = loadJsonProducts()

  // Filter by gender category
  let filtered = raw.filter((p) => p.product_name && p.image_url)
  if (gender === 'women') {
    filtered = filtered.filter((p) => p.category === 'women_clothing')
  } else if (gender === 'men') {
    filtered = filtered.filter((p) => p.category === 'men_clothing')
  }

  // Score each product
  const scored = filtered.map((p) => {
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

  // Apply price filter
  let result = scored
  if (priceMin != null) {
    result = result.filter((p) => (p.price ?? 0) >= priceMin)
  }
  if (priceMax != null) {
    result = result.filter((p) => (p.price ?? Infinity) <= priceMax)
  }

  // Filter by occasion if provided
  if (occasion) {
    result = result.filter((p) => p.primary_occasion === occasion)
  }

  const total = result.length
  const products = result.slice(offset, offset + limit)

  return NextResponse.json({
    data: products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    occasion: occasion ?? 'all',
    source: 'json',
  })
}

// GET /api/suggestions?occasion=work&limit=20&page=1&gender=women&price_min=500&price_max=5000
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const occasion = searchParams.get('occasion') as EnumOccasionType | null
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)), 100)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const offset = (page - 1) * limit
  const gender = searchParams.get('gender') || undefined
  const priceMinStr = searchParams.get('price_min')
  const priceMaxStr = searchParams.get('price_max')
  const priceMin = priceMinStr ? parseInt(priceMinStr, 10) : undefined
  const priceMax = priceMaxStr ? parseInt(priceMaxStr, 10) : undefined

  try {
    const supabaseEnabled =
      process.env.SUPABASE_PRODUCTS_ENABLED === 'true'

    if (!supabaseEnabled) {
      return fallbackJsonResponse(occasion, limit, page, offset, gender, priceMin, priceMax)
    }

    const allValid = [...VALID_OCCASIONS, ...VALID_PRIMARY_OCCASIONS]
    if (occasion && !allValid.includes(occasion)) {
      return NextResponse.json(
        {
          error:
            'Invalid occasion. Must be one of: ' + allValid.join(', '),
        },
        { status: 400 }
      )
    }

    // Build Supabase query with filters
    const { createServerClient } = await import('@/lib/supabase/client')
    const supabase = createServerClient()

    let query = supabase.from('products').select('*', { count: 'exact' })

    // Occasion filter: map to DB primary_occasion value
    if (occasion) {
      // If it's already a DB primary_occasion value, use directly; otherwise map
      const primaryOccasion = VALID_PRIMARY_OCCASIONS.includes(occasion)
        ? occasion
        : OCCASION_TO_PRIMARY[occasion] ?? occasion
      query = query.eq('primary_occasion', primaryOccasion)
    }

    // Gender filter
    if (gender === 'women') {
      query = query.eq('category', 'women_clothing')
    } else if (gender === 'men') {
      query = query.eq('category', 'men_clothing')
    }

    // Price filters
    if (priceMin != null) {
      query = query.gte('price', priceMin)
    }
    if (priceMax != null) {
      query = query.lte('price', priceMax)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    const total = count ?? 0

    return NextResponse.json({
      data: data ?? [],
      total,
      page,
      totalPages: Math.ceil(total / limit),
      occasion: occasion ?? 'all',
      source: 'supabase',
    })
  } catch (error) {
    console.error('[suggestions] Supabase error, falling back to JSON:', error)
    return fallbackJsonResponse(occasion, limit, page, offset, gender, priceMin, priceMax)
  }
}

// POST /api/suggestions - semantic search via embeddings + occasion filter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, occasion, limit: bodyLimit } = body as {
      query?: string
      occasion?: EnumOccasionType
      limit?: number
    }
    const limit = bodyLimit ?? 20

    if (occasion && !VALID_OCCASIONS.includes(occasion)) {
      return NextResponse.json(
        {
          error:
            'Invalid occasion. Must be one of: ' + VALID_OCCASIONS.join(', '),
        },
        { status: 400 }
      )
    }

    const supabaseEnabled =
      process.env.SUPABASE_PRODUCTS_ENABLED === 'true'

    if (!supabaseEnabled) {
      return fallbackJsonResponse(occasion ?? null, limit, 1, 0)
    }

    // Semantic search when query is provided
    if (query) {
      try {
        const embeddingResult = await generateEmbedding(query)
        const products = await searchProductsBySimilarity(
          embeddingResult.vector,
          occasion ?? undefined,
          limit,
          undefined  // gender filter not available in suggestions API
        )

        return NextResponse.json({
          products,
          occasion: occasion ?? 'all',
          query,
          total: products.length,
          source: 'supabase_semantic',
        })
      } catch (embeddingError) {
        console.error('[suggestions POST] Embedding search failed, falling back to occasion filter:', embeddingError)
        // Fall through to occasion-only filtering
      }
    }

    // Occasion-only filtering (no query or embedding failed)
    const products = occasion
      ? await getProductsByOccasion(occasion as any, limit)
      : await getAllProducts(limit)

    return NextResponse.json({
      products,
      occasion: occasion ?? 'all',
      total: products.length,
      source: 'supabase',
    })
  } catch (error) {
    console.error('[suggestions POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to search suggestions' },
      { status: 500 }
    )
  }
}
