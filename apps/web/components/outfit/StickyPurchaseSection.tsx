'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart, Share2 } from 'lucide-react'

const priceFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
})

interface StickyPurchaseSectionProps {
  totalPrice: number
  onBuyAll: () => void
  isInWishlist?: boolean
  onToggleWishlist?: () => void
}

export function StickyPurchaseSection({
  totalPrice,
  onBuyAll,
  isInWishlist,
  onToggleWishlist,
}: StickyPurchaseSectionProps) {
  const [localLiked, setLocalLiked] = useState(false)

  const liked = isInWishlist ?? localLiked
  const handleHeartClick = () => {
    if (onToggleWishlist) {
      onToggleWishlist()
    } else {
      setLocalLiked(!localLiked)
    }
  }

  return (
    <div className="sticky bottom-0 bg-white border-t p-4 z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Total outfit price</span>
        <span className="text-xl font-bold">
          {priceFormatter.format(totalPrice)}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={handleHeartClick}
          className="px-3"
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>
        <Button onClick={onBuyAll} className="flex-1" size="lg">
          <ShoppingBag className="w-4 h-4 mr-2" />
          ซื้อทั้งหมด
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
