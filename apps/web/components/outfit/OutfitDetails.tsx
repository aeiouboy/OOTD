"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import type { Outfit, Product } from "@/lib/types"
import {
  ShoppingBag,
  MapPin,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react"

interface OutfitDetailsProps {
  outfit: Outfit | null
  isOpen: boolean
  onClose: () => void
  onProductClick?: (product: Product) => void
  onShopLook?: (outfit: Outfit) => void
}

export default function OutfitDetails({
  outfit,
  isOpen,
  onClose,
  onProductClick,
  onShopLook,
}: OutfitDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  if (!outfit) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % outfit.items.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + outfit.items.length) % outfit.items.length)
  }

  const updateQuantity = (sku: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [sku]: Math.max(0, (prev[sku] || 1) + change),
    }))
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden p-0 m-4">
        <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
          {/* Image Section */}
          <div className="relative lg:w-1/2 bg-muted">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] lg:h-[85vh]">
              <img
                src={outfit.imageUrl || "/placeholder.svg?height=600&width=480"}
                alt={outfit.title}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {outfit.items.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur shadow-lg"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur shadow-lg"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur shadow-lg"
                  onClick={() => setIsLiked(!isLiked)}
                  aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur shadow-lg"
                  aria-label="Share outfit"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <DialogClose asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur shadow-lg"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </DialogClose>
              </div>

              {/* Image Indicators */}
              {outfit.items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {outfit.items.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 flex flex-col min-h-0">
            <DialogHeader className="p-4 lg:p-6 pb-3 lg:pb-4 border-b shrink-0">
              <DialogTitle className="text-xl lg:text-2xl font-bold text-left">
                {outfit.title}
              </DialogTitle>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl lg:text-3xl font-bold text-primary">
                  ฿{outfit.totalPrice.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {outfit.items.length} items
                </p>
              </div>
              <DialogDescription className="text-muted-foreground text-left mt-2 text-sm lg:text-base">
                {outfit.description}
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Product List */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0">
              <h3 className="font-semibold mb-4 text-base lg:text-lg">Items in this outfit:</h3>
              <div className="space-y-4">
                {outfit.items.map((product) => {
                  const quantity = quantities[product.sku] || 1
                  return (
                    <div
                      key={product.sku}
                      className="flex gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div
                        className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer group"
                        onClick={() => onProductClick?.(product)}
                      >
                        <img
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg bg-muted group-hover:scale-105 transition-transform"
                        />
                        <Badge
                          className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 ${getAvailabilityColor(product.availability)}`}
                        >
                          {getAvailabilityText(product.availability)}
                        </Badge>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base leading-tight line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.brand}
                        </p>
                        <p className="text-lg sm:text-xl font-bold mt-2">
                          ฿{product.price.toLocaleString()}
                        </p>

                        {/* Size and Color Options */}
                        {(product.sizes || product.colors) && (
                          <div className="mt-3 space-y-2">
                            {product.sizes && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Sizes:</p>
                                <div className="flex gap-1 flex-wrap">
                                  {product.sizes.map((size) => (
                                    <Badge key={size} variant="outline" className="text-xs">
                                      {size}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {product.colors && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Colors:</p>
                                <div className="flex gap-1 flex-wrap">
                                  {product.colors.map((color) => (
                                    <Badge key={color} variant="outline" className="text-xs">
                                      {color}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center border rounded">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 sm:h-8 sm:w-8 p-0 rounded-none"
                              onClick={() => updateQuantity(product.sku, -1)}
                              disabled={quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 sm:w-3 sm:h-3" />
                            </Button>
                            <span className="px-3 py-2 sm:py-1 text-sm min-w-[3rem] text-center">
                              {quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 sm:h-8 sm:w-8 p-0 rounded-none"
                              onClick={() => updateQuantity(product.sku, 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent h-9 sm:h-8"
                            disabled={product.availability === "out_of_stock"}
                            onClick={() => onProductClick?.(product)}
                          >
                            <Plus className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Store Availability */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-3">Available at:</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(outfit.items.flatMap((item) => item.storeLocations || []))).map((location) => (
                    <Badge key={location} variant="secondary" className="text-sm px-3 py-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 lg:p-6 border-t bg-muted/30 shrink-0">
              <div className="flex gap-3">
                <Button
                  className="flex-1 h-10 lg:h-12 text-sm lg:text-base"
                  onClick={() => outfit && onShopLook?.(outfit)}
                >
                  <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  Shop Complete Look
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3 lg:px-4 h-10 lg:h-12 bg-transparent"
                  aria-label="Find in store"
                >
                  <MapPin className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}