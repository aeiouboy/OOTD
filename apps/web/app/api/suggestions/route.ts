import { NextRequest, NextResponse } from 'next/server'
import { getProductsByOccasion, getAllProducts, searchProductsBySimilarity, getProductCount } from '@/lib/supabase/products'
import { computeOccasionScores } from '@/lib/supabase/occasion-scoring'
import { generateEmbedding } from '@/lib/rag/embeddings'
import type { OccasionType } from '@/lib/supabase/types'
import fs from 'fs'
import path from 'path'

const VALID_OCCASIONS: OccasionType[] = [
  'weekend_social',
  'date_night',
  'everyday_casual',
]

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

function fallbackJsonResponse(occasion: OccasionType | null, limit: number, page: number, offset: number) {
  const raw = loadJsonProducts()

  // Filter to women's clothing (MVP focus)
  const women = raw.filter(
    (p) => p.category === 'women_clothing' && p.product_name && p.image_url
  )

  // Score each product
  const scored = women.map((p) => {
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

  // Filter by occasion if provided
  let filtered = scored
  if (occasion) {
    filtered = scored.filter((p) => p.primary_occasion === occasion)
    const occasionKey = `occasion_${occasion}` as const
    filtered.sort(
      (a, b) =>
        (b[occasionKey as keyof typeof b] as number) -
        (a[occasionKey as keyof typeof a] as number)
    )
  }

  const total = filtered.length
  const products = filtered.slice(offset, offset + limit)

  return NextResponse.json({
    data: products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    occasion: occasion ?? 'all',
    source: 'json',
  })
}

// GET /api/suggestions?occasion=weekend_social&limit=20&page=1
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const occasion = searchParams.get('occasion') as OccasionType | null
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)), 100)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const offset = (page - 1) * limit

  try {
    const supabaseEnabled =
      process.env.SUPABASE_PRODUCTS_ENABLED === 'true'

    if (!supabaseEnabled) {
      return fallbackJsonResponse(occasion, limit, page, offset)
    }

    if (occasion && !VALID_OCCASIONS.includes(occasion)) {
      return NextResponse.json(
        {
          error:
            'Invalid occasion. Must be one of: weekend_social, date_night, everyday_casual',
        },
        { status: 400 }
      )
    }

    const total = await getProductCount(occasion ?? undefined)

    const products = occasion
      ? await getProductsByOccasion(occasion, limit, offset)
      : await getAllProducts(limit, offset)

    return NextResponse.json({
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      occasion: occasion ?? 'all',
      source: 'supabase',
    })
  } catch (error) {
    console.error('[suggestions] Supabase error, falling back to JSON:', error)
    return fallbackJsonResponse(occasion, limit, page, offset)
  }
}

// POST /api/suggestions - semantic search via embeddings + occasion filter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, occasion, limit: bodyLimit } = body as {
      query?: string
      occasion?: OccasionType
      limit?: number
    }
    const limit = bodyLimit ?? 20

    if (occasion && !VALID_OCCASIONS.includes(occasion)) {
      return NextResponse.json(
        {
          error:
            'Invalid occasion. Must be one of: weekend_social, date_night, everyday_casual',
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
          limit
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
      ? await getProductsByOccasion(occasion, limit)
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
