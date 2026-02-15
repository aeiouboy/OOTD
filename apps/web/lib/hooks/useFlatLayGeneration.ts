'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Product } from '@/lib/types'
import type { FlatLayItem, ImageGenerationResponse, BackgroundStyle, UserAesthetic } from '@/lib/types/image-types'

/**
 * Cache configuration for localStorage
 */
const CACHE_PREFIX = 'flat-lay-v3-'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const MAX_CACHED_BASE64_LENGTH = 600_000 // ~450KB binary equivalent

/**
 * Maximum concurrent generations to prevent API overload
 * Increased from 2 to 3 for faster generation
 */
const MAX_CONCURRENT_GENERATIONS = 3
let currentGenerations = 0

/**
 * Global queue for pending generation requests
 * Module-scoped to persist across component re-renders
 */
interface QueuedRequest {
  id: string
  execute: () => void
}
const generationQueue: QueuedRequest[] = []

/**
 * Process the next item in the queue if a slot is available
 */
function processQueue(): void {
  if (currentGenerations >= MAX_CONCURRENT_GENERATIONS || generationQueue.length === 0) {
    return
  }

  const nextRequest = generationQueue.shift()
  if (nextRequest) {
    nextRequest.execute()
  }
}

/**
 * Remove a request from the queue by ID
 */
function removeFromQueue(id: string): void {
  const index = generationQueue.findIndex(req => req.id === id)
  if (index !== -1) {
    generationQueue.splice(index, 1)
  }
}

/**
 * Get queue position for a given ID (0 = not in queue, 1+ = position)
 */
function getQueuePosition(id: string): number {
  const index = generationQueue.findIndex(req => req.id === id)
  return index === -1 ? 0 : index + 1
}

interface CachedImage {
  imageBase64: string
  timestamp: number
}

interface UseFlatLayGenerationOptions {
  /** Outfit ID for caching */
  outfitId: string
  /** Products to generate flat-lay image from */
  items: Product[]
  /** Occasion context for the generation */
  occasionContext?: string
  /**
   * Enable hybrid flat-lay generation (AI background + real product images)
   * When true, uses the hybrid-flat-lay API endpoint instead of AI-only flat-lay
   * Default: false (uses AI-only generation)
   */
  useHybridGeneration?: boolean
  /**
   * Background style for hybrid generation
   * Only used when useHybridGeneration is true
   */
  backgroundStyle?: BackgroundStyle
  /**
   * User aesthetic preference for automatic background style mapping
   * Only used when useHybridGeneration is true and backgroundStyle is not set
   */
  userAesthetic?: UserAesthetic
}

interface UseFlatLayGenerationResult {
  /** Whether the image is currently being generated */
  isGenerating: boolean
  /** Whether the request is queued waiting for a slot */
  isQueued: boolean
  /** Position in the queue (0 = not queued, 1+ = position) */
  queuePosition: number
  /** Generated image as base64 data URL */
  flatLayImageBase64: string | undefined
  /** Error message if generation failed */
  error: string | undefined
  /** Trigger the flat-lay generation manually */
  generateFlatLay: () => void
  /** Whether the image was loaded from cache */
  isFromCache: boolean
}

/**
 * Checks if cached image is still valid (not expired)
 */
function isCacheValid(cached: CachedImage): boolean {
  const now = Date.now()
  return now - cached.timestamp < CACHE_TTL_MS
}

/**
 * Gets cached flat-lay image from localStorage
 */
function getCachedImage(outfitId: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    const key = `${CACHE_PREFIX}${outfitId}`
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const parsed: CachedImage = JSON.parse(cached)
    if (isCacheValid(parsed)) {
      return parsed.imageBase64
    } else {
      // Remove expired cache
      localStorage.removeItem(key)
      return null
    }
  } catch (error) {
    console.warn('[useFlatLayGeneration] Error reading cache:', error)
    return null
  }
}

/**
 * Saves generated image to localStorage cache
 * Implements automatic cache eviction when quota is exceeded
 */
function setCachedImage(outfitId: string, imageBase64: string): void {
  if (typeof window === 'undefined') return

  if (imageBase64.length > MAX_CACHED_BASE64_LENGTH) {
    console.warn(
      '[useFlatLayGeneration] Skipping cache for large image payload',
      { outfitId, length: imageBase64.length }
    )
    return
  }

  const key = `${CACHE_PREFIX}${outfitId}`
  const cached: CachedImage = {
    imageBase64,
    timestamp: Date.now(),
  }
  const cacheValue = JSON.stringify(cached)

  // Maximum retry attempts with progressive eviction
  const maxRetries = 3
  const evictionCounts = [1, 2, Number.MAX_SAFE_INTEGER] // Evict 1, then 2, then all remaining

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      localStorage.setItem(key, cacheValue)

      // Success - log if we had to evict entries
      if (attempt > 0) {
        console.log(`[useFlatLayGeneration] Successfully cached after evicting entries (attempt ${attempt + 1})`)
      }
      return
    } catch (error) {
      // Check if this is a QuotaExceededError
      const isQuotaError =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')

      if (isQuotaError && attempt < maxRetries) {
        // Attempt cache eviction
        const entriesToEvict = evictionCounts[attempt]
        console.warn(
          `[useFlatLayGeneration] localStorage quota exceeded. ` +
          `Attempting to evict ${entriesToEvict === Number.MAX_SAFE_INTEGER ? 'all remaining' : entriesToEvict} entries...`
        )

        const evicted = evictOldestCacheEntries(entriesToEvict)
        console.log(`[useFlatLayGeneration] Evicted ${evicted} cache entries`)

        if (evicted === 0) {
          // No cache entries to evict, image might be too large
          console.warn(
            '[useFlatLayGeneration] No cache entries available to evict. ' +
            'Image may be too large for localStorage quota.'
          )
          return
        }

        // Continue to next retry attempt
        continue
      } else {
        // Non-quota error or all retries exhausted
        if (isQuotaError) {
          console.warn(
            '[useFlatLayGeneration] Failed to cache image after all eviction attempts. ' +
            'localStorage quota cannot accommodate this image.'
          )
        } else {
          console.warn('[useFlatLayGeneration] Error saving to cache:', error)
        }
        return
      }
    }
  }
}

/**
 * Cleans up expired cache entries
 * Call this periodically to prevent localStorage bloat
 */
export function cleanupExpiredCache(): void {
  if (typeof window === 'undefined') return

  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) {
        keys.push(key)
      }
    }

    for (const key of keys) {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          const parsed: CachedImage = JSON.parse(cached)
          if (!isCacheValid(parsed)) {
            localStorage.removeItem(key)
          }
        }
      } catch {
        // Invalid cache entry, remove it
        localStorage.removeItem(key)
      }
    }
  } catch (error) {
    console.warn('[useFlatLayGeneration] Error cleaning cache:', error)
  }
}

/**
 * Evicts oldest cache entries to free up localStorage space
 * @param count Number of entries to evict (default 1)
 * @returns Number of entries actually evicted
 */
function evictOldestCacheEntries(count: number = 1): number {
  if (typeof window === 'undefined') return 0

  try {
    // Collect all flat-lay cache entries with their timestamps
    const cacheEntries: Array<{ key: string; timestamp: number }> = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const parsed: CachedImage = JSON.parse(cached)
            cacheEntries.push({ key, timestamp: parsed.timestamp })
          }
        } catch {
          // Corrupted entry, add with timestamp 0 to prioritize removal
          cacheEntries.push({ key, timestamp: 0 })
        }
      }
    }

    if (cacheEntries.length === 0) {
      return 0
    }

    // Sort by timestamp (oldest first)
    cacheEntries.sort((a, b) => a.timestamp - b.timestamp)

    // Remove the specified number of oldest entries
    const toEvict = Math.min(count, cacheEntries.length)
    let evicted = 0

    for (let i = 0; i < toEvict; i++) {
      try {
        localStorage.removeItem(cacheEntries[i].key)
        evicted++
      } catch {
        // Failed to remove, continue with others
        console.warn(`[useFlatLayGeneration] Failed to evict cache entry: ${cacheEntries[i].key}`)
      }
    }

    return evicted
  } catch (error) {
    console.warn('[useFlatLayGeneration] Error during cache eviction:', error)
    return 0
  }
}

/**
 * Custom hook for lazy flat-lay image generation with caching
 *
 * Features:
 * - Checks localStorage cache synchronously on initial render
 * - Supports lazy loading via Intersection Observer
 * - Uses global queue system to manage concurrent generations
 * - Provides loading states, queue status, and error handling
 * - Falls back gracefully on errors
 */
export function useFlatLayGeneration({
  outfitId,
  items,
  occasionContext,
}: UseFlatLayGenerationOptions): UseFlatLayGenerationResult {
  // Initialize state synchronously from cache to prevent flicker
  const [flatLayImageBase64, setFlatLayImageBase64] = useState<string | undefined>(() => {
    const cached = getCachedImage(outfitId)
    return cached || undefined
  })
  const [isFromCache, setIsFromCache] = useState<boolean>(() => {
    return !!getCachedImage(outfitId)
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isQueued, setIsQueued] = useState(false)
  const [queuePosition, setQueuePosition] = useState(0)
  const [error, setError] = useState<string | undefined>(undefined)

  // Track if generation has been attempted for this outfit
  const hasAttemptedRef = useRef(false)
  // Track if component is mounted
  const isMountedRef = useRef(true)
  // Track the current outfitId for cleanup
  const currentOutfitIdRef = useRef(outfitId)

  // Reset state when outfitId changes
  useEffect(() => {
    if (currentOutfitIdRef.current !== outfitId) {
      // Remove old request from queue if exists
      removeFromQueue(currentOutfitIdRef.current)

      // Check new outfit's cache
      const cached = getCachedImage(outfitId)
      if (cached) {
        setFlatLayImageBase64(cached)
        setIsFromCache(true)
        hasAttemptedRef.current = true
      } else {
        setFlatLayImageBase64(undefined)
        setIsFromCache(false)
        hasAttemptedRef.current = false
      }

      setIsGenerating(false)
      setIsQueued(false)
      setQueuePosition(0)
      setError(undefined)
      currentOutfitIdRef.current = outfitId
    }
  }, [outfitId])

  // Update queue position periodically when queued
  useEffect(() => {
    if (!isQueued) return

    const interval = setInterval(() => {
      const pos = getQueuePosition(outfitId)
      if (isMountedRef.current) {
        setQueuePosition(pos)
        if (pos === 0) {
          // No longer in queue, stop checking
          setIsQueued(false)
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isQueued, outfitId])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      // Remove from queue on unmount
      removeFromQueue(outfitId)
    }
  }, [outfitId])

  /**
   * Internal function to perform the actual generation
   */
  const performGeneration = useCallback(async () => {
    if (!isMountedRef.current) return

    setIsQueued(false)
    setQueuePosition(0)
    setIsGenerating(true)
    setError(undefined)
    hasAttemptedRef.current = true
    currentGenerations++

    // Direct mapping — no replacement, no validation, no cross-catalog contamination
    const flatLayItems: FlatLayItem[] = items.map((item) => ({
      name: item.name,
      category: item.subCategory || item.category || 'clothing',
      color: item.colors?.[0],
      visualDescription: item.visualDescription,
      sku: item.sku,
      thumbnailUrl: item.imageUrl,
    }))

    // Retry logic with exponential backoff
    const maxRetries = 1
    let lastError: string | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generationType: 'flat-lay',
            flatLayItems,
            occasionContext,
          }),
        })

        const result: ImageGenerationResponse = await response.json()

        if (!isMountedRef.current) {
          currentGenerations--
          processQueue()
          return
        }

        if (result.success && result.imageBase64) {
          setFlatLayImageBase64(result.imageBase64)
          setIsFromCache(false)
          setError(undefined)
          setCachedImage(outfitId, result.imageBase64)
          currentGenerations--
          setIsGenerating(false)
          processQueue()
          return
        } else {
          lastError = result.message || result.error || 'Generation failed'
        }
      } catch (err) {
        console.error('[useFlatLayGeneration] API error:', err)
        lastError = err instanceof Error ? err.message : 'Network error'
      }
    }

    // All retries failed
    if (isMountedRef.current) {
      setError(lastError)
      setIsGenerating(false)
    }
    currentGenerations--
    processQueue()
  }, [outfitId, items, occasionContext])

  /**
   * Generate flat-lay image via API
   * Uses global queue for concurrency management
   */
  const generateFlatLay = useCallback(() => {
    // Skip if already attempted, generating, queued, or has image
    if (hasAttemptedRef.current || isGenerating || isQueued || flatLayImageBase64) {
      return
    }

    // Check cache again in case it was populated while not observing
    const cached = getCachedImage(outfitId)
    if (cached) {
      setFlatLayImageBase64(cached)
      setIsFromCache(true)
      hasAttemptedRef.current = true
      return
    }

    // Check concurrent generation limit
    if (currentGenerations >= MAX_CONCURRENT_GENERATIONS) {
      // Add to queue
      const queuedRequest: QueuedRequest = {
        id: outfitId,
        execute: performGeneration,
      }
      generationQueue.push(queuedRequest)
      setIsQueued(true)
      setQueuePosition(generationQueue.length)
      return
    }

    // Slot available, generate immediately
    performGeneration()
  }, [outfitId, isGenerating, isQueued, flatLayImageBase64, performGeneration])

  return {
    isGenerating,
    isQueued,
    queuePosition,
    flatLayImageBase64,
    error,
    generateFlatLay,
    isFromCache,
  }
}

/**
 * Hook for using Intersection Observer to trigger lazy generation
 */
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
): React.RefCallback<HTMLElement> {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const hasTriggeredRef = useRef(false)

  const setRef = useCallback(
    (element: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      // Skip if already triggered or no element
      if (hasTriggeredRef.current || !element) {
        return
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry?.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true
            callback()
            // Disconnect after triggering
            observerRef.current?.disconnect()
          }
        },
        {
          threshold: 0.1, // Trigger when 10% visible
          ...options,
        }
      )

      observerRef.current.observe(element)
    },
    [callback, options]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return setRef
}
