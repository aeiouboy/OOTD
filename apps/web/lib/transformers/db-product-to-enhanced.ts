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
import { mapProductToOccasions, calculateFormalityLevel } from '../categorization/occasion-mapper'
import { extractColorFromProductName } from '../prompts/image-prompts'

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
 * Infer a specific garment category from the product name when the DB
 * category is a generic bucket like "women_clothing".
 */
function inferSpecificCategory(name: string, genericCategory: string): string {
  if (genericCategory !== 'women_clothing' && genericCategory !== 'men_clothing') {
    return genericCategory
  }

  const lower = name.toLowerCase()

  if (/\bblazer\b/.test(lower)) return 'blazer'
  if (/\bjumpsuit\b/.test(lower)) return 'jumpsuit'
  if (/\bcardigan\b/.test(lower)) return 'cardigan'
  if (/\bsweater\b|\bknit\b/.test(lower)) return 'sweater'
  if (/\bt-shirt\b|\btee\b/.test(lower)) return 't-shirt'
  if (/\bblouse\b/.test(lower)) return 'blouse'
  if (/\bpolo\b/.test(lower)) return 'polo'
  if (/\bshirt\b/.test(lower)) return 'shirt'
  if (/\bdress\b/.test(lower)) return 'dress'
  if (/\bpants\b|\btrouser\b/.test(lower)) return 'pants'
  if (/\bskirt\b/.test(lower)) return 'skirt'
  if (/\bjacket\b|\bcoat\b/.test(lower)) return 'jacket'
  if (/\bcrop\b/.test(lower)) return 'crop-top'
  if (/\bcami\b/.test(lower)) return 'cami-top'

  return genericCategory
}

/**
 * Transform a single DbProduct row into an EnhancedProduct.
 */
export function transformDbProductToEnhanced(dbProduct: DbProduct): EnhancedProduct {
  // Prefer DB columns, fallback to computed values
  const gender = (dbProduct.gender as Gender) || inferGender(dbProduct.category)
  const extractedColor = extractColorFromProductName(dbProduct.product_name) || 'unknown'
  const specificCategory = dbProduct.specific_category || inferSpecificCategory(dbProduct.product_name, dbProduct.category)

  // Prefer DB formality_level, fallback to calculated value
  const formalityLevel = (dbProduct.formality_level as FormalityLevel) || calculateFormalityLevel({
    name: dbProduct.product_name,
    description: dbProduct.product_description || undefined,
    formalityLevel: 5 as FormalityLevel, // seed value for the calculator
    category: dbProduct.category,
  })

  // Get DB-based occasion tags
  const dbOccasionTags = buildOccasionTags(dbProduct)

  // Get inference-based occasion tags from product name/description
  const inferredOccasionTags = mapProductToOccasions({
    name: dbProduct.product_name,
    description: dbProduct.product_description || undefined,
    formalityLevel,
    category: dbProduct.category,
  })

  // Merge DB-based and inference-based tags (deduplicated)
  const mergedOccasions = new Set<OccasionType>([...dbOccasionTags, ...inferredOccasionTags])

  // Add primary_occasion from DB if it maps to a valid OccasionType
  if (dbProduct.primary_occasion) {
    const validOccasions: OccasionType[] = ['work', 'chill', 'wedding', 'sport', 'travel', 'date', 'dinner', 'cafe', 'party']
    // Map DB occasion names to OccasionType
    const dbPrimaryMap: Record<string, OccasionType> = {
      weekend_social: 'chill',
      date_night: 'date',
      everyday_casual: 'chill',
      work: 'work',
      wedding: 'wedding',
      sport: 'sport',
      travel: 'travel',
      date: 'date',
      dinner: 'dinner',
      cafe: 'cafe',
      party: 'party',
      chill: 'chill',
    }
    const mapped = dbPrimaryMap[dbProduct.primary_occasion] || (validOccasions.includes(dbProduct.primary_occasion as OccasionType) ? dbProduct.primary_occasion as OccasionType : undefined)
    if (mapped) {
      mergedOccasions.add(mapped)
    }
  }

  const occasionTags = Array.from(mergedOccasions)

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
        category: specificCategory,
      },
      gender,
      tags: {
        occasion: occasionTags.length > 0 ? occasionTags : undefined,
      },
    },

    // Style attributes — use calculated formality instead of hardcoded 5
    style: {
      colors: {
        primary: extractedColor,
      },
      formalityLevel,
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
