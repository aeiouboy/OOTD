/**
 * Unit Tests for V5 Catalog Serializer
 *
 * Validates that serializeProductForV5() outputs 8 pipe-delimited fields
 * matching the simplified format:
 * SKU|Name|Brand|Category|Role|Price|Color|URL
 */

import { serializeProductForV5, serializeCatalogForV5 } from '../ai-serializer';
import type { EnhancedProduct } from '../../types/product-types';

/** Minimal mock product with all fields populated */
function createMockProduct(overrides: Partial<EnhancedProduct> = {}): EnhancedProduct {
  return {
    id: 'prod-001',
    sku: 'SKU001',
    name: { en: 'White Cotton Tee', th: 'เสื้อยืดขาว' },
    brand: 'CPS',
    pricing: { currentPrice: 790, currency: 'THB' },
    classification: {
      category: { department: 'Women', category: 'Tops' },
      gender: 'women',
      tags: {
        occasion: ['casual', 'cafe'],
        style: ['minimal', 'modern'],
      },
      role: 'top',
    },
    style: {
      colors: { primary: 'White' },
      formalityLevel: 3,
      styleAttributes: ['minimal', 'modern'],
      material: 'cotton',
      seasonality: ['all-season'],
    },
    centralIntegration: {
      productUrl: 'https://central.co.th/product/sku001',
    },
    ...overrides,
  } as EnhancedProduct;
}

describe('serializeProductForV5()', () => {
  it('should output 8 pipe-delimited fields', () => {
    const product = createMockProduct();
    const result = serializeProductForV5(product);
    const fields = result.split('|');

    expect(fields).toHaveLength(8);
  });

  it('should include all 8 fields in correct order', () => {
    const product = createMockProduct();
    const result = serializeProductForV5(product);
    const fields = result.split('|');

    expect(fields[0]).toBe('SKU001');           // SKU
    expect(fields[1]).toBe('White Cotton Tee'); // Name
    expect(fields[2]).toBe('CPS');              // Brand
    expect(fields[3]).toBe('Tops');             // Category
    expect(fields[4]).toBe('top');              // Role
    expect(fields[5]).toBe('790');              // Price
    expect(fields[6]).toBe('White');            // Color
    expect(fields[7]).toBe('https://central.co.th/product/sku001'); // URL
  });

  it('should default color to "unknown" when missing', () => {
    const product = createMockProduct({
      style: {
        colors: {},
        styleAttributes: [],
        seasonality: ['all-season'],
      } as any,
    });
    const fields = serializeProductForV5(product).split('|');

    expect(fields[6]).toBe('unknown'); // Default color
  });

  it('should default category to "Clothing" when missing', () => {
    const product = createMockProduct({
      classification: {
        category: {},
        gender: 'women',
        tags: {},
        role: 'top',
      } as any,
    });
    const fields = serializeProductForV5(product).split('|');

    expect(fields[3]).toBe('Clothing');
  });

  it('should default role to "unknown" when missing', () => {
    const product = createMockProduct({
      classification: {
        category: { department: 'Men', category: 'Pants' },
        gender: 'men',
        tags: {},
      } as any,
    });
    const fields = serializeProductForV5(product).split('|');

    expect(fields[4]).toBe('unknown');
  });

  it('should use id as fallback when sku is missing', () => {
    const product = createMockProduct({
      sku: undefined,
    } as any);
    const fields = serializeProductForV5(product).split('|');

    expect(fields[0]).toBe('prod-001');
  });

  it('should escape pipes in field values', () => {
    const product = createMockProduct({
      name: { en: 'Top|Special Edition', th: 'เสื้อ' },
    });
    const fields = serializeProductForV5(product).split('|');

    // The pipe in the name should be escaped to "/"
    expect(fields[1]).toBe('Top/Special Edition');
    expect(fields).toHaveLength(8); // Still 8 fields
  });
});

describe('serializeCatalogForV5()', () => {
  it('should include 8-field column header', () => {
    const products = [createMockProduct()];
    const result = serializeCatalogForV5(products);

    expect(result).toContain('SKU|Name|Brand|Category|Role|Price|Color|URL');
  });

  it('should include header, column header, product lines, and footer', () => {
    const products = [createMockProduct(), createMockProduct({ sku: 'SKU002' })];
    const result = serializeCatalogForV5(products);
    const lines = result.split('\n');

    expect(lines[0]).toContain('PRODUCT CATALOG');
    expect(lines[1]).toBe('SKU|Name|Brand|Category|Role|Price|Color|URL');
    expect(lines[2]).toContain('SKU001');
    expect(lines[3]).toContain('SKU002');
    expect(lines[4]).toContain('END CATALOG (2 products)');
  });

  it('should handle empty product array', () => {
    const result = serializeCatalogForV5([]);
    expect(result).toContain('END CATALOG (0 products)');
  });
});
