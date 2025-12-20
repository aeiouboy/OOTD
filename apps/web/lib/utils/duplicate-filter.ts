/**
 * Duplicate Product Filter
 *
 * Filters out products that have already been recommended in the current session.
 * Uses Set for O(1) lookup performance.
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 3.2 - Implement duplicate product filtering
 *
 * @version 1.0.0
 * @created 2025-10-14
 */

import type { SessionContext } from '../types/chat-types';
import type { EnhancedProduct } from '../types/product-types';

/**
 * Filters out products that have already been recommended in the session
 *
 * Performance: O(n) where n is the number of products to filter
 * Uses Set for O(1) lookup of already recommended products
 *
 * @param products - Array of products to filter
 * @param sessionContext - Current session context with recommended product IDs
 * @returns Filtered array excluding already recommended products
 */
export function filterDuplicateProducts(
  products: EnhancedProduct[],
  sessionContext: SessionContext
): EnhancedProduct[] {
  // Handle edge cases
  if (!products || products.length === 0) {
    return [];
  }

  if (!sessionContext || sessionContext.recommendedProductIds.length === 0) {
    return products; // No filtering needed if no products recommended yet
  }

  // Convert recommended IDs to Set for O(1) lookup performance
  const recommendedIds = new Set(sessionContext.recommendedProductIds);

  // Filter out products that have been recommended
  const filtered = products.filter((product) => {
    // Check both sku and id fields (some products may use different field names)
    const productId = product.sku || product.id;
    return !recommendedIds.has(productId);
  });

  return filtered;
}

/**
 * Checks if there are sufficient unique products available after filtering
 *
 * @param products - Array of products after filtering
 * @param minimumRequired - Minimum number of products required (default: 3 for outfits)
 * @returns True if sufficient products available
 */
export function hasSufficientProducts(
  products: EnhancedProduct[],
  minimumRequired: number = 3
): boolean {
  return products.length >= minimumRequired;
}

/**
 * Gets insufficient products message in Thai
 *
 * @returns User-friendly message when products run low
 */
export function getInsufficientProductsMessage(): string {
  return 'เราแนะนำสินค้าในหมวดนี้ไปค่อนข้างครบแล้วนะคะ ลองดูสินค้าที่แนะนำไปก่อนหน้านี้อีกทีได้เลย หรือเปลี่ยนไปดูหมวดอื่นมั้ยคะ?';
}

/**
 * Filters and validates products for recommendation
 * Combines filtering with sufficiency check
 *
 * @param products - Array of products to filter
 * @param sessionContext - Current session context
 * @param minimumRequired - Minimum products required (default: 3)
 * @returns Object with filtered products and sufficiency flag
 */
export function filterAndValidateProducts(
  products: EnhancedProduct[],
  sessionContext: SessionContext,
  minimumRequired: number = 3
): {
  products: EnhancedProduct[];
  hasSufficientProducts: boolean;
  message?: string;
} {
  const filteredProducts = filterDuplicateProducts(products, sessionContext);
  const sufficient = hasSufficientProducts(filteredProducts, minimumRequired);

  return {
    products: filteredProducts,
    hasSufficientProducts: sufficient,
    message: sufficient ? undefined : getInsufficientProductsMessage(),
  };
}

/**
 * Extracts product IDs from an array of products
 * Helper function for updating session context
 *
 * @param products - Array of products
 * @returns Array of product IDs (SKUs)
 */
export function extractProductIds(products: EnhancedProduct[]): string[] {
  return products.map((product) => product.sku || product.id).filter((id): id is string => !!id);
}

/**
 * Filters products and preserves original order
 * Some use cases may require maintaining the original product order
 *
 * @param products - Array of products in specific order
 * @param sessionContext - Current session context
 * @returns Filtered array maintaining original order
 */
export function filterDuplicatesPreservingOrder(
  products: EnhancedProduct[],
  sessionContext: SessionContext
): EnhancedProduct[] {
  // This is the same as filterDuplicateProducts since .filter() preserves order
  // Provided as explicit function for clarity in use cases where order matters
  return filterDuplicateProducts(products, sessionContext);
}

/**
 * Gets statistics about filtering results
 * Useful for logging and monitoring
 *
 * @param originalCount - Original product count before filtering
 * @param filteredCount - Product count after filtering
 * @param sessionContext - Current session context
 * @returns Statistics object
 */
export function getFilteringStatistics(
  originalCount: number,
  filteredCount: number,
  sessionContext: SessionContext
): {
  originalCount: number;
  filteredCount: number;
  duplicatesFiltered: number;
  recommendedInSession: number;
  filterPercentage: number;
} {
  const duplicatesFiltered = originalCount - filteredCount;
  const filterPercentage = originalCount > 0 ? (duplicatesFiltered / originalCount) * 100 : 0;

  return {
    originalCount,
    filteredCount,
    duplicatesFiltered,
    recommendedInSession: sessionContext.recommendedProductIds.length,
    filterPercentage: Math.round(filterPercentage * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Validates that products array doesn't contain duplicates within itself
 * Safety check before filtering
 *
 * @param products - Array of products to validate
 * @returns True if no internal duplicates found
 */
export function hasNoInternalDuplicates(products: EnhancedProduct[]): boolean {
  const seenIds = new Set<string>();

  for (const product of products) {
    const id = product.sku || product.id;
    if (!id) continue; // Skip products without ID

    if (seenIds.has(id)) {
      return false; // Found duplicate
    }
    seenIds.add(id);
  }

  return true; // No duplicates found
}

/**
 * Removes internal duplicates from products array
 * Keeps first occurrence of each product
 *
 * @param products - Array of products that may contain duplicates
 * @returns Array with duplicates removed
 */
export function removeinternalDuplicates(products: EnhancedProduct[]): EnhancedProduct[] {
  const seenIds = new Set<string>();
  const uniqueProducts: EnhancedProduct[] = [];

  for (const product of products) {
    const id = product.sku || product.id;
    if (!id) {
      uniqueProducts.push(product); // Include products without ID
      continue;
    }

    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueProducts.push(product);
    }
  }

  return uniqueProducts;
}
