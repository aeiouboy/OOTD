/**
 * Unit Tests for Duplicate Product Filter
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 7.2 - Unit tests for duplicate filter
 *
 * @version 1.0.0
 * @created 2025-10-14
 */

import { describe, it, expect } from 'vitest';
import {
  filterDuplicateProducts,
  hasSufficientProducts,
  getInsufficientProductsMessage,
  filterAndValidateProducts,
  extractProductIds,
  filterDuplicatesPreservingOrder,
  getFilteringStatistics,
  hasNoInternalDuplicates,
  removeinternalDuplicates,
} from '../duplicate-filter';
import { createSessionContext, updateSessionContext } from '../session-context';
import type { EnhancedProduct } from '../../types/product-types';

// Mock product factory
const createMockProduct = (sku: string, id?: string): Partial<EnhancedProduct> => ({
  sku,
  id: id || sku,
  brand: 'Test Brand',
  availability: { status: 'in_stock' },
});

describe('Duplicate Product Filter', () => {
  describe('filterDuplicateProducts', () => {
    it('should return all products when session is empty', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
      ] as EnhancedProduct[];

      const sessionContext = createSessionContext();
      const filtered = filterDuplicateProducts(products, sessionContext);

      expect(filtered.length).toBe(3);
      expect(filtered).toEqual(products);
    });

    it('should filter out previously recommended products', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
      ] as EnhancedProduct[];

      const sessionContext = updateSessionContext(createSessionContext(), ['SKU-001', 'SKU-002']);
      const filtered = filterDuplicateProducts(products, sessionContext);

      expect(filtered.length).toBe(1);
      expect(filtered[0].sku).toBe('SKU-003');
    });

    it('should handle empty products array', () => {
      const sessionContext = updateSessionContext(createSessionContext(), ['SKU-001']);
      const filtered = filterDuplicateProducts([], sessionContext);

      expect(filtered).toEqual([]);
    });

    it('should handle products with only id field (no sku)', () => {
      const products = [
        { id: 'ID-001', brand: 'Test' },
        { id: 'ID-002', brand: 'Test' },
      ] as EnhancedProduct[];

      const sessionContext = updateSessionContext(createSessionContext(), ['ID-001']);
      const filtered = filterDuplicateProducts(products, sessionContext);

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('ID-002');
    });

    it('should use O(1) lookup performance', () => {
      // Create large product list
      const products = Array.from({ length: 1000 }, (_, i) =>
        createMockProduct(`SKU-${i.toString().padStart(4, '0')}`)
      ) as EnhancedProduct[];

      // Create session with 500 recommended products
      const recommendedIds = Array.from({ length: 500 }, (_, i) => `SKU-${i.toString().padStart(4, '0')}`);
      const sessionContext = updateSessionContext(createSessionContext(), recommendedIds);

      const startTime = Date.now();
      const filtered = filterDuplicateProducts(products, sessionContext);
      const endTime = Date.now();

      expect(filtered.length).toBe(500);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast with O(1) lookup
    });
  });

  describe('hasSufficientProducts', () => {
    it('should return true when meeting minimum requirement', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
      ] as EnhancedProduct[];

      expect(hasSufficientProducts(products, 3)).toBe(true);
    });

    it('should return false when below minimum requirement', () => {
      const products = [createMockProduct('SKU-001'), createMockProduct('SKU-002')] as EnhancedProduct[];

      expect(hasSufficientProducts(products, 3)).toBe(false);
    });

    it('should use default minimum of 3', () => {
      const products = [createMockProduct('SKU-001'), createMockProduct('SKU-002')] as EnhancedProduct[];

      expect(hasSufficientProducts(products)).toBe(false);
    });

    it('should return true when exceeding minimum', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
        createMockProduct('SKU-004'),
      ] as EnhancedProduct[];

      expect(hasSufficientProducts(products, 3)).toBe(true);
    });
  });

  describe('getInsufficientProductsMessage', () => {
    it('should return Thai message', () => {
      const message = getInsufficientProductsMessage();

      expect(message).toContain('เรา');
      expect(message).toContain('แนะนำ');
      expect(message).toBeTruthy();
    });
  });

  describe('filterAndValidateProducts', () => {
    it('should return filtered products and sufficient flag', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
      ] as EnhancedProduct[];

      const sessionContext = createSessionContext();
      const result = filterAndValidateProducts(products, sessionContext, 3);

      expect(result.products.length).toBe(3);
      expect(result.hasSufficientProducts).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should return insufficient message when products below minimum', () => {
      const products = [createMockProduct('SKU-001'), createMockProduct('SKU-002')] as EnhancedProduct[];

      const sessionContext = createSessionContext();
      const result = filterAndValidateProducts(products, sessionContext, 3);

      expect(result.products.length).toBe(2);
      expect(result.hasSufficientProducts).toBe(false);
      expect(result.message).toBeDefined();
      expect(result.message).toContain('แนะนำ');
    });

    it('should filter and validate in one operation', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
        createMockProduct('SKU-004'),
      ] as EnhancedProduct[];

      const sessionContext = updateSessionContext(createSessionContext(), ['SKU-001', 'SKU-002']);
      const result = filterAndValidateProducts(products, sessionContext, 2);

      expect(result.products.length).toBe(2);
      expect(result.products[0].sku).toBe('SKU-003');
      expect(result.products[1].sku).toBe('SKU-004');
      expect(result.hasSufficientProducts).toBe(true);
    });
  });

  describe('extractProductIds', () => {
    it('should extract SKUs from products', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
      ] as EnhancedProduct[];

      const ids = extractProductIds(products);

      expect(ids).toEqual(['SKU-001', 'SKU-002', 'SKU-003']);
    });

    it('should use id field when sku is not available', () => {
      const products = [
        { id: 'ID-001', brand: 'Test' },
        { id: 'ID-002', brand: 'Test' },
      ] as EnhancedProduct[];

      const ids = extractProductIds(products);

      expect(ids).toEqual(['ID-001', 'ID-002']);
    });

    it('should filter out products without ID', () => {
      const products = [
        createMockProduct('SKU-001'),
        { brand: 'Test' } as EnhancedProduct, // No ID
        createMockProduct('SKU-002'),
      ] as EnhancedProduct[];

      const ids = extractProductIds(products);

      expect(ids).toEqual(['SKU-001', 'SKU-002']);
    });

    it('should handle empty array', () => {
      const ids = extractProductIds([]);

      expect(ids).toEqual([]);
    });
  });

  describe('filterDuplicatesPreservingOrder', () => {
    it('should maintain original product order', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
      ] as EnhancedProduct[];

      const sessionContext = updateSessionContext(createSessionContext(), ['SKU-002']);
      const filtered = filterDuplicatesPreservingOrder(products, sessionContext);

      expect(filtered.length).toBe(2);
      expect(filtered[0].sku).toBe('SKU-001');
      expect(filtered[1].sku).toBe('SKU-003');
    });
  });

  describe('getFilteringStatistics', () => {
    it('should calculate statistics correctly', () => {
      const sessionContext = updateSessionContext(createSessionContext(), ['SKU-001', 'SKU-002', 'SKU-003']);
      const stats = getFilteringStatistics(10, 7, sessionContext);

      expect(stats.originalCount).toBe(10);
      expect(stats.filteredCount).toBe(7);
      expect(stats.duplicatesFiltered).toBe(3);
      expect(stats.recommendedInSession).toBe(3);
      expect(stats.filterPercentage).toBe(30);
    });

    it('should handle zero original count', () => {
      const sessionContext = createSessionContext();
      const stats = getFilteringStatistics(0, 0, sessionContext);

      expect(stats.filterPercentage).toBe(0);
    });

    it('should round percentage to 2 decimals', () => {
      const sessionContext = updateSessionContext(createSessionContext(), ['SKU-001']);
      const stats = getFilteringStatistics(3, 2, sessionContext);

      expect(stats.filterPercentage).toBe(33.33);
    });
  });

  describe('hasNoInternalDuplicates', () => {
    it('should return true for unique products', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-003'),
      ] as EnhancedProduct[];

      expect(hasNoInternalDuplicates(products)).toBe(true);
    });

    it('should return false for duplicate products', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-001'), // Duplicate
      ] as EnhancedProduct[];

      expect(hasNoInternalDuplicates(products)).toBe(false);
    });

    it('should handle products without IDs', () => {
      const products = [
        createMockProduct('SKU-001'),
        { brand: 'Test' } as EnhancedProduct, // No ID
        createMockProduct('SKU-002'),
      ] as EnhancedProduct[];

      expect(hasNoInternalDuplicates(products)).toBe(true);
    });
  });

  describe('removeinternalDuplicates', () => {
    it('should remove duplicate products', () => {
      const products = [
        createMockProduct('SKU-001'),
        createMockProduct('SKU-002'),
        createMockProduct('SKU-001'), // Duplicate
        createMockProduct('SKU-003'),
        createMockProduct('SKU-002'), // Duplicate
      ] as EnhancedProduct[];

      const unique = removeinternalDuplicates(products);

      expect(unique.length).toBe(3);
      expect(unique[0].sku).toBe('SKU-001');
      expect(unique[1].sku).toBe('SKU-002');
      expect(unique[2].sku).toBe('SKU-003');
    });

    it('should keep first occurrence of duplicates', () => {
      const product1a = { sku: 'SKU-001', brand: 'Brand A' } as EnhancedProduct;
      const product1b = { sku: 'SKU-001', brand: 'Brand B' } as EnhancedProduct; // Different but same SKU

      const unique = removeinternalDuplicates([product1a, product1b]);

      expect(unique.length).toBe(1);
      expect(unique[0].brand).toBe('Brand A'); // First occurrence
    });

    it('should handle products without IDs', () => {
      const products = [
        createMockProduct('SKU-001'),
        { brand: 'Test' } as EnhancedProduct, // No ID
        { brand: 'Test2' } as EnhancedProduct, // No ID
        createMockProduct('SKU-002'),
      ] as EnhancedProduct[];

      const unique = removeinternalDuplicates(products);

      expect(unique.length).toBe(4); // All included since ones without ID can't be duplicates
    });
  });
});
