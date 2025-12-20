'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function OutfitCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-[3/4] w-full" />

      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Item count */}
        <Skeleton className="h-4 w-1/3" />

        {/* Price */}
        <Skeleton className="h-6 w-1/2 mt-2" />
      </div>
    </Card>
  )
}
