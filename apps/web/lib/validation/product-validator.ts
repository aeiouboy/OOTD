/**
 * Product Validator
 * Comprehensive validation for EnhancedProduct data model
 */

import type { EnhancedProduct } from '../types/product-types'
import type { LocalizedText } from '../types/localization-types'
import { PRODUCT_VALIDATION_SCHEMA, VALID_ENUMS, URL_PATTERN, VALID_FORMALITY_LEVELS } from './schemas'

/**
 * Validation error details
 */
export interface ValidationError {
  field: string
  message: string
  value?: any
  code: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Custom Product Validation Error class
 */
export class ProductValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationError[]
  ) {
    super(message)
    this.name = 'ProductValidationError'
  }
}

/**
 * Validate entire product (FR-049)
 */
export function validateProduct(product: Partial<EnhancedProduct>): ValidationResult {
  const errors: ValidationError[] = []

  // Core validation
  errors.push(...validateCore(product))

  // Pricing validation
  if (product.pricing) {
    errors.push(...validatePricing(product.pricing))
  } else {
    errors.push({
      field: 'pricing',
      message: 'Pricing information is required',
      code: 'MISSING_REQUIRED_FIELD',
    })
  }

  // Classification validation
  if (product.classification) {
    errors.push(...validateClassification(product.classification))
  } else {
    errors.push({
      field: 'classification',
      message: 'Classification information is required',
      code: 'MISSING_REQUIRED_FIELD',
    })
  }

  // Style validation
  if (product.style) {
    errors.push(...validateStyle(product.style))
  } else {
    errors.push({
      field: 'style',
      message: 'Style information is required',
      code: 'MISSING_REQUIRED_FIELD',
    })
  }

  // Sizing validation
  if (product.sizing) {
    errors.push(...validateSizing(product.sizing))
  } else {
    errors.push({
      field: 'sizing',
      message: 'Sizing information is required',
      code: 'MISSING_REQUIRED_FIELD',
    })
  }

  // Availability validation
  if (product.availability) {
    errors.push(...validateAvailability(product.availability))
  } else {
    errors.push({
      field: 'availability',
      message: 'Availability information is required',
      code: 'MISSING_REQUIRED_FIELD',
    })
  }

  // Thai market validation
  if (product.thaiMarket) {
    errors.push(...validateThaiMarket(product.thaiMarket))
  } else {
    errors.push({
      field: 'thaiMarket',
      message: 'Thai market information is required',
      code: 'MISSING_REQUIRED_FIELD',
    })
  }

  // Central integration validation
  if (product.centralIntegration) {
    errors.push(...validateCentralIntegration(product.centralIntegration))
  } else {
    errors.push({
      field: 'centralIntegration',
      message: 'Central integration information is required',
      code: 'MISSING_REQUIRED_FIELD',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate core product information (FR-001, FR-002, FR-003)
 */
function validateCore(product: Partial<EnhancedProduct>): ValidationError[] {
  const errors: ValidationError[] = []

  // ID validation (FR-001)
  if (!product.id || typeof product.id !== 'string' || product.id.trim().length === 0) {
    errors.push({
      field: 'id',
      message: 'Product ID is required and must be a non-empty string',
      value: product.id,
      code: 'INVALID_ID',
    })
  }

  // SKU validation (FR-001)
  if (!product.sku || typeof product.sku !== 'string' || product.sku.trim().length === 0) {
    errors.push({
      field: 'sku',
      message: 'Product SKU is required and must be a non-empty string',
      value: product.sku,
      code: 'INVALID_SKU',
    })
  }

  // Name validation (FR-002, FR-003)
  if (!product.name) {
    errors.push({
      field: 'name',
      message: 'Product name is required',
      code: 'MISSING_NAME',
    })
  } else if (!product.name.th && !product.name.en) {
    errors.push({
      field: 'name',
      message: 'Product name must have at least Thai or English version',
      value: product.name,
      code: 'EMPTY_NAME',
    })
  }

  // Brand validation (FR-033)
  if (!product.brand || typeof product.brand !== 'string' || product.brand.trim().length === 0) {
    errors.push({
      field: 'brand',
      message: 'Brand is required and must be a non-empty string',
      value: product.brand,
      code: 'INVALID_BRAND',
    })
  }

  return errors
}

/**
 * Validate pricing (FR-006, FR-007, FR-008, FR-050)
 */
function validatePricing(pricing: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Current price (FR-006, FR-050)
  if (typeof pricing.currentPrice !== 'number' || pricing.currentPrice < 0) {
    errors.push({
      field: 'pricing.currentPrice',
      message: 'Current price must be a positive number',
      value: pricing.currentPrice,
      code: 'INVALID_PRICE',
    })
  }

  // Original price (FR-007)
  if (pricing.originalPrice !== undefined) {
    if (typeof pricing.originalPrice !== 'number' || pricing.originalPrice < 0) {
      errors.push({
        field: 'pricing.originalPrice',
        message: 'Original price must be a positive number',
        value: pricing.originalPrice,
        code: 'INVALID_ORIGINAL_PRICE',
      })
    } else if (pricing.originalPrice < pricing.currentPrice) {
      errors.push({
        field: 'pricing.originalPrice',
        message: 'Original price cannot be less than current price',
        value: pricing.originalPrice,
        code: 'INVALID_PRICE_COMPARISON',
      })
    }
  }

  // Currency (FR-008)
  if (!pricing.currency || !VALID_ENUMS.currency.includes(pricing.currency)) {
    errors.push({
      field: 'pricing.currency',
      message: `Currency must be one of: ${VALID_ENUMS.currency.join(', ')}`,
      value: pricing.currency,
      code: 'INVALID_CURRENCY',
    })
  }

  return errors
}

/**
 * Validate classification (FR-009, FR-011, FR-054)
 */
function validateClassification(classification: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Gender (FR-011, FR-054)
  if (!classification.gender || !VALID_ENUMS.gender.includes(classification.gender)) {
    errors.push({
      field: 'classification.gender',
      message: `Gender must be one of: ${VALID_ENUMS.gender.join(', ')}`,
      value: classification.gender,
      code: 'INVALID_GENDER',
    })
  }

  // Tags
  if (classification.tags) {
    // Occasion tags
    if (classification.tags.occasion) {
      if (!Array.isArray(classification.tags.occasion)) {
        errors.push({
          field: 'classification.tags.occasion',
          message: 'Occasion tags must be an array',
          value: classification.tags.occasion,
          code: 'INVALID_ARRAY',
        })
      } else {
        const invalidOccasions = classification.tags.occasion.filter(
          (o: any) => !VALID_ENUMS.occasion.includes(o)
        )
        if (invalidOccasions.length > 0) {
          errors.push({
            field: 'classification.tags.occasion',
            message: `Invalid occasion tags: ${invalidOccasions.join(', ')}`,
            value: invalidOccasions,
            code: 'INVALID_OCCASION',
          })
        }
      }
    }

    // Season tags
    if (classification.tags.season) {
      if (!Array.isArray(classification.tags.season)) {
        errors.push({
          field: 'classification.tags.season',
          message: 'Season tags must be an array',
          value: classification.tags.season,
          code: 'INVALID_ARRAY',
        })
      } else {
        const invalidSeasons = classification.tags.season.filter((s: any) => !VALID_ENUMS.season.includes(s))
        if (invalidSeasons.length > 0) {
          errors.push({
            field: 'classification.tags.season',
            message: `Invalid season tags: ${invalidSeasons.join(', ')}`,
            value: invalidSeasons,
            code: 'INVALID_SEASON',
          })
        }
      }
    }
  }

  return errors
}

/**
 * Validate style attributes (FR-015, FR-018)
 */
function validateStyle(style: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Primary color (FR-015)
  if (!style.colors?.primary || typeof style.colors.primary !== 'string') {
    errors.push({
      field: 'style.colors.primary',
      message: 'Primary color is required',
      value: style.colors?.primary,
      code: 'MISSING_PRIMARY_COLOR',
    })
  }

  // Formality level (FR-018)
  if (!style.formalityLevel || !VALID_FORMALITY_LEVELS.includes(style.formalityLevel)) {
    errors.push({
      field: 'style.formalityLevel',
      message: 'Formality level must be between 1 and 10',
      value: style.formalityLevel,
      code: 'INVALID_FORMALITY',
    })
  }

  // Style attributes (FR-019)
  if (!Array.isArray(style.styleAttributes) || style.styleAttributes.length === 0) {
    errors.push({
      field: 'style.styleAttributes',
      message: 'Style attributes are required and must be a non-empty array',
      value: style.styleAttributes,
      code: 'MISSING_STYLE_ATTRIBUTES',
    })
  }

  // Seasonality (FR-021)
  if (!Array.isArray(style.seasonality) || style.seasonality.length === 0) {
    errors.push({
      field: 'style.seasonality',
      message: 'Seasonality is required and must be a non-empty array',
      value: style.seasonality,
      code: 'MISSING_SEASONALITY',
    })
  }

  return errors
}

/**
 * Validate sizing (FR-025)
 */
function validateSizing(sizing: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Available sizes (FR-025)
  if (!Array.isArray(sizing.availableSizes) || sizing.availableSizes.length === 0) {
    errors.push({
      field: 'sizing.availableSizes',
      message: 'Available sizes are required and must be a non-empty array',
      value: sizing.availableSizes,
      code: 'MISSING_SIZES',
    })
  }

  return errors
}

/**
 * Validate availability (FR-029, FR-054)
 */
function validateAvailability(availability: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Status (FR-029, FR-054)
  if (!availability.status || !VALID_ENUMS.availability.includes(availability.status)) {
    errors.push({
      field: 'availability.status',
      message: `Availability status must be one of: ${VALID_ENUMS.availability.join(', ')}`,
      value: availability.status,
      code: 'INVALID_AVAILABILITY',
    })
  }

  return errors
}

/**
 * Validate Thai market info (FR-036)
 */
function validateThaiMarket(thaiMarket: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Cultural appropriate (FR-036)
  if (typeof thaiMarket.culturalAppropriate !== 'boolean') {
    errors.push({
      field: 'thaiMarket.culturalAppropriate',
      message: 'Cultural appropriateness must be a boolean value',
      value: thaiMarket.culturalAppropriate,
      code: 'INVALID_CULTURAL_FLAG',
    })
  }

  return errors
}

/**
 * Validate Central integration (FR-040, FR-041, FR-042, FR-051)
 */
function validateCentralIntegration(integration: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Central SKU (FR-040)
  if (!integration.centralSKU || typeof integration.centralSKU !== 'string') {
    errors.push({
      field: 'centralIntegration.centralSKU',
      message: 'Central SKU is required',
      value: integration.centralSKU,
      code: 'MISSING_CENTRAL_SKU',
    })
  }

  // Product URL (FR-041, FR-051)
  if (!integration.productUrl || !validateUrl(integration.productUrl)) {
    errors.push({
      field: 'centralIntegration.productUrl',
      message: 'Product URL must be a valid HTTP/HTTPS URL',
      value: integration.productUrl,
      code: 'INVALID_URL',
    })
  }

  // Primary image (FR-042, FR-051)
  if (!integration.images?.primary || !validateUrl(integration.images.primary)) {
    errors.push({
      field: 'centralIntegration.images.primary',
      message: 'Primary image URL must be a valid HTTP/HTTPS URL',
      value: integration.images?.primary,
      code: 'INVALID_IMAGE_URL',
    })
  }

  // Additional images
  if (integration.images?.additional) {
    if (!Array.isArray(integration.images.additional)) {
      errors.push({
        field: 'centralIntegration.images.additional',
        message: 'Additional images must be an array',
        value: integration.images.additional,
        code: 'INVALID_ARRAY',
      })
    } else {
      integration.images.additional.forEach((url: any, index: number) => {
        if (!validateUrl(url)) {
          errors.push({
            field: `centralIntegration.images.additional[${index}]`,
            message: 'Image URL must be a valid HTTP/HTTPS URL',
            value: url,
            code: 'INVALID_IMAGE_URL',
          })
        }
      })
    }
  }

  return errors
}

/**
 * Type guard: Check if value is valid EnhancedProduct
 */
export function isEnhancedProduct(value: any): value is EnhancedProduct {
  const result = validateProduct(value)
  return result.valid
}

/**
 * Type guard: Check if product passes basic validation
 */
export function isValidProduct(value: any): boolean {
  return !!(
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.sku === 'string' &&
    value.name &&
    typeof value.brand === 'string'
  )
}

/**
 * Validate URL (FR-051)
 */
export function validateUrl(url: string): boolean {
  if (typeof url !== 'string') return false
  return URL_PATTERN.test(url)
}

/**
 * Validate price (FR-050)
 */
export function validatePrice(price: any): boolean {
  return typeof price === 'number' && price >= 0 && isFinite(price)
}

/**
 * Validate image URL (FR-051)
 */
export function validateImageUrl(url: string): boolean {
  return validateUrl(url)
}

/**
 * Validate category path (FR-053)
 */
export function validateCategory(category: any): boolean {
  return category && typeof category === 'object'
}

/**
 * Validate enum value (FR-054)
 */
export function validateEnum<T extends string>(value: any, validValues: readonly T[]): value is T {
  return typeof value === 'string' && (validValues as readonly string[]).includes(value)
}

/**
 * Get validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.valid) {
    return 'Product validation passed'
  }

  const errorsByField: Record<string, string[]> = {}

  result.errors.forEach((error) => {
    if (!errorsByField[error.field]) {
      errorsByField[error.field] = []
    }
    errorsByField[error.field].push(error.message)
  })

  const summary = Object.entries(errorsByField)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n')

  return `Product validation failed:\n${summary}`
}
