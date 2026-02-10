'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OccasionType } from '@/lib/supabase/types'

export interface SuggestionProduct {
  id: string
  sku: string | null
  product_name: string
  brand: string | null
  price: number | null
  original_price: number | null
  image_url: string | null
  link: string | null
  availability: string | null
  product_description: string | null
  primary_occasion: OccasionType | null
}

interface OccasionSuggestionCardProps {
  product: SuggestionProduct
  onClick?: (product: SuggestionProduct) => void
}

const occasionBadge: Record<OccasionType, { label: string; className: string }> = {
  weekend_social: { label: 'Weekend', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  date_night: { label: 'Date Night', className: 'bg-pink-100 text-pink-700 border-pink-200' },
  everyday_casual: { label: 'Everyday', className: 'bg-blue-100 text-blue-700 border-blue-200' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function OccasionSuggestionCard({ product, onClick }: OccasionSuggestionCardProps) {
  const badge = product.primary_occasion ? occasionBadge[product.primary_occasion] : null

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-card',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(product)}
      role="article"
      aria-label={product.product_name}
      data-testid="suggestion-card"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.product_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              // Hide broken image and show fallback
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xl font-bold">
            {getInitials(product.product_name)}
          </div>
        )}

        {/* Occasion badge */}
        {badge && (
          <Badge
            className={cn(
              'absolute top-2 right-2 text-[10px] px-1.5 py-0.5 border',
              badge.className
            )}
          >
            {badge.label}
          </Badge>
        )}
      </div>

      {/* Product info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium line-clamp-1">{product.product_name}</h3>
        {product.brand && (
          <p className="text-xs text-gray-500 line-clamp-1">{product.brand}</p>
        )}
        {product.price != null && (
          <p className="text-sm font-bold text-primary">
            &#x0E3F;{product.price.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
