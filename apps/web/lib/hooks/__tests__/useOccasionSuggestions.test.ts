import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useOccasionSuggestions } from '../useOccasionSuggestions'

const mockProducts = [
  {
    id: '1',
    sku: 'SKU-001',
    product_name: 'Floral Dress',
    brand: 'COS',
    price: 3500,
    original_price: null,
    image_url: null,
    link: null,
    availability: null,
    product_description: null,
    primary_occasion: 'weekend_social',
  },
]

// We mock global fetch for all tests in this file
const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useOccasionSuggestions', () => {
  it('returns empty products array when occasion is null', async () => {
    const { result } = renderHook(() => useOccasionSuggestions(null))

    // Should not call fetch at all
    expect(mockFetch).not.toHaveBeenCalled()
    expect(result.current.products).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets loading=true during fetch, then false after', async () => {
    // Create a deferred promise so we can control when fetch resolves
    let resolvePromise: (value: unknown) => void
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      })
    )

    const { result } = renderHook(() => useOccasionSuggestions('weekend_social'))

    // After initial render + effect, it should be loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    // Resolve the fetch
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ data: mockProducts }),
      })
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.products).toEqual(mockProducts)
  })

  it('sets error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useOccasionSuggestions('date_night'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.products).toEqual([])
  })

  it('sets error when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useOccasionSuggestions('date_night'))

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch suggestions')
    })
    expect(result.current.products).toEqual([])
  })

  it('refetch clears error and retries', async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useOccasionSuggestions('weekend_social'))

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockProducts }),
    })

    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.products).toEqual(mockProducts)
  })

  it('constructs correct URL with occasion and limit params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    })

    renderHook(() => useOccasionSuggestions('date_night'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/api/suggestions?')
    expect(calledUrl).toContain('occasion=date_night')
    expect(calledUrl).toContain('limit=20')
  })

  it('includes query param when provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    })

    renderHook(() => useOccasionSuggestions('everyday_casual', 'floral dress'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('query=floral+dress')
  })

  it('updates products when occasion changes', async () => {
    const weekendProducts = [{ ...mockProducts[0], id: 'w1', primary_occasion: 'weekend_social' }]
    const dateProducts = [{ ...mockProducts[0], id: 'd1', primary_occasion: 'date_night' }]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: weekendProducts }),
    })

    const { result, rerender } = renderHook(
      ({ occasion }: { occasion: 'weekend_social' | 'date_night' | null }) =>
        useOccasionSuggestions(occasion),
      { initialProps: { occasion: 'weekend_social' as const } }
    )

    await waitFor(() => {
      expect(result.current.products).toEqual(weekendProducts)
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: dateProducts }),
    })

    rerender({ occasion: 'date_night' })

    await waitFor(() => {
      expect(result.current.products).toEqual(dateProducts)
    })
  })
})
