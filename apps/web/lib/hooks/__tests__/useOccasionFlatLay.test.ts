import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// Mock useUserProfile before importing the hook
const mockProfile = {
  userName: 'TestUser',
  ageRange: '20-29',
  stylePreferences: [{ id: '1', name: 'clean-girl', description: '' }],
  userPhoto: null,
  fittingModelUrl: undefined,
  gender: 'women' as const,
  onboardingCompleted: true,
  createdAt: '2026-01-01',
}

vi.mock('../useUserProfile', () => ({
  useUserProfile: vi.fn(() => ({
    profile: mockProfile,
    isLoading: false,
    loadProfile: vi.fn(),
    saveProfile: vi.fn(),
    updateProfile: vi.fn(),
    completeOnboarding: vi.fn(),
    clearProfile: vi.fn(),
  })),
}))

import { useOccasionFlatLay } from '../useOccasionFlatLay'

// ---------- localStorage mock ----------
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
    _getStore: () => store,
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// ---------- fetch mock ----------
const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()
  localStorageMock.clear()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------- helpers ----------
const successResponse = {
  success: true,
  imageBase64: 'data:image/png;base64,fakeImageData',
  imageUrl: 'https://example.com/image.png',
  curatedItems: [
    { name: 'Linen Blouse', category: 'Top', color: 'white' },
    { name: 'Wide-leg Pants', category: 'Bottom', color: 'beige' },
  ],
}

function mockFetchSuccess(data = successResponse) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => data,
  })
}

function mockFetchFailure(errorMessage = 'Generation failed') {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      success: false,
      error: errorMessage,
    }),
  })
}

// =================================================================
// Tests
// =================================================================

describe('useOccasionFlatLay', () => {
  // ----- Test 1: Initial state -----
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useOccasionFlatLay())

    expect(result.current.isGenerating).toBe(false)
    expect(result.current.imageBase64).toBeUndefined()
    expect(result.current.imageUrl).toBeUndefined()
    expect(result.current.curatedItems).toBeUndefined()
    expect(result.current.error).toBeUndefined()
    expect(typeof result.current.generateForOccasion).toBe('function')
    expect(typeof result.current.resetState).toBe('function')
  })

  // ----- Test 2: API call with correct payload -----
  it('generateForOccasion triggers API call with correct payload', async () => {
    mockFetchSuccess()

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/occasion-flat-lay')
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')

    const body = JSON.parse(options.body)
    expect(body.occasion).toBe('weekend-social')
    expect(body.userName).toBe('TestUser')
    expect(body.userAge).toBe('20-29')
    expect(body.stylePreferences).toEqual(['clean-girl'])
    expect(body.hasReferenceImage).toBe(false)
  })

  // ----- Test 3: Successful generation sets state -----
  it('sets state correctly on successful generation', async () => {
    mockFetchSuccess()

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })

    expect(result.current.imageBase64).toBe(successResponse.imageBase64)
    expect(result.current.imageUrl).toBe(successResponse.imageUrl)
    expect(result.current.curatedItems).toEqual(successResponse.curatedItems)
    expect(result.current.error).toBeUndefined()
    expect(result.current.isGenerating).toBe(false)
  })

  // ----- Test 4: Error state on API failure response -----
  it('sets error when API returns success: false', async () => {
    mockFetchFailure('Service unavailable')

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('date-night')
    })

    expect(result.current.error).toBe('Service unavailable')
    expect(result.current.imageBase64).toBeUndefined()
    expect(result.current.isGenerating).toBe(false)
  })

  // ----- Test 5: Error state on network failure -----
  it('sets error when fetch throws a network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('everyday-casual')
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.imageBase64).toBeUndefined()
    expect(result.current.isGenerating).toBe(false)
  })

  // ----- Test 6: Loading state transitions -----
  it('transitions isGenerating from false -> true -> false', async () => {
    let resolvePromise: (value: unknown) => void
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve
      })
    )

    const { result } = renderHook(() => useOccasionFlatLay())

    // Before generation
    expect(result.current.isGenerating).toBe(false)

    // Start generation (don't await)
    let generatePromise: Promise<void>
    act(() => {
      generatePromise = result.current.generateForOccasion('weekend-social')
    })

    // During generation
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(true)
    })

    // Resolve fetch
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => successResponse,
      })
      await generatePromise!
    })

    // After generation
    expect(result.current.isGenerating).toBe(false)
  })

  // ----- Test 7: Caching - second call returns cached result -----
  it('returns cached result on second call without fetching again', async () => {
    mockFetchSuccess()

    const { result } = renderHook(() => useOccasionFlatLay())

    // First call - hits API
    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(result.current.imageBase64).toBe(successResponse.imageBase64)

    // Second call with same preset - should use cache
    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })

    // Fetch should NOT have been called again
    expect(mockFetch).toHaveBeenCalledTimes(1)
    // State should still have the correct data
    expect(result.current.imageBase64).toBe(successResponse.imageBase64)
    expect(result.current.curatedItems).toEqual(successResponse.curatedItems)
  })

  // ----- Test 8: Different presets are not cached together -----
  it('makes new API call for different occasion presets', async () => {
    mockFetchSuccess()

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.generateForOccasion('date-night')
    })
    expect(mockFetch).toHaveBeenCalledTimes(2)

    const secondBody = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(secondBody.occasion).toBe('date-night')
  })

  // ----- Test 9: resetState clears all state -----
  it('resetState clears all state', async () => {
    mockFetchSuccess()

    const { result } = renderHook(() => useOccasionFlatLay())

    // Generate first
    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })

    expect(result.current.imageBase64).toBeDefined()
    expect(result.current.curatedItems).toBeDefined()

    // Reset
    act(() => {
      result.current.resetState()
    })

    expect(result.current.isGenerating).toBe(false)
    expect(result.current.imageBase64).toBeUndefined()
    expect(result.current.imageUrl).toBeUndefined()
    expect(result.current.curatedItems).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  // ----- Test 10: Uses message field as fallback error -----
  it('falls back to message field when error is not present', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        message: 'Rate limit exceeded',
      }),
    })

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })

    expect(result.current.error).toBe('Rate limit exceeded')
  })

  // ----- Test 11: Caches result to localStorage -----
  it('writes to localStorage after successful generation', async () => {
    mockFetchSuccess()

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('weekend-social')
    })

    expect(localStorageMock.setItem).toHaveBeenCalled()
    const setItemCall = localStorageMock.setItem.mock.calls[0]
    expect(setItemCall[0]).toMatch(/^occasion-flat-lay-/)
    const cached = JSON.parse(setItemCall[1])
    expect(cached.imageBase64).toBe(successResponse.imageBase64)
    expect(cached.imageUrl).toBe(successResponse.imageUrl)
    expect(cached.timestamp).toBeDefined()
  })

  // ----- Test 12: Does not cache failed results -----
  it('does not write to localStorage on failed generation', async () => {
    mockFetchFailure('Something went wrong')

    const { result } = renderHook(() => useOccasionFlatLay())

    await act(async () => {
      await result.current.generateForOccasion('date-night')
    })

    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })
})
