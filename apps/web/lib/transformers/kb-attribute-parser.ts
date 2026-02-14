/**
 * KB Attribute Parser
 * Parses KB expansion attributes from product_master_v1.json
 *
 * chore-kb002: Server loader KB support
 */

import type { ThaiClimateContext, CoverageRequirements } from '../types/thai-context-types'
import type {
  VisualMatchingAttributes,
  CrossProductCompatibility,
  PriceIntelligence,
  SocialProofSignals,
  ProportionEffect,
} from '../types/ai-matching-types'
import type { KBExpansionAttributes, ProductMasterV1Item } from '../types/kb-expansion-types'

// ============================================================================
// ENUM VALIDATION SETS (matching enums.ts)
// ============================================================================

const WEDDING_APPROPRIATE_VALUES = new Set(['any', 'morning', 'evening', 'outdoor', 'indoor', 'none'])
const SONGKRAN_SUITABLE_VALUES = new Set(['temple-morning', 'water-play', 'both', 'neither'])
const CNY_SUITABLE_VALUES = new Set(['suitable', 'unsuitable', 'neutral'])
const COVERAGE_TYPE_VALUES = new Set(['covered', 'partially-covered', 'exposed'])

const SILHOUETTE_SHAPE_VALUES = new Set([
  'a-line', 'h-line', 'x-line', 'i-line', 'o-line',
  'fitted', 'oversized', 'boxy', 'relaxed', 'structured'
])
const SILHOUETTE_FIT_VALUES = new Set([
  'fitted', 'semi-fitted', 'relaxed', 'oversized', 'boxy', 'structured', 'fluid'
])
const SILHOUETTE_VOLUME_VALUES = new Set(['low', 'medium', 'high'])
const VISUAL_WEIGHT_LEVEL_VALUES = new Set(['light', 'medium', 'heavy'])
const PROPORTION_RATIO_VALUES = new Set(['top-heavy', 'balanced', 'bottom-heavy'])
const TEXTURE_TYPE_VALUES = new Set(['matte', 'sheen', 'glossy', 'textured', 'mixed'])
const OUTFIT_ROLE_TYPE_VALUES = new Set(['anchor', 'supporting', 'accent', 'statement'])

const LAYER_COMPATIBILITY_VALUES = new Set(['fitted', 'structured', 'loose'])
const OUTFIT_COMPLETENESS_VALUES = new Set([
  'standalone', 'needs-top', 'needs-bottom', 'needs-both', 'needs-layer', 'needs-accessories'
])

const COST_PER_WEAR_TIER_VALUES = new Set(['excellent', 'good', 'moderate', 'poor'])
const SALE_LIKELIHOOD_VALUES = new Set(['rare', 'seasonal', 'frequent'])
const VALUE_TIER_VALUES = new Set(['exceptional', 'fair', 'premium', 'overpriced'])

const POPULARITY_TIER_VALUES = new Set(['viral', 'hot', 'popular', 'steady', 'niche', 'new', 'emerging'])
const TREND_STATUS_VALUES = new Set([
  'emerging', 'trending', 'peak', 'classic', 'timeless', 'declining', 'revival'
])

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parse Thai Context from JSON
 */
export function parseThaiContext(json: any): ThaiClimateContext | null {
  if (!json || typeof json !== 'object') return null

  try {
    const coverage: CoverageRequirements = {
      shoulders: json.coverage?.shoulders || 'exposed',
      knees: json.coverage?.knees || 'exposed',
    }

    return {
      thaiClimateRating: typeof json.thaiClimateRating === 'number' ? json.thaiClimateRating : 5,
      acFriendly: typeof json.acFriendly === 'boolean' ? json.acFriendly : true,
      monthSuitability: Array.isArray(json.monthSuitability) && json.monthSuitability.length === 12
        ? json.monthSuitability
        : [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      templeAppropriate: typeof json.templeAppropriate === 'boolean' ? json.templeAppropriate : false,
      weddingAppropriate: json.weddingAppropriate || 'none',
      funeralAppropriate: typeof json.funeralAppropriate === 'boolean' ? json.funeralAppropriate : false,
      songkranSuitable: json.songkranSuitable || 'neither',
      loyKrathongSuitable: typeof json.loyKrathongSuitable === 'boolean' ? json.loyKrathongSuitable : false,
      cnySuitable: json.cnySuitable || 'neutral',
      coverage,
      thaiDayColors: Array.isArray(json.thaiDayColors) ? json.thaiDayColors : [],
    }
  } catch {
    return null
  }
}

/**
 * Parse Visual Matching from JSON
 */
export function parseVisualMatching(json: any): VisualMatchingAttributes | null {
  if (!json || typeof json !== 'object') return null

  try {
    const proportionEffect: ProportionEffect = {
      torsoLengthening: json.proportionEffect?.torsoLengthening ?? 0,
      legLengthening: json.proportionEffect?.legLengthening ?? 0,
      heightEffect: json.proportionEffect?.heightEffect ?? 0,
      widthEffect: json.proportionEffect?.widthEffect ?? 0,
    }

    return {
      silhouetteShape: json.silhouetteShape || 'h-line',
      silhouetteFit: json.silhouetteFit || 'semi-fitted',
      silhouetteVolume: json.silhouetteVolume || 'medium',
      visualWeightScore: typeof json.visualWeightScore === 'number' ? json.visualWeightScore : 5,
      visualWeightLevel: json.visualWeightLevel || 'medium',
      proportionRatio: json.proportionRatio || 'balanced',
      proportionEffect,
      patternComplexity: typeof json.patternComplexity === 'number' ? json.patternComplexity : 1,
      textureType: json.textureType || 'matte',
      outfitRoleType: json.outfitRoleType || 'supporting',
      thaiProportionScore: typeof json.thaiProportionScore === 'number' ? json.thaiProportionScore : 5,
      statementPotential: typeof json.statementPotential === 'boolean' ? json.statementPotential : false,
      styleMoods: Array.isArray(json.styleMoods) ? json.styleMoods : [],
    }
  } catch {
    return null
  }
}

/**
 * Parse Cross-Product Compatibility from JSON
 */
export function parseCrossProductCompatibility(json: any): CrossProductCompatibility | null {
  if (!json || typeof json !== 'object') return null

  try {
    return {
      pairingScore: typeof json.pairingScore === 'number' ? json.pairingScore : 50,
      essentialPairings: Array.isArray(json.essentialPairings) ? json.essentialPairings : [],
      avoidPairings: Array.isArray(json.avoidPairings) ? json.avoidPairings : [],
      versatilityScore: typeof json.versatilityScore === 'number' ? json.versatilityScore : 5,
      layerCompatibility: Array.isArray(json.layerCompatibility) ? json.layerCompatibility : [],
      outfitCompleteness: json.outfitCompleteness || 'needs-bottom',
      formalityTolerance: typeof json.formalityTolerance === 'number' ? json.formalityTolerance : 2,
      patternMixingSafe: typeof json.patternMixingSafe === 'boolean' ? json.patternMixingSafe : true,
      perfectMatchSkus: Array.isArray(json.perfectMatchSkus) ? json.perfectMatchSkus : [],
      commonPairings: Array.isArray(json.commonPairings) ? json.commonPairings : [],
    }
  } catch {
    return null
  }
}

/**
 * Parse Price Intelligence from JSON
 */
export function parsePriceIntelligence(json: any): PriceIntelligence | null {
  if (!json || typeof json !== 'object') return null

  try {
    return {
      costPerWear: typeof json.costPerWear === 'number' ? json.costPerWear : 0,
      costPerWearTier: json.costPerWearTier || 'moderate',
      investmentScore: typeof json.investmentScore === 'number' ? json.investmentScore : 50,
      qualityTier: typeof json.qualityTier === 'number' ? (json.qualityTier as 1 | 2 | 3 | 4 | 5) : 3,
      timelessScore: typeof json.timelessScore === 'number' ? json.timelessScore : 5,
      isInvestmentPiece: typeof json.isInvestmentPiece === 'boolean' ? json.isInvestmentPiece : false,
      isCapsuleWardrobe: typeof json.isCapsuleWardrobe === 'boolean' ? json.isCapsuleWardrobe : false,
      saleLikelihood: json.saleLikelihood || 'seasonal',
      bestPurchaseTiming: json.bestPurchaseTiming || 'anytime',
      expectedWears: typeof json.expectedWears === 'number' ? json.expectedWears : 50,
      valueTier: json.valueTier || 'fair',
    }
  } catch {
    return null
  }
}

/**
 * Parse Social Proof from JSON
 */
export function parseSocialProof(json: any): SocialProofSignals | null {
  if (!json || typeof json !== 'object') return null

  try {
    return {
      popularityScore: typeof json.popularityScore === 'number' ? json.popularityScore : 50,
      popularityTier: json.popularityTier || 'steady',
      trendStatus: json.trendStatus || 'classic',
      trendConfidence: typeof json.trendConfidence === 'number' ? json.trendConfidence : 50,
      celebrityAssociations: Array.isArray(json.celebrityAssociations) ? json.celebrityAssociations : [],
      hashtagTrending: Array.isArray(json.hashtagTrending) ? json.hashtagTrending : [],
      reviewSentiment: typeof json.reviewSentiment === 'number' ? json.reviewSentiment : 70,
      reviewCount: typeof json.reviewCount === 'number' ? json.reviewCount : 0,
      recommendRate: typeof json.recommendRate === 'number' ? json.recommendRate : 70,
      influencerFeatures: typeof json.influencerFeatures === 'number' ? json.influencerFeatures : 0,
    }
  } catch {
    return null
  }
}

/**
 * Parse all KB expansion attributes from a product JSON
 */
export function parseKBAttributes(productJson: ProductMasterV1Item): KBExpansionAttributes | null {
  // Check if product has any KB groups
  if (
    !productJson.thaiContext &&
    !productJson.visualMatching &&
    !productJson.crossProductCompatibility &&
    !productJson.priceIntelligence &&
    !productJson.socialProof
  ) {
    return null
  }

  const thaiContext = parseThaiContext(productJson.thaiContext)
  const visualMatching = parseVisualMatching(productJson.visualMatching)
  const crossProductCompatibility = parseCrossProductCompatibility(productJson.crossProductCompatibility)
  const priceIntelligence = parsePriceIntelligence(productJson.priceIntelligence)
  const socialProof = parseSocialProof(productJson.socialProof)

  // Return null if none of the groups parsed successfully
  if (!thaiContext && !visualMatching && !crossProductCompatibility && !priceIntelligence && !socialProof) {
    return null
  }

  // Return with defaults for missing groups
  return {
    thaiContext: thaiContext || createDefaultThaiContext(),
    visualMatching: visualMatching || createDefaultVisualMatching(),
    crossProductCompatibility: crossProductCompatibility || createDefaultCrossProductCompatibility(),
    priceIntelligence: priceIntelligence || createDefaultPriceIntelligence(),
    socialProof: socialProof || createDefaultSocialProof(),
  }
}

// ============================================================================
// ENUM VALIDATION
// ============================================================================

/**
 * Validate Thai Context enum values
 */
export function validateThaiContextEnums(ctx: ThaiClimateContext): string[] {
  const errors: string[] = []

  if (!WEDDING_APPROPRIATE_VALUES.has(ctx.weddingAppropriate)) {
    errors.push(`Invalid weddingAppropriate: ${ctx.weddingAppropriate}`)
  }
  if (!SONGKRAN_SUITABLE_VALUES.has(ctx.songkranSuitable)) {
    errors.push(`Invalid songkranSuitable: ${ctx.songkranSuitable}`)
  }
  if (ctx.cnySuitable && !CNY_SUITABLE_VALUES.has(ctx.cnySuitable)) {
    errors.push(`Invalid cnySuitable: ${ctx.cnySuitable}`)
  }
  if (!COVERAGE_TYPE_VALUES.has(ctx.coverage.shoulders)) {
    errors.push(`Invalid coverage.shoulders: ${ctx.coverage.shoulders}`)
  }
  if (!COVERAGE_TYPE_VALUES.has(ctx.coverage.knees)) {
    errors.push(`Invalid coverage.knees: ${ctx.coverage.knees}`)
  }

  return errors
}

/**
 * Validate Visual Matching enum values
 */
export function validateVisualMatchingEnums(vm: VisualMatchingAttributes): string[] {
  const errors: string[] = []

  if (!SILHOUETTE_SHAPE_VALUES.has(vm.silhouetteShape)) {
    errors.push(`Invalid silhouetteShape: ${vm.silhouetteShape}`)
  }
  if (vm.silhouetteFit && !SILHOUETTE_FIT_VALUES.has(vm.silhouetteFit)) {
    errors.push(`Invalid silhouetteFit: ${vm.silhouetteFit}`)
  }
  if (vm.silhouetteVolume && !SILHOUETTE_VOLUME_VALUES.has(vm.silhouetteVolume)) {
    errors.push(`Invalid silhouetteVolume: ${vm.silhouetteVolume}`)
  }
  if (!VISUAL_WEIGHT_LEVEL_VALUES.has(vm.visualWeightLevel)) {
    errors.push(`Invalid visualWeightLevel: ${vm.visualWeightLevel}`)
  }
  if (!PROPORTION_RATIO_VALUES.has(vm.proportionRatio)) {
    errors.push(`Invalid proportionRatio: ${vm.proportionRatio}`)
  }
  if (!TEXTURE_TYPE_VALUES.has(vm.textureType)) {
    errors.push(`Invalid textureType: ${vm.textureType}`)
  }
  if (!OUTFIT_ROLE_TYPE_VALUES.has(vm.outfitRoleType)) {
    errors.push(`Invalid outfitRoleType: ${vm.outfitRoleType}`)
  }

  return errors
}

/**
 * Validate Cross-Product Compatibility enum values
 */
export function validateCrossProductEnums(cp: CrossProductCompatibility): string[] {
  const errors: string[] = []

  if (!OUTFIT_COMPLETENESS_VALUES.has(cp.outfitCompleteness)) {
    errors.push(`Invalid outfitCompleteness: ${cp.outfitCompleteness}`)
  }
  for (const lc of cp.layerCompatibility) {
    if (!LAYER_COMPATIBILITY_VALUES.has(lc)) {
      errors.push(`Invalid layerCompatibility: ${lc}`)
    }
  }

  return errors
}

/**
 * Validate Price Intelligence enum values
 */
export function validatePriceIntelligenceEnums(pi: PriceIntelligence): string[] {
  const errors: string[] = []

  if (!COST_PER_WEAR_TIER_VALUES.has(pi.costPerWearTier)) {
    errors.push(`Invalid costPerWearTier: ${pi.costPerWearTier}`)
  }
  if (!SALE_LIKELIHOOD_VALUES.has(pi.saleLikelihood)) {
    errors.push(`Invalid saleLikelihood: ${pi.saleLikelihood}`)
  }
  if (pi.valueTier && !VALUE_TIER_VALUES.has(pi.valueTier)) {
    errors.push(`Invalid valueTier: ${pi.valueTier}`)
  }

  return errors
}

/**
 * Validate Social Proof enum values
 */
export function validateSocialProofEnums(sp: SocialProofSignals): string[] {
  const errors: string[] = []

  if (!POPULARITY_TIER_VALUES.has(sp.popularityTier)) {
    errors.push(`Invalid popularityTier: ${sp.popularityTier}`)
  }
  if (!TREND_STATUS_VALUES.has(sp.trendStatus)) {
    errors.push(`Invalid trendStatus: ${sp.trendStatus}`)
  }

  return errors
}

/**
 * Validate all KB attribute enum values
 */
export function validateAllKBEnums(kb: KBExpansionAttributes): string[] {
  return [
    ...validateThaiContextEnums(kb.thaiContext),
    ...validateVisualMatchingEnums(kb.visualMatching),
    ...validateCrossProductEnums(kb.crossProductCompatibility),
    ...validatePriceIntelligenceEnums(kb.priceIntelligence),
    ...validateSocialProofEnums(kb.socialProof),
  ]
}

// ============================================================================
// DEFAULT VALUE CREATORS
// ============================================================================

function createDefaultThaiContext(): ThaiClimateContext {
  return {
    thaiClimateRating: 5,
    acFriendly: true,
    monthSuitability: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    templeAppropriate: false,
    weddingAppropriate: 'none',
    funeralAppropriate: false,
    songkranSuitable: 'neither',
    loyKrathongSuitable: false,
    cnySuitable: 'neutral',
    coverage: { shoulders: 'exposed', knees: 'exposed' },
    thaiDayColors: [],
  }
}

function createDefaultVisualMatching(): VisualMatchingAttributes {
  return {
    silhouetteShape: 'h-line',
    silhouetteFit: 'semi-fitted',
    silhouetteVolume: 'medium',
    visualWeightScore: 5,
    visualWeightLevel: 'medium',
    proportionRatio: 'balanced',
    proportionEffect: { torsoLengthening: 0, legLengthening: 0, heightEffect: 0, widthEffect: 0 },
    patternComplexity: 1,
    textureType: 'matte',
    outfitRoleType: 'supporting',
    thaiProportionScore: 5,
    statementPotential: false,
    styleMoods: [],
  }
}

function createDefaultCrossProductCompatibility(): CrossProductCompatibility {
  return {
    pairingScore: 50,
    essentialPairings: [],
    avoidPairings: [],
    versatilityScore: 5,
    layerCompatibility: [],
    outfitCompleteness: 'needs-bottom',
    formalityTolerance: 2,
    patternMixingSafe: true,
    perfectMatchSkus: [],
    commonPairings: [],
  }
}

function createDefaultPriceIntelligence(): PriceIntelligence {
  return {
    costPerWear: 0,
    costPerWearTier: 'moderate',
    investmentScore: 50,
    qualityTier: 3,
    timelessScore: 5,
    isInvestmentPiece: false,
    isCapsuleWardrobe: false,
    saleLikelihood: 'seasonal',
    bestPurchaseTiming: 'anytime',
    expectedWears: 50,
    valueTier: 'fair',
  }
}

function createDefaultSocialProof(): SocialProofSignals {
  return {
    popularityScore: 50,
    popularityTier: 'steady',
    trendStatus: 'classic',
    trendConfidence: 50,
    celebrityAssociations: [],
    hashtagTrending: [],
    reviewSentiment: 70,
    reviewCount: 0,
    recommendRate: 70,
    influencerFeatures: 0,
  }
}
