'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ImageOff } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductItemCardProps {
  product: Product
  onBuyNow: (product: Product) => void
}

/**
 * Check if product has a valid (non-placeholder) image
 */
function hasValidImage(imageUrl: string | undefined): boolean {
  if (!imageUrl) return false
  const isPlaceholder = imageUrl.includes('placeholder.svg') ||
                        imageUrl.includes('?text=') ||
                        imageUrl.includes('?height=') ||
                        imageUrl === ''
  return !isPlaceholder
}

export function ProductItemCard({ product, onBuyNow }: ProductItemCardProps) {
  const [imageError, setImageError] = useState(false)
  const showImage = hasValidImage(product.imageUrl) && !imageError

  return (
    <div className="flex gap-3 p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
      {/* Product image - only show if valid, otherwise show icon */}
      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        {showImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ShoppingBag className="w-6 h-6 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="font-medium line-clamp-1 text-sm text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <p className="text-primary font-bold text-sm">
          ฿{product.price.toLocaleString()}
        </p>
      </div>

      {/* Buy button */}
      <Button
        size="sm"
        onClick={() => onBuyNow(product)}
        className="self-center h-8 px-3"
      >
        Buy Now
      </Button>
    </div>
  )
}
