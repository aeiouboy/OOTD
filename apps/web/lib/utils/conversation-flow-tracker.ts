/**
 * Conversation Flow Tracker
 *
 * Tracks conversation turns and enforces MAX 2 clarifications rule.
 * Part of loop prevention system.
 *
 * Related: tasks-0006-prd-system-prompt-enhancement-guardrails-LOOP-FIX.md (Sub-task 9.3)
 *
 * @version 1.0.0
 * @created 2025-10-15
 */

import type { SessionContext } from '../types/chat-types'

/**
 * Conversation turn statistics
 */
export interface ConversationTurnStats {
  /** Total clarification questions asked */
  clarificationTurns: number
  /** Total recommendation turns (should be at least 1) */
  recommendationTurns: number
  /** Total user messages */
  userTurns: number
  /** Has exceeded max clarifications (2) */
  exceededClarificationLimit: boolean
  /** Should force recommendations now */
  shouldForceRecommendations: boolean
  /** Whether we're in follow-up phase (v2.2 - Step 4) */
  isFollowUpPhase: boolean
  /** Whether POST-RECOMMENDATION LOCKOUT is active (v2.2 - Step 4) */
  isPostRecommendationLockout: boolean
}

/**
 * Track conversation turns from session context
 *
 * @param sessionContext Current session context
 * @returns Turn statistics
 */
export function trackConversationTurns(
  sessionContext: SessionContext
): ConversationTurnStats {
  const clarificationTurns = sessionContext.askedClarifications.length

  // v2.2: Use hasProvidedRecommendations for more accurate tracking
  const hasProvidedRecommendations = sessionContext.hasProvidedRecommendations || false
  const recommendationCount = sessionContext.recommendationCount || 0

  // Recommendation turns = actual count of recommendation rounds
  const recommendationTurns = recommendationCount > 0 ? recommendationCount : (sessionContext.recommendedProductIds.length > 0 ? 1 : 0)

  // Exceeded limit if asked 2+ clarifications
  const exceededClarificationLimit = clarificationTurns >= 2

  // Should force recommendations if:
  // 1. Asked 2 clarifications AND
  // 2. Haven't provided recommendations yet
  const shouldForceRecommendations =
    clarificationTurns >= 2 && !hasProvidedRecommendations

  // v2.2: Check if in follow-up phase (Step 4)
  const isFollowUpPhase = sessionContext.dialoguePhase === 'follow-up' || recommendationTurns >= 2
  const isPostRecommendationLockout = hasProvidedRecommendations

  return {
    clarificationTurns,
    recommendationTurns,
    userTurns: 0, // Will be calculated from conversation history if needed
    exceededClarificationLimit,
    shouldForceRecommendations,
    isFollowUpPhase,
    isPostRecommendationLockout,
  }
}

/**
 * Check if we can ask another clarification
 *
 * @param sessionContext Current session context
 * @returns True if can ask clarification, false if exceeded limit
 */
export function canAskClarification(sessionContext: SessionContext): boolean {
  const stats = trackConversationTurns(sessionContext)
  return !stats.exceededClarificationLimit
}

/**
 * Get clarification count
 *
 * @param sessionContext Current session context
 * @returns Number of clarifications asked (0, 1, or 2)
 */
export function getClarificationCount(sessionContext: SessionContext): number {
  return sessionContext.askedClarifications.length
}

/**
 * Check if should force recommendations (hit limit OR in follow-up phase)
 * v2.2: Also returns true if POST-RECOMMENDATION LOCKOUT is active (Step 4)
 *
 * @param sessionContext Current session context
 * @returns True if should force recommendations
 */
export function shouldForceRecommendations(sessionContext: SessionContext): boolean {
  const stats = trackConversationTurns(sessionContext)
  // Force recommendations if:
  // 1. Hit clarification limit (original logic), OR
  // 2. POST-RECOMMENDATION LOCKOUT is active (Step 4)
  return stats.shouldForceRecommendations || stats.isPostRecommendationLockout
}

/**
 * Get remaining clarifications allowed
 *
 * @param sessionContext Current session context
 * @returns Number of clarifications remaining (2, 1, or 0)
 */
export function getRemainingClarifications(sessionContext: SessionContext): number {
  const count = getClarificationCount(sessionContext)
  return Math.max(0, 2 - count)
}

/**
 * Validate turn flow for debugging
 * Returns warnings if conversation flow is problematic
 *
 * @param sessionContext Current session context
 * @returns Array of warning messages (empty if OK)
 */
export function validateTurnFlow(sessionContext: SessionContext): string[] {
  const warnings: string[] = []
  const stats = trackConversationTurns(sessionContext)

  // Warning 1: Too many clarifications
  if (stats.clarificationTurns > 2) {
    warnings.push(
      `⚠️ LOOP WARNING: Asked ${stats.clarificationTurns} clarifications (MAX: 2)`
    )
  }

  // Warning 2: Clarifications without recommendations
  if (stats.clarificationTurns >= 2 && stats.recommendationTurns === 0) {
    warnings.push(
      '⚠️ STUCK WARNING: Asked 2 clarifications but no recommendations yet - should force recommendations'
    )
  }

  // Warning 3: Multiple clarifications of same type (shouldn't happen)
  const clarificationTypes = sessionContext.askedClarifications
  const uniqueTypes = new Set(clarificationTypes)
  if (clarificationTypes.length !== uniqueTypes.size) {
    warnings.push(
      '⚠️ DUPLICATE WARNING: Asked same clarification type multiple times'
    )
  }

  return warnings
}

/**
 * Format turn stats for logging
 *
 * @param sessionContext Current session context
 * @returns Formatted string for logging
 */
export function formatTurnStats(sessionContext: SessionContext): string {
  const stats = trackConversationTurns(sessionContext)

  return [
    `[Turn Stats]`,
    `  Clarifications: ${stats.clarificationTurns}/2`,
    `  Recommendations: ${stats.recommendationTurns > 0 ? `Yes (${stats.recommendationTurns} rounds)` : 'No'}`,
    `  Exceeded Limit: ${stats.exceededClarificationLimit ? 'YES ⚠️' : 'No'}`,
    `  Force Recommendations: ${stats.shouldForceRecommendations ? 'YES 🔴' : 'No'}`,
    `  POST-RECOMMENDATION LOCKOUT: ${stats.isPostRecommendationLockout ? 'ACTIVE 🔒' : 'No'}`,
    `  Follow-up Phase (Step 4): ${stats.isFollowUpPhase ? 'YES 🔄' : 'No'}`,
  ].join('\n')
}

/**
 * Get turn flow recommendation
 * Returns suggested action based on current state
 * v2.2: Added 'must-recommend-followup' for Step 4
 *
 * @param sessionContext Current session context
 * @returns Suggested action
 */
export function getTurnFlowRecommendation(
  sessionContext: SessionContext
): 'can-clarify' | 'should-clarify-last' | 'must-recommend' | 'must-recommend-followup' {
  const count = getClarificationCount(sessionContext)
  const stats = trackConversationTurns(sessionContext)

  // v2.2: If POST-RECOMMENDATION LOCKOUT is active, must recommend (follow-up mode)
  if (stats.isPostRecommendationLockout) {
    return 'must-recommend-followup' // Step 4: NEVER ask questions, only recommend
  }

  if (count === 0) {
    return 'can-clarify' // Can ask first clarification
  } else if (count === 1) {
    return 'should-clarify-last' // Can ask second (last) clarification
  } else {
    return 'must-recommend' // Must provide recommendations now (Step 3)
  }
}

/**
 * Check if currently in follow-up phase (Step 4)
 *
 * @param sessionContext Current session context
 * @returns True if in follow-up phase
 */
export function isInFollowUpPhase(sessionContext: SessionContext): boolean {
  const stats = trackConversationTurns(sessionContext)
  return stats.isFollowUpPhase
}
