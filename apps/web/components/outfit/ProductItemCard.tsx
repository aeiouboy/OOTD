'use client'

import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'

interface ProductItemCardProps {
  product: Product
  onBuyNow: (product: Product) => void
}

export function ProductItemCard({ product, onBuyNow }: ProductItemCardProps) {
  return (
    <div className="flex gap-3 p-3 border rounded-lg">
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium line-clamp-2 text-sm text-foreground">{product.name}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{product.brand}</p>
        <p className="text-primary font-bold mt-1">
          ฿{product.price.toLocaleString()}
        </p>
      </div>

      <Button
        size="sm"
        onClick={() => onBuyNow(product)}
        className="self-center"
      >
        Buy Now
      </Button>
    </div>
  )
}
