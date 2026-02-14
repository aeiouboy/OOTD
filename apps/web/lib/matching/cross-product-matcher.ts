/**
 * Cross-Product Matcher
 * Handles product pairing and compatibility scoring
 *
 * chore-kb003: KB integration with AI matching
 *
 * Reference: KB Section 17 - Cross-Product Compatibility
 */

import type { EnhancedProduct } from '../types/product-types'
import type { CrossProductCompatibility } from '../types/ai-matching-types'

// ============================================================================
// TYPES
// ============================================================================

export interface PairingResult {
  score: number // 0-100
  relationship: 'perfect-match' | 'great-pair' | 'works-well' | 'acceptable' | 'avoid'
  reasons: string[]
  warnings: string[]
}

export interface EssentialPairingResult {
  valid: boolean
  missingCategories: string[]
  suggestions: string[]
}

export interface LayeringResult {
  valid: boolean
  score: number
  sequence: string[]
  issues: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RELATIONSHIP_THRESHOLDS = {
  'perfect-match': 95,
  'great-pair': 75,
  'works-well': 50,
  'acceptable': 35,
  'avoid': 0,
}

const LAYERING_ORDER = ['fitted', 'structured', 'loose']

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get cross-product compatibility from product (with fallback)
 */
function getCrossProductCompatibility(product: EnhancedProduct): CrossProductCompatibility | null {
  return (product as any).crossProductCompatibility || null
}

/**
 * Get formality level from product
 */
function getFormality(product: EnhancedProduct): number {
  return product.style?.formalityLevel || 5
}

/**
 * Get outfit role from product
 */
function getOutfitRole(product: EnhancedProduct): string {
  return product.classification?.role || 'accessory'
}

/**
 * Map score to relationship type
 */
function scoreToRelationship(score: number): PairingResult['relationship'] {
  if (score >= RELATIONSHIP_THRESHOLDS['perfect-match']) return 'perfect-match'
  if (score >= RELATIONSHIP_THRESHOLDS['great-pair']) return 'great-pair'
  if (score >= RELATIONSHIP_THRESHOLDS['works-well']) return 'works-well'
  if (score >= RELATIONSHIP_THRESHOLDS['acceptable']) return 'acceptable'
  return 'avoid'
}

// ============================================================================
// PAIRING FUNCTIONS
// ============================================================================

/**
 * Find perfect matches for a product
 */
export function findPerfectMatches(
  product: EnhancedProduct,
  allProducts: EnhancedProduct[]
): EnhancedProduct[] {
  const cp = getCrossProductCompatibility(product)

  if (!cp || !cp.perfectMatchSkus || cp.perfectMatchSkus.length === 0) {
    // Fallback to common pairings if no perfect matches
    if (cp?.commonPairings && cp.commonPairings.length > 0) {
      const skus = cp.commonPairings
        .filter(p => p.relationship === 'perfect-match' || p.score >= 90)
        .map(p => p.sku)

      return allProducts.filter(p => skus.includes(p.sku))
    }
    return []
  }

  return allProducts.filter(p => cp.perfectMatchSkus.includes(p.sku))
}

/**
 * Calculate pairing score between two products
 */
export function calculatePairingScore(
  product1: EnhancedProduct,
  product2: EnhancedProduct
): PairingResult {
  const cp1 = getCrossProductCompatibility(product1)
  const cp2 = getCrossProductCompatibility(product2)
  const reasons: string[] = []
  const warnings: string[] = []

  // Base score from compatibility data
  let score = 50 // Default neutral

  if (cp1) {
    score = cp1.pairingScore || 50

    // Check if product2 is in perfect matches
    if (cp1.perfectMatchSkus?.includes(product2.sku)) {
      score += 30
      reasons.push('Perfect match SKU')
    }

    // Check common pairings
    const pairing = cp1.commonPairings?.find(p => p.sku === product2.sku)
    if (pairing) {
      score = Math.max(score, pairing.score)
      reasons.push(`Known pairing: ${pairing.relationship}`)
    }
  }

  // Layering compatibility check
  if (cp1?.layerCompatibility && cp2?.layerCompatibility) {
    const sharedLayers = cp1.layerCompatibility.filter(l =>
      cp2.layerCompatibility.includes(l)
    )
    if (sharedLayers.length > 0) {
      score += 10
      reasons.push('Compatible layering styles')
    }
  }

  // Pattern mixing safety
  const pattern1Safe = cp1?.patternMixingSafe !== false
  const pattern2Safe = cp2?.patternMixingSafe !== false

  if (!pattern1Safe && !pattern2Safe) {
    score -= 30
    warnings.push('Both items have patterns that may clash')
  } else if (!pattern1Safe || !pattern2Safe) {
    score -= 10
    warnings.push('One item has a strong pattern')
  }

  // Formality tolerance check
  const formality1 = getFormality(product1)
  const formality2 = getFormality(product2)
  const formalityDiff = Math.abs(formality1 - formality2)
  const tolerance1 = cp1?.formalityTolerance || 2
  const tolerance2 = cp2?.formalityTolerance || 2
  const maxTolerance = Math.min(tolerance1, tolerance2)

  if (formalityDiff > maxTolerance) {
    score -= 20
    warnings.push(`Formality mismatch: ${formality1} vs ${formality2}`)
  }

  // Avoid pairing check
  const avoid1 = cp1?.avoidPairings || []
  const avoid2 = cp2?.avoidPairings || []
  const role1 = getOutfitRole(product1)
  const role2 = getOutfitRole(product2)

  if (avoid1.includes(role2) || avoid2.includes(role1)) {
    score -= 40
    warnings.push('These item types should not be paired')
  }

  // Normalize score
  score = Math.min(100, Math.max(0, score))

  return {
    score,
    relationship: scoreToRelationship(score),
    reasons,
    warnings,
  }
}

/**
 * Validate that all essential pairings are present in outfit
 */
export function validateEssentialPairings(outfit: EnhancedProduct[]): EssentialPairingResult {
  const missingCategories: string[] = []
  const suggestions: string[] = []
  const presentRoles = new Set(outfit.map(p => getOutfitRole(p)))

  for (const product of outfit) {
    const cp = getCrossProductCompatibility(product)
    if (!cp || !cp.essentialPairings) continue

    for (const required of cp.essentialPairings) {
      // Map essential pairing categories to outfit roles
      const roleMapping: Record<string, string[]> = {
        'bottom': ['bottom'],
        'top': ['top'],
        'footwear': ['footwear'],
        'accessories': ['accessory', 'bag'],
        'outerwear': ['outerwear'],
      }

      const requiredRoles = roleMapping[required] || [required]
      const hasRequired = requiredRoles.some(r => presentRoles.has(r))

      if (!hasRequired && !missingCategories.includes(required)) {
        missingCategories.push(required)
        suggestions.push(`Add ${required} to complete the outfit`)
      }
    }
  }

  return {
    valid: missingCategories.length === 0,
    missingCategories,
    suggestions,
  }
}

/**
 * Check layering compatibility for outfit
 */
export function checkLayeringCompatibility(outfit: EnhancedProduct[]): LayeringResult {
  const issues: string[] = []
  const sequence: string[] = []
  let score = 100

  // Get layering items (outerwear, cardigans, etc.)
  const layeringItems = outfit.filter(p => {
    const role = getOutfitRole(p)
    return role === 'outerwear' || role === 'top'
  })

  if (layeringItems.length < 2) {
    return { valid: true, score: 100, sequence: [], issues: [] }
  }

  // Build sequence based on layer compatibility
  const layers: { product: EnhancedProduct; type: string }[] = []

  for (const item of layeringItems) {
    const cp = getCrossProductCompatibility(item)
    const layerTypes = cp?.layerCompatibility || ['fitted']
    // Use first compatible layer type
    layers.push({ product: item, type: layerTypes[0] })
  }

  // Sort by layer order
  layers.sort((a, b) => {
    const indexA = LAYERING_ORDER.indexOf(a.type)
    const indexB = LAYERING_ORDER.indexOf(b.type)
    return indexA - indexB
  })

  // Check if sequence is valid
  for (let i = 0; i < layers.length - 1; i++) {
    const current = LAYERING_ORDER.indexOf(layers[i].type)
    const next = LAYERING_ORDER.indexOf(layers[i + 1].type)

    if (current > next) {
      score -= 25
      issues.push(`${layers[i + 1].type} layer should not go over ${layers[i].type}`)
    }

    sequence.push(layers[i].type)
  }

  if (layers.length > 0) {
    sequence.push(layers[layers.length - 1].type)
  }

  return {
    valid: score >= 75,
    score: Math.max(0, score),
    sequence,
    issues,
  }
}

/**
 * Check outfit completeness
 */
export function checkOutfitCompleteness(outfit: EnhancedProduct[]): {
  complete: boolean
  missing: string[]
  suggestions: string[]
} {
  const missing: string[] = []
  const suggestions: string[] = []
  const presentRoles = new Set(outfit.map(p => getOutfitRole(p)))

  for (const product of outfit) {
    const cp = getCrossProductCompatibility(product)
    if (!cp) continue

    switch (cp.outfitCompleteness) {
      case 'needs-top':
        if (!presentRoles.has('top')) {
          missing.push('top')
          suggestions.push('Add a top to complete the outfit')
        }
        break
      case 'needs-bottom':
        if (!presentRoles.has('bottom')) {
          missing.push('bottom')
          suggestions.push('Add pants or a skirt to complete the outfit')
        }
        break
      case 'needs-both':
        if (!presentRoles.has('top')) {
          missing.push('top')
        }
        if (!presentRoles.has('bottom')) {
          missing.push('bottom')
        }
        if (missing.length > 0) {
          suggestions.push('Outerwear needs both a top and bottom underneath')
        }
        break
      case 'needs-accessories':
        // Optional, don't mark as missing
        break
      case 'standalone':
      default:
        // Complete on its own
        break
    }
  }

  return {
    complete: missing.length === 0,
    missing: Array.from(new Set(missing)),
    suggestions: Array.from(new Set(suggestions)),
  }
}

/**
 * Get versatility score for outfit
 */
export function getOutfitVersatilityScore(outfit: EnhancedProduct[]): number {
  let total = 0
  let count = 0

  for (const product of outfit) {
    const cp = getCrossProductCompatibility(product)
    if (cp && typeof cp.versatilityScore === 'number') {
      total += cp.versatilityScore
      count++
    }
  }

  return count > 0 ? total / count : 5
}

/**
 * Calculate overall compatibility score for outfit
 */
export function calculateOutfitCompatibility(outfit: EnhancedProduct[]): {
  score: number
  pairingDetails: PairingResult[]
  essentialPairings: EssentialPairingResult
  layering: LayeringResult
  completeness: ReturnType<typeof checkOutfitCompleteness>
} {
  // Calculate pairwise scores
  const pairingDetails: PairingResult[] = []
  let pairingScoreSum = 0
  let pairingCount = 0

  for (let i = 0; i < outfit.length - 1; i++) {
    for (let j = i + 1; j < outfit.length; j++) {
      const result = calculatePairingScore(outfit[i], outfit[j])
      pairingDetails.push(result)
      pairingScoreSum += result.score
      pairingCount++
    }
  }

  const avgPairingScore = pairingCount > 0 ? pairingScoreSum / pairingCount : 50

  // Check essential pairings
  const essentialPairings = validateEssentialPairings(outfit)

  // Check layering
  const layering = checkLayeringCompatibility(outfit)

  // Check completeness
  const completeness = checkOutfitCompleteness(outfit)

  // Calculate overall score
  let overallScore = avgPairingScore

  if (!essentialPairings.valid) {
    overallScore -= 20
  }

  if (!layering.valid) {
    overallScore -= 15
  }

  if (!completeness.complete) {
    overallScore -= 25
  }

  return {
    score: Math.max(0, Math.round(overallScore)),
    pairingDetails,
    essentialPairings,
    layering,
    completeness,
  }
}
