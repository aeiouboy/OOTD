'use client'

import type { Outfit } from '@/lib/types'
import { Card } from '@/components/ui/card'

interface SimilarOutfitsProps {
  outfits: Outfit[]
  onSelectOutfit: (outfit: Outfit) => void
}

export function SimilarOutfits({ outfits, onSelectOutfit }: SimilarOutfitsProps) {
  if (outfits.length === 0) return null

  return (
    <div className="mt-6 pb-4">
      <h3 className="font-medium mb-3">Similar outfits</h3>

      <div className="grid grid-cols-2 gap-3">
        {outfits.slice(0, 6).map((outfit) => (
          <Card
            key={outfit.id}
            className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
            onClick={() => onSelectOutfit(outfit)}
          >
            <div className="aspect-[3/4] bg-gray-100">
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

            <div className="p-2">
              <p className="text-xs font-medium line-clamp-1">{outfit.title}</p>
              <p className="text-xs text-primary font-bold mt-1">
                ฿{outfit.totalPrice.toLocaleString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
