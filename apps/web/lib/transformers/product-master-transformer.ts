/**
 * Product Master Transformer
 * Converts product_master.json format to EnhancedProduct interface
 */

import type { EnhancedProduct } from '../types/product-types';
import type { Gender, OccasionType, StyleTag, FormalityLevel, OutfitRole } from '../types/enums';

/**
 * Raw product format from product_master.json
 */
interface RawProductMaster {
  category: string; // e.g., "women_clothing", "men_clothing"
  price: string;
  original_price: string;
  brand: string;
  product_name: string;
  link: string;
  image_url: string;
  availability: string; // "In Stock", "Out of Stock"
  product_description: string;
}

/**
 * Convert product_master.json product to EnhancedProduct
 */
export function transformProductMasterToEnhanced(raw: RawProductMaster): EnhancedProduct {
  // Extract ID from link
  const id = extractProductId(raw.link);

  // Determine gender from category
  const gender = determineGender(raw.category);

  // Parse prices
  const currentPrice = parseFloat(raw.price) || 0;
  const originalPrice = parseFloat(raw.original_price) || currentPrice;

  // Infer product details from name and category
  const productInfo = inferProductDetails(raw.product_name, raw.category);

  // Create enhanced product
  const product: EnhancedProduct = {
    id,
    sku: id,
    name: {
      th: raw.product_name, // Use English name for both until we have translations
      en: raw.product_name,
    },
    description: {
      th: raw.product_description || '',
      en: raw.product_description || '',
    },
    brand: raw.brand || 'Central',

    pricing: {
      currentPrice,
      originalPrice,
      currency: 'THB',
      discountPercentage: originalPrice > currentPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : undefined,
    },

    classification: {
      category: {
        department: gender === 'women' ? "Women's Fashion" : gender === 'men' ? "Men's Fashion" : 'Fashion',
        category: 'Clothing',
        subcategory: productInfo.subcategory,
      },
      gender,
      tags: {
        occasion: productInfo.occasions,
        style: productInfo.styles,
        season: ['all-season'], // Default to all-season
      },
      role: productInfo.role,
      isCompleteOutfit: productInfo.role === 'outfit',
    },

    style: {
      colors: {
        primary: productInfo.primaryColor || 'multi',
      },
      formalityLevel: productInfo.formality,
      styleAttributes: productInfo.styles,
      seasonality: ['all-season'],
    },

    sizing: {
      availableSizes: ['S', 'M', 'L', 'XL'], // Default sizes
    },

    availability: {
      status: raw.availability.toLowerCase().includes('stock') ? 'in_stock' : 'out_of_stock',
    },

    thaiMarket: {
      culturalAppropriate: true, // Default to true
    },

    centralIntegration: {
      centralSKU: id,
      productUrl: raw.link,
      images: {
        primary: raw.image_url,
      },
    },

    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
    },
  };

  return product;
}

/**
 * Extract product ID from Central URL
 */
function extractProductId(url: string): string {
  // Extract from URL pattern: .../product-name-GRXXXXXXX
  const match = url.match(/gr[a-z0-9]+$/i) || url.match(/[a-z]{3}\d+$/i);
  if (match) {
    return match[0].toUpperCase();
  }

  // Fallback: use last segment of URL
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 20);
}

/**
 * Determine gender from category
 */
function determineGender(category: string): Gender {
  const lower = category.toLowerCase();
  if (lower.includes('women')) return 'women';
  if (lower.includes('men')) return 'men';
  if (lower.includes('unisex')) return 'unisex';
  return 'unisex';
}

/**
 * Infer product details from name and category
 */
function inferProductDetails(productName: string, category: string): {
  subcategory?: string;
  role?: OutfitRole;
  occasions: OccasionType[];
  styles: StyleTag[];
  formality: FormalityLevel;
  primaryColor?: string;
} {
  const lower = productName.toLowerCase();
  const result = {
    subcategory: undefined as string | undefined,
    role: undefined as OutfitRole | undefined,
    occasions: [] as OccasionType[],
    styles: [] as StyleTag[],
    formality: 5 as FormalityLevel,
    primaryColor: undefined as string | undefined,
  };

  // Determine role and subcategory
  if (lower.includes('dress')) {
    result.role = 'dress';
    result.subcategory = 'Dresses';
    result.formality = 7;
  } else if (lower.includes('shirt') || lower.includes('blouse') || lower.includes('top') || lower.includes('t-shirt') || lower.includes('tshirt')) {
    result.role = 'top';
    result.subcategory = 'Tops';
    result.formality = lower.includes('t-shirt') || lower.includes('tshirt') ? 3 : 6;
  } else if (lower.includes('pants') || lower.includes('trousers') || lower.includes('jeans') || lower.includes('shorts')) {
    result.role = 'bottom';
    result.subcategory = 'Bottoms';
    result.formality = lower.includes('jeans') || lower.includes('shorts') ? 4 : 6;
  } else if (lower.includes('blazer') || lower.includes('jacket') || lower.includes('coat') || lower.includes('cardigan')) {
    result.role = 'outerwear';
    result.subcategory = 'Outerwear';
    result.formality = lower.includes('blazer') ? 8 : 6;
  } else if (lower.includes('skirt')) {
    result.role = 'bottom';
    result.subcategory = 'Skirts';
    result.formality = 6;
  } else if (lower.includes('sweater') || lower.includes('pullover') || lower.includes('knit')) {
    result.role = 'top';
    result.subcategory = 'Knitwear';
    result.formality = 5;
  }

  // Extract color from product name
  const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'beige', 'navy', 'cream'];
  for (const color of colors) {
    if (lower.includes(color)) {
      result.primaryColor = color;
      break;
    }
  }

  // Infer occasions based on formality and type
  if (result.formality >= 7) {
    result.occasions.push('work', 'dinner');
  } else if (result.formality >= 5) {
    result.occasions.push('work', 'cafe', 'chill');
  } else {
    result.occasions.push('chill', 'travel', 'sport');
  }

  // Add party for dresses
  if (result.role === 'dress') {
    result.occasions.push('party', 'date');
  }

  // Infer style tags
  if (lower.includes('casual')) {
    result.styles.push('casual');
  }
  if (lower.includes('formal') || lower.includes('tailored')) {
    result.styles.push('elegant', 'classic');
    result.formality = Math.max(result.formality, 8);
  }
  if (lower.includes('slim') || lower.includes('fitted')) {
    result.styles.push('modern');
  }
  if (lower.includes('oversized') || lower.includes('loose')) {
    result.styles.push('casual', 'trendy');
  }

  // Default styles if none detected
  if (result.styles.length === 0) {
    result.styles.push('classic');
  }

  return result;
}

/**
 * Transform array of raw products
 */
export function transformProductMasterArray(rawProducts: RawProductMaster[]): EnhancedProduct[] {
  return rawProducts
    .map(transformProductMasterToEnhanced)
    .filter(product => {
      // Filter out products with invalid data
      return product.id && product.name.en && product.pricing.currentPrice > 0;
    });
}

/**
 * Load and transform product_master.json
 */
export async function loadProductMaster(): Promise<EnhancedProduct[]> {
  try {
    const response = await fetch('/products/product_master.json');
    if (!response.ok) {
      throw new Error(`Failed to load product_master.json: ${response.statusText}`);
    }

    const rawProducts: RawProductMaster[] = await response.json();
    const enhancedProducts = transformProductMasterArray(rawProducts);

    console.log(`Transformed ${enhancedProducts.length} products from product_master.json`);
    return enhancedProducts;
  } catch (error) {
    console.error('Error loading product_master.json:', error);
    return [];
  }
}
