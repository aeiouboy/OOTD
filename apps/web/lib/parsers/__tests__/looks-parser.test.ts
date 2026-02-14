import { describe, it, expect } from 'vitest';
import { parseLooksData, validateLooksAgainstCatalog } from '../looks-parser';
import type { EnhancedProduct } from '@/lib/types/product-types';

// Helper to create a mock EnhancedProduct
function mockProduct(sku: string, url: string, price: number, brand = 'TestBrand'): EnhancedProduct {
  return {
    id: `id-${sku}`,
    sku,
    name: { th: `สินค้า ${sku}`, en: `Product ${sku}` },
    brand,
    pricing: { currentPrice: price, originalPrice: price, currency: 'THB' },
    classification: {
      category: { department: 'Clothing', category: 'Tops' },
      gender: 'women',
      tags: { occasion: [], style: [], season: [] },
    },
    style: {
      colors: { primary: 'black' },
      formalityLevel: 5,
      styleAttributes: [],
      seasonality: ['all-season'],
    },
    sizing: { availableSizes: ['S', 'M', 'L'] },
    availability: { status: 'in_stock' },
    thaiMarket: { culturalAppropriate: true },
    centralIntegration: {
      centralSKU: sku,
      productUrl: url,
      images: { primary: '' },
    },
  } as unknown as EnhancedProduct;
}

describe('parseLooksData', () => {
  it('should parse valid response with 2 looks', () => {
    const response = `ดีจ้า! มาดูลุคกัน 🔥

---LOOKS_DATA---
LOOK:1|Casual Chic
ITEM:เสื้อยืดขาว|Tops|White|Basic white tee|SKU001|790|https://central.co.th/p/sku001
ITEM:กางเกงยีนส์|Bottoms|Blue|Slim fit jeans|SKU002|1590|https://central.co.th/p/sku002
TIP:พับขากางเกงนิดหน่อย ดูชิลขึ้น
TOTAL:2380
LOOK:2|Smart Office
ITEM:เชิ้ตสีฟ้า|Tops|Blue|Oxford shirt|SKU003|1290|https://central.co.th/p/sku003
ITEM:กางเกงสแล็ค|Bottoms|Black|Slim slacks|SKU004|1890|https://central.co.th/p/sku004
ITEM:เข็มขัดหนัง|Accessories|Brown|Leather belt|SKU005|990|https://central.co.th/p/sku005
TIP:เลือกนาฬิกาเข้าชุดเพิ่มความดูดี
TOTAL:4170
---END_LOOKS_DATA---`;

    const result = parseLooksData(response);

    expect(result.text).toBe('ดีจ้า! มาดูลุคกัน 🔥');
    expect(result.looks).toHaveLength(2);

    // Look 1
    expect(result.looks[0].lookNumber).toBe(1);
    expect(result.looks[0].styleName).toBe('Casual Chic');
    expect(result.looks[0].items).toHaveLength(2);
    expect(result.looks[0].items[0].name).toBe('เสื้อยืดขาว');
    expect(result.looks[0].items[0].sku).toBe('SKU001');
    expect(result.looks[0].items[0].price).toBe(790);
    expect(result.looks[0].tip).toBe('พับขากางเกงนิดหน่อย ดูชิลขึ้น');
    expect(result.looks[0].totalPrice).toBe(2380);

    // Look 2
    expect(result.looks[1].lookNumber).toBe(2);
    expect(result.looks[1].styleName).toBe('Smart Office');
    expect(result.looks[1].items).toHaveLength(3);
    expect(result.looks[1].totalPrice).toBe(4170);
  });

  it('should handle missing LOOKS_DATA markers (fallback)', () => {
    const response = 'สวัสดีค่ะ! ฉันเป็น OOT Fashion Assistant 🌟';
    const result = parseLooksData(response);

    expect(result.text).toBe(response);
    expect(result.looks).toHaveLength(0);
  });

  it('should handle empty LOOKS_DATA block', () => {
    const response = `ดีจ้า!

---LOOKS_DATA---
---END_LOOKS_DATA---`;

    const result = parseLooksData(response);
    expect(result.text).toBe('ดีจ้า!');
    expect(result.looks).toHaveLength(0);
  });

  it('should handle null/empty input', () => {
    expect(parseLooksData('')).toEqual({ text: '', looks: [] });
    expect(parseLooksData(null as unknown as string)).toEqual({ text: '', looks: [] });
  });

  it('should calculate total from items when TOTAL line is missing', () => {
    const response = `ลุคนี้เลย!

---LOOKS_DATA---
LOOK:1|Basic Look
ITEM:เสื้อ|Tops|White|Tee|SKU001|500|https://url1
ITEM:กางเกง|Bottoms|Black|Pants|SKU002|1000|https://url2
---END_LOOKS_DATA---`;

    const result = parseLooksData(response);
    expect(result.looks[0].totalPrice).toBe(1500);
  });

  it('should handle malformed ITEM lines gracefully', () => {
    const response = `Test

---LOOKS_DATA---
LOOK:1|Test Look
ITEM:Good Item|Tops|White|Nice tee|SKU001|790|https://url1
ITEM:Bad
ITEM:Also Bad|Only Two
ITEM:Partial Item|Tops|Red
---END_LOOKS_DATA---`;

    const result = parseLooksData(response);
    // Only the first (7-field) and last (3-field partial) should parse
    expect(result.looks[0].items.length).toBeGreaterThanOrEqual(1);
    expect(result.looks[0].items[0].name).toBe('Good Item');
  });

  it('should handle response without END marker', () => {
    const response = `Hello!

---LOOKS_DATA---
LOOK:1|No End
ITEM:Product|Cat|Color|Desc|SKU1|999|https://url`;

    const result = parseLooksData(response);
    expect(result.text).toBe('Hello!');
    expect(result.looks).toHaveLength(1);
    expect(result.looks[0].items).toHaveLength(1);
  });

  it('should parse prices with commas', () => {
    const response = `Hi

---LOOKS_DATA---
LOOK:1|Expensive Look
ITEM:Designer Bag|Bags|Black|Luxury bag|SKU100|12,990|https://url
TOTAL:12,990
---END_LOOKS_DATA---`;

    const result = parseLooksData(response);
    expect(result.looks[0].items[0].price).toBe(12990);
    expect(result.looks[0].totalPrice).toBe(12990);
  });
});

describe('parseLooksData - fallback markdown parser', () => {
  it('should parse inline markdown product recommendations', () => {
    const response = `สวัสดีค่ะ! มาดูชุดทำงานสไตล์มินิมอลกันเลยนะคะ

**1. เสื้อเชิ้ตขาว** - **Brand:** GIORDANO - **Price:** 🏷 420 บาท - **Link:** 🔗 https://central.co.th/p/shirt1
**2. กางเกงสแล็คสีดำ** - **Brand:** CPS - **Price:** 🏷 1,290 บาท - **Link:** 🔗 https://central.co.th/p/pants1
**3. รองเท้าคัชชู** - **Brand:** BATA - **Price:** 🏷 890 บาท - **Link:** 🔗 https://central.co.th/p/shoes1`;

    const result = parseLooksData(response);

    expect(result.text).toContain('สวัสดีค่ะ');
    expect(result.text).not.toContain('**');
    expect(result.looks.length).toBeGreaterThanOrEqual(1);

    const allItems = result.looks.flatMap(l => l.items);
    expect(allItems.length).toBe(3);
    expect(allItems[0].name).toContain('เสื้อเชิ้ตขาว');
    expect(allItems[0].brand).toBe('GIORDANO');
    expect(allItems[0].price).toBe(420);
    expect(allItems[0].url).toContain('https://central.co.th/p/shirt1');
    expect(allItems[1].price).toBe(1290);
    expect(allItems[2].price).toBe(890);
  });

  it('should not trigger fallback for plain text without products', () => {
    const response = 'สวัสดีค่ะ! วันนี้อากาศร้อนมากเลยนะคะ ลองใส่ชุดเบาๆ สบายๆ ดูค่ะ';
    const result = parseLooksData(response);

    expect(result.text).toBe(response);
    expect(result.looks).toHaveLength(0);
  });

  it('should handle markdown products without emoji in price/link', () => {
    const response = `ลองดูสินค้าเหล่านี้นะคะ

**1. Oxford Shirt** - **Brand:** Uniqlo - **Price:** 990 บาท - **Link:** https://central.co.th/p/ox1
**2. Chino Pants** - **Brand:** Dockers - **Price:** 1,590 บาท - **Link:** https://central.co.th/p/ch1`;

    const result = parseLooksData(response);

    const allItems = result.looks.flatMap(l => l.items);
    expect(allItems.length).toBe(2);
    expect(allItems[0].name).toContain('Oxford Shirt');
    expect(allItems[0].price).toBe(990);
    expect(allItems[1].price).toBe(1590);
  });

  it('should calculate totalPrice for fallback-parsed looks', () => {
    const response = `แนะนำค่ะ

**1. Item A** - **Price:** 500 บาท - **Link:** https://example.com/a
**2. Item B** - **Price:** 700 บาท - **Link:** https://example.com/b
**3. Item C** - **Price:** 800 บาท - **Link:** https://example.com/c`;

    const result = parseLooksData(response);
    const totalAllItems = result.looks.reduce((s, l) => s + l.totalPrice, 0);
    expect(totalAllItems).toBe(2000);
  });

  it('should split many items into multiple looks', () => {
    const response = `มีหลายตัวเลือกค่ะ

**1. A** - **Price:** 100 บาท - **Link:** https://ex.com/1
**2. B** - **Price:** 200 บาท - **Link:** https://ex.com/2
**3. C** - **Price:** 300 บาท - **Link:** https://ex.com/3
**4. D** - **Price:** 400 บาท - **Link:** https://ex.com/4
**5. E** - **Price:** 500 บาท - **Link:** https://ex.com/5`;

    const result = parseLooksData(response);
    // 5 items > 4 threshold, should be split into multiple looks (~3 per look)
    expect(result.looks.length).toBeGreaterThanOrEqual(2);
    const totalItems = result.looks.reduce((s, l) => s + l.items.length, 0);
    expect(totalItems).toBe(5);
  });
});

describe('validateLooksAgainstCatalog', () => {
  const catalog = [
    mockProduct('SKU001', 'https://central.co.th/real/sku001', 790, 'CPS'),
    mockProduct('SKU002', 'https://central.co.th/real/sku002', 1590, 'Levi'),
    mockProduct('SKU003', 'https://central.co.th/real/sku003', 1290, 'Uniqlo'),
  ];

  it('should validate items with matching SKUs', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'Test',
      items: [
        { name: 'Shirt', brand: 'AI Brand', category: 'Tops', color: 'White', description: '', sku: 'SKU001', price: 999, url: 'https://fake.com' },
        { name: 'Jeans', brand: 'AI Brand', category: 'Bottoms', color: 'Blue', description: '', sku: 'SKU002', price: 999, url: 'https://fake.com' },
      ],
      totalPrice: 1998,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);
    expect(validated).toHaveLength(1);
    expect(validated[0].items).toHaveLength(2);
    // URL should be forced from catalog
    expect(validated[0].items[0].url).toBe('https://central.co.th/real/sku001');
    expect(validated[0].items[1].url).toBe('https://central.co.th/real/sku002');
    // Price should be forced from catalog
    expect(validated[0].items[0].price).toBe(790);
    expect(validated[0].items[1].price).toBe(1590);
    // Total recalculated
    expect(validated[0].totalPrice).toBe(2380);
  });

  it('should prefer catalog fields for matched items to keep image/link/product aligned', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'Catalog Sync',
      items: [
        {
          name: 'AI Hallucinated Name',
          brand: 'AI Brand',
          category: 'Unknown',
          color: 'Pink',
          description: 'AI-generated description',
          sku: 'SKU001',
          price: 99999,
          url: 'https://fake.com/not-real',
        },
      ],
      totalPrice: 99999,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);
    expect(validated).toHaveLength(1);
    expect(validated[0].items).toHaveLength(1);
    expect(validated[0].items[0].name).toBe('สินค้า SKU001');
    expect(validated[0].items[0].brand).toBe('CPS');
    expect(validated[0].items[0].color).toBe('black');
    expect(validated[0].items[0].url).toBe('https://central.co.th/real/sku001');
    expect(validated[0].items[0].price).toBe(790);
  });

  it('should drop items with invalid SKUs', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'Test',
      items: [
        { name: 'Real', brand: 'B', category: 'C', color: 'W', description: '', sku: 'SKU001', price: 790, url: 'https://url' },
        { name: 'Fake', brand: 'B', category: 'C', color: 'W', description: '', sku: 'FAKE999', price: 500, url: 'https://fake' },
      ],
      totalPrice: 1290,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);
    expect(validated[0].items).toHaveLength(1);
    expect(validated[0].items[0].sku).toBe('SKU001');
    expect(validated[0].totalPrice).toBe(790);
  });

  it('should fallback to a similar catalog product when SKU is missing but item intent is clear', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'Fallback',
      items: [
        { name: 'White office shirt', brand: 'AI', category: 'Tops', color: 'White', description: 'clean formal shirt', sku: 'MISSING-001', price: 850, url: '' },
      ],
      totalPrice: 850,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);

    expect(validated).toHaveLength(1);
    expect(validated[0].items).toHaveLength(1);
    // Should map to a real catalog product (not keep hallucinated SKU)
    expect(validated[0].items[0].sku).toMatch(/^SKU00[1-3]$/);
    expect(validated[0].items[0].url).toContain('https://central.co.th/real/');
    expect(validated[0].items[0].price).toBeGreaterThan(0);
  });

  it('should drop looks with no valid items', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'All Fake',
      items: [
        { name: 'Fake1', brand: 'B', category: 'C', color: 'W', description: '', sku: 'FAKE1', price: 100, url: 'https://fake1' },
        { name: 'Fake2', brand: 'B', category: 'C', color: 'W', description: '', sku: 'FAKE2', price: 200, url: 'https://fake2' },
      ],
      totalPrice: 300,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);
    expect(validated).toHaveLength(0);
  });

  it('should handle case-insensitive SKU matching', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'Case Test',
      items: [
        { name: 'Item', brand: 'B', category: 'C', color: 'W', description: '', sku: 'sku001', price: 0, url: '' },
      ],
      totalPrice: 0,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);
    expect(validated).toHaveLength(1);
    expect(validated[0].items[0].url).toBe('https://central.co.th/real/sku001');
  });

  it('should handle empty catalog', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'Test',
      items: [{ name: 'X', brand: 'B', category: 'C', color: 'W', description: '', sku: 'SKU001', price: 100, url: '' }],
      totalPrice: 100,
    }];

    const validated = validateLooksAgainstCatalog(looks, []);
    // With empty catalog, all items pass through unchanged
    expect(validated).toEqual(looks);
  });

  it('should match items by URL when SKU is empty (fallback parser output)', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'URL Test',
      items: [
        { name: 'เสื้อเชิ้ต', brand: 'AI Brand', category: 'Unknown', color: 'Unknown', description: '', sku: '', price: 999, url: 'https://central.co.th/real/sku001' },
        { name: 'กางเกง', brand: 'AI Brand', category: 'Unknown', color: 'Unknown', description: '', sku: '', price: 999, url: 'https://central.co.th/real/sku002' },
      ],
      totalPrice: 1998,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);
    expect(validated).toHaveLength(1);
    expect(validated[0].items).toHaveLength(2);
    // Should populate SKU from catalog
    expect(validated[0].items[0].sku).toBe('SKU001');
    expect(validated[0].items[1].sku).toBe('SKU002');
    // Should force catalog price
    expect(validated[0].items[0].price).toBe(790);
    expect(validated[0].items[1].price).toBe(1590);
    // Brand from catalog
    expect(validated[0].items[0].brand).toBe('CPS');
  });

  it('should match URLs with trailing slashes or different casing', () => {
    const looks = [{
      lookNumber: 1,
      styleName: 'Normalize Test',
      items: [
        { name: 'Item', brand: '', category: 'Unknown', color: 'Unknown', description: '', sku: '', price: 0, url: 'https://Central.co.th/real/SKU001/' },
      ],
      totalPrice: 0,
    }];

    const validated = validateLooksAgainstCatalog(looks, catalog);
    expect(validated).toHaveLength(1);
    expect(validated[0].items[0].sku).toBe('SKU001');
    expect(validated[0].items[0].price).toBe(790);
  });

  it('should remove duplicate outfit roles within the same look', () => {
    const roleCatalog = [
      {
        ...mockProduct('TOP001', 'https://central.co.th/real/top001', 790, 'CPS'),
        classification: {
          category: { department: 'Clothing', category: 'Tops' },
          gender: 'women',
          tags: { occasion: [], style: [], season: [] },
          role: 'top',
        },
      } as EnhancedProduct,
      {
        ...mockProduct('TOP002', 'https://central.co.th/real/top002', 890, 'CPS'),
        classification: {
          category: { department: 'Clothing', category: 'Tops' },
          gender: 'women',
          tags: { occasion: [], style: [], season: [] },
          role: 'top',
        },
      } as EnhancedProduct,
      {
        ...mockProduct('BTM001', 'https://central.co.th/real/btm001', 1290, 'Levi'),
        classification: {
          category: { department: 'Clothing', category: 'Bottoms' },
          gender: 'women',
          tags: { occasion: [], style: [], season: [] },
          role: 'bottom',
        },
      } as EnhancedProduct,
    ];

    const looks = [{
      lookNumber: 1,
      styleName: 'Duplicate Tops',
      items: [
        { name: 'Top A', brand: 'AI', category: 'Tops', color: 'Blue', description: '', sku: 'TOP001', price: 0, url: '' },
        { name: 'Top B', brand: 'AI', category: 'Tops', color: 'White', description: '', sku: 'TOP002', price: 0, url: '' },
        { name: 'Bottom', brand: 'AI', category: 'Bottoms', color: 'Navy', description: '', sku: 'BTM001', price: 0, url: '' },
      ],
      totalPrice: 0,
    }];

    const validated = validateLooksAgainstCatalog(looks, roleCatalog);
    expect(validated).toHaveLength(1);
    expect(validated[0].items).toHaveLength(2);
    expect(validated[0].items.some((item) => item.sku === 'TOP001')).toBe(true);
    expect(validated[0].items.some((item) => item.sku === 'TOP002')).toBe(false);
    expect(validated[0].items.some((item) => item.sku === 'BTM001')).toBe(true);
  });
});
