'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import type { Outfit } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { FlatLayComposite } from '@/components/outfit/FlatLayComposite'
import { useFlatLayGeneration, useIntersectionObserver, cleanupExpiredCache } from '@/lib/hooks/useFlatLayGeneration'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { buildTryOnPromptItems } from '@/lib/utils/styling-completion'
import {
  generateDefaultFittingModel,
  generateFittingModel,
  generateTryOnLooks,
} from '@/lib/services/fitting-model-service'
import { Eye, Shirt, Heart, Share2, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface SimilarOutfitsProps {
  outfits: Outfit[]
  onSelectOutfit: (outfit: Outfit) => void
}

interface SimilarOutfitCardProps {
  outfit: Outfit
  onSelect: (outfit: Outfit) => void
}

/**
 * Individual outfit card with lazy AI flat-lay generation
 */
function SimilarOutfitCard({ outfit, onSelect }: SimilarOutfitCardProps) {
  // Check if outfit already has a flat-lay image
  const existingFlatLay = outfit.flatLayImageUrl || outfit.flatLayImageBase64

  // Use flat-lay generation hook only when no existing image
  const {
    isGenerating,
    isQueued,
    flatLayImageBase64,
    error,
    generateFlatLay,
  } = useFlatLayGeneration({
    outfitId: outfit.id,
    items: outfit.items,
    occasionContext: outfit.title,
    useHybridGeneration: true,
  })

  // Use intersection observer for lazy loading
  const observerRef = useIntersectionObserver(
    () => {
      // Only trigger generation if no existing flat-lay image
      if (!existingFlatLay && !flatLayImageBase64) {
        generateFlatLay()
      }
    },
    { threshold: 0.1 }
  )

  // Action button states
  const [isLiked, setIsLiked] = useState(false)
  const [showTryOnModal, setShowTryOnModal] = useState(false)
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [tryOnImageUrl, setTryOnImageUrl] = useState<string | undefined>(outfit.tryOnImageUrl)
  const [tryOnImageBase64, setTryOnImageBase64] = useState<string | undefined>(outfit.tryOnImageBase64)
  const [tryOnError, setTryOnError] = useState<string | undefined>()

  // Get user profile for fitting model
  const { profile, updateProfile } = useUserProfile()

  const prepareFittingModel = useCallback(async (): Promise<{ url?: string; errorMessage?: string }> => {
    if (profile?.fittingModelUrl) {
      return { url: profile.fittingModelUrl }
    }

    const generationResult = profile?.userPhoto
      ? await generateFittingModel(profile.userPhoto)
      : await generateDefaultFittingModel()

    if (generationResult.success && (generationResult.imageUrl || generationResult.imageBase64)) {
      const url = generationResult.imageUrl || generationResult.imageBase64
      updateProfile({ fittingModelUrl: url })
      return { url }
    }

    return {
      errorMessage: generationResult.message || 'ไม่สามารถเตรียมโมเดลลองใส่ได้ กรุณาลองอีกครั้ง',
    }
  }, [profile?.fittingModelUrl, profile?.userPhoto, updateProfile])

  // Try-on image to display
  const tryOnImage = tryOnImageUrl || tryOnImageBase64

  // Sync with outfit prop when it changes
  useEffect(() => {
    if (outfit.tryOnImageUrl) {
      setTryOnImageUrl(outfit.tryOnImageUrl)
    }
    if (outfit.tryOnImageBase64) {
      setTryOnImageBase64(outfit.tryOnImageBase64)
    }
  }, [outfit.tryOnImageUrl, outfit.tryOnImageBase64])

  /**
   * Handle try-on button click
   */
  const handleTryOn = useCallback(async () => {
    // If we already have a try-on image, just open the modal
    if (tryOnImage) {
      setShowTryOnModal(true)
      return
    }

    // Start generation
    setIsGeneratingTryOn(true)
    setTryOnError(undefined)
    setShowTryOnModal(true)

    try {
      const { url: fittingModelImageUrl, errorMessage } = await prepareFittingModel()
      if (!fittingModelImageUrl) {
        setTryOnError(errorMessage || 'ไม่สามารถเตรียมโมเดลลองใส่ได้ กรุณาลองอีกครั้ง')
        return
      }

      const outfitItems = buildTryOnPromptItems({
        outfitTitle: outfit.title,
        outfitDescription: outfit.description,
        catalogItems: outfit.items,
        stylingItems: outfit.stylingItems || [],
      })

      // Pass flat-lay image for dual reference mode (outfit consistency)
      // Use hook-generated flatLayImageBase64 as fallback when outfit prop doesn't have one
      const result = await generateTryOnLooks({
        fittingModelImageUrl,
        outfitItems,
        outfitTitle: outfit.title,
        flatLayImageUrl: outfit.flatLayImageUrl,
        flatLayImageBase64: outfit.flatLayImageBase64 || flatLayImageBase64,
      })

      if (result.success) {
        setTryOnImageUrl(result.imageUrl)
        setTryOnImageBase64(result.imageBase64)
        setTryOnError(undefined)
      } else {
        setTryOnError(result.message || 'ไม่สามารถสร้างรูปภาพได้ กรุณาลองอีกครั้ง')
      }
    } catch (err) {
      console.error('[TryOn] Error:', err)
      setTryOnError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
    } finally {
      setIsGeneratingTryOn(false)
    }
  }, [tryOnImage, outfit, flatLayImageBase64, prepareFittingModel])

  /**
   * Handle regenerate try-on image
   */
  const handleRegenerate = useCallback(async () => {
    // Clear current image and regenerate
    setTryOnImageUrl(undefined)
    setTryOnImageBase64(undefined)
    setIsGeneratingTryOn(true)
    setTryOnError(undefined)

    try {
      const { url: fittingModelImageUrl, errorMessage } = await prepareFittingModel()
      if (!fittingModelImageUrl) {
        setTryOnError(errorMessage || 'ไม่สามารถเตรียมโมเดลลองใส่ได้ กรุณาลองอีกครั้ง')
        return
      }

      const outfitItems = buildTryOnPromptItems({
        outfitTitle: outfit.title,
        outfitDescription: outfit.description,
        catalogItems: outfit.items,
        stylingItems: outfit.stylingItems || [],
      })

      // Pass flat-lay image for dual reference mode (outfit consistency)
      // Use hook-generated flatLayImageBase64 as fallback when outfit prop doesn't have one
      const result = await generateTryOnLooks({
        fittingModelImageUrl,
        outfitItems,
        outfitTitle: outfit.title,
        flatLayImageUrl: outfit.flatLayImageUrl,
        flatLayImageBase64: outfit.flatLayImageBase64 || flatLayImageBase64,
      })

      if (result.success) {
        setTryOnImageUrl(result.imageUrl)
        setTryOnImageBase64(result.imageBase64)
        setTryOnError(undefined)
      } else {
        setTryOnError(result.message || 'ไม่สามารถสร้างรูปภาพได้ กรุณาลองอีกครั้ง')
      }
    } catch (err) {
      console.error('[TryOn] Regenerate error:', err)
      setTryOnError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
    } finally {
      setIsGeneratingTryOn(false)
    }
  }, [outfit, flatLayImageBase64, prepareFittingModel])

  // Determine which image to display
  const displayImage = existingFlatLay || flatLayImageBase64
  const showActiveLoading = isGenerating && !displayImage
  const showQueuedLoading = isQueued && !displayImage && !isGenerating
  const canRenderCompositeFallback = Boolean(outfit.items && outfit.items.length > 0)
  const showFallback = !displayImage && !isGenerating && !isQueued && error
  // Show waiting state before intersection triggers (no cache, no error, not generating, not queued)
  const showWaitingState = !displayImage && !isGenerating && !isQueued && !error

  return (
    <>
      <Card
        className="relative cursor-pointer hover:shadow-md transition-shadow overflow-hidden active:scale-[0.98] transition-transform"
        onClick={() => onSelect(outfit)}
      >
        {/* Observer target - separate element that doesn't block clicks */}
        <span
          ref={observerRef}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />
        <div className="aspect-[3/4] bg-gray-100 relative">
          {showActiveLoading ? (
            // Active loading skeleton while flat-lay is generating
            <div className="relative w-full h-full">
              <Skeleton className="w-full h-full absolute inset-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="flex justify-center mb-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">กำลังสร้างภาพ...</p>
              </div>
            </div>
          ) : showQueuedLoading ? (
            // Queued state - shimmer animation while waiting in queue
            <div className="relative w-full h-full">
              <Skeleton className="w-full h-full absolute inset-0 animate-pulse" />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="flex justify-center mb-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xs text-gray-500">รอคิว...</p>
              </div>
            </div>
          ) : showWaitingState ? (
            // Initial waiting state before intersection - show loading skeleton
            <div className="relative w-full h-full">
              <Skeleton className="w-full h-full absolute inset-0 animate-pulse" />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <p className="text-xs text-gray-400">รอดูภาพ...</p>
              </div>
            </div>
          ) : displayImage ? (
            // Show flat-lay image
            <Image
              src={displayImage}
              alt={outfit.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 50vw, 200px"
              unoptimized={displayImage.startsWith('data:')}
            />
          ) : canRenderCompositeFallback ? (
            // Soft fallback: keep the card usable even if image generation fails.
            <div className="relative w-full h-full">
              <FlatLayComposite items={outfit.items} />
              {showFallback && (
                <div className="absolute bottom-1 left-1 right-1 rounded bg-black/55 px-2 py-1">
                  <p className="text-[10px] text-white text-center">
                    แสดงภาพพรีวิวจากสินค้าแทนชั่วคราว
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="p-2">
          <div className="space-y-0.5">
            <p className="text-xs font-medium line-clamp-1">{outfit.title}</p>
            <p className="text-xs text-muted-foreground">{outfit.items.length} ชิ้น</p>
            <p className="text-xs text-primary font-bold">
              ฿{outfit.totalPrice.toLocaleString()}
            </p>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-1 mt-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onSelect(outfit); }}
              className="flex-1 h-7 text-xs gap-0.5 px-1"
            >
              <Eye className="w-3 h-3" />
              ดูลุค
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); handleTryOn(); }}
              disabled={isGeneratingTryOn}
              className="h-7 px-1.5 text-xs gap-0.5"
              aria-label="ลองใส่ outfit นี้"
              title="ลองใส่"
            >
              {isGeneratingTryOn ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Shirt className="w-3 h-3" />
              )}
              ลองใส่
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
              className="h-7 w-7 p-0"
              aria-label={isLiked ? "Unlike outfit" : "Like outfit"}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-7 p-0"
              aria-label="Share outfit"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-600" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Try-On Modal */}
      <Dialog open={showTryOnModal} onOpenChange={setShowTryOnModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shirt className="w-5 h-5" />
              ลองใส่: {outfit.title}
            </DialogTitle>
            <DialogDescription>
              ดูชุดนี้บนโมเดลของคุณ
            </DialogDescription>
          </DialogHeader>

          {/* Try-On Image Area */}
          <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            {isGeneratingTryOn ? (
              // Loading state
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Skeleton className="w-full h-full absolute inset-0" />
                <div className="z-10 text-center px-4">
                  <div className="flex justify-center mb-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">กำลังสร้างรูปภาพ...</p>
                  <p className="text-xs text-gray-400 mt-1">อาจใช้เวลา 10-30 วินาที</p>
                </div>
              </div>
            ) : tryOnError ? (
              // Error state
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">{tryOnError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRegenerate}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    ลองอีกครั้ง
                  </Button>
                </div>
              </div>
            ) : tryOnImage ? (
              // Show try-on image
              <Image
                src={tryOnImage}
                alt={`ลองใส่: ${outfit.title}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            ) : (
              // Empty state (should not happen normally)
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-sm">ไม่มีรูปภาพ</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-2">
            {tryOnImage && !isGeneratingTryOn && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerate}
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                ลองใส่ใหม่
              </Button>
            )}
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowTryOnModal(false)}
              className="flex-1"
            >
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * SimilarOutfits - Displays a grid of similar outfit recommendations
 * with lazy AI-generated flat-lay images
 */
export function SimilarOutfits({ outfits, onSelectOutfit }: SimilarOutfitsProps) {
  // Cleanup expired cache entries on mount
  useEffect(() => {
    cleanupExpiredCache()
  }, [])

  if (outfits.length === 0) return null

  return (
    <div className="mt-6 pb-4">
      <h3 className="font-medium mb-3">Similar outfits</h3>

      <div className="grid grid-cols-2 gap-3">
        {outfits.slice(0, 6).map((outfit) => (
          <SimilarOutfitCard
            key={outfit.id}
            outfit={outfit}
            onSelect={onSelectOutfit}
          />
        ))}
      </div>
    </div>
  )
}
