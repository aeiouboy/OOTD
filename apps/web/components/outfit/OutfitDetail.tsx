'use client'

import { Button } from '@/components/ui/button'
import { OutfitProductList } from './OutfitProductList'
import { StickyPurchaseSection } from './StickyPurchaseSection'
import { SimilarOutfits } from './SimilarOutfits'
import { PanelSizeControls } from '@/components/layout/PanelSizeControls'
import { useResizablePanelContext } from '@/components/layout/ResizablePanel'
import type { Outfit, Product } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'

interface OutfitDetailProps {
  outfit: Outfit
  similarOutfits?: Outfit[]
  onBack: () => void
  onBuyProduct: (product: Product) => void
  onBuyAll: () => void
  onSelectSimilar?: (outfit: Outfit) => void
}

export function OutfitDetail({
  outfit,
  similarOutfits = [],
  onBack,
  onBuyProduct,
  onBuyAll,
  onSelectSimilar
}: OutfitDetailProps) {
  // Get resize controls from ResizablePanel context (optional - only if in resizable panel)
  let panelWidth = 420
  let setPresetSize: ((size: number) => void) | undefined
  try {
    const context = useResizablePanelContext()
    panelWidth = context.panelWidth
    setPresetSize = context.setPresetSize
  } catch {
    // Not in a resizable panel context, that's okay
  }

  if (!outfit) return null

  return (
    <div className="h-full flex flex-col">
      {/* Header with back button and resize controls */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            onClick={onBack}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore more outfits
          </Button>
          {setPresetSize && <PanelSizeControls currentWidth={panelWidth} onSizeChange={setPresetSize} />}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Outfit title and occasion */}
          <h2 className="text-lg font-bold mb-1 text-foreground">{outfit.title}</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            {outfit.description || 'Office wear'}
          </p>

          {/* Outfit preview image */}
          <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {outfit.imageUrl ? (
              <img
                src={outfit.imageUrl}
                alt={outfit.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>

          {/* Product list */}
          <OutfitProductList
            products={outfit.items}
            onBuyProduct={onBuyProduct}
          />

          {/* Similar outfits */}
          {onSelectSimilar && (
            <SimilarOutfits
              outfits={similarOutfits}
              onSelectOutfit={onSelectSimilar}
            />
          )}
        </div>
      </div>

      {/* Sticky purchase section */}
      <StickyPurchaseSection
        totalPrice={outfit.totalPrice}
        onBuyAll={onBuyAll}
      />
    </div>
  )
}
