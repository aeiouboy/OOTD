'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
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
import type { Outfit } from '@/lib/types'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { FlatLayComposite } from '@/components/outfit/FlatLayComposite'
import { useFlatLayGeneration, useIntersectionObserver } from '@/lib/hooks/useFlatLayGeneration'
import { generateTryOnLooks } from '@/lib/services/fitting-model-service'
import { Eye, Heart, Share2, Shirt, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface OutfitRecommendationCardProps {
  outfit: Outfit
  onViewOutfit: (outfit: Outfit) => void
}

export function OutfitRecommendationCard({
  outfit,
  onViewOutfit
}: OutfitRecommendationCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  // v8.1: Keep ref to the latest outfit to ensure onViewOutfit passes current data
  // This solves the issue where clicking "View Outfit" during/after flat-lay generation
  // might pass stale outfit data that doesn't include product replacements
  const latestOutfitRef = useRef<Outfit>(outfit)

  // Update ref whenever outfit prop changes (e.g., after product replacements)
  useEffect(() => {
    latestOutfitRef.current = outfit
  }, [outfit])

  // v9.0: Check if outfit already has a flat-lay image from parent (ChatAssistant)
  const existingFlatLay = outfit.flatLayImageUrl || outfit.flatLayImageBase64

  // v9.0: Use flat-lay generation hook for automatic generation with caching and retries
  // This ensures flat-lay images are generated even if parent (ChatAssistant) fails
  const {
    isGenerating: isHookGenerating,
    isQueued,
    flatLayImageBase64: hookGeneratedImage,
    error: flatLayError,
    generateFlatLay,
  } = useFlatLayGeneration({
    outfitId: outfit.id,
    items: outfit.items,
    occasionContext: outfit.title,
  })

  // v9.0: Use intersection observer for lazy loading - trigger generation when card becomes visible
  const observerRef = useIntersectionObserver(
    () => {
      console.log(`[OutfitCard] Card visible: ${outfit.id}, existingFlatLay: ${!!existingFlatLay}, hookImage: ${!!hookGeneratedImage}`)
      // Only trigger generation if no existing flat-lay image and hook hasn't generated one
      if (!existingFlatLay && !hookGeneratedImage) {
        console.log(`[OutfitCard] Triggering flat-lay generation for: ${outfit.id}`)
        generateFlatLay()
      }
    },
    { threshold: 0.1 }
  )

  // Try-on state
  const [showTryOnModal, setShowTryOnModal] = useState(false)
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [tryOnImageUrl, setTryOnImageUrl] = useState<string | undefined>(outfit.tryOnImageUrl)
  const [tryOnImageBase64, setTryOnImageBase64] = useState<string | undefined>(outfit.tryOnImageBase64)
  const [tryOnError, setTryOnError] = useState<string | undefined>()

  // Get user profile for fitting model
  const { profile } = useUserProfile()

  // Check if user has a fitting model
  const hasFittingModel = !!profile?.fittingModelUrl

  // v9.0: Determine image source priority:
  // 1. Parent-provided flat-lay (from ChatAssistant)
  // 2. Hook-generated flat-lay (from useFlatLayGeneration with caching)
  // 3. FlatLayComposite CSS fallback (last resort)
  const hasFlatLayImage = !!(existingFlatLay || hookGeneratedImage)
  const flatLayImage = existingFlatLay || hookGeneratedImage
  const isGenerating = outfit.isGeneratingFlatLay || isHookGenerating || isQueued

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

    // Check if user has a fitting model
    if (!hasFittingModel || !profile?.fittingModelUrl) {
      setTryOnError('กรุณาอัปโหลดรูปภาพในขั้นตอนการตั้งค่าเพื่อใช้ฟีเจอร์ลองใส่')
      setShowTryOnModal(true)
      return
    }

    // Start generation
    setIsGeneratingTryOn(true)
    setTryOnError(undefined)
    setShowTryOnModal(true)

    try {
      // Extract outfit items for the prompt
      const outfitItems = outfit.items.map(item => ({
        name: item.name,
        category: item.category || item.subCategory || 'clothing',
        color: item.colors?.[0],
      }))

      // Pass flat-lay image for dual reference mode (outfit consistency)
      // v9.0: Use hook-generated flat-lay as fallback when outfit prop doesn't have one
      const result = await generateTryOnLooks({
        fittingModelImageUrl: profile.fittingModelUrl,
        outfitItems,
        outfitTitle: outfit.title,
        flatLayImageUrl: outfit.flatLayImageUrl,
        flatLayImageBase64: outfit.flatLayImageBase64 || hookGeneratedImage,
      })

      if (result.success) {
        setTryOnImageUrl(result.imageUrl)
        setTryOnImageBase64(result.imageBase64)
        setTryOnError(undefined)
      } else {
        setTryOnError(result.message || 'ไม่สามารถสร้างรูปภาพได้ กรุณาลองอีกครั้ง')
      }
    } catch (error) {
      console.error('[TryOn] Error:', error)
      setTryOnError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
    } finally {
      setIsGeneratingTryOn(false)
    }
  }, [tryOnImage, hasFittingModel, profile?.fittingModelUrl, outfit, hookGeneratedImage])

  /**
   * Handle regenerate try-on image
   */
  const handleRegenerate = useCallback(async () => {
    // Clear current image and regenerate
    setTryOnImageUrl(undefined)
    setTryOnImageBase64(undefined)
    setIsGeneratingTryOn(true)
    setTryOnError(undefined)

    if (!profile?.fittingModelUrl) {
      setTryOnError('กรุณาอัปโหลดรูปภาพในขั้นตอนการตั้งค่าเพื่อใช้ฟีเจอร์ลองใส่')
      setIsGeneratingTryOn(false)
      return
    }

    try {
      const outfitItems = outfit.items.map(item => ({
        name: item.name,
        category: item.category || item.subCategory || 'clothing',
        color: item.colors?.[0],
      }))

      // Pass flat-lay image for dual reference mode (outfit consistency)
      // v9.0: Use hook-generated flat-lay as fallback when outfit prop doesn't have one
      const result = await generateTryOnLooks({
        fittingModelImageUrl: profile.fittingModelUrl,
        outfitItems,
        outfitTitle: outfit.title,
        flatLayImageUrl: outfit.flatLayImageUrl,
        flatLayImageBase64: outfit.flatLayImageBase64 || hookGeneratedImage,
      })

      if (result.success) {
        setTryOnImageUrl(result.imageUrl)
        setTryOnImageBase64(result.imageBase64)
        setTryOnError(undefined)
      } else {
        setTryOnError(result.message || 'ไม่สามารถสร้างรูปภาพได้ กรุณาลองอีกครั้ง')
      }
    } catch (error) {
      console.error('[TryOn] Regenerate error:', error)
      setTryOnError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง')
    } finally {
      setIsGeneratingTryOn(false)
    }
  }, [profile?.fittingModelUrl, outfit, hookGeneratedImage])

  return (
    <>
      {/* v9.0: Wrapper div for intersection observer (Card doesn't forward refs in React 18) */}
      <div ref={observerRef}>
      <Card
        className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors overflow-hidden"
      >
        {/* Flat-lay image area (square aspect ratio) */}
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
          {isGenerating ? (
            // Loading skeleton while flat-lay is generating
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="w-full h-full absolute inset-0" />
              <div className="z-10 text-center px-4">
                <div className="flex justify-center mb-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {isQueued ? 'รอคิว...' : 'กำลังสร้างภาพ LOOKs...'}
                </p>
              </div>
            </div>
          ) : hasFlatLayImage && flatLayImage && !imageError ? (
            // Show AI-generated flat-lay image (preferred)
            <Image
              src={flatLayImage}
              alt={outfit.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
              onError={() => setImageError(true)}
            />
          ) : outfit.items && outfit.items.length > 0 ? (
            // Fallback: Use FlatLayComposite (CSS-based flat-lay) instead of mannequin thumbnail
            <FlatLayComposite items={outfit.items} />
          ) : (
            // Placeholder when no image and no items available
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-sm line-clamp-2">{outfit.title}</h4>
          </div>

          <p className="text-base font-bold">
            ฿{outfit.totalPrice.toLocaleString()}
          </p>

          {/* Action Icons Row */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewOutfit(latestOutfitRef.current)}
              disabled={isGenerating}
              className="flex-1 h-8 text-xs gap-1"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              {isGenerating ? 'กำลังโหลด...' : 'ดูลุค'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleTryOn}
              disabled={isGeneratingTryOn}
              className="h-8 px-2 text-xs gap-1"
              aria-label="ลองใส่ outfit นี้"
              title={hasFittingModel ? 'ลองใส่' : 'กรุณาอัปโหลดรูปภาพก่อน'}
            >
              {isGeneratingTryOn ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Shirt className="w-3.5 h-3.5" />
              )}
              ลองใส่
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className="h-8 w-8 p-0"
              aria-label={isLiked ? "Unlike outfit" : "Like outfit"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              aria-label="Share outfit"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </Card>
      </div>

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
                  {hasFittingModel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRegenerate}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      ลองอีกครั้ง
                    </Button>
                  )}
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
