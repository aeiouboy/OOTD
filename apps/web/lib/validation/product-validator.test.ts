/**
 * Unit Tests for Product Validator
 */

import { describe, it, expect } from 'vitest'
import {
  validateProduct,
  isEnhancedProduct,
  isValidProduct,
  validateUrl,
  validatePrice,
  validateEnum,
  getValidationSummary,
  ProductValidationError,
} from './product-validator'
import type { EnhancedProduct } from '../types/product-types'

// Valid product sample
const validProduct: EnhancedProduct = {
  id: 'prod-001',
  sku: 'SKU-001',
  name: {
    th: 'เสื้อโปโลลาคอสท์',
    en: 'Lacoste Polo Shirt',
  },
  brand: 'Lacoste',
  pricing: {
    currentPrice: 2295,
    currency: 'THB',
  },
  classification: {
    category: {
      department: 'clothing',
      category: 'tops',
      subcategory: 'polos',
    },
    gender: 'men',
    tags: {
      occasion: ['work', 'chill'],
      season: ['all-season'],
    },
  },
  style: {
    colors: {
      primary: 'blue',
    },
    formalityLevel: 6,
    styleAttributes: ['classic'],
    seasonality: ['all-season'],
  },
  sizing: {
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  availability: {
    status: 'in_stock',
  },
  thaiMarket: {
    culturalAppropriate: true,
  },
  centralIntegration: {
    centralSKU: 'CENT-001',
    productUrl: 'https://www.central.co.th/product/test',
    images: {
      primary: 'https://www.central.co.th/image/test.jpg',
    },
  },
}

describe('Product Validator', () => {
  describe('validateProduct', () => {
    it('should validate a valid product', () => {
      const result = validateProduct(validProduct)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject product without ID', () => {
      const invalid = { ...validProduct, id: '' }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'id')).toBe(true)
    })

    it('should reject product without SKU', () => {
      const invalid = { ...validProduct, sku: '' }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'sku')).toBe(true)
    })

    it('should reject product without name', () => {
      const invalid = { ...validProduct, name: {} }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'name')).toBe(true)
    })

    it('should accept product with only Thai name', () => {
      const valid = {
        ...validProduct,
        name: { th: 'เสื้อโปโล' },
      }
      const result = validateProduct(valid)
      expect(result.valid).toBe(true)
    })

    it('should accept product with only English name', () => {
      const valid = {
        ...validProduct,
        name: { en: 'Polo Shirt' },
      }
      const result = validateProduct(valid)
      expect(result.valid).toBe(true)
    })
  })

  describe('Pricing Validation', () => {
    it('should reject negative price', () => {
      const invalid = {
        ...validProduct,
        pricing: { ...validProduct.pricing, currentPrice: -100 },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'pricing.currentPrice')).toBe(true)
    })

    it('should reject original price less than current price', () => {
      const invalid = {
        ...validProduct,
        pricing: {
          ...validProduct.pricing,
          currentPrice: 2000,
          originalPrice: 1500,
        },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
    })

    it('should accept valid discount', () => {
      const valid = {
        ...validProduct,
        pricing: {
          ...validProduct.pricing,
          currentPrice: 1500,
          originalPrice: 2000,
        },
      }
      const result = validateProduct(valid)
      expect(result.valid).toBe(true)
    })

    it('should reject invalid currency', () => {
      const invalid = {
        ...validProduct,
        pricing: { ...validProduct.pricing, currency: 'INVALID' as any },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'pricing.currency')).toBe(true)
    })
  })

  describe('Classification Validation', () => {
    it('should reject invalid gender', () => {
      const invalid = {
        ...validProduct,
        classification: { ...validProduct.classification, gender: 'invalid' as any },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'classification.gender')).toBe(true)
    })

    it('should accept valid occasion tags', () => {
      const valid = {
        ...validProduct,
        classification: {
          ...validProduct.classification,
          tags: {
            occasion: ['work', 'wedding', 'dinner'],
          },
        },
      }
      const result = validateProduct(valid)
      expect(result.valid).toBe(true)
    })

    it('should reject invalid occasion tags', () => {
      const invalid = {
        ...validProduct,
        classification: {
          ...validProduct.classification,
          tags: {
            occasion: ['invalid-occasion' as any],
          },
        },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
    })
  })

  describe('Style Validation', () => {
    it('should reject missing primary color', () => {
      const invalid = {
        ...validProduct,
        style: { ...validProduct.style, colors: {} },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'style.colors.primary')).toBe(true)
    })

    it('should reject invalid formality level', () => {
      const invalid = {
        ...validProduct,
        style: { ...validProduct.style, formalityLevel: 11 as any },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'style.formalityLevel')).toBe(true)
    })

    it('should accept all formality levels 1-10', () => {
      for (let level = 1; level <= 10; level++) {
        const valid = {
          ...validProduct,
          style: { ...validProduct.style, formalityLevel: level as any },
        }
        const result = validateProduct(valid)
        expect(result.valid).toBe(true)
      }
    })

    it('should reject empty style attributes', () => {
      const invalid = {
        ...validProduct,
        style: { ...validProduct.style, styleAttributes: [] },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
    })
  })

  describe('Sizing Validation', () => {
    it('should reject empty sizes array', () => {
      const invalid = {
        ...validProduct,
        sizing: { availableSizes: [] },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'sizing.availableSizes')).toBe(true)
    })
  })

  describe('Availability Validation', () => {
    it('should accept all valid availability statuses', () => {
      const statuses = ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'] as const
      statuses.forEach((status) => {
        const valid = {
          ...validProduct,
          availability: { status },
        }
        const result = validateProduct(valid)
        expect(result.valid).toBe(true)
      })
    })

    it('should reject invalid availability status', () => {
      const invalid = {
        ...validProduct,
        availability: { status: 'invalid' as any },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
    })
  })

  describe('Central Integration Validation', () => {
    it('should reject invalid product URL', () => {
      const invalid = {
        ...validProduct,
        centralIntegration: {
          ...validProduct.centralIntegration,
          productUrl: 'not-a-url',
        },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'centralIntegration.productUrl')).toBe(true)
    })

    it('should reject invalid image URL', () => {
      const invalid = {
        ...validProduct,
        centralIntegration: {
          ...validProduct.centralIntegration,
          images: { primary: 'invalid-url' },
        },
      }
      const result = validateProduct(invalid)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'centralIntegration.images.primary')).toBe(true)
    })
  })

  describe('Type Guards', () => {
    it('isEnhancedProduct should return true for valid product', () => {
      expect(isEnhancedProduct(validProduct)).toBe(true)
    })

    it('isEnhancedProduct should return false for invalid product', () => {
      expect(isEnhancedProduct({})).toBe(false)
    })

    it('isValidProduct should check basic structure', () => {
      expect(isValidProduct(validProduct)).toBe(true)
      expect(isValidProduct({})).toBe(false)
      expect(isValidProduct(null)).toBe(false)
    })
  })

  describe('Field Validators', () => {
    it('validateUrl should validate URLs correctly', () => {
      expect(validateUrl('https://www.example.com')).toBe(true)
      expect(validateUrl('http://example.com')).toBe(true)
      expect(validateUrl('not-a-url')).toBe(false)
      expect(validateUrl('')).toBe(false)
    })

    it('validatePrice should validate prices correctly', () => {
      expect(validatePrice(100)).toBe(true)
      expect(validatePrice(0)).toBe(true)
      expect(validatePrice(-1)).toBe(false)
      expect(validatePrice('100' as any)).toBe(false)
      expect(validatePrice(NaN)).toBe(false)
      expect(validatePrice(Infinity)).toBe(false)
    })

    it('validateEnum should validate enum values', () => {
      const validGenders = ['men', 'women', 'unisex'] as const
      expect(validateEnum('men', validGenders)).toBe(true)
      expect(validateEnum('invalid', validGenders)).toBe(false)
    })
  })

  describe('Validation Summary', () => {
    it('should generate summary for valid product', () => {
      const result = validateProduct(validProduct)
      const summary = getValidationSummary(result)
      expect(summary).toContain('passed')
    })

    it('should generate summary for invalid product', () => {
      const invalid = { ...validProduct, id: '', sku: '' }
      const result = validateProduct(invalid)
      const summary = getValidationSummary(result)
      expect(summary).toContain('failed')
      expect(summary).toContain('id:')
      expect(summary).toContain('sku:')
    })
  })
})
