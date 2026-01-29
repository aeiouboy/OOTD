'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { OutfitProductList } from './OutfitProductList'
import { StickyPurchaseSection } from './StickyPurchaseSection'
import { SimilarOutfits } from './SimilarOutfits'
import { PanelSizeControls } from '@/components/layout/PanelSizeControls'
import { useResizablePanelContext } from '@/components/layout/ResizablePanel'
import type { Outfit, Product, FlatLayItem } from '@/lib/types'
import type { ImageGenerationResponse } from '@/lib/types/image-types'
import { ArrowLeft, Sparkles } from 'lucide-react'

/**
 * Cache configuration for localStorage (matching useFlatLayGeneration.ts)
 */
const CACHE_PREFIX = 'flat-lay-'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Maximum concurrent flat-lay generations to prevent API overload
 */
const MAX_CONCURRENT_GENERATIONS = 3

interface CachedImage {
  imageBase64: string
  timestamp: number
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
    const now = Date.now()
    if (now - parsed.timestamp < CACHE_TTL_MS) {
      return parsed.imageBase64
    } else {
      localStorage.removeItem(key)
      return null
    }
  } catch {
    return null
  }
}

/**
 * Saves generated image to localStorage cache
 */
function setCachedImage(outfitId: string, imageBase64: string): void {
  if (typeof window === 'undefined') return

  const key = `${CACHE_PREFIX}${outfitId}`
  const cached: CachedImage = {
    imageBase64,
    timestamp: Date.now(),
  }
  try {
    localStorage.setItem(key, JSON.stringify(cached))
  } catch {
    // Quota exceeded - silently fail
  }
}

interface OutfitDetailProps {
  outfit: Outfit
  similarOutfits?: Outfit[]
  onBack: () => void
  onBuyProduct: (product: Product) => void
  onBuyAll: () => void
  onSelectSimilar?: (outfit: Outfit) => void
}

export function OutfitDetail({
  outfit,
  similarOutfits = [],
  onBack,
  onBuyProduct,
  onBuyAll,
  onSelectSimilar
}: OutfitDetailProps) {
  // Get resize controls from ResizablePanel context (optional - only if in resizable panel)
  let panelWidth = 420
  let setPresetSize: ((size: number) => void) | undefined
  try {
    const context = useResizablePanelContext()
    panelWidth = context.panelWidth
    setPresetSize = context.setPresetSize
  } catch {
    // Not in a resizable panel context, that's okay
  }

  // State for similar outfits with proactively generated flat-lay images
  const [enhancedSimilarOutfits, setEnhancedSimilarOutfits] = useState<Outfit[]>(similarOutfits)

  // Track which outfits are currently generating
  const generatingOutfitIdsRef = useRef<Set<string>>(new Set())

  // Track active concurrent generations
  const activeGenerationsRef = useRef<number>(0)

  // Track if component is mounted
  const isMountedRef = useRef(true)

  /**
   * Transform outfit items to FlatLayItem format for API request
   */
  const transformToFlatLayItems = useCallback((items: Product[]): FlatLayItem[] => {
    return items.map((item) => ({
      name: item.name,
      category: item.subCategory || item.category || 'clothing',
      color: item.colors?.[0],
      visualDescription: item.visualDescription,
      sku: item.sku,
      thumbnailUrl: item.imageUrl,
    }))
  }, [])

  /**
   * Generate flat-lay image for a single similar outfit
   * Returns the generated image base64 or null if failed/cached
   */
  const generateFlatLayForOutfit = useCallback(async (targetOutfit: Outfit): Promise<string | null> => {
    // Check if already has flat-lay image
    if (targetOutfit.flatLayImageUrl || targetOutfit.flatLayImageBase64) {
      return targetOutfit.flatLayImageUrl || targetOutfit.flatLayImageBase64 || null
    }

    // Check localStorage cache first
    const cached = getCachedImage(targetOutfit.id)
    if (cached) {
      return cached
    }

    // Skip if already generating
    if (generatingOutfitIdsRef.current.has(targetOutfit.id)) {
      return null
    }

    // Mark as generating
    generatingOutfitIdsRef.current.add(targetOutfit.id)
    activeGenerationsRef.current++

    try {
      const flatLayItems = transformToFlatLayItems(targetOutfit.items)

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generationType: 'flat-lay',
          flatLayItems,
          occasionContext: targetOutfit.description || targetOutfit.title,
        }),
      })

      const result: ImageGenerationResponse = await response.json()

      if (result.success && result.imageBase64) {
        // Cache the generated image
        setCachedImage(targetOutfit.id, result.imageBase64)
        return result.imageBase64
      }

      return null
    } catch (error) {
      console.error('[OutfitDetail] Error generating flat-lay for similar outfit:', error)
      return null
    } finally {
      generatingOutfitIdsRef.current.delete(targetOutfit.id)
      activeGenerationsRef.current--
    }
  }, [transformToFlatLayItems])

  /**
   * Proactively generate flat-lay images for similar outfits
   */
  useEffect(() => {
    // Reset enhanced outfits when similarOutfits prop changes
    setEnhancedSimilarOutfits(similarOutfits)

    if (similarOutfits.length === 0) return

    // Track cleanup
    isMountedRef.current = true

    const generateForAllOutfits = async () => {
      // Process outfits in batches respecting concurrency limit
      const outfitsToGenerate = similarOutfits.filter(
        (o) => !o.flatLayImageUrl && !o.flatLayImageBase64 && !getCachedImage(o.id)
      )

      // First, immediately update with any cached images
      const withCachedImages = similarOutfits.map((outfit) => {
        const cached = getCachedImage(outfit.id)
        if (cached && !outfit.flatLayImageUrl && !outfit.flatLayImageBase64) {
          return { ...outfit, flatLayImageBase64: cached }
        }
        return outfit
      })

      if (isMountedRef.current) {
        setEnhancedSimilarOutfits(withCachedImages)
      }

      // Queue up generations with concurrency limit
      const generateWithQueue = async () => {
        for (const targetOutfit of outfitsToGenerate) {
          if (!isMountedRef.current) break

          // Wait for a slot to become available
          while (activeGenerationsRef.current >= MAX_CONCURRENT_GENERATIONS) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            if (!isMountedRef.current) return
          }

          // Start generation (don't await - let it run concurrently)
          generateFlatLayForOutfit(targetOutfit).then((imageBase64) => {
            if (imageBase64 && isMountedRef.current) {
              setEnhancedSimilarOutfits((prev) =>
                prev.map((o) =>
                  o.id === targetOutfit.id
                    ? { ...o, flatLayImageBase64: imageBase64 }
                    : o
                )
              )
            }
          })

          // Small delay between starting generations to avoid hammering the API
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      generateWithQueue()
    }

    generateForAllOutfits()

    return () => {
      isMountedRef.current = false
    }
  }, [similarOutfits, generateFlatLayForOutfit])

  if (!outfit) return null

  return (
    <div className="h-full flex flex-col">
      {/* Header with back button and resize controls */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            onClick={onBack}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore more outfits
          </Button>
          {setPresetSize && <PanelSizeControls currentWidth={panelWidth} onSizeChange={setPresetSize} />}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Outfit title and occasion */}
          <h2 className="text-lg font-bold mb-1 text-foreground">{outfit.title}</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            {outfit.description || 'Office wear'}
          </p>

          {/* Outfit preview image - prioritize flat-lay images from chat */}
          <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {(outfit.flatLayImageUrl || outfit.flatLayImageBase64 || outfit.imageUrl) ? (
              <img
                src={outfit.flatLayImageUrl || outfit.flatLayImageBase64 || outfit.imageUrl}
                alt={outfit.title}
                className={`w-full h-full ${outfit.flatLayImageUrl || outfit.flatLayImageBase64 ? 'object-contain' : 'object-cover'}`}
              />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>

          {/* Product list */}
          <OutfitProductList
            products={outfit.items}
            onBuyProduct={onBuyProduct}
          />

          {/* Similar outfits - use enhanced outfits with proactively generated flat-lay images */}
          {onSelectSimilar && (
            <SimilarOutfits
              outfits={enhancedSimilarOutfits}
              onSelectOutfit={onSelectSimilar}
            />
          )}
        </div>
      </div>

      {/* Sticky purchase section */}
      <StickyPurchaseSection
        totalPrice={outfit.totalPrice}
        onBuyAll={onBuyAll}
      />
    </div>
  )
}
