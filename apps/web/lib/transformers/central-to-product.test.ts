/**
 * Unit Tests for Central Product Transformer
 */

import { describe, it, expect } from 'vitest'
import {
  transformCentralProduct,
  extractSKUFromUrl,
  parseThaiPrice,
  detectGender,
  extractBrand,
  extractColor,
  parseSizes,
} from './central-to-product'
import type { CentralScrapedProduct } from './central-to-product'

describe('Central Product Transformer', () => {
  const sampleScrapedProduct: CentralScrapedProduct = {
    product_name: 'เสื้อโปโลผู้ชายลาคอสท์ รุ่นสลิมฟิต ไอเทมซิกเนเจอร์ ผ้าคอตตอนมินิปิเก้ สีน้ำเงิน',
    product_desc: '',
    product_link: 'https://www.central.co.th/th/blue-men-s-slim-fit-stretch-piqu-polo-shirt-grmkppr000087261',
    product_size: '',
    product_price: '฿2,295',
    product_image:
      'https://www.central.co.th/_next/image?url=https%3A%2F%2Fassets.central.co.th%2Ffile-assets%2FCDSPIM%2Fweb%2FImage%2FMKP1601%2FLACOSTE-SLIMFITSTRETCHPIQUPOLOSHIRTBLUE-MKP1601073-1.webp&w=640&q=75',
  }

  describe('transformCentralProduct', () => {
    it('should transform scraped product to EnhancedProduct structure', () => {
      const result = transformCentralProduct(sampleScrapedProduct, { gender: 'men' })

      expect(result.id).toBeTruthy()
      expect(result.sku).toBeTruthy()
      expect(result.name?.th).toBe(sampleScrapedProduct.product_name)
      expect(result.pricing?.currentPrice).toBe(2295)
      expect(result.pricing?.currency).toBe('THB')
      expect(result.classification?.gender).toBe('men')
      expect(result.centralIntegration?.productUrl).toBe(sampleScrapedProduct.product_link)
    })

    it('should handle missing optional fields', () => {
      const minimal: CentralScrapedProduct = {
        product_name: 'Test Product',
        product_link: 'https://www.central.co.th/test',
        product_price: '100',
        product_image: 'https://www.central.co.th/image.jpg',
      }

      const result = transformCentralProduct(minimal)

      expect(result.id).toBeTruthy()
      expect(result.pricing?.currentPrice).toBe(100)
      expect(result.description).toBeUndefined()
    })
  })

  describe('extractSKUFromUrl', () => {
    it('should extract SKU from Central product URL with grmkppr pattern', () => {
      const url = 'https://www.central.co.th/th/product-name-grmkppr000087261'
      const sku = extractSKUFromUrl(url)
      expect(sku).toBe('grmkppr000087261')
    })

    it('should extract SKU from URL with mkp pattern', () => {
      const url = 'https://www.central.co.th/th/product-name-mkp1601073'
      const sku = extractSKUFromUrl(url)
      expect(sku).toBe('mkp1601073')
    })

    it('should extract SKU from URL with cds pattern', () => {
      const url = 'https://www.central.co.th/th/product-name-grcds53725040063'
      const sku = extractSKUFromUrl(url)
      expect(sku).toBe('grcds53725040063')
    })

    it('should handle URL with query parameters', () => {
      const url = 'https://www.central.co.th/th/product-name-grmkppr000087261?ref=test'
      const sku = extractSKUFromUrl(url)
      expect(sku).toBe('grmkppr000087261')
    })

    it('should return fallback for URLs without recognizable pattern', () => {
      const url = 'https://www.central.co.th/th/simple-url'
      const sku = extractSKUFromUrl(url)
      expect(sku).toContain('simple-url')
    })
  })

  describe('parseThaiPrice', () => {
    it('should parse Thai Baht price with currency symbol and commas', () => {
      expect(parseThaiPrice('฿2,295')).toBe(2295)
    })

    it('should parse price without currency symbol', () => {
      expect(parseThaiPrice('2,295')).toBe(2295)
    })

    it('should parse price with decimals', () => {
      expect(parseThaiPrice('฿2,295.50')).toBe(2295.5)
    })

    it('should handle price without commas', () => {
      expect(parseThaiPrice('฿2295')).toBe(2295)
    })

    it('should return 0 for empty string', () => {
      expect(parseThaiPrice('')).toBe(0)
    })

    it('should return 0 for invalid price', () => {
      expect(parseThaiPrice('invalid')).toBe(0)
    })
  })

  describe('detectGender', () => {
    it('should detect men from product name with ผู้ชาย', () => {
      expect(detectGender('เสื้อโปโลผู้ชาย', '')).toBe('men')
    })

    it('should detect men from English keywords', () => {
      expect(detectGender('Mens Polo Shirt', '')).toBe('men')
    })

    it('should detect women from product name with ผู้หญิง', () => {
      expect(detectGender('เดรสผู้หญิง', '')).toBe('women')
    })

    it('should detect women from dress keyword', () => {
      expect(detectGender('Midi Dress', '')).toBe('women')
    })

    it('should detect women from skirt keyword', () => {
      expect(detectGender('Pleated Skirt', '')).toBe('women')
    })

    it('should detect gender from source file name', () => {
      expect(detectGender('Generic Product', 'central-men-clothing.json')).toBe('men')
      expect(detectGender('Generic Product', 'central-women-dresses.json')).toBe('women')
    })

    it('should return unisex for ambiguous products', () => {
      expect(detectGender('T-Shirt', '')).toBe('unisex')
    })
  })

  describe('extractBrand', () => {
    it('should extract Lacoste from product name', () => {
      const name = 'เสื้อโปโลผู้ชายลาคอสท์ รุ่นสลิมฟิต'
      expect(extractBrand(name).toLowerCase()).toContain('lacoste')
    })

    it('should extract Polo Ralph Lauren', () => {
      const name = 'POLO Ralph Lauren Custom Slim Fit Mesh Polo Shirt'
      expect(extractBrand(name).toLowerCase()).toContain('ralph')
    })

    it('should extract Calvin Klein', () => {
      const name = 'Calvin Klein Mens T-Shirt'
      expect(extractBrand(name).toLowerCase()).toContain('calvin')
    })

    it('should extract brand from Thai brand names', () => {
      const name = 'เสื้อยืด G2000 ทรงสลิม'
      expect(extractBrand(name).toLowerCase()).toContain('g2000')
    })

    it('should return first part of name if no brand found', () => {
      const name = 'UnknownBrand Product Name'
      const brand = extractBrand(name)
      expect(brand).toBeTruthy()
      expect(brand.length).toBeGreaterThan(0)
    })

    it('should default to Central if cannot extract brand', () => {
      const name = '- Product'
      expect(extractBrand(name)).toBe('Central')
    })
  })

  describe('extractColor', () => {
    it('should extract Thai color สีน้ำเงิน', () => {
      expect(extractColor('เสื้อ สีน้ำเงิน')).toBe('blue')
    })

    it('should extract English color blue', () => {
      expect(extractColor('Blue Polo Shirt')).toBe('blue')
    })

    it('should extract Thai color สีขาว', () => {
      expect(extractColor('เสื้อเชิ้ต สีขาว')).toBe('white')
    })

    it('should extract English color black', () => {
      expect(extractColor('Black Blazer')).toBe('black')
    })

    it('should handle navy color', () => {
      expect(extractColor('Navy Blue Shirt')).toBe('navy')
      expect(extractColor('เสื้อ สีกรมท่า')).toBe('navy')
    })

    it('should return neutral for products without color', () => {
      expect(extractColor('Generic Product')).toBe('neutral')
    })
  })

  describe('parseSizes', () => {
    it('should parse comma-separated sizes', () => {
      const sizes = parseSizes('S,M,L,XL')
      expect(sizes).toEqual(['S', 'M', 'L', 'XL'])
    })

    it('should parse slash-separated sizes', () => {
      const sizes = parseSizes('S/M/L')
      expect(sizes).toEqual(['S', 'M', 'L'])
    })

    it('should handle single size', () => {
      const sizes = parseSizes('M')
      expect(sizes).toEqual(['M'])
    })

    it('should return default sizes for empty string', () => {
      const sizes = parseSizes('')
      expect(sizes).toEqual(['S', 'M', 'L', 'XL'])
    })

    it('should return default sizes for undefined', () => {
      const sizes = parseSizes(undefined)
      expect(sizes).toEqual(['S', 'M', 'L', 'XL'])
    })

    it('should uppercase sizes', () => {
      const sizes = parseSizes('s,m,l')
      expect(sizes).toEqual(['S', 'M', 'L'])
    })
  })
})
