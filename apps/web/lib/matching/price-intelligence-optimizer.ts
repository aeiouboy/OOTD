/**
 * Price Intelligence Optimizer
 * Optimizes outfit recommendations based on cost-per-wear and value
 *
 * chore-kb003: KB integration with AI matching
 *
 * Reference: KB Section 13 - Price Intelligence
 */

import type { EnhancedProduct } from '../types/product-types'
import type { PriceIntelligence } from '../types/ai-matching-types'

// ============================================================================
// TYPES
// ============================================================================

export interface BudgetOptimizationResult {
  outfits: OutfitWithValue[]
  optimizationStrategy: string
  totalSavings: number
}

export interface OutfitWithValue {
  products: EnhancedProduct[]
  totalPrice: number
  totalCostPerWear: number
  avgCostPerWear: number
  valueScore: number
  investmentItems: number
  capsuleItems: number
}

export interface ValueTierMatch {
  matched: boolean
  tiers: string[]
  issues: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VALUE_TIER_COMPATIBILITY: Record<string, string[]> = {
  'exceptional': ['exceptional', 'fair'],
  'fair': ['exceptional', 'fair', 'premium'],
  'premium': ['fair', 'premium'],
  'overpriced': ['overpriced'], // Only matches itself
}

const COST_PER_WEAR_THRESHOLDS = {
  excellent: 50, // < ฿50/wear
  good: 100, // < ฿100/wear
  moderate: 200, // < ฿200/wear
  poor: Infinity,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get price intelligence from product (with fallback)
 */
function getPriceIntelligence(product: EnhancedProduct): PriceIntelligence | null {
  return (product as any).priceIntelligence || null
}

/**
 * Get product price as number
 */
function getPrice(product: EnhancedProduct): number {
  if (typeof product.pricing?.currentPrice === 'number') {
    return product.pricing.currentPrice
  }
  return 0
}

/**
 * Get formality level
 */
function getFormality(product: EnhancedProduct): number {
  return product.style?.formalityLevel || 5
}

// ============================================================================
// PRICE INTELLIGENCE FUNCTIONS
// ============================================================================

/**
 * Calculate total cost per wear for outfit
 */
export function calculateOutfitCostPerWear(outfit: EnhancedProduct[]): number {
  let total = 0
  let count = 0

  for (const product of outfit) {
    const pi = getPriceIntelligence(product)
    if (pi && typeof pi.costPerWear === 'number') {
      total += pi.costPerWear
      count++
    } else {
      // Estimate from price (assume 50 wears)
      const price = getPrice(product)
      if (price > 0) {
        total += price / 50
        count++
      }
    }
  }

  return count > 0 ? total / count : 0
}

/**
 * Get cost per wear tier for outfit
 */
export function getOutfitCostPerWearTier(outfit: EnhancedProduct[]): string {
  const avgCPW = calculateOutfitCostPerWear(outfit)

  if (avgCPW < COST_PER_WEAR_THRESHOLDS.excellent) return 'excellent'
  if (avgCPW < COST_PER_WEAR_THRESHOLDS.good) return 'good'
  if (avgCPW < COST_PER_WEAR_THRESHOLDS.moderate) return 'moderate'
  return 'poor'
}

/**
 * Check if value tiers match across outfit
 */
export function getValueTierMatch(outfit: EnhancedProduct[]): ValueTierMatch {
  const tiers: string[] = []
  const issues: string[] = []

  for (const product of outfit) {
    const pi = getPriceIntelligence(product)
    if (pi && pi.valueTier) {
      tiers.push(pi.valueTier)
    }
  }

  if (tiers.length < 2) {
    return { matched: true, tiers, issues: [] }
  }

  // Check compatibility between all pairs
  let matched = true
  for (let i = 0; i < tiers.length - 1; i++) {
    for (let j = i + 1; j < tiers.length; j++) {
      const compatible = VALUE_TIER_COMPATIBILITY[tiers[i]]?.includes(tiers[j])
      if (!compatible) {
        matched = false
        issues.push(`${tiers[i]} and ${tiers[j]} value tiers may not match well`)
      }
    }
  }

  return { matched, tiers, issues }
}

/**
 * Get quality tier score (average)
 */
export function getQualityTierScore(outfit: EnhancedProduct[]): number {
  let total = 0
  let count = 0

  for (const product of outfit) {
    const pi = getPriceIntelligence(product)
    if (pi && typeof pi.qualityTier === 'number') {
      total += pi.qualityTier
      count++
    }
  }

  return count > 0 ? total / count : 3 // Default mid-tier
}

/**
 * Count investment pieces in outfit
 */
export function countInvestmentPieces(outfit: EnhancedProduct[]): number {
  return outfit.filter(product => {
    const pi = getPriceIntelligence(product)
    return pi?.isInvestmentPiece === true
  }).length
}

/**
 * Count capsule wardrobe items in outfit
 */
export function countCapsuleItems(outfit: EnhancedProduct[]): number {
  return outfit.filter(product => {
    const pi = getPriceIntelligence(product)
    return pi?.isCapsuleWardrobe === true
  }).length
}

/**
 * Get timelessness score for outfit
 */
export function getTimelessScore(outfit: EnhancedProduct[]): number {
  let total = 0
  let count = 0

  for (const product of outfit) {
    const pi = getPriceIntelligence(product)
    if (pi && typeof pi.timelessScore === 'number') {
      total += pi.timelessScore
      count++
    }
  }

  return count > 0 ? total / count : 5
}

/**
 * Get expected total wears for outfit (minimum across items)
 */
export function getExpectedWears(outfit: EnhancedProduct[]): number {
  const wears = outfit.map(product => {
    const pi = getPriceIntelligence(product)
    return pi?.expectedWears || 50
  })

  return wears.length > 0 ? Math.min(...wears) : 50
}

/**
 * Calculate value score for outfit (0-100)
 */
export function calculateValueScore(outfit: EnhancedProduct[]): number {
  const cpwTier = getOutfitCostPerWearTier(outfit)
  const qualityTier = getQualityTierScore(outfit)
  const valueTierMatch = getValueTierMatch(outfit)
  const timelessScore = getTimelessScore(outfit)
  const investmentCount = countInvestmentPieces(outfit)

  // Base score from cost-per-wear tier
  let score = 50
  switch (cpwTier) {
    case 'excellent': score = 90; break
    case 'good': score = 75; break
    case 'moderate': score = 55; break
    case 'poor': score = 30; break
  }

  // Adjust for quality tier (1-5 → -20 to +20)
  score += (qualityTier - 3) * 10

  // Adjust for value tier matching
  if (!valueTierMatch.matched) {
    score -= 15
  }

  // Boost for timeless items
  score += (timelessScore - 5) * 2

  // Boost for investment pieces
  score += investmentCount * 5

  return Math.min(100, Math.max(0, Math.round(score)))
}

/**
 * Create outfit with value metadata
 */
export function createOutfitWithValue(products: EnhancedProduct[]): OutfitWithValue {
  const totalPrice = products.reduce((sum, p) => sum + getPrice(p), 0)
  const totalCostPerWear = calculateOutfitCostPerWear(products) * products.length

  return {
    products,
    totalPrice,
    totalCostPerWear,
    avgCostPerWear: totalCostPerWear / products.length,
    valueScore: calculateValueScore(products),
    investmentItems: countInvestmentPieces(products),
    capsuleItems: countCapsuleItems(products),
  }
}

// ============================================================================
// OPTIMIZATION FUNCTIONS
// ============================================================================

/**
 * Optimize outfits for budget using cost-per-wear
 */
export function optimizeOutfitBudget(
  outfits: EnhancedProduct[][],
  maxBudget: number,
  occasion?: 'work' | 'casual' | 'special'
): BudgetOptimizationResult {
  // Convert to OutfitWithValue for analysis
  const outfitsWithValue = outfits
    .map(products => createOutfitWithValue(products))
    .filter(o => o.totalPrice <= maxBudget)

  // Sort based on occasion strategy
  let optimizationStrategy = 'balanced'

  if (occasion === 'work') {
    // Prioritize investment pieces and quality
    optimizationStrategy = 'investment-focused'
    outfitsWithValue.sort((a, b) => {
      // Higher investment count first
      const investmentDiff = b.investmentItems - a.investmentItems
      if (investmentDiff !== 0) return investmentDiff
      // Then by value score
      return b.valueScore - a.valueScore
    })
  } else if (occasion === 'casual') {
    // Prioritize low cost-per-wear
    optimizationStrategy = 'value-focused'
    outfitsWithValue.sort((a, b) => a.avgCostPerWear - b.avgCostPerWear)
  } else if (occasion === 'special') {
    // Balance quality and value
    optimizationStrategy = 'quality-focused'
    outfitsWithValue.sort((a, b) => b.valueScore - a.valueScore)
  } else {
    // Default: sort by value score
    outfitsWithValue.sort((a, b) => b.valueScore - a.valueScore)
  }

  // Calculate potential savings
  const avgPrice = outfits.reduce((sum, o) => {
    return sum + o.reduce((s, p) => s + getPrice(p), 0)
  }, 0) / outfits.length

  const optimizedAvgPrice = outfitsWithValue.length > 0
    ? outfitsWithValue.slice(0, 3).reduce((sum, o) => sum + o.totalPrice, 0) / 3
    : avgPrice

  return {
    outfits: outfitsWithValue,
    optimizationStrategy,
    totalSavings: Math.max(0, avgPrice - optimizedAvgPrice),
  }
}

/**
 * Filter products by cost-per-wear tier
 */
export function filterByCostPerWear(
  products: EnhancedProduct[],
  maxTier: 'excellent' | 'good' | 'moderate' | 'poor'
): EnhancedProduct[] {
  const threshold = COST_PER_WEAR_THRESHOLDS[maxTier]

  return products.filter(product => {
    const pi = getPriceIntelligence(product)
    const cpw = pi?.costPerWear || (getPrice(product) / 50)
    return cpw <= threshold
  })
}

/**
 * Get sale timing recommendations
 */
export function getSaleTimingRecommendations(outfit: EnhancedProduct[]): string[] {
  const recommendations: string[] = []
  const saleItems = outfit.filter(product => {
    const pi = getPriceIntelligence(product)
    return pi?.saleLikelihood === 'seasonal' || pi?.saleLikelihood === 'frequent'
  })

  if (saleItems.length > 0) {
    const timings = saleItems.map(product => {
      const pi = getPriceIntelligence(product)
      return pi?.bestPurchaseTiming || 'anytime'
    }).filter(t => t !== 'anytime')

    if (timings.length > 0) {
      recommendations.push(`Best time to buy: ${Array.from(new Set(timings)).join(', ')}`)
    }
  }

  return recommendations
}

/**
 * Recommend capsule wardrobe items from outfit
 */
export function recommendCapsuleItems(outfit: EnhancedProduct[]): EnhancedProduct[] {
  return outfit.filter(product => {
    const pi = getPriceIntelligence(product)
    return pi?.isCapsuleWardrobe === true && pi?.timelessScore >= 7
  })
}
