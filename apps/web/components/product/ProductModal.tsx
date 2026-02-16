"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Product } from "@/lib/types"
import { mockProducts } from "@/lib/mock-data"
import { getGenderSpecificUrl } from "@/lib/utils/product-utils"
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

const PLACEHOLDER_IMAGE = "/placeholder.svg"

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isLiked, setIsLiked] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [hasMainImageError, setHasMainImageError] = useState(false)
  const [brokenRelatedImages, setBrokenRelatedImages] = useState<Record<string, boolean>>({})

  const relatedProducts = mockProducts.filter((p) => p.sku !== product?.sku).slice(0, 3)
  const productImage = product?.imageUrl || PLACEHOLDER_IMAGE
  const galleryImages = [productImage]
  const activeImage =
    hasMainImageError ? PLACEHOLDER_IMAGE : (galleryImages[currentImageIndex] || PLACEHOLDER_IMAGE)

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || "")
      setSelectedColor(product.colors?.[0] || "")
      setCurrentImageIndex(0)
      setQuantity(1)
      setIsZoomed(false)
      setHasMainImageError(false)
      setBrokenRelatedImages({})
    }
  }, [product])

  if (!product) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
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

  const openProductUrl = (targetProduct: Product) => {
    const url = targetProduct.onlineUrl || getGenderSpecificUrl(targetProduct)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleShareProduct = async () => {
    const shareUrl = product.onlineUrl || getGenderSpecificUrl(product)

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: product.name,
          text: `${product.brand} - ${product.name}`,
          url: shareUrl,
        })
        return
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        return
      }

      window.open(shareUrl, "_blank", "noopener,noreferrer")
    } catch {
      window.open(shareUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleFindInStore = () => {
    const firstLocation = product.storeLocations?.[0]
    const query = firstLocation ? `${product.brand} ${firstLocation}` : `${product.brand} store central`
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    window.open(mapsUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="z-modal-content max-h-[92vh] w-[96vw] max-w-[1240px] overflow-y-auto p-0">
        <div className="flex flex-col">
          <div className="grid md:grid-cols-2 md:divide-x">
            {/* Image Section */}
            <div className="relative bg-muted/40">
              <DialogHeader className="absolute left-4 right-4 top-4 z-20 flex-row items-center justify-between space-y-0">
                <DialogTitle className="sr-only">{product.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  Product details, pricing, and purchase actions for {product.name}.
                </DialogDescription>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-10 w-10 rounded-full bg-background/90 p-0 shadow-sm backdrop-blur-sm"
                    onClick={() => setIsLiked(!isLiked)}
                    aria-label={isLiked ? "Unlike product" : "Like product"}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-10 w-10 rounded-full bg-background/90 p-0 shadow-sm backdrop-blur-sm"
                    aria-label="Share product"
                    onClick={handleShareProduct}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 rounded-full bg-background/90 p-0 shadow-sm backdrop-blur-sm"
                  onClick={onClose}
                  aria-label="Close product details"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>

              <div className="group relative h-[44vh] min-h-[320px] md:h-full md:min-h-[620px]">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 96vw"
                  className={`cursor-zoom-in object-cover transition-transform duration-300 ${isZoomed ? "scale-125" : "scale-100"}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onError={() => setHasMainImageError(true)}
                />

                {/* Image Navigation */}
                {galleryImages.length > 1 && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 p-0 shadow-sm backdrop-blur-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
                      onClick={prevImage}
                      aria-label="View previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 p-0 shadow-sm backdrop-blur-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
                      onClick={nextImage}
                      aria-label="View next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-background/90 p-0 shadow-sm backdrop-blur-sm"
                  onClick={() => setIsZoomed(!isZoomed)}
                  aria-label={isZoomed ? "Zoom out image" : "Zoom in image"}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Indicators */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-white shadow-sm" : "bg-white/60"}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="bg-background px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.brand}</p>
                    <h1 className="break-words text-2xl font-bold leading-tight text-pretty sm:text-[2rem]">
                      {product.name}
                    </h1>
                  </div>
                  <Badge className={getAvailabilityColor(product.availability)}>
                    {getAvailabilityText(product.availability)}
                  </Badge>
                </div>
                <p className="text-4xl font-bold leading-none">฿{product.price.toLocaleString()}</p>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-semibold">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        className="min-w-[3rem] rounded-md"
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
                <div className="mt-6">
                  <h3 className="mb-3 font-semibold">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="sm"
                        className="rounded-md"
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6">
                <h3 className="mb-3 font-semibold">Quantity</h3>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 rounded-xl border-primary/40 p-0 text-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-10 text-center text-2xl font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 rounded-xl border-primary p-0 text-lg"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  className="h-12 w-full text-lg font-semibold"
                  disabled={product.availability === "out_of_stock"}
                  onClick={() => openProductUrl(product)}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Buy Online
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full bg-transparent text-lg font-semibold"
                  onClick={handleFindInStore}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Find in Store
                </Button>
              </div>

              {/* Features */}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  <span>Free delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  <span>30-day returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  <span>Warranty</span>
                </div>
              </div>

              {/* Store Locations */}
              {product.storeLocations && product.storeLocations.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-semibold">Available at:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.storeLocations.map((location) => (
                      <Badge key={location} variant="secondary">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Details Accordion */}
              <Accordion type="single" collapsible className="mt-6 w-full">
                <AccordionItem value="description">
                  <AccordionTrigger>Product Description</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-pretty text-sm text-muted-foreground">
                      This premium {product.name.toLowerCase()} from {product.brand} combines style and comfort for the
                      modern wardrobe. Crafted with attention to detail and quality materials, it&apos;s perfect for both
                      casual and formal occasions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care">
                  <AccordionTrigger>Care Instructions</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-sm text-muted-foreground">
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
                    <div className="space-y-2 text-sm text-muted-foreground">
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
            <div className="border-t bg-muted/20 px-4 py-5 sm:px-6 md:px-8">
              <h3 className="mb-4 text-2xl font-bold">You might also like</h3>
              <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.sku}
                    className="min-w-[220px] flex-shrink-0 cursor-pointer transition-shadow hover:shadow-md md:min-w-0"
                    role="button"
                    tabIndex={0}
                    onClick={() => openProductUrl(relatedProduct)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        openProductUrl(relatedProduct)
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={brokenRelatedImages[relatedProduct.sku] ? PLACEHOLDER_IMAGE : (relatedProduct.imageUrl || PLACEHOLDER_IMAGE)}
                          alt={relatedProduct.name}
                          fill
                          sizes="(min-width: 768px) 20vw, 220px"
                          className="object-cover"
                          onError={() =>
                            setBrokenRelatedImages((prev) => ({ ...prev, [relatedProduct.sku]: true }))
                          }
                        />
                      </div>
                      <p className="line-clamp-2 text-sm font-medium leading-tight">{relatedProduct.name}</p>
                      <p className="text-xs text-muted-foreground">{relatedProduct.brand}</p>
                      <p className="mt-1 text-sm font-bold">฿{relatedProduct.price.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
