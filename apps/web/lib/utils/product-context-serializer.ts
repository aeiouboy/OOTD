/**
 * Product Context Serializer for AI Prompts
 * Converts EnhancedProduct data into token-efficient format for LLM context
 */

import type { EnhancedProduct, ProductSummary, ProductFilterCriteria } from '../types/product-types';
import type { OccasionType, Gender, StyleTag } from '../types/enums';

export interface ProductContext {
  products: ProductSummary[];
  totalCount: number;
  filters?: ProductFilterCriteria;
  metadata?: {
    occasion?: string;
    budget?: { min: number; max: number };
    style?: string[];
    gender?: string;
  };
}

/**
 * Convert Enhanced Product to Product Summary (token-efficient format)
 */
export function toProductSummary(product: EnhancedProduct): ProductSummary {
  // Safely extract category string
  const categoryParts = [
    product.classification?.category?.department,
    product.classification?.category?.category,
    product.classification?.category?.subcategory,
    product.classification?.category?.type,
  ].filter(Boolean);

  const categoryString = categoryParts.join(' > ') || 'Uncategorized';

  return {
    id: product.id,
    name: product.name?.en || product.name?.th || 'Unnamed Product',
    brand: product.brand,
    price: product.pricing?.currentPrice || 0,
    url: product.centralIntegration?.productUrl || '',
    category: categoryString,
    gender: product.classification?.gender || 'unisex',
    occasions: product.classification?.tags?.occasion || [],
    formality: product.style?.formalityLevel || 5,
    colors: [
      product.style?.colors?.primary,
      ...(product.style?.colors?.secondary || []),
    ].filter(Boolean),
    style: product.style?.styleAttributes || [],
    season: product.style?.seasonality || ['all-season'],
    role: product.classification?.role,
  };
}

/**
 * Serialize products for AI context with token optimization
 */
export function serializeProductsForAI(
  products: EnhancedProduct[],
  maxProducts: number = 20
): ProductContext {
  // Limit products to stay within token budget
  const limitedProducts = products.slice(0, maxProducts);

  // Convert to summaries
  const summaries = limitedProducts.map(toProductSummary);

  return {
    products: summaries,
    totalCount: products.length,
  };
}

/**
 * Format product context as a prompt-friendly string
 */
export function formatProductContextForPrompt(context: ProductContext): string {
  const lines: string[] = [];

  // Header
  lines.push(`=== AVAILABLE PRODUCTS (${context.products.length} of ${context.totalCount}) ===\n`);

  // Filters applied
  if (context.filters || context.metadata) {
    lines.push('Applied Filters:');
    if (context.metadata?.occasion) {
      lines.push(`- Occasion: ${context.metadata.occasion}`);
    }
    if (context.metadata?.budget) {
      lines.push(`- Budget: ฿${context.metadata.budget.min}-${context.metadata.budget.max}`);
    }
    if (context.metadata?.gender) {
      lines.push(`- Gender: ${context.metadata.gender}`);
    }
    if (context.metadata?.style && context.metadata.style.length > 0) {
      lines.push(`- Style: ${context.metadata.style.join(', ')}`);
    }
    lines.push('');
  }

  // Product list (compact format)
  context.products.forEach((product, index) => {
    const occasionStr = product.occasions.length > 0 ? product.occasions.join('/') : 'general';
    const colorStr = product.colors.length > 0 ? product.colors.slice(0, 2).join(', ') : 'various';
    const styleStr = product.style.length > 0 ? product.style.slice(0, 2).join(', ') : 'standard';

    lines.push(
      `${index + 1}. [${product.id}] ${product.name} by ${product.brand}` +
      `\n   ฿${product.price.toLocaleString('th-TH')} | ${product.category} | ${product.gender}` +
      `\n   URL: ${product.url}` +
      `\n   Occasions: ${occasionStr} | Formality: ${product.formality}/10` +
      `\n   Colors: ${colorStr} | Style: ${styleStr}` +
      (product.role ? `\n   Role: ${product.role}` : '') +
      '\n'
    );
  });

  return lines.join('\n');
}

/**
 * Create a compact JSON format for structured prompts
 */
export function formatProductContextAsJSON(context: ProductContext): string {
  const compactProducts = context.products.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    occasions: p.occasions,
    formality: p.formality,
    colors: p.colors.slice(0, 2),
    style: p.style.slice(0, 2),
  }));

  return JSON.stringify({
    count: context.products.length,
    total: context.totalCount,
    products: compactProducts,
  }, null, 2);
}

/**
 * Estimate token count for product context
 * (Rough estimation: 4 chars ≈ 1 token for English, 2 chars ≈ 1 token for Thai)
 */
export function estimateTokenCount(context: ProductContext): number {
  const formattedText = formatProductContextForPrompt(context);
  // Rough estimation: average 3.5 characters per token
  return Math.ceil(formattedText.length / 3.5);
}

/**
 * Filter products to fit within token budget
 */
export function fitProductsToTokenBudget(
  products: EnhancedProduct[],
  maxTokens: number = 1500
): ProductContext {
  let currentProducts = 20;
  let context = serializeProductsForAI(products, currentProducts);
  let tokens = estimateTokenCount(context);

  // Binary search to find optimal product count
  while (tokens > maxTokens && currentProducts > 5) {
    currentProducts = Math.floor(currentProducts * 0.8);
    context = serializeProductsForAI(products, currentProducts);
    tokens = estimateTokenCount(context);
  }

  return context;
}
