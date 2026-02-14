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

// ============================================================================
// KB EXPANSION FEB 2026 - AI Matching & Thai Context Types
// ============================================================================

/**
 * Silhouette Shape for Visual Matching Intelligence (KB Section 15)
 * Defines the overall shape/outline of a garment
 */
export type SilhouetteShape =
  | 'a-line'      // Fitted top, flared bottom
  | 'h-line'      // Straight, columnar shape
  | 'x-line'      // Fitted waist, balanced top/bottom
  | 'i-line'      // Narrow, straight silhouette
  | 'o-line'      // Rounded, cocoon shape
  | 'fitted'      // Body-hugging
  | 'oversized'   // Loose, bigger than body
  | 'boxy'        // Square, structured
  | 'relaxed'     // Loose but not oversized
  | 'structured'  // Tailored, defined shape

/**
 * Visual Weight Level (KB Section 15)
 * Perceived heaviness/presence of a garment
 */
export type VisualWeightLevel = 'light' | 'medium' | 'heavy'

/**
 * Proportion Ratio (KB Section 15)
 * Where visual weight is concentrated
 */
export type ProportionRatio = 'top-heavy' | 'balanced' | 'bottom-heavy'

/**
 * Texture Type (KB Section 15)
 * Surface finish/appearance of fabric
 */
export type TextureType = 'matte' | 'sheen' | 'glossy' | 'textured' | 'mixed'

/**
 * Outfit Role Type (KB Section 15, 16)
 * Role in outfit visual composition
 */
export type OutfitRoleType = 'anchor' | 'supporting' | 'accent' | 'statement'

/**
 * Product Relationship (KB Section 17)
 * Compatibility level between products for pairing
 */
export type ProductRelationship =
  | 'perfect-match'  // 95-100 score - designed together
  | 'great-pair'     // 75-94 score - aesthetic + formality aligned
  | 'works-well'     // 50-74 score - compatible basics
  | 'acceptable'     // 35-49 score - functional match
  | 'avoid'          // 0-34 score - clash warning

/**
 * Trend Lifecycle (KB Section 13, Special Topics)
 * Current stage in trend adoption cycle
 */
export type TrendLifecycle =
  | 'emerging'   // Just appearing
  | 'trending'   // Growing popularity
  | 'peak'       // Maximum adoption
  | 'classic'    // Enduring style
  | 'timeless'   // Never goes out of style
  | 'declining'  // Fading popularity
  | 'revival'    // Coming back

/**
 * Popularity Tier (Special Topics - Social Proof Signals)
 * Current popularity ranking
 */
export type PopularityTier =
  | 'viral'    // 90-100 score
  | 'hot'      // 75-89 score
  | 'popular'  // 60-74 score
  | 'steady'   // 40-59 score
  | 'niche'    // 20-39 score
  | 'new'      // Recently added, unranked

/**
 * Thai Month (KB Section 12 - Thai Micro-Seasons)
 * Month number for seasonal styling
 */
export type ThaiMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/**
 * Thai Day of Week (KB Sections 01, 02)
 * For auspicious color mapping
 */
export type ThaiDayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

/**
 * Cost Per Wear Tier (KB Section 13 - Price Intelligence)
 * Value assessment based on cost per wear calculation
 */
export type CostPerWearTier =
  | 'excellent'  // < ฿50/wear
  | 'good'       // ฿50-100/wear
  | 'moderate'   // ฿100-200/wear
  | 'poor'       // > ฿200/wear

/**
 * Coverage Type for Temple/Cultural Appropriateness (KB Section 02, 07)
 */
export type CoverageType = 'covered' | 'partially-covered' | 'exposed'

/**
 * Wedding Appropriateness (KB Section 07)
 */
export type WeddingAppropriateType = 'any' | 'morning' | 'evening' | 'outdoor' | 'indoor' | 'none'

/**
 * Songkran Suitability (KB Section 07, 12)
 */
export type SongkranSuitability = 'temple-morning' | 'water-play' | 'both' | 'neither'

/**
 * Chinese New Year Suitability (KB Section 12)
 * Red/gold = suitable, black/white/blue = unsuitable
 */
export type CnySuitability = 'suitable' | 'unsuitable' | 'neutral'

/**
 * Sale Likelihood (KB Section 13)
 */
export type SaleLikelihood = 'rare' | 'seasonal' | 'frequent'

/**
 * Outfit Completeness (KB Section 17)
 * What additional pieces are needed
 */
export type OutfitCompleteness =
  | 'standalone'
  | 'needs-top'
  | 'needs-bottom'
  | 'needs-both'
  | 'needs-layer'
  | 'needs-accessories'

/**
 * Layer Compatibility (KB Section 16, 17)
 */
export type LayerCompatibility = 'fitted' | 'structured' | 'loose'

/**
 * Silhouette Fit (KB Section 15 - Fit Classifications)
 * Garment fit classification for visual matching
 */
export type SilhouetteFit = 'fitted' | 'semi-fitted' | 'relaxed' | 'oversized' | 'boxy' | 'structured' | 'fluid'

/**
 * Silhouette Volume (KB Section 15 - Volume Level)
 * Derived from fit type for outfit balancing
 */
export type SilhouetteVolume = 'low' | 'medium' | 'high'