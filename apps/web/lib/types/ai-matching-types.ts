/**
 * AI Matching Types
 * KB Expansion Feb 2026
 *
 * Implements types from Knowledge Base sections:
 * - Section 15: Visual Matching Intelligence
 * - Section 16: Outfit Composition Rules
 * - Section 17: Cross-Product Compatibility
 * - Section 13: Price Intelligence
 * - Special Topics: Social Proof Signals
 */

import type {
  SilhouetteShape,
  SilhouetteFit,
  SilhouetteVolume,
  VisualWeightLevel,
  ProportionRatio,
  TextureType,
  OutfitRoleType,
  ProductRelationship,
  TrendLifecycle,
  PopularityTier,
  CostPerWearTier,
  SaleLikelihood,
  OutfitCompleteness,
  LayerCompatibility,
} from './enums'

// ============================================================================
// VISUAL MATCHING INTELLIGENCE (KB Section 15)
// ============================================================================

/**
 * Proportion Effect
 * How a garment affects perceived body proportions
 */
export interface ProportionEffect {
  /** Effect on perceived torso length (-5 to +5) */
  torsoLengthening: number
  /** Effect on perceived leg length (-5 to +5) */
  legLengthening: number
  /** Effect on perceived height (-5 to +5) */
  heightEffect: number
  /** Effect on perceived width (-5 to +5) */
  widthEffect: number
}

/**
 * Visual Matching Attributes Interface
 * For AI-powered image-to-product matching
 * Reference: KB Section 15 - Visual Matching Intelligence
 */
export interface VisualMatchingAttributes {
  /** Overall silhouette shape (A-line, H-line, etc.) */
  silhouetteShape: SilhouetteShape

  /** Garment fit classification (KB Section 15 - Fit Classifications) */
  silhouetteFit?: SilhouetteFit

  /** Volume level derived from fit (KB Section 15 - Volume Level) */
  silhouetteVolume?: SilhouetteVolume

  /** Visual weight score (1-10, 1=airy, 10=heavy) */
  visualWeightScore: number

  /** Visual weight category */
  visualWeightLevel: VisualWeightLevel

  /** Where visual weight is concentrated */
  proportionRatio: ProportionRatio

  /** How garment affects body proportions */
  proportionEffect: ProportionEffect

  /** Pattern complexity score (1-10, 1=solid, 10=complex) */
  patternComplexity: number

  /** Surface texture type */
  textureType: TextureType

  /** Role in outfit composition */
  outfitRoleType: OutfitRoleType

  /** Suitability for Thai body proportions (1-10) */
  thaiProportionScore: number

  /** Can serve as statement piece */
  statementPotential: boolean

  /** Mood/vibe keywords */
  styleMoods: string[]
}

// ============================================================================
// CROSS-PRODUCT COMPATIBILITY (KB Section 17)
// ============================================================================

/**
 * Cross-Product Compatibility Interface
 * For product-to-product pairing recommendations
 * Reference: KB Section 17 - Cross-Product Compatibility Matrix
 */
export interface CrossProductCompatibility {
  /** Overall pairing compatibility score (0-100) */
  pairingScore: number

  /** Required companion categories (e.g., 'bottom' for tops) */
  essentialPairings: string[]

  /** Categories/styles to avoid pairing with */
  avoidPairings: string[]

  /** Versatility score (1-10, how many outfits possible) */
  versatilityScore: number

  /** Compatible layering styles */
  layerCompatibility: LayerCompatibility[]

  /** What's needed to complete outfit */
  outfitCompleteness: OutfitCompleteness

  /** Formality tolerance for pairing (±range) */
  formalityTolerance: number

  /** Safe to mix with patterns */
  patternMixingSafe: boolean

  /** SKUs of perfect match products */
  perfectMatchSkus: string[]

  /** Relationship type with commonly paired items */
  commonPairings?: Array<{
    sku: string
    relationship: ProductRelationship
    score: number
  }>
}

// ============================================================================
// PRICE INTELLIGENCE (KB Section 13)
// ============================================================================

/**
 * Price Intelligence Interface
 * For value-based shopping recommendations
 * Reference: KB Section 13 - Price Intelligence
 */
export interface PriceIntelligence {
  /** Calculated cost per wear (price ÷ expected wears) */
  costPerWear: number

  /** Cost per wear tier classification */
  costPerWearTier: CostPerWearTier

  /** Investment value score (0-100) */
  investmentScore: number

  /** Quality tier (1-5) */
  qualityTier: 1 | 2 | 3 | 4 | 5

  /** Timelessness score (1-10, 10=never goes out of style) */
  timelessScore: number

  /** Qualifies as investment piece */
  isInvestmentPiece: boolean

  /** Suitable for capsule wardrobe */
  isCapsuleWardrobe: boolean

  /** How often this goes on sale */
  saleLikelihood: SaleLikelihood

  /** Best time to purchase */
  bestPurchaseTiming: string

  /** Expected number of wears */
  expectedWears?: number

  /** Value tier (quality relative to price) */
  valueTier?: 'exceptional' | 'fair' | 'premium' | 'overpriced'
}

// ============================================================================
// SOCIAL PROOF SIGNALS (Special Topics)
// ============================================================================

/**
 * Influencer Feature
 * Tracking influencer/celebrity wearing this item
 */
export interface InfluencerFeature {
  name: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'celebrity'
  date?: string
  url?: string
}

/**
 * Social Proof Signals Interface
 * For popularity and trend-based recommendations
 * Reference: KB Special Topics - Social Proof Signals
 */
export interface SocialProofSignals {
  /** Overall popularity score (0-100) */
  popularityScore: number

  /** Popularity tier classification */
  popularityTier: PopularityTier

  /** Current trend lifecycle stage */
  trendStatus: TrendLifecycle

  /** Confidence in trend assessment (0-100) */
  trendConfidence: number

  /** Celebrity/influencer associations */
  celebrityAssociations: string[]

  /** Trending hashtags associated with this item */
  hashtagTrending: string[]

  /** Average review sentiment (0-100, 100=positive) */
  reviewSentiment: number

  /** Total review count */
  reviewCount: number

  /** Recommendation rate (% who would recommend) */
  recommendRate: number

  /** Number of influencer features */
  influencerFeatures: number

  /** Detailed influencer features */
  influencerDetails?: InfluencerFeature[]

  /** Sales velocity indicator */
  salesVelocity?: 'fast-selling' | 'steady' | 'slow'

  /** Stock scarcity signal */
  stockScarcity?: 'limited' | 'available' | 'abundant'
}

// ============================================================================
// OUTFIT COMPOSITION (KB Section 16)
// ============================================================================

/**
 * Outfit Formula Component
 * Single piece in an outfit formula
 */
export interface OutfitFormulaComponent {
  role: OutfitRoleType
  category: string
  required: boolean
  alternatives?: string[]
}

/**
 * Outfit Formula
 * Complete look formula for specific occasions
 * Reference: KB Section 16 - Outfit Composition Rules
 */
export interface OutfitFormula {
  name: string
  occasion: string
  formalityRange: [number, number]
  components: OutfitFormulaComponent[]
  colorRules?: string[]
  budgetAllocation?: Record<string, number>
  thaiClimateNotes?: string
}

/**
 * Anchor Piece Rules
 * Rules for the main/focal piece of an outfit
 */
export interface AnchorPieceRules {
  /** Only one anchor per outfit */
  maxAnchorPieces: 1
  /** Only one statement per outfit */
  maxStatementPieces: 1
  /** Categories that can serve as anchor */
  anchorCategories: string[]
}

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

/**
 * Complete AI Matching Profile
 * All AI matching attributes for a product
 */
export interface AIMatchingProfile {
  visualMatching: VisualMatchingAttributes
  crossProductCompatibility: CrossProductCompatibility
  priceIntelligence: PriceIntelligence
  socialProof: SocialProofSignals
}

/**
 * Product Match Result
 * Result of matching a look inspiration to products
 */
export interface ProductMatchResult {
  productSku: string
  matchScore: number
  matchReasons: string[]
  relationship: ProductRelationship
  visualSimilarity: number
  styleSimilarity: number
  pricingMatch: boolean
}

/**
 * Look-to-Product Match Request
 * Input for AI look matching
 */
export interface LookMatchRequest {
  lookDescription: string
  occasion?: string
  budget?: { min: number; max: number }
  preferredBrands?: string[]
  excludeBrands?: string[]
  mustHaveFeatures?: string[]
  avoidFeatures?: string[]
}
