'use client'

import type { Product } from '@/lib/types'

interface FlatLayCompositeProps {
  items: Product[]
  renderMode?: 'product-images' | 'abstract'
}

interface CategorizedItems {
  mainItem: Product | null
  shoes: Product[]
  accessories: Product[]
}

/**
 * ProductImage - Renders a product image with promotional banner cropping
 * Crops the bottom ~15% of the image to hide promotional overlays/banners
 * that are commonly baked into Central Group catalog images
 */
function ProductImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className="w-full h-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        className={`w-full h-[118%] object-cover object-top ${className}`}
        style={{
          // Crop bottom 15% by making image 118% height and only showing top portion
          // object-position: top ensures the clothing item stays visible
        }}
      />
    </div>
  )
}

/**
 * Maps known color tokens into soft CSS colors for abstract fallback blocks.
 */
function resolveItemAccentColor(item: Product): string {
  const firstColor = item.colors?.[0]?.toLowerCase() || ''

  if (firstColor.includes('black')) return '#374151'
  if (firstColor.includes('white')) return '#E5E7EB'
  if (firstColor.includes('gray') || firstColor.includes('grey')) return '#9CA3AF'
  if (firstColor.includes('navy')) return '#1E3A8A'
  if (firstColor.includes('blue')) return '#3B82F6'
  if (firstColor.includes('green')) return '#10B981'
  if (firstColor.includes('red')) return '#EF4444'
  if (firstColor.includes('pink')) return '#EC4899'
  if (firstColor.includes('purple')) return '#8B5CF6'
  if (firstColor.includes('yellow')) return '#F59E0B'
  if (firstColor.includes('orange')) return '#F97316'
  if (firstColor.includes('brown')) return '#92400E'
  if (firstColor.includes('beige') || firstColor.includes('cream')) return '#D6D3D1'

  return '#CBD5E1'
}

function getItemRoleLabel(item: Product): string {
  const combined = `${item.subCategory || ''} ${item.category || ''} ${item.name || ''}`.toLowerCase()

  if (
    combined.includes('shoe') ||
    combined.includes('heel') ||
    combined.includes('sandal') ||
    combined.includes('sneaker') ||
    combined.includes('loafer') ||
    combined.includes('boot')
  ) {
    return 'SHOES'
  }

  if (
    combined.includes('bag') ||
    combined.includes('jewel') ||
    combined.includes('earring') ||
    combined.includes('necklace') ||
    combined.includes('ring') ||
    combined.includes('belt')
  ) {
    return 'ACC'
  }

  if (combined.includes('dress') || combined.includes('jumpsuit') || combined.includes('romper')) {
    return 'DRESS'
  }

  if (
    combined.includes('shirt') ||
    combined.includes('top') ||
    combined.includes('blouse') ||
    combined.includes('tee')
  ) {
    return 'TOP'
  }

  if (combined.includes('pants') || combined.includes('trouser') || combined.includes('skirt') || combined.includes('jeans')) {
    return 'BOTTOM'
  }

  return 'ITEM'
}

function getItemDisplayName(item: Product): string {
  const source = item.subCategory || item.category || item.name || 'Fashion item'
  return source.length > 18 ? `${source.slice(0, 18).trim()}...` : source
}

function AbstractPiece({ item }: { item: Product }) {
  const accent = resolveItemAccentColor(item)
  const role = getItemRoleLabel(item)
  const name = getItemDisplayName(item)

  return (
    <div className="relative w-full h-full rounded-xl border border-white/80 bg-gradient-to-br from-white to-slate-100 shadow-[0_8px_20px_rgba(15,23,42,0.10)] overflow-hidden">
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(circle at 18% 20%, ${accent}, transparent 60%)`,
        }}
      />
      <div className="absolute left-2 right-2 top-2 h-1 rounded-full bg-black/10" />
      <div className="relative z-10 flex h-full flex-col justify-between p-2">
        <span className="text-[10px] font-bold tracking-wide text-slate-700">{role}</span>
        <span className="text-[10px] leading-tight text-slate-600">{name}</span>
      </div>
    </div>
  )
}

function AbstractFlatLayComposite({ items }: { items: Product[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <span className="text-gray-400 text-xs">No items</span>
      </div>
    )
  }

  const { mainItem, shoes, accessories } = categorizeItems(items)
  const shoe = shoes[0]
  const accessory = accessories[0]
  const secondAccessory = accessories[1]

  if (items.length === 1 && mainItem) {
    return (
      <div className="w-full h-full bg-white relative overflow-hidden">
        <div className="absolute inset-0 p-3">
          <AbstractPiece item={mainItem} />
        </div>
      </div>
    )
  }

  if (items.length === 2 && mainItem) {
    const secondItem = shoe || accessory
    return (
      <div className="w-full h-full bg-white relative overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '15%',
            left: '6%',
            width: '42%',
            height: '68%',
            zIndex: 1,
            transform: 'rotate(-3deg)',
          }}
        >
          <AbstractPiece item={mainItem} />
        </div>
        {secondItem && (
          <div
            className="absolute"
            style={{
              top: '20%',
              right: '8%',
              width: '40%',
              height: '60%',
              zIndex: 2,
              transform: 'rotate(4deg)',
            }}
          >
            <AbstractPiece item={secondItem} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {mainItem && (
        <div
          className="absolute"
          style={{
            top: '6%',
            left: '6%',
            width: '48%',
            height: '55%',
            zIndex: 1,
            transform: 'rotate(-2deg)',
          }}
        >
          <AbstractPiece item={mainItem} />
        </div>
      )}

      {shoe && (
        <div
          className="absolute"
          style={{
            bottom: '6%',
            left: '8%',
            width: '35%',
            height: '31%',
            zIndex: 2,
            transform: 'rotate(-8deg)',
          }}
        >
          <AbstractPiece item={shoe} />
        </div>
      )}

      {accessory && (
        <div
          className="absolute"
          style={{
            top: '8%',
            right: '6%',
            width: '32%',
            height: '28%',
            zIndex: 3,
            transform: 'rotate(6deg)',
          }}
        >
          <AbstractPiece item={accessory} />
        </div>
      )}

      {secondAccessory && (
        <div
          className="absolute"
          style={{
            top: '48%',
            right: '10%',
            width: '28%',
            height: '24%',
            zIndex: 4,
            transform: 'rotate(-4deg)',
          }}
        >
          <AbstractPiece item={secondAccessory} />
        </div>
      )}
    </div>
  )
}

/**
 * Categorizes outfit items into main garment, shoes, and accessories
 * Uses case-insensitive matching on category and subCategory fields
 */
function categorizeItems(items: Product[]): CategorizedItems {
  const mainCategories = ['dress', 'top', 'blouse', 'shirt', 'pants', 'skirt', 'jacket', 'blazer', 'coat', 'sweater', 'cardigan', 'jumpsuit', 'romper', 'suit', 'vest', 'tee', 't-shirt']
  const shoeCategories = ['shoes', 'shoe', 'footwear', 'heels', 'heel', 'sneakers', 'sneaker', 'sandals', 'sandal', 'boots', 'boot', 'loafers', 'loafer', 'flats', 'flat', 'pumps', 'pump', 'mules', 'mule', 'oxfords', 'oxford']

  let mainItem: Product | null = null
  const shoes: Product[] = []
  const accessories: Product[] = []

  for (const item of items) {
    const category = (item.category || '').toLowerCase()
    const subCategory = (item.subCategory || '').toLowerCase()
    const combined = `${category} ${subCategory}`

    const isShoe = shoeCategories.some(sc => combined.includes(sc))
    const isMain = mainCategories.some(mc => combined.includes(mc))

    if (isShoe) {
      shoes.push(item)
    } else if (isMain && !mainItem) {
      mainItem = item
    } else if (isMain) {
      // Additional main items become accessories
      accessories.push(item)
    } else {
      accessories.push(item)
    }
  }

  // If no main item found, use the first item with an image
  if (!mainItem && items.length > 0) {
    const itemWithImage = items.find(i => i.imageUrl)
    if (itemWithImage) {
      mainItem = itemWithImage
      // Remove from other arrays if it was placed there
      const shoeIdx = shoes.indexOf(itemWithImage)
      if (shoeIdx > -1) shoes.splice(shoeIdx, 1)
      const accIdx = accessories.indexOf(itemWithImage)
      if (accIdx > -1) accessories.splice(accIdx, 1)
    } else {
      mainItem = items[0]
    }
  }

  return { mainItem, shoes, accessories }
}

/**
 * FlatLayComposite - Creates a CSS-based flat-lay aesthetic composition of outfit items
 * Arranges items in an artistic flat-lay style using CSS transforms and absolute positioning
 */
export function FlatLayComposite({ items, renderMode = 'product-images' }: FlatLayCompositeProps) {
  if (renderMode === 'abstract') {
    return <AbstractFlatLayComposite items={items} />
  }

  if (!items || items.length === 0) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <span className="text-gray-400 text-xs">No items</span>
      </div>
    )
  }

  const { mainItem, shoes, accessories } = categorizeItems(items)

  // Single item - display centered
  if (items.length === 1 && mainItem) {
    return (
      <div className="w-full h-full bg-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {mainItem.imageUrl ? (
            <div className="max-w-full max-h-full w-full h-full">
              <ProductImage
                src={mainItem.imageUrl}
                alt={mainItem.name}
                className="drop-shadow-md"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center px-2">{mainItem.name}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Get first shoe and first accessory for composition
  const shoe = shoes[0]
  const accessory = accessories[0]
  // Additional accessories for more complex compositions
  const secondAccessory = accessories[1]

  // Two items - horizontal spread
  if (items.length === 2 && mainItem) {
    const secondItem = shoe || accessory
    return (
      <div className="w-full h-full bg-white relative overflow-hidden">
        {/* Main item - left side */}
        {mainItem.imageUrl && (
          <div
            className="absolute overflow-hidden"
            style={{
              top: '15%',
              left: '5%',
              width: '42%',
              height: '70%',
              zIndex: 1,
              transform: 'rotate(-3deg)',
            }}
          >
            <ProductImage
              src={mainItem.imageUrl}
              alt={mainItem.name}
              className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            />
          </div>
        )}
        {/* Second item - right side */}
        {secondItem && secondItem.imageUrl && (
          <div
            className="absolute overflow-hidden"
            style={{
              top: '20%',
              right: '8%',
              width: '40%',
              height: '60%',
              zIndex: 2,
              transform: 'rotate(4deg)',
            }}
          >
            <ProductImage
              src={secondItem.imageUrl}
              alt={secondItem.name}
              className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            />
          </div>
        )}
      </div>
    )
  }

  // Three or more items - elegant diagonal composition
  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {/* Main item - positioned upper-left, larger */}
      {mainItem && mainItem.imageUrl && (
        <div
          className="absolute overflow-hidden"
          style={{
            top: '5%',
            left: '5%',
            width: '48%',
            height: '55%',
            zIndex: 1,
            transform: 'rotate(-2deg)',
          }}
        >
          <ProductImage
            src={mainItem.imageUrl}
            alt={mainItem.name}
            className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          />
        </div>
      )}

      {/* Shoes - positioned bottom-left, clear separation */}
      {shoe && shoe.imageUrl && (
        <div
          className="absolute overflow-hidden"
          style={{
            bottom: '6%',
            left: '8%',
            width: '35%',
            height: '32%',
            zIndex: 2,
            transform: 'rotate(-8deg)',
          }}
        >
          <ProductImage
            src={shoe.imageUrl}
            alt={shoe.name}
            className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)]"
          />
        </div>
      )}

      {/* Primary accessory - positioned top-right with clear spacing */}
      {accessory && accessory.imageUrl && (
        <div
          className="absolute overflow-hidden"
          style={{
            top: '8%',
            right: '6%',
            width: '32%',
            height: '28%',
            zIndex: 3,
            transform: 'rotate(6deg)',
          }}
        >
          <ProductImage
            src={accessory.imageUrl}
            alt={accessory.name}
            className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          />
        </div>
      )}

      {/* Secondary accessory - positioned middle-right, balanced spacing */}
      {secondAccessory && secondAccessory.imageUrl && (
        <div
          className="absolute overflow-hidden"
          style={{
            top: '48%',
            right: '10%',
            width: '28%',
            height: '25%',
            zIndex: 4,
            transform: 'rotate(-4deg)',
          }}
        >
          <ProductImage
            src={secondAccessory.imageUrl}
            alt={secondAccessory.name}
            className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          />
        </div>
      )}

      {/* Fallback for main item without image */}
      {mainItem && !mainItem.imageUrl && (
        <div
          className="absolute bg-gray-100 flex items-center justify-center rounded"
          style={{
            top: '10%',
            left: '10%',
            width: '65%',
            height: '70%',
            zIndex: 1,
          }}
        >
          <span className="text-gray-400 text-xs text-center px-2">{mainItem.name}</span>
        </div>
      )}
    </div>
  )
}
