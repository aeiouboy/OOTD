import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fs to control product loading
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() =>
      JSON.stringify([
        {
          category: 'women_clothing',
          price: '2500',
          original_price: '3000',
          brand: 'Journal',
          product_name: 'Floral Blouse Summer',
          link: 'https://central.co.th/product/abc123',
          image_url: 'https://cdn.central.co.th/img.jpg',
          availability: 'in_stock',
          product_description: 'A pretty floral blouse',
        },
        {
          category: 'women_clothing',
          price: '8000',
          original_price: '9000',
          brand: 'Simkhai',
          product_name: 'Midi Dress Black Elegant',
          link: 'https://central.co.th/product/def456',
          image_url: 'https://cdn.central.co.th/dress.jpg',
          availability: 'in_stock',
          product_description: 'Elegant midi dress',
        },
        {
          category: 'men_clothing',
          price: '1000',
          original_price: '1200',
          brand: 'Giordano',
          product_name: 'Basic Cotton Tee',
          link: 'https://central.co.th/product/ghi789',
          image_url: 'https://cdn.central.co.th/tee.jpg',
          availability: 'in_stock',
          product_description: 'A basic cotton tee',
        },
      ])
    ),
  },
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => '[]'),
}))

// Mock Supabase client to avoid env var requirements
vi.mock('@/lib/supabase/client', () => ({
  createServerClient: vi.fn(() => {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }),
}))

// Mock Supabase products for POST tests
const mockGetProductsByOccasion = vi.fn()
const mockGetAllProducts = vi.fn()
const mockSearchProductsBySimilarity = vi.fn()
vi.mock('@/lib/supabase/products', () => ({
  getProductsByOccasion: (...args: unknown[]) => mockGetProductsByOccasion(...args),
  getAllProducts: (...args: unknown[]) => mockGetAllProducts(...args),
  searchProductsBySimilarity: (...args: unknown[]) => mockSearchProductsBySimilarity(...args),
}))

// Mock embeddings for POST semantic search tests
const mockGenerateEmbedding = vi.fn()
vi.mock('@/lib/rag/embeddings', () => ({
  generateEmbedding: (...args: unknown[]) => mockGenerateEmbedding(...args),
}))

function createMockNextRequest(url: string) {
  const parsed = new URL(url)
  return {
    nextUrl: parsed,
    url,
    json: async () => ({}),
  } as any
}

describe('/api/suggestions response schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure Supabase is disabled so fallback JSON path is used
    process.env.SUPABASE_PRODUCTS_ENABLED = 'false'
  })

  it('GET returns correct response schema with products array', async () => {
    const { GET } = await import('@/app/api/suggestions/route')

    const request = createMockNextRequest('http://localhost:3000/api/suggestions?occasion=weekend_social&limit=10')
    const response = await GET(request)
    const body = await response.json()

    // Verify top-level schema
    expect(body).toHaveProperty('products')
    expect(body).toHaveProperty('occasion')
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('source')
    expect(Array.isArray(body.products)).toBe(true)
    expect(typeof body.total).toBe('number')
    expect(body.source).toBe('json')
  })

  it('GET returns products with required fields', async () => {
    const { GET } = await import('@/app/api/suggestions/route')

    const request = createMockNextRequest('http://localhost:3000/api/suggestions?limit=10')
    const response = await GET(request)
    const body = await response.json()

    if (body.products.length > 0) {
      const product = body.products[0]
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('product_name')
      expect(product).toHaveProperty('image_url')
      expect(product).toHaveProperty('primary_occasion')
      expect(product).toHaveProperty('occasion_weekend_social')
      expect(product).toHaveProperty('occasion_date_night')
      expect(product).toHaveProperty('occasion_everyday_casual')
    }
  })

  it('GET with occasion filter returns matching occasion', async () => {
    const { GET } = await import('@/app/api/suggestions/route')

    const request = createMockNextRequest('http://localhost:3000/api/suggestions?occasion=date_night')
    const response = await GET(request)
    const body = await response.json()

    expect(body.occasion).toBe('date_night')
    for (const product of body.products) {
      expect(product.primary_occasion).toBe('date_night')
    }
  })

  it('GET without occasion returns "all"', async () => {
    const { GET } = await import('@/app/api/suggestions/route')

    const request = createMockNextRequest('http://localhost:3000/api/suggestions')
    const response = await GET(request)
    const body = await response.json()

    expect(body.occasion).toBe('all')
  })

  it('GET total matches products array length', async () => {
    const { GET } = await import('@/app/api/suggestions/route')

    const request = createMockNextRequest('http://localhost:3000/api/suggestions?limit=5')
    const response = await GET(request)
    const body = await response.json()

    expect(body.total).toBe(body.products.length)
  })

  it('GET filters to women_clothing only (MVP)', async () => {
    const { GET } = await import('@/app/api/suggestions/route')

    const request = createMockNextRequest('http://localhost:3000/api/suggestions')
    const response = await GET(request)
    const body = await response.json()

    for (const product of body.products) {
      expect(product.category).toBe('women_clothing')
    }
  })

  it('occasion scores are numbers between 0 and 1', async () => {
    const { GET } = await import('@/app/api/suggestions/route')

    const request = createMockNextRequest('http://localhost:3000/api/suggestions')
    const response = await GET(request)
    const body = await response.json()

    for (const product of body.products) {
      expect(product.occasion_weekend_social).toBeGreaterThanOrEqual(0)
      expect(product.occasion_weekend_social).toBeLessThanOrEqual(1)
      expect(product.occasion_date_night).toBeGreaterThanOrEqual(0)
      expect(product.occasion_date_night).toBeLessThanOrEqual(1)
      expect(product.occasion_everyday_casual).toBeGreaterThanOrEqual(0)
      expect(product.occasion_everyday_casual).toBeLessThanOrEqual(1)
    }
  })
})

// Helper to build a mock POST NextRequest with a JSON body
function createMockPostRequest(body: Record<string, unknown>) {
  const url = new URL('http://localhost:3000/api/suggestions')
  return {
    nextUrl: url,
    url: url.toString(),
    json: async () => body,
  } as any
}

const mockSupabaseProducts = [
  {
    id: 'sup-1',
    sku: 'SUP-001',
    product_name: 'Weekend Blouse',
    brand: 'COS',
    price: 2500,
    original_price: 3000,
    image_url: 'https://cdn.example.com/blouse.jpg',
    link: 'https://example.com/blouse',
    availability: 'in_stock',
    product_description: 'A lovely weekend blouse',
    primary_occasion: 'weekend_social',
  },
]

describe('POST /api/suggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: Supabase enabled for POST tests
    process.env.SUPABASE_PRODUCTS_ENABLED = 'true'
  })

  it('POST with occasion filter returns filtered products', async () => {
    mockGetProductsByOccasion.mockResolvedValue(mockSupabaseProducts)

    const { POST } = await import('@/app/api/suggestions/route')
    const request = createMockPostRequest({ occasion: 'weekend_social' })
    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.products).toEqual(mockSupabaseProducts)
    expect(body.occasion).toBe('weekend_social')
    expect(body.source).toBe('supabase')
    expect(mockGetProductsByOccasion).toHaveBeenCalledWith('weekend_social', 20)
  })

  it('POST with invalid occasion returns 400', async () => {
    const { POST } = await import('@/app/api/suggestions/route')
    const request = createMockPostRequest({ occasion: 'beach_party' })
    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/invalid occasion/i)
  })

  it('POST with query triggers semantic search path', async () => {
    const fakeVector = Array.from({ length: 10 }, (_, i) => i * 0.1)
    mockGenerateEmbedding.mockResolvedValue({ vector: fakeVector })
    mockSearchProductsBySimilarity.mockResolvedValue(mockSupabaseProducts)

    const { POST } = await import('@/app/api/suggestions/route')
    const request = createMockPostRequest({
      query: 'floral summer dress',
      occasion: 'weekend_social',
    })
    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.source).toBe('supabase_semantic')
    expect(body.query).toBe('floral summer dress')
    expect(mockGenerateEmbedding).toHaveBeenCalledWith('floral summer dress')
    expect(mockSearchProductsBySimilarity).toHaveBeenCalledWith(
      fakeVector,
      'weekend_social',
      20
    )
  })

  it('POST with Supabase disabled falls back to JSON', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'false'

    const { POST } = await import('@/app/api/suggestions/route')
    const request = createMockPostRequest({ occasion: 'weekend_social' })
    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.source).toBe('json')
    // Supabase functions should not be called
    expect(mockGetProductsByOccasion).not.toHaveBeenCalled()
    expect(mockSearchProductsBySimilarity).not.toHaveBeenCalled()
  })

  it('POST with query but embedding failure falls back to occasion-only filtering', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('Embedding API unavailable'))
    mockGetProductsByOccasion.mockResolvedValue(mockSupabaseProducts)

    const { POST } = await import('@/app/api/suggestions/route')
    const request = createMockPostRequest({
      query: 'summer outfit',
      occasion: 'weekend_social',
    })
    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    // Falls back to occasion-only filtering (source: 'supabase', not 'supabase_semantic')
    expect(body.source).toBe('supabase')
    expect(mockGetProductsByOccasion).toHaveBeenCalledWith('weekend_social', 20)
  })
})
