'use client'

import { useState, useCallback } from 'react'
import { useUserProfile } from './useUserProfile'
import type { OccasionPreset, OccasionFlatLayResponse, FlatLayItem } from '@/lib/types/image-types'

const CACHE_PREFIX = 'occasion-flat-lay-'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CachedResult {
  imageBase64: string
  imageUrl?: string
  curatedItems?: FlatLayItem[]
  timestamp: number
}

/**
 * Generate a simple hash from profile data for cache key differentiation
 */
function generateProfileHash(userName?: string, userAge?: string, stylePrefs?: string[]): string {
  const raw = `${userName || ''}-${userAge || ''}-${(stylePrefs || []).sort().join(',')}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

function getCacheKey(preset: OccasionPreset, profileHash: string): string {
  return `${CACHE_PREFIX}${preset}-${profileHash}`
}

function getCachedResult(key: string): CachedResult | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const parsed: CachedResult = JSON.parse(cached)
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function setCachedResult(key: string, result: CachedResult): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(result))
  } catch (error) {
    console.warn('[useOccasionFlatLay] Cache write failed:', error)
  }
}

export interface UseOccasionFlatLayResult {
  isGenerating: boolean
  imageBase64: string | undefined
  imageUrl: string | undefined
  curatedItems: FlatLayItem[] | undefined
  error: string | undefined
  generateForOccasion: (preset: OccasionPreset) => Promise<void>
  resetState: () => void
}

export function useOccasionFlatLay(): UseOccasionFlatLayResult {
  const { profile } = useUserProfile()
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined)
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [curatedItems, setCuratedItems] = useState<FlatLayItem[] | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const generateForOccasion = useCallback(async (preset: OccasionPreset) => {
    // Build profile context
    const userName = profile?.userName
    const userAge = profile?.ageRange
    const stylePreferences = profile?.stylePreferences?.map(sp => sp.name)
    const hasReferenceImage = !!profile?.userPhoto

    // Check cache first
    const profileHash = generateProfileHash(userName, userAge, stylePreferences)
    const cacheKey = getCacheKey(preset, profileHash)
    const cached = getCachedResult(cacheKey)

    if (cached) {
      setImageBase64(cached.imageBase64)
      setImageUrl(cached.imageUrl)
      setCuratedItems(cached.curatedItems)
      setError(undefined)
      return
    }

    // Generate fresh
    setIsGenerating(true)
    setError(undefined)
    setImageBase64(undefined)
    setImageUrl(undefined)
    setCuratedItems(undefined)

    try {
      const response = await fetch('/api/occasion-flat-lay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: preset,
          userName,
          userAge,
          stylePreferences,
          hasReferenceImage,
        }),
      })

      const result: OccasionFlatLayResponse = await response.json()

      if (result.success && result.imageBase64) {
        setImageBase64(result.imageBase64)
        setImageUrl(result.imageUrl)
        setCuratedItems(result.curatedItems)
        setError(undefined)

        // Cache the result
        setCachedResult(cacheKey, {
          imageBase64: result.imageBase64,
          imageUrl: result.imageUrl,
          curatedItems: result.curatedItems,
          timestamp: Date.now(),
        })
      } else {
        setError(result.message || result.error || 'Generation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsGenerating(false)
    }
  }, [profile])

  const resetState = useCallback(() => {
    setIsGenerating(false)
    setImageBase64(undefined)
    setImageUrl(undefined)
    setCuratedItems(undefined)
    setError(undefined)
  }, [])

  return {
    isGenerating,
    imageBase64,
    imageUrl,
    curatedItems,
    error,
    generateForOccasion,
    resetState,
  }
}
