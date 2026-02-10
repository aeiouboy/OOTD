/**
 * DbProduct to EnhancedProduct Transformer
 *
 * Converts flat Supabase DbProduct rows into nested EnhancedProduct
 * objects used by the chat pipeline and recommendation engine.
 */

import type { DbProduct } from '../supabase/types'
import type { EnhancedProduct } from '../types/product-types'
import type {
  AvailabilityStatus,
  Gender,
  OccasionType,
  FormalityLevel,
  SeasonType,
  StyleTag,
} from '../types/enums'

/**
 * Map DbProduct occasion column names to OccasionType enum values.
 */
const OCCASION_MAP: Record<string, OccasionType> = {
  weekend_social: 'chill',
  date_night: 'date',
  everyday_casual: 'casual' as OccasionType,
}

/** Threshold above which an occasion score counts as relevant */
const OCCASION_SCORE_THRESHOLD = 0.3

/**
 * Infer gender from the category string.
 */
function inferGender(category: string): Gender {
  if (category.startsWith('women')) return 'women'
  if (category.startsWith('men')) return 'men'
  return 'unisex'
}

/**
 * Build the occasion tag list from DbProduct occasion scores.
 */
function buildOccasionTags(dbProduct: DbProduct): OccasionType[] {
  const occasions: OccasionType[] = []

  const scores: [string, number | null][] = [
    ['weekend_social', dbProduct.occasion_weekend_social],
    ['date_night', dbProduct.occasion_date_night],
    ['everyday_casual', dbProduct.occasion_everyday_casual],
  ]

  for (const [key, score] of scores) {
    if (score != null && score > OCCASION_SCORE_THRESHOLD) {
      const mapped = OCCASION_MAP[key]
      if (mapped) {
        occasions.push(mapped)
      }
    }
  }

  return occasions
}

/**
 * Cast a raw availability string to the AvailabilityStatus enum.
 * Falls back to 'in_stock' for unknown or null values.
 */
function toAvailabilityStatus(raw: string | null): AvailabilityStatus {
  const valid: AvailabilityStatus[] = ['in_stock', 'low_stock', 'out_of_stock', 'pre_order']
  if (raw && valid.includes(raw as AvailabilityStatus)) {
    return raw as AvailabilityStatus
  }
  return 'in_stock'
}

/**
 * Transform a single DbProduct row into an EnhancedProduct.
 */
export function transformDbProductToEnhanced(dbProduct: DbProduct): EnhancedProduct {
  const gender = inferGender(dbProduct.category)
  const occasionTags = buildOccasionTags(dbProduct)

  return {
    // Core information
    id: dbProduct.id,
    sku: dbProduct.sku || dbProduct.id,
    name: {
      th: dbProduct.product_name,
      en: dbProduct.product_name,
    },
    description: dbProduct.product_description
      ? {
          th: dbProduct.product_description,
          en: dbProduct.product_description,
        }
      : undefined,
    brand: dbProduct.brand || 'Unknown',

    // Pricing
    pricing: {
      currentPrice: dbProduct.price ?? 0,
      originalPrice: dbProduct.original_price ?? undefined,
      currency: 'THB',
    },

    // Classification
    classification: {
      category: {
        category: dbProduct.category,
      },
      gender,
      tags: {
        occasion: occasionTags.length > 0 ? occasionTags : undefined,
      },
    },

    // Style attributes (defaults -- no color/style data in DbProduct)
    style: {
      colors: {
        primary: 'unknown',
      },
      formalityLevel: 5 as FormalityLevel,
      styleAttributes: [] as StyleTag[],
      seasonality: ['all-season'] as SeasonType[],
    },

    // Sizing (no size data in DbProduct)
    sizing: {
      availableSizes: [],
    },

    // Availability
    availability: {
      status: toAvailabilityStatus(dbProduct.availability),
    },

    // Thai market
    thaiMarket: {
      culturalAppropriate: true,
      specialFlags: {
        templeAppropriate: dbProduct.temple_appropriate ?? undefined,
      },
    },

    // Central integration
    centralIntegration: {
      centralSKU: dbProduct.sku || dbProduct.id,
      productUrl: dbProduct.link || '',
      images: {
        primary: dbProduct.image_url || '',
      },
    },
  }
}

/**
 * Transform an array of DbProduct rows into EnhancedProduct objects.
 */
export function transformDbProductsToEnhanced(dbProducts: DbProduct[]): EnhancedProduct[] {
  return dbProducts.map(transformDbProductToEnhanced)
}
