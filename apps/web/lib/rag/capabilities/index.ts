/**
 * Capabilities Module - Public API
 *
 * Unified exports for the Fashion Expert Agent capabilities.
 * Provides high-level functions for style analysis and trend awareness
 * that leverage the RAG retrieval infrastructure.
 *
 * Phase 4: Agent Capabilities
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-19
 */

// Style Analyzer exports
export {
  analyzeStyle,
  getStyleRecommendations,
  matchStylingRules,
} from './style-analyzer';

export type {
  StyleAnalysisResult,
  StyleRecommendationResult,
  StylingRulesResult,
} from './style-analyzer';

// Trend Awareness exports
export {
  detectCurrentThaiSeason,
  getSeasonName,
  getCurrentTrends,
  getTrendingForOccasion,
} from './trend-awareness';

export type {
  TrendResult,
  OccasionTrendResult,
} from './trend-awareness';

// Import functions for interface typing
import {
  analyzeStyle,
  getStyleRecommendations,
  matchStylingRules,
} from './style-analyzer';

import {
  getCurrentTrends,
  getTrendingForOccasion,
} from './trend-awareness';

/**
 * Unified interface for all Fashion Expert Agent capabilities
 *
 * This interface provides a single access point for all capability functions,
 * making it easy to inject or mock capabilities in different contexts.
 *
 * @example
 * ```typescript
 * import { fashionExpertCapabilities } from './lib/rag';
 *
 * // Use individual capabilities
 * const styleResult = await fashionExpertCapabilities.analyzeStyle("minimal casual look");
 * const trends = await fashionExpertCapabilities.getCurrentTrends();
 * ```
 */
export interface FashionExpertCapabilities {
  // Style Analysis
  /**
   * Analyze style from user description
   * @see analyzeStyle
   */
  analyzeStyle: typeof analyzeStyle;

  /**
   * Get personalized style recommendations based on user profile
   * @see getStyleRecommendations
   */
  getStyleRecommendations: typeof getStyleRecommendations;

  /**
   * Match styling rules for body type and occasion
   * @see matchStylingRules
   */
  matchStylingRules: typeof matchStylingRules;

  // Trend Awareness
  /**
   * Get current fashion trends for a Thai season
   * @see getCurrentTrends
   */
  getCurrentTrends: typeof getCurrentTrends;

  /**
   * Get trending items for a specific occasion
   * @see getTrendingForOccasion
   */
  getTrendingForOccasion: typeof getTrendingForOccasion;
}

/**
 * Pre-configured Fashion Expert capabilities instance
 *
 * Provides access to all capability functions through a single object.
 * Useful for dependency injection and testing.
 *
 * @example
 * ```typescript
 * import { fashionExpertCapabilities } from './lib/rag';
 *
 * async function analyzeUserStyle(description: string) {
 *   const result = await fashionExpertCapabilities.analyzeStyle(description);
 *   return result.styleTraits;
 * }
 * ```
 */
export const fashionExpertCapabilities: FashionExpertCapabilities = {
  // Style Analysis
  analyzeStyle,
  getStyleRecommendations,
  matchStylingRules,

  // Trend Awareness
  getCurrentTrends,
  getTrendingForOccasion,
};

export default fashionExpertCapabilities;
