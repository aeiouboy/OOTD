/**
 * Product Data Loader for Test Mode
 * Loads and filters products for LLM testing with real Central Group inventory
 */

import type { EnhancedProduct } from './types/product-types';
import type { OccasionType, Gender, StyleTag } from './types/enums';

/**
 * Query context extracted from user message
 */
export interface QueryContext {
  occasion?: OccasionType;
  budget?: { min: number; max: number };
  style?: StyleTag[];
  gender?: Gender;
  keywords?: string[];
}

/**
 * Simple Product type from API (flat structure)
 */
interface SimpleProduct {
  sku: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  onlineUrl: string;
  availability: string;
  category: string;
}

/**
 * Convert simple Product to EnhancedProduct
 */
function convertSimpleToEnhancedProduct(simple: SimpleProduct): EnhancedProduct {
  // Determine gender from category
  const gender = simple.category === 'men' ? 'men' :
                 simple.category === 'women' ? 'women' : 'unisex';

  return {
    id: simple.sku,
    sku: simple.sku,
    name: {
      en: simple.name,
      th: simple.name
    },
    description: {
      en: '',
      th: ''
    },
    brand: simple.brand || 'Central',
    pricing: {
      currentPrice: simple.price,
      originalPrice: simple.price,
      currency: 'THB'
    },
    classification: {
      category: {
        department: gender === 'women' ? "Women's Fashion" : "Men's Fashion",
        category: 'Clothing',
        subcategory: 'General'
      },
      gender,
      tags: {
        occasion: ['work', 'chill', 'cafe'] as OccasionType[],
        style: ['classic'] as StyleTag[],
        season: ['all-season']
      },
      isCompleteOutfit: false
    },
    style: {
      colors: {
        primary: 'multi'
      },
      formalityLevel: 5,
      styleAttributes: ['classic'] as StyleTag[],
      seasonality: ['all-season']
    },
    sizing: {
      availableSizes: ['S', 'M', 'L', 'XL']
    },
    availability: {
      status: simple.availability === 'in_stock' ? 'in_stock' : 'out_of_stock'
    },
    thaiMarket: {
      culturalAppropriate: true
    },
    centralIntegration: {
      centralSKU: simple.sku,
      productUrl: simple.onlineUrl,
      images: {
        primary: simple.imageUrl
      }
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    }
  } as EnhancedProduct;
}

/**
 * Load products for test mode
 * In production, this would fetch from API. For now, loads from static files.
 */
export async function loadProductsForTestMode(): Promise<EnhancedProduct[]> {
  try {
    // Try to load from API endpoint first
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        console.log(`Loaded ${data.products.length} products from API`);
        // Convert simple products to enhanced products
        const enhancedProducts = data.products.map((p: SimpleProduct) => convertSimpleToEnhancedProduct(p));
        return enhancedProducts;
      }
    }
  } catch (error) {
    console.warn('Failed to load products from API, falling back to static data:', error);
  }

  // Fallback: Load from product_master.json using transformer
  try {
    const { loadProductMaster } = await import('./transformers/product-master-transformer');
    const products = await loadProductMaster();

    if (products.length > 0) {
      return products;
    }
  } catch (error) {
    console.warn('Failed to load product_master.json:', error);
  }

  // Final fallback: Load from legacy static JSON files
  try {
    const [menResponse, womenResponse] = await Promise.all([
      fetch('/products/men.json').catch(() => null),
      fetch('/products/women.json').catch(() => null),
    ]);

    const products: EnhancedProduct[] = [];

    if (menResponse?.ok) {
      const menData = await menResponse.json();
      products.push(...(Array.isArray(menData) ? menData : menData.products || []));
    }

    if (womenResponse?.ok) {
      const womenData = await womenResponse.json();
      products.push(...(Array.isArray(womenData) ? womenData : womenData.products || []));
    }

    return products;
  } catch (error) {
    console.error('Failed to load product data:', error);
    return [];
  }
}

/**
 * Extract query context from user message
 */
export function extractQueryContext(message: string): QueryContext {
  const lowerMessage = message.toLowerCase();
  const context: QueryContext = {
    keywords: [],
  };

  // Extract occasion
  const occasionKeywords = {
    work: ['work', 'office', 'professional', 'meeting', 'ทำงาน', 'ออฟฟิศ', 'ประชุม'],
    party: ['party', 'celebration', 'event', 'ปาร์ตี้', 'งานเลี้ยง'],
    date: ['date', 'romantic', 'dinner', 'เดท', 'ดินเนอร์'],
    wedding: ['wedding', 'formal event', 'งานแต่ง', 'งานบวช'],
    sport: ['sport', 'gym', 'exercise', 'workout', 'ออกกำลัง', 'ยิม'],
    travel: ['travel', 'vacation', 'trip', 'ท่องเที่ยว', 'เที่ยว'],
    chill: ['casual', 'chill', 'relax', 'weekend', 'ชิล', 'สบาย'],
    cafe: ['cafe', 'coffee', 'brunch', 'คาเฟ่'],
    dinner: ['dinner', 'restaurant', 'dining', 'ดินเนอร์', 'ร้านอาหาร'],
  };

  for (const [occasion, keywords] of Object.entries(occasionKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      context.occasion = occasion as OccasionType;
      break;
    }
  }

  // Extract budget
  const budgetMatch = message.match(/(\d+[,\d]*)\s*(?:บาท|baht|thb)/i);
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1].replace(/,/g, ''));
    if (lowerMessage.includes('under') || lowerMessage.includes('ไม่เกิน') || lowerMessage.includes('ต่ำกว่า')) {
      context.budget = { min: 0, max: amount };
    } else if (lowerMessage.includes('over') || lowerMessage.includes('เกิน') || lowerMessage.includes('มากกว่า')) {
      context.budget = { min: amount, max: 999999 };
    } else {
      context.budget = { min: amount * 0.8, max: amount * 1.2 };
    }
  }

  // Extract price range
  const rangeMatch = message.match(/(\d+[,\d]*)\s*-\s*(\d+[,\d]*)/);
  if (rangeMatch) {
    context.budget = {
      min: parseInt(rangeMatch[1].replace(/,/g, '')),
      max: parseInt(rangeMatch[2].replace(/,/g, '')),
    };
  }

  // Extract gender
  // Note: Thai text often has no spaces between words, so use simple .includes() for Thai
  // Use word boundary for English only
  const hasMenThai = lowerMessage.includes('ผู้ชาย') || lowerMessage.includes('ผช.');
  const hasWomenThai = lowerMessage.includes('ผู้หญิง') || lowerMessage.includes('ผญ.');
  const hasMenEnglish = /\b(men|male)\b/.test(lowerMessage);
  const hasWomenEnglish = /\b(women|female|lady)\b/.test(lowerMessage);

  if (hasMenThai || hasMenEnglish) {
    context.gender = 'men' as Gender;
  } else if (hasWomenThai || hasWomenEnglish) {
    context.gender = 'women' as Gender;
  }

  // Extract style keywords
  const styleKeywords = {
    modern: ['modern', 'contemporary', 'ทันสมัย', 'โมเดิร์น'],
    classic: ['classic', 'timeless', 'traditional', 'คลาสสิค', 'ดั้งเดิม'],
    trendy: ['trendy', 'fashionable', 'latest', 'เทรนด์', 'ล่าสุด'],
    minimalist: ['minimalist', 'simple', 'clean', 'มินิมอล', 'เรียบง่าย'],
    elegant: ['elegant', 'sophisticated', 'refined', 'หรูหรา', 'สง่างาม'],
    casual: ['casual', 'relaxed', 'comfortable', 'สบาย', 'ลำลอง'],
  };

  context.style = [];
  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      context.style!.push(style as StyleTag);
    }
  }

  // Extract general keywords
  const words = message.split(/\s+/);
  context.keywords = words.filter(word => word.length > 3);

  return context;
}

/**
 * Filter products based on query context
 */
export function filterProductsByQuery(
  products: EnhancedProduct[],
  query: string,
  maxResults: number = 20
): EnhancedProduct[] {
  const context = extractQueryContext(query);
  let filtered = [...products];

  // Filter by gender FIRST (most important)
  if (context.gender) {
    const genderFiltered = filtered.filter(product =>
      product.classification?.gender === context.gender ||
      product.classification?.gender === 'unisex'
    );

    // Only apply gender filter if we have results
    if (genderFiltered.length > 0) {
      filtered = genderFiltered;
    }
  }

  // Filter by budget
  if (context.budget) {
    const budgetFiltered = filtered.filter(product =>
      product.pricing.currentPrice >= context.budget!.min &&
      product.pricing.currentPrice <= context.budget!.max
    );

    // Only apply budget filter if we have results
    if (budgetFiltered.length > 0) {
      filtered = budgetFiltered;
    }
  }

  // Filter by occasion (OPTIONAL - only apply if products have occasion tags)
  if (context.occasion) {
    const occasionFiltered = filtered.filter(product =>
      product.classification?.tags?.occasion?.includes(context.occasion!)
    );

    // Only apply occasion filter if we have matching results
    // This prevents filtering out ALL products when occasion tags are not available
    if (occasionFiltered.length > 0) {
      filtered = occasionFiltered;
    }
    // If no matches, keep the previously filtered results (gender + budget)
  }

  // Filter by style (OPTIONAL - only apply if products have matching styles)
  if (context.style && context.style.length > 0) {
    const styleFiltered = filtered.filter(product =>
      context.style!.some(style =>
        product.style.styleAttributes.includes(style)
      )
    );

    // Only apply style filter if we have matching results
    if (styleFiltered.length > 0) {
      filtered = styleFiltered;
    }
    // If no matches, keep the previously filtered results
  }

  // Sort by relevance (if we have filters applied)
  if (context.occasion || context.budget || context.style) {
    filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prioritize products with more matching attributes
      if (context.occasion) {
        if (a.classification?.tags?.occasion?.includes(context.occasion)) scoreA += 3;
        if (b.classification?.tags?.occasion?.includes(context.occasion)) scoreB += 3;
      }

      if (context.style) {
        scoreA += context.style.filter(s => a.style.styleAttributes.includes(s)).length;
        scoreB += context.style.filter(s => b.style.styleAttributes.includes(s)).length;
      }

      // Prioritize in-stock items
      if (a.availability.status === 'in_stock') scoreA += 1;
      if (b.availability.status === 'in_stock') scoreB += 1;

      return scoreB - scoreA;
    });
  } else {
    // No filters - shuffle for variety
    filtered = shuffleArray(filtered);
  }

  // Limit results
  return filtered.slice(0, maxResults);
}

/**
 * Get product statistics for debugging
 */
export function getProductStats(products: EnhancedProduct[]): {
  total: number;
  byGender: Record<string, number>;
  byOccasion: Record<string, number>;
  priceRange: { min: number; max: number; avg: number };
} {
  const stats = {
    total: products.length,
    byGender: {} as Record<string, number>,
    byOccasion: {} as Record<string, number>,
    priceRange: { min: Infinity, max: 0, avg: 0 },
  };

  let totalPrice = 0;

  products.forEach(product => {
    // Gender stats
    const gender = product.classification?.gender || 'unknown';
    stats.byGender[gender] = (stats.byGender[gender] || 0) + 1;

    // Occasion stats
    product.classification?.tags?.occasion?.forEach(occasion => {
      stats.byOccasion[occasion] = (stats.byOccasion[occasion] || 0) + 1;
    });

    // Price stats
    const price = product.pricing.currentPrice;
    stats.priceRange.min = Math.min(stats.priceRange.min, price);
    stats.priceRange.max = Math.max(stats.priceRange.max, price);
    totalPrice += price;
  });

  stats.priceRange.avg = products.length > 0 ? totalPrice / products.length : 0;

  return stats;
}

/**
 * Utility: Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
