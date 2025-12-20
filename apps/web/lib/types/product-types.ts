/**
 * Comprehensive Product Type Definitions
 * Enhanced product data model for AI Fashion Assistant
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
  SizeStandard,
  ColorName,
  MaterialType,
  TagStructure,
} from './enums'
import type { LocalizedText } from './localization-types'

/**
 * Core Product Information
 */
export interface CoreProductInfo {
  // Unique identifier (FR-001)
  id: string
  sku: string

  // Product names - bilingual support (FR-002, FR-003)
  name: LocalizedText

  // Product description (FR-038)
  description?: LocalizedText

  // Brand information (FR-033, FR-034)
  brand: string
  brandTier?: BrandTier
}

/**
 * Pricing Information
 */
export interface PricingInfo {
  // Current price (FR-006)
  currentPrice: number

  // Original price for discounts (FR-007)
  originalPrice?: number

  // Currency (FR-008, FR-039)
  currency: Currency

  // Promotional information (FR-032)
  promotional?: string

  // Calculated discount percentage
  discountPercentage?: number
}

/**
 * Classification Information
 */
export interface ClassificationInfo {
  // Hierarchical category (FR-009, FR-010)
  category: {
    department?: string // Level 1
    category?: string // Level 2
    subcategory?: string // Level 3
    type?: string // Level 4
  }

  // Gender/demographic (FR-011)
  gender: Gender

  // Flexible tags (FR-012, FR-013)
  tags: {
    occasion?: OccasionType[]
    style?: StyleTag[]
    season?: SeasonType[]
    custom?: TagStructure[]
  }

  // Outfit role (FR-014, FR-047)
  role?: OutfitRole

  // Complete outfit flag (FR-045)
  isCompleteOutfit?: boolean
}

/**
 * Style & Aesthetic Attributes
 */
export interface StyleAttributes {
  // Color information (FR-015, FR-016)
  colors: {
    primary: ColorName | string
    secondary?: (ColorName | string)[]
  }

  // Pattern (FR-017)
  pattern?: PatternType

  // Formality level 1-10 (FR-018)
  formalityLevel: FormalityLevel

  // Style tags (FR-019)
  styleAttributes: StyleTag[]

  // Material/fabric (FR-020)
  material?: MaterialType | string

  // Season/weather (FR-021)
  seasonality: SeasonType[]
}

/**
 * Size & Fit Information
 */
export interface SizeInfo {
  // Available sizes (FR-025)
  availableSizes: string[]

  // Size standard (FR-026)
  sizeStandard?: SizeStandard

  // Fit description (FR-027)
  fit?: FitType

  // Detailed measurements (FR-028)
  measurements?: {
    [size: string]: {
      chest?: number
      waist?: number
      hips?: number
      length?: number
      shoulders?: number
      unit: 'cm' | 'in'
    }
  }
}

/**
 * Availability Information
 */
export interface AvailabilityInfo {
  // Availability status (FR-029)
  status: AvailabilityStatus

  // Stock quantity (FR-030)
  stockQuantity?: number

  // Store locations (FR-043)
  storeLocations?: string[]

  // Last updated timestamp
  lastUpdated?: Date
}

/**
 * Thai Market Specific Information
 */
export interface ThaiMarketInfo {
  // Cultural appropriateness (FR-036)
  culturalAppropriate: boolean

  // Special flags (FR-037)
  specialFlags?: {
    templeAppropriate?: boolean
    conservativeWorkplaceSuitable?: boolean
    thaiWeddingSuitable?: boolean
  }

  // Thai sizing information
  thaiSizeEquivalent?: string

  // Thai fashion sensibilities metadata
  thaiStyleNotes?: string
}

/**
 * Central Group Integration
 */
export interface CentralIntegration {
  // Central's SKU (FR-040, FR-044)
  centralSKU: string

  // Product URL (FR-031, FR-041)
  productUrl: string

  // Image URLs (FR-004, FR-005, FR-042)
  images: {
    primary: string
    additional?: string[]
  }

  // Central-specific metadata
  centralMetadata?: {
    categoryPath?: string
    productCode?: string
  }
}

/**
 * Outfit Composition Support
 */
export interface OutfitComposition {
  // Recommended pairings (FR-046)
  recommendedPairings?: string[] // Array of product IDs

  // Goes well with suggestions
  goesWellWith?: {
    tops?: string[]
    bottoms?: string[]
    footwear?: string[]
    accessories?: string[]
  }

  // Styling tips (FR-057)
  stylingTips?: LocalizedText
}

/**
 * Extensibility & Future Features
 */
export interface ExtensibilityFields {
  // User interaction tracking (FR-055)
  userInteractions?: {
    views?: number
    clicks?: number
    favorites?: number
    addedToOutfit?: number
  }

  // Reviews and ratings (FR-056)
  reviews?: {
    averageRating?: number
    totalReviews?: number
  }

  // Sustainability attributes (FR-058)
  sustainability?: {
    ecoFriendly?: boolean
    sustainableMaterial?: boolean
    ethicalProduction?: boolean
    certifications?: string[]
  }

  // Virtual try-on metadata (FR-059)
  virtualTryOn?: {
    available?: boolean
    modelUrl?: string
    arCompatible?: boolean
  }

  // Care instructions (FR-035)
  careInstructions?: LocalizedText
}

/**
 * Enhanced Product - Complete Interface
 * Combines all attribute groups into comprehensive product model
 */
export interface EnhancedProduct {
  // Core information
  id: string
  sku: string
  name: LocalizedText
  description?: LocalizedText
  brand: string
  brandTier?: BrandTier

  // Pricing
  pricing: PricingInfo

  // Classification
  classification: ClassificationInfo

  // Style attributes
  style: StyleAttributes

  // Size and fit
  sizing: SizeInfo

  // Availability
  availability: AvailabilityInfo

  // Thai market specific
  thaiMarket: ThaiMarketInfo

  // Central integration
  centralIntegration: CentralIntegration

  // Outfit composition
  outfit?: OutfitComposition

  // Extensibility
  extended?: ExtensibilityFields

  // Metadata
  metadata?: {
    createdAt?: Date
    updatedAt?: Date
    version?: string
  }
}

/**
 * Simplified Product Summary for AI Context
 * Token-efficient format for AI prompts
 */
export interface ProductSummary {
  id: string
  name: string
  brand: string
  price: number
  url: string // Product URL for recommendations
  category: string
  gender: Gender
  occasions: OccasionType[]
  formality: FormalityLevel
  colors: string[]
  style: StyleTag[]
  season: SeasonType[]
  role?: OutfitRole
}

/**
 * Product Filter Criteria
 */
export interface ProductFilterCriteria {
  gender?: Gender | Gender[]
  occasions?: OccasionType | OccasionType[]
  priceRange?: { min: number; max: number }
  formality?: { min: FormalityLevel; max: FormalityLevel }
  colors?: ColorName[]
  styles?: StyleTag[]
  seasons?: SeasonType[]
  brands?: string[]
  availability?: AvailabilityStatus[]
  roles?: OutfitRole[]
}

/**
 * Product Sort Options
 */
export type ProductSortField =
  | 'price-asc'
  | 'price-desc'
  | 'formality-asc'
  | 'formality-desc'
  | 'popularity'
  | 'newest'
  | 'relevance'

/**
 * Product Query Result
 */
export interface ProductQueryResult {
  products: EnhancedProduct[]
  total: number
  page?: number
  pageSize?: number
  filters?: ProductFilterCriteria
  sort?: ProductSortField
}
