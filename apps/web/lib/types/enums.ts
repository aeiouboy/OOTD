/**
 * Enum Types for Product Data Model
 * Defines all fixed value types used throughout the product model
 */

// Product Availability Status
export type AvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order'

// Gender/Target Demographic
export type Gender = 'men' | 'women' | 'unisex' | 'kids'

// Occasion Types (aligned with occasion_expertise.py)
export type OccasionType =
  | 'work'
  | 'chill'
  | 'wedding'
  | 'sport'
  | 'travel'
  | 'date'
  | 'dinner'
  | 'cafe'
  | 'party'

// Season/Weather Types
export type SeasonType =
  | 'all-season'
  | 'hot-season'
  | 'cool-season'
  | 'rainy-season'

// Formality Level (1-10 scale represented as union type)
export type FormalityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

// Fit Types
export type FitType = 'slim' | 'regular' | 'loose' | 'oversized' | 'tailored'

// Style Tags
export type StyleTag =
  | 'modern'
  | 'classic'
  | 'trendy'
  | 'minimalist'
  | 'bohemian'
  | 'vintage'
  | 'casual'
  | 'formal'
  | 'sporty'
  | 'elegant'
  | 'edgy'
  | 'preppy'

// Pattern Types
export type PatternType =
  | 'solid'
  | 'striped'
  | 'floral'
  | 'print'
  | 'plaid'
  | 'checkered'
  | 'polka-dot'
  | 'geometric'
  | 'abstract'
  | 'animal-print'

// Brand Positioning Tier
export type BrandTier = 'budget' | 'mid-range' | 'premium' | 'luxury'

// Outfit Role
export type OutfitRole =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'footwear'
  | 'accessory'
  | 'bag'
  | 'complete-outfit'

// Currency
export type Currency = 'THB' | 'USD' | 'EUR'

// Size Standards
export type SizeStandard = 'international' | 'thai' | 'us' | 'eu' | 'uk'

// Tag Categories
export type TagCategory = 'occasion' | 'style' | 'season' | 'formality' | 'color' | 'material'

// Color Names (common colors in fashion)
export type ColorName =
  | 'white'
  | 'black'
  | 'gray'
  | 'grey'
  | 'beige'
  | 'brown'
  | 'red'
  | 'pink'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'navy'
  | 'purple'
  | 'gold'
  | 'silver'
  | 'multi'
  | 'neutral'

// Material Types
export type MaterialType =
  | 'cotton'
  | 'polyester'
  | 'linen'
  | 'silk'
  | 'wool'
  | 'denim'
  | 'leather'
  | 'synthetic'
  | 'blend'

// Helper type for tag structures
export interface TagStructure {
  category: TagCategory
  value: string
}