"use client"

import { useState, useEffect, useCallback } from "react"

import OutfitDetails from "@/components/outfit/OutfitDetails"
import { Button } from "@/components/ui/button"
import { NavigationFilters } from "@/components/navigation/NavigationFilters"
import { ChatAssistant } from "@/components/chat/ChatAssistant"
import { OutfitDetail } from "@/components/outfit/OutfitDetail"
import { ResizablePanel } from "@/components/layout/ResizablePanel"
import { useOutfitDiscovery } from "@/lib/hooks/useOutfitDiscovery"
import { useOutfitCache } from "@/lib/hooks/useOutfitCache"
import { loadProducts, fetchOutfits } from "@/lib/services/outfit-service"
import type { Product, Outfit } from "@/lib/types"
import { getGenderSpecificUrl, getSimilarOutfits } from "@/lib/utils/product-utils"
import { initializeProductCatalog } from "@/lib/data-loader"
import { MessageCircle, Sparkles, Bell, SlidersHorizontal, Grid3x3, Heart, ArrowLeft } from "lucide-react"
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow"
import { useUserProfile } from "@/lib/hooks/useUserProfile"
import { OccasionFilterChips, OccasionSuggestionGrid } from "@/components/occasion"
import { useOccasionSuggestions } from "@/lib/hooks/useOccasionSuggestions"
import type { SuggestionProduct, OccasionFilter } from "@/lib/hooks/useOccasionSuggestions"
import type { OccasionType } from "@/lib/types/enums"
import ProductModal from "@/components/product/ProductModal"
import { useWishlist } from "@/lib/hooks/useWishlist"
import { WishlistGrid } from "@/components/wishlist/WishlistGrid"

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isOutfitDetailsOpen, setIsOutfitDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"outfits" | "chat" | "filters">("outfits")
  const [products, setProducts] = useState<Product[]>([])
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionFilter | null>(null)
  const [showWishlist, setShowWishlist] = useState(false)

  // Wishlist hook
  const wishlist = useWishlist()

  // User profile hook for onboarding
  const { profile, isLoading: isLoadingProfile } = useUserProfile()

  // Cache hook
  const { getFromCache, saveToCache } = useOutfitCache()

  // Check onboarding status after profile loads
  useEffect(() => {
    if (!isLoadingProfile) {
      if (profile?.onboardingCompleted) {
        setShowOnboarding(false)
      }
    }
  }, [profile, isLoadingProfile])

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  // Load products on mount
  useEffect(() => {
    initializeProductCatalog()
      .then(({ legacy, enhanced }) => {
        console.log(`[HomePage] Loaded ${legacy.length} legacy products, ${enhanced.length} enhanced products`)
        setProducts(legacy)
      })
      .catch(err => {
        console.error('Failed to load products:', err)
        loadProducts()
          .then(setProducts)
          .catch(() => console.error('Failed to load products'))
      })
      .finally(() => setIsLoadingProducts(false))
  }, [])

  // Use centralized outfit discovery hook
  const {
    filters,
    setFilters,
    filteredOutfits,
    selectedOutfit,
    viewMode,
    selectOutfit,
    backToChat,
    resetFilters
  } = useOutfitDiscovery(allOutfits)

  // Occasion suggestions hook - pass sidebar filters (gender + price) through
  const { products: occasionProducts, isLoading: isLoadingOccasion, error: occasionError, refetch: refetchOccasion, page: occasionPage, totalPages: occasionTotalPages, setPage: setOccasionPage } = useOccasionSuggestions(selectedOccasion, undefined, {
    gender: filters.gender,
    priceMin: filters.priceRange?.min,
    priceMax: filters.priceRange?.max,
  })

  // Handle occasion chip selection (top bar chips only — sidebar no longer has occasion filter)
  const handleOccasionChipSelect = useCallback((occasion: OccasionFilter | null) => {
    setSelectedOccasion(occasion)
  }, [])

  // Generate outfits when products load or filters change
  useEffect(() => {
    if (products.length === 0) return

    const cached = getFromCache(filters)
    if (cached && cached.length > 0) {
      setAllOutfits(cached)
      return
    }

    setIsLoadingOutfits(true)

    fetchOutfits(products, filters, 50)
      .then(outfits => {
        setAllOutfits(outfits)
        saveToCache(filters, outfits)
      })
      .catch(err => {
        console.error('Failed to generate outfits:', err)
      })
      .finally(() => setIsLoadingOutfits(false))
  }, [products, filters, getFromCache, saveToCache])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedProduct) {
          setSelectedProduct(null)
        } else if (selectedOutfit) {
          backToChat()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedProduct, selectedOutfit, backToChat])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleOccasionProductClick = (sp: SuggestionProduct) => {
    const mapped: Product = {
      sku: sp.sku ?? sp.id,
      name: sp.product_name,
      brand: sp.brand ?? 'Unknown',
      price: sp.price ?? 0,
      imageUrl: sp.image_url ?? '',
      availability: 'in_stock',
      onlineUrl: sp.link ?? undefined,
      category: 'Women',
    }
    setSelectedProduct(mapped)
  }

  const handleShopLook = (outfit: Outfit) => {
    console.log("Shopping for outfit:", outfit.title)
  }

  const handleBuyProduct = (product: Product) => {
    const url = getGenderSpecificUrl(product)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleBuyAll = () => {
    if (!selectedOutfit) return
    const firstProduct = selectedOutfit.items[0]
    if (firstProduct) {
      handleBuyProduct(firstProduct)
    }
  }

  const getSimilarOutfitsForSelected = (): Outfit[] => {
    if (!selectedOutfit) return []
    return getSimilarOutfits(selectedOutfit, filteredOutfits, 6)
  }


  // Middle panel content renderer (shared between desktop and mobile)
  const renderMiddlePanel = () => {
    if (showWishlist) {
      return (
        <div>
          <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-lg font-bold">รายการที่ถูกใจ</h2>
              <span className="text-sm text-muted-foreground">{wishlist.count} looks saved</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWishlist(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              กลับ
            </Button>
          </div>
          <WishlistGrid
            items={wishlist.items}
            onViewOutfit={selectOutfit}
            onRemove={wishlist.removeFromWishlist}
          />
        </div>
      )
    }

    return (
      <>
        {/* Top bar with title and wishlist button */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Discover Products</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWishlist(true)}
            className="relative"
            aria-label={`Wishlist: ${wishlist.count} items`}
          >
            <Heart className={`w-5 h-5 ${wishlist.count > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            {wishlist.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.count}
              </span>
            )}
          </Button>
        </div>

        {/* Product grid */}
        <OccasionSuggestionGrid
          products={occasionProducts}
          isLoading={isLoadingOccasion}
          occasion={selectedOccasion}
          onProductClick={handleOccasionProductClick}
          error={occasionError}
          onRetry={refetchOccasion}
          page={occasionPage}
          totalPages={occasionTotalPages}
          onPageChange={setOccasionPage}
        />
      </>
    )
  }

  // Desktop three-panel layout
  const renderDesktopLayout = () => (
    <div className="hidden lg:flex h-screen w-full">
      {/* Left Panel - Navigation & Filters */}
      <div className="w-[280px] flex-shrink-0">
        <NavigationFilters
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={resetFilters}
          selectedOccasion={selectedOccasion}
          onOccasionSelect={handleOccasionChipSelect}
        />
      </div>

      {/* Middle Panel - Product Discovery / Wishlist (Flexible, takes remaining space) */}
      <main className="flex-1 min-w-0 overflow-y-auto" aria-label="Product Discovery">
        {renderMiddlePanel()}
      </main>

      {/* Right Panel - Resizable Chat Assistant + Details */}
      <ResizablePanel
        defaultWidth={420}
        minWidth={280}
        maxWidthPercent={50}
        className="border-l"
        ariaLabel="Chat and outfit details"
      >
        <div className={viewMode === "chat" ? "h-full" : "h-full hidden"}>
          <ChatAssistant
            onViewOutfit={selectOutfit}
            isInWishlist={wishlist.isInWishlist}
            onToggleWishlist={wishlist.toggleWishlist}
          />
        </div>
        <div className={viewMode === "detail" && selectedOutfit ? "h-full" : "hidden"}>
          <OutfitDetail
            outfit={selectedOutfit}
            similarOutfits={getSimilarOutfitsForSelected()}
            onBack={backToChat}
            onBuyProduct={handleBuyProduct}
            onBuyAll={handleBuyAll}
            onSelectSimilar={selectOutfit}
            isInWishlist={selectedOutfit ? wishlist.isInWishlist(selectedOutfit.id) : false}
            onToggleWishlist={selectedOutfit ? () => wishlist.toggleWishlist(selectedOutfit) : undefined}
          />
        </div>
      </ResizablePanel>
    </div>
  )

  // Mobile layout with bottom tabs
  const renderMobileLayout = () => (
    <div className="lg:hidden flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-header border-b bg-background">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-bold">OOTDay</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 relative"
              onClick={() => {
                setShowWishlist(!showWishlist)
                if (!showWishlist) setActiveTab("outfits")
              }}
              aria-label={`Wishlist: ${wishlist.count} items`}
            >
              <Heart className={`w-5 h-5 ${wishlist.count > 0 ? 'text-red-500' : ''}`} />
              {wishlist.count > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.count}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {showWishlist ? (
          <div>
            <div className="px-5 py-3 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span className="font-bold">รายการที่ถูกใจ</span>
                <span className="text-sm text-muted-foreground">{wishlist.count} looks</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowWishlist(false)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                กลับ
              </Button>
            </div>
            <WishlistGrid
              items={wishlist.items}
              onViewOutfit={selectOutfit}
              onRemove={wishlist.removeFromWishlist}
            />
          </div>
        ) : (
          <>
            <div className={activeTab === "outfits" ? "block" : "hidden"}>
              <div className="px-5 pt-3">
                <OccasionFilterChips selected={selectedOccasion} onSelect={handleOccasionChipSelect} />
              </div>
              <OccasionSuggestionGrid
                products={occasionProducts}
                isLoading={isLoadingOccasion}
                occasion={selectedOccasion}
                onProductClick={handleOccasionProductClick}
                error={occasionError}
                onRetry={refetchOccasion}
                page={occasionPage}
                totalPages={occasionTotalPages}
                onPageChange={setOccasionPage}
              />
            </div>

            <div className={activeTab === "chat" ? "block h-full" : "hidden"}>
              <ChatAssistant
                onViewOutfit={selectOutfit}
                isInWishlist={wishlist.isInWishlist}
                onToggleWishlist={wishlist.toggleWishlist}
              />
            </div>

            {activeTab === "filters" && (
              <NavigationFilters
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={resetFilters}
                selectedOccasion={selectedOccasion}
                onOccasionSelect={handleOccasionChipSelect}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t bg-background" role="tablist">
        <div className="flex items-center justify-around py-3">
          <Button
            variant="ghost"
            size="sm"
            role="tab"
            aria-selected={activeTab === "filters"}
            className={`flex flex-col items-center gap-1.5 h-auto py-2 ${activeTab === "filters" ? "text-primary" : "text-gray-600"
              }`}
            onClick={() => { setActiveTab("filters"); setShowWishlist(false) }}
          >
            <SlidersHorizontal className="w-6 h-6" />
            <span className="text-xs font-medium">กรอง</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            role="tab"
            aria-selected={activeTab === "outfits"}
            className={`flex flex-col items-center gap-1.5 h-auto py-2 ${activeTab === "outfits" ? "text-primary" : "text-gray-600"
              }`}
            onClick={() => { setActiveTab("outfits"); setShowWishlist(false) }}
          >
            <Grid3x3 className="w-6 h-6" />
            <span className="text-xs font-medium">ชุด</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            role="tab"
            aria-selected={activeTab === "chat"}
            className={`flex flex-col items-center gap-1.5 h-auto py-2 ${activeTab === "chat" ? "text-primary" : "text-gray-600"
              }`}
            onClick={() => { setActiveTab("chat"); setShowWishlist(false) }}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-medium">แชท</span>
          </Button>
        </div>
      </nav>
    </div>
  )

  // Show loading state while profile is being loaded
  if (isLoadingProfile) {
    return null
  }

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  // Show main app
  return (
    <>
      {renderDesktopLayout()}
      {renderMobileLayout()}

      {/* Outfit Details Modal - for mobile */}
      <OutfitDetails
        outfit={selectedOutfit}
        isOpen={isOutfitDetailsOpen}
        onClose={() => {
          setIsOutfitDetailsOpen(false)
          backToChat()
        }}
        onProductClick={handleProductClick}
        onShopLook={handleShopLook}
      />

      {/* Product Detail Modal - for occasion products and outfit product clicks */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}
