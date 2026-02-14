'use client'

import { OccasionSuggestionCard } from './OccasionSuggestionCard'
import type { SuggestionProduct } from './OccasionSuggestionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/Pagination'
import type { OccasionType } from '@/lib/supabase/types'
import { ShoppingBag, AlertCircle } from 'lucide-react'

interface OccasionSuggestionGridProps {
  products: SuggestionProduct[]
  isLoading: boolean
  occasion: OccasionType | null
  onProductClick?: (product: SuggestionProduct) => void
  error?: string | null
  onRetry?: () => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function OccasionSuggestionGrid({
  products,
  isLoading,
  occasion,
  onProductClick,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
}: OccasionSuggestionGridProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm">
          No suggestions for this occasion yet
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Try selecting a different occasion
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {products.map((product) => (
          <OccasionSuggestionCard
            key={product.id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
      {page != null && totalPages != null && onPageChange && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  )
}
