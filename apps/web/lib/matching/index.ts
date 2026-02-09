/**
 * KB Matching Modules
 * Exports all KB-integrated matching functions
 *
 * chore-kb003: KB integration with AI matching
 */

// Thai Cultural Matcher
export {
  validateThaiOccasion,
  getMonthSuitability,
  filterByMonth,
  checkThaiDayColor,
  getThaiClimateScore,
  isACFriendly,
  detectThaiOccasion,
  type ThaiOccasion,
  type ThaiValidationResult,
} from './thai-cultural-matcher'

// Visual Matching Scorer
export {
  calculateVisualBalance,
  getSilhouetteCompatibility,
  getThaiProportionScore,
  validateProportionEffects,
  hasStatementPiece,
  getOutfitStyleMoods,
  type VisualBalanceScore,
  type SilhouetteCompatibility,
} from './visual-matching-scorer'

// Cross-Product Matcher
export {
  findPerfectMatches,
  calculatePairingScore,
  validateEssentialPairings,
  checkLayeringCompatibility,
  checkOutfitCompleteness,
  getOutfitVersatilityScore,
  calculateOutfitCompatibility,
  type PairingResult,
  type EssentialPairingResult,
  type LayeringResult,
} from './cross-product-matcher'

// Price Intelligence Optimizer
export {
  calculateOutfitCostPerWear,
  getOutfitCostPerWearTier,
  getValueTierMatch,
  getQualityTierScore,
  countInvestmentPieces,
  countCapsuleItems,
  getTimelessScore,
  getExpectedWears,
  calculateValueScore,
  createOutfitWithValue,
  optimizeOutfitBudget,
  filterByCostPerWear,
  getSaleTimingRecommendations,
  recommendCapsuleItems,
  type BudgetOptimizationResult,
  type OutfitWithValue,
  type ValueTierMatch,
} from './price-intelligence-optimizer'

// Social Proof Ranker
export {
  getProductTrendScore,
  calculateTrendScore,
  getTrendConfidence,
  getPopularityScore,
  getInfluencerBoost,
  getCelebrityBoost,
  getOutfitHashtags,
  calculateHashtagBoost,
  getSocialProofSummary,
  createRankedOutfit,
  rankByTrendStatus,
  filterByTrendStatus,
  getTrendingProducts,
  getTimelessProducts,
  balanceTrendAndTimeless,
  type TrendRankingResult,
  type RankedOutfit,
  type SocialProofSummary,
} from './social-proof-ranker'
