import { describe, expect, it } from 'vitest'
import type { Product } from '@/lib/types'
import type { ChatLookStyling } from '@/lib/types/chat-types'
import { buildTryOnPromptItems, ensureFootwearStyling } from '../styling-completion'

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  sku: 'SKU-1',
  name: 'Red Party Dress',
  brand: 'TEST',
  price: 1000,
  imageUrl: '',
  availability: 'in_stock',
  category: 'dress',
  subCategory: 'dress',
  colors: ['red'],
  ...overrides,
})

describe('styling-completion', () => {
  it('keeps styling unchanged when catalog items already include footwear', () => {
    const items = [
      makeProduct({ name: 'Red Dress', category: 'dress', subCategory: 'dress' }),
      makeProduct({ sku: 'SKU-2', name: 'Black Heels', category: 'footwear', subCategory: 'heels' }),
    ]
    const styling: ChatLookStyling[] = [{ description: 'Gold stud earrings', category: 'Jewelry' }]

    const completed = ensureFootwearStyling({
      outfitTitle: 'Party Night',
      catalogItems: items,
      stylingItems: styling,
    })

    expect(completed).toEqual(styling)
  })

  it('adds fallback footwear styling when outfit has no shoes', () => {
    const completed = ensureFootwearStyling({
      outfitTitle: 'Date Night Party',
      catalogItems: [makeProduct()],
      stylingItems: [{ description: 'Black shoulder bag', category: 'Bag' }],
    })

    expect(completed.some((item) => /shoe|heel|sandal/i.test(item.category + ' ' + item.description))).toBe(true)
  })

  it('adds footwear supplement item into try-on prompt when catalog has no shoes', () => {
    const tryOnItems = buildTryOnPromptItems({
      outfitTitle: 'Minimal Red Glam',
      outfitDescription: 'party look',
      catalogItems: [makeProduct()],
      stylingItems: [],
    })

    expect(tryOnItems.length).toBeGreaterThan(1)
    expect(tryOnItems.some((item) => item.category === 'footwear')).toBe(true)
  })
})
