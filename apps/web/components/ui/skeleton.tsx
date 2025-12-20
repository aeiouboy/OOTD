import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  )
}

// Outfit Card Skeleton for loading states
function OutfitCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border bg-card overflow-hidden ${className}`}>
      <div className="p-0">
        {/* Image skeleton */}
        <Skeleton className="aspect-[3/4] w-full rounded-none" />

        <div className="p-4 space-y-4">
          {/* Title and price skeleton */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>

          {/* Items section */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-24 space-y-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-md" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>

          {/* Store locations */}
          <div className="pt-3 border-t space-y-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Product Detail Skeleton
function ProductDetailSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Skeleton className="h-10 w-40 mb-4" />

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image section */}
          <div className="bg-muted">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
          </div>

          {/* Details section */}
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-16" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-20" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Skeleton, OutfitCardSkeleton, ProductDetailSkeleton }
