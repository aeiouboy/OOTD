"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Product } from "@/lib/types"
import { mockProducts } from "@/lib/mock-data"
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShoppingBag,
  Heart,
  Share2,
  ZoomIn,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isLiked, setIsLiked] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)

  // Mock related products
  const relatedProducts = mockProducts.filter((p) => p.sku !== product?.sku).slice(0, 3)

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || "")
      setSelectedColor(product.colors?.[0] || "")
      setCurrentImageIndex(0)
      setQuantity(1)
    }
  }, [product])

  if (!product) return null

  const nextImage = () => {
    // For demo, we'll cycle through the same image with different query params
    setCurrentImageIndex((prev) => (prev + 1) % 3)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + 3) % 3)
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 z-modal-content">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-muted">
            <DialogHeader className="absolute top-4 left-4 right-4 z-20 flex-row items-center justify-between space-y-0">
              <DialogTitle className="sr-only">{product.name}</DialogTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-sm"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogHeader>

            <div className="aspect-square relative group">
              <img
                src={`${product.imageUrl}?variant=${currentImageIndex}`}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform cursor-zoom-in ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Image Navigation */}
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-4 right-4 h-8 w-8 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-sm"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white shadow-sm" : "bg-white/60"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <h1 className="text-2xl font-bold text-balance">{product.name}</h1>
                </div>
                <Badge className={getAvailabilityColor(product.availability)}>
                  {getAvailabilityText(product.availability)}
                </Badge>
              </div>
              <p className="text-3xl font-bold">฿{product.price.toLocaleString()}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      className="min-w-[3rem]"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                disabled={product.availability === "out_of_stock"}
                onClick={() => window.open(product.onlineUrl, "_blank")}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Buy Online
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <MapPin className="w-4 h-4 mr-2" />
                Find in Store
              </Button>
            </div>

            {/* Store Locations */}
            {product.storeLocations && product.storeLocations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Available at:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.storeLocations.map((location) => (
                    <Badge key={location} variant="secondary">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>Free delivery</span>
              </div>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                <span>30-day returns</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Warranty</span>
              </div>
            </div>

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>Product Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground text-pretty">
                    This premium {product.name.toLowerCase()} from {product.brand} combines style and comfort for the
                    modern wardrobe. Crafted with attention to detail and quality materials, it's perfect for both
                    casual and formal occasions.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Care Instructions</AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Machine wash cold with like colors</li>
                    <li>• Do not bleach</li>
                    <li>• Tumble dry low</li>
                    <li>• Iron on low heat if needed</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Free standard shipping on orders over ฿1,000. Express delivery available.</p>
                    <p>30-day return policy. Items must be in original condition with tags attached.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t p-6">
            <h3 className="font-bold text-lg mb-4">You might also like</h3>
            <div className="grid grid-cols-3 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.sku} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <img
                      src={relatedProduct.imageUrl || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                    <p className="text-sm font-medium text-balance leading-tight">{relatedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">{relatedProduct.brand}</p>
                    <p className="text-sm font-bold mt-1">฿{relatedProduct.price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
