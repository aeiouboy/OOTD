"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Outfit, Product } from "@/lib/types"
import { ShoppingBag, MapPin, Plus, Heart, Share2, ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface OutfitCardProps {
  outfit: Outfit
  onProductClick?: (product: Product) => void
  onShopLook?: (outfit: Outfit) => void
  onViewDetails?: (outfit: Outfit) => void
  onClick?: () => void
  className?: string
}

function OutfitCard({ outfit, onProductClick, onShopLook, onViewDetails, onClick, className }: OutfitCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % outfit.items.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + outfit.items.length) % outfit.items.length)
  }

  const getAvailabilityColor = (availability: Product["availability"]) => {
    switch (availability) {
      case "in_stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "out_of_stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getAvailabilityText = (availability: Product["availability"]) => {
    switch (availability) {
      case "in_stock":
        return "In Stock"
      case "low_stock":
        return "Low Stock"
      case "out_of_stock":
        return "Out of Stock"
      default:
        return "Unknown"
    }
  }

  return (
    <Card
      className={`overflow-hidden animate-fade-in-up ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      role="article"
      aria-label={`Outfit: ${outfit.title}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Hero Image Section */}
        <div className="relative aspect-[3/4] bg-muted">
          <img
            src={outfit.imageUrl || "/placeholder.svg?height=400&width=320"}
            alt={outfit.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=400&width=320"
            }}
          />

          {/* Image Navigation */}
          {outfit.items.length > 1 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white backdrop-blur border border-gray-200 shadow-sm"
              onClick={() => setIsLiked(!isLiked)}
              aria-label={isLiked ? "Unlike outfit" : "Like outfit"}
              aria-pressed={isLiked}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-gray-800"}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white backdrop-blur border border-gray-200 shadow-sm"
              aria-label="Share outfit"
            >
              <Share2 className="w-5 h-5 text-gray-600 hover:text-gray-800" />
            </Button>
          </div>

          {/* Image Indicators */}
          {outfit.items.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {outfit.items.map((_, index) => (
                <button
                  key={index}
                  className="image-indicator"
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`View item ${index + 1}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
          {/* Title and Price Section - Fixed layout */}
          <div className="space-y-2">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs md:text-sm text-balance leading-tight line-clamp-2">
                  {outfit.title}
                </h3>
                <p className="text-muted-foreground text-[11px] md:text-xs text-pretty mt-1 line-clamp-2">
                  {outfit.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base md:text-lg font-bold">฿{outfit.totalPrice.toLocaleString()}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap mt-0.5">{outfit.items.length} items</p>
              </div>
            </div>
          </div>

          {/* Product Items Section - Improved spacing */}
          <div className="space-y-2 md:space-y-3">
            <h4 className="text-[11px] md:text-xs font-semibold">Items in this look:</h4>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {outfit.items.map((product) => (
                <div
                  key={product.sku}
                  className="flex-shrink-0 w-24 md:w-28 cursor-pointer group"
                  onClick={() => onProductClick?.(product)}
                >
                  <div className="relative">
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted">
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                    <Badge
                      className={`absolute top-1 right-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 ${getAvailabilityColor(product.availability)}`}
                    >
                      {getAvailabilityText(product.availability)}
                    </Badge>
                  </div>
                  <div className="mt-1.5 md:mt-2 space-y-0.5">
                    <p className="text-[9px] md:text-[10px] font-medium text-balance leading-tight line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground line-clamp-1">{product.brand}</p>
                    <p className="text-[10px] md:text-xs font-bold">฿{product.price.toLocaleString()}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-1.5 md:mt-2 h-6 md:h-7 text-[10px] md:text-xs bg-transparent"
                    disabled={product.availability === "out_of_stock"}
                  >
                    <Eye className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1" />
                    View Look
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons - Improved responsive sizing */}
          <div className="flex gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                className="flex-1 h-9 md:h-10 text-xs md:text-sm bg-transparent"
                onClick={() => onViewDetails(outfit)}
              >
                View Details
              </Button>
            )}
            <Button
              className={`${onViewDetails ? 'flex-1' : 'flex-1'} h-9 md:h-10 text-xs md:text-sm`}
              onClick={() => onShopLook?.(outfit)}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop Look
            </Button>
            <Button variant="outline" size="sm" className="px-2.5 md:px-3 h-9 md:h-10 bg-transparent flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </Button>
          </div>

          {/* Store Availability - Only show if locations exist */}
          {(() => {
            const storeLocations = Array.from(new Set(outfit.items.flatMap((item) => item.storeLocations || [])))
            // If no locations from data, use default Central locations
            const locations = storeLocations.length > 0 ? storeLocations : ['Central Chidlom', 'Central World', 'Central Ladprao']

            return (
              <div className="pt-3 md:pt-4 border-t space-y-2.5">
                <p className="text-xs text-muted-foreground">Available at:</p>
                <div className="flex flex-wrap gap-1.5">
                  {locations.map((location) => (
                    <Badge key={location} variant="secondary" className="text-xs px-2 py-0.5">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </CardContent>
    </Card>
  )
}

export default OutfitCard
export { OutfitCard }
