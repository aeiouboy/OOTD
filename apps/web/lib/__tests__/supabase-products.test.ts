import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
const mockRpc = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createServerClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

const mockProductRows = [
  {
    id: '1',
    product_name: 'Test Midi Dress',
    brand: 'Simkhai',
    price: 8000,
    primary_occasion: 'date_night',
    occasion_weekend_social: 0.7,
    occasion_date_night: 1.0,
    occasion_everyday_casual: 0.3,
    image_url: '/dress.jpg',
    link: '/product/1',
  },
  {
    id: '2',
    product_name: 'Floral Blouse',
    brand: 'Journal',
    price: 2500,
    primary_occasion: 'weekend_social',
    occasion_weekend_social: 1.0,
    occasion_date_night: 0.3,
    occasion_everyday_casual: 0.3,
    image_url: '/blouse.jpg',
    link: '/product/2',
  },
]

const mockSearchResults = [
  { id: '3', product_name: 'Search Result Dress', similarity: 0.85 },
]

describe('Supabase product queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProductsByOccasion', () => {
    it('queries products filtered by primary_occasion', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({ data: [mockProductRows[0]], error: null })
              ),
            })),
          })),
        })),
      })

      const { getProductsByOccasion } = await import('@/lib/supabase/products')
      const data = await getProductsByOccasion('date_night', 10)

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(data).toHaveLength(1)
      expect(data[0].primary_occasion).toBe('date_night')
    })

    it('throws on Supabase error', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() =>
                Promise.resolve({
                  data: null,
                  error: { message: 'connection error' },
                })
              ),
            })),
          })),
        })),
      })

      const { getProductsByOccasion } = await import('@/lib/supabase/products')
      await expect(getProductsByOccasion('date_night')).rejects.toEqual({
        message: 'connection error',
      })
    })
  })

  describe('getTopProducts', () => {
    it('queries top products ordered by occasion score', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve({ data: mockProductRows, error: null })
            ),
          })),
        })),
      })

      const { getTopProducts } = await import('@/lib/supabase/products')
      const data = await getTopProducts('weekend_social', 5)

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(data).toHaveLength(2)
    })
  })

  describe('getAllProducts', () => {
    it('queries all products with limit', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn(() => ({
          range: vi.fn(() =>
            Promise.resolve({ data: mockProductRows, error: null })
          ),
        })),
      })

      const { getAllProducts } = await import('@/lib/supabase/products')
      const data = await getAllProducts(50)

      expect(mockFrom).toHaveBeenCalledWith('products')
      expect(data).toHaveLength(2)
    })
  })

  describe('searchProductsBySimilarity', () => {
    it('calls rpc with correct parameters', async () => {
      mockRpc.mockResolvedValue({ data: mockSearchResults, error: null })

      const { searchProductsBySimilarity } = await import(
        '@/lib/supabase/products'
      )
      const embedding = [0.1, 0.2, 0.3]
      const data = await searchProductsBySimilarity(embedding, 'date_night', 10)

      expect(mockRpc).toHaveBeenCalledWith('search_products', {
        query_embedding: JSON.stringify(embedding),
        occasion_filter: 'date_night',
        match_threshold: 0.25,
        match_count: 10,
        gender_filter: null,
      })
      expect(data).toHaveLength(1)
      expect(data![0].similarity).toBe(0.85)
    })

    it('throws on rpc error', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'rpc failed' },
      })

      const { searchProductsBySimilarity } = await import(
        '@/lib/supabase/products'
      )
      await expect(
        searchProductsBySimilarity([0.1], undefined, 5)
      ).rejects.toEqual({ message: 'rpc failed' })
    })
  })
})
