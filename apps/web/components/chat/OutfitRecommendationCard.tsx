'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Outfit } from '@/lib/types'
import { Eye, Heart, Share2 } from 'lucide-react'

interface OutfitRecommendationCardProps {
  outfit: Outfit
  onViewOutfit: (outfit: Outfit) => void
}

export function OutfitRecommendationCard({
  outfit,
  onViewOutfit
}: OutfitRecommendationCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <Card className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
      <div className="flex gap-3">
        <div className="w-20 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
          {outfit.imageUrl ? (
            <img
              src={outfit.imageUrl}
              alt={outfit.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <h4 className="font-semibold text-sm line-clamp-2">{outfit.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {outfit.items.length} ชิ้น
          </p>
          <p className="text-base font-bold mt-1">
            ฿{outfit.totalPrice.toLocaleString()}
          </p>

          {/* Action Icons Row */}
          <div className="flex items-center gap-1.5 mt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewOutfit(outfit)}
              className="flex-1 h-7 text-xs gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              ดูลุค
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className="h-7 w-7 p-0"
              aria-label={isLiked ? "Unlike outfit" : "Like outfit"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              aria-label="Share outfit"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
