/**
 * Pinterest 2026 Fashion Trends
 *
 * Defines trending aesthetics, color palettes, layering patterns,
 * and styling rules based on Pinterest 2026 fashion trend analysis
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Aesthetic categories from Pinterest 2026 trends
 */
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

/**
 * Trending color palette categories
 */
export type ColorPalette =
  | 'neutral-earth-tones'
  | 'monochromatic-beige'
  | 'monochromatic-brown'
  | 'monochromatic-blue'
  | 'monochromatic-black'
  | 'work-olive-black'
  | 'work-brown-cream'
  | 'all-black-texture'

/**
 * Layering pattern types
 */
export type LayeringPattern =
  | 'oversized-sweater-over-tee'
  | 'cardigan-over-fitted-top'
  | 'knit-vest-over-button-up'
  | 'sweater-over-collared-shirt'
  | 'blazer-over-knit'
  | 'cardigan-over-dress'

/**
 * Bottom styling trends
 */
export type BottomStyle =
  | 'baggy-jeans'
  | 'wide-leg-jeans'
  | 'high-waisted-fit'
  | 'cuffed-denim'
  | 'wide-leg-trousers'
  | 'high-waisted-trousers'

/**
 * Footwear trends
 */
export type FootwearTrend =
  | 'platform-sneakers'
  | 'adidas-gazelle-style'
  | 'timberland-boots'
  | 'ugg-style-boots'
  | 'chunky-sneakers'

/**
 * Accessory trends
 */
export type AccessoryTrend =
  | 'black-structured-bag'
  | 'gold-layered-jewelry'
  | 'wide-belt'
  | 'structured-leather-tote'

// ============================================================================
// Color Palette Definitions
// ============================================================================

/**
 * Trending color palettes from Pinterest 2026
 */
export const COLOR_PALETTES: Record<ColorPalette, string[]> = {
  'neutral-earth-tones': ['grey', 'gray', 'beige', 'brown', 'olive', 'taupe', 'cream', 'tan', 'khaki', 'sand'],
  'monochromatic-beige': ['beige', 'cream', 'tan', 'taupe', 'sand', 'ivory', 'ecru'],
  'monochromatic-brown': ['brown', 'chocolate', 'camel', 'coffee', 'mocha', 'cocoa', 'chestnut'],
  'monochromatic-blue': ['blue', 'navy', 'indigo', 'denim', 'cobalt', 'azure', 'steel'],
  'monochromatic-black': ['black', 'charcoal', 'ebony', 'jet', 'onyx'],
  'work-olive-black': ['olive', 'black', 'charcoal', 'forest', 'hunter'],
  'work-brown-cream': ['brown', 'cream', 'beige', 'camel', 'ivory', 'tan'],
  'all-black-texture': ['black', 'charcoal', 'ebony'],
}

/**
 * Get color palette keywords
 */
export function getColorPaletteKeywords(palette: ColorPalette): string[] {
  return COLOR_PALETTES[palette] || []
}

/**
 * Get all neutral earth tone colors
 */
export function getNeutralEarthTones(): string[] {
  return COLOR_PALETTES['neutral-earth-tones']
}

// ============================================================================
// Aesthetic Definitions
// ============================================================================

/**
 * Aesthetic category definitions with keywords and characteristics
 */
export interface AestheticDefinition {
  name: AestheticCategory
  keywords: string[]
  colorPalettes: ColorPalette[]
  layeringPatterns: LayeringPattern[]
  description: string
  occasions: string[]
}

export const AESTHETIC_DEFINITIONS: Record<AestheticCategory, AestheticDefinition> = {
  'clean-girl': {
    name: 'clean-girl',
    keywords: ['minimal', 'neutral', 'soft', 'fresh', 'light', 'simple', 'effortless', 'natural'],
    colorPalettes: ['neutral-earth-tones', 'monochromatic-beige', 'monochromatic-brown'],
    layeringPatterns: ['cardigan-over-fitted-top'],
    description: 'Minimalist aesthetic with neutral tones and effortless styling',
    occasions: ['chill', 'cafe', 'casual'],
  },
  'scandinavian-minimal': {
    name: 'scandinavian-minimal',
    keywords: ['simple', 'clean lines', 'neutral palette', 'quality', 'basics', 'understated'],
    colorPalettes: ['neutral-earth-tones', 'monochromatic-beige', 'all-black-texture'],
    layeringPatterns: ['sweater-over-collared-shirt', 'cardigan-over-fitted-top'],
    description: 'Clean Scandinavian aesthetic with quality basics and neutral colors',
    occasions: ['work', 'chill', 'cafe'],
  },
  'street-style': {
    name: 'street-style',
    keywords: ['oversized', 'baggy', 'urban', 'layered', 'chunky', 'relaxed', 'edgy'],
    colorPalettes: ['neutral-earth-tones', 'monochromatic-black'],
    layeringPatterns: ['oversized-sweater-over-tee', 'cardigan-over-fitted-top', 'knit-vest-over-button-up'],
    description: 'Urban street style with oversized silhouettes and layered looks',
    occasions: ['chill', 'weekend', 'casual'],
  },
  'casual-chic': {
    name: 'casual-chic',
    keywords: ['effortless', 'polished', 'relaxed', 'sophisticated', 'versatile'],
    colorPalettes: ['neutral-earth-tones', 'work-brown-cream'],
    layeringPatterns: ['cardigan-over-fitted-top', 'sweater-over-collared-shirt'],
    description: 'Polished casual style that balances comfort and sophistication',
    occasions: ['chill', 'cafe', 'brunch', 'casual'],
  },
  'y2k-revival': {
    name: 'y2k-revival',
    keywords: ['low-rise', 'colorful', 'playful', 'platform', 'retro', 'bold', 'fun'],
    colorPalettes: ['monochromatic-blue'],
    layeringPatterns: ['cardigan-over-fitted-top'],
    description: 'Nostalgic Y2K revival with playful colors and platform footwear',
    occasions: ['party', 'date', 'weekend'],
  },
  'corporate-chic': {
    name: 'corporate-chic',
    keywords: ['structured', 'tailored', 'wide-leg', 'blazer', 'professional', 'polished', 'refined'],
    colorPalettes: ['work-olive-black', 'work-brown-cream', 'all-black-texture'],
    layeringPatterns: ['blazer-over-knit', 'sweater-over-collared-shirt'],
    description: 'Modern professional style with structured pieces and wide-leg silhouettes',
    occasions: ['work', 'business', 'meeting'],
  },
  'quiet-luxury': {
    name: 'quiet-luxury',
    keywords: ['understated', 'premium', 'timeless', 'refined', 'cashmere', 'quality', 'elegant'],
    colorPalettes: ['neutral-earth-tones', 'monochromatic-beige', 'all-black-texture'],
    layeringPatterns: ['sweater-over-collared-shirt', 'cardigan-over-dress'],
    description: 'Understated luxury with premium materials and timeless design',
    occasions: ['work', 'dinner', 'formal'],
  },
  'minimalist-office': {
    name: 'minimalist-office',
    keywords: ['clean', 'simple', 'professional', 'neutral', 'streamlined', 'modern'],
    colorPalettes: ['neutral-earth-tones', 'all-black-texture', 'work-olive-black'],
    layeringPatterns: ['blazer-over-knit', 'cardigan-over-fitted-top'],
    description: 'Minimalist professional style with clean lines and neutral palette',
    occasions: ['work', 'business', 'meeting'],
  },
  'dark-academia': {
    name: 'dark-academia',
    keywords: ['vintage', 'scholarly', 'layered', 'brown', 'tweed', 'classic', 'bookish'],
    colorPalettes: ['monochromatic-brown', 'neutral-earth-tones'],
    layeringPatterns: ['sweater-over-collared-shirt', 'knit-vest-over-button-up', 'cardigan-over-dress'],
    description: 'Scholarly vintage aesthetic with rich browns and layered pieces',
    occasions: ['chill', 'cafe', 'casual'],
  },
}

/**
 * Get aesthetic definition by name
 */
export function getAestheticDefinition(aesthetic: AestheticCategory): AestheticDefinition | undefined {
  return AESTHETIC_DEFINITIONS[aesthetic]
}

/**
 * Get aesthetics for occasion
 */
export function getAestheticsForOccasion(occasion: string): AestheticCategory[] {
  const lowerOccasion = occasion.toLowerCase()
  return Object.values(AESTHETIC_DEFINITIONS)
    .filter(def => def.occasions.some(occ => occ === lowerOccasion))
    .map(def => def.name)
}

// ============================================================================
// Layering Pattern Definitions
// ============================================================================

/**
 * Layering pattern definitions
 */
export interface LayeringPatternDefinition {
  pattern: LayeringPattern
  baseLayer: string[] // Keywords for base layer
  topLayer: string[] // Keywords for top layer
  occasion: 'casual' | 'work' | 'any'
  description: string
}

export const LAYERING_PATTERNS: Record<LayeringPattern, LayeringPatternDefinition> = {
  'oversized-sweater-over-tee': {
    pattern: 'oversized-sweater-over-tee',
    baseLayer: ['t-shirt', 'tee', 'tank', 'basic top'],
    topLayer: ['sweater', 'pullover', 'knit', 'oversized'],
    occasion: 'casual',
    description: 'Oversized sweater layered over basic tee for relaxed street style',
  },
  'cardigan-over-fitted-top': {
    pattern: 'cardigan-over-fitted-top',
    baseLayer: ['fitted top', 'tank', 'bodysuit', 'slim top'],
    topLayer: ['cardigan', 'cardi', 'open front'],
    occasion: 'any',
    description: 'Cardigan over fitted top for versatile layered look',
  },
  'knit-vest-over-button-up': {
    pattern: 'knit-vest-over-button-up',
    baseLayer: ['button-up', 'shirt', 'blouse', 'collared'],
    topLayer: ['vest', 'knit vest', 'sweater vest'],
    occasion: 'casual',
    description: 'Knit vest over button-up for preppy casual style',
  },
  'sweater-over-collared-shirt': {
    pattern: 'sweater-over-collared-shirt',
    baseLayer: ['collared shirt', 'button-up', 'dress shirt'],
    topLayer: ['sweater', 'pullover', 'knit', 'crewneck'],
    occasion: 'work',
    description: 'Sweater layered over collared shirt for smart casual office look',
  },
  'blazer-over-knit': {
    pattern: 'blazer-over-knit',
    baseLayer: ['sweater', 'knit', 'pullover', 'turtleneck'],
    topLayer: ['blazer', 'jacket', 'suit jacket'],
    occasion: 'work',
    description: 'Blazer over knit for polished professional style',
  },
  'cardigan-over-dress': {
    pattern: 'cardigan-over-dress',
    baseLayer: ['dress', 'slip dress', 'midi dress'],
    topLayer: ['cardigan', 'cardi', 'long cardigan'],
    occasion: 'any',
    description: 'Cardigan layered over dress for feminine versatile look',
  },
}

/**
 * Get layering pattern definition
 */
export function getLayeringPattern(pattern: LayeringPattern): LayeringPatternDefinition | undefined {
  return LAYERING_PATTERNS[pattern]
}

/**
 * Get casual layering patterns
 */
export function getCasualLayeringPatterns(): LayeringPattern[] {
  return Object.values(LAYERING_PATTERNS)
    .filter(def => def.occasion === 'casual' || def.occasion === 'any')
    .map(def => def.pattern)
}

/**
 * Get work layering patterns
 */
export function getWorkLayeringPatterns(): LayeringPattern[] {
  return Object.values(LAYERING_PATTERNS)
    .filter(def => def.occasion === 'work' || def.occasion === 'any')
    .map(def => def.pattern)
}

// ============================================================================
// Bottom Styling Trends
// ============================================================================

export const BOTTOM_STYLE_KEYWORDS: Record<BottomStyle, string[]> = {
  'baggy-jeans': ['baggy', 'loose', 'relaxed', 'boyfriend', 'slouchy'],
  'wide-leg-jeans': ['wide-leg', 'wide leg', 'flare', 'palazzo'],
  'high-waisted-fit': ['high-waisted', 'high waist', 'high rise'],
  'cuffed-denim': ['cuffed', 'rolled', 'turn-up'],
  'wide-leg-trousers': ['wide-leg trousers', 'wide leg pants', 'palazzo pants'],
  'high-waisted-trousers': ['high-waisted trousers', 'high waist pants'],
}

/**
 * Get keywords for bottom style
 */
export function getBottomStyleKeywords(style: BottomStyle): string[] {
  return BOTTOM_STYLE_KEYWORDS[style] || []
}

/**
 * Get trending bottom styles for occasion
 */
export function getTrendingBottomStyles(occasion: 'casual' | 'work'): BottomStyle[] {
  if (occasion === 'work') {
    return ['wide-leg-trousers', 'high-waisted-trousers', 'high-waisted-fit']
  }
  return ['baggy-jeans', 'wide-leg-jeans', 'high-waisted-fit', 'cuffed-denim']
}

// ============================================================================
// Footwear Trends
// ============================================================================

export const FOOTWEAR_KEYWORDS: Record<FootwearTrend, string[]> = {
  'platform-sneakers': ['platform', 'platform sneakers', 'chunky sole'],
  'adidas-gazelle-style': ['gazelle', 'adidas', 'retro sneakers', 'suede sneakers'],
  'timberland-boots': ['timberland', 'work boots', 'hiking boots', 'tan boots'],
  'ugg-style-boots': ['ugg', 'sheepskin', 'winter boots', 'cozy boots'],
  'chunky-sneakers': ['chunky', 'dad sneakers', 'thick sole', 'bulky'],
}

/**
 * Get keywords for footwear trend
 */
export function getFootwearKeywords(trend: FootwearTrend): string[] {
  return FOOTWEAR_KEYWORDS[trend] || []
}

/**
 * Get trending footwear for occasion
 */
export function getTrendingFootwear(occasion: 'casual' | 'work'): FootwearTrend[] {
  if (occasion === 'work') {
    return ['platform-sneakers', 'chunky-sneakers']
  }
  return ['platform-sneakers', 'adidas-gazelle-style', 'timberland-boots', 'chunky-sneakers']
}

// ============================================================================
// Accessory Trends
// ============================================================================

export const ACCESSORY_KEYWORDS: Record<AccessoryTrend, string[]> = {
  'black-structured-bag': ['black bag', 'structured bag', 'tote', 'handbag'],
  'gold-layered-jewelry': ['gold', 'jewelry', 'necklace', 'layered', 'chain'],
  'wide-belt': ['wide belt', 'statement belt', 'waist belt'],
  'structured-leather-tote': ['tote', 'leather bag', 'work bag', 'structured'],
}

/**
 * Get keywords for accessory trend
 */
export function getAccessoryKeywords(trend: AccessoryTrend): string[] {
  return ACCESSORY_KEYWORDS[trend] || []
}

/**
 * Get trending accessories for occasion
 */
export function getTrendingAccessories(occasion: 'casual' | 'work'): AccessoryTrend[] {
  if (occasion === 'work') {
    return ['structured-leather-tote', 'gold-layered-jewelry']
  }
  return ['black-structured-bag', 'gold-layered-jewelry', 'wide-belt']
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect aesthetic from keywords
 */
export function detectAestheticFromKeywords(keywords: string[]): AestheticCategory | null {
  const lowerKeywords = keywords.map(k => k.toLowerCase())

  // Count matches for each aesthetic
  const matches: Record<AestheticCategory, number> = {} as any

  for (const [aesthetic, definition] of Object.entries(AESTHETIC_DEFINITIONS)) {
    const matchCount = definition.keywords.filter(keyword =>
      lowerKeywords.some(k => k.includes(keyword) || keyword.includes(k))
    ).length

    if (matchCount > 0) {
      matches[aesthetic as AestheticCategory] = matchCount
    }
  }

  // Return aesthetic with most matches
  const entries = Object.entries(matches)
  if (entries.length === 0) return null

  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0] as AestheticCategory
}

/**
 * Get recommended color palettes for aesthetic
 */
export function getRecommendedPalettes(aesthetic: AestheticCategory): ColorPalette[] {
  const definition = AESTHETIC_DEFINITIONS[aesthetic]
  return definition?.colorPalettes || []
}

/**
 * Get recommended layering for aesthetic
 */
export function getRecommendedLayering(aesthetic: AestheticCategory): LayeringPattern[] {
  const definition = AESTHETIC_DEFINITIONS[aesthetic]
  return definition?.layeringPatterns || []
}

/**
 * Check if aesthetic is suitable for occasion
 */
export function isAestheticSuitableForOccasion(aesthetic: AestheticCategory, occasion: string): boolean {
  const definition = AESTHETIC_DEFINITIONS[aesthetic]
  return definition?.occasions.includes(occasion.toLowerCase()) || false
}

// ============================================================================
// Age-Based Filtering (User Preference Integration)
// ============================================================================

export type AgeRange = '<20' | '20-29' | '30-39' | '40+'

/**
 * Filters aesthetics by age appropriateness
 *
 * Uses same logic as user-preference-mapper utility but operates on aesthetics directly.
 * This is used when user preferences are available during outfit generation.
 *
 * @param aesthetics - Aesthetics to filter
 * @param ageRange - User's age range
 * @returns Sorted aesthetics (most appropriate first)
 *
 * Strategy:
 * - <20: Prioritize trend-forward styles (y2k-revival, street-style)
 * - 20-29: Balanced mix of all aesthetics
 * - 30-39: Prioritize sophisticated styles (quiet-luxury, corporate-chic)
 * - 40+: Prioritize timeless, elegant styles
 */
export function filterAestheticsByAge(aesthetics: AestheticCategory[], ageRange: AgeRange): AestheticCategory[] {
  const weights: Record<AgeRange, Partial<Record<AestheticCategory, number>>> = {
    '<20': {
      'y2k-revival': 3,
      'street-style': 3,
      'casual-chic': 2,
      'clean-girl': 2,
      'scandinavian-minimal': 1,
      'dark-academia': 2,
    },
    '20-29': {
      // All aesthetics weighted equally for balanced recommendations
      'y2k-revival': 2,
      'street-style': 2,
      'casual-chic': 3,
      'clean-girl': 3,
      'scandinavian-minimal': 2,
      'corporate-chic': 2,
      'quiet-luxury': 2,
      'minimalist-office': 2,
      'dark-academia': 2,
    },
    '30-39': {
      'scandinavian-minimal': 3,
      'corporate-chic': 3,
      'quiet-luxury': 3,
      'minimalist-office': 3,
      'casual-chic': 2,
      'clean-girl': 2,
      'dark-academia': 2,
      'street-style': 1,
      'y2k-revival': 1,
    },
    '40+': {
      'quiet-luxury': 3,
      'scandinavian-minimal': 3,
      'minimalist-office': 3,
      'corporate-chic': 2,
      'casual-chic': 2,
      'dark-academia': 2,
      'clean-girl': 1,
    },
  }

  const ageWeights = weights[ageRange] || {}

  // Sort by weight and filter out inappropriate aesthetics
  return [...aesthetics]
    .filter(aesthetic => (ageWeights[aesthetic] ?? 1) > 0)
    .sort((a, b) => {
      const weightA = ageWeights[a] ?? 1
      const weightB = ageWeights[b] ?? 1
      return weightB - weightA
    })
}

/**
 * Get recommended formality level based on age and occasion
 *
 * Returns a formality score on a 1-10 scale:
 * - 1-3: Very casual
 * - 4-6: Smart casual
 * - 7-9: Business casual to formal
 * - 10: Very formal
 *
 * @param ageRange - User's age range
 * @param occasion - Occasion type (work, casual, formal, etc.)
 * @returns Recommended formality level (1-10)
 *
 * Strategy:
 * - Younger ages prefer lower formality even for work occasions
 * - Older ages prefer higher formality across all occasions
 */
export function getRecommendedFormality(ageRange: AgeRange, occasion: string): number {
  const lowerOccasion = occasion.toLowerCase()

  // Base formality by occasion
  let baseFormality = 5 // Default smart casual

  if (['work', 'business', 'meeting', 'formal', 'wedding'].includes(lowerOccasion)) {
    baseFormality = 7 // Business casual to formal
  } else if (['party', 'date', 'dinner'].includes(lowerOccasion)) {
    baseFormality = 6 // Elevated casual
  } else if (['chill', 'cafe', 'casual', 'weekend', 'brunch'].includes(lowerOccasion)) {
    baseFormality = 3 // Casual
  }

  // Age-based adjustments
  const ageAdjustments: Record<AgeRange, number> = {
    '<20': -1,   // More casual
    '20-29': 0,  // Neutral
    '30-39': +1, // More sophisticated
    '40+': +2,   // More elegant
  }

  const adjusted = baseFormality + (ageAdjustments[ageRange] ?? 0)

  // Clamp to 1-10 range
  return Math.max(1, Math.min(10, adjusted))
}
