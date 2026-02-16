import { describe, expect, it } from 'vitest'
import type { Product } from '@/lib/types'
import type { ChatLookStyling } from '@/lib/types/chat-types'
import {
  buildTryOnPromptItems,
  ensureFootwearStyling,
  selectCatalogFlatLayItems,
  selectFlatLaySupplements,
  sanitizeFlatLayStylingItems,
} from '../styling-completion'

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

  it('recognizes catalog category "footwear" and does not add fallback shoes', () => {
    const supplements = selectFlatLaySupplements({
      outfitTitle: 'Office Monday',
      outfitDescription: 'work look',
      catalogItems: [
        makeProduct({ name: 'Navy sheath dress', category: 'dress', subCategory: 'dress' }),
        makeProduct({ sku: 'SKU-FOOT-1', name: 'Classic pumps', category: 'footwear', subCategory: '' }),
      ],
      stylingItems: [{ description: 'Strappy heeled sandals', category: 'Shoes' }],
    })

    expect(supplements.some((item) => /shoe|heel|sandal|รองเท้า/i.test(`${item.category} ${item.description}`))).toBe(false)
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

  it('removes garment-like styling entries for flat-lay but keeps accessories and footwear', () => {
    const sanitized = sanitizeFlatLayStylingItems([
      { description: 'Structured black blazer', category: 'Outerwear' },
      { description: 'Pearl earrings', category: 'Jewelry' },
      { description: 'Black pumps', category: 'Shoes' },
    ])

    expect(sanitized.some((item) => /blazer/i.test(item.description))).toBe(false)
    expect(sanitized.some((item) => /earrings/i.test(item.description))).toBe(true)
    expect(sanitized.some((item) => /pumps/i.test(item.description))).toBe(true)
  })

  it('selects total-look supplements with footwear and accessories (bag priority)', () => {
    const supplements = selectFlatLaySupplements({
      outfitTitle: 'Party Night',
      outfitDescription: 'red glam',
      catalogItems: [makeProduct()],
      stylingItems: [
        { description: 'Black clutch bag', category: 'Bag' },
        { description: 'Pearl earrings', category: 'Jewelry' },
      ],
    })

    expect(supplements.some((item) => /shoe|heel|sandal/i.test(item.description + ' ' + item.category))).toBe(true)
    expect(supplements.some((item) => /bag|clutch/i.test(item.description + ' ' + item.category))).toBe(true)
    expect(supplements.some((item) => /earring/i.test(item.description + ' ' + item.category))).toBe(true)
    expect(supplements.length).toBeLessThanOrEqual(3)
  })

  it('normalizes styling alternatives to a single choice', () => {
    const supplements = selectFlatLaySupplements({
      outfitTitle: 'Work Monday',
      outfitDescription: 'office look',
      catalogItems: [makeProduct()],
      stylingItems: [
        { description: 'Yellow heels or nude sandals', category: 'Shoes' },
      ],
    })

    const footwear = supplements.find((item) => /shoe|heel|sandal/i.test(item.description + ' ' + item.category))
    expect(footwear).toBeDefined()
    expect(footwear?.description.toLowerCase()).toContain('yellow heels')
    expect(footwear?.description.toLowerCase()).not.toContain('nude sandals')
  })

  it('prioritizes jewelry when accessory list exceeds limit', () => {
    const supplements = selectFlatLaySupplements({
      outfitTitle: 'Office',
      outfitDescription: 'weekday work look',
      catalogItems: [makeProduct()],
      stylingItems: [
        { description: 'Black structured bag', category: 'Bag' },
        { description: 'Silver watch', category: 'Watch' },
        { description: 'Pearl stud earrings', category: 'Jewelry' },
      ],
    })

    expect(supplements.some((item) => /bag/i.test(item.category + ' ' + item.description))).toBe(true)
    expect(supplements.some((item) => /jewelry|earring/i.test(item.category + ' ' + item.description))).toBe(true)
  })

  it('does not duplicate bag/jewelry supplements when catalog already includes them', () => {
    const supplements = selectFlatLaySupplements({
      outfitTitle: 'Work',
      outfitDescription: 'meeting look',
      catalogItems: [
        makeProduct({ name: 'White dress', category: 'dress', subCategory: 'dress' }),
        makeProduct({ sku: 'SKU-BAG-1', name: 'Leather tote bag', category: 'bag', subCategory: 'bag' }),
        makeProduct({ sku: 'SKU-JWL-1', name: 'Gold hoop earrings', category: 'jewelry', subCategory: 'jewelry' }),
      ],
      stylingItems: [
        { description: 'Black tote bag', category: 'Bag' },
        { description: 'Silver stud earrings', category: 'Jewelry' },
      ],
    })

    expect(supplements.some((item) => /bag|clutch|tote/i.test(`${item.category} ${item.description}`))).toBe(false)
    expect(supplements.some((item) => /jewelry|earring|necklace|bracelet|ring/i.test(`${item.category} ${item.description}`))).toBe(false)
  })

  it('keeps one-piece silhouette without outerwear when selecting catalog flat-lay items', () => {
    const selected = selectCatalogFlatLayItems([
      makeProduct({ sku: 'SKU-DRESS-1', name: 'Red Wrap Dress', category: 'dress', subCategory: 'dress' }),
      makeProduct({ sku: 'SKU-DRESS-2', name: 'Floral Midi Dress', category: 'dress', subCategory: 'dress' }),
      makeProduct({ sku: 'SKU-BLAZER-1', name: 'Tailored Blazer', category: 'outerwear', subCategory: 'blazer' }),
      makeProduct({ sku: 'SKU-TOP-1', name: 'White Blouse', category: 'top', subCategory: 'blouse' }),
      makeProduct({ sku: 'SKU-SHOE-1', name: 'Nude Heels', category: 'footwear', subCategory: '' }),
      makeProduct({ sku: 'SKU-BAG-1', name: 'Mini Clutch Bag', category: 'bag', subCategory: 'bag' }),
    ])

    expect(selected.some((item) => /red wrap dress/i.test(item.name))).toBe(true)
    expect(selected.some((item) => /floral midi dress/i.test(item.name))).toBe(false)
    expect(selected.some((item) => /white blouse/i.test(item.name))).toBe(false)
    expect(selected.some((item) => /tailored blazer/i.test(item.name))).toBe(false)
    expect(selected.some((item) => /nude heels/i.test(item.name))).toBe(true)
    expect(selected.some((item) => /mini clutch bag/i.test(item.name))).toBe(true)
  })

  it('prefers one-piece silhouette even when top/bottom appear earlier in the catalog list', () => {
    const selected = selectCatalogFlatLayItems([
      makeProduct({ sku: 'SKU-TOP-1', name: 'White Blouse', category: 'top', subCategory: 'blouse' }),
      makeProduct({ sku: 'SKU-BTM-1', name: 'Navy Pencil Skirt', category: 'bottom', subCategory: 'skirt' }),
      makeProduct({ sku: 'SKU-DRESS-1', name: 'Yellow Work Dress', category: 'dress', subCategory: 'dress' }),
      makeProduct({ sku: 'SKU-SHOE-1', name: 'Nude Heels', category: 'footwear', subCategory: '' }),
      makeProduct({ sku: 'SKU-BAG-1', name: 'Structured Tote Bag', category: 'bag', subCategory: 'bag' }),
    ])

    expect(selected.some((item) => /yellow work dress/i.test(item.name))).toBe(true)
    expect(selected.some((item) => /white blouse/i.test(item.name))).toBe(false)
    expect(selected.some((item) => /navy pencil skirt/i.test(item.name))).toBe(false)
    expect(selected.some((item) => /nude heels/i.test(item.name))).toBe(true)
    expect(selected.some((item) => /structured tote bag/i.test(item.name))).toBe(true)
  })

  it('does not inject outerwear when only a partial garment silhouette is present', () => {
    const selected = selectCatalogFlatLayItems([
      makeProduct({ sku: 'SKU-TOP-ONLY', name: 'Silk Sleeveless Top', category: 'top', subCategory: 'top' }),
      makeProduct({ sku: 'SKU-BLAZER-1', name: 'Navy Office Blazer', category: 'outerwear', subCategory: 'blazer' }),
      makeProduct({ sku: 'SKU-SHOE-1', name: 'Classic Nude Heels', category: 'footwear', subCategory: '' }),
      makeProduct({ sku: 'SKU-BAG-1', name: 'Structured Leather Tote', category: 'bag', subCategory: 'bag' }),
    ])

    expect(selected.some((item) => /silk sleeveless top/i.test(item.name))).toBe(true)
    expect(selected.some((item) => /navy office blazer/i.test(item.name))).toBe(false)
    expect(selected.some((item) => /classic nude heels/i.test(item.name))).toBe(true)
    expect(selected.some((item) => /structured leather tote/i.test(item.name))).toBe(true)
  })
})
