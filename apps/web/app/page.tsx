"use client"

import { useState, useEffect } from "react"
import ChatInterface from "@/components/chat/ChatInterface"
import OutfitDetails from "@/components/outfit/OutfitDetails"
import { Button } from "@/components/ui/button"
import { NavigationFilters } from "@/components/navigation/NavigationFilters"
import { OutfitDiscovery } from "@/components/outfit/OutfitDiscovery"
import { ChatAssistant } from "@/components/chat/ChatAssistant"
import { OutfitDetail } from "@/components/outfit/OutfitDetail"
import { ResizablePanel } from "@/components/layout/ResizablePanel"
import { useOutfitDiscovery } from "@/lib/hooks/useOutfitDiscovery"
import { useOutfitCache } from "@/lib/hooks/useOutfitCache"
import { loadProducts, fetchOutfits } from "@/lib/services/outfit-service"
import type { Product, Outfit } from "@/lib/types"
import { getGenderSpecificUrl, getSimilarOutfits } from "@/lib/utils/product-utils"
import { initializeProductCatalog } from "@/lib/data-loader"
import { MessageCircle, Sparkles, Bell, SlidersHorizontal, Grid3x3 } from "lucide-react"
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow"
import { useUserProfile } from "@/lib/hooks/useUserProfile"
import { OccasionFilterChips, OccasionSuggestionGrid } from "@/components/occasion"
import { useOccasionSuggestions } from "@/lib/hooks/useOccasionSuggestions"
import type { SuggestionProduct } from "@/lib/hooks/useOccasionSuggestions"
import type { OccasionType } from "@/lib/supabase/types"
import ProductModal from "@/components/product/ProductModal"

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isOutfitDetailsOpen, setIsOutfitDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"outfits" | "chat" | "filters">("outfits")
  const [products, setProducts] = useState<Product[]>([])
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType | null>(null)

  // Occasion suggestions hook
  const { products: occasionProducts, isLoading: isLoadingOccasion, error: occasionError, refetch: refetchOccasion } = useOccasionSuggestions(selectedOccasion)

  // User profile hook for onboarding
  const { profile, isLoading: isLoadingProfile } = useUserProfile()

  // Cache hook
  const { getFromCache, saveToCache } = useOutfitCache()

  // Check onboarding status after profile loads
  useEffect(() => {
    if (!isLoadingProfile) {
      // Only hide onboarding if profile exists AND onboarding is completed
      if (profile?.onboardingCompleted) {
        setShowOnboarding(false)
      }
      // If no profile or onboarding not completed, keep showOnboarding as true
    }
  }, [profile, isLoadingProfile])

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  // Load products on mount
  useEffect(() => {
    // Initialize product catalog (loads both legacy and enhanced products)
    initializeProductCatalog()
      .then(({ legacy, enhanced }) => {
        console.log(`[HomePage] Loaded ${legacy.length} legacy products, ${enhanced.length} enhanced products`)
        setProducts(legacy)
      })
      .catch(err => {
        console.error('Failed to load products:', err)
        // Fallback to old loadProducts method
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

  // Generate outfits when products load or filters change
  useEffect(() => {
    if (products.length === 0) return

    // Check cache first
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
      // ESC key to close product detail or outfit details
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
    // Open first product's URL as default
    const firstProduct = selectedOutfit.items[0]
    if (firstProduct) {
      handleBuyProduct(firstProduct)
    }
  }

  const getSimilarOutfitsForSelected = (): Outfit[] => {
    if (!selectedOutfit) return []
    return getSimilarOutfits(selectedOutfit, filteredOutfits, 6)
  }

  // Desktop three-panel layout
  const renderDesktopLayout = () => (
    // Full-width responsive layout that expands to fill the viewport
    // - Left Panel: Fixed 280px width for consistent navigation experience
    // - Middle Panel: Flexible (flex-1) to take remaining space
    // - Right Panel: Fixed 420px width for chat/details
    // This ensures the layout always fills 100% viewport width without max-width constraints

    <div className="hidden lg:flex h-screen w-full">
      {/* Left Panel - Navigation & Filters */}
      <div className="w-[280px] flex-shrink-0">
        <NavigationFilters
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Middle Panel - Outfit Discovery (Flexible, takes remaining space) */}
      <main className="flex-1 min-w-0 overflow-y-auto" aria-label="Outfit Recommendations">
        <div className="px-4 pt-3">
          <OccasionFilterChips selected={selectedOccasion} onSelect={setSelectedOccasion} />
        </div>
        {selectedOccasion ? (
          <OccasionSuggestionGrid
            products={occasionProducts}
            isLoading={isLoadingOccasion}
            occasion={selectedOccasion}
            onProductClick={handleOccasionProductClick}
            error={occasionError}
            onRetry={refetchOccasion}
          />
        ) : (
          <OutfitDiscovery
            outfits={filteredOutfits}
            onSelectOutfit={selectOutfit}
            onClearFilters={resetFilters}
            isLoading={isLoadingProducts || isLoadingOutfits}
          />
        )}
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
          <ChatAssistant onViewOutfit={selectOutfit} />
        </div>
        <div className={viewMode === "detail" && selectedOutfit ? "h-full" : "hidden"}>
          <OutfitDetail
            outfit={selectedOutfit}
            similarOutfits={getSimilarOutfitsForSelected()}
            onBack={backToChat}
            onBuyProduct={handleBuyProduct}
            onBuyAll={handleBuyAll}
            onSelectSimilar={selectOutfit}
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
          <Button variant="ghost" size="sm" className="h-10 w-10">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className={activeTab === "outfits" ? "block" : "hidden"}>
          <div className="px-5 pt-3">
            <OccasionFilterChips selected={selectedOccasion} onSelect={setSelectedOccasion} />
          </div>
          {selectedOccasion ? (
            <OccasionSuggestionGrid
              products={occasionProducts}
              isLoading={isLoadingOccasion}
              occasion={selectedOccasion}
              onProductClick={handleOccasionProductClick}
              error={occasionError}
              onRetry={refetchOccasion}
            />
          ) : (
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {filteredOutfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border rounded-lg overflow-hidden"
                    onClick={() => selectOutfit(outfit)}
                  >
                    <div className="aspect-[3/4] bg-gray-100"></div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{outfit.title}</h3>
                      <p className="text-primary font-bold text-sm mt-1">฿{outfit.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={activeTab === "chat" ? "block h-full" : "hidden"}>
          <ChatInterface
            onOutfitSelect={(outfitId) => {
              const outfit = allOutfits.find(o => o.id === outfitId)
              if (outfit) selectOutfit(outfit)
            }}
            onViewDetails={selectOutfit}
          />
        </div>

        {activeTab === "filters" && (
          <NavigationFilters
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={resetFilters}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t bg-background">
        <div className="flex items-center justify-around py-3">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1.5 h-auto py-2 ${activeTab === "filters" ? "text-primary" : "text-gray-600"
              }`}
            onClick={() => setActiveTab("filters")}
          >
            <SlidersHorizontal className="w-6 h-6" />
            <span className="text-xs font-medium">กรอง</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1.5 h-auto py-2 ${activeTab === "outfits" ? "text-primary" : "text-gray-600"
              }`}
            onClick={() => setActiveTab("outfits")}
          >
            <Grid3x3 className="w-6 h-6" />
            <span className="text-xs font-medium">ชุด</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1.5 h-auto py-2 ${activeTab === "chat" ? "text-primary" : "text-gray-600"
              }`}
            onClick={() => setActiveTab("chat")}
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
    return null // or a loading spinner if desired
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
