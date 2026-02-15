import { describe, it, expect } from 'vitest'
import type { Product } from '@/lib/types'
import type { FlatLayItem } from '@/lib/types/image-types'
import type { ChatLookStyling } from '@/lib/types/chat-types'

// Helper: simulate what ChatAssistant.generateFlatLayForOutfit does
function buildFlatLayItemsForOutfit(
  items: Product[],
  stylingItems?: ChatLookStyling[]
): FlatLayItem[] {
  const catalogFlatLayItems: FlatLayItem[] = items.slice(0, 5).map((item) => ({
    name: item.name,
    category: item.subCategory || item.category || 'Item',
    color: item.colors?.[0],
    visualDescription: item.visualDescription,
    sku: item.sku,
    thumbnailUrl: item.imageUrl,
  }))

  const stylingFlatLayItems: FlatLayItem[] = (stylingItems || []).map((s) => ({
    name: s.description,
    category: s.category || 'Accessory',
    visualDescription: s.description,
  }))

  return [...catalogFlatLayItems, ...stylingFlatLayItems].slice(0, 6)
}

describe('Flat-lay look isolation', () => {
  // Create mock products for Look 1
  const look1Items: Product[] = [
    { sku: 'SKU-RED-DRESS', name: 'Red Sequin Dress', category: 'Dress', colors: ['Red'], imageUrl: 'https://example.com/red-dress.jpg' } as Product,
    { sku: 'SKU-BLACK-HEELS', name: 'Black Strappy Heels', category: 'Footwear', colors: ['Black'], imageUrl: 'https://example.com/black-heels.jpg' } as Product,
  ]
  const look1Styling: ChatLookStyling[] = [
    { description: 'Red crystal clutch bag', category: 'Bag' },
  ]

  // Create mock products for Look 2 (completely different items)
  const look2Items: Product[] = [
    { sku: 'SKU-BLUE-SHIRT', name: 'Blue Casual Shirt', category: 'Top', colors: ['Blue'], imageUrl: 'https://example.com/blue-shirt.jpg' } as Product,
    { sku: 'SKU-WHITE-SNEAKERS', name: 'White Canvas Sneakers', category: 'Footwear', colors: ['White'], imageUrl: 'https://example.com/white-sneakers.jpg' } as Product,
    { sku: 'SKU-KHAKI-PANTS', name: 'Khaki Chino Pants', category: 'Pants', colors: ['Khaki'], imageUrl: 'https://example.com/khaki-pants.jpg' } as Product,
  ]

  it('should only include items from the target outfit', () => {
    const flatLayItems = buildFlatLayItemsForOutfit(look1Items, look1Styling)

    const itemNames = flatLayItems.map(i => i.name)
    expect(itemNames).toContain('Red Sequin Dress')
    expect(itemNames).toContain('Black Strappy Heels')
    expect(itemNames).toContain('Red crystal clutch bag')
    expect(flatLayItems).toHaveLength(3)
  })

  it('should NOT include items from a different look', () => {
    const flatLayItems = buildFlatLayItemsForOutfit(look1Items, look1Styling)

    const itemNames = flatLayItems.map(i => i.name)
    expect(itemNames).not.toContain('Blue Casual Shirt')
    expect(itemNames).not.toContain('White Canvas Sneakers')
    expect(itemNames).not.toContain('Khaki Chino Pants')
  })

  it('should include styling items in the flat-lay', () => {
    const flatLayItems = buildFlatLayItemsForOutfit(look1Items, look1Styling)

    const stylingItem = flatLayItems.find(i => i.name === 'Red crystal clutch bag')
    expect(stylingItem).toBeDefined()
    expect(stylingItem?.category).toBe('Bag')
    expect(stylingItem?.sku).toBeUndefined()  // Styling items have no SKU
    expect(stylingItem?.thumbnailUrl).toBeUndefined()  // Styling items have no thumbnail
  })

  it('should cap total items at 6', () => {
    const manyItems: Product[] = Array.from({ length: 7 }, (_, i) => ({
      sku: `SKU-${i}`,
      name: `Product ${i}`,
      category: 'Item',
      colors: ['Black'],
      imageUrl: `https://example.com/item-${i}.jpg`,
    } as Product))

    const manyStyling: ChatLookStyling[] = [
      { description: 'Hat', category: 'Hat' },
      { description: 'Earrings', category: 'Jewelry' },
    ]

    const flatLayItems = buildFlatLayItemsForOutfit(manyItems, manyStyling)
    expect(flatLayItems.length).toBeLessThanOrEqual(6)
  })

  it('should handle empty styling items', () => {
    const flatLayItems = buildFlatLayItemsForOutfit(look2Items)

    expect(flatLayItems).toHaveLength(3)
    expect(flatLayItems.every(i => i.sku !== undefined)).toBe(true)  // All catalog items
  })

  it('should prioritize catalog items over styling items in the 6-item cap', () => {
    const fiveItems: Product[] = Array.from({ length: 5 }, (_, i) => ({
      sku: `SKU-${i}`,
      name: `Catalog Product ${i}`,
      category: 'Item',
      colors: ['Black'],
      imageUrl: `https://example.com/item-${i}.jpg`,
    } as Product))

    const twoStyling: ChatLookStyling[] = [
      { description: 'Leather belt', category: 'Belt' },
      { description: 'Silver watch', category: 'Watch' },
    ]

    const flatLayItems = buildFlatLayItemsForOutfit(fiveItems, twoStyling)

    // 5 catalog + 2 styling = 7, capped at 6
    expect(flatLayItems).toHaveLength(6)
    // All 5 catalog items should be included (they come first)
    expect(flatLayItems.filter(i => i.sku !== undefined)).toHaveLength(5)
    // Only 1 styling item fits
    expect(flatLayItems.filter(i => i.sku === undefined)).toHaveLength(1)
  })
})
