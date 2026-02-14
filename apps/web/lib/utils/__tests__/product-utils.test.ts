/**
 * Tests for Product Utilities
 */

import { describe, it, expect } from 'vitest'
import { getGenderSpecificUrl } from '../product-utils'
import { Product } from '../../types'

describe('getGenderSpecificUrl', () => {
  it('should return men URL for products with "Men" category', () => {
    const menProduct: Product = {
      sku: 'TEST-M-001',
      name: 'Test Men Product',
      brand: 'Test Brand',
      price: 1000,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
      category: 'Men',
    }

    expect(getGenderSpecificUrl(menProduct)).toBe('https://www.central.co.th/th/men')
  })

  it('should return women URL for products with "Women" category', () => {
    const womenProduct: Product = {
      sku: 'TEST-W-001',
      name: 'Test Women Product',
      brand: 'Test Brand',
      price: 1500,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
      category: 'Women',
    }

    expect(getGenderSpecificUrl(womenProduct)).toBe('https://www.central.co.th/th/women')
  })

  it('should prefer product onlineUrl over category landing page when available', () => {
    const womenProductWithUrl: Product = {
      sku: 'TEST-W-URL-001',
      name: 'Test Women Product',
      brand: 'Test Brand',
      price: 1500,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
      category: 'Women',
      onlineUrl: 'https://www.central.co.th/th/product/specific-item',
    }

    expect(getGenderSpecificUrl(womenProductWithUrl)).toBe('https://www.central.co.th/th/product/specific-item')
  })

  it('should return fallback URL for products without category', () => {
    const productWithoutCategory: Product = {
      sku: 'TEST-U-001',
      name: 'Test Product',
      brand: 'Test Brand',
      price: 2000,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
    }

    expect(getGenderSpecificUrl(productWithoutCategory)).toBe('https://www.central.co.th')
  })

  it('should return product onlineUrl if available when category is unknown', () => {
    const productWithOnlineUrl: Product = {
      sku: 'TEST-O-001',
      name: 'Test Product',
      brand: 'Test Brand',
      price: 2500,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
      onlineUrl: 'https://www.central.co.th/product/test',
      category: 'Accessories',
    }

    expect(getGenderSpecificUrl(productWithOnlineUrl)).toBe('https://www.central.co.th/product/test')
  })

  it('should handle case-insensitive category matching', () => {
    const menProductLowercase: Product = {
      sku: 'TEST-ML-001',
      name: 'Test Men Product',
      brand: 'Test Brand',
      price: 1000,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
      category: 'men',
    }

    expect(getGenderSpecificUrl(menProductLowercase)).toBe('https://www.central.co.th/th/men')
  })

  it('should correctly identify women category when "women" is in the category string', () => {
    const womenProduct: Product = {
      sku: 'TEST-WC-001',
      name: 'Test Women Product',
      brand: 'Test Brand',
      price: 1500,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
      category: 'Women Clothing',
    }

    expect(getGenderSpecificUrl(womenProduct)).toBe('https://www.central.co.th/th/women')
  })

  it('should not return men URL when category contains "women"', () => {
    const womenProduct: Product = {
      sku: 'TEST-WM-001',
      name: 'Test Women Product',
      brand: 'Test Brand',
      price: 1500,
      imageUrl: 'https://example.com/image.jpg',
      availability: 'in_stock',
      category: 'Women',
    }

    // Should return women URL, not men URL, even though "men" is substring of "women"
    expect(getGenderSpecificUrl(womenProduct)).toBe('https://www.central.co.th/th/women')
    expect(getGenderSpecificUrl(womenProduct)).not.toBe('https://www.central.co.th/th/men')
  })
})
