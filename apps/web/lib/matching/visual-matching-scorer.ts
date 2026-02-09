/**
 * Visual Matching Scorer
 * Calculates visual balance scores for outfits
 *
 * chore-kb003: KB integration with AI matching
 *
 * Reference: KB Section 15 - Visual Matching Intelligence
 */

import type { EnhancedProduct } from '../types/product-types'
import type { VisualMatchingAttributes } from '../types/ai-matching-types'

// ============================================================================
// TYPES
// ============================================================================

export interface VisualBalanceScore {
  overall: number // 0-100
  silhouetteBalance: number
  volumeBalance: number
  visualWeightBalance: number
  proportionBalance: number
  patternBalance: number
  thaiProportionScore: number
}

export interface SilhouetteCompatibility {
  score: number // 0-100
  reason: string
}

// ============================================================================
// SILHOUETTE RULES
// ============================================================================

const SILHOUETTE_COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
  'fitted': {
    'fitted': 70,
    'semi-fitted': 85,
    'relaxed': 100,
    'oversized': 95,
    'boxy': 80,
    'structured': 90,
    'fluid': 95,
  },
  'semi-fitted': {
    'fitted': 85,
    'semi-fitted': 75,
    'relaxed': 90,
    'oversized': 85,
    'boxy': 75,
    'structured': 85,
    'fluid': 90,
  },
  'relaxed': {
    'fitted': 100,
    'semi-fitted': 90,
    'relaxed': 50,
    'oversized': 40,
    'boxy': 60,
    'structured': 80,
    'fluid': 70,
  },
  'oversized': {
    'fitted': 95,
    'semi-fitted': 85,
    'relaxed': 40,
    'oversized': 30,
    'boxy': 50,
    'structured': 70,
    'fluid': 60,
  },
  'boxy': {
    'fitted': 80,
    'semi-fitted': 75,
    'relaxed': 60,
    'oversized': 50,
    'boxy': 50,
    'structured': 70,
    'fluid': 75,
  },
  'structured': {
    'fitted': 90,
    'semi-fitted': 85,
    'relaxed': 80,
    'oversized': 70,
    'boxy': 70,
    'structured': 65,
    'fluid': 85,
  },
  'fluid': {
    'fitted': 95,
    'semi-fitted': 90,
    'relaxed': 70,
    'oversized': 60,
    'boxy': 75,
    'structured': 85,
    'fluid': 55,
  },
}

const VOLUME_VALUES: Record<string, number> = {
  'low': 1,
  'medium': 2,
  'high': 3,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get visual matching attributes from product (with fallback)
 */
function getVisualMatching(product: EnhancedProduct): VisualMatchingAttributes | null {
  return (product as any).visualMatching || null
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate silhouette compatibility between two products
 */
export function getSilhouetteCompatibility(
  product1: EnhancedProduct,
  product2: EnhancedProduct
): SilhouetteCompatibility {
  const vm1 = getVisualMatching(product1)
  const vm2 = getVisualMatching(product2)

  if (!vm1 || !vm2) {
    return { score: 70, reason: 'Missing visual matching data' }
  }

  const fit1 = vm1.silhouetteFit || 'semi-fitted'
  const fit2 = vm2.silhouetteFit || 'semi-fitted'

  const baseScore = SILHOUETTE_COMPATIBILITY_MATRIX[fit1]?.[fit2] || 70

  // Adjust based on visual weight
  let adjustedScore = baseScore
  const weight1 = vm1.visualWeightLevel || 'medium'
  const weight2 = vm2.visualWeightLevel || 'medium'

  // Prefer contrasting visual weights
  if (weight1 !== weight2) {
    adjustedScore += 10
  }

  // Penalty for both heavy
  if (weight1 === 'heavy' && weight2 === 'heavy') {
    adjustedScore -= 15
  }

  const reason = `${fit1} + ${fit2}: ${weight1} weight with ${weight2} weight`

  return {
    score: Math.min(100, Math.max(0, adjustedScore)),
    reason,
  }
}

/**
 * Calculate volume balance score
 */
function calculateVolumeBalance(outfit: EnhancedProduct[]): number {
  let totalVolume = 0
  let count = 0

  for (const product of outfit) {
    const vm = getVisualMatching(product)
    if (vm && vm.silhouetteVolume) {
      totalVolume += VOLUME_VALUES[vm.silhouetteVolume] || 2
      count++
    }
  }

  if (count === 0) return 70

  const avgVolume = totalVolume / count

  // For 2-item outfit, ideal total is 3-4 (e.g., low + medium or medium + medium)
  // For 3-item outfit, ideal total is 4-6
  const idealAvg = 1.8 // Slightly below medium for Thai climate

  const deviation = Math.abs(avgVolume - idealAvg)

  // Score decreases with deviation from ideal
  return Math.max(0, Math.round(100 - deviation * 30))
}

/**
 * Calculate visual weight balance
 */
function calculateVisualWeightBalance(outfit: EnhancedProduct[]): number {
  const weights: string[] = []

  for (const product of outfit) {
    const vm = getVisualMatching(product)
    if (vm && vm.visualWeightLevel) {
      weights.push(vm.visualWeightLevel)
    }
  }

  if (weights.length < 2) return 80

  const lightCount = weights.filter(w => w === 'light').length
  const heavyCount = weights.filter(w => w === 'heavy').length
  const mediumCount = weights.filter(w => w === 'medium').length

  // Ideal: mix of light and medium, or medium throughout
  if (lightCount > 0 && mediumCount > 0 && heavyCount === 0) {
    return 100 // Light + medium = perfect for Thai climate
  }

  if (mediumCount === weights.length) {
    return 85 // All medium is good
  }

  if (lightCount > 0 && heavyCount > 0) {
    return 75 // Contrast is acceptable
  }

  if (heavyCount === weights.length) {
    return 40 // All heavy is problematic
  }

  if (lightCount === weights.length) {
    return 70 // All light can look unsubstantial
  }

  return 60
}

/**
 * Calculate proportion effect balance
 */
function calculateProportionBalance(outfit: EnhancedProduct[]): number {
  let totalTorso = 0
  let totalLeg = 0
  let count = 0

  for (const product of outfit) {
    const vm = getVisualMatching(product)
    if (vm && vm.proportionEffect) {
      totalTorso += vm.proportionEffect.torsoLengthening || 0
      totalLeg += vm.proportionEffect.legLengthening || 0
      count++
    }
  }

  if (count === 0) return 70

  // Ideal: complementary effects (one lengthens torso, other lengthens legs)
  // Or neutral overall

  const netTorso = totalTorso
  const netLeg = totalLeg

  // Best: opposite effects that balance out
  if ((netTorso > 0 && netLeg > 0) || (Math.abs(netTorso) <= 1 && Math.abs(netLeg) <= 1)) {
    return 100
  }

  // Good: one direction but not extreme
  if (Math.abs(netTorso + netLeg) <= 3) {
    return 80
  }

  // Less ideal: strong imbalance
  return Math.max(40, 100 - Math.abs(netTorso + netLeg) * 10)
}

/**
 * Calculate pattern balance (avoid multiple complex patterns)
 */
function calculatePatternBalance(outfit: EnhancedProduct[]): number {
  let complexPatternCount = 0
  let maxComplexity = 0

  for (const product of outfit) {
    const vm = getVisualMatching(product)
    if (vm) {
      const complexity = vm.patternComplexity || 1
      if (complexity > 7) {
        complexPatternCount++
      }
      maxComplexity = Math.max(maxComplexity, complexity)
    }
  }

  // Ideal: max one complex pattern
  if (complexPatternCount === 0) {
    return 90 // All solid/simple is safe
  }

  if (complexPatternCount === 1 && maxComplexity <= 8) {
    return 100 // One statement pattern is ideal
  }

  if (complexPatternCount === 1 && maxComplexity > 8) {
    return 80 // Very complex but only one
  }

  // Multiple complex patterns
  return Math.max(30, 80 - (complexPatternCount - 1) * 30)
}

/**
 * Get Thai proportion score (average across outfit)
 */
export function getThaiProportionScore(outfit: EnhancedProduct[]): number {
  let totalScore = 0
  let totalWeight = 0

  for (const product of outfit) {
    const vm = getVisualMatching(product)
    if (vm && typeof vm.thaiProportionScore === 'number') {
      // Weight anchor items 2x
      const weight = vm.outfitRoleType === 'anchor' ? 2 : 1
      totalScore += vm.thaiProportionScore * weight
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 5 // Default neutral
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Calculate comprehensive visual balance score for outfit
 */
export function calculateVisualBalance(outfit: EnhancedProduct[]): VisualBalanceScore {
  if (outfit.length === 0) {
    return {
      overall: 0,
      silhouetteBalance: 0,
      volumeBalance: 0,
      visualWeightBalance: 0,
      proportionBalance: 0,
      patternBalance: 0,
      thaiProportionScore: 0,
    }
  }

  // Calculate silhouette balance (pairwise)
  let silhouetteTotal = 0
  let silhouetteCount = 0
  for (let i = 0; i < outfit.length - 1; i++) {
    for (let j = i + 1; j < outfit.length; j++) {
      const compat = getSilhouetteCompatibility(outfit[i], outfit[j])
      silhouetteTotal += compat.score
      silhouetteCount++
    }
  }
  const silhouetteBalance = silhouetteCount > 0 ? silhouetteTotal / silhouetteCount : 70

  const volumeBalance = calculateVolumeBalance(outfit)
  const visualWeightBalance = calculateVisualWeightBalance(outfit)
  const proportionBalance = calculateProportionBalance(outfit)
  const patternBalance = calculatePatternBalance(outfit)
  const thaiProportionScore = getThaiProportionScore(outfit) * 10 // Scale to 0-100

  // Weighted overall score
  const overall = Math.round(
    silhouetteBalance * 0.25 +
    volumeBalance * 0.15 +
    visualWeightBalance * 0.20 +
    proportionBalance * 0.15 +
    patternBalance * 0.15 +
    thaiProportionScore * 0.10
  )

  return {
    overall,
    silhouetteBalance: Math.round(silhouetteBalance),
    volumeBalance,
    visualWeightBalance,
    proportionBalance,
    patternBalance,
    thaiProportionScore: Math.round(thaiProportionScore),
  }
}

/**
 * Validate proportion effects are complementary
 */
export function validateProportionEffects(outfit: EnhancedProduct[]): {
  valid: boolean
  score: number
  recommendation: string
} {
  const score = calculateProportionBalance(outfit)

  if (score >= 80) {
    return {
      valid: true,
      score,
      recommendation: 'Proportion effects are well-balanced',
    }
  }

  if (score >= 60) {
    return {
      valid: true,
      score,
      recommendation: 'Consider adding items with complementary proportion effects',
    }
  }

  return {
    valid: false,
    score,
    recommendation: 'Outfit has unbalanced proportion effects - may not be flattering',
  }
}

/**
 * Check if outfit has statement piece potential
 */
export function hasStatementPiece(outfit: EnhancedProduct[]): boolean {
  return outfit.some(product => {
    const vm = getVisualMatching(product)
    return vm && vm.statementPotential === true
  })
}

/**
 * Get style moods from outfit
 */
export function getOutfitStyleMoods(outfit: EnhancedProduct[]): string[] {
  const moods = new Set<string>()

  for (const product of outfit) {
    const vm = getVisualMatching(product)
    if (vm && vm.styleMoods) {
      vm.styleMoods.forEach(mood => moods.add(mood))
    }
  }

  return Array.from(moods)
}
