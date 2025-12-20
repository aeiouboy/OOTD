"use client"

import { Card, CardContent } from "@/components/ui/card"

interface LoadingStateProps {
  count?: number
  className?: string
  gridLayout?: boolean
}

interface SkeletonCardProps {
  className?: string
}

function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Hero Image Skeleton */}
        <div className="relative aspect-[4/5] bg-gray-200 animate-pulse">
          <div className="absolute top-3 right-3 flex gap-2">
            <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
          {/* Title and Price Skeleton */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>

          {/* Product Items Skeleton */}
          <div className="space-y-2 md:space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex-shrink-0 w-24 md:w-32">
                  <div className="relative">
                    <div className="w-full aspect-square bg-gray-200 rounded-md md:rounded-lg animate-pulse"></div>
                    <div className="absolute top-0.5 right-0.5 h-4 w-12 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="mt-1.5 md:mt-2 space-y-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="w-full h-6 md:h-7 bg-gray-200 rounded animate-pulse mt-1.5 md:mt-2"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-2">
            <div className="flex-1 h-9 md:h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-10 md:w-12 h-9 md:h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Store Availability Skeleton */}
          <div className="pt-2 md:pt-3 border-t space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="flex flex-wrap gap-1">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoadingState({
  count = 3,
  className = "",
  gridLayout = true
}: LoadingStateProps) {
  const skeletonCards = [...Array(count)].map((_, index) => (
    <SkeletonCard key={index} />
  ))

  if (!gridLayout) {
    // Single card layout for mobile
    return (
      <div className={`relative ${className}`}>
        <div className="md:hidden">
          <SkeletonCard />
        </div>
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletonCards}
        </div>
      </div>
    )
  }

  // Grid layout
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {skeletonCards}
    </div>
  )
}

// Individual skeleton card export for specific use cases
export { SkeletonCard }