import { describe, expect, it } from 'vitest'
import { convertLooksToOutfits, mergeProductsBySku } from '@/lib/utils/chat-look-transformers'
import type { Product } from '@/lib/types'

describe('chat-look-transformers', () => {
  it('converts look payloads to outfits with normalized item fields', () => {
    const outfits = convertLooksToOutfits([
      {
        lookNumber: 2,
        styleName: 'Weekend Brunch',
        tip: 'Add light accessories',
        totalPrice: 3200,
        imageUrl: 'https://example.com/look.jpg',
        items: [
          {
            sku: 'SKU-01',
            name: 'Linen Shirt',
            brand: 'Brand A',
            price: 1200,
            imageUrl: 'https://example.com/item.jpg',
            url: 'https://central.co.th/p/sku-01',
            category: 'Top',
            description: 'white relaxed fit shirt',
            color: 'white',
          },
        ],
      },
    ], 123)

    expect(outfits).toEqual([
      {
        id: 'look-123-2',
        title: 'Weekend Brunch',
        description: 'Add light accessories',
        totalPrice: 3200,
        imageUrl: 'https://example.com/look.jpg',
        stylingItems: [],
        items: [
          {
            sku: 'SKU-01',
            name: 'Linen Shirt',
            brand: 'Brand A',
            price: 1200,
            imageUrl: 'https://example.com/item.jpg',
            availability: 'in_stock',
            onlineUrl: 'https://central.co.th/p/sku-01',
            category: 'Top',
            subCategory: 'Top',
            visualDescription: 'white relaxed fit shirt',
            colors: ['white'],
          },
        ],
      },
    ])
  })

  it('falls back to computed total price when look total is missing', () => {
    const outfits = convertLooksToOutfits([
      {
        lookNumber: 1,
        styleName: 'Smart Casual',
        items: [
          {
            sku: 'SKU-10',
            name: 'Shirt',
            brand: 'Brand A',
            category: 'Top',
            color: 'blue',
            description: 'shirt',
            price: 1000,
            url: '',
          },
          {
            sku: 'SKU-11',
            name: 'Pants',
            brand: 'Brand B',
            category: 'Bottom',
            color: 'black',
            description: 'pants',
            price: 1500,
            url: '',
          },
        ],
      },
    ], 99)

    expect(outfits[0].totalPrice).toBe(2500)
  })
  it('merges products by sku and preserves order', () => {
    const existing: Product[] = [
      { sku: 'A', name: 'A', brand: 'X', price: 1, imageUrl: '', availability: 'in_stock' },
      { sku: 'B', name: 'B', brand: 'X', price: 1, imageUrl: '', availability: 'in_stock' },
    ]

    const incoming: Product[] = [
      { sku: 'B', name: 'B2', brand: 'Y', price: 2, imageUrl: '', availability: 'in_stock' },
      { sku: 'C', name: 'C', brand: 'Y', price: 2, imageUrl: '', availability: 'in_stock' },
    ]

    const merged = mergeProductsBySku(existing, incoming)

    expect(merged.map((product) => product.sku)).toEqual(['A', 'B', 'C'])
    expect(merged[1].name).toBe('B')
  })

  it('does not deduplicate products that have blank sku', () => {
    const existing: Product[] = [
      { sku: '', name: 'Unknown Existing', brand: 'X', price: 1, imageUrl: '', availability: 'in_stock' },
    ]

    const incoming: Product[] = [
      { sku: '', name: 'Unknown Incoming 1', brand: 'Y', price: 2, imageUrl: '', availability: 'in_stock' },
      { sku: '', name: 'Unknown Incoming 2', brand: 'Z', price: 3, imageUrl: '', availability: 'in_stock' },
    ]

    const merged = mergeProductsBySku(existing, incoming)

    expect(merged).toHaveLength(3)
    expect(merged.map((product) => product.name)).toEqual([
      'Unknown Existing',
      'Unknown Incoming 1',
      'Unknown Incoming 2',
    ])
  })
})
