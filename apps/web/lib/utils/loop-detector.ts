/**
 * Loop Detector
 *
 * System-level response interceptor that detects conversational loops
 * and triggers retry with force recommendation instruction.
 *
 * Related: tasks-0006-prd-system-prompt-enhancement-guardrails-LOOP-FIX.md (Sub-task 9.10)
 *
 * @version 1.0.0
 * @created 2025-10-15
 */

import type { SessionContext } from '../types/chat-types'
import { detectLoop as detectLoopPattern } from './response-validator'

/**
 * Loop detection result
 */
export interface LoopDetectionResult {
  /** Whether a loop was detected */
  isLoop: boolean
  /** Type of loop detected */
  loopType?: 'only-questions' | 'exceeds-turns' | 'no-content' | 'multiple-clarifications'
  /** Reason for loop detection */
  reason?: string
  /** Suggested action */
  suggestedAction?: 'retry-with-force' | 'use-fallback' | 'allow-response'
}

/**
 * Detects if AI response is a conversational loop
 *
 * Loop indicators:
 * 1. Response contains only questions (no recommendations/tips)
 * 2. Turn count exceeds limit without providing products/tips
 * 3. Response is empty or too short
 * 4. Response asks for more clarification after limit reached
 *
 * @param response - AI response text
 * @param sessionContext - Current session context
 * @param turnCount - Current clarification turn count
 * @returns Loop detection result
 */
export function detectLoop(
  response: string,
  sessionContext: SessionContext,
  turnCount?: number
): LoopDetectionResult {
  // Use turn count from parameter or session context
  const currentTurnCount = turnCount !== undefined ? turnCount : sessionContext.clarificationTurnCount || 0

  // Check 1: Empty or very short response (likely error or incomplete)
  if (!response || response.trim().length < 20) {
    return {
      isLoop: true,
      loopType: 'no-content',
      reason: 'Response is empty or too short',
      suggestedAction: 'retry-with-force',
    }
  }

  // Check 2: Response is only questions (using validator's detectLoopPattern)
  if (detectLoopPattern(response)) {
    return {
      isLoop: true,
      loopType: 'only-questions',
      reason: 'Response contains only questions without recommendations or tips',
      suggestedAction: 'retry-with-force',
    }
  }

  // Check 3: Exceeded turn limit but no products recommended
  if (currentTurnCount >= 2 && sessionContext.recommendedProductIds.length === 0) {
    // Check if response has products/tips
    const hasContent = hasRecommendationContent(response)

    if (!hasContent) {
      return {
        isLoop: true,
        loopType: 'exceeds-turns',
        reason: `Turn count: ${currentTurnCount}/2. No recommendations provided yet.`,
        suggestedAction: 'retry-with-force',
      }
    }
  }

  // Check 4: Multiple clarification questions in one response
  const questionCount = (response.match(/\?/g) || []).length
  if (questionCount >= 2 && response.length < 500) {
    return {
      isLoop: true,
      loopType: 'multiple-clarifications',
      reason: `Response contains ${questionCount} questions - should ask max 1 at a time`,
      suggestedAction: 'retry-with-force',
    }
  }

  // No loop detected
  return {
    isLoop: false,
    suggestedAction: 'allow-response',
  }
}

/**
 * Checks if response has recommendation content (products or tips)
 *
 * @param response - AI response text
 * @returns True if has recommendation content
 */
function hasRecommendationContent(response: string): boolean {
  const contentIndicators = [
    // Product indicators
    /👔/,
    /👗/,
    /💰/,
    /🔗/,
    /price|ราคา/i,
    /link|ลิงก์/i,
    /baht|บาท|thb/i,
    /brand|ยี่ห้อ/i,

    // Tip indicators
    /💡/,
    /✨/,
    /tip|เคล็ดลับ|วิธี/i,
    /how to|อย่างไร/i,
    /\d+\.\s+/,  // Numbered list
    /[•\-]\s+/,  // Bullet list
  ]

  return contentIndicators.some((pattern) => pattern.test(response))
}

/**
 * Generates force recommendation instruction for retry
 *
 * @param loopType - Type of loop detected
 * @param turnCount - Current turn count
 * @returns Force instruction text
 */
export function generateForceInstruction(
  loopType?: string,
  turnCount?: number
): string {
  const baseInstruction = `[CRITICAL OVERRIDE - LOOP DETECTED]

Your previous response did not provide recommendations. This is a conversational loop violation.

You MUST now provide outfit recommendations (Template A) or styling tips (Template B) IMMEDIATELY.

DO NOT:
- Ask another clarifying question
- Request more information
- Ask for confirmation
- Engage in chitchat

DO:
- Provide 3-5 product recommendations (for CLOTHS) with prices and links
- OR provide 1-3 practical tips (for OTHER) without prices/links
- Follow the template structure exactly
- Make reasonable assumptions with available information

MANDATORY: Your response MUST include recommendations. No exceptions.`

  if (loopType === 'exceeds-turns') {
    return `${baseInstruction}\n\nREASON: You have asked ${turnCount} clarifying questions. The maximum is 2. You MUST provide recommendations now.`
  }

  if (loopType === 'only-questions') {
    return `${baseInstruction}\n\nREASON: Your previous response contained only questions. You must provide recommendations, not more questions.`
  }

  if (loopType === 'multiple-clarifications') {
    return `${baseInstruction}\n\nREASON: You asked multiple questions at once. Ask ONE question maximum, or better: provide recommendations immediately.`
  }

  return baseInstruction
}

/**
 * Checks if should trigger loop detection
 * Only trigger detection after first user turn to avoid false positives on greeting
 *
 * @param conversationHistory - Conversation history
 * @returns True if should check for loops
 */
export function shouldCheckForLoop(
  conversationHistory?: Array<{ role: string; content: string }>
): boolean {
  if (!conversationHistory || conversationHistory.length === 0) {
    return false // Don't check on first message
  }

  // Check if there's been at least one user message
  const userMessageCount = conversationHistory.filter((m) => m.role === 'user').length
  return userMessageCount >= 1
}

/**
 * Formats loop detection result for logging
 *
 * @param result - Loop detection result
 * @returns Formatted string
 */
export function formatLoopDetection(result: LoopDetectionResult): string {
  if (!result.isLoop) {
    return '[Loop Detector] ✅ No loop detected - response is valid'
  }

  const lines: string[] = []
  lines.push(`[Loop Detector] 🔴 LOOP DETECTED`)
  lines.push(`  Type: ${result.loopType}`)
  lines.push(`  Reason: ${result.reason}`)
  lines.push(`  Action: ${result.suggestedAction}`)

  return lines.join('\n')
}

/**
 * Export all utilities
 */
export default {
  detectLoop,
  generateForceInstruction,
  shouldCheckForLoop,
  formatLoopDetection,
}
