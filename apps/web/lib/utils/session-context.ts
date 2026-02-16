/**
 * Session Context Utilities
 *
 * Manages session-based product tracking for duplicate prevention.
 * Provides functions to create, update, and reset session context.
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 3.1 - Create session context utilities
 *
 * @version 1.0.0
 * @created 2025-10-14
 */

import type { SessionContext } from '../types/chat-types';

/**
 * Creates a new session context
 *
 * @param sessionId - Optional session identifier
 * @returns New SessionContext object
 */
export function createSessionContext(sessionId?: string): SessionContext {
  return {
    recommendedProductIds: [],
    sessionId: sessionId || generateSessionId(),
    createdAt: new Date(),
    askedClarifications: [], // Array instead of Set for JSON serialization
    conversationContext: {},
    dialoguePhase: 'clarification', // Start in clarification phase (v2.1)
    clarificationTurnCount: 0, // Track clarification turns (v2.1)
    hasProvidedRecommendations: false, // No recommendations yet (v2.2)
    recommendationCount: 0, // Track recommendation rounds (v2.2)
    followUpResponseMode: 'auto', // Dynamic follow-up mode (v5.6)
  };
}

/**
 * Updates session context with newly recommended products
 *
 * @param context - Current session context
 * @param newProductIds - Array of newly recommended product SKUs
 * @param askedClarification - Type of clarification that was just asked (if any)
 * @param conversationContext - Updated conversation context (if any)
 * @returns Updated SessionContext object
 */
export function updateSessionContext(
  context: SessionContext,
  newProductIds: string[],
  askedClarification?: 'gender' | 'occasion' | 'destination' | 'budget',
  conversationContext?: Partial<SessionContext['conversationContext']>
): SessionContext {
  // Use Set to avoid duplicates within the update itself
  const uniqueIds = new Set([...context.recommendedProductIds, ...newProductIds]);

  // Update asked clarifications (using Array to avoid duplicates)
  const currentAsked = context.askedClarifications || [];
  const updatedAskedClarifications = askedClarification && !currentAsked.includes(askedClarification)
    ? [...currentAsked, askedClarification]
    : currentAsked;

  // Update conversation context
  const updatedConversationContext = {
    ...context.conversationContext,
    ...conversationContext,
  };

  // Update dialogue phase and turn count (v2.1 - Loop Prevention)
  let dialoguePhase = context.dialoguePhase || 'clarification';
  let clarificationTurnCount = context.clarificationTurnCount || 0;

  // v2.2: Track recommendation state for POST-RECOMMENDATION LOCKOUT
  let hasProvidedRecommendations = context.hasProvidedRecommendations || false;
  let recommendationCount = context.recommendationCount || 0;

  // If asking a clarification, increment turn count and stay in clarification phase
  // ONLY if we haven't provided recommendations yet (POST-RECOMMENDATION LOCKOUT)
  if (askedClarification && !hasProvidedRecommendations) {
    clarificationTurnCount = updatedAskedClarifications.length;
    dialoguePhase = 'clarification';
  }

  // If recommending products, transition to appropriate phase
  if (newProductIds.length > 0) {
    // v2.2: Check if this is first recommendation (Step 3) or follow-up (Step 4)
    if (!hasProvidedRecommendations) {
      // First time recommending - Step 3 (RECOMMENDATION phase)
      dialoguePhase = 'recommendation';
      hasProvidedRecommendations = true;
      recommendationCount = 1;
      console.log('[Session Context] 🎯 Step 3: First recommendations provided - POST-RECOMMENDATION LOCKOUT ACTIVE');
    } else {
      // Already recommended before - Step 4 (FOLLOW-UP phase)
      dialoguePhase = 'follow-up';
      recommendationCount += 1;
      console.log(`[Session Context] 🔄 Step 4: Follow-up recommendations (round ${recommendationCount})`);
    }
  }

  return {
    ...context,
    recommendedProductIds: Array.from(uniqueIds),
    askedClarifications: updatedAskedClarifications,
    conversationContext: updatedConversationContext,
    dialoguePhase,
    clarificationTurnCount,
    hasProvidedRecommendations,
    recommendationCount,
  };
}

/**
 * Resets session context (clears all recommended products)
 *
 * @param context - Current session context
 * @param newSessionId - Optional new session ID (generates one if not provided)
 * @returns Reset SessionContext object
 */
export function resetSessionContext(context: SessionContext, newSessionId?: string): SessionContext {
  return {
    ...context,
    recommendedProductIds: [],
    sessionId: newSessionId || generateSessionId(),
    createdAt: new Date(),
    askedClarifications: [], // Array instead of Set
    conversationContext: {},
    dialoguePhase: 'clarification', // Reset to clarification phase (v2.1)
    clarificationTurnCount: 0, // Reset turn count (v2.1)
    hasProvidedRecommendations: false, // Reset recommendation flag (v2.2)
    recommendationCount: 0, // Reset recommendation count (v2.2)
    followUpResponseMode: 'auto', // Reset to automatic mode
  };
}

/**
 * Checks if a product has been recommended in this session
 *
 * @param context - Session context
 * @param productId - Product SKU to check
 * @returns True if product has been recommended
 */
export function isProductRecommended(context: SessionContext, productId: string): boolean {
  return context.recommendedProductIds.includes(productId);
}

/**
 * Gets the count of recommended products in session
 *
 * @param context - Session context
 * @returns Number of recommended products
 */
export function getRecommendedProductCount(context: SessionContext): number {
  return context.recommendedProductIds.length;
}

/**
 * Checks if session should be reset based on user message
 *
 * @param message - User message to check
 * @returns True if session should be reset
 */
export function shouldResetSession(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  const resetTriggers = [
    'เริ่มใหม่',
    'ลืมการสนทนาก่อนหน้า',
    'reset',
    'start over',
    'new conversation',
    'clear history',
    'ลืมที่แนะนำไป',
    'แนะนำใหม่',
  ];

  return resetTriggers.some((trigger) => lowerMessage.includes(trigger));
}

/**
 * Generates a unique session ID
 *
 * @returns Unique session ID string
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Formats session context for AI consumption
 * Converts the context into a readable format for the AI system prompt
 *
 * @param context - Session context
 * @returns Formatted string for AI
 */
export function formatSessionContextForAI(context: SessionContext): string {
  if (context.recommendedProductIds.length === 0) {
    return 'No products recommended yet in this session.';
  }

  return `Previously recommended products in this session:
${context.recommendedProductIds.map((id, index) => `${index + 1}. ${id}`).join('\n')}

Total: ${context.recommendedProductIds.length} products

IMPORTANT: Do NOT recommend any of these products again. Filter them out before making recommendations.`;
}

/**
 * Creates a session context from conversation history
 * Useful when reconstructing session from existing conversation
 *
 * @param conversationHistory - Array of messages with product references
 * @returns SessionContext reconstructed from history
 */
export function createSessionContextFromHistory(
  conversationHistory: Array<{ role: string; content: string }>
): SessionContext {
  const productIds = new Set<string>();

  // Simple pattern matching for product IDs (e.g., "SKU-001", "CEN-123456")
  const productIdPattern = /(?:SKU-|CEN-)[\w-]+/g;

  for (const message of conversationHistory) {
    if (message.role === 'assistant') {
      const matches = message.content.match(productIdPattern);
      if (matches) {
        matches.forEach((id) => productIds.add(id));
      }
    }
  }

  return {
    recommendedProductIds: Array.from(productIds),
    sessionId: generateSessionId(),
    createdAt: new Date(),
    askedClarifications: [], // Array instead of Set
    conversationContext: {},
  };
}

/**
 * Validates session context integrity
 *
 * @param context - Session context to validate
 * @returns True if valid, false otherwise
 */
export function isValidSessionContext(context: any): context is SessionContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    Array.isArray(context.recommendedProductIds) &&
    context.recommendedProductIds.every((id: any) => typeof id === 'string')
  );
}
