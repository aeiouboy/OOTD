/**
 * Social Proof Ranker
 * Ranks outfits by trend status, popularity, and social signals
 *
 * chore-kb003: KB integration with AI matching
 *
 * Reference: KB Special Topics - Social Proof Signals
 */

import type { EnhancedProduct } from '../types/product-types'
import type { SocialProofSignals } from '../types/ai-matching-types'

// ============================================================================
// TYPES
// ============================================================================

export interface TrendRankingResult {
  outfits: RankedOutfit[]
  trendingHashtags: string[]
  topInfluencerStyles: string[]
}

export interface RankedOutfit {
  products: EnhancedProduct[]
  trendScore: number
  popularityScore: number
  influencerBoost: number
  combinedScore: number
  trendStatus: string
  hashtags: string[]
}

export interface SocialProofSummary {
  avgPopularity: number
  avgTrendConfidence: number
  dominantTrend: string
  totalInfluencerFeatures: number
  allHashtags: string[]
  celebrityAssociations: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TREND_STATUS_SCORES: Record<string, number> = {
  'emerging': 100, // Highest priority for trend-forward users
  'peak': 90, // Currently at maximum popularity
  'trending': 85, // Growing rapidly
  'timeless': 80, // Always safe, high priority
  'classic': 75, // Enduring style
  'stable': 70, // Mainstream
  'revival': 65, // Coming back
  'declining': 40, // Avoid unless vintage aesthetic
}

const POPULARITY_TIER_SCORES: Record<string, number> = {
  'viral': 100,
  'hot': 85,
  'popular': 70,
  'steady': 55,
  'emerging': 60,
  'niche': 45,
  'new': 50,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get social proof from product (with fallback)
 */
function getSocialProof(product: EnhancedProduct): SocialProofSignals | null {
  return (product as any).socialProof || null
}

/**
 * Get outfit role type for weighting
 */
function getOutfitRoleType(product: EnhancedProduct): string {
  const vm = (product as any).visualMatching
  return vm?.outfitRoleType || 'supporting'
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Get trend score for a single product
 */
export function getProductTrendScore(product: EnhancedProduct): number {
  const sp = getSocialProof(product)
  if (!sp) return 50 // Default neutral

  const statusScore = TREND_STATUS_SCORES[sp.trendStatus] || 60
  const confidence = sp.trendConfidence || 50

  // Weight by confidence
  return Math.round(statusScore * (confidence / 100) + 50 * (1 - confidence / 100))
}

/**
 * Calculate trend score for outfit
 */
export function calculateTrendScore(outfit: EnhancedProduct[]): number {
  let totalScore = 0
  let totalWeight = 0

  for (const product of outfit) {
    const score = getProductTrendScore(product)
    // Weight anchor items 2x
    const weight = getOutfitRoleType(product) === 'anchor' ? 2 : 1
    totalScore += score * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50
}

/**
 * Get trend confidence for outfit
 */
export function getTrendConfidence(outfit: EnhancedProduct[]): number {
  let total = 0
  let totalWeight = 0

  for (const product of outfit) {
    const sp = getSocialProof(product)
    if (sp && typeof sp.trendConfidence === 'number') {
      const weight = getOutfitRoleType(product) === 'anchor' ? 2 : 1
      total += sp.trendConfidence * weight
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? Math.round(total / totalWeight) : 50
}

/**
 * Get popularity score for outfit
 */
export function getPopularityScore(outfit: EnhancedProduct[]): number {
  let total = 0
  let count = 0

  for (const product of outfit) {
    const sp = getSocialProof(product)
    if (sp) {
      // Use direct popularity score if available
      if (typeof sp.popularityScore === 'number') {
        total += sp.popularityScore
        count++
      }
      // Boost for high influencer features
      if (sp.influencerFeatures > 10) {
        total += 10
      }
    }
  }

  return count > 0 ? Math.round(total / count) : 50
}

/**
 * Get influencer boost for outfit
 */
export function getInfluencerBoost(outfit: EnhancedProduct[]): number {
  let totalFeatures = 0

  for (const product of outfit) {
    const sp = getSocialProof(product)
    if (sp && typeof sp.influencerFeatures === 'number') {
      totalFeatures += sp.influencerFeatures
    }
  }

  // Diminishing returns: first 10 features = 10 points each, then 5, then 2
  if (totalFeatures <= 10) {
    return totalFeatures
  } else if (totalFeatures <= 20) {
    return 10 + (totalFeatures - 10) * 0.5
  } else {
    return 15 + (totalFeatures - 20) * 0.2
  }
}

/**
 * Get celebrity boost for outfit (for special occasions)
 */
export function getCelebrityBoost(outfit: EnhancedProduct[], occasion?: string): number {
  let celebrityCount = 0
  const celebrities = new Set<string>()

  for (const product of outfit) {
    const sp = getSocialProof(product)
    if (sp && sp.celebrityAssociations) {
      for (const celeb of sp.celebrityAssociations) {
        celebrities.add(celeb)
      }
    }
  }

  celebrityCount = celebrities.size

  // Higher boost for special occasions
  const occasionMultiplier = occasion === 'special' || occasion === 'wedding' ? 2 : 1

  return Math.min(20, celebrityCount * 5 * occasionMultiplier)
}

/**
 * Get all trending hashtags from outfit
 */
export function getOutfitHashtags(outfit: EnhancedProduct[]): string[] {
  const hashtags = new Set<string>()

  for (const product of outfit) {
    const sp = getSocialProof(product)
    if (sp && sp.hashtagTrending) {
      for (const tag of sp.hashtagTrending) {
        hashtags.add(tag)
      }
    }
  }

  return Array.from(hashtags)
}

/**
 * Calculate hashtag boost (more trending hashtags = higher boost)
 */
export function calculateHashtagBoost(outfit: EnhancedProduct[]): number {
  const hashtags = getOutfitHashtags(outfit)

  // Up to 10 points for 5+ unique hashtags
  return Math.min(10, hashtags.length * 2)
}

/**
 * Get social proof summary for outfit
 */
export function getSocialProofSummary(outfit: EnhancedProduct[]): SocialProofSummary {
  const trendStatuses: string[] = []
  const allHashtags: string[] = []
  const celebrityAssociations: string[] = []
  let totalPopularity = 0
  let totalConfidence = 0
  let totalInfluencer = 0
  let count = 0

  for (const product of outfit) {
    const sp = getSocialProof(product)
    if (sp) {
      if (sp.trendStatus) trendStatuses.push(sp.trendStatus)
      if (sp.hashtagTrending) allHashtags.push(...sp.hashtagTrending)
      if (sp.celebrityAssociations) celebrityAssociations.push(...sp.celebrityAssociations)
      totalPopularity += sp.popularityScore || 50
      totalConfidence += sp.trendConfidence || 50
      totalInfluencer += sp.influencerFeatures || 0
      count++
    }
  }

  // Find dominant trend
  const trendCounts = trendStatuses.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dominantTrend = Object.entries(trendCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'stable'

  return {
    avgPopularity: count > 0 ? Math.round(totalPopularity / count) : 50,
    avgTrendConfidence: count > 0 ? Math.round(totalConfidence / count) : 50,
    dominantTrend,
    totalInfluencerFeatures: totalInfluencer,
    allHashtags: Array.from(new Set(allHashtags)),
    celebrityAssociations: Array.from(new Set(celebrityAssociations)),
  }
}

// ============================================================================
// RANKING FUNCTIONS
// ============================================================================

/**
 * Create ranked outfit with all social proof metrics
 */
export function createRankedOutfit(products: EnhancedProduct[]): RankedOutfit {
  const trendScore = calculateTrendScore(products)
  const popularityScore = getPopularityScore(products)
  const influencerBoost = getInfluencerBoost(products)
  const hashtagBoost = calculateHashtagBoost(products)
  const summary = getSocialProofSummary(products)

  // Combined score: weighted average
  const combinedScore = Math.round(
    trendScore * 0.35 +
    popularityScore * 0.30 +
    influencerBoost * 0.15 +
    hashtagBoost * 0.10 +
    summary.avgTrendConfidence * 0.10
  )

  return {
    products,
    trendScore,
    popularityScore,
    influencerBoost,
    combinedScore,
    trendStatus: summary.dominantTrend,
    hashtags: summary.allHashtags,
  }
}

/**
 * Rank outfits by trend status and popularity
 */
export function rankByTrendStatus(outfits: EnhancedProduct[][]): TrendRankingResult {
  const rankedOutfits = outfits.map(products => createRankedOutfit(products))

  // Sort by combined score descending
  rankedOutfits.sort((a, b) => b.combinedScore - a.combinedScore)

  // Collect all trending hashtags
  const allHashtags = new Set<string>()
  for (const outfit of rankedOutfits) {
    for (const tag of outfit.hashtags) {
      allHashtags.add(tag)
    }
  }

  // Collect influencer styles
  const influencerStyles: string[] = []
  for (const outfit of rankedOutfits.slice(0, 3)) {
    for (const product of outfit.products) {
      const sp = getSocialProof(product)
      if (sp && sp.celebrityAssociations) {
        influencerStyles.push(...sp.celebrityAssociations)
      }
    }
  }

  return {
    outfits: rankedOutfits,
    trendingHashtags: Array.from(allHashtags).slice(0, 10),
    topInfluencerStyles: Array.from(new Set(influencerStyles)).slice(0, 5),
  }
}

/**
 * Filter products by trend status
 */
export function filterByTrendStatus(
  products: EnhancedProduct[],
  allowedStatuses: string[]
): EnhancedProduct[] {
  return products.filter(product => {
    const sp = getSocialProof(product)
    if (!sp) return true // Include products without social proof
    return allowedStatuses.includes(sp.trendStatus)
  })
}

/**
 * Get trending products (emerging or peak)
 */
export function getTrendingProducts(products: EnhancedProduct[]): EnhancedProduct[] {
  return filterByTrendStatus(products, ['emerging', 'peak', 'trending'])
}

/**
 * Get timeless products (classic or timeless)
 */
export function getTimelessProducts(products: EnhancedProduct[]): EnhancedProduct[] {
  return filterByTrendStatus(products, ['classic', 'timeless'])
}

/**
 * Balance outfit between trendy and timeless items
 */
export function balanceTrendAndTimeless(
  outfit: EnhancedProduct[],
  trendWeight: number = 0.5 // 0 = all timeless, 1 = all trendy
): {
  balanced: boolean
  currentRatio: number
  recommendation: string
} {
  let trendyCount = 0
  let timelessCount = 0

  for (const product of outfit) {
    const sp = getSocialProof(product)
    if (sp) {
      if (['emerging', 'peak', 'trending'].includes(sp.trendStatus)) {
        trendyCount++
      } else if (['classic', 'timeless'].includes(sp.trendStatus)) {
        timelessCount++
      }
    }
  }

  const total = trendyCount + timelessCount
  if (total === 0) {
    return {
      balanced: true,
      currentRatio: 0.5,
      recommendation: 'No trend data available',
    }
  }

  const currentRatio = trendyCount / total
  const balanced = Math.abs(currentRatio - trendWeight) < 0.3

  let recommendation = ''
  if (currentRatio > trendWeight + 0.3) {
    recommendation = 'Consider adding a classic/timeless piece for balance'
  } else if (currentRatio < trendWeight - 0.3) {
    recommendation = 'Consider adding a trending piece for freshness'
  } else {
    recommendation = 'Good balance of trending and timeless items'
  }

  return { balanced, currentRatio, recommendation }
}
