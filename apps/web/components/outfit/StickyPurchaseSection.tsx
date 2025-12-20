'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart, Share2, Bookmark } from 'lucide-react'

interface StickyPurchaseSectionProps {
  totalPrice: number
  onBuyAll: () => void
}

export function StickyPurchaseSection({
  totalPrice,
  onBuyAll
}: StickyPurchaseSectionProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <div className="sticky bottom-0 bg-white border-t p-4 z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Total outfit price</span>
        <span className="text-xl font-bold">
          ฿{totalPrice.toLocaleString()}
        </span>
      </div>

      <div className="flex gap-2">
        <Button onClick={onBuyAll} className="flex-1" size="lg">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Buy Complete Outfit
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsLiked(!isLiked)}
          className="px-3"
          aria-label={isLiked ? "Unlike outfit" : "Like outfit"}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="px-3"
          aria-label="Share outfit"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </Button>
      </div>
    </div>
  )
}
