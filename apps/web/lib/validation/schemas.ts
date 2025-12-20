/**
 * Validation Schemas
 * Defines validation rules for all product fields
 */

import type {
  AvailabilityStatus,
  Gender,
  OccasionType,
  SeasonType,
  FormalityLevel,
  FitType,
  StyleTag,
  PatternType,
  BrandTier,
  OutfitRole,
  Currency,
} from '../types/enums'

/**
 * Field validation requirements
 */
export interface FieldValidationRule {
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  enumValues?: readonly string[]
  customValidator?: (value: any) => boolean
}

/**
 * Validation schema for EnhancedProduct
 */
export const PRODUCT_VALIDATION_SCHEMA: Record<string, FieldValidationRule> = {
  // Core fields (FR-001, FR-002, FR-003)
  id: {
    required: true,
    type: 'string',
    minLength: 1,
  },
  sku: {
    required: true,
    type: 'string',
    minLength: 1,
  },
  'name.th': {
    required: false, // At least one language required, checked in validator
    type: 'string',
    minLength: 1,
  },
  'name.en': {
    required: false,
    type: 'string',
    minLength: 1,
  },
  brand: {
    required: true,
    type: 'string',
    minLength: 1,
  },

  // Pricing (FR-006, FR-007, FR-008)
  'pricing.currentPrice': {
    required: true,
    type: 'number',
    min: 0,
  },
  'pricing.originalPrice': {
    required: false,
    type: 'number',
    min: 0,
  },
  'pricing.currency': {
    required: true,
    type: 'enum',
    enumValues: ['THB', 'USD', 'EUR'] as const,
  },

  // Classification (FR-009, FR-011)
  'classification.gender': {
    required: true,
    type: 'enum',
    enumValues: ['men', 'women', 'unisex', 'kids'] as const,
  },

  // Style (FR-015, FR-018, FR-019, FR-021)
  'style.colors.primary': {
    required: true,
    type: 'string',
    minLength: 1,
  },
  'style.formalityLevel': {
    required: true,
    type: 'number',
    min: 1,
    max: 10,
  },
  'style.styleAttributes': {
    required: true,
    type: 'array',
  },
  'style.seasonality': {
    required: true,
    type: 'array',
  },

  // Sizing (FR-025)
  'sizing.availableSizes': {
    required: true,
    type: 'array',
  },

  // Availability (FR-029)
  'availability.status': {
    required: true,
    type: 'enum',
    enumValues: ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'] as const,
  },

  // Thai Market (FR-036)
  'thaiMarket.culturalAppropriate': {
    required: true,
    type: 'boolean',
  },

  // Central Integration (FR-040, FR-041, FR-042)
  'centralIntegration.centralSKU': {
    required: true,
    type: 'string',
    minLength: 1,
  },
  'centralIntegration.productUrl': {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
  },
  'centralIntegration.images.primary': {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
  },
}

/**
 * Valid enum values
 */
export const VALID_ENUMS = {
  availability: ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'] as AvailabilityStatus[],
  gender: ['men', 'women', 'unisex', 'kids'] as Gender[],
  occasion: ['work', 'chill', 'wedding', 'sport', 'travel', 'date', 'dinner', 'cafe', 'party'] as OccasionType[],
  season: ['all-season', 'hot-season', 'cool-season', 'rainy-season'] as SeasonType[],
  fit: ['slim', 'regular', 'loose', 'oversized', 'tailored'] as FitType[],
  pattern: [
    'solid',
    'striped',
    'floral',
    'print',
    'plaid',
    'checkered',
    'polka-dot',
    'geometric',
    'abstract',
    'animal-print',
  ] as PatternType[],
  brandTier: ['budget', 'mid-range', 'premium', 'luxury'] as BrandTier[],
  role: ['top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory', 'bag', 'complete-outfit'] as OutfitRole[],
  currency: ['THB', 'USD', 'EUR'] as Currency[],
}

/**
 * Get formality levels (1-10)
 */
export const VALID_FORMALITY_LEVELS: FormalityLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/**
 * URL validation regex
 */
export const URL_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

/**
 * Thai Baht price pattern
 */
export const THAI_PRICE_PATTERN = /^฿?[\d,]+(\.\d{2})?$/
