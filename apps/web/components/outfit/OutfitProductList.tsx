'use client'

import { ProductItemCard } from './ProductItemCard'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/types'

interface OutfitProductListProps {
  products: Product[]
  onBuyProduct: (product: Product) => void
}

export function OutfitProductList({ products, onBuyProduct }: OutfitProductListProps) {
  return (
    <div className="space-y-3">
      {/* Section header with icon */}
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">
          Shop this look ({products.length} items)
        </h3>
      </div>

      {/* Helper text explaining the relationship */}
      <p className="text-xs text-muted-foreground -mt-1">
        Products featured in the outfit above
      </p>

      {/* Product cards */}
      <div className="space-y-2">
        {products.map((product) => (
          <ProductItemCard
            key={product.sku}
            product={product}
            onBuyNow={onBuyProduct}
          />
        ))}
      </div>
    </div>
  )
}
