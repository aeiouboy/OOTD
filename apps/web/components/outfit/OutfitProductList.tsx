'use client'

import { ProductItemCard } from './ProductItemCard'
import type { Product } from '@/lib/types'

interface OutfitProductListProps {
  products: Product[]
  onBuyProduct: (product: Product) => void
}

export function OutfitProductList({ products, onBuyProduct }: OutfitProductListProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">
        Items in this outfit ({products.length} items)
      </h3>

      <div className="space-y-3">
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
