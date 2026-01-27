'use client'

import type { Product } from '@/lib/types'

interface FlatLayCompositeProps {
  items: Product[]
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
export function FlatLayComposite({ items }: FlatLayCompositeProps) {
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
