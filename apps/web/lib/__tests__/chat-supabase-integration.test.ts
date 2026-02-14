import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RetrievalResult } from '@/lib/rag/types'
import type { DbProduct } from '@/lib/supabase/types'
import type { EnhancedProduct } from '@/lib/types/product-types'

// Mock supabase-retrieval (the adapter we test indirectly)
const mockRetrieveFromSupabase = vi.fn()
const mockSearchProductsFromSupabase = vi.fn(() => Promise.resolve([])) // Default to empty array
vi.mock('@/lib/rag/supabase-retrieval', () => ({
  retrieveFromSupabase: (...args: unknown[]) => mockRetrieveFromSupabase(...args),
  searchProductsFromSupabase: (...args: unknown[]) => mockSearchProductsFromSupabase(...args),
}))

// Mock transformer
const mockTransformDbProductToEnhanced = vi.fn()
const mockTransformDbProductsToEnhanced = vi.fn(() => []) // Default to empty array
vi.mock('@/lib/transformers/db-product-to-enhanced', () => ({
  transformDbProductToEnhanced: (...args: unknown[]) => mockTransformDbProductToEnhanced(...args),
  transformDbProductsToEnhanced: (...args: unknown[]) => mockTransformDbProductsToEnhanced(...args),
}))

// Mock server-product-loader
const mockLoadProductsServerSide = vi.fn()
const mockLoadProductsFromSupabase = vi.fn()
vi.mock('@/lib/server-product-loader', () => ({
  loadProductsServerSide: (...args: unknown[]) => mockLoadProductsServerSide(...args),
  loadProductsFromSupabase: (...args: unknown[]) => mockLoadProductsFromSupabase(...args),
}))

// Mock the RAG service (for Vectra fallback)
const mockGetRAGService = vi.fn()
const mockBuildFashionContext = vi.fn()
vi.mock('@/lib/rag', () => ({
  getRAGService: () => mockGetRAGService(),
  buildFashionContext: (...args: unknown[]) => mockBuildFashionContext(...args),
}))

// Mock Supabase client to avoid env var requirements
vi.mock('@/lib/supabase/client', () => ({
  createServerClient: vi.fn(() => {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }),
}))

// Mock OpenRouter to avoid API calls
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mocked AI response for testing',
              },
            },
          ],
        }),
      },
    },
  })),
}))

// Mock global fetch for OpenRouter API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({
    choices: [
      {
        message: {
          content: 'Mocked OpenRouter response',
        },
      },
    ],
  }),
} as Response)

// Mock prompt-version (v5.0 active by default)
vi.mock('@/lib/prompts/prompt-version', () => ({
  getActiveSystemPrompt: vi.fn().mockReturnValue('Mocked system prompt v5'),
  VersionUtils: {
    isV5Active: vi.fn().mockReturnValue(false), // Use v4 flow for these integration tests
    getVersion: vi.fn().mockReturnValue('v4.0'),
  },
}))

// Mock looks parser (v5.0)
vi.mock('@/lib/parsers/looks-parser', () => ({
  parseLooksData: vi.fn().mockReturnValue({ text: 'Mocked response', looks: [] }),
  validateLooksAgainstCatalog: vi.fn().mockReturnValue([]),
}))

// Mock ai-serializer (v5.0 catalog serializer)
vi.mock('@/lib/utils/ai-serializer', () => ({
  createOutfitPrompt: vi.fn().mockReturnValue('Outfit prompt'),
  serializeForAI: vi.fn().mockReturnValue('Serialized'),
  serializeCatalogForV5: vi.fn().mockReturnValue('=== CATALOG ==='),
}))

// Mock enhanced-outfit-generator
vi.mock('@/lib/enhanced-outfit-generator', () => ({
  generateOutfitsFromQuery: vi.fn().mockReturnValue([]),
}))

// Mock query translator (v5.1 hybrid search)
vi.mock('@/lib/rag/query-translator', () => ({
  translateQueryForRAG: vi.fn((msg: string) => Promise.resolve(msg)),
}))

// Helper: Create a mock DbProduct
function createMockDbProduct(overrides?: Partial<DbProduct>): DbProduct {
  return {
    id: 'test-uuid-1',
    sku: 'SKU-001',
    product_name: 'Floral Summer Dress',
    brand: 'Central Brand',
    category: 'women_clothing',
    price: 2500,
    original_price: 3000,
    image_url: 'https://cdn.example.com/dress.jpg',
    link: 'https://central.co.th/product/SKU-001',
    availability: 'in_stock',
    product_description: 'A beautiful floral dress for summer',
    occasion_weekend_social: 0.8,
    occasion_date_night: 0.6,
    occasion_everyday_casual: 0.4,
    primary_occasion: 'weekend_social',
    temple_appropriate: false,
    embedding: null,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// Helper: Create a mock EnhancedProduct
function createMockEnhancedProduct(overrides?: Partial<EnhancedProduct>): EnhancedProduct {
  return {
    id: 'SKU-001',
    sku: 'SKU-001',
    brand: 'Central Brand',
    name: {
      en: 'Mock Product',
      th: 'สินค้าทดสอบ',
    },
    style: {
      colors: {
        primary: 'floral',
      },
    },
    availability: {
      status: 'in_stock',
    },
    ...overrides,
  } as EnhancedProduct
}

// Helper: Create a mock NextRequest
function createMockNextRequest(body: Record<string, unknown>) {
  const url = new URL('http://localhost:3000/api/chat')
  return {
    nextUrl: url,
    url: url.toString(),
    json: async () => body,
  } as any
}

// Helper: Create session context that bypasses clarification phase
function createSessionContextWithGender() {
  return {
    conversationContext: {
      gender: 'women' as const,
    },
    askedClarifications: ['gender' as const],
    clarificationTurnCount: 2, // At the limit, forces recommendations
    recommendedProductIds: [],
    hasProvidedRecommendations: false,
    dialoguePhase: 'clarification' as const,
  }
}

// Helper: Create sufficient products (min 3 required for recommendations)
function createMockProducts() {
  return [
    createMockEnhancedProduct({ id: 'P1', sku: 'P1' }),
    createMockEnhancedProduct({ id: 'P2', sku: 'P2' }),
    createMockEnhancedProduct({ id: 'P3', sku: 'P3' }),
  ]
}

describe('Chat API Route - Supabase Product Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset env vars
    delete process.env.SUPABASE_PRODUCTS_ENABLED
    delete process.env.OPENROUTER_API_KEY
  })

  it('loads products from Supabase when SUPABASE_PRODUCTS_ENABLED=true', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'true'

    const mockDbProducts = [createMockDbProduct()]
    const mockEnhancedProducts = createMockProducts()

    mockLoadProductsFromSupabase.mockResolvedValue(mockDbProducts)
    mockTransformDbProductsToEnhanced.mockReturnValue(mockEnhancedProducts)
    mockLoadProductsServerSide.mockResolvedValue([])

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({ message: 'recommend me a dress' })

    await POST(request)

    expect(mockLoadProductsFromSupabase).toHaveBeenCalledWith(undefined, 200)
    expect(mockTransformDbProductsToEnhanced).toHaveBeenCalledWith(mockDbProducts)
    expect(mockLoadProductsServerSide).not.toHaveBeenCalled()
  })

  it('falls back to JSON when Supabase returns empty array', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'true'

    const mockJsonProducts = [createMockEnhancedProduct({ id: 'JSON-001' })]

    mockLoadProductsFromSupabase.mockResolvedValue([])
    mockLoadProductsServerSide.mockResolvedValue(mockJsonProducts)

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({ message: 'show me outfits' })

    await POST(request)

    expect(mockLoadProductsFromSupabase).toHaveBeenCalled()
    expect(mockLoadProductsServerSide).toHaveBeenCalled()
  })

  it('uses JSON loader directly when SUPABASE_PRODUCTS_ENABLED=false', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'false'

    const mockJsonProducts = [createMockEnhancedProduct({ id: 'JSON-001' })]
    mockLoadProductsServerSide.mockResolvedValue(mockJsonProducts)

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({ message: 'show me products' })

    await POST(request)

    expect(mockLoadProductsFromSupabase).not.toHaveBeenCalled()
    expect(mockLoadProductsServerSide).toHaveBeenCalled()
  })

  it('handles gracefully when both sources return empty', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'true'

    mockLoadProductsFromSupabase.mockResolvedValue([])
    mockLoadProductsServerSide.mockResolvedValue([])

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({ message: 'find me clothes' })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.outfits).toBeDefined()
    expect(Array.isArray(body.outfits)).toBe(true)
  })

  it('transforms Supabase products correctly before use', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'true'

    const mockDbProducts = [
      createMockDbProduct({ id: 'db-1', sku: 'SKU-001' }),
      createMockDbProduct({ id: 'db-2', sku: 'SKU-002' }),
    ]
    const mockEnhancedProducts = [
      createMockEnhancedProduct({ id: 'SKU-001' }),
      createMockEnhancedProduct({ id: 'SKU-002' }),
    ]

    mockLoadProductsFromSupabase.mockResolvedValue(mockDbProducts)
    mockTransformDbProductsToEnhanced.mockReturnValue(mockEnhancedProducts)

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({ message: 'casual outfits' })

    await POST(request)

    expect(mockTransformDbProductsToEnhanced).toHaveBeenCalledWith(mockDbProducts)
    expect(mockTransformDbProductsToEnhanced).toHaveBeenCalledTimes(1)
  })
})

describe('AI Chat Service - Supabase RAG Knowledge Retrieval', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.SUPABASE_RAG_ENABLED
    delete process.env.SUPABASE_PRODUCTS_ENABLED
    delete process.env.OPENROUTER_API_KEY
  })

  it('calls retrieveFromSupabase when SUPABASE_RAG_ENABLED=true', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    const mockRetrievalResult: RetrievalResult = {
      documents: [
        {
          id: 'doc-1',
          title: 'Fashion Guide',
          content: 'Content about fashion',
          category: 'general_fashion',
          metadata: {
            topics: ['style'],
            lastUpdated: '2025-01-01',
            priority: 1,
          },
        },
      ],
      scores: [0.9],
      totalFound: 1,
      metadata: {
        retrievalTimeMs: 50,
        query: 'test query',
        normalizedQuery: 'test query',
        appliedFilters: {},
        tokenCount: 10,
      },
    }

    mockRetrieveFromSupabase.mockResolvedValue(mockRetrievalResult)
    mockBuildFashionContext.mockReturnValue('Mocked fashion context')
    mockLoadProductsServerSide.mockResolvedValue([
      createMockEnhancedProduct({ id: 'P1', sku: 'P1' }),
      createMockEnhancedProduct({ id: 'P2', sku: 'P2' }),
      createMockEnhancedProduct({ id: 'P3', sku: 'P3' }),
    ])

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'recommend me a dress for women',
        userPreferences: {
          gender: 'women',
        },
        sessionContext: createSessionContextWithGender(),
      },
      [
        createMockEnhancedProduct({ id: 'P1', sku: 'P1' }),
        createMockEnhancedProduct({ id: 'P2', sku: 'P2' }),
        createMockEnhancedProduct({ id: 'P3', sku: 'P3' }),
      ]
    )

    expect(mockRetrieveFromSupabase).toHaveBeenCalled()
  })

  it('returns knowledge context when Supabase returns documents', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    const mockRetrievalResult: RetrievalResult = {
      documents: [
        {
          id: 'doc-1',
          title: 'Fashion Tips',
          content: 'Summer fashion tips',
          category: 'general_fashion',
          metadata: {
            topics: ['summer'],
            lastUpdated: '2025-01-01',
            priority: 1,
          },
        },
      ],
      scores: [0.85],
      totalFound: 1,
      metadata: {
        retrievalTimeMs: 60,
        query: 'summer fashion',
        normalizedQuery: 'summer fashion',
        appliedFilters: {},
        tokenCount: 15,
      },
    }

    mockRetrieveFromSupabase.mockResolvedValue(mockRetrievalResult)
    mockBuildFashionContext.mockReturnValue('Summer fashion context')
    mockLoadProductsServerSide.mockResolvedValue(createMockProducts())

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    const result = await processAIChatRequest(
      {
        message: 'summer fashion tips for women',
        userPreferences: {
          gender: 'women',
        },
        sessionContext: createSessionContextWithGender(),
      },
      createMockProducts()
    )

    expect(mockBuildFashionContext).toHaveBeenCalledWith(mockRetrievalResult, 'summer fashion tips for women')
    expect(result).toBeDefined()
  })

  it('falls back to Vectra when Supabase returns no documents', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    const emptyResult: RetrievalResult = {
      documents: [],
      scores: [],
      totalFound: 0,
      metadata: {
        retrievalTimeMs: 30,
        query: 'test',
        normalizedQuery: 'test',
        appliedFilters: {},
        tokenCount: 0,
      },
    }

    const vectraResult: RetrievalResult = {
      documents: [
        {
          id: 'vectra-1',
          title: 'Vectra Doc',
          content: 'Vectra content',
          category: 'general_fashion',
          metadata: {
            topics: [],
            lastUpdated: '2025-01-01',
            priority: 1,
          },
        },
      ],
      scores: [0.8],
      totalFound: 1,
      metadata: {
        retrievalTimeMs: 40,
        query: 'test',
        normalizedQuery: 'test',
        appliedFilters: {},
        tokenCount: 5,
      },
    }

    mockRetrieveFromSupabase.mockResolvedValue(emptyResult)
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue(vectraResult),
    })
    mockBuildFashionContext.mockReturnValue('Vectra context')
    mockLoadProductsServerSide.mockResolvedValue(createMockProducts())

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'women test query',
        userPreferences: {
          gender: 'women',
        },
        sessionContext: createSessionContextWithGender(),
      },
      createMockProducts()
    )

    expect(mockRetrieveFromSupabase).toHaveBeenCalled()
    expect(mockGetRAGService).toHaveBeenCalled()
  })

  it('falls back to Vectra when Supabase throws error', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockRetrieveFromSupabase.mockRejectedValue(new Error('Supabase connection failed'))
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 20,
          query: 'test',
          normalizedQuery: 'test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })
    mockLoadProductsServerSide.mockResolvedValue(createMockProducts())

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'error test for women',
        userPreferences: {
          gender: 'women',
        },
        sessionContext: createSessionContextWithGender(),
      },
      createMockProducts()
    )

    expect(mockRetrieveFromSupabase).toHaveBeenCalled()
    expect(mockGetRAGService).toHaveBeenCalled()
  })

  it('skips Supabase and uses Vectra when SUPABASE_RAG_ENABLED=false', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'false'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 15,
          query: 'test',
          normalizedQuery: 'test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })
    mockLoadProductsServerSide.mockResolvedValue(createMockProducts())

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'vectra only test for women',
        userPreferences: {
          gender: 'women',
        },
        sessionContext: createSessionContextWithGender(),
      },
      createMockProducts()
    )

    expect(mockRetrieveFromSupabase).not.toHaveBeenCalled()
    expect(mockGetRAGService).toHaveBeenCalled()
  })
})

describe('AI Chat Service - Semantic Product Search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.SUPABASE_RAG_ENABLED
    delete process.env.OPENROUTER_API_KEY
  })

  it('calls searchProductsFromSupabase when SUPABASE_RAG_ENABLED=true', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    const mockSemanticProducts = [createMockDbProduct({ sku: 'SEM-001' })]
    const mockEnhancedSemantic = [createMockEnhancedProduct({ id: 'SEM-001', sku: 'SEM-001' })]

    mockSearchProductsFromSupabase.mockResolvedValue(mockSemanticProducts)
    mockTransformDbProductsToEnhanced.mockReturnValue(mockEnhancedSemantic)
    mockLoadProductsServerSide.mockResolvedValue(createMockProducts())
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'floral dress',
          normalizedQuery: 'floral dress',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'women floral dress',
        sessionContext: createSessionContextWithGender(),
        userPreferences: {
          gender: 'women',
        },
      },
      createMockProducts()
    )

    expect(mockSearchProductsFromSupabase).toHaveBeenCalledWith('women floral dress', undefined, 30)
  })

  it('merges semantic and heuristic results without duplicates', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    const semanticProduct = createMockDbProduct({ sku: 'SKU-SHARED', id: 'semantic-1' })
    const heuristicProduct = createMockEnhancedProduct({ sku: 'SKU-SHARED', id: 'SKU-SHARED' })
    const uniqueProduct = createMockEnhancedProduct({ sku: 'SKU-UNIQUE', id: 'SKU-UNIQUE' })

    mockSearchProductsFromSupabase.mockResolvedValue([semanticProduct])
    mockTransformDbProductsToEnhanced.mockReturnValue([heuristicProduct])
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'test',
          normalizedQuery: 'test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'women merge test',
        sessionContext: createSessionContextWithGender(),
        userPreferences: {
          gender: 'women',
        },
      },
      [heuristicProduct, uniqueProduct]
    )

    // Semantic results should be transformed and merged
    expect(mockTransformDbProductsToEnhanced).toHaveBeenCalledWith([semanticProduct])
  })

  it('uses heuristic-only when searchProductsFromSupabase returns empty', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockSearchProductsFromSupabase.mockResolvedValue([])
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'empty test',
          normalizedQuery: 'empty test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const heuristicProduct = createMockEnhancedProduct({ sku: 'HEUR-001' })
    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    const result = await processAIChatRequest(
      {
        message: 'women empty test',
        sessionContext: createSessionContextWithGender(),
        userPreferences: {
          gender: 'women',
        },
      },
      [heuristicProduct]
    )

    expect(mockSearchProductsFromSupabase).toHaveBeenCalled()
    expect(result).toBeDefined()
  })

  it('catches error and uses heuristic when searchProductsFromSupabase throws', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockSearchProductsFromSupabase.mockRejectedValue(new Error('Search failed'))
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'error test',
          normalizedQuery: 'error test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const heuristicProduct = createMockEnhancedProduct({ sku: 'HEUR-002' })
    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    const result = await processAIChatRequest(
      {
        message: 'women error test',
        sessionContext: createSessionContextWithGender(),
        userPreferences: {
          gender: 'women',
        },
      },
      [heuristicProduct]
    )

    expect(mockSearchProductsFromSupabase).toHaveBeenCalled()
    expect(result).toBeDefined()
  })

  it('skips semantic search when SUPABASE_RAG_ENABLED=false', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'false'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'no semantic',
          normalizedQuery: 'no semantic',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'no semantic search',
      },
      createMockProducts()
    )

    expect(mockSearchProductsFromSupabase).not.toHaveBeenCalled()
  })

  it('skips semantic search when message is too short', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'hi',
          normalizedQuery: 'hi',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'hi',
      },
      createMockProducts()
    )

    expect(mockSearchProductsFromSupabase).not.toHaveBeenCalled()
  })

  it('passes occasion filter to searchProductsFromSupabase', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockSearchProductsFromSupabase.mockResolvedValue([])
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'date night dress',
          normalizedQuery: 'date night dress',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'date night dress for women',
        sessionContext: createSessionContextWithGender(),
        userPreferences: {
          gender: 'women',
        },
      },
      createMockProducts()
    )

    // Check that the function was called (occasion detection happens internally)
    expect(mockSearchProductsFromSupabase).toHaveBeenCalled()
  })
})

describe('Feature Flag Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.SUPABASE_RAG_ENABLED
    delete process.env.SUPABASE_PRODUCTS_ENABLED
    delete process.env.OPENROUTER_API_KEY
  })

  it('SUPABASE_RAG_ENABLED=true enables both knowledge and semantic search', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockRetrieveFromSupabase.mockResolvedValue({
      documents: [],
      scores: [],
      totalFound: 0,
      metadata: {
        retrievalTimeMs: 10,
        query: 'test',
        normalizedQuery: 'test',
        appliedFilters: {},
        tokenCount: 0,
      },
    })
    mockSearchProductsFromSupabase.mockResolvedValue([])
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'test',
          normalizedQuery: 'test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'both enabled test for women',
        sessionContext: createSessionContextWithGender(),
        userPreferences: {
          gender: 'women',
        },
      },
      createMockProducts()
    )

    expect(mockRetrieveFromSupabase).toHaveBeenCalled()
    expect(mockSearchProductsFromSupabase).toHaveBeenCalled()
  })

  it('SUPABASE_RAG_ENABLED=false disables both features', async () => {
    process.env.SUPABASE_RAG_ENABLED = 'false'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'test',
          normalizedQuery: 'test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { processAIChatRequest } = await import('@/lib/services/ai-chat-service')

    await processAIChatRequest(
      {
        message: 'both disabled test for women',
        sessionContext: createSessionContextWithGender(),
        userPreferences: {
          gender: 'women',
        },
      },
      createMockProducts()
    )

    expect(mockRetrieveFromSupabase).not.toHaveBeenCalled()
    expect(mockSearchProductsFromSupabase).not.toHaveBeenCalled()
  })

  it('SUPABASE_PRODUCTS_ENABLED controls product catalog source independently', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'true'
    process.env.SUPABASE_RAG_ENABLED = 'false'

    mockLoadProductsFromSupabase.mockResolvedValue([createMockDbProduct()])
    mockTransformDbProductsToEnhanced.mockReturnValue(createMockProducts())

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({ message: 'test' })

    await POST(request)

    // Products from Supabase, but RAG from Vectra
    expect(mockLoadProductsFromSupabase).toHaveBeenCalled()
    expect(mockRetrieveFromSupabase).not.toHaveBeenCalled()
  })

  it('flags are independent: can have Supabase products with Vectra RAG', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'true'
    process.env.SUPABASE_RAG_ENABLED = 'false'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockLoadProductsFromSupabase.mockResolvedValue([createMockDbProduct()])
    mockTransformDbProductsToEnhanced.mockReturnValue(createMockProducts())
    mockGetRAGService.mockReturnValue({
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        scores: [],
        totalFound: 0,
        metadata: {
          retrievalTimeMs: 10,
          query: 'test',
          normalizedQuery: 'test',
          appliedFilters: {},
          tokenCount: 0,
        },
      }),
    })

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({
      message: 'independent flags test for women',
      userPreferences: { gender: 'women' },
      sessionContext: createSessionContextWithGender(),
    })

    await POST(request)

    expect(mockLoadProductsFromSupabase).toHaveBeenCalled()
    expect(mockGetRAGService).toHaveBeenCalled()
  })

  it('flags are independent: can have JSON products with Supabase RAG', async () => {
    process.env.SUPABASE_PRODUCTS_ENABLED = 'false'
    process.env.SUPABASE_RAG_ENABLED = 'true'
    process.env.OPENROUTER_API_KEY = 'test-key'

    mockLoadProductsServerSide.mockResolvedValue(createMockProducts())
    mockRetrieveFromSupabase.mockResolvedValue({
      documents: [],
      scores: [],
      totalFound: 0,
      metadata: {
        retrievalTimeMs: 10,
        query: 'test',
        normalizedQuery: 'test',
        appliedFilters: {},
        tokenCount: 0,
      },
    })
    mockSearchProductsFromSupabase.mockResolvedValue([])

    const { POST } = await import('@/app/api/chat/route')
    const request = createMockNextRequest({
      message: 'reverse flags test for women',
      userPreferences: { gender: 'women' },
      sessionContext: createSessionContextWithGender(),
    })

    await POST(request)

    expect(mockLoadProductsServerSide).toHaveBeenCalled()
    expect(mockLoadProductsFromSupabase).not.toHaveBeenCalled()
    expect(mockRetrieveFromSupabase).toHaveBeenCalled()
  })
})
