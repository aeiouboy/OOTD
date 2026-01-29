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
  | 'clean-girl'
  | 'scandinavian-minimal'
  | 'street-style'
  | 'corporate-chic'
  | 'quiet-luxury'
  | 'y2k-revival'

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

// Women's Footwear Categories (Pinterest 2026 Corporate Chic)
// Used for gender-appropriate footwear validation in work outfits
export type WomensFootwearCategory =
  | 'heels'           // Pumps, stilettos, block heels
  | 'loafers'         // Pointed-toe loafers, women's loafers
  | 'mules'           // Heeled or flat mules (backless)
  | 'flats'           // Ballet flats, pointed-toe flats
  | 'slingbacks'      // Slingback heels
  | 'sneakers'        // Women's sneakers
  | 'sandals'         // Women's sandals
  | 'boots'           // Ankle boots, knee boots

// Masculine Footwear Styles (to be excluded from women's outfits)
export type MasculineFootwearStyle =
  | 'oxford'          // Oxford dress shoes (lace-up, masculine)
  | 'derby'           // Derby shoes (men's dress style)
  | 'brogue'          // Brogues (wingtip, perforated)
  | 'wingtip'         // Wingtip dress shoes
  | 'mens-dress'      // Generic men's dress shoes

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

// Pinterest 2026 Aesthetic Categories
export type AestheticCategory =
  | 'clean-girl'
  | 'scandinavian-minimal'
  | 'street-style'
  | 'casual-chic'
  | 'y2k-revival'
  | 'corporate-chic'
  | 'quiet-luxury'
  | 'minimalist-office'
  | 'dark-academia'

// Trending Color Palettes
export type ColorPalette =
  | 'neutral-earth-tones'
  | 'monochromatic-beige'
  | 'monochromatic-brown'
  | 'monochromatic-blue'
  | 'monochromatic-black'
  | 'work-olive-black'
  | 'work-brown-cream'
  | 'all-black-texture'

// Layering Styles
export type LayeringStyle = 'oversized' | 'fitted' | 'structured' | 'relaxed'

// Silhouette Types
export type SilhouetteType = 'wide-leg' | 'baggy' | 'fitted' | 'high-waisted' | 'oversized'