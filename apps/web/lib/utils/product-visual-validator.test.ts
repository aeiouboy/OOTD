/**
 * Unit Tests for Product Visual Validator
 *
 * Tests the visual consistency validation logic that prevents mismatches
 * between flat-lay images and product list thumbnails.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import type { Product } from '../types'
import {
  getImageGenderCategory,
  getTextGenderCategory,
  getProductVisualCategory,
  validateProductVisualConsistency,
  isVisuallyConsistentForWomen,
  filterVisuallyConsistentProducts,
  validateFlatLayThumbnailMatch,
  getVisualConsistencySummary,
} from './product-visual-validator'

// Mock console methods to reduce noise during tests
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'debug').mockImplementation(() => {})
})

// Test fixture factory
function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    sku: 'TEST-001',
    name: 'Test Product',
    brand: 'Test Brand',
    price: 1000,
    imageUrl: 'https://example.com/product.jpg',
    availability: 'in_stock',
    ...overrides,
  }
}

describe('getImageGenderCategory', () => {
  test('returns "masculine" for oxford shoe URL patterns', () => {
    expect(getImageGenderCategory('/images/oxford-shoes/mens.jpg')).toBe('masculine')
    expect(getImageGenderCategory('/images/derby-shoe-black.jpg')).toBe('masculine')
    expect(getImageGenderCategory('/images/brogue-leather.jpg')).toBe('masculine')
    expect(getImageGenderCategory('/images/wingtip-dress-shoe.jpg')).toBe('masculine')
  })

  test('returns "feminine" for heels/pumps URL patterns', () => {
    expect(getImageGenderCategory('/images/heel-black-pointed.jpg')).toBe('feminine')
    expect(getImageGenderCategory('/images/pump-nude-stiletto.jpg')).toBe('feminine')
    expect(getImageGenderCategory('/images/mule-leather.jpg')).toBe('feminine')
    expect(getImageGenderCategory('/images/slingback-heel.jpg')).toBe('feminine')
    expect(getImageGenderCategory('/images/ballet-flat-nude.jpg')).toBe('feminine')
  })

  test('returns "neutral" for generic URLs', () => {
    expect(getImageGenderCategory('/images/shoe-001.jpg')).toBe('neutral')
    expect(getImageGenderCategory('/images/product-12345.jpg')).toBe('neutral')
    expect(getImageGenderCategory('/images/footwear.jpg')).toBe('neutral')
  })

  test('returns "neutral" for undefined or empty URLs', () => {
    expect(getImageGenderCategory(undefined)).toBe('neutral')
    expect(getImageGenderCategory('')).toBe('neutral')
  })

  test('handles URL patterns with gender markers', () => {
    expect(getImageGenderCategory('/images/shoe_m_001.jpg')).toBe('masculine')
    expect(getImageGenderCategory('/images/shoe_w_001.jpg')).toBe('feminine')
    expect(getImageGenderCategory('/images/shoe-mens-formal.jpg')).toBe('masculine')
    expect(getImageGenderCategory('/images/womens-loafer.jpg')).toBe('feminine')
  })
})

describe('getTextGenderCategory', () => {
  test('returns "masculine" for masculine footwear keywords', () => {
    const product = createMockProduct({ name: 'Classic Oxford Shoes' })
    expect(getTextGenderCategory(product)).toBe('masculine')

    const derbyProduct = createMockProduct({ name: 'Derby Shoes Black Leather' })
    expect(getTextGenderCategory(derbyProduct)).toBe('masculine')
  })

  test('returns "feminine" for feminine footwear keywords', () => {
    const product = createMockProduct({ name: 'Pointed Toe Pumps' })
    expect(getTextGenderCategory(product)).toBe('feminine')

    const heelProduct = createMockProduct({ name: 'Block Heel Sandals' })
    expect(getTextGenderCategory(heelProduct)).toBe('feminine')

    const muleProduct = createMockProduct({ name: 'Leather Mules' })
    expect(getTextGenderCategory(muleProduct)).toBe('feminine')
  })

  test('returns "neutral" for generic product names', () => {
    const product = createMockProduct({ name: 'Casual Sneakers' })
    expect(getTextGenderCategory(product)).toBe('neutral')
  })

  test('considers visualDescription in classification', () => {
    const product = createMockProduct({
      name: 'Formal Shoes',
      visualDescription: 'Elegant stiletto heels with pointed toe',
    })
    expect(getTextGenderCategory(product)).toBe('feminine')
  })
})

describe('getProductVisualCategory', () => {
  test('returns matching gender when text and image agree', () => {
    const feminineProduct = createMockProduct({
      name: 'Pointed Toe Pumps',
      imageUrl: '/images/heel-black.jpg',
    })
    expect(getProductVisualCategory(feminineProduct)).toBe('feminine')

    const masculineProduct = createMockProduct({
      name: 'Oxford Shoes',
      imageUrl: '/images/oxford-leather.jpg',
    })
    expect(getProductVisualCategory(masculineProduct)).toBe('masculine')
  })

  test('prioritizes text gender when image is neutral', () => {
    const product = createMockProduct({
      name: 'Stiletto Heels',
      imageUrl: '/images/product-12345.jpg', // neutral URL
    })
    expect(getProductVisualCategory(product)).toBe('feminine')
  })

  test('prioritizes image gender when text is neutral', () => {
    const product = createMockProduct({
      name: 'Formal Shoes',
      imageUrl: '/images/oxford-mens-dress.jpg',
    })
    expect(getProductVisualCategory(product)).toBe('masculine')
  })
})

describe('validateProductVisualConsistency', () => {
  test('returns consistent for matching text and image', () => {
    const product = createMockProduct({
      name: 'Pointed Toe Pumps',
      imageUrl: '/images/heel-pointed.jpg',
    })
    const result = validateProductVisualConsistency(product, { enableLogging: false })
    expect(result.isConsistent).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  test('returns inconsistent for mismatched text and image', () => {
    const product = createMockProduct({
      name: 'Formal Heels',
      imageUrl: '/images/oxford-dress-shoe.jpg',
    })
    const result = validateProductVisualConsistency(product, { enableLogging: false })
    expect(result.isConsistent).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
    expect(result.confidence).toBeLessThan(0.5)
  })

  test('detects specific problematic patterns', () => {
    // "Heels" in name but oxford in image URL
    const product = createMockProduct({
      name: 'Block Heels Black',
      imageUrl: '/images/oxford-formal.jpg',
    })
    const result = validateProductVisualConsistency(product, { enableLogging: false })
    expect(result.isConsistent).toBe(false)
    expect(result.issues.some(i => i.includes('heel'))).toBe(true)
  })

  test('handles womens category with masculine image', () => {
    const product = createMockProduct({
      name: 'Formal Shoes',
      category: 'women_clothing',
      imageUrl: '/images/oxford-mens.jpg',
    })
    const result = validateProductVisualConsistency(product, { enableLogging: false })
    expect(result.isConsistent).toBe(false)
  })
})

describe('isVisuallyConsistentForWomen', () => {
  test('returns true for feminine products', () => {
    const product = createMockProduct({
      name: 'Pointed Toe Pumps',
      imageUrl: '/images/heel-nude.jpg',
    })
    expect(isVisuallyConsistentForWomen(product, { enableLogging: false })).toBe(true)
  })

  test('returns false for masculine products', () => {
    const product = createMockProduct({
      name: 'Oxford Shoes',
      imageUrl: '/images/oxford-leather.jpg',
    })
    expect(isVisuallyConsistentForWomen(product, { enableLogging: false })).toBe(false)
  })

  test('returns false for products with visual mismatch', () => {
    const product = createMockProduct({
      name: 'Formal Heels',
      imageUrl: '/images/derby-mens-dress.jpg',
    })
    expect(isVisuallyConsistentForWomen(product, { enableLogging: false })).toBe(false)
  })

  test('returns true for neutral products', () => {
    const product = createMockProduct({
      name: 'Casual Sneakers',
      imageUrl: '/images/sneaker-white.jpg',
    })
    expect(isVisuallyConsistentForWomen(product, { enableLogging: false })).toBe(true)
  })
})

describe('filterVisuallyConsistentProducts', () => {
  test('filters out masculine products for women', () => {
    const products = [
      createMockProduct({ sku: '001', name: 'Pointed Toe Pumps', imageUrl: '/images/heel.jpg' }),
      createMockProduct({ sku: '002', name: 'Oxford Shoes', imageUrl: '/images/oxford.jpg' }),
      createMockProduct({ sku: '003', name: 'Ballet Flats', imageUrl: '/images/flat.jpg' }),
    ]

    const filtered = filterVisuallyConsistentProducts(products, 'women', { enableLogging: false })
    expect(filtered).toHaveLength(2)
    expect(filtered.some(p => p.name === 'Oxford Shoes')).toBe(false)
  })

  test('filters out feminine products for men', () => {
    const products = [
      createMockProduct({ sku: '001', name: 'Stiletto Heels', imageUrl: '/images/heel.jpg' }),
      createMockProduct({ sku: '002', name: 'Oxford Shoes', imageUrl: '/images/oxford.jpg' }),
      createMockProduct({ sku: '003', name: 'Casual Sneakers', imageUrl: '/images/sneaker.jpg' }),
    ]

    const filtered = filterVisuallyConsistentProducts(products, 'men', { enableLogging: false })
    expect(filtered).toHaveLength(2)
    expect(filtered.some(p => p.name === 'Stiletto Heels')).toBe(false)
  })

  test('keeps neutral products for both genders', () => {
    const products = [
      createMockProduct({ sku: '001', name: 'Casual Sneakers', imageUrl: '/images/sneaker.jpg' }),
    ]

    expect(filterVisuallyConsistentProducts(products, 'women', { enableLogging: false })).toHaveLength(1)
    expect(filterVisuallyConsistentProducts(products, 'men', { enableLogging: false })).toHaveLength(1)
  })
})

describe('validateFlatLayThumbnailMatch', () => {
  test('returns matches=true for consistent products', () => {
    const product = createMockProduct({
      name: 'Pointed Toe Pumps',
      imageUrl: '/images/heel-pointed.jpg',
    })
    const result = validateFlatLayThumbnailMatch(product, { enableLogging: false })
    expect(result.matches).toBe(true)
    expect(result.recommendation).toBe('include')
  })

  test('returns matches=false with exclude recommendation for mismatch', () => {
    const product = createMockProduct({
      name: 'Formal Heels',
      imageUrl: '/images/oxford-dress.jpg',
    })
    const result = validateFlatLayThumbnailMatch(product, { enableLogging: false })
    expect(result.matches).toBe(false)
    expect(result.recommendation).toBe('exclude')
    expect(result.reason).toBeDefined()
  })

  test('recommends exclude for feminine text with masculine image', () => {
    const product = createMockProduct({
      name: 'Block Heel Pumps',
      imageUrl: '/images/brogue-leather.jpg',
    })
    const result = validateFlatLayThumbnailMatch(product, { enableLogging: false })
    expect(result.matches).toBe(false)
    expect(result.recommendation).toBe('exclude')
  })
})

describe('getVisualConsistencySummary', () => {
  test('returns correct counts for mixed products', () => {
    const products = [
      createMockProduct({ sku: '001', name: 'Pointed Toe Pumps', imageUrl: '/images/heel.jpg' }),
      createMockProduct({ sku: '002', name: 'Formal Heels', imageUrl: '/images/oxford.jpg' }),
      createMockProduct({ sku: '003', name: 'Ballet Flats', imageUrl: '/images/flat.jpg' }),
    ]

    const summary = getVisualConsistencySummary(products, { enableLogging: false })
    expect(summary.total).toBe(3)
    expect(summary.consistent).toBe(2)
    expect(summary.inconsistent).toBe(1)
    expect(summary.issues).toHaveLength(1)
    expect(summary.issues[0].sku).toBe('002')
  })

  test('returns all consistent for valid products', () => {
    const products = [
      createMockProduct({ sku: '001', name: 'Pointed Toe Pumps', imageUrl: '/images/heel.jpg' }),
      createMockProduct({ sku: '002', name: 'Stiletto Heels', imageUrl: '/images/pump.jpg' }),
    ]

    const summary = getVisualConsistencySummary(products, { enableLogging: false })
    expect(summary.consistent).toBe(2)
    expect(summary.inconsistent).toBe(0)
  })
})

describe('Edge Cases', () => {
  test('handles products with missing imageUrl', () => {
    const product = createMockProduct({
      name: 'Formal Heels',
      imageUrl: undefined,
    })
    const result = validateProductVisualConsistency(product, { enableLogging: false })
    // Should not crash, image gender should be neutral
    expect(result.imageGender).toBe('neutral')
  })

  test('handles products with unusual URL patterns', () => {
    const product = createMockProduct({
      name: 'Designer Shoes',
      imageUrl: 'https://cdn.example.com/assets/v1/products/abc123xyz?size=large',
    })
    const result = validateProductVisualConsistency(product, { enableLogging: false })
    expect(result.imageGender).toBe('neutral')
  })

  test('handles products with mixed-case names', () => {
    const product = createMockProduct({
      name: 'OXFORD SHOES BLACK LEATHER',
      imageUrl: '/images/product.jpg',
    })
    const result = getTextGenderCategory(product)
    expect(result).toBe('masculine')
  })

  test('handles products with subCategory field', () => {
    const product = createMockProduct({
      name: 'Formal Shoes',
      subCategory: 'Pumps',
      imageUrl: '/images/product.jpg',
    })
    const result = getTextGenderCategory(product)
    expect(result).toBe('feminine')
  })
})
