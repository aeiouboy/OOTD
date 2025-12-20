"use client"

import { useState } from "react"
import OutfitCard from "./OutfitCard"
import { OutfitCardSkeleton } from "@/components/ui/skeleton"
import type { Outfit, Product } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OutfitGridProps {
  outfits: Outfit[]
  onProductClick?: (product: Product) => void
  onShopLook?: (outfit: Outfit) => void
  onViewDetails?: (outfit: Outfit) => void
  className?: string
  isLoading?: boolean
}

export default function OutfitGrid({ outfits, onProductClick, onShopLook, onViewDetails, className, isLoading = false }: OutfitGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextOutfit = () => {
    setCurrentIndex((prev) => (prev + 1) % outfits.length)
  }

  const prevOutfit = () => {
    setCurrentIndex((prev) => (prev - 1 + outfits.length) % outfits.length)
  }

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        {/* Mobile: Single skeleton */}
        <div className="md:hidden">
          <OutfitCardSkeleton />
        </div>

        {/* Desktop: Grid of skeletons */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <OutfitCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (outfits.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: Single Card with Navigation */}
      <div className="md:hidden">
        <div className="relative">
          <OutfitCard outfit={outfits[currentIndex]} onProductClick={onProductClick} onShopLook={onShopLook} onViewDetails={onViewDetails} />

          {outfits.length > 1 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur shadow-lg z-10"
                onClick={prevOutfit}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur shadow-lg z-10"
                onClick={nextOutfit}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Outfit Indicators */}
        {outfits.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {outfits.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} onProductClick={onProductClick} onShopLook={onShopLook} onViewDetails={onViewDetails} />
        ))}
      </div>
    </div>
  )
}
