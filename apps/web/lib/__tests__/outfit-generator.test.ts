/**
 * Outfit Generator Tests
 *
 * Tests for outfit generation from product catalog
 */

import { describe, it, expect } from 'vitest'
import {
  categorizeProduct,
  categorizeProducts,
  generateOutfit,
  generateOutfits,
  generateMensOutfits,
  generateWomensOutfits,
  generateOutfitsFromQuery,
  filterProductsByGender,
  type ProductCategory,
} from '../outfit-generator'
import type { Product } from '../types'

// Mock products for testing
const mockMensProducts: Product[] = [
  {
    sku: 'M001',
    name: 'Classic White Shirt',
    brand: 'Central',
    price: 1290,
    imageUrl: '/shirt.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
  {
    sku: 'M002',
    name: 'Black Trousers',
    brand: 'Central',
    price: 1890,
    imageUrl: '/trousers.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
  {
    sku: 'M003',
    name: 'Leather Shoes',
    brand: 'Central',
    price: 2490,
    imageUrl: '/shoes.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
  {
    sku: 'M004',
    name: 'Casual Denim Jeans',
    brand: 'Central',
    price: 1590,
    imageUrl: '/jeans.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
  {
    sku: 'M005',
    name: 'Leather Belt',
    brand: 'Central',
    price: 890,
    imageUrl: '/belt.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
]

const mockWomensProducts: Product[] = [
  {
    sku: 'W001',
    name: 'Floral Summer Dress',
    brand: 'Central',
    price: 1590,
    imageUrl: '/dress.jpg',
    availability: 'in_stock',
    category: 'Women',
  },
  {
    sku: 'W002',
    name: 'White Blouse',
    brand: 'Central',
    price: 1290,
    imageUrl: '/blouse.jpg',
    availability: 'in_stock',
    category: 'Women',
  },
  {
    sku: 'W003',
    name: 'Black Skirt',
    brand: 'Central',
    price: 990,
    imageUrl: '/skirt.jpg',
    availability: 'in_stock',
    category: 'Women',
  },
  {
    sku: 'W004',
    name: 'High Heels',
    brand: 'Central',
    price: 2290,
    imageUrl: '/heels.jpg',
    availability: 'in_stock',
    category: 'Women',
  },
  {
    sku: 'W005',
    name: 'Handbag',
    brand: 'Central',
    price: 3490,
    imageUrl: '/bag.jpg',
    availability: 'in_stock',
    category: 'Women',
  },
]

const mockThaiProducts: Product[] = [
  {
    sku: 'T001',
    name: 'เสื้อเชิ้ตสีขาว',
    brand: 'Central',
    price: 1290,
    imageUrl: '/shirt-thai.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
  {
    sku: 'T002',
    name: 'กางเกงขายาวสีดำ',
    brand: 'Central',
    price: 1890,
    imageUrl: '/pants-thai.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
  {
    sku: 'T003',
    name: 'รองเท้าหนัง',
    brand: 'Central',
    price: 2490,
    imageUrl: '/shoes-thai.jpg',
    availability: 'in_stock',
    category: 'Men',
  },
]

describe('Outfit Generator', () => {
  describe('categorizeProduct', () => {
    it('categorizes shirt as tops', () => {
      const product = mockMensProducts[0]
      expect(categorizeProduct(product)).toBe('tops')
    })

    it('categorizes trousers as bottoms', () => {
      const product = mockMensProducts[1]
      expect(categorizeProduct(product)).toBe('bottoms')
    })

    it('categorizes shoes as shoes', () => {
      const product = mockMensProducts[2]
      expect(categorizeProduct(product)).toBe('shoes')
    })

    it('categorizes dress as dresses', () => {
      const product = mockWomensProducts[0]
      expect(categorizeProduct(product)).toBe('dresses')
    })

    it('categorizes belt as accessories', () => {
      const product = mockMensProducts[4]
      expect(categorizeProduct(product)).toBe('accessories')
    })

    it('categorizes Thai shirt as tops', () => {
      const product = mockThaiProducts[0]
      expect(categorizeProduct(product)).toBe('tops')
    })

    it('categorizes Thai pants as bottoms', () => {
      const product = mockThaiProducts[1]
      expect(categorizeProduct(product)).toBe('bottoms')
    })

    it('categorizes Thai shoes as shoes', () => {
      const product = mockThaiProducts[2]
      expect(categorizeProduct(product)).toBe('shoes')
    })
  })

  describe('categorizeProducts', () => {
    it('categorizes a list of products correctly', () => {
      const categorized = categorizeProducts(mockMensProducts)

      expect(categorized.tops).toHaveLength(1)
      expect(categorized.bottoms).toHaveLength(2) // trousers + jeans
      expect(categorized.shoes).toHaveLength(1)
      expect(categorized.accessories).toHaveLength(1)
    })

    it('handles empty product list', () => {
      const categorized = categorizeProducts([])

      expect(categorized.tops).toHaveLength(0)
      expect(categorized.bottoms).toHaveLength(0)
      expect(categorized.shoes).toHaveLength(0)
    })

    it('categorizes women\'s products correctly', () => {
      const categorized = categorizeProducts(mockWomensProducts)

      expect(categorized.dresses).toHaveLength(1)
      expect(categorized.tops).toHaveLength(1) // blouse
      expect(categorized.bottoms).toHaveLength(1) // skirt
      expect(categorized.shoes).toHaveLength(1)
      expect(categorized.accessories).toHaveLength(1)
    })
  })

  describe('filterProductsByGender', () => {
    const mixedProducts = [...mockMensProducts, ...mockWomensProducts]

    it('filters men\'s products correctly', () => {
      const mensProducts = filterProductsByGender(mixedProducts, 'men')
      expect(mensProducts).toHaveLength(5)
      expect(mensProducts.every((p) => (p as any).category === 'Men')).toBe(true)
    })

    it('filters women\'s products correctly', () => {
      const womensProducts = filterProductsByGender(mixedProducts, 'women')
      expect(womensProducts).toHaveLength(5)
      expect(womensProducts.every((p) => (p as any).category === 'Women')).toBe(true)
    })

    it('returns empty array when no products match gender', () => {
      const emptyProducts = filterProductsByGender([], 'men')
      expect(emptyProducts).toHaveLength(0)
    })
  })

  describe('generateOutfit', () => {
    it('generates outfit from men\'s products', () => {
      const categorized = categorizeProducts(mockMensProducts)
      const outfit = generateOutfit(categorized, 'business', 'men')

      expect(outfit).not.toBeNull()
      if (outfit) {
        expect(outfit.id).toBeTruthy()
        expect(outfit.title).toBeTruthy()
        expect(outfit.description).toBeTruthy()
        expect(outfit.items.length).toBeGreaterThanOrEqual(2)
        expect(outfit.totalPrice).toBeGreaterThan(0)
      }
    })

    it('generates outfit from women\'s products with dress', () => {
      const categorized = categorizeProducts(mockWomensProducts)
      const outfit = generateOutfit(categorized, 'formal', 'women')

      expect(outfit).not.toBeNull()
      if (outfit) {
        expect(outfit.items.length).toBeGreaterThanOrEqual(2)
        // Women's outfit might include a dress
        const hasDress = outfit.items.some((item) => item.name.toLowerCase().includes('dress'))
        if (hasDress) {
          expect(outfit.items.length).toBeGreaterThanOrEqual(1)
        }
      }
    })

    it('calculates total price correctly', () => {
      const categorized = categorizeProducts(mockMensProducts)
      const outfit = generateOutfit(categorized, 'casual')

      expect(outfit).not.toBeNull()
      if (outfit) {
        const expectedPrice = outfit.items.reduce((sum, item) => sum + item.price, 0)
        expect(outfit.totalPrice).toBe(expectedPrice)
      }
    })

    it('returns null when insufficient products', () => {
      const categorized = {
        tops: [mockMensProducts[0]],
        bottoms: [],
        shoes: [],
        dresses: [],
        accessories: [],
        other: [],
      }
      const outfit = generateOutfit(categorized, 'business')

      // With only 1 product, should return null (need at least 2)
      expect(outfit).toBeNull()
    })
  })

  describe('generateOutfits', () => {
    it('generates multiple outfits', () => {
      const outfits = generateOutfits(mockMensProducts, { count: 3 })

      expect(outfits.length).toBeGreaterThan(0)
      expect(outfits.length).toBeLessThanOrEqual(3)
    })

    it('generates men\'s outfits when gender specified', () => {
      const mixedProducts = [...mockMensProducts, ...mockWomensProducts]
      const outfits = generateOutfits(mixedProducts, { count: 2, gender: 'men' })

      expect(outfits.length).toBeGreaterThan(0)
      // All products in outfits should be men's products
      outfits.forEach((outfit) => {
        outfit.items.forEach((item) => {
          expect((item as any).category).toBe('Men')
        })
      })
    })

    it('generates women\'s outfits when gender specified', () => {
      const mixedProducts = [...mockMensProducts, ...mockWomensProducts]
      const outfits = generateOutfits(mixedProducts, { count: 2, gender: 'women' })

      expect(outfits.length).toBeGreaterThan(0)
      // All products in outfits should be women's products
      outfits.forEach((outfit) => {
        outfit.items.forEach((item) => {
          expect((item as any).category).toBe('Women')
        })
      })
    })

    it('filters out-of-stock products', () => {
      const productsWithOutOfStock = [
        ...mockMensProducts,
        {
          ...mockMensProducts[0],
          sku: 'M999',
          availability: 'out_of_stock' as const,
        },
      ]

      const outfits = generateOutfits(productsWithOutOfStock, { count: 2 })

      // No outfit should contain out-of-stock items
      outfits.forEach((outfit) => {
        outfit.items.forEach((item) => {
          expect(item.availability).not.toBe('out_of_stock')
        })
      })
    })

    it('respects price range filter', () => {
      const outfits = generateOutfits(mockMensProducts, {
        count: 2,
        priceRange: { min: 2000, max: 5000 },
      })

      outfits.forEach((outfit) => {
        expect(outfit.totalPrice).toBeGreaterThanOrEqual(2000)
        expect(outfit.totalPrice).toBeLessThanOrEqual(5000)
      })
    })
  })

  describe('generateMensOutfits', () => {
    it('generates men\'s outfits', () => {
      const mixedProducts = [...mockMensProducts, ...mockWomensProducts]
      const outfits = generateMensOutfits(mixedProducts, 3)

      expect(outfits.length).toBeGreaterThan(0)
      outfits.forEach((outfit) => {
        outfit.items.forEach((item) => {
          expect((item as any).category).toBe('Men')
        })
      })
    })

    it('generates business style men\'s outfits', () => {
      const outfits = generateMensOutfits(mockMensProducts, 2, 'business')

      expect(outfits.length).toBeGreaterThan(0)
      outfits.forEach((outfit) => {
        expect(outfit.title).toBeTruthy()
        expect(outfit.description).toBeTruthy()
      })
    })
  })

  describe('generateWomensOutfits', () => {
    it('generates women\'s outfits', () => {
      const mixedProducts = [...mockMensProducts, ...mockWomensProducts]
      const outfits = generateWomensOutfits(mixedProducts, 3)

      expect(outfits.length).toBeGreaterThan(0)
      outfits.forEach((outfit) => {
        outfit.items.forEach((item) => {
          expect((item as any).category).toBe('Women')
        })
      })
    })

    it('generates formal style women\'s outfits', () => {
      const outfits = generateWomensOutfits(mockWomensProducts, 2, 'formal')

      expect(outfits.length).toBeGreaterThan(0)
      outfits.forEach((outfit) => {
        expect(outfit.title).toBeTruthy()
        expect(outfit.description).toBeTruthy()
      })
    })
  })

  describe('generateOutfitsFromQuery', () => {
    const mixedProducts = [...mockMensProducts, ...mockWomensProducts]

    it('generates business outfits from business query', () => {
      const outfits = generateOutfitsFromQuery(mixedProducts, 'What should I wear to a business meeting?')

      expect(outfits.length).toBeGreaterThan(0)
      // Should generate some outfits
      expect(outfits.length).toBeLessThanOrEqual(5)
    })

    it('generates men\'s outfits from men\'s query', () => {
      const outfits = generateOutfitsFromQuery(mixedProducts, 'Show me men\'s casual outfits')

      expect(outfits.length).toBeGreaterThan(0)
      outfits.forEach((outfit) => {
        outfit.items.forEach((item) => {
          expect((item as any).category).toBe('Men')
        })
      })
    })

    it('generates women\'s outfits from women\'s query', () => {
      const outfits = generateOutfitsFromQuery(mixedProducts, 'I need a women\'s dress for a date')

      expect(outfits.length).toBeGreaterThan(0)
      outfits.forEach((outfit) => {
        outfit.items.forEach((item) => {
          expect((item as any).category).toBe('Women')
        })
      })
    })

    it('generates casual outfits from casual query', () => {
      const outfits = generateOutfitsFromQuery(mixedProducts, 'Show me casual weekend looks')

      expect(outfits.length).toBeGreaterThan(0)
    })

    it('generates formal outfits from formal query', () => {
      const outfits = generateOutfitsFromQuery(mixedProducts, 'I need a formal outfit for special occasion')

      expect(outfits.length).toBeGreaterThan(0)
    })

    it('generates date outfits from date query', () => {
      const outfits = generateOutfitsFromQuery(mixedProducts, 'What should I wear for a romantic dinner date?')

      expect(outfits.length).toBeGreaterThan(0)
    })

    it('handles queries without specific style', () => {
      const outfits = generateOutfitsFromQuery(mixedProducts, 'Show me some outfits')

      expect(outfits.length).toBeGreaterThan(0)
    })
  })

  describe('Outfit Quality', () => {
    it('generates outfits with valid structure', () => {
      const outfits = generateOutfits(mockMensProducts, { count: 2 })

      outfits.forEach((outfit) => {
        expect(outfit.id).toBeTruthy()
        expect(outfit.id).toMatch(/^outfit-/)
        expect(outfit.title).toBeTruthy()
        expect(typeof outfit.title).toBe('string')
        expect(outfit.description).toBeTruthy()
        expect(typeof outfit.description).toBe('string')
        expect(outfit.totalPrice).toBeGreaterThan(0)
        expect(Array.isArray(outfit.items)).toBe(true)
        expect(outfit.items.length).toBeGreaterThanOrEqual(2)
        expect(outfit.imageUrl).toBeTruthy()
      })
    })

    it('generates unique outfit IDs', () => {
      const outfits = generateOutfits(mockMensProducts, { count: 3 })

      const ids = outfits.map((o) => o.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('uses first item image as outfit image', () => {
      const outfits = generateOutfits(mockMensProducts, { count: 2 })

      outfits.forEach((outfit) => {
        if (outfit.items.length > 0) {
          expect(outfit.imageUrl).toBe(outfit.items[0].imageUrl)
        }
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty product catalog', () => {
      const outfits = generateOutfits([], { count: 3 })
      expect(outfits).toHaveLength(0)
    })

    it('handles products with only one category', () => {
      const singleCategoryProducts = [
        mockMensProducts[0], // shirt
        { ...mockMensProducts[0], sku: 'M006' }, // another shirt
      ]

      const outfits = generateOutfits(singleCategoryProducts, { count: 2 })
      // Should return empty or very few outfits due to lack of variety
      expect(outfits.length).toBeLessThanOrEqual(2)
    })

    it('handles price range that excludes all products', () => {
      const outfits = generateOutfits(mockMensProducts, {
        count: 2,
        priceRange: { min: 100000, max: 200000 }, // Very high range
      })

      expect(outfits).toHaveLength(0)
    })
  })
})
