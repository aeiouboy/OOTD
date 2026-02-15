import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies BEFORE importing the module under test
vi.mock('../embeddings', () => ({
  generateEmbedding: vi.fn(),
}))

vi.mock('../../supabase/knowledge', () => ({
  searchKnowledge: vi.fn(),
}))

vi.mock('../../supabase/products', () => ({
  searchProductsBySimilarity: vi.fn(),
}))

import {
  retrieveFromSupabase,
  searchProductsFromSupabase,
} from '../supabase-retrieval'
import { generateEmbedding } from '../embeddings'
import { searchKnowledge } from '../../supabase/knowledge'
import { searchProductsBySimilarity } from '../../supabase/products'

const mockGenerateEmbedding = vi.mocked(generateEmbedding)
const mockSearchKnowledge = vi.mocked(searchKnowledge)
const mockSearchProducts = vi.mocked(searchProductsBySimilarity)

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

function makeMockEmbeddingResult() {
  return {
    embedding: new Array(1536).fill(0.1),
    dimensions: 1536,
    tokenCount: 10,
  }
}

function makeMockKnowledgeRows() {
  return [
    {
      id: 'k1',
      source_file: 'styling_rules.md',
      category: 'styling_rules',
      title: 'Color Theory Basics',
      content: 'Warm colors energize outfits and draw attention.',
      similarity: 0.85,
    },
    {
      id: 'k2',
      source_file: 'occasions.md',
      category: 'occasions',
      title: 'Weekend Social Dressing',
      content: 'Keep it relaxed but put together for weekend outings.',
      similarity: 0.72,
    },
  ]
}

function makeMockProductRows() {
  return [
    {
      id: 'p1',
      product_name: 'Floral Dress',
      brand: 'COS',
      price: 3500,
      image_url: 'https://example.com/floral.jpg',
      link: 'https://example.com/floral',
      primary_occasion: 'weekend_social',
      occasion_weekend_social: 0.9,
      occasion_date_night: 0.3,
      occasion_everyday_casual: 0.5,
      similarity: 0.82,
    },
    {
      id: 'p2',
      product_name: 'Linen Blazer',
      brand: 'ZARA',
      price: 4900,
      image_url: 'https://example.com/blazer.jpg',
      link: 'https://example.com/blazer',
      primary_occasion: 'everyday_casual',
      occasion_weekend_social: 0.4,
      occasion_date_night: 0.7,
      occasion_everyday_casual: 0.8,
      similarity: 0.78,
    },
  ]
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()

  // Default: embedding generation succeeds
  mockGenerateEmbedding.mockResolvedValue(makeMockEmbeddingResult())
})

// ---------------------------------------------------------------------------
// retrieveFromSupabase
// ---------------------------------------------------------------------------

describe('retrieveFromSupabase', () => {
  it('returns a correctly shaped RetrievalResult from knowledge search', async () => {
    const rows = makeMockKnowledgeRows()
    mockSearchKnowledge.mockResolvedValue(rows)

    const result = await retrieveFromSupabase('color theory for casual outfits')

    expect(result).toHaveProperty('documents')
    expect(result).toHaveProperty('scores')
    expect(result).toHaveProperty('totalFound')
    expect(result).toHaveProperty('metadata')
    expect(result.totalFound).toBe(2)
  })

  it('maps Supabase knowledge rows to KnowledgeDocument shape', async () => {
    const rows = makeMockKnowledgeRows()
    mockSearchKnowledge.mockResolvedValue(rows)

    const result = await retrieveFromSupabase('styling rules')

    expect(result.documents).toHaveLength(2)

    const doc0 = result.documents[0]
    expect(doc0.id).toBe('k1')
    expect(doc0.title).toBe('Color Theory Basics')
    expect(doc0.content).toBe('Warm colors energize outfits and draw attention.')
    expect(doc0.category).toBe('styling_rules')
    expect(doc0.metadata.source).toBe('styling_rules.md')
    expect(doc0.metadata.topics).toEqual([])
    // Priority: first result gets highest priority (length - index)
    expect(doc0.metadata.priority).toBe(2)

    const doc1 = result.documents[1]
    expect(doc1.id).toBe('k2')
    expect(doc1.metadata.priority).toBe(1)
  })

  it('passes category filter from options to searchKnowledge', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    await retrieveFromSupabase('warm colors', {
      filters: { category: 'color_theory' },
      topK: 3,
    })

    expect(mockSearchKnowledge).toHaveBeenCalledWith(
      expect.any(Array),     // embedding
      'color_theory',        // category filter
      3,                     // topK
      0.25                   // matchThreshold (default)
    )
  })

  it('uses default topK=5 when not specified in options', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    await retrieveFromSupabase('casual outfit ideas')

    expect(mockSearchKnowledge).toHaveBeenCalledWith(
      expect.any(Array),
      undefined,  // no category filter
      5,          // default topK
      0.25        // matchThreshold (default)
    )
  })

  it('returns empty result (not throw) when searchKnowledge throws', async () => {
    mockSearchKnowledge.mockRejectedValue(new Error('RPC error: connection refused'))

    const result = await retrieveFromSupabase('any query')

    expect(result.documents).toEqual([])
    expect(result.scores).toEqual([])
    expect(result.totalFound).toBe(0)
    expect(result.metadata.query).toBe('any query')
  })

  it('returns empty result (not throw) when generateEmbedding throws', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('API key missing'))

    const result = await retrieveFromSupabase('test query')

    expect(result.documents).toEqual([])
    expect(result.scores).toEqual([])
    expect(result.totalFound).toBe(0)
  })

  it('returns empty result when no matches found', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    const result = await retrieveFromSupabase('nonexistent topic xyz')

    expect(result.documents).toEqual([])
    expect(result.scores).toEqual([])
    expect(result.totalFound).toBe(0)
  })

  it('scores array matches documents array length', async () => {
    const rows = makeMockKnowledgeRows()
    mockSearchKnowledge.mockResolvedValue(rows)

    const result = await retrieveFromSupabase('styling')

    expect(result.scores).toHaveLength(result.documents.length)
    expect(result.scores[0]).toBe(0.85)
    expect(result.scores[1]).toBe(0.72)
  })

  it('metadata includes retrievalTimeMs and query', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    const result = await retrieveFromSupabase('test metadata query')

    expect(result.metadata.query).toBe('test metadata query')
    expect(typeof result.metadata.retrievalTimeMs).toBe('number')
    expect(result.metadata.retrievalTimeMs).toBeGreaterThanOrEqual(0)
  })

  it('normalizedQuery is lowercase of query', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    const result = await retrieveFromSupabase('Color Theory FOR Casual')

    expect(result.metadata.normalizedQuery).toBe('color theory for casual')
  })

  it('metadata includes appliedFilters from options', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    const result = await retrieveFromSupabase('query', {
      filters: { category: 'styling_rules', gender: 'women' },
    })

    expect(result.metadata.appliedFilters).toEqual({
      category: 'styling_rules',
      gender: 'women',
    })
  })

  it('metadata appliedFilters defaults to empty object when no filters provided', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    const result = await retrieveFromSupabase('query without filters')

    expect(result.metadata.appliedFilters).toEqual({})
  })

  it('metadata includes tokenCount from embedding result', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    const result = await retrieveFromSupabase('query')

    expect(result.metadata.tokenCount).toBe(10) // from makeMockEmbeddingResult
  })

  it('metadata tokenCount is 0 in error path', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('fail'))

    const result = await retrieveFromSupabase('fail query')

    expect(result.metadata.tokenCount).toBe(0)
  })

  it('calls generateEmbedding with query and useCache=true', async () => {
    mockSearchKnowledge.mockResolvedValue([])

    await retrieveFromSupabase('embedding check')

    expect(mockGenerateEmbedding).toHaveBeenCalledWith('embedding check', true)
  })

  it('handles knowledge rows with null title by defaulting to "Untitled"', async () => {
    mockSearchKnowledge.mockResolvedValue([
      {
        id: 'k3',
        source_file: 'misc.md',
        category: 'styling_rules',
        title: null as unknown as string,
        content: 'Some content without a title',
        similarity: 0.6,
      },
    ])

    const result = await retrieveFromSupabase('untitled docs')

    expect(result.documents[0].title).toBe('Untitled')
  })
})

// ---------------------------------------------------------------------------
// searchProductsFromSupabase
// ---------------------------------------------------------------------------

describe('searchProductsFromSupabase', () => {
  it('returns products from searchProductsBySimilarity', async () => {
    const rows = makeMockProductRows()
    mockSearchProducts.mockResolvedValue(rows as any)

    const products = await searchProductsFromSupabase('floral dress for weekend')

    expect(products).toHaveLength(2)
    expect(products[0]).toHaveProperty('id', 'p1')
    expect(products[0]).toHaveProperty('product_name', 'Floral Dress')
    expect(products[1]).toHaveProperty('id', 'p2')
  })

  it('passes occasion filter to searchProductsBySimilarity', async () => {
    mockSearchProducts.mockResolvedValue([] as any)

    await searchProductsFromSupabase('date night outfit', 'date_night', 10)

    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.any(Array),   // embedding
      'date_night',        // occasion filter
      10,                  // limit
      undefined            // genderFilter
    )
  })

  it('uses default limit=20 when not specified', async () => {
    mockSearchProducts.mockResolvedValue([] as any)

    await searchProductsFromSupabase('casual look')

    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.any(Array),
      undefined,   // no occasion filter
      20,          // default limit
      undefined    // genderFilter
    )
  })

  it('returns empty array (not throw) when searchProductsBySimilarity throws', async () => {
    mockSearchProducts.mockRejectedValue(new Error('RPC timeout'))

    const products = await searchProductsFromSupabase('error query')

    expect(products).toEqual([])
    expect(Array.isArray(products)).toBe(true)
  })

  it('returns empty array (not throw) when generateEmbedding throws', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('No API key'))

    const products = await searchProductsFromSupabase('query with bad embedding')

    expect(products).toEqual([])
    expect(Array.isArray(products)).toBe(true)
  })

  it('returns empty array when searchProductsBySimilarity returns null', async () => {
    mockSearchProducts.mockResolvedValue(null as any)

    const products = await searchProductsFromSupabase('null result')

    expect(products).toEqual([])
  })

  it('calls generateEmbedding with query and useCache=true', async () => {
    mockSearchProducts.mockResolvedValue([] as any)

    await searchProductsFromSupabase('check embedding call')

    expect(mockGenerateEmbedding).toHaveBeenCalledWith('check embedding call', true)
  })

  it('passes occasion filter as undefined when not provided', async () => {
    mockSearchProducts.mockResolvedValue([] as any)

    await searchProductsFromSupabase('no filter')

    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.any(Array),
      undefined,
      20,
      undefined // genderFilter parameter added
    )
  })
})
