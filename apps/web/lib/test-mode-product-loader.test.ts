/**
 * Unit Tests for Product Loader - Context Extraction
 * Tests gender, occasion, climate, budget, and style extraction from user queries
 */

import { describe, it, expect } from 'vitest';
import { extractQueryContext, filterProductsByQuery } from './test-mode-product-loader';
import type { EnhancedProduct } from './types/product-types';

describe('extractQueryContext - Gender Extraction', () => {
  describe('Thai Male Keywords', () => {
    it('should extract "men" from "ผู้ชาย"', () => {
      const context = extractQueryContext('ผู้ชาย');
      expect(context.gender).toBe('men');
    });

    it('should extract "men" from "หาชุดผู้ชาย"', () => {
      const context = extractQueryContext('หาชุดผู้ชาย');
      expect(context.gender).toBe('men');
    });

    it('should extract "men" from "ผู้ชายไปงาน"', () => {
      const context = extractQueryContext('ผู้ชายไปงาน');
      expect(context.gender).toBe('men');
    });

    it('should extract "men" from "ผช."', () => {
      const context = extractQueryContext('ผช.');
      expect(context.gender).toBe('men');
    });

    it('should extract "men" from sentence with spaces "หาชุด ผู้ชาย ไปทำงาน"', () => {
      const context = extractQueryContext('หาชุด ผู้ชาย ไปทำงาน');
      expect(context.gender).toBe('men');
    });
  });

  describe('Thai Female Keywords', () => {
    it('should extract "women" from "ผู้หญิง"', () => {
      const context = extractQueryContext('ผู้หญิง');
      expect(context.gender).toBe('women');
    });

    it('should extract "women" from "หาชุดผู้หญิง"', () => {
      const context = extractQueryContext('หาชุดผู้หญิง');
      expect(context.gender).toBe('women');
    });

    it('should extract "women" from "ผู้หญิงไปงาน"', () => {
      const context = extractQueryContext('ผู้หญิงไปงาน');
      expect(context.gender).toBe('women');
    });

    it('should extract "women" from "ผญ."', () => {
      const context = extractQueryContext('ผญ.');
      expect(context.gender).toBe('women');
    });
  });

  describe('English Gender Keywords', () => {
    it('should extract "men" from "men clothing"', () => {
      const context = extractQueryContext('men clothing');
      expect(context.gender).toBe('men');
    });

    it('should extract "men" from "male fashion"', () => {
      const context = extractQueryContext('male fashion');
      expect(context.gender).toBe('men');
    });

    it('should extract "women" from "women dress"', () => {
      const context = extractQueryContext('women dress');
      expect(context.gender).toBe('women');
    });

    it('should extract "women" from "female clothing"', () => {
      const context = extractQueryContext('female clothing');
      expect(context.gender).toBe('women');
    });

    it('should extract "women" from "lady fashion"', () => {
      const context = extractQueryContext('lady fashion');
      expect(context.gender).toBe('women');
    });
  });

  describe('Edge Cases', () => {
    it('should return undefined when no gender mentioned', () => {
      const context = extractQueryContext('หาชุดไปงานบวช');
      expect(context.gender).toBeUndefined();
    });

    it('should handle empty string', () => {
      const context = extractQueryContext('');
      expect(context.gender).toBeUndefined();
    });

    it('should handle mixed Thai-English "หาชุด men ไปทำงาน"', () => {
      const context = extractQueryContext('หาชุด men ไปทำงาน');
      expect(context.gender).toBe('men');
    });

    it('should prioritize first mention when both genders present', () => {
      const context = extractQueryContext('ผู้ชายหรือผู้หญิง');
      expect(context.gender).toBe('men'); // First match wins
    });
  });
});

describe('extractQueryContext - Occasion Extraction', () => {
  describe('Thai Occasions', () => {
    it('should extract "work" from "ทำงาน"', () => {
      const context = extractQueryContext('หาชุดไปทำงาน');
      expect(context.occasion).toBe('work');
    });

    it('should extract "wedding" from "งานบวช"', () => {
      const context = extractQueryContext('หาชุดไปงานบวช');
      expect(context.occasion).toBe('wedding');
    });

    it('should extract "party" from "ปาร์ตี้"', () => {
      const context = extractQueryContext('ไปปาร์ตี้');
      expect(context.occasion).toBe('party');
    });

    it('should extract "date" from "เดท"', () => {
      const context = extractQueryContext('ไปเดท');
      expect(context.occasion).toBe('date');
    });

    it('should extract "cafe" from "คาเฟ่"', () => {
      const context = extractQueryContext('ไปคาเฟ่');
      expect(context.occasion).toBe('cafe');
    });
  });

  describe('English Occasions', () => {
    it('should extract "work" from "work" keyword', () => {
      const context = extractQueryContext('outfit for work');
      expect(context.occasion).toBe('work');
    });

    it('should extract "party" from "party" keyword', () => {
      const context = extractQueryContext('going to a party');
      expect(context.occasion).toBe('party');
    });

    it('should extract "wedding" from "wedding" keyword', () => {
      const context = extractQueryContext('wedding ceremony');
      expect(context.occasion).toBe('wedding');
    });
  });

  describe('Edge Cases', () => {
    it('should return undefined when no occasion mentioned', () => {
      const context = extractQueryContext('หาชุดสวยๆ');
      expect(context.occasion).toBeUndefined();
    });
  });
});

describe('extractQueryContext - Budget Extraction', () => {
  it('should extract budget from "งบ 5000 บาท"', () => {
    const context = extractQueryContext('งบ 5000 บาท');
    expect(context.budget).toBeDefined();
    expect(context.budget?.max).toBeGreaterThan(0);
  });

  it('should extract budget range from "3000-5000"', () => {
    const context = extractQueryContext('งบ 3000-5000');
    expect(context.budget).toBeDefined();
    expect(context.budget?.min).toBe(3000);
    expect(context.budget?.max).toBe(5000);
  });

  it('should extract budget from "ไม่เกิน 2000 บาท"', () => {
    const context = extractQueryContext('ไม่เกิน 2000 บาท');
    expect(context.budget).toBeDefined();
    expect(context.budget?.max).toBe(2000);
  });

  it('should return undefined when no budget mentioned', () => {
    const context = extractQueryContext('หาชุดไปงาน');
    expect(context.budget).toBeUndefined();
  });
});

describe('extractQueryContext - Combined Context', () => {
  it('should extract multiple parameters from single query', () => {
    const context = extractQueryContext('หาชุดผู้ชายไปงานบวช งบ 5000 บาท');
    expect(context.gender).toBe('men');
    expect(context.occasion).toBe('wedding'); // งานบวช categorized as wedding/formal
    expect(context.budget).toBeDefined();
  });

  it('should extract context from conversational Thai text', () => {
    const context = extractQueryContext('อยากหาชุดผู้ชายไปทำงาน งบประมาณ 3000-5000 บาท');
    expect(context.gender).toBe('men');
    expect(context.occasion).toBe('work');
    expect(context.budget?.min).toBe(3000);
    expect(context.budget?.max).toBe(5000);
  });
});

describe('filterProductsByQuery - Gender Filtering', () => {
  // Mock products for testing
  const mockProducts: EnhancedProduct[] = [
    {
      id: 'test-men-1',
      sku: 'MEN001',
      name: { en: 'Men Blazer', th: 'เสื้อสูทผู้ชาย' },
      description: { en: '', th: '' },
      brand: 'Test Brand',
      pricing: { currentPrice: 5000, originalPrice: 5000, currency: 'THB' },
      classification: {
        category: { department: "Men's Fashion", category: 'Clothing', subcategory: 'Blazers' },
        gender: 'men',
        tags: { occasion: ['work'], style: ['classic'], season: ['all-season'] },
        isCompleteOutfit: false
      },
      style: {
        colors: { primary: 'black' },
        formalityLevel: 8,
        styleAttributes: ['classic'],
        seasonality: ['all-season']
      },
      sizing: { availableSizes: ['M', 'L', 'XL'] },
      availability: { status: 'in_stock' },
      thaiMarket: { culturalAppropriate: true },
      centralIntegration: {
        centralSKU: 'MEN001',
        productUrl: 'https://example.com/men-blazer',
        images: { primary: 'https://example.com/image.jpg' }
      },
      metadata: { createdAt: new Date(), updatedAt: new Date(), version: '1.0' }
    } as EnhancedProduct,
    {
      id: 'test-women-1',
      sku: 'WOMEN001',
      name: { en: 'Women Dress', th: 'ชุดเดรสผู้หญิง' },
      description: { en: '', th: '' },
      brand: 'Test Brand',
      pricing: { currentPrice: 4000, originalPrice: 4000, currency: 'THB' },
      classification: {
        category: { department: "Women's Fashion", category: 'Clothing', subcategory: 'Dresses' },
        gender: 'women',
        tags: { occasion: ['party'], style: ['elegant'], season: ['all-season'] },
        isCompleteOutfit: false
      },
      style: {
        colors: { primary: 'red' },
        formalityLevel: 7,
        styleAttributes: ['elegant'],
        seasonality: ['all-season']
      },
      sizing: { availableSizes: ['S', 'M', 'L'] },
      availability: { status: 'in_stock' },
      thaiMarket: { culturalAppropriate: true },
      centralIntegration: {
        centralSKU: 'WOMEN001',
        productUrl: 'https://example.com/women-dress',
        images: { primary: 'https://example.com/image.jpg' }
      },
      metadata: { createdAt: new Date(), updatedAt: new Date(), version: '1.0' }
    } as EnhancedProduct
  ];

  it('should filter only men products when gender is "men"', () => {
    const filtered = filterProductsByQuery(mockProducts, 'หาชุดผู้ชาย', 10);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(product => {
      expect(product.classification?.gender).toBe('men');
    });
  });

  it('should filter only women products when gender is "women"', () => {
    const filtered = filterProductsByQuery(mockProducts, 'หาชุดผู้หญิง', 10);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(product => {
      expect(product.classification?.gender).toBe('women');
    });
  });

  it('should NOT return women products for men query', () => {
    const filtered = filterProductsByQuery(mockProducts, 'ผู้ชาย', 10);
    const womenProducts = filtered.filter(p => p.classification?.gender === 'women');
    expect(womenProducts.length).toBe(0);
  });

  it('should NOT return men products for women query', () => {
    const filtered = filterProductsByQuery(mockProducts, 'ผู้หญิง', 10);
    const menProducts = filtered.filter(p => p.classification?.gender === 'men');
    expect(menProducts.length).toBe(0);
  });
});
