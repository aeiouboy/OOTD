'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Trash2, Eye } from 'lucide-react'
import { WishlistEmptyState } from './WishlistEmptyState'
import type { WishlistItem } from '@/lib/hooks/useWishlist'
import type { Outfit } from '@/lib/types'

interface WishlistGridProps {
  items: WishlistItem[]
  onViewOutfit: (outfit: Outfit) => void
  onRemove: (outfitId: string) => void
}

export function WishlistGrid({ items, onViewOutfit, onRemove }: WishlistGridProps) {
  if (items.length === 0) {
    return <WishlistEmptyState />
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {items.map((item) => {
          const outfit = item.outfit
          const imageSource = outfit.flatLayImageUrl || outfit.flatLayImageBase64 || outfit.imageUrl

          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                {imageSource ? (
                  <Image
                    src={imageSource}
                    alt={outfit.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Heart className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <h4 className="font-medium text-sm line-clamp-2">{outfit.title}</h4>
                <p className="text-primary font-bold text-sm">
                  {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(outfit.totalPrice)}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewOutfit(outfit)}
                    className="flex-1 h-8 text-xs gap-1"
                    aria-label={`View outfit: ${outfit.title}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    ดูลุค
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(item.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    aria-label={`Remove ${outfit.title} from wishlist`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
