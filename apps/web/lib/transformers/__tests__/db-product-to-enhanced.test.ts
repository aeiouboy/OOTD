import { describe, it, expect } from 'vitest'
import {
  transformDbProductToEnhanced,
  transformDbProductsToEnhanced,
} from '../db-product-to-enhanced'
import type { DbProduct } from '../../supabase/types'

/**
 * Factory helper to build a DbProduct with sensible defaults.
 * Pass overrides to customise individual fields per test.
 */
function makeDbProduct(overrides: Partial<DbProduct> = {}): DbProduct {
  return {
    id: 'test-id-001',
    sku: 'SKU-001',
    product_name: 'Elegant Midi Dress',
    brand: 'MAJE',
    category: 'women_clothing',
    price: 3500,
    original_price: 4500,
    image_url: 'https://example.com/dress.jpg',
    link: 'https://example.com/dress',
    availability: 'in_stock',
    product_description: 'A beautiful midi dress',
    occasion_weekend_social: 0.8,
    occasion_date_night: 0.6,
    occasion_everyday_casual: 0.2,
    primary_occasion: 'weekend_social',
    thai_climate_rating: 4,
    temple_appropriate: false,
    ac_friendly: true,
    embedding: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// transformDbProductToEnhanced
// ---------------------------------------------------------------------------

describe('transformDbProductToEnhanced', () => {
  it('transforms a complete DbProduct with all fields populated', () => {
    const db = makeDbProduct()
    const result = transformDbProductToEnhanced(db)

    // Core fields
    expect(result.id).toBe('test-id-001')
    expect(result.sku).toBe('SKU-001')
    expect(result.name).toEqual({ th: 'Elegant Midi Dress', en: 'Elegant Midi Dress' })
    expect(result.description).toEqual({
      th: 'A beautiful midi dress',
      en: 'A beautiful midi dress',
    })
    expect(result.brand).toBe('MAJE')

    // Pricing
    expect(result.pricing.currentPrice).toBe(3500)
    expect(result.pricing.originalPrice).toBe(4500)
    expect(result.pricing.currency).toBe('THB')

    // Classification
    expect(result.classification.gender).toBe('women')
    expect(result.classification.category.category).toBe('women_clothing')

    // Availability
    expect(result.availability.status).toBe('in_stock')

    // Central integration
    expect(result.centralIntegration.productUrl).toBe('https://example.com/dress')
    expect(result.centralIntegration.images.primary).toBe('https://example.com/dress.jpg')
    expect(result.centralIntegration.centralSKU).toBe('SKU-001')

    // Thai market
    expect(result.thaiMarket.culturalAppropriate).toBe(true)
    expect(result.thaiMarket.specialFlags?.templeAppropriate).toBe(false)

    // Style defaults
    expect(result.style.colors.primary).toBe('unknown')
    expect(result.style.formalityLevel).toBe(5)
    expect(result.style.styleAttributes).toEqual([])
    expect(result.style.seasonality).toEqual(['all-season'])

    // Sizing defaults
    expect(result.sizing.availableSizes).toEqual([])
  })

  // ---- Null / missing optional fields ----

  it('handles null original_price by setting originalPrice to undefined', () => {
    const db = makeDbProduct({ original_price: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.pricing.originalPrice).toBeUndefined()
  })

  it('handles null product_description by setting description to undefined', () => {
    const db = makeDbProduct({ product_description: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.description).toBeUndefined()
  })

  it('handles null price by setting currentPrice to 0', () => {
    const db = makeDbProduct({ price: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.pricing.currentPrice).toBe(0)
  })

  it('handles null brand by defaulting to "Unknown"', () => {
    const db = makeDbProduct({ brand: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.brand).toBe('Unknown')
  })

  it('handles null sku by falling back to dbProduct.id', () => {
    const db = makeDbProduct({ sku: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.sku).toBe('test-id-001')
    expect(result.centralIntegration.centralSKU).toBe('test-id-001')
  })

  it('handles null link by setting productUrl to empty string', () => {
    const db = makeDbProduct({ link: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.centralIntegration.productUrl).toBe('')
  })

  it('handles null image_url by setting images.primary to empty string', () => {
    const db = makeDbProduct({ image_url: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.centralIntegration.images.primary).toBe('')
  })

  // ---- Occasion scores mapping ----

  it('maps occasion scores above 0.3 threshold into occasion tags', () => {
    const db = makeDbProduct({
      occasion_weekend_social: 0.8,
      occasion_date_night: 0.6,
      occasion_everyday_casual: 0.5,
    })
    const result = transformDbProductToEnhanced(db)

    // weekend_social -> 'chill', date_night -> 'date', everyday_casual -> 'casual'
    expect(result.classification.tags.occasion).toContain('chill')
    expect(result.classification.tags.occasion).toContain('date')
    expect(result.classification.tags.occasion).toContain('casual')
    expect(result.classification.tags.occasion).toHaveLength(3)
  })

  it('excludes occasion scores at or below 0.3 threshold', () => {
    const db = makeDbProduct({
      occasion_weekend_social: 0.3,  // exactly at threshold -- excluded (> not >=)
      occasion_date_night: 0.1,
      occasion_everyday_casual: 0.0,
    })
    const result = transformDbProductToEnhanced(db)

    // All scores are at or below 0.3, so no occasion tags
    expect(result.classification.tags.occasion).toBeUndefined()
  })

  it('excludes null occasion scores', () => {
    const db = makeDbProduct({
      occasion_weekend_social: null,
      occasion_date_night: null,
      occasion_everyday_casual: null,
    })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.tags.occasion).toBeUndefined()
  })

  it('includes only scores above threshold in a mixed set', () => {
    const db = makeDbProduct({
      occasion_weekend_social: 0.9,
      occasion_date_night: 0.2,
      occasion_everyday_casual: 0.5,
    })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.tags.occasion).toContain('chill')
    expect(result.classification.tags.occasion).toContain('casual')
    expect(result.classification.tags.occasion).not.toContain('date')
    expect(result.classification.tags.occasion).toHaveLength(2)
  })

  // ---- Price mapping ----

  it('passes price as a number without conversion', () => {
    const db = makeDbProduct({ price: 12990 })
    const result = transformDbProductToEnhanced(db)

    expect(result.pricing.currentPrice).toBe(12990)
    expect(typeof result.pricing.currentPrice).toBe('number')
  })

  // ---- Gender inference ----

  it('infers gender "women" from category starting with "women"', () => {
    const db = makeDbProduct({ category: 'women_clothing' })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.gender).toBe('women')
  })

  it('infers gender "women" from category "women_accessories"', () => {
    const db = makeDbProduct({ category: 'women_accessories' })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.gender).toBe('women')
  })

  it('infers gender "men" from category starting with "men"', () => {
    const db = makeDbProduct({ category: 'men_clothing' })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.gender).toBe('men')
  })

  it('infers gender "men" from category "men_accessories"', () => {
    const db = makeDbProduct({ category: 'men_accessories' })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.gender).toBe('men')
  })

  it('infers gender "unisex" from an unknown category', () => {
    const db = makeDbProduct({ category: 'electronics' })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.gender).toBe('unisex')
  })

  it('infers gender "unisex" for a generic category like "accessories"', () => {
    const db = makeDbProduct({ category: 'accessories' })
    const result = transformDbProductToEnhanced(db)

    expect(result.classification.gender).toBe('unisex')
  })

  // ---- Image URL passthrough ----

  it('passes image_url directly to centralIntegration.images.primary', () => {
    const url = 'https://cdn.central.co.th/images/product-12345.jpg'
    const db = makeDbProduct({ image_url: url })
    const result = transformDbProductToEnhanced(db)

    expect(result.centralIntegration.images.primary).toBe(url)
  })

  // ---- Product link to centralIntegration.productUrl ----

  it('maps product link to centralIntegration.productUrl', () => {
    const link = 'https://www.central.co.th/en/product/12345'
    const db = makeDbProduct({ link })
    const result = transformDbProductToEnhanced(db)

    expect(result.centralIntegration.productUrl).toBe(link)
  })

  // ---- ID mapping ----

  it('uses dbProduct.id as the EnhancedProduct id', () => {
    const db = makeDbProduct({ id: 'uuid-abc-123' })
    const result = transformDbProductToEnhanced(db)

    expect(result.id).toBe('uuid-abc-123')
  })

  // ---- Availability status validation ----

  it('passes through valid availability statuses', () => {
    const validStatuses = ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'] as const
    for (const status of validStatuses) {
      const db = makeDbProduct({ availability: status })
      const result = transformDbProductToEnhanced(db)

      expect(result.availability.status).toBe(status)
    }
  })

  it('defaults to "in_stock" for an invalid availability value', () => {
    const db = makeDbProduct({ availability: 'discontinued' })
    const result = transformDbProductToEnhanced(db)

    expect(result.availability.status).toBe('in_stock')
  })

  it('defaults to "in_stock" for null availability', () => {
    const db = makeDbProduct({ availability: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.availability.status).toBe('in_stock')
  })

  // ---- temple_appropriate mapping ----

  it('maps temple_appropriate=true to thaiMarket.specialFlags.templeAppropriate', () => {
    const db = makeDbProduct({ temple_appropriate: true })
    const result = transformDbProductToEnhanced(db)

    expect(result.thaiMarket.specialFlags?.templeAppropriate).toBe(true)
  })

  it('maps temple_appropriate=false to thaiMarket.specialFlags.templeAppropriate', () => {
    const db = makeDbProduct({ temple_appropriate: false })
    const result = transformDbProductToEnhanced(db)

    expect(result.thaiMarket.specialFlags?.templeAppropriate).toBe(false)
  })

  it('maps temple_appropriate=null to undefined in specialFlags', () => {
    const db = makeDbProduct({ temple_appropriate: null })
    const result = transformDbProductToEnhanced(db)

    expect(result.thaiMarket.specialFlags?.templeAppropriate).toBeUndefined()
  })

  // ---- Default style values ----

  it('sets default style values when no style data exists in DbProduct', () => {
    const db = makeDbProduct()
    const result = transformDbProductToEnhanced(db)

    expect(result.style.formalityLevel).toBe(5)
    expect(result.style.colors.primary).toBe('unknown')
    expect(result.style.styleAttributes).toEqual([])
    expect(result.style.seasonality).toEqual(['all-season'])
  })

  // ---- Name bilingual mapping ----

  it('maps product_name to both th and en in the name field', () => {
    const db = makeDbProduct({ product_name: 'Floral Summer Dress' })
    const result = transformDbProductToEnhanced(db)

    expect(result.name.th).toBe('Floral Summer Dress')
    expect(result.name.en).toBe('Floral Summer Dress')
  })

  // ---- Currency ----

  it('always sets currency to THB', () => {
    const db = makeDbProduct()
    const result = transformDbProductToEnhanced(db)

    expect(result.pricing.currency).toBe('THB')
  })

  // ---- culturalAppropriate default ----

  it('sets thaiMarket.culturalAppropriate to true by default', () => {
    const db = makeDbProduct()
    const result = transformDbProductToEnhanced(db)

    expect(result.thaiMarket.culturalAppropriate).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// transformDbProductsToEnhanced
// ---------------------------------------------------------------------------

describe('transformDbProductsToEnhanced', () => {
  it('batch transforms and returns the correct count', () => {
    const products = [
      makeDbProduct({ id: 'p1', product_name: 'Dress A' }),
      makeDbProduct({ id: 'p2', product_name: 'Dress B' }),
      makeDbProduct({ id: 'p3', product_name: 'Dress C' }),
    ]

    const results = transformDbProductsToEnhanced(products)

    expect(results).toHaveLength(3)
    expect(results[0].id).toBe('p1')
    expect(results[1].id).toBe('p2')
    expect(results[2].id).toBe('p3')
    expect(results[0].name.en).toBe('Dress A')
    expect(results[1].name.en).toBe('Dress B')
    expect(results[2].name.en).toBe('Dress C')
  })

  it('returns an empty array when given an empty array', () => {
    const results = transformDbProductsToEnhanced([])

    expect(results).toEqual([])
    expect(results).toHaveLength(0)
  })
})
