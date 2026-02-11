import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { translateQueryForRAG, clearTranslationCache } from '../query-translator'

// Mock environment
vi.stubEnv('OPENROUTER_API_KEY', 'test-key')

describe('translateQueryForRAG', () => {
  beforeEach(() => {
    clearTranslationCache()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should pass English input through unchanged', async () => {
    const result = await translateQueryForRAG('casual outfit for date')
    expect(result).toBe('casual outfit for date')
  })

  it('should translate Thai input via OpenRouter API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'casual outfit cafe date' } }],
      }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await translateQueryForRAG('ชุดคาสชวลไปคาเฟ่')
    expect(result).toBe('casual outfit cafe date')
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('should return original message on API error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await translateQueryForRAG('ชุดไปงานแต่ง')
    expect(result).toBe('ชุดไปงานแต่ง')
  })

  it('should return original message on network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    const result = await translateQueryForRAG('ชุดทำงาน')
    expect(result).toBe('ชุดทำงาน')
  })

  it('should use cache for repeated queries', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'work outfit office' } }],
      }),
    })
    vi.stubGlobal('fetch', mockFetch)

    // First call - API
    const result1 = await translateQueryForRAG('ชุดทำงาน')
    expect(result1).toBe('work outfit office')
    expect(mockFetch).toHaveBeenCalledOnce()

    // Second call - cache
    const result2 = await translateQueryForRAG('ชุดทำงาน')
    expect(result2).toBe('work outfit office')
    expect(mockFetch).toHaveBeenCalledOnce() // Not called again
  })

  it('should handle empty API response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '' } }],
      }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await translateQueryForRAG('ชุดไปเที่ยว')
    expect(result).toBe('ชุดไปเที่ยว')
  })

  it('should skip translation when no API key', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_OPENROUTER_API_KEY', '')

    const result = await translateQueryForRAG('ชุดไปเที่ยว')
    expect(result).toBe('ชุดไปเที่ยว')
  })
})
