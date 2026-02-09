/**
 * Enhanced Mock Product Data v4
 *
 * KB EXPANSION FEB 2026 - COMPLETE
 * All 14 products now have complete KB expansion attribute groups populated.
 *
 * This file extends mock-data03.ts with COMPLETE Knowledge Base alignment:
 * - AI-powered outfit recommendations
 * - Body type compatibility matching
 * - Weather/climate appropriateness
 * - Trend-aware styling
 * - Visual characteristics for image matching
 * - Sustainability considerations
 * - AI Look → Product Mapping
 * - Thai Cultural Context (KB Sections 01, 02, 07, 12) ✅ COMPLETE
 * - Visual Matching Intelligence (KB Section 15) ✅ COMPLETE
 * - Cross-Product Compatibility (KB Section 17) ✅ COMPLETE
 * - Price Intelligence (KB Section 13) ✅ COMPLETE
 * - Social Proof Signals (KB Special Topics) ✅ COMPLETE
 *
 * Total attributes: ~120 per product (65 base + 54 KB expansion sub-attributes)
 *
 * EXISTING (14 from mock-data02):
 * - Style aesthetics (styleTags, aesthetic, colorPalette)
 * - Physical characteristics (fitType, patternType, materialType, silhouetteType)
 * - Seasonal suitability (seasonType)
 * - Formality levels (formalityLevel)
 * - Outfit composition (outfitRole, pairingCategories, layeringStyle)
 * - Brand positioning (brandTier)
 * - Color characteristics (colorTone)
 *
 * EXTENDED ATTRIBUTES (21):
 * - Body type compatibility (bodyTypeCompatibility, heightRecommendation)
 * - Occasion & context (dressCode, eventTypes, timeOfDay)
 * - Weather suitability (temperatureRange, weatherSuitability)
 * - Style personality (stylePersonality, fashionMoods)
 * - Trend & versatility (trendStatus, trendSeasons, versatilityScore)
 * - Visual details (dominantColors, textureDescription, visualWeight, garmentDetails)
 * - Sustainability (sustainabilityScore, sustainabilityTags)
 * - Wardrobe planning (investmentPiece, capsuleWardrobe, pricePerWear)
 * - Styling guidance (stylingTips, avoidPairingWith)
 * - Demographics (ageRange, targetLifestyle)
 *
 * AI MATCHING ATTRIBUTES (12):
 * - Color precision (colorFamily, colorSaturation, colorBrightness)
 * - AI semantic matching (aiMatchingTags, semanticDescription, alternativeNames)
 * - Trend/inspiration matching (inspirationKeywords, pinterestAesthetics, styleReferences)
 * - Visual hierarchy (visualRole, distinctiveFeatures)
 *
 * KB EXPANSION FEB 2026 - 5 ATTRIBUTE GROUPS (54 sub-attributes):
 * - thaiContext: Thai climate rating, temple/festival appropriateness, day colors
 * - visualMatching: Silhouette, visual weight, proportions, outfit role
 * - crossProductCompatibility: Pairing scores, perfect matches, formality tolerance
 * - priceIntelligence: Cost-per-wear, investment score, value tier
 * - socialProof: Popularity, trend status, celebrity associations
 */

import type { Product } from './types'
import type {
  StyleTag,
  SeasonType,
  FormalityLevel,
  FitType,
  PatternType,
  MaterialType,
  AestheticCategory,
  ColorPalette,
  OutfitRole,
  BrandTier,
  LayeringStyle,
  SilhouetteType,
} from './types/enums'

// KB Expansion Feb 2026 - Import Thai Context Types
import type { ThaiClimateContext } from './types/thai-context-types'

// KB Expansion Feb 2026 - Import AI Matching Types
import type {
  VisualMatchingAttributes,
  CrossProductCompatibility,
  PriceIntelligence,
  SocialProofSignals,
} from './types/ai-matching-types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Color tone classification for color harmony matching
 */
export type ColorTone = 'warm' | 'cool' | 'neutral'

/**
 * Body type classifications based on common fashion industry standards
 */
export type BodyType =
  | 'hourglass'
  | 'pear'
  | 'apple'
  | 'rectangle'
  | 'inverted-triangle'
  | 'all'

/**
 * Height recommendation for garment suitability
 */
export type HeightRecommendation = 'petite' | 'regular' | 'tall' | 'all'

/**
 * Dress code classifications from most formal to casual
 */
export type DressCode =
  | 'black-tie'
  | 'cocktail'
  | 'business-formal'
  | 'business-casual'
  | 'smart-casual'
  | 'casual'
  | 'athleisure'
  | 'resort'
  | 'streetwear'

/**
 * Time of day appropriateness
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all-day'

/**
 * Weather conditions the garment is suitable for
 */
export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'humid'
  | 'windy'
  | 'cold'
  | 'air-conditioned'

/**
 * Style personality types (based on Kibbe and similar systems)
 */
export type StylePersonality =
  | 'classic'
  | 'dramatic'
  | 'natural'
  | 'romantic'
  | 'creative'
  | 'rebellious'
  | 'minimalist'
  | 'maximalist'

/**
 * Trend lifecycle status
 */
export type TrendStatus =
  | 'emerging'
  | 'trending'
  | 'peak'
  | 'classic'
  | 'timeless'
  | 'declining'
  | 'vintage-revival'

/**
 * Visual weight perception
 */
export type VisualWeight = 'light' | 'medium' | 'heavy'

/**
 * Color family for broad color matching
 */
export type ColorFamily =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black'
  | 'white'
  | 'gray'
  | 'beige'
  | 'navy'
  | 'cream'
  | 'gold'
  | 'silver'
  | 'multicolor'

/**
 * Color saturation level for color matching precision
 */
export type ColorSaturation = 'muted' | 'medium' | 'vibrant' | 'pastel' | 'neon'

/**
 * Color brightness/value for color matching
 */
export type ColorBrightness = 'light' | 'medium' | 'dark'

/**
 * Visual role in outfit composition
 */
export type VisualRole = 'statement' | 'supporting' | 'neutral' | 'accent'

/**
 * Garment-specific details based on category
 */
export interface GarmentDetails {
  // For tops/dresses
  necklineType?:
    | 'crew'
    | 'v-neck'
    | 'scoop'
    | 'boat'
    | 'off-shoulder'
    | 'halter'
    | 'turtle'
    | 'collared'
    | 'square'
    | 'sweetheart'
  sleeveLength?:
    | 'sleeveless'
    | 'cap'
    | 'short'
    | 'elbow'
    | 'three-quarter'
    | 'long'
    | 'bell'

  // For bottoms/dresses
  hemLength?:
    | 'micro'
    | 'mini'
    | 'above-knee'
    | 'knee'
    | 'midi'
    | 'maxi'
    | 'floor'
    | 'cropped'
    | 'ankle'
    | 'full'
  waistType?: 'high-waist' | 'mid-rise' | 'low-rise' | 'elastic' | 'paper-bag'

  // For footwear
  heelHeight?: 'flat' | 'low' | 'mid' | 'high' | 'platform'
  toeShape?: 'pointed' | 'round' | 'square' | 'almond' | 'open'
  closureType?: 'slip-on' | 'lace-up' | 'buckle' | 'zipper' | 'velcro' | 'strap'

  // For outerwear
  length?: 'cropped' | 'hip' | 'thigh' | 'knee' | 'long'
  closureStyle?: 'button' | 'zipper' | 'wrap' | 'open' | 'snap' | 'toggle'

  // For accessories
  size?: 'small' | 'medium' | 'large' | 'oversized'
  width?: 'thin' | 'medium' | 'wide'
}

/**
 * Temperature comfort range in Celsius
 */
export interface TemperatureRange {
  min: number
  max: number
}

/**
 * Age range recommendation
 */
export interface AgeRange {
  min: number
  max: number
}

/**
 * Enhanced product interface with comprehensive fashion attributes
 */
export interface EnhancedProductV3 extends Product {
  // ========== EXISTING ATTRIBUTES (from mock-data02) ==========
  styleTags: StyleTag[]
  seasonType: SeasonType
  formalityLevel: FormalityLevel
  fitType: FitType
  patternType: PatternType
  materialType: MaterialType
  colorTone: ColorTone
  aesthetic: AestheticCategory
  colorPalette: ColorPalette
  outfitRole: OutfitRole
  brandTier: BrandTier
  pairingCategories: string[]
  layeringStyle: LayeringStyle
  silhouetteType: SilhouetteType

  // ========== NEW ATTRIBUTES ==========

  // --- Body Type & Fit ---
  /** Body types this garment flatters */
  bodyTypeCompatibility: BodyType[]
  /** Height suitability recommendation */
  heightRecommendation: HeightRecommendation

  // --- Occasion & Context ---
  /** Dress codes this item is appropriate for */
  dressCode: DressCode[]
  /** Specific event types (wedding, interview, date-night, brunch, etc.) */
  eventTypes: string[]
  /** Time of day appropriateness */
  timeOfDay: TimeOfDay[]

  // --- Weather & Climate ---
  /** Comfortable temperature range in Celsius */
  temperatureRange: TemperatureRange
  /** Weather conditions the garment is suitable for */
  weatherSuitability: WeatherCondition[]

  // --- Style Personality ---
  /** Style personality types this appeals to */
  stylePersonality: StylePersonality[]
  /** Mood keywords (confident, relaxed, playful, sophisticated, etc.) */
  fashionMoods: string[]

  // --- Trend & Versatility ---
  /** Current trend lifecycle status */
  trendStatus: TrendStatus
  /** Trend seasons (e.g., ['2025-spring', '2025-summer']) */
  trendSeasons: string[]
  /** Versatility score 1-10 (how many ways can this be styled) */
  versatilityScore: number

  // --- Visual Characteristics ---
  /** Primary/dominant colors (hex codes or names) */
  dominantColors: string[]
  /** Secondary/accent colors */
  secondaryColors: string[]
  /** Tactile/visual texture description */
  textureDescription: string
  /** Visual presence/weight */
  visualWeight: VisualWeight
  /** Category-specific garment details */
  garmentDetails: GarmentDetails

  // --- Sustainability ---
  /** Sustainability score 1-10 */
  sustainabilityScore: number
  /** Sustainability certifications/features */
  sustainabilityTags: string[]

  // --- Wardrobe Planning ---
  /** Is this a wardrobe staple worth investing in */
  investmentPiece: boolean
  /** Suitable for capsule/minimalist wardrobe */
  capsuleWardrobe: boolean
  /** Estimated price per wear (based on versatility and durability) */
  pricePerWear: number

  // --- Styling Guidance ---
  /** Specific styling tips and suggestions */
  stylingTips: string[]
  /** Items/styles to avoid pairing with */
  avoidPairingWith: string[]

  // --- Demographics ---
  /** Suggested age range */
  ageRange: AgeRange
  /** Target lifestyle segments */
  targetLifestyle: string[]

  // ========== AI MATCHING ATTRIBUTES (NEW) ==========

  // --- Color Precision ---
  /** Primary color family for broad matching */
  colorFamily: ColorFamily
  /** Color saturation level */
  colorSaturation: ColorSaturation
  /** Color brightness/value */
  colorBrightness: ColorBrightness

  // --- AI Semantic Matching ---
  /** Keywords that AI models commonly use to describe this item */
  aiMatchingTags: string[]
  /** Full semantic description optimized for AI text matching */
  semanticDescription: string
  /** Alternative names/terms for this item type */
  alternativeNames: string[]

  // --- Trend & Inspiration Matching ---
  /** Pinterest/social media aesthetic keywords */
  inspirationKeywords: string[]
  /** Related Pinterest board aesthetics */
  pinterestAesthetics: string[]
  /** Celebrity/influencer style references */
  styleReferences: string[]

  // --- Visual Hierarchy ---
  /** Role in outfit visual composition */
  visualRole: VisualRole
  /** Distinctive visual features for matching */
  distinctiveFeatures: string[]

  // ========== KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ==========

  // --- Thai Cultural Context (KB Sections 01, 02, 07, 12) ---
  /** Thai climate and cultural appropriateness */
  thaiContext?: ThaiClimateContext

  // --- Visual Matching Intelligence (KB Section 15) ---
  /** Visual attributes for AI image-to-product matching */
  visualMatching?: VisualMatchingAttributes

  // --- Cross-Product Compatibility (KB Section 17) ---
  /** Product pairing rules and compatibility scores */
  crossProductCompatibility?: CrossProductCompatibility

  // --- Price Intelligence (KB Section 13) ---
  /** Value assessment and investment metrics */
  priceIntelligence?: PriceIntelligence

  // --- Social Proof Signals (KB Special Topics) ---
  /** Popularity and trend indicators */
  socialProof?: SocialProofSignals
}

// ============================================================================
// ENHANCED PRODUCT DATA
// ============================================================================

/**
 * Enriched mock products array with comprehensive fashion attributes (v4)
 * for advanced outfit recommendation and matching algorithms
 *
 * KB Expansion Feb 2026: All 14 products now have complete attribute groups:
 * - thaiContext: Thai cultural and climate context
 * - visualMatching: Visual attributes for AI image matching
 * - crossProductCompatibility: Product pairing rules
 * - priceIntelligence: Value and investment metrics
 * - socialProof: Popularity and trend signals
 */
export const enhancedMockProductsV4: EnhancedProductV3[] = [
  // CG001 - Classic White Button Shirt
  {
    sku: 'CG001',
    name: 'Classic White Button Shirt',
    brand: 'Central',
    price: 1290,
    imageUrl: '/white-button-shirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg001',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Light Blue'],
    category: 'Women',

    // === EXISTING ATTRIBUTES ===
    styleTags: ['classic', 'minimalist', 'corporate-chic'],
    seasonType: 'all-season',
    formalityLevel: 6,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'cotton',
    colorTone: 'cool',
    aesthetic: 'corporate-chic',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'top',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blazer', 'Jeans'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['all'],
    heightRecommendation: 'all',
    dressCode: ['business-formal', 'business-casual', 'smart-casual'],
    eventTypes: ['office', 'interview', 'meeting', 'presentation', 'business-lunch'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 18, max: 28 },
    weatherSuitability: ['sunny', 'cloudy', 'air-conditioned'],
    stylePersonality: ['classic', 'minimalist'],
    fashionMoods: ['professional', 'polished', 'confident', 'clean'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 9,
    dominantColors: ['#FFFFFF'],
    secondaryColors: [],
    textureDescription: 'Smooth, crisp cotton with subtle weave texture',
    visualWeight: 'light',
    garmentDetails: {
      necklineType: 'collared',
      sleeveLength: 'long',
    },
    sustainabilityScore: 6,
    sustainabilityTags: ['natural-fiber'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 12.9, // Assuming 100+ wears
    stylingTips: [
      'Tuck into high-waisted pants for a polished look',
      'Leave top buttons open with a delicate necklace for casual styling',
      'Roll sleeves to elbow for smart-casual vibe',
      'Layer under blazer for formal occasions',
    ],
    avoidPairingWith: ['athletic-wear', 'distressed-denim', 'graphic-tees'],
    ageRange: { min: 18, max: 65 },
    targetLifestyle: ['professional', 'corporate', 'student', 'entrepreneur'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'white',
    colorSaturation: 'muted',
    colorBrightness: 'light',
    aiMatchingTags: [
      'white shirt', 'button-down', 'oxford shirt', 'dress shirt', 'collared shirt',
      'crisp white top', 'work blouse', 'classic blouse', 'cotton shirt', 'office wear',
      'business attire', 'professional top', 'minimalist shirt', 'wardrobe staple',
    ],
    semanticDescription: 'A timeless white cotton button-down shirt with a classic collared neckline and long sleeves. Features a clean, crisp appearance with a regular fit that works for both tucked and untucked styling. The smooth cotton fabric has a subtle weave texture that reads as polished and professional. This versatile piece serves as a foundation garment that pairs seamlessly with tailored trousers, pencil skirts, or dressed-down jeans.',
    alternativeNames: ['button-down', 'oxford shirt', 'dress shirt', 'collared blouse', 'work shirt'],
    inspirationKeywords: ['quiet-luxury', 'old-money', 'clean-girl', 'effortless-chic', 'french-girl-style', 'capsule-wardrobe'],
    pinterestAesthetics: ['minimalist fashion', 'office outfit inspo', 'classic style', 'timeless wardrobe', 'workwear capsule'],
    styleReferences: ['Meghan Markle workwear', 'Victoria Beckham minimalist', 'Amal Clooney professional'],
    visualRole: 'supporting',
    distinctiveFeatures: ['pointed collar', 'button placket', 'long cuffed sleeves', 'chest pocket optional'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 8, // Excellent for Thai climate with AC
      acFriendly: true,
      monthSuitability: [9, 9, 8, 7, 8, 8, 8, 8, 8, 9, 9, 9], // Slightly lower in hot April
      templeAppropriate: true, // Covered, modest
      weddingAppropriate: 'any',
      funeralAppropriate: false, // White not for funerals in Thai culture
      songkranSuitable: 'temple-morning', // Perfect for temple morning, not water play
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // White is inauspicious for CNY
      coverage: {
        shoulders: 'covered',
        knees: 'partially-covered', // Shirt doesn't cover knees, depends on bottom
      },
      thaiDayColors: ['monday', 'friday'], // White is lucky for Monday (cream) and Friday (light colors)
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line', // Straight, columnar
      silhouetteFit: 'semi-fitted', // Regular fit cotton shirt
      silhouetteVolume: 'low',
      visualWeightScore: 3,
      visualWeightLevel: 'light',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 0,
        heightEffect: 1, // Slight vertical emphasis
        widthEffect: 0,
      },
      patternComplexity: 1, // Solid color
      textureType: 'matte',
      outfitRoleType: 'supporting', // Foundation piece
      thaiProportionScore: 8, // Good for Thai petite frames
      statementPotential: false,
      styleMoods: ['professional', 'polished', 'confident', 'clean'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 95, // Highly versatile
      essentialPairings: ['bottom'], // Needs pants/skirt
      avoidPairings: ['athletic-wear', 'distressed-denim'],
      versatilityScore: 9,
      layerCompatibility: ['fitted', 'structured'],
      outfitCompleteness: 'needs-bottom',
      formalityTolerance: 2, // Can pair with formality ±2
      patternMixingSafe: true, // Solid white works with patterns
      perfectMatchSkus: ['CG002', 'SF002'], // Black trousers, SFERA pants
      commonPairings: [
        { sku: 'CG002', relationship: 'perfect-match', score: 98 },
        { sku: 'CG003', relationship: 'great-pair', score: 85 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 12.9, // ฿1,290 ÷ 100 wears
      costPerWearTier: 'excellent', // Under ฿50
      investmentScore: 85,
      qualityTier: 4,
      timelessScore: 10, // Maximum classic appeal
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'Mid-year sale (May-June)',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 78,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 95, // High confidence in classic status
      celebrityAssociations: ['Meghan Markle', 'Victoria Beckham'],
      hashtagTrending: ['#classicstyle', '#workwear', '#capsulewardrobe'],
      reviewSentiment: 72,
      reviewCount: 156,
      recommendRate: 87,
      influencerFeatures: 12,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // CG002 - Tailored Black Trousers
  {
    sku: 'CG002',
    name: 'Tailored Black Trousers',
    brand: 'Central',
    price: 1890,
    imageUrl: '/black-tailored-trousers.jpg',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna'],
    onlineUrl: 'https://central.co.th/product/cg002',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy'],
    category: 'Women',
    occasion: ['work', 'formal'],

    // === EXISTING ATTRIBUTES ===
    styleTags: ['classic', 'corporate-chic', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 7,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['Blouse', 'Blazer', 'Shirt', 'Heels', 'Pumps'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['hourglass', 'rectangle', 'inverted-triangle'],
    heightRecommendation: 'all',
    dressCode: ['business-formal', 'business-casual', 'cocktail'],
    eventTypes: ['office', 'interview', 'meeting', 'dinner', 'networking'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 16, max: 26 },
    weatherSuitability: ['cloudy', 'air-conditioned'],
    stylePersonality: ['classic', 'dramatic', 'minimalist'],
    fashionMoods: ['powerful', 'sophisticated', 'authoritative', 'sleek'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 9,
    dominantColors: ['#000000'],
    secondaryColors: [],
    textureDescription: 'Smooth, structured fabric with subtle sheen',
    visualWeight: 'medium',
    garmentDetails: {
      hemLength: 'ankle',
      waistType: 'mid-rise',
    },
    sustainabilityScore: 4,
    sustainabilityTags: [],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 18.9,
    stylingTips: [
      'Pair with white shirt for classic professional look',
      'Add a colorful blouse to break the monochrome',
      'Style with heels to elongate legs',
      'Choose ankle length to show off statement shoes',
    ],
    avoidPairingWith: ['casual-sneakers', 'bohemian-prints', 'oversized-tops'],
    ageRange: { min: 22, max: 60 },
    targetLifestyle: ['professional', 'corporate', 'executive'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'black',
    colorSaturation: 'muted',
    colorBrightness: 'dark',
    aiMatchingTags: [
      'black trousers', 'tailored pants', 'dress pants', 'work trousers', 'formal pants',
      'slim fit pants', 'office pants', 'professional trousers', 'sleek pants', 'power pants',
      'ankle pants', 'straight leg trousers', 'suit pants', 'corporate wear',
    ],
    semanticDescription: 'Sophisticated black tailored trousers with a sleek, structured silhouette. Features a mid-rise waist and ankle-length hem that creates an elongated leg line. The smooth polyester fabric has a subtle sheen that elevates the look from casual to polished. These versatile pants form the foundation of a professional wardrobe, pairing effortlessly with blazers, blouses, and heels for a commanding presence.',
    alternativeNames: ['dress pants', 'work trousers', 'formal pants', 'tailored slacks', 'suit pants'],
    inspirationKeywords: ['power-dressing', 'boss-babe', 'corporate-chic', 'quiet-luxury', 'minimalist-workwear'],
    pinterestAesthetics: ['office outfit', 'workwear style', 'business casual', 'power suit', 'monochrome outfit'],
    styleReferences: ['Cate Blanchett suiting', 'Angelina Jolie power look', 'Victoria Beckham tailoring'],
    visualRole: 'supporting',
    distinctiveFeatures: ['tailored fit', 'ankle length', 'subtle sheen', 'clean lines', 'no visible pockets'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 6, // Good with AC, warm for outdoor
      acFriendly: true,
      monthSuitability: [8, 8, 7, 6, 7, 7, 7, 7, 7, 8, 8, 8], // Lower in hot season
      templeAppropriate: true, // Covered, modest, long pants
      weddingAppropriate: 'any',
      funeralAppropriate: true, // Black is appropriate for funerals
      songkranSuitable: 'neither', // Dark color not for water festival
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // Black is inauspicious for CNY
      coverage: {
        shoulders: 'exposed', // Bottom garment
        knees: 'covered',
      },
      thaiDayColors: ['saturday'], // Black is lucky for Saturday
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line', // Straight, columnar
      silhouetteFit: 'fitted', // Tailored trousers
      silhouetteVolume: 'low',
      visualWeightScore: 5,
      visualWeightLevel: 'medium',
      proportionRatio: 'bottom-heavy',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 2, // Elongates legs with ankle length
        heightEffect: 1,
        widthEffect: 0,
      },
      patternComplexity: 1, // Solid color
      textureType: 'matte',
      outfitRoleType: 'supporting',
      thaiProportionScore: 9, // Excellent for Thai petite frames
      statementPotential: false,
      styleMoods: ['powerful', 'sophisticated', 'authoritative', 'sleek'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 95,
      essentialPairings: ['top'],
      avoidPairings: ['casual-sneakers', 'bohemian-prints', 'oversized-tops'],
      versatilityScore: 9,
      layerCompatibility: ['fitted', 'structured'],
      outfitCompleteness: 'needs-top',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['CG001', 'SF001', 'LO001'],
      commonPairings: [
        { sku: 'CG001', relationship: 'perfect-match', score: 98 },
        { sku: 'SF001', relationship: 'perfect-match', score: 95 },
        { sku: 'LO001', relationship: 'great-pair', score: 90 },
        { sku: 'SH001', relationship: 'perfect-match', score: 92 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 18.9, // ฿1,890 ÷ 100 wears
      costPerWearTier: 'excellent',
      investmentScore: 85,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'End of season (Feb, Aug)',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 75,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 95,
      celebrityAssociations: ['Cate Blanchett', 'Victoria Beckham', 'Angelina Jolie'],
      hashtagTrending: ['#workwear', '#powerdressing', '#tailoredpants'],
      reviewSentiment: 78,
      reviewCount: 134,
      recommendRate: 89,
      influencerFeatures: 8,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // CG004 - Casual Denim Jeans
  {
    sku: 'CG004',
    name: 'Casual Denim Jeans',
    brand: 'Central',
    price: 1590,
    imageUrl: '/central-jeans.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg004',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    category: 'Women',
    occasion: ['casual', 'weekend'],

    // === EXISTING ATTRIBUTES ===
    styleTags: ['casual', 'modern', 'street-style'],
    seasonType: 'all-season',
    formalityLevel: 3,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'denim',
    colorTone: 'cool',
    aesthetic: 'casual-chic',
    colorPalette: 'monochromatic-blue',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['T-Shirt', 'Blouse', 'Shirt', 'Sneakers', 'Flats'],
    layeringStyle: 'relaxed',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['all'],
    heightRecommendation: 'all',
    dressCode: ['casual', 'smart-casual', 'streetwear'],
    eventTypes: ['weekend', 'shopping', 'brunch', 'casual-dining', 'travel'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 15, max: 30 },
    weatherSuitability: ['sunny', 'cloudy', 'air-conditioned'],
    stylePersonality: ['natural', 'creative', 'minimalist'],
    fashionMoods: ['relaxed', 'effortless', 'approachable', 'casual'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 10,
    dominantColors: ['#4A6FA5'],
    secondaryColors: ['#FFFFFF'],
    textureDescription: 'Classic denim weave with slight stretch',
    visualWeight: 'medium',
    garmentDetails: {
      hemLength: 'ankle',
      waistType: 'mid-rise',
    },
    sustainabilityScore: 5,
    sustainabilityTags: ['durable'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 7.95, // High versatility = low price per wear
    stylingTips: [
      'Cuff hems for a more casual look',
      'Dress up with heels and a blazer',
      'Pair with white tee for classic combo',
      'Add a belt to define the waist',
    ],
    avoidPairingWith: ['formal-blazers', 'evening-gowns', 'stilettos'],
    ageRange: { min: 16, max: 55 },
    targetLifestyle: ['student', 'creative', 'casual-professional', 'active'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'blue',
    colorSaturation: 'medium',
    colorBrightness: 'medium',
    aiMatchingTags: [
      'blue jeans', 'denim pants', 'casual jeans', 'everyday jeans', 'classic denim',
      'straight leg jeans', 'mid-rise jeans', 'indigo jeans', 'versatile jeans', 'weekend wear',
      'casual bottoms', 'stretch denim', 'basic jeans', 'wardrobe essential',
    ],
    semanticDescription: 'Classic blue denim jeans with a relaxed yet polished fit. Features mid-rise waist and ankle-length hem with a slight stretch for all-day comfort. The medium-wash indigo color with subtle fading creates a lived-in look that works for countless casual occasions. These jeans embody effortless style - equally at home with a simple tee or dressed up with a blazer and heels.',
    alternativeNames: ['blue jeans', 'denim pants', 'casual jeans', 'straight-leg denim', 'everyday jeans'],
    inspirationKeywords: ['casual-chic', 'off-duty-model', 'french-girl', 'effortless-style', 'weekend-vibes', 'denim-on-denim'],
    pinterestAesthetics: ['casual outfit inspo', 'jeans and tee', 'weekend style', 'minimal casual', 'denim looks'],
    styleReferences: ['Hailey Bieber casual', 'Kendall Jenner off-duty', 'Katie Holmes street style'],
    visualRole: 'supporting',
    distinctiveFeatures: ['classic 5-pocket styling', 'medium indigo wash', 'subtle whiskering', 'straight leg silhouette'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 7, // Denim breathes reasonably well
      acFriendly: true,
      monthSuitability: [8, 8, 7, 6, 7, 7, 7, 7, 7, 8, 8, 8],
      templeAppropriate: false, // Too casual for temple
      weddingAppropriate: 'none', // Too casual for Thai weddings
      funeralAppropriate: false, // Not appropriate for funerals
      songkranSuitable: 'water-play', // Can get wet
      loyKrathongSuitable: false, // Too casual
      cnySuitable: 'unsuitable', // Blue is inauspicious for CNY
      coverage: {
        shoulders: 'exposed',
        knees: 'covered',
      },
      thaiDayColors: ['friday'], // Blue is lucky for Friday
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'i-line', // Slim, elongated
      silhouetteFit: 'relaxed', // Casual jeans with stretch
      silhouetteVolume: 'medium',
      visualWeightScore: 5,
      visualWeightLevel: 'medium',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 1,
        heightEffect: 0,
        widthEffect: 0,
      },
      patternComplexity: 2, // Subtle wash variation
      textureType: 'textured',
      outfitRoleType: 'supporting',
      thaiProportionScore: 8,
      statementPotential: false,
      styleMoods: ['relaxed', 'effortless', 'approachable', 'casual'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 98, // Highest versatility
      essentialPairings: ['top'],
      avoidPairings: ['formal-blazers', 'evening-gowns', 'stilettos'],
      versatilityScore: 10,
      layerCompatibility: ['loose', 'fitted'],
      outfitCompleteness: 'needs-top',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['CG007', 'CG001'],
      commonPairings: [
        { sku: 'CG007', relationship: 'perfect-match', score: 98 },
        { sku: 'CG001', relationship: 'great-pair', score: 85 },
        { sku: 'SH002', relationship: 'great-pair', score: 88 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 7.95, // ฿1,590 ÷ 200 wears
      costPerWearTier: 'excellent',
      investmentScore: 90,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'rare',
      bestPurchaseTiming: 'Any time - wardrobe staple',
      expectedWears: 200,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 85,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 98,
      celebrityAssociations: ['Hailey Bieber', 'Kendall Jenner', 'Katie Holmes'],
      hashtagTrending: ['#denimstyle', '#casualoutfit', '#weekendvibes'],
      reviewSentiment: 82,
      reviewCount: 245,
      recommendRate: 92,
      influencerFeatures: 15,
      salesVelocity: 'fast-selling',
      stockScarcity: 'available',
    },
  },

  // CG005 - Floral Summer Dress
  {
    sku: 'CG005',
    name: 'Floral Summer Dress',
    brand: 'Central',
    price: 1590,
    imageUrl: '/floral-summer-dress.png',
    availability: 'low_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://central.co.th/product/cg005',
    sizes: ['S', 'M', 'L'],
    colors: ['Floral Pink', 'Floral Blue'],
    category: 'Women',
    occasion: ['casual', 'weekend'],

    // === EXISTING ATTRIBUTES ===
    styleTags: ['bohemian', 'trendy', 'casual'],
    seasonType: 'hot-season',
    formalityLevel: 4,
    fitType: 'regular',
    patternType: 'floral',
    materialType: 'cotton',
    colorTone: 'warm',
    aesthetic: 'clean-girl',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'dress',
    brandTier: 'mid-range',
    pairingCategories: ['Sandals', 'Flats', 'Bag', 'Belt'],
    layeringStyle: 'relaxed',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['hourglass', 'pear', 'rectangle'],
    heightRecommendation: 'all',
    dressCode: ['casual', 'smart-casual', 'resort'],
    eventTypes: ['brunch', 'garden-party', 'date', 'vacation', 'picnic', 'outdoor-event'],
    timeOfDay: ['morning', 'afternoon'],
    temperatureRange: { min: 25, max: 35 },
    weatherSuitability: ['sunny', 'humid'],
    stylePersonality: ['romantic', 'natural', 'creative'],
    fashionMoods: ['feminine', 'playful', 'cheerful', 'carefree'],
    trendStatus: 'classic',
    trendSeasons: ['2025-spring', '2025-summer', '2026-spring'],
    versatilityScore: 6,
    dominantColors: ['#FFB6C1', '#FFFFFF'],
    secondaryColors: ['#90EE90', '#FFD700'],
    textureDescription: 'Lightweight, breathable cotton with soft drape',
    visualWeight: 'light',
    garmentDetails: {
      necklineType: 'v-neck',
      sleeveLength: 'short',
      hemLength: 'midi',
    },
    sustainabilityScore: 6,
    sustainabilityTags: ['natural-fiber', 'breathable'],
    investmentPiece: false,
    capsuleWardrobe: false,
    pricePerWear: 53, // Seasonal piece, fewer wears
    stylingTips: [
      'Add a denim jacket for cooler evenings',
      'Pair with strappy sandals for summer vibes',
      'Belt at waist to create definition',
      'Add a straw bag for complete resort look',
    ],
    avoidPairingWith: ['heavy-boots', 'structured-blazers', 'dark-colors'],
    ageRange: { min: 18, max: 45 },
    targetLifestyle: ['social', 'creative', 'romantic'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'pink',
    colorSaturation: 'pastel',
    colorBrightness: 'light',
    aiMatchingTags: [
      'floral dress', 'summer dress', 'midi dress', 'pink floral', 'feminine dress',
      'garden party dress', 'vacation dress', 'romantic dress', 'cotton dress', 'v-neck dress',
      'casual dress', 'spring dress', 'date dress', 'brunch outfit',
    ],
    semanticDescription: 'A dreamy floral midi dress in soft pink tones with delicate botanical prints. Features a flattering V-neckline, short sleeves, and a flowing midi-length hem that moves beautifully. The lightweight cotton fabric is perfect for warm weather, offering breathability and comfort. This romantic piece captures effortless femininity - ideal for garden parties, vacations, or any occasion calling for a touch of whimsy.',
    alternativeNames: ['floral midi', 'summer frock', 'garden dress', 'romantic dress', 'tea dress'],
    inspirationKeywords: ['cottagecore', 'romantic-feminine', 'garden-party', 'soft-girl', 'floral-aesthetic', 'vacation-mode'],
    pinterestAesthetics: ['summer dress inspo', 'floral outfit', 'feminine style', 'vacation outfits', 'garden party look'],
    styleReferences: ['Taylor Swift romantic era', 'Florence Pugh feminine', 'Dakota Johnson casual'],
    visualRole: 'statement',
    distinctiveFeatures: ['floral print pattern', 'v-neckline', 'midi length', 'flowing silhouette', 'short puff sleeves'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 9, // Excellent for Thai hot weather
      acFriendly: true,
      monthSuitability: [9, 9, 9, 8, 9, 9, 9, 9, 9, 9, 9, 9], // Great year-round
      templeAppropriate: false, // Sleeveless, too casual
      weddingAppropriate: 'morning', // Casual wedding only
      funeralAppropriate: false, // Floral not appropriate
      songkranSuitable: 'temple-morning', // Modest coverage for morning temple
      loyKrathongSuitable: true, // Perfect for romantic festival
      cnySuitable: 'neutral', // Pink floral - not red/gold but not black/white/blue
      coverage: {
        shoulders: 'partially-covered', // Short sleeves
        knees: 'covered', // Midi length
      },
      thaiDayColors: ['tuesday'], // Pink is lucky for Tuesday
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'a-line', // Flares at bottom
      silhouetteFit: 'relaxed', // Flowing midi dress
      silhouetteVolume: 'medium',
      visualWeightScore: 4,
      visualWeightLevel: 'light',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 0,
        heightEffect: 0,
        widthEffect: 0,
      },
      patternComplexity: 7, // Complex floral pattern
      textureType: 'matte',
      outfitRoleType: 'anchor',
      thaiProportionScore: 8,
      statementPotential: true,
      styleMoods: ['feminine', 'playful', 'cheerful', 'carefree'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 75, // Dress is complete outfit
      essentialPairings: ['footwear'],
      avoidPairings: ['heavy-boots', 'structured-blazers', 'dark-colors'],
      versatilityScore: 6,
      layerCompatibility: ['loose'],
      outfitCompleteness: 'standalone',
      formalityTolerance: 2,
      patternMixingSafe: false, // Already has pattern
      perfectMatchSkus: ['SH002'],
      commonPairings: [
        { sku: 'SH002', relationship: 'perfect-match', score: 90 },
        { sku: 'CG008', relationship: 'great-pair', score: 75 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 53.0, // ฿1,590 ÷ 30 wears (seasonal)
      costPerWearTier: 'good',
      investmentScore: 55,
      qualityTier: 3,
      timelessScore: 6, // Floral patterns cycle
      isInvestmentPiece: false,
      isCapsuleWardrobe: false,
      saleLikelihood: 'frequent',
      bestPurchaseTiming: 'End of summer sale',
      expectedWears: 30,
      valueTier: 'fair',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 72,
      popularityTier: 'popular',
      trendStatus: 'trending',
      trendConfidence: 75,
      celebrityAssociations: ['Taylor Swift', 'Florence Pugh', 'Dakota Johnson'],
      hashtagTrending: ['#floraldress', '#summerstyle', '#cottagecore'],
      reviewSentiment: 80,
      reviewCount: 89,
      recommendRate: 78,
      influencerFeatures: 18,
      salesVelocity: 'fast-selling',
      stockScarcity: 'limited',
    },
  },

  // CG006 - Blazer Jacket
  {
    sku: 'CG006',
    name: 'Blazer Jacket',
    brand: 'Central',
    price: 2890,
    imageUrl: '/central-blazer.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg006',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Charcoal', 'Beige'],
    category: 'Women',
    occasion: ['work', 'formal'],

    // === EXISTING ATTRIBUTES ===
    styleTags: ['corporate-chic', 'classic', 'minimalist'],
    seasonType: 'cool-season',
    formalityLevel: 7,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'outerwear',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blouse', 'Dress', 'Shirt'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['hourglass', 'rectangle', 'inverted-triangle', 'apple'],
    heightRecommendation: 'all',
    dressCode: ['business-formal', 'business-casual', 'smart-casual', 'cocktail'],
    eventTypes: ['office', 'interview', 'meeting', 'presentation', 'networking', 'dinner'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 15, max: 24 },
    weatherSuitability: ['cloudy', 'air-conditioned', 'cold'],
    stylePersonality: ['classic', 'dramatic', 'minimalist'],
    fashionMoods: ['powerful', 'authoritative', 'polished', 'sophisticated'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 9,
    dominantColors: ['#2F4F4F'],
    secondaryColors: [],
    textureDescription: 'Structured fabric with subtle texture, lined interior',
    visualWeight: 'medium',
    garmentDetails: {
      length: 'hip',
      closureStyle: 'button',
      sleeveLength: 'long',
    },
    sustainabilityScore: 4,
    sustainabilityTags: ['durable'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 28.9,
    stylingTips: [
      'Roll sleeves for smart-casual occasions',
      'Drape over shoulders for fashion-forward look',
      'Pair with matching pants for power suit',
      'Layer over dress for instant polish',
    ],
    avoidPairingWith: ['athletic-wear', 'flip-flops', 'distressed-items'],
    ageRange: { min: 22, max: 60 },
    targetLifestyle: ['professional', 'corporate', 'executive', 'entrepreneur'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'navy',
    colorSaturation: 'muted',
    colorBrightness: 'dark',
    aiMatchingTags: [
      'blazer', 'suit jacket', 'tailored blazer', 'navy blazer', 'work blazer',
      'professional jacket', 'structured blazer', 'office jacket', 'power blazer', 'formal jacket',
      'business attire', 'corporate wear', 'layering piece', 'classic blazer',
    ],
    semanticDescription: 'A polished tailored blazer in sophisticated navy with structured shoulders and a fitted silhouette. Features single-button closure, hip-length hem, and long sleeves with functional buttons. The structured polyester blend fabric holds its shape while remaining comfortable. This versatile power piece transforms any outfit - whether draped over a dress or paired with trousers for a commanding suit look.',
    alternativeNames: ['suit jacket', 'tailored jacket', 'power blazer', 'office blazer', 'structured jacket'],
    inspirationKeywords: ['power-dressing', 'boss-lady', 'corporate-chic', 'quiet-luxury', 'professional-style', 'girlboss'],
    pinterestAesthetics: ['blazer outfit inspo', 'workwear style', 'power suit', 'office chic', 'professional women'],
    styleReferences: ['Meghan Markle blazer looks', 'Blake Lively suiting', 'Zendaya power suits'],
    visualRole: 'statement',
    distinctiveFeatures: ['structured shoulders', 'single button closure', 'notched lapels', 'hip length', 'lined interior'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 5, // Heavy for Thai heat, great for AC
      acFriendly: true,
      monthSuitability: [7, 7, 6, 5, 6, 6, 6, 6, 6, 7, 8, 8], // Better in cool season
      templeAppropriate: true, // Formal, covered
      weddingAppropriate: 'any',
      funeralAppropriate: true, // Dark colors appropriate
      songkranSuitable: 'neither', // Too formal
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // Navy/charcoal is unsuitable (blue/dark)
      coverage: {
        shoulders: 'covered',
        knees: 'exposed', // Outerwear
      },
      thaiDayColors: ['saturday', 'thursday'], // Navy/charcoal colors
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line', // Structured, straight
      silhouetteFit: 'structured', // Tailored blazer with defined shape
      silhouetteVolume: 'medium',
      visualWeightScore: 7,
      visualWeightLevel: 'heavy',
      proportionRatio: 'top-heavy',
      proportionEffect: {
        torsoLengthening: 1,
        legLengthening: 0,
        heightEffect: 1,
        widthEffect: 1, // Structured shoulders add width
      },
      patternComplexity: 1,
      textureType: 'textured',
      outfitRoleType: 'anchor',
      thaiProportionScore: 7, // Can overwhelm petite frames
      statementPotential: true,
      styleMoods: ['powerful', 'authoritative', 'polished', 'sophisticated'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 92,
      essentialPairings: ['bottom', 'top'],
      avoidPairings: ['athletic-wear', 'flip-flops', 'distressed-items'],
      versatilityScore: 9,
      layerCompatibility: ['structured', 'fitted'],
      outfitCompleteness: 'needs-both',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['CG002', 'SF002', 'CG001'],
      commonPairings: [
        { sku: 'CG002', relationship: 'perfect-match', score: 98 },
        { sku: 'SF002', relationship: 'perfect-match', score: 96 },
        { sku: 'CG001', relationship: 'perfect-match', score: 95 },
        { sku: 'SH001', relationship: 'great-pair', score: 90 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 28.9, // ฿2,890 ÷ 100 wears
      costPerWearTier: 'excellent',
      investmentScore: 90,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'End of winter sale (Feb)',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 82,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 95,
      celebrityAssociations: ['Meghan Markle', 'Blake Lively', 'Zendaya'],
      hashtagTrending: ['#blazerstyle', '#powerdressing', '#workwear'],
      reviewSentiment: 85,
      reviewCount: 167,
      recommendRate: 91,
      influencerFeatures: 22,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // CG007 - Cotton T-Shirt
  {
    sku: 'CG007',
    name: 'Cotton T-Shirt',
    brand: 'Central',
    price: 490,
    imageUrl: '/central-tshirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna', 'Central Ladprao'],
    onlineUrl: 'https://central.co.th/product/cg007',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    category: 'Women',
    occasion: ['casual', 'weekend'],

    // === EXISTING ATTRIBUTES ===
    styleTags: ['casual', 'minimalist', 'modern'],
    seasonType: 'all-season',
    formalityLevel: 2,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'cotton',
    colorTone: 'neutral',
    aesthetic: 'clean-girl',
    colorPalette: 'monochromatic-black',
    outfitRole: 'top',
    brandTier: 'budget',
    pairingCategories: ['Jeans', 'Pants', 'Skirt', 'Sneakers'],
    layeringStyle: 'relaxed',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['all'],
    heightRecommendation: 'all',
    dressCode: ['casual', 'athleisure', 'streetwear'],
    eventTypes: ['weekend', 'errands', 'gym', 'travel', 'home'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 20, max: 32 },
    weatherSuitability: ['sunny', 'humid', 'air-conditioned'],
    stylePersonality: ['natural', 'minimalist', 'creative'],
    fashionMoods: ['relaxed', 'effortless', 'comfortable', 'laid-back'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 10,
    dominantColors: ['#FFFFFF', '#000000', '#808080', '#000080'],
    secondaryColors: [],
    textureDescription: 'Soft, breathable cotton jersey',
    visualWeight: 'light',
    garmentDetails: {
      necklineType: 'crew',
      sleeveLength: 'short',
    },
    sustainabilityScore: 6,
    sustainabilityTags: ['natural-fiber', 'easy-care'],
    investmentPiece: false,
    capsuleWardrobe: true,
    pricePerWear: 2.45, // Very high versatility
    stylingTips: [
      'Tuck into high-waisted jeans for polished casual',
      'Knot at waist for cropped effect',
      'Layer under blazer for smart-casual',
      'Add statement jewelry to elevate',
    ],
    avoidPairingWith: ['formal-skirts', 'evening-wear', 'silk-pieces'],
    ageRange: { min: 14, max: 70 },
    targetLifestyle: ['student', 'active', 'casual', 'minimalist'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'white',
    colorSaturation: 'muted',
    colorBrightness: 'light',
    aiMatchingTags: [
      't-shirt', 'basic tee', 'white tee', 'cotton top', 'crew neck',
      'casual top', 'everyday tee', 'wardrobe basic', 'simple top', 'layering tee',
      'classic t-shirt', 'essential top', 'plain tee', 'minimal top',
    ],
    semanticDescription: 'A perfectly simple cotton t-shirt in crisp white with a classic crew neckline and short sleeves. The soft, breathable cotton jersey provides all-day comfort with just the right amount of structure. This wardrobe essential is the ultimate blank canvas - equally at home under a blazer for polished casual or paired with jeans for effortless weekend style. The fit is relaxed but not oversized, skimming the body without clinging.',
    alternativeNames: ['basic tee', 'crew neck tee', 'cotton top', 'casual tee', 'everyday shirt'],
    inspirationKeywords: ['clean-girl', 'minimalist', 'capsule-wardrobe', 'effortless-chic', 'basics-done-right', 'understated'],
    pinterestAesthetics: ['white tee outfit', 'minimalist style', 'casual basics', 'simple outfit ideas', 'capsule wardrobe'],
    styleReferences: ['Jennifer Aniston casual', 'Carolyn Bessette-Kennedy minimalism', 'Sofia Richie basic luxe'],
    visualRole: 'supporting',
    distinctiveFeatures: ['crew neckline', 'short sleeves', 'relaxed fit', 'soft cotton jersey', 'no visible branding'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 9, // Excellent for Thai heat
      acFriendly: true,
      monthSuitability: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9], // Year-round
      templeAppropriate: false, // Too casual, sleeveless appearance
      weddingAppropriate: 'none',
      funeralAppropriate: false, // Too casual
      songkranSuitable: 'water-play', // Perfect for getting wet
      loyKrathongSuitable: false, // Too casual
      cnySuitable: 'unsuitable', // White/black/gray/navy - all inauspicious for CNY
      coverage: {
        shoulders: 'partially-covered', // Short sleeves
        knees: 'exposed',
      },
      thaiDayColors: ['monday', 'saturday'], // White/black options
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line',
      silhouetteFit: 'relaxed', // Casual tee
      silhouetteVolume: 'low',
      visualWeightScore: 3,
      visualWeightLevel: 'light',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 0,
        heightEffect: 0,
        widthEffect: 0,
      },
      patternComplexity: 1,
      textureType: 'matte',
      outfitRoleType: 'supporting',
      thaiProportionScore: 9,
      statementPotential: false,
      styleMoods: ['relaxed', 'effortless', 'comfortable', 'laid-back'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 98, // Ultimate versatility
      essentialPairings: ['bottom'],
      avoidPairings: ['formal-skirts', 'evening-wear', 'silk-pieces'],
      versatilityScore: 10,
      layerCompatibility: ['loose', 'fitted', 'structured'],
      outfitCompleteness: 'needs-bottom',
      formalityTolerance: 3, // Can dress up or down
      patternMixingSafe: true,
      perfectMatchSkus: ['CG004', 'CG002'],
      commonPairings: [
        { sku: 'CG004', relationship: 'perfect-match', score: 98 },
        { sku: 'CG002', relationship: 'great-pair', score: 80 },
        { sku: 'CG006', relationship: 'great-pair', score: 85 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 2.45, // ฿490 ÷ 200 wears
      costPerWearTier: 'excellent',
      investmentScore: 75,
      qualityTier: 3,
      timelessScore: 10,
      isInvestmentPiece: false,
      isCapsuleWardrobe: true,
      saleLikelihood: 'frequent',
      bestPurchaseTiming: 'Any time - basic staple',
      expectedWears: 200,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 88,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 99,
      celebrityAssociations: ['Jennifer Aniston', 'Carolyn Bessette-Kennedy', 'Sofia Richie'],
      hashtagTrending: ['#basictee', '#minimaliststyle', '#capsulewardrobe'],
      reviewSentiment: 85,
      reviewCount: 312,
      recommendRate: 94,
      influencerFeatures: 25,
      salesVelocity: 'fast-selling',
      stockScarcity: 'abundant',
    },
  },

  // CG008 - Leather Belt
  {
    sku: 'CG008',
    name: 'Leather Belt',
    brand: 'Central',
    price: 890,
    imageUrl: '/placeholder.svg',
    availability: 'in_stock',
    storeLocations: ['Central World', 'Central Bangna'],
    onlineUrl: 'https://central.co.th/product/cg008',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Brown'],
    category: 'Women',

    // === EXISTING ATTRIBUTES ===
    styleTags: ['classic', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 5,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'leather',
    colorTone: 'neutral',
    aesthetic: 'quiet-luxury',
    colorPalette: 'monochromatic-brown',
    outfitRole: 'accessory',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Jeans', 'Skirt', 'Dress'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['all'],
    heightRecommendation: 'all',
    dressCode: ['business-formal', 'business-casual', 'smart-casual', 'casual'],
    eventTypes: ['office', 'meeting', 'casual-dining', 'shopping'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 10, max: 35 },
    weatherSuitability: ['sunny', 'cloudy', 'air-conditioned', 'cold'],
    stylePersonality: ['classic', 'minimalist'],
    fashionMoods: ['polished', 'put-together', 'refined'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 9,
    dominantColors: ['#000000', '#8B4513'],
    secondaryColors: ['#C0C0C0'], // buckle
    textureDescription: 'Smooth genuine leather with subtle grain',
    visualWeight: 'light',
    garmentDetails: {
      width: 'medium',
    },
    sustainabilityScore: 5,
    sustainabilityTags: ['durable', 'natural-material'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 4.45,
    stylingTips: [
      'Match metal hardware with other accessories',
      'Use to cinch oversized shirts',
      'Choose width based on belt loops',
      'Black for formal, brown for casual',
    ],
    avoidPairingWith: ['athletic-wear', 'beachwear'],
    ageRange: { min: 18, max: 70 },
    targetLifestyle: ['professional', 'classic', 'minimalist'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'brown',
    colorSaturation: 'medium',
    colorBrightness: 'medium',
    aiMatchingTags: [
      'leather belt', 'classic belt', 'brown belt', 'dress belt', 'waist belt',
      'accessory belt', 'work belt', 'formal belt', 'simple belt', 'everyday belt',
      'wardrobe essential', 'styling belt', 'finishing touch', 'polishing accessory',
    ],
    semanticDescription: 'A timeless leather belt in rich brown with a classic silver buckle. The smooth genuine leather features a subtle grain texture that develops beautiful patina over time. Medium width makes it versatile enough for both dress pants and casual jeans. This essential accessory adds the finishing touch to any outfit, cinching the waist and creating a polished, put-together appearance.',
    alternativeNames: ['dress belt', 'waist belt', 'classic belt', 'leather strap', 'trouser belt'],
    inspirationKeywords: ['quiet-luxury', 'old-money', 'polished-details', 'finishing-touches', 'refined-accessories'],
    pinterestAesthetics: ['belt styling', 'accessory details', 'polished outfit', 'wardrobe essentials', 'classic accessories'],
    styleReferences: ['Amal Clooney accessories', 'Kate Middleton polished', 'Meghan Markle refined'],
    visualRole: 'accent',
    distinctiveFeatures: ['silver buckle', 'smooth leather', 'medium width', 'subtle grain texture', 'clean edges'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 8, // Leather holds up well
      acFriendly: true,
      monthSuitability: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], // Year-round accessory
      templeAppropriate: true, // Neutral accessory
      weddingAppropriate: 'any',
      funeralAppropriate: true, // Brown/black appropriate
      songkranSuitable: 'neither', // Leather and water don't mix
      loyKrathongSuitable: true,
      cnySuitable: 'neutral', // Brown is neutral (not red/gold, not black/white/blue)
      coverage: {
        shoulders: 'exposed',
        knees: 'exposed',
      },
      thaiDayColors: ['thursday', 'saturday'], // Brown/black options
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'i-line', // Linear
      silhouetteFit: 'fitted', // Accessory, close to body
      silhouetteVolume: 'low',
      visualWeightScore: 2,
      visualWeightLevel: 'light',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 0,
        heightEffect: 0,
        widthEffect: -1, // Cinches waist
      },
      patternComplexity: 1,
      textureType: 'matte',
      outfitRoleType: 'accent',
      thaiProportionScore: 9, // Helps define waist on petite frames
      statementPotential: false,
      styleMoods: ['polished', 'put-together', 'refined'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 90,
      essentialPairings: ['bottom'],
      avoidPairings: ['athletic-wear', 'beachwear'],
      versatilityScore: 9,
      layerCompatibility: ['fitted', 'structured', 'loose'],
      outfitCompleteness: 'needs-accessories',
      formalityTolerance: 4, // Works across many formalities
      patternMixingSafe: true,
      perfectMatchSkus: ['CG002', 'CG004', 'SF002'],
      commonPairings: [
        { sku: 'CG002', relationship: 'perfect-match', score: 92 },
        { sku: 'CG004', relationship: 'perfect-match', score: 90 },
        { sku: 'SF002', relationship: 'great-pair', score: 88 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 4.45, // ฿890 ÷ 200 wears
      costPerWearTier: 'excellent',
      investmentScore: 85,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'rare',
      bestPurchaseTiming: 'Any time - wardrobe staple',
      expectedWears: 200,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 68,
      popularityTier: 'popular',
      trendStatus: 'classic',
      trendConfidence: 95,
      celebrityAssociations: ['Amal Clooney', 'Kate Middleton', 'Meghan Markle'],
      hashtagTrending: ['#accessories', '#polishedlook', '#wardrobeessentials'],
      reviewSentiment: 80,
      reviewCount: 78,
      recommendRate: 88,
      influencerFeatures: 5,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // SF001 - SFERA Women Blazer Suit
  {
    sku: 'SF001',
    name: 'SFERA Women Blazer Suit',
    brand: 'SFERA',
    price: 995,
    imageUrl: '/central-blazer.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-blazer-suit-grcds54525030892',
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    visualDescription: "Women's black tailored blazer suit jacket, professional business attire",
    occasion: ['work', 'formal'],
    category: 'Women',
    subCategory: 'Blazer',

    // === EXISTING ATTRIBUTES ===
    styleTags: ['corporate-chic', 'classic', 'formal'],
    seasonType: 'all-season',
    formalityLevel: 8,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'outerwear',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blouse', 'Dress', 'Heels'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['hourglass', 'rectangle', 'inverted-triangle'],
    heightRecommendation: 'all',
    dressCode: ['business-formal', 'cocktail', 'black-tie'],
    eventTypes: ['interview', 'board-meeting', 'presentation', 'gala', 'formal-dinner'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 15, max: 24 },
    weatherSuitability: ['air-conditioned', 'cold'],
    stylePersonality: ['classic', 'dramatic'],
    fashionMoods: ['powerful', 'commanding', 'executive', 'sharp'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 8,
    dominantColors: ['#000000'],
    secondaryColors: [],
    textureDescription: 'Smooth, structured suiting fabric with subtle sheen',
    visualWeight: 'medium',
    garmentDetails: {
      length: 'hip',
      closureStyle: 'button',
      sleeveLength: 'long',
    },
    sustainabilityScore: 4,
    sustainabilityTags: ['durable'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 9.95,
    stylingTips: [
      'Pair with matching SFERA pants for power suit',
      'Add silk blouse for boardroom presence',
      'Wear open over dress for elegant layering',
      'Keep accessories minimal and refined',
    ],
    avoidPairingWith: ['casual-tees', 'sneakers', 'bohemian-prints'],
    ageRange: { min: 24, max: 55 },
    targetLifestyle: ['executive', 'corporate', 'professional'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'black',
    colorSaturation: 'muted',
    colorBrightness: 'dark',
    aiMatchingTags: [
      'black blazer', 'suit jacket', 'power blazer', 'formal blazer', 'executive jacket',
      'tailored blazer', 'women suit', 'business jacket', 'structured blazer', 'professional wear',
      'boardroom attire', 'corporate jacket', 'black suit', 'interview blazer',
    ],
    semanticDescription: 'A sophisticated black tailored blazer from SFERA designed for the modern professional woman. Features impeccable construction with structured shoulders, a single-button closure, and a fitted silhouette that commands attention. The premium polyester fabric offers a subtle sheen that elevates its executive presence. This is the cornerstone of a power wardrobe - perfect for boardrooms, presentations, and any occasion requiring authority and polish.',
    alternativeNames: ['suit jacket', 'power blazer', 'executive jacket', 'business blazer', 'formal jacket'],
    inspirationKeywords: ['power-dressing', 'boss-babe', 'corporate-power', 'executive-style', 'black-suit', 'boardroom-ready'],
    pinterestAesthetics: ['power suit women', 'black blazer outfit', 'executive style', 'professional women fashion', 'boss lady look'],
    styleReferences: ['Christine Lagarde power suits', 'Victoria Beckham tailoring', 'Cate Blanchett red carpet suits'],
    visualRole: 'statement',
    distinctiveFeatures: ['structured shoulders', 'single button closure', 'sharp lapels', 'fitted waist', 'hip length hem'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 5, // Heavy for Thai heat, great for AC
      acFriendly: true,
      monthSuitability: [7, 7, 5, 4, 5, 5, 5, 5, 5, 7, 8, 8],
      templeAppropriate: true,
      weddingAppropriate: 'any',
      funeralAppropriate: true, // Black is appropriate
      songkranSuitable: 'neither',
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // Black is inauspicious for CNY
      coverage: {
        shoulders: 'covered',
        knees: 'exposed',
      },
      thaiDayColors: ['saturday'], // Black for Saturday
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line',
      silhouetteFit: 'structured', // Tailored blazer
      silhouetteVolume: 'medium',
      visualWeightScore: 7,
      visualWeightLevel: 'heavy',
      proportionRatio: 'top-heavy',
      proportionEffect: {
        torsoLengthening: 1,
        legLengthening: 0,
        heightEffect: 1,
        widthEffect: 1,
      },
      patternComplexity: 1,
      textureType: 'textured',
      outfitRoleType: 'anchor',
      thaiProportionScore: 7,
      statementPotential: true,
      styleMoods: ['powerful', 'commanding', 'executive', 'sharp'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 95,
      essentialPairings: ['bottom', 'top'],
      avoidPairings: ['casual-tees', 'sneakers', 'bohemian-prints'],
      versatilityScore: 8,
      layerCompatibility: ['structured', 'fitted'],
      outfitCompleteness: 'needs-both',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['SF002', 'CG001', 'LO001'],
      commonPairings: [
        { sku: 'SF002', relationship: 'perfect-match', score: 100 },
        { sku: 'CG001', relationship: 'perfect-match', score: 95 },
        { sku: 'LO001', relationship: 'great-pair', score: 92 },
        { sku: 'SH001', relationship: 'perfect-match', score: 95 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 9.95, // ฿995 ÷ 100 wears
      costPerWearTier: 'excellent',
      investmentScore: 92,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'End of season sale',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 80,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 95,
      celebrityAssociations: ['Christine Lagarde', 'Victoria Beckham', 'Cate Blanchett'],
      hashtagTrending: ['#powersuit', '#executivestyle', '#bossladylook'],
      reviewSentiment: 85,
      reviewCount: 98,
      recommendRate: 92,
      influencerFeatures: 14,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // SF002 - SFERA Women Suit Pants
  {
    sku: 'SF002',
    name: 'SFERA Women Suit Pants',
    brand: 'SFERA',
    price: 1881,
    imageUrl: '/black-tailored-trousers.jpg',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-suit-pants-grcds2510220219',
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    visualDescription: "Women's black tailored suit trousers, formal office wear",
    occasion: ['work', 'formal'],
    category: 'Women',
    subCategory: 'Pants',

    // === EXISTING ATTRIBUTES ===
    styleTags: ['corporate-chic', 'classic', 'formal'],
    seasonType: 'all-season',
    formalityLevel: 8,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['Blazer', 'Blouse', 'Shirt', 'Heels', 'Pumps'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['hourglass', 'rectangle', 'inverted-triangle'],
    heightRecommendation: 'regular',
    dressCode: ['business-formal', 'cocktail'],
    eventTypes: ['interview', 'board-meeting', 'presentation', 'formal-dinner'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 16, max: 24 },
    weatherSuitability: ['air-conditioned', 'cold'],
    stylePersonality: ['classic', 'dramatic', 'minimalist'],
    fashionMoods: ['powerful', 'sleek', 'professional', 'sharp'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 8,
    dominantColors: ['#000000'],
    secondaryColors: [],
    textureDescription: 'Smooth tailored suiting fabric with clean lines',
    visualWeight: 'medium',
    garmentDetails: {
      hemLength: 'full',
      waistType: 'mid-rise',
    },
    sustainabilityScore: 4,
    sustainabilityTags: ['durable'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 18.81,
    stylingTips: [
      'Complete the suit with matching SFERA blazer',
      'Ensure proper tailoring for leg length',
      'Choose pointed heels to elongate silhouette',
      'Keep blouse tucked for clean lines',
    ],
    avoidPairingWith: ['casual-tops', 'flat-sandals', 'chunky-jewelry'],
    ageRange: { min: 24, max: 55 },
    targetLifestyle: ['executive', 'corporate', 'professional'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'black',
    colorSaturation: 'muted',
    colorBrightness: 'dark',
    aiMatchingTags: [
      'suit pants', 'black trousers', 'formal pants', 'dress pants', 'tailored trousers',
      'executive pants', 'work trousers', 'professional pants', 'straight leg pants', 'office wear',
      'power suit pants', 'sleek trousers', 'corporate bottoms', 'business pants',
    ],
    semanticDescription: 'Impeccably tailored black suit pants from SFERA that match the blazer for a complete power suit. Features a mid-rise waist, full-length straight leg, and smooth tailored construction. The premium fabric drapes beautifully while maintaining crisp lines that move from desk to dinner seamlessly. These trousers are the foundation of executive dressing - polished, professional, and perfectly proportioned.',
    alternativeNames: ['suit trousers', 'dress pants', 'formal trousers', 'tailored pants', 'work pants'],
    inspirationKeywords: ['power-suit', 'executive-style', 'corporate-chic', 'boardroom-ready', 'professional-polish'],
    pinterestAesthetics: ['suit pants women', 'work outfit inspo', 'professional style', 'black trousers outfit', 'power suit look'],
    styleReferences: ['Meghan Markle tailoring', 'Emma Watson formal', 'Anne Hathaway professional'],
    visualRole: 'supporting',
    distinctiveFeatures: ['straight leg cut', 'mid-rise waist', 'full length', 'hidden closure', 'pressed crease optional'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 6,
      acFriendly: true,
      monthSuitability: [8, 8, 7, 6, 7, 7, 7, 7, 7, 8, 8, 8],
      templeAppropriate: true,
      weddingAppropriate: 'any',
      funeralAppropriate: true,
      songkranSuitable: 'neither',
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // Black is inauspicious for CNY
      coverage: {
        shoulders: 'exposed',
        knees: 'covered',
      },
      thaiDayColors: ['saturday'],
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line',
      silhouetteFit: 'fitted', // Tailored suit pants
      silhouetteVolume: 'low',
      visualWeightScore: 5,
      visualWeightLevel: 'medium',
      proportionRatio: 'bottom-heavy',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 2,
        heightEffect: 1,
        widthEffect: 0,
      },
      patternComplexity: 1,
      textureType: 'matte',
      outfitRoleType: 'supporting',
      thaiProportionScore: 9,
      statementPotential: false,
      styleMoods: ['powerful', 'sleek', 'professional', 'sharp'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 95,
      essentialPairings: ['top'],
      avoidPairings: ['casual-tops', 'flat-sandals', 'chunky-jewelry'],
      versatilityScore: 8,
      layerCompatibility: ['structured', 'fitted'],
      outfitCompleteness: 'needs-top',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['SF001', 'CG001', 'LO001'],
      commonPairings: [
        { sku: 'SF001', relationship: 'perfect-match', score: 100 },
        { sku: 'CG001', relationship: 'perfect-match', score: 95 },
        { sku: 'LO001', relationship: 'great-pair', score: 92 },
        { sku: 'SH001', relationship: 'perfect-match', score: 95 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 18.81, // ฿1,881 ÷ 100 wears
      costPerWearTier: 'excellent',
      investmentScore: 88,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'End of season sale',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 76,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 95,
      celebrityAssociations: ['Meghan Markle', 'Emma Watson', 'Anne Hathaway'],
      hashtagTrending: ['#suitpants', '#powerlook', '#tailoredtrousers'],
      reviewSentiment: 82,
      reviewCount: 87,
      recommendRate: 90,
      influencerFeatures: 10,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // LO001 - SFERA White Blouse
  {
    sku: 'LO001',
    name: 'SFERA White Blouse',
    brand: 'SFERA',
    price: 1431,
    imageUrl: '/white-button-shirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-blouse-long-sleeves-schiffli-viscose-grcds2509250051',
    sizes: ['S', 'M', 'L'],
    colors: ['White'],
    visualDescription: "Women's white long-sleeve blouse with textured details, smart casual",
    occasion: ['work', 'casual'],
    category: 'Women',
    subCategory: 'Blouse',

    // === EXISTING ATTRIBUTES ===
    styleTags: ['elegant', 'classic', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 6,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'blend',
    colorTone: 'cool',
    aesthetic: 'clean-girl',
    colorPalette: 'monochromatic-beige',
    outfitRole: 'top',
    brandTier: 'mid-range',
    pairingCategories: ['Pants', 'Skirt', 'Blazer', 'Jeans'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['all'],
    heightRecommendation: 'all',
    dressCode: ['business-casual', 'smart-casual', 'business-formal'],
    eventTypes: ['office', 'lunch', 'meeting', 'dinner', 'date'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 18, max: 28 },
    weatherSuitability: ['sunny', 'cloudy', 'air-conditioned'],
    stylePersonality: ['classic', 'romantic', 'minimalist'],
    fashionMoods: ['elegant', 'refined', 'feminine', 'fresh'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 9,
    dominantColors: ['#FFFFFF'],
    secondaryColors: [],
    textureDescription: 'Soft viscose blend with delicate schiffli embroidery details',
    visualWeight: 'light',
    garmentDetails: {
      necklineType: 'collared',
      sleeveLength: 'long',
    },
    sustainabilityScore: 5,
    sustainabilityTags: ['breathable'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 14.31,
    stylingTips: [
      'Tuck into high-waisted skirt for feminine look',
      'Leave partially untucked for relaxed vibe',
      'Roll sleeves for smart-casual styling',
      'Add statement earrings for evening transition',
    ],
    avoidPairingWith: ['heavy-patterns', 'distressed-denim', 'sporty-items'],
    ageRange: { min: 20, max: 55 },
    targetLifestyle: ['professional', 'romantic', 'classic'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'white',
    colorSaturation: 'muted',
    colorBrightness: 'light',
    aiMatchingTags: [
      'white blouse', 'elegant blouse', 'schiffli blouse', 'textured top', 'feminine blouse',
      'long sleeve blouse', 'viscose blouse', 'work blouse', 'delicate top', 'embroidered blouse',
      'smart casual top', 'refined blouse', 'office blouse', 'dressy top',
    ],
    semanticDescription: 'An elegant white blouse from SFERA featuring delicate schiffli embroidery details that add subtle texture and dimension. The viscose blend fabric drapes beautifully with a soft hand feel. Features a classic collar, long sleeves, and a relaxed yet refined fit that bridges professional and feminine aesthetics. This sophisticated piece elevates any outfit with its intricate craftsmanship and timeless appeal.',
    alternativeNames: ['embroidered blouse', 'textured top', 'feminine shirt', 'dressy blouse', 'elegant top'],
    inspirationKeywords: ['quiet-luxury', 'soft-feminine', 'romantic-professional', 'elegant-details', 'refined-style'],
    pinterestAesthetics: ['white blouse outfit', 'feminine workwear', 'elegant tops', 'romantic style', 'office chic'],
    styleReferences: ['Grace Kelly elegance', 'Audrey Hepburn classic', 'Kate Middleton refined'],
    visualRole: 'supporting',
    distinctiveFeatures: ['schiffli embroidery', 'viscose fabric', 'collared neckline', 'long sleeves', 'subtle texture'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 8,
      acFriendly: true,
      monthSuitability: [9, 9, 8, 7, 8, 8, 8, 8, 8, 9, 9, 9],
      templeAppropriate: true, // Modest, covered
      weddingAppropriate: 'any',
      funeralAppropriate: false, // White not for funerals
      songkranSuitable: 'temple-morning',
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // White is inauspicious for CNY
      coverage: {
        shoulders: 'covered',
        knees: 'partially-covered',
      },
      thaiDayColors: ['monday', 'friday'],
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line',
      silhouetteFit: 'fluid', // Soft viscose blouse drapes
      silhouetteVolume: 'low',
      visualWeightScore: 3,
      visualWeightLevel: 'light',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 0,
        heightEffect: 1,
        widthEffect: 0,
      },
      patternComplexity: 3, // Subtle schiffli texture
      textureType: 'textured',
      outfitRoleType: 'supporting',
      thaiProportionScore: 8,
      statementPotential: false,
      styleMoods: ['elegant', 'refined', 'feminine', 'fresh'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 92,
      essentialPairings: ['bottom'],
      avoidPairings: ['heavy-patterns', 'distressed-denim', 'sporty-items'],
      versatilityScore: 9,
      layerCompatibility: ['fitted', 'loose'],
      outfitCompleteness: 'needs-bottom',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['CG002', 'SF002', 'SF003'],
      commonPairings: [
        { sku: 'CG002', relationship: 'perfect-match', score: 95 },
        { sku: 'SF002', relationship: 'perfect-match', score: 95 },
        { sku: 'SF003', relationship: 'great-pair', score: 88 },
        { sku: 'SH002', relationship: 'great-pair', score: 85 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 14.31, // ฿1,431 ÷ 100 wears
      costPerWearTier: 'excellent',
      investmentScore: 82,
      qualityTier: 4,
      timelessScore: 9,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'Mid-year sale',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 74,
      popularityTier: 'popular',
      trendStatus: 'classic',
      trendConfidence: 90,
      celebrityAssociations: ['Grace Kelly', 'Audrey Hepburn', 'Kate Middleton'],
      hashtagTrending: ['#whiteblouse', '#elegantworkwear', '#romanticstyle'],
      reviewSentiment: 80,
      reviewCount: 92,
      recommendRate: 88,
      influencerFeatures: 11,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // SF003 - SFERA Printed Midi Skirt
  {
    sku: 'SF003',
    name: 'SFERA Printed Midi Skirt',
    brand: 'SFERA',
    price: 945,
    imageUrl: '/sfera-midi-skirt.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://www.central.co.th/th/sfera-women-skirt-printed-midi-dark-brown-grcds54525030503',
    sizes: ['S', 'M', 'L'],
    colors: ['Dark Brown'],
    visualDescription: "Women's dark brown printed midi skirt, pleated flowy style, business casual",
    occasion: ['work', 'casual'],
    category: 'Women',
    subCategory: 'Skirt',

    // === EXISTING ATTRIBUTES ===
    styleTags: ['elegant', 'classic', 'bohemian'],
    seasonType: 'cool-season',
    formalityLevel: 5,
    fitType: 'regular',
    patternType: 'print',
    materialType: 'polyester',
    colorTone: 'warm',
    aesthetic: 'quiet-luxury',
    colorPalette: 'monochromatic-brown',
    outfitRole: 'bottom',
    brandTier: 'mid-range',
    pairingCategories: ['Blouse', 'Shirt', 'Blazer', 'Flats', 'Heels'],
    layeringStyle: 'relaxed',
    silhouetteType: 'wide-leg',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['hourglass', 'pear', 'apple'],
    heightRecommendation: 'regular',
    dressCode: ['business-casual', 'smart-casual'],
    eventTypes: ['office', 'lunch', 'gallery', 'afternoon-tea', 'casual-dinner'],
    timeOfDay: ['afternoon', 'evening'],
    temperatureRange: { min: 18, max: 26 },
    weatherSuitability: ['cloudy', 'air-conditioned'],
    stylePersonality: ['romantic', 'creative', 'natural'],
    fashionMoods: ['artistic', 'sophisticated', 'feminine', 'flowing'],
    trendStatus: 'classic',
    trendSeasons: ['2025-fall', '2025-winter'],
    versatilityScore: 7,
    dominantColors: ['#654321'],
    secondaryColors: ['#8B7355', '#D2B48C'],
    textureDescription: 'Lightweight polyester with fluid drape and pleated movement',
    visualWeight: 'medium',
    garmentDetails: {
      hemLength: 'midi',
      waistType: 'elastic',
    },
    sustainabilityScore: 4,
    sustainabilityTags: [],
    investmentPiece: false,
    capsuleWardrobe: false,
    pricePerWear: 23.63,
    stylingTips: [
      'Pair with fitted neutral top to balance volume',
      'Add a belt to define waistline',
      'Choose nude or brown heels to elongate legs',
      'Keep jewelry minimal with this print',
    ],
    avoidPairingWith: ['busy-prints', 'oversized-tops', 'heavy-boots'],
    ageRange: { min: 25, max: 50 },
    targetLifestyle: ['creative', 'artistic', 'professional'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'brown',
    colorSaturation: 'muted',
    colorBrightness: 'medium',
    aiMatchingTags: [
      'midi skirt', 'printed skirt', 'brown skirt', 'pleated skirt', 'flowy skirt',
      'patterned skirt', 'work skirt', 'elegant skirt', 'fall skirt', 'bohemian skirt',
      'artsy skirt', 'feminine bottom', 'a-line skirt', 'fluid skirt',
    ],
    semanticDescription: 'A sophisticated printed midi skirt in warm brown tones with subtle pattern detailing. The lightweight polyester fabric flows beautifully with gentle pleating that creates elegant movement. The midi length hits at a flattering point below the knee, while the elastic waist ensures comfortable all-day wear. This artistic piece bridges bohemian and professional aesthetics, perfect for creative workplaces or cultured outings.',
    alternativeNames: ['pleated midi', 'printed skirt', 'flowy skirt', 'patterned midi', 'fall skirt'],
    inspirationKeywords: ['quiet-luxury', 'artsy-professional', 'bohemian-chic', 'autumn-aesthetic', 'gallery-girl'],
    pinterestAesthetics: ['midi skirt outfit', 'fall fashion', 'brown outfit inspo', 'pleated skirt style', 'artistic fashion'],
    styleReferences: ['Alexa Chung artsy', 'Dakota Johnson boho', 'Sienna Miller eclectic'],
    visualRole: 'statement',
    distinctiveFeatures: ['subtle pattern', 'pleated detailing', 'midi length', 'elastic waist', 'flowing silhouette'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 7,
      acFriendly: true,
      monthSuitability: [8, 8, 7, 6, 7, 7, 7, 7, 7, 8, 9, 9], // Better in cool season
      templeAppropriate: false, // Too fashionable/casual
      weddingAppropriate: 'morning',
      funeralAppropriate: false, // Patterned not appropriate
      songkranSuitable: 'neither',
      loyKrathongSuitable: true, // Elegant for festival
      cnySuitable: 'neutral', // Dark brown is neutral (not red/gold, not black/white/blue)
      coverage: {
        shoulders: 'exposed',
        knees: 'covered',
      },
      thaiDayColors: ['thursday'], // Brown is lucky for Thursday
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'a-line',
      silhouetteFit: 'relaxed', // Flowing pleated skirt
      silhouetteVolume: 'medium',
      visualWeightScore: 5,
      visualWeightLevel: 'medium',
      proportionRatio: 'bottom-heavy',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 0,
        heightEffect: 0,
        widthEffect: 0,
      },
      patternComplexity: 6, // Visible pattern
      textureType: 'matte',
      outfitRoleType: 'anchor',
      thaiProportionScore: 7,
      statementPotential: true,
      styleMoods: ['artistic', 'sophisticated', 'feminine', 'flowing'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 75,
      essentialPairings: ['top'],
      avoidPairings: ['busy-prints', 'oversized-tops', 'heavy-boots'],
      versatilityScore: 7,
      layerCompatibility: ['fitted', 'loose'],
      outfitCompleteness: 'needs-top',
      formalityTolerance: 2,
      patternMixingSafe: false, // Already has pattern
      perfectMatchSkus: ['LO001', 'CG001'],
      commonPairings: [
        { sku: 'LO001', relationship: 'perfect-match', score: 90 },
        { sku: 'CG001', relationship: 'great-pair', score: 85 },
        { sku: 'SH002', relationship: 'perfect-match', score: 88 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 23.63, // ฿945 ÷ 40 wears
      costPerWearTier: 'excellent',
      investmentScore: 60,
      qualityTier: 3,
      timelessScore: 6, // Pattern may date
      isInvestmentPiece: false,
      isCapsuleWardrobe: false,
      saleLikelihood: 'frequent',
      bestPurchaseTiming: 'End of season sale',
      expectedWears: 40,
      valueTier: 'fair',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 65,
      popularityTier: 'popular',
      trendStatus: 'trending',
      trendConfidence: 75,
      celebrityAssociations: ['Alexa Chung', 'Dakota Johnson', 'Sienna Miller'],
      hashtagTrending: ['#midiskirt', '#bohochic', '#fallfashion'],
      reviewSentiment: 78,
      reviewCount: 54,
      recommendRate: 80,
      influencerFeatures: 9,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // SF004 - SFERA Navy Button Dress
  {
    sku: 'SF004',
    name: 'SFERA Navy Button Dress',
    brand: 'SFERA',
    price: 3290,
    imageUrl: '/sfera-navy-dress.png',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://central.co.th/sfera',
    sizes: ['S', 'M', 'L'],
    colors: ['Navy Blue'],
    visualDescription: "Women's navy blue structural sleeveless dress with gold buttons, professional look",
    occasion: ['work', 'formal'],
    category: 'Women',
    subCategory: 'Dress',

    // === EXISTING ATTRIBUTES ===
    styleTags: ['corporate-chic', 'elegant', 'classic'],
    seasonType: 'all-season',
    formalityLevel: 7,
    fitType: 'tailored',
    patternType: 'solid',
    materialType: 'polyester',
    colorTone: 'cool',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-blue',
    outfitRole: 'dress',
    brandTier: 'mid-range',
    pairingCategories: ['Heels', 'Pumps', 'Blazer', 'Belt', 'Bag'],
    layeringStyle: 'structured',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['hourglass', 'rectangle'],
    heightRecommendation: 'regular',
    dressCode: ['business-formal', 'cocktail', 'smart-casual'],
    eventTypes: ['office', 'presentation', 'client-meeting', 'reception', 'dinner'],
    timeOfDay: ['afternoon', 'evening'],
    temperatureRange: { min: 18, max: 26 },
    weatherSuitability: ['air-conditioned', 'cloudy'],
    stylePersonality: ['classic', 'dramatic'],
    fashionMoods: ['confident', 'polished', 'commanding', 'elegant'],
    trendStatus: 'classic',
    trendSeasons: [],
    versatilityScore: 7,
    dominantColors: ['#000080'],
    secondaryColors: ['#FFD700'], // gold buttons
    textureDescription: 'Structured tailored fabric with gold button details',
    visualWeight: 'medium',
    garmentDetails: {
      necklineType: 'boat',
      sleeveLength: 'sleeveless',
      hemLength: 'knee',
    },
    sustainabilityScore: 4,
    sustainabilityTags: ['durable'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 32.9,
    stylingTips: [
      'Layer with matching blazer for formal occasions',
      'Add gold jewelry to complement button details',
      'Choose nude pumps for leg-lengthening effect',
      'Keep bag structured and professional',
    ],
    avoidPairingWith: ['silver-jewelry', 'casual-flats', 'bohemian-accessories'],
    ageRange: { min: 25, max: 50 },
    targetLifestyle: ['executive', 'professional', 'corporate'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'navy',
    colorSaturation: 'muted',
    colorBrightness: 'dark',
    aiMatchingTags: [
      'navy dress', 'button dress', 'work dress', 'sheath dress', 'professional dress',
      'sleeveless dress', 'tailored dress', 'executive dress', 'corporate dress', 'gold button dress',
      'structural dress', 'elegant dress', 'office dress', 'power dress',
    ],
    semanticDescription: 'A striking navy blue sheath dress with sophisticated gold button detailing that commands attention. The sleeveless design and boat neckline create an elegant frame, while the tailored construction hugs the body in all the right places. The structured polyester fabric maintains a polished appearance from morning meetings to evening events. Gold buttons add a touch of refined luxury that elevates this piece beyond ordinary workwear.',
    alternativeNames: ['sheath dress', 'button dress', 'work dress', 'corporate dress', 'navy dress'],
    inspirationKeywords: ['power-dressing', 'corporate-elegance', 'nautical-chic', 'executive-style', 'sophisticated-classic'],
    pinterestAesthetics: ['work dress outfit', 'navy outfit inspo', 'professional dress', 'elegant workwear', 'gold button style'],
    styleReferences: ['Kate Middleton workwear', 'Meghan Markle professional', 'Amal Clooney elegant'],
    visualRole: 'statement',
    distinctiveFeatures: ['gold button detail', 'boat neckline', 'sleeveless cut', 'knee length', 'structured tailoring'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 7,
      acFriendly: true,
      monthSuitability: [8, 8, 7, 6, 7, 7, 7, 7, 7, 8, 8, 8],
      templeAppropriate: false, // Sleeveless
      weddingAppropriate: 'any',
      funeralAppropriate: false, // Navy not black
      songkranSuitable: 'neither',
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // Navy blue is inauspicious for CNY
      coverage: {
        shoulders: 'exposed', // Sleeveless
        knees: 'covered',
      },
      thaiDayColors: ['friday'], // Blue is lucky for Friday
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'h-line',
      silhouetteFit: 'structured', // Tailored sheath dress
      silhouetteVolume: 'medium',
      visualWeightScore: 6,
      visualWeightLevel: 'medium',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 1,
        heightEffect: 1,
        widthEffect: 0,
      },
      patternComplexity: 2, // Gold button accents
      textureType: 'textured',
      outfitRoleType: 'anchor',
      thaiProportionScore: 8,
      statementPotential: true,
      styleMoods: ['confident', 'polished', 'commanding', 'elegant'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 80,
      essentialPairings: ['footwear'],
      avoidPairings: ['silver-jewelry', 'casual-flats', 'bohemian-accessories'],
      versatilityScore: 7,
      layerCompatibility: ['structured'],
      outfitCompleteness: 'standalone',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['SH001', 'CG006'],
      commonPairings: [
        { sku: 'SH001', relationship: 'perfect-match', score: 95 },
        { sku: 'CG006', relationship: 'great-pair', score: 88 },
        { sku: 'CG008', relationship: 'great-pair', score: 80 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 32.9, // ฿3,290 ÷ 100 wears
      costPerWearTier: 'excellent',
      investmentScore: 85,
      qualityTier: 4,
      timelessScore: 9,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'End of season sale',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 72,
      popularityTier: 'popular',
      trendStatus: 'classic',
      trendConfidence: 88,
      celebrityAssociations: ['Kate Middleton', 'Meghan Markle', 'Amal Clooney'],
      hashtagTrending: ['#workdress', '#navyoutfit', '#professionaldress'],
      reviewSentiment: 82,
      reviewCount: 67,
      recommendRate: 86,
      influencerFeatures: 8,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // SH001 - Formal Heels
  {
    sku: 'SH001',
    name: 'Formal Heels',
    brand: 'SFERA',
    price: 2030,
    imageUrl: '/placeholder.svg?height=400&width=400&text=Formal+Heels',
    availability: 'in_stock',
    storeLocations: ['Central World'],
    onlineUrl: 'https://central.co.th/shoes',
    sizes: ['36', '37', '38'],
    colors: ['Black'],
    category: 'Women',
    subCategory: 'Heels',
    visualDescription: "Elegant black stiletto heels with pointed toe, formal women's footwear, 3-inch heel",
    occasion: ['work', 'formal'],

    // === EXISTING ATTRIBUTES ===
    styleTags: ['elegant', 'formal', 'classic'],
    seasonType: 'all-season',
    formalityLevel: 8,
    fitType: 'slim',
    patternType: 'solid',
    materialType: 'leather',
    colorTone: 'neutral',
    aesthetic: 'corporate-chic',
    colorPalette: 'monochromatic-black',
    outfitRole: 'footwear',
    brandTier: 'mid-range',
    pairingCategories: ['Dress', 'Pants', 'Skirt', 'Blazer'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['all'],
    heightRecommendation: 'petite',
    dressCode: ['business-formal', 'cocktail', 'black-tie'],
    eventTypes: ['interview', 'presentation', 'gala', 'formal-dinner', 'networking'],
    timeOfDay: ['afternoon', 'evening'],
    temperatureRange: { min: 15, max: 30 },
    weatherSuitability: ['air-conditioned', 'cloudy'],
    stylePersonality: ['classic', 'dramatic'],
    fashionMoods: ['powerful', 'sophisticated', 'elegant', 'commanding'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 8,
    dominantColors: ['#000000'],
    secondaryColors: [],
    textureDescription: 'Smooth leather with sleek finish',
    visualWeight: 'medium',
    garmentDetails: {
      heelHeight: 'high',
      toeShape: 'pointed',
      closureType: 'slip-on',
    },
    sustainabilityScore: 5,
    sustainabilityTags: ['durable', 'natural-material'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 20.3,
    stylingTips: [
      'Break in gradually before important events',
      'Match with structured bags for cohesive look',
      'Add cushioned insoles for comfort',
      'Perfect with tailored pants and suits',
    ],
    avoidPairingWith: ['casual-jeans', 'athleisure', 'bohemian-dresses'],
    ageRange: { min: 22, max: 55 },
    targetLifestyle: ['executive', 'professional', 'corporate'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'black',
    colorSaturation: 'muted',
    colorBrightness: 'dark',
    aiMatchingTags: [
      'black heels', 'stilettos', 'formal heels', 'pointed toe heels', 'dress shoes',
      'office heels', 'high heels', 'professional shoes', 'executive heels', 'power heels',
      'elegant heels', 'classic pumps', 'work shoes', 'statement heels',
    ],
    semanticDescription: 'Sophisticated black stiletto heels with a sharp pointed toe that elongates the leg line. The 3-inch heel provides the perfect balance of height and walkability for all-day professional wear. Smooth leather construction offers durability and a sleek finish that complements any formal outfit. These power heels are the finishing touch for suit ensembles, tailored dresses, and any occasion demanding presence and polish.',
    alternativeNames: ['stilettos', 'pointed toe pumps', 'dress heels', 'formal shoes', 'high heels'],
    inspirationKeywords: ['power-dressing', 'executive-style', 'classic-elegance', 'corporate-chic', 'red-carpet-ready'],
    pinterestAesthetics: ['black heels outfit', 'professional shoes', 'office footwear', 'elegant heels', 'power suit shoes'],
    styleReferences: ['Victoria Beckham heels', 'Meghan Markle footwear', 'Jennifer Lopez power heels'],
    visualRole: 'accent',
    distinctiveFeatures: ['pointed toe', 'stiletto heel', '3-inch height', 'smooth leather', 'sleek silhouette'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 7, // Leather holds up
      acFriendly: true,
      monthSuitability: [8, 8, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8],
      templeAppropriate: false, // Need to remove, pointed toe impractical
      weddingAppropriate: 'any',
      funeralAppropriate: true, // Black appropriate
      songkranSuitable: 'neither', // Keep dry
      loyKrathongSuitable: true,
      cnySuitable: 'unsuitable', // Black is inauspicious for CNY
      coverage: {
        shoulders: 'exposed',
        knees: 'exposed',
      },
      thaiDayColors: ['saturday'],
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'i-line', // Sleek, elongating
      silhouetteFit: 'fitted', // Slim-fit heels
      silhouetteVolume: 'low',
      visualWeightScore: 4,
      visualWeightLevel: 'medium',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 3, // Significant leg elongation
        heightEffect: 3, // Adds height
        widthEffect: 0,
      },
      patternComplexity: 1,
      textureType: 'matte',
      outfitRoleType: 'accent',
      thaiProportionScore: 10, // Excellent for petite frames
      statementPotential: false,
      styleMoods: ['powerful', 'sophisticated', 'elegant', 'commanding'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 90,
      essentialPairings: ['outfit'],
      avoidPairings: ['casual-jeans', 'athleisure', 'bohemian-dresses'],
      versatilityScore: 8,
      layerCompatibility: ['structured', 'fitted'],
      outfitCompleteness: 'needs-accessories',
      formalityTolerance: 2,
      patternMixingSafe: true,
      perfectMatchSkus: ['SF001', 'SF002', 'CG002', 'SF004'],
      commonPairings: [
        { sku: 'SF001', relationship: 'perfect-match', score: 95 },
        { sku: 'SF002', relationship: 'perfect-match', score: 95 },
        { sku: 'CG002', relationship: 'perfect-match', score: 92 },
        { sku: 'SF004', relationship: 'great-pair', score: 90 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 20.3, // ฿2,030 ÷ 100 wears
      costPerWearTier: 'excellent',
      investmentScore: 88,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'seasonal',
      bestPurchaseTiming: 'End of season sale',
      expectedWears: 100,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 78,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 95,
      celebrityAssociations: ['Victoria Beckham', 'Meghan Markle', 'Jennifer Lopez'],
      hashtagTrending: ['#blackheels', '#powerheels', '#stilettos'],
      reviewSentiment: 80,
      reviewCount: 112,
      recommendRate: 88,
      influencerFeatures: 15,
      salesVelocity: 'steady',
      stockScarcity: 'available',
    },
  },

  // SH002 - Classic Pumps
  {
    sku: 'SH002',
    name: 'Classic Pumps',
    brand: 'LOLITA',
    price: 2090,
    imageUrl: '/placeholder.svg?height=400&width=400&text=Classic+Pumps',
    availability: 'in_stock',
    storeLocations: ['Central Chidlom'],
    onlineUrl: 'https://central.co.th/shoes',
    sizes: ['36', '37', '38'],
    colors: ['Nude'],
    category: 'Women',
    subCategory: 'Pumps',
    visualDescription: "Classic nude pumps with rounded toe, versatile women's footwear, 2.5-inch heel",
    occasion: ['work', 'formal', 'casual'],

    // === EXISTING ATTRIBUTES ===
    styleTags: ['classic', 'elegant', 'minimalist'],
    seasonType: 'all-season',
    formalityLevel: 6,
    fitType: 'regular',
    patternType: 'solid',
    materialType: 'leather',
    colorTone: 'warm',
    aesthetic: 'quiet-luxury',
    colorPalette: 'neutral-earth-tones',
    outfitRole: 'footwear',
    brandTier: 'mid-range',
    pairingCategories: ['Dress', 'Pants', 'Skirt', 'Jeans', 'Blazer'],
    layeringStyle: 'fitted',
    silhouetteType: 'fitted',

    // === NEW ATTRIBUTES ===
    bodyTypeCompatibility: ['all'],
    heightRecommendation: 'all',
    dressCode: ['business-formal', 'business-casual', 'smart-casual', 'cocktail'],
    eventTypes: ['office', 'interview', 'wedding', 'date', 'dinner', 'brunch'],
    timeOfDay: ['all-day'],
    temperatureRange: { min: 15, max: 32 },
    weatherSuitability: ['sunny', 'cloudy', 'air-conditioned'],
    stylePersonality: ['classic', 'minimalist', 'romantic'],
    fashionMoods: ['elegant', 'refined', 'versatile', 'feminine'],
    trendStatus: 'timeless',
    trendSeasons: [],
    versatilityScore: 10,
    dominantColors: ['#E8D4C4'],
    secondaryColors: [],
    textureDescription: 'Smooth matte leather with comfortable silhouette',
    visualWeight: 'light',
    garmentDetails: {
      heelHeight: 'mid',
      toeShape: 'round',
      closureType: 'slip-on',
    },
    sustainabilityScore: 5,
    sustainabilityTags: ['durable', 'natural-material'],
    investmentPiece: true,
    capsuleWardrobe: true,
    pricePerWear: 10.45,
    stylingTips: [
      'Nude pumps elongate legs in any outfit',
      'Perfect transitional shoe from day to evening',
      'Works with every color in your wardrobe',
      'Choose a nude close to your skin tone',
    ],
    avoidPairingWith: ['athletic-wear', 'heavy-boots-outfits'],
    ageRange: { min: 20, max: 60 },
    targetLifestyle: ['professional', 'classic', 'romantic', 'minimalist'],

    // === AI MATCHING ATTRIBUTES ===
    colorFamily: 'beige',
    colorSaturation: 'muted',
    colorBrightness: 'light',
    aiMatchingTags: [
      'nude pumps', 'beige heels', 'classic pumps', 'round toe pumps', 'versatile heels',
      'office pumps', 'mid heels', 'comfortable heels', 'everyday heels', 'wardrobe staple',
      'neutral shoes', 'elegant pumps', 'timeless heels', 'work shoes',
    ],
    semanticDescription: 'Timeless nude pumps with a flattering round toe and comfortable mid-height heel. The warm beige tone acts as a second skin, creating an unbroken leg line that works with virtually any outfit. The 2.5-inch heel offers the perfect balance of elegance and comfort for all-day wear. Smooth matte leather construction ensures durability and sophistication. These are the ultimate wardrobe investment - versatile enough for the office, special occasions, and everything in between.',
    alternativeNames: ['beige pumps', 'nude heels', 'classic heels', 'round toe heels', 'everyday pumps'],
    inspirationKeywords: ['quiet-luxury', 'capsule-wardrobe', 'effortless-elegance', 'timeless-style', 'refined-classic'],
    pinterestAesthetics: ['nude pumps outfit', 'classic heels', 'versatile shoes', 'wardrobe essentials', 'elegant footwear'],
    styleReferences: ['Kate Middleton nude pumps', 'Meghan Markle footwear', 'Princess Diana classic style'],
    visualRole: 'neutral',
    distinctiveFeatures: ['round toe', 'mid-height heel', 'nude color', 'matte leather', '2.5-inch heel'],

    // === KB EXPANSION FEB 2026 - NEW ATTRIBUTE GROUPS ===

    // Thai Cultural Context (KB Sections 01, 02, 07, 12)
    thaiContext: {
      thaiClimateRating: 7,
      acFriendly: true,
      monthSuitability: [8, 8, 8, 7, 8, 8, 8, 8, 8, 8, 8, 8],
      templeAppropriate: true, // Neutral, easy to remove
      weddingAppropriate: 'any',
      funeralAppropriate: false, // Nude not appropriate
      songkranSuitable: 'neither',
      loyKrathongSuitable: true,
      cnySuitable: 'neutral', // Nude/beige is neutral (not red/gold, not black/white/blue)
      coverage: {
        shoulders: 'exposed',
        knees: 'exposed',
      },
      thaiDayColors: [], // Nude is universal neutral
    },

    // Visual Matching Intelligence (KB Section 15)
    visualMatching: {
      silhouetteShape: 'i-line',
      silhouetteFit: 'fitted', // Close-fitting pumps
      silhouetteVolume: 'low',
      visualWeightScore: 2,
      visualWeightLevel: 'light',
      proportionRatio: 'balanced',
      proportionEffect: {
        torsoLengthening: 0,
        legLengthening: 2, // Elongates legs
        heightEffect: 2,
        widthEffect: 0,
      },
      patternComplexity: 1,
      textureType: 'matte',
      outfitRoleType: 'supporting',
      thaiProportionScore: 10, // Perfect for petite frames
      statementPotential: false,
      styleMoods: ['elegant', 'refined', 'versatile', 'feminine'],
    },

    // Cross-Product Compatibility (KB Section 17)
    crossProductCompatibility: {
      pairingScore: 98, // Ultimate versatility
      essentialPairings: ['outfit'],
      avoidPairings: ['athletic-wear', 'heavy-boots-outfits'],
      versatilityScore: 10,
      layerCompatibility: ['fitted', 'loose', 'structured'],
      outfitCompleteness: 'needs-accessories',
      formalityTolerance: 4, // Works across many occasions
      patternMixingSafe: true,
      perfectMatchSkus: ['CG005', 'SF004', 'LO001', 'SF003'],
      commonPairings: [
        { sku: 'CG005', relationship: 'perfect-match', score: 95 },
        { sku: 'SF004', relationship: 'perfect-match', score: 92 },
        { sku: 'CG002', relationship: 'great-pair', score: 90 },
        { sku: 'SF003', relationship: 'great-pair', score: 88 },
      ],
    },

    // Price Intelligence (KB Section 13)
    priceIntelligence: {
      costPerWear: 10.45, // ฿2,090 ÷ 200 wears
      costPerWearTier: 'excellent',
      investmentScore: 95,
      qualityTier: 4,
      timelessScore: 10,
      isInvestmentPiece: true,
      isCapsuleWardrobe: true,
      saleLikelihood: 'rare',
      bestPurchaseTiming: 'Any time - ultimate staple',
      expectedWears: 200,
      valueTier: 'exceptional',
    },

    // Social Proof Signals (KB Special Topics)
    socialProof: {
      popularityScore: 85,
      popularityTier: 'hot',
      trendStatus: 'classic',
      trendConfidence: 98,
      celebrityAssociations: ['Kate Middleton', 'Meghan Markle', 'Princess Diana'],
      hashtagTrending: ['#nudepumps', '#classicheels', '#wardrobeessential'],
      reviewSentiment: 88,
      reviewCount: 189,
      recommendRate: 95,
      influencerFeatures: 20,
      salesVelocity: 'fast-selling',
      stockScarcity: 'available',
    },
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get products filtered by body type compatibility
 */
export function getProductsByBodyType(bodyType: BodyType): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter(
    (product) =>
      product.bodyTypeCompatibility.includes(bodyType) ||
      product.bodyTypeCompatibility.includes('all')
  )
}

/**
 * Get products suitable for a specific dress code
 */
export function getProductsByDressCode(dressCode: DressCode): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) =>
    product.dressCode.includes(dressCode)
  )
}

/**
 * Get products suitable for weather conditions
 */
export function getProductsByWeather(
  weather: WeatherCondition,
  temperature: number
): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter(
    (product) =>
      product.weatherSuitability.includes(weather) &&
      temperature >= product.temperatureRange.min &&
      temperature <= product.temperatureRange.max
  )
}

/**
 * Get products matching style personality
 */
export function getProductsByStylePersonality(
  personality: StylePersonality
): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) =>
    product.stylePersonality.includes(personality)
  )
}

/**
 * Get capsule wardrobe essentials
 */
export function getCapsuleWardrobeItems(): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) => product.capsuleWardrobe)
}

/**
 * Get investment pieces
 */
export function getInvestmentPieces(): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) => product.investmentPiece)
}

/**
 * Get products by trend status
 */
export function getProductsByTrendStatus(status: TrendStatus): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) => product.trendStatus === status)
}

/**
 * Get products suitable for specific event type
 */
export function getProductsByEventType(eventType: string): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) =>
    product.eventTypes.includes(eventType)
  )
}

/**
 * Get products within age range
 */
export function getProductsByAgeRange(age: number): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter(
    (product) => age >= product.ageRange.min && age <= product.ageRange.max
  )
}

/**
 * Calculate outfit compatibility score between two products
 * Returns a score from 0-100
 */
export function calculateCompatibilityScore(
  product1: EnhancedProductV3,
  product2: EnhancedProductV3
): number {
  let score = 0

  // Check if they can be paired (based on pairingCategories)
  const category1 = product1.subCategory || product1.outfitRole
  const category2 = product2.subCategory || product2.outfitRole
  if (
    product1.pairingCategories.some((cat) =>
      cat.toLowerCase().includes(category2.toLowerCase())
    ) ||
    product2.pairingCategories.some((cat) =>
      cat.toLowerCase().includes(category1.toLowerCase())
    )
  ) {
    score += 25
  }

  // Color harmony check
  if (product1.colorTone === product2.colorTone) {
    score += 15
  } else if (
    product1.colorTone === 'neutral' ||
    product2.colorTone === 'neutral'
  ) {
    score += 10
  }

  // Formality level compatibility (within 2 levels)
  const formalityDiff = Math.abs(
    product1.formalityLevel - product2.formalityLevel
  )
  if (formalityDiff <= 1) {
    score += 20
  } else if (formalityDiff <= 2) {
    score += 10
  }

  // Style tag overlap
  const sharedStyles = product1.styleTags.filter((tag) =>
    product2.styleTags.includes(tag)
  )
  score += Math.min(sharedStyles.length * 5, 15)

  // Aesthetic match
  if (product1.aesthetic === product2.aesthetic) {
    score += 15
  }

  // Style personality overlap
  const sharedPersonality = product1.stylePersonality.filter((p) =>
    product2.stylePersonality.includes(p)
  )
  score += Math.min(sharedPersonality.length * 5, 10)

  return Math.min(score, 100)
}

// ============================================================================
// AI MATCHING HELPER FUNCTIONS
// ============================================================================

/**
 * Search products by AI matching tags using text similarity
 * Returns products sorted by relevance score
 */
export function searchByAiTags(
  query: string,
  limit: number = 10
): { product: EnhancedProductV3; score: number }[] {
  const queryTerms = query.toLowerCase().split(/\s+/)

  const results = enhancedMockProductsV4.map((product) => {
    let score = 0

    // Check aiMatchingTags
    product.aiMatchingTags.forEach((tag) => {
      const tagLower = tag.toLowerCase()
      queryTerms.forEach((term) => {
        if (tagLower.includes(term)) score += 10
        if (tagLower === term) score += 5 // Exact match bonus
      })
    })

    // Check alternativeNames
    product.alternativeNames.forEach((name) => {
      const nameLower = name.toLowerCase()
      queryTerms.forEach((term) => {
        if (nameLower.includes(term)) score += 8
      })
    })

    // Check inspirationKeywords
    product.inspirationKeywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase()
      queryTerms.forEach((term) => {
        if (keywordLower.includes(term)) score += 5
      })
    })

    // Check semanticDescription
    const descLower = product.semanticDescription.toLowerCase()
    queryTerms.forEach((term) => {
      if (descLower.includes(term)) score += 2
    })

    return { product, score }
  })

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Find products matching Pinterest/inspiration aesthetic keywords
 */
export function searchByInspirationKeywords(
  keywords: string[]
): EnhancedProductV3[] {
  const keywordsLower = keywords.map((k) => k.toLowerCase())

  return enhancedMockProductsV4.filter((product) =>
    product.inspirationKeywords.some((ik) =>
      keywordsLower.some((kw) => ik.toLowerCase().includes(kw))
    ) ||
    product.pinterestAesthetics.some((pa) =>
      keywordsLower.some((kw) => pa.toLowerCase().includes(kw))
    )
  )
}

/**
 * Find products by color attributes for AI look matching
 */
export function searchByColorAttributes(
  colorFamily?: ColorFamily,
  saturation?: ColorSaturation,
  brightness?: ColorBrightness
): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) => {
    if (colorFamily && product.colorFamily !== colorFamily) return false
    if (saturation && product.colorSaturation !== saturation) return false
    if (brightness && product.colorBrightness !== brightness) return false
    return true
  })
}

/**
 * Match AI-generated look description to products
 * Uses semantic matching across multiple product attributes
 */
export function matchAiLookToProducts(
  lookDescription: string,
  options: {
    category?: string
    colorHint?: string
    styleHint?: string
    limit?: number
  } = {}
): { product: EnhancedProductV3; relevanceScore: number }[] {
  const { category, colorHint, styleHint, limit = 5 } = options
  const descLower = lookDescription.toLowerCase()

  const results = enhancedMockProductsV4.map((product) => {
    let relevanceScore = 0

    // Category filter
    if (category) {
      const productCategory = (product.subCategory || product.outfitRole).toLowerCase()
      if (!productCategory.includes(category.toLowerCase())) {
        return { product, relevanceScore: 0 }
      }
      relevanceScore += 20 // Category match bonus
    }

    // Color hint matching
    if (colorHint) {
      const colorHintLower = colorHint.toLowerCase()
      if (
        product.colorFamily.includes(colorHintLower) ||
        product.dominantColors.some((c) => c.toLowerCase().includes(colorHintLower))
      ) {
        relevanceScore += 15
      }
    }

    // Style hint matching
    if (styleHint) {
      const styleHintLower = styleHint.toLowerCase()
      if (
        product.inspirationKeywords.some((k) => k.toLowerCase().includes(styleHintLower)) ||
        product.pinterestAesthetics.some((p) => p.toLowerCase().includes(styleHintLower))
      ) {
        relevanceScore += 15
      }
    }

    // Semantic description matching
    const descWords = descLower.split(/\s+/).filter((w) => w.length > 3)
    descWords.forEach((word) => {
      if (product.semanticDescription.toLowerCase().includes(word)) {
        relevanceScore += 1
      }
      if (product.aiMatchingTags.some((tag) => tag.toLowerCase().includes(word))) {
        relevanceScore += 3
      }
    })

    // Distinctive features matching
    product.distinctiveFeatures.forEach((feature) => {
      if (descLower.includes(feature.toLowerCase())) {
        relevanceScore += 5
      }
    })

    return { product, relevanceScore }
  })

  return results
    .filter((r) => r.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}

/**
 * Get products by visual role for outfit composition
 */
export function getProductsByVisualRole(role: VisualRole): EnhancedProductV3[] {
  return enhancedMockProductsV4.filter((product) => product.visualRole === role)
}

/**
 * Build complete outfit from AI look description
 * Returns products for each outfit role (top, bottom, footwear, accessory)
 */
export function buildOutfitFromAiLook(
  lookDescription: string,
  stylePreferences?: {
    aesthetic?: string
    colorPalette?: string
    formalityLevel?: number
  }
): {
  top?: EnhancedProductV3
  bottom?: EnhancedProductV3
  dress?: EnhancedProductV3
  footwear?: EnhancedProductV3
  accessory?: EnhancedProductV3
  outerwear?: EnhancedProductV3
} {
  const outfit: {
    top?: EnhancedProductV3
    bottom?: EnhancedProductV3
    dress?: EnhancedProductV3
    footwear?: EnhancedProductV3
    accessory?: EnhancedProductV3
    outerwear?: EnhancedProductV3
  } = {}

  // Determine if this is a dress-based or separates-based outfit
  const isDressLook = /dress|gown|frock|romper/i.test(lookDescription)

  if (isDressLook) {
    // Find matching dress
    const dressMatches = matchAiLookToProducts(lookDescription, {
      category: 'dress',
      styleHint: stylePreferences?.aesthetic,
      limit: 1,
    })
    if (dressMatches.length > 0) {
      outfit.dress = dressMatches[0].product
    }
  } else {
    // Find top
    const topMatches = matchAiLookToProducts(lookDescription, {
      category: 'top',
      styleHint: stylePreferences?.aesthetic,
      limit: 1,
    })
    if (topMatches.length > 0) {
      outfit.top = topMatches[0].product
    }

    // Find bottom
    const bottomMatches = matchAiLookToProducts(lookDescription, {
      category: 'bottom',
      styleHint: stylePreferences?.aesthetic,
      limit: 1,
    })
    if (bottomMatches.length === 0) {
      // Try pants or skirt specifically
      const pantsMatches = matchAiLookToProducts(lookDescription, {
        category: 'pants',
        limit: 1,
      })
      const skirtMatches = matchAiLookToProducts(lookDescription, {
        category: 'skirt',
        limit: 1,
      })
      outfit.bottom = pantsMatches[0]?.product || skirtMatches[0]?.product
    } else {
      outfit.bottom = bottomMatches[0].product
    }
  }

  // Find footwear
  const footwearMatches = matchAiLookToProducts(lookDescription, {
    category: 'footwear',
    styleHint: stylePreferences?.aesthetic,
    limit: 1,
  })
  if (footwearMatches.length === 0) {
    // Try heels or pumps specifically
    const heelMatches = enhancedMockProductsV4.filter(
      (p) => p.outfitRole === 'footwear'
    )
    if (heelMatches.length > 0) {
      outfit.footwear = heelMatches[0]
    }
  } else {
    outfit.footwear = footwearMatches[0].product
  }

  // Find accessory (optional)
  const accessoryMatches = matchAiLookToProducts(lookDescription, {
    category: 'accessory',
    limit: 1,
  })
  if (accessoryMatches.length > 0) {
    outfit.accessory = accessoryMatches[0].product
  }

  // Find outerwear if mentioned
  if (/blazer|jacket|coat|cardigan/i.test(lookDescription)) {
    const outerwearMatches = matchAiLookToProducts(lookDescription, {
      category: 'outerwear',
      limit: 1,
    })
    if (outerwearMatches.length === 0) {
      const blazerMatches = enhancedMockProductsV4.filter(
        (p) => p.outfitRole === 'outerwear'
      )
      if (blazerMatches.length > 0) {
        outfit.outerwear = blazerMatches[0]
      }
    } else {
      outfit.outerwear = outerwearMatches[0].product
    }
  }

  return outfit
}
