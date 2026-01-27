/**
 * AI Chat Service
 * Handles AI-powered fashion recommendations using Claude via OpenRouter
 *
 * Enhanced with:
 * - Session-based duplicate prevention
 * - System Prompt v2.3 integration (OOT Persona + Loop Prevention)
 * - OOT Persona (bestie personality, Thai-English code-switching)
 * - Knowledge Base integration for fashion expertise
 * - Smart clarification logic with turn limits
 * - Topic guardrails
 * - Force recommendation mode after 2 clarifications
 * - RAG-based knowledge retrieval with semantic search (v3.0)
 *
 * @version 3.0.0
 * @lastUpdated 2025-12-19
 */

import type { EnhancedProduct } from '../types/product-types'
import { createOutfitPrompt, serializeForAI } from '../utils/ai-serializer'
import { applyFilters } from '../utils/product-filters'
import { mapProductToOccasions } from '../categorization/occasion-mapper'
import type { OccasionType } from '../types/enums'
import type { SessionContext } from '../types/chat-types'
import {
  createSessionContext,
  updateSessionContext,
  shouldResetSession,
  formatSessionContextForAI,
} from '../utils/session-context'
import {
  filterDuplicateProducts,
  extractProductIds,
  filterAndValidateProducts,
} from '../utils/duplicate-filter'
import { getActiveSystemPrompt, VersionUtils } from '../prompts/prompt-version'
import {
  detectKnowledgeTopics,
  formatKnowledgeForPrompt,
  getKnowledgeSummary,
} from '../knowledge/fashion-summaries'
// RAG imports (v3.0)
import {
  getRAGService,
  buildFashionContext,
  type RetrievalResult,
  type RetrievalOptions,
} from '../rag'
import {
  analyzeUserQuery,
  getClarificationsNeeded,
  formatClarificationQuestions,
  isAnsweringClarification,
} from '../utils/clarification-detector'
import { checkGuardrails } from '../utils/guardrail-detector'
import {
  trackConversationTurns,
  shouldForceRecommendations as shouldForceRecommendationsUtil,
  getClarificationCount,
  formatTurnStats,
} from '../utils/conversation-flow-tracker'
import {
  detectLoop,
  generateForceInstruction,
  shouldCheckForLoop,
  formatLoopDetection,
  type LoopDetectionResult,
} from '../utils/loop-detector'
import {
  validateResponseStructure,
  validateResponseWithPhase,
  formatValidationErrors,
} from '../utils/response-validator'
import {
  detectCategory,
  getTemplateInstruction,
  formatCategoryDetection,
} from '../utils/category-detector'
import {
  detectFollowUpRequest,
  generateFollowUpInstruction,
  formatFollowUpDetection,
} from '../utils/follow-up-handler'
import {
  detectImageRequest,
  extractOutfitDescription,
} from '../utils/image-trigger-detector'

export interface ChatRequest {
  message: string
  userPreferences?: {
    budget?: number
    style?: string[]
    colors?: string[]
    gender?: 'men' | 'women'
    userName?: string
    ageRange?: string
    stylePreferences?: string[]
  }
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  /** Session context for duplicate prevention (v2.0) */
  sessionContext?: SessionContext
  /** Conversation ID for session tracking (v2.0) */
  conversationId?: string
}

export interface ChatResponse {
  message: string
  recommendedProducts?: EnhancedProduct[]
  occasion?: OccasionType
  reasoning?: string
  /** Updated session context after recommendations (v2.0) */
  sessionContext?: SessionContext
  /** Image generation request flag (v3.1) */
  imageRequest?: boolean
  /** Outfit description for image generation (v3.1) */
  outfitDescription?: string
}

/**
 * Detect occasion from user message
 */
export function detectOccasion(message: string): OccasionType | undefined {
  const lowerMessage = message.toLowerCase()

  const occasionKeywords: Record<OccasionType, string[]> = {
    work: ['work', 'office', 'meeting', 'presentation', 'ทำงาน', 'ออฟฟิศ', 'ประชุม'],
    chill: ['chill', 'relax', 'weekend', 'casual', 'วันหยุด', 'ชิลล์', 'สบายๆ'],
    wedding: ['wedding', 'งานแต่ง', 'แต่งงาน'],
    sport: ['sport', 'gym', 'workout', 'exercise', 'ออกกำลัง', 'วิ่ง', 'ฟิตเนส'],
    travel: ['travel', 'trip', 'vacation', 'ท่องเที่ยว', 'เที่ยว'],
    date: ['date', 'romantic', 'เดท', 'โรแมนติก'],
    dinner: ['dinner', 'restaurant', 'dining', 'ดินเนอร์', 'ร้านอาหาร'],
    cafe: ['cafe', 'coffee', 'brunch', 'คาเฟ่', 'กาแฟ'],
    party: ['party', 'celebration', 'event', 'ปาร์ตี้', 'งานเลี้ยง', 'งานสังสรรค์'],
  }

  for (const [occasion, keywords] of Object.entries(occasionKeywords)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return occasion as OccasionType
    }
  }

  return undefined
}

/**
 * Extract budget from user message
 */
export function extractBudget(message: string): number | undefined {
  const budgetPatterns = [
    /(?:budget|ราคา|งบ).*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})*)\s*(?:baht|บาท|thb)/i,
    /(?:under|below|ไม่เกิน).*?(\d{1,3}(?:,\d{3})*)/i,
  ]

  for (const pattern of budgetPatterns) {
    const match = message.match(pattern)
    if (match) {
      const budgetStr = match[1].replace(/,/g, '')
      return parseFloat(budgetStr)
    }
  }

  return undefined
}

/**
 * Extract gender preference from message
 */
export function extractGender(message: string): 'men' | 'women' | undefined {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('men') && !lowerMessage.includes('women')) {
    return 'men'
  }
  if (lowerMessage.includes('women') || lowerMessage.includes('woman') || lowerMessage.includes('ผู้หญิง')) {
    return 'women'
  }
  if (lowerMessage.includes('ผู้ชาย')) {
    return 'men'
  }

  return undefined
}

/**
 * RAG-based knowledge retrieval with fallback to keyword-based (v3.0)
 *
 * Attempts semantic retrieval first, falls back to keyword-based on failure.
 * Returns both the knowledge context and retrieved document IDs.
 */
interface RAGRetrievalResult {
  knowledgeContext: string
  retrievedIds: string[]
  usedFallback: boolean
}

async function retrieveKnowledgeWithRAG(
  message: string,
  detectedGender?: 'men' | 'women',
  detectedOccasion?: string
): Promise<RAGRetrievalResult> {
  try {
    const ragService = getRAGService()

    // Build retrieval options with filters based on detected context
    const retrievalOptions: RetrievalOptions = {
      topK: 5,
      threshold: 0.7,
      filters: {},
    }

    // Add gender filter if detected
    if (detectedGender) {
      retrievalOptions.filters!.gender = detectedGender
    }

    // Add occasion filter if detected
    if (detectedOccasion) {
      retrievalOptions.filters!.occasion = detectedOccasion
    }

    console.log('[AI Chat] RAG: Attempting semantic retrieval with options:', {
      topK: retrievalOptions.topK,
      threshold: retrievalOptions.threshold,
      filters: retrievalOptions.filters,
    })

    // Perform RAG retrieval
    const retrievalResult = await ragService.retrieve(message, retrievalOptions)

    // Check if we got meaningful results
    if (retrievalResult.documents.length > 0) {
      // Build fashion context from retrieved documents
      const knowledgeContext = buildFashionContext(retrievalResult, message)

      // Extract document IDs for caching
      const retrievedIds = retrievalResult.documents.map((doc) => doc.id)

      console.log(
        `[AI Chat] RAG: Retrieved ${retrievalResult.documents.length} documents (${retrievalResult.metadata.tokenCount} tokens in ${retrievalResult.metadata.retrievalTimeMs}ms)`
      )
      console.log('[AI Chat] RAG: Document IDs:', retrievedIds)

      return {
        knowledgeContext,
        retrievedIds,
        usedFallback: false,
      }
    } else {
      // No documents found, use fallback
      console.warn('[AI Chat] RAG: No documents found, falling back to keyword-based retrieval')
      return useKeywordFallback(message)
    }
  } catch (error) {
    // RAG failed, use fallback
    console.error('[AI Chat] RAG: Retrieval failed, falling back to keyword-based:', error)
    return useKeywordFallback(message)
  }
}

/**
 * Keyword-based fallback for knowledge retrieval
 * Used when RAG fails or returns no results
 */
function useKeywordFallback(message: string): RAGRetrievalResult {
  const knowledgeTopics = detectKnowledgeTopics(message)
  const knowledgeContext = formatKnowledgeForPrompt(knowledgeTopics)

  if (knowledgeTopics.length > 0 && knowledgeTopics[0] !== 'general') {
    console.log(`[AI Chat] Fallback: Using keyword-based retrieval - topics: ${knowledgeTopics.join(', ')}`)
  }

  return {
    knowledgeContext,
    retrievedIds: [], // No IDs for keyword-based retrieval
    usedFallback: true,
  }
}

/**
 * Filter products based on user request
 */
export function filterProductsForRequest(
  products: EnhancedProduct[],
  request: ChatRequest,
  occasion?: OccasionType
): EnhancedProduct[] {
  const { message, userPreferences } = request

  // Extract budget from message if not in preferences
  const budget = userPreferences?.budget || extractBudget(message)
  const gender = userPreferences?.gender || extractGender(message)

  // Apply filters
  let filtered = applyFilters(products, {
    gender: gender,
    occasions: occasion ? [occasion] : undefined,
    priceRange: budget ? { min: 0, max: budget } : undefined,
    availability: ['in_stock', 'low_stock'],
  })

  // If no results and we have an occasion, try without occasion filter
  if (filtered.length === 0 && occasion) {
    filtered = applyFilters(products, {
      gender: gender,
      priceRange: budget ? { min: 0, max: budget } : undefined,
      availability: ['in_stock', 'low_stock'],
    })
  }

  // If still no results, return all available products
  if (filtered.length === 0) {
    filtered = applyFilters(products, {
      availability: ['in_stock', 'low_stock'],
    })
  }

  return filtered
}

/**
 * Call OpenRouter API with Claude
 * Enhanced with System Prompt v2.1 and session context
 * v2.1: Added force recommendation mode injection
 */
async function callOpenRouter(
  prompt: string,
  conversationHistory?: Array<{ role: string; content: string }>,
  sessionContext?: SessionContext,
  forceRecommendation?: boolean
) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  // Build messages array with system prompt v2.1
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT_V2,
    },
    ...(conversationHistory || []),
    {
      role: 'user',
      content: prompt,
    },
  ]

  // Add session context to user message if provided
  if (sessionContext && sessionContext.recommendedProductIds.length > 0) {
    const sessionInfo = formatSessionContextForAI(sessionContext)
    messages[messages.length - 1].content = `${sessionInfo}\n\n${prompt}`
  }

  // v2.1: CRITICAL - Force Recommendation Mode Injection
  if (forceRecommendation) {
    const forceInstruction = `\n\n[SYSTEM INSTRUCTION - CRITICAL]\nUser has answered your clarifying question(s). You MUST now IMMEDIATELY provide outfit recommendations using Template A (CLOTHS) or styling tips using Template B (OTHER).\n\nDO NOT:\n- Ask another clarifying question\n- Ask for confirmation\n- Say you need more information\n- Engage in chitchat\n\nDO:\n- Provide complete recommendations NOW\n- Use available information to make reasonable assumptions\n- Follow the template structure strictly\n- Include product recommendations or styling advice\n\nThis is MANDATORY. Provide recommendations in your response.`

    messages[messages.length - 1].content += forceInstruction

    console.log('[AI Chat] 🔴 FORCE RECOMMENDATION MODE ACTIVE - Injecting mandatory recommendation instruction')
  }

  // Add timeout for API call (30 seconds)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'OOTDay Fashion Assistant v2.0',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Process chat request with AI
 * Enhanced with session management and duplicate prevention
 */
export async function processAIChatRequest(
  request: ChatRequest,
  availableProducts: EnhancedProduct[]
): Promise<ChatResponse> {
  try {
    // Initialize or get session context
    let sessionContext = request.sessionContext || createSessionContext(request.conversationId)

    // Check if session should be reset
    if (shouldResetSession(request.message)) {
      sessionContext = createSessionContext(request.conversationId)
      console.log('[AI Chat] Session reset requested')
    }

    // STEP 1: Check guardrails first - redirect if off-topic
    const guardrailMessage = checkGuardrails(request.message)
    if (guardrailMessage) {
      console.log('[AI Chat] Off-topic query detected, redirecting')
      return {
        message: guardrailMessage,
        recommendedProducts: [],
        sessionContext,
      }
    }

    // STEP 1.5: Check for image generation request (v3.1 - Customer Journey Step 4)
    const isImageRequest = detectImageRequest(request.message)
    if (isImageRequest) {
      console.log('[AI Chat] Image generation request detected')

      // Extract outfit description from conversation history
      const conversationMessages = request.conversationHistory || []
      const outfitDescription = extractOutfitDescription(
        request.message,
        conversationMessages,
        5 // Look at last 5 messages for context
      )

      console.log('[AI Chat] Extracted outfit description:', outfitDescription)

      // Return special response for image generation
      return {
        message: 'เจ๋งเลย! กำลังสร้างภาพชุดที่เราแนะนำให้ดูนะ ✨ รอแป๊บนึงนะจ้า! 📸',
        recommendedProducts: [],
        sessionContext,
        imageRequest: true,
        outfitDescription,
      }
    }

    // STEP 2: Analyze user query and extract any provided information
    const userQuery = analyzeUserQuery(request.message)

    // CRITICAL: Store any detected information in conversation context
    const detectedInfo: Partial<SessionContext['conversationContext']> = {};
    if (userQuery.detectedGender) {
      detectedInfo.gender = userQuery.detectedGender;
      console.log(`[AI Chat] Detected gender: ${userQuery.detectedGender}`);
    }
    if (userQuery.detectedOccasion) {
      detectedInfo.occasion = userQuery.detectedOccasion;
      console.log(`[AI Chat] Detected occasion: ${userQuery.detectedOccasion}`);
    }
    if (userQuery.detectedBudget) {
      detectedInfo.budget = userQuery.detectedBudget;
      console.log(`[AI Chat] Detected budget: ${userQuery.detectedBudget}`);
    }
    if (userQuery.detectedDestination) {
      detectedInfo.destination = userQuery.detectedDestination;
      console.log(`[AI Chat] Detected destination: ${userQuery.detectedDestination}`);
    }

    // Update session context with detected information
    if (Object.keys(detectedInfo).length > 0) {
      sessionContext = updateSessionContext(
        sessionContext,
        [], // No new products yet
        undefined, // No clarification asked yet
        detectedInfo // Store detected information
      );
    }

    // v2.1: CRITICAL - Check turn count and force recommendations if limit reached
    const clarificationCount = getClarificationCount(sessionContext);
    const shouldForceNow = shouldForceRecommendationsUtil(sessionContext);

    console.log('[AI Chat] Turn Count:', clarificationCount);
    console.log(formatTurnStats(sessionContext));

    // v2.2: CRITICAL - Check for POST-RECOMMENDATION LOCKOUT (Step 4)
    const hasProvidedRecommendations = sessionContext.hasProvidedRecommendations || false;
    const isFollowUpPhase = sessionContext.dialoguePhase === 'follow-up' || hasProvidedRecommendations;

    if (isFollowUpPhase) {
      console.log('[AI Chat] 🔒 Step 4: POST-RECOMMENDATION LOCKOUT - Follow-up mode active');
    }

    // v2.2: Detect follow-up request type (Step 4)
    const followUpDetection = detectFollowUpRequest(request.message, hasProvidedRecommendations);
    console.log(formatFollowUpDetection(followUpDetection));

    // Check if clarifications are needed (considering stored context, turn count, AND post-recommendation lockout)
    const clarificationsNeeded = getClarificationsNeeded(
      userQuery,
      request.conversationHistory,
      sessionContext.askedClarifications,
      sessionContext.conversationContext, // Pass stored context
      sessionContext.clarificationTurnCount, // v2.1: Pass turn count
      hasProvidedRecommendations // v2.2: Pass post-recommendation lockout flag
    )

    // If clarification is needed, ask clarifying question instead of recommending
    if (clarificationsNeeded.length > 0) {
      const clarificationQuestion = formatClarificationQuestions(clarificationsNeeded)
      const clarificationType = clarificationsNeeded[0].type

      console.log(`[AI Chat] Clarification needed: ${clarificationType}`)

      // Update session to track this clarification was asked
      const updatedSession = updateSessionContext(
        sessionContext,
        [], // No new products
        clarificationType // Track which clarification was asked
      )

      return {
        message: clarificationQuestion,
        recommendedProducts: [],
        sessionContext: updatedSession,
      }
    }

    // Detect occasion from message
    const occasion = detectOccasion(request.message)

    // Filter products based on request
    let filteredProducts = filterProductsForRequest(availableProducts, request, occasion)

    // Apply duplicate prevention - filter out already recommended products
    const { products: uniqueProducts, hasSufficientProducts: sufficient, message: insufficientMessage } = filterAndValidateProducts(
      filteredProducts,
      sessionContext,
      3 // Minimum 3 products for outfit recommendations
    )

    // If insufficient unique products, return helpful message
    if (!sufficient) {
      return {
        message: insufficientMessage || 'ขออภัยค่ะ ไม่พบสินค้าใหม่เพิ่มเติมในหมวดนี้',
        recommendedProducts: [],
        sessionContext,
      }
    }

    // Use unique products for recommendations
    filteredProducts = uniqueProducts

    // If no products available after filtering, return error
    if (filteredProducts.length === 0) {
      return {
        message:
          'ขออภัยค่ะ ไม่พบสินค้าที่ตรงกับความต้องการของคุณในขณะนี้ คุณลองปรับเกณฑ์การค้นหาหรือถามคำถามใหม่ได้ค่ะ',
        recommendedProducts: [],
        sessionContext,
      }
    }

    // v2.1: CRITICAL - Detect category to determine template type (A or B)
    const categoryDetection = detectCategory(request.message)
    console.log(formatCategoryDetection(categoryDetection))

    // v3.0: RAG-based knowledge retrieval with fallback to keyword-based
    // Uses semantic search to find relevant fashion knowledge
    const ragResult = await retrieveKnowledgeWithRAG(
      request.message,
      userQuery.detectedGender || sessionContext.conversationContext.gender,
      userQuery.detectedOccasion || sessionContext.conversationContext.occasion
    )
    const knowledgeContext = ragResult.knowledgeContext

    // Update session with retrieved knowledge IDs (for caching and tracking)
    if (ragResult.retrievedIds.length > 0) {
      sessionContext = {
        ...sessionContext,
        retrievedKnowledgeIds: [
          ...(sessionContext.retrievedKnowledgeIds || []),
          ...ragResult.retrievedIds.filter(
            (id) => !(sessionContext.retrievedKnowledgeIds || []).includes(id)
          ),
        ],
      }
    }

    // Log retrieval method used
    if (!ragResult.usedFallback) {
      console.log(`[AI Chat] 📚 Knowledge Base: RAG retrieved ${ragResult.retrievedIds.length} documents`)
    } else if (knowledgeContext) {
      console.log('[AI Chat] 📚 Knowledge Base: Using keyword-based fallback')
    }

    // Create AI prompt with product context
    const prompt = createOutfitPrompt(
      occasion || 'general occasion',
      filteredProducts.slice(0, 20), // Limit to top 20 to save tokens
      request.userPreferences
    )

    // v2.5: Add ENHANCED user preferences context (Name, Age, Style, Gender)
    const prefs = request.userPreferences;
    let userPreferencesContext = '';

    if (prefs) {
      const parts = [];
      if (prefs.userName) parts.push(`Name: ${prefs.userName}`);
      if (prefs.gender) parts.push(`Gender: ${prefs.gender}`);
      if (prefs.ageRange) parts.push(`Age: ${prefs.ageRange}`);
      if (prefs.stylePreferences?.length) parts.push(`Style: ${prefs.stylePreferences.join(', ')}`);

      if (parts.length > 0) {
        userPreferencesContext = `[USER PROFILE]\n${parts.join('\n')}\n`;
      }
    }

    // v2.1: Inject template-specific instruction based on category
    const templateInstruction = getTemplateInstruction(categoryDetection.category)

    // v2.2: Generate follow-up instruction if in follow-up mode (Step 4)
    const followUpInstruction = generateFollowUpInstruction(followUpDetection);

    // Build enhanced prompt with template, knowledge context, user preferences, and follow-up instructions
    // v2.2: Add knowledge context for fashion expertise
    // v2.4: Add user preferences context for gender awareness
    let enhancedPrompt = `${userPreferencesContext}${templateInstruction}${knowledgeContext}\n\n${prompt}`

    if (followUpInstruction) {
      enhancedPrompt = `${followUpInstruction}\n\n${enhancedPrompt}`
      console.log('[AI Chat] 🔄 Step 4: Follow-up instruction injected into prompt');
    }

    // v2.1: CRITICAL - Determine if we should force recommendations
    // Force if:
    // 1. We've asked 2 clarifications already (shouldForceNow = true), OR
    // 2. User just answered a clarification (detect this from last assistant message), OR
    // 3. We're in follow-up phase (Step 4 - POST-RECOMMENDATION LOCKOUT)
    const lastAssistantMessage = request.conversationHistory?.filter(m => m.role === 'assistant').pop();
    const isAnsweringPreviousClarification = lastAssistantMessage &&
      sessionContext.askedClarifications.length > 0 &&
      isAnsweringClarification(request.message, sessionContext.askedClarifications[sessionContext.askedClarifications.length - 1]);

    // v2.2: Always force recommendations in follow-up phase (Step 4)
    const shouldInjectForceInstruction = shouldForceNow || isAnsweringPreviousClarification || isFollowUpPhase;

    if (shouldInjectForceInstruction) {
      if (isFollowUpPhase) {
        console.log('[AI Chat] 🔴 Step 4: POST-RECOMMENDATION LOCKOUT - Forcing recommendations (no questions allowed).');
      } else {
        console.log('[AI Chat] 🔴 Detected: User answered clarification OR hit limit. Forcing recommendations.');
      }
    }

    // Call AI with enhanced prompt (includes template instruction), session context, and force flag
    let aiResponse = await callOpenRouter(
      enhancedPrompt, // v2.1: Use enhanced prompt with template instruction
      request.conversationHistory,
      sessionContext,
      shouldInjectForceInstruction // v2.1: Pass force recommendation flag
    )

    // v2.1: CRITICAL - Loop Detection and Response Validation
    // Check if response is a loop (only if we should check)
    let loopDetection: LoopDetectionResult = { isLoop: false, suggestedAction: 'allow-response' }
    let hasRetriedForLoop = false

    if (shouldCheckForLoop(request.conversationHistory)) {
      loopDetection = detectLoop(aiResponse, sessionContext, clarificationCount)
      console.log(formatLoopDetection(loopDetection))

      // If loop detected, retry with force instruction
      if (loopDetection.isLoop && loopDetection.suggestedAction === 'retry-with-force') {
        console.log('[AI Chat] 🔁 RETRYING with force instruction due to loop detection')

        // Generate force instruction based on loop type
        const retryForceInstruction = generateForceInstruction(loopDetection.loopType, clarificationCount)

        // Append force instruction to enhanced prompt
        const retryPrompt = `${enhancedPrompt}\n\n${retryForceInstruction}`

        // Retry API call with force instruction
        aiResponse = await callOpenRouter(
          retryPrompt,
          request.conversationHistory,
          sessionContext,
          true // Force recommendation mode on retry
        )

        hasRetriedForLoop = true
        console.log('[AI Chat] ✅ Retry complete')
      }
    }

    // v2.1/v2.2: Response validation with retry on template violation (phase-aware for Step 4)
    const validation = validateResponseWithPhase(aiResponse, isFollowUpPhase)
    console.log(formatValidationErrors(validation))

    // v2.1: CRITICAL - Retry if template validation fails (max 1 retry)
    if (!validation.isValid && !hasRetriedForLoop) {
      // Only retry if we haven't already retried for loop detection
      console.warn('[AI Chat] 🔁 RETRYING due to template validation failure')

      // Generate correction instruction
      const expectedTemplate = categoryDetection.category === 'CLOTHS' ? 'A' : 'B'
      const correctionInstruction = `[CRITICAL CORRECTION - TEMPLATE VIOLATION DETECTED]

Your previous response did not follow Template ${expectedTemplate} requirements.

ERRORS DETECTED:
${validation.errors.join('\n')}

You MUST regenerate your response following Template ${expectedTemplate} structure EXACTLY:
${getTemplateInstruction(categoryDetection.category)}

MANDATORY: Fix all errors listed above and provide a complete ${expectedTemplate === 'A' ? 'outfit recommendation with products, prices, and links' : 'tips-based response without prices or links'}.`

      // Retry with correction instruction
      const correctionPrompt = `${enhancedPrompt}\n\n${correctionInstruction}`

      try {
        aiResponse = await callOpenRouter(
          correctionPrompt,
          request.conversationHistory,
          sessionContext,
          true // Force recommendation mode
        )

        // Validate retry response
        const retryValidation = validateResponseStructure(aiResponse)
        if (retryValidation.isValid) {
          console.log(`[AI Chat] ✅ Retry successful - Response validated (Template ${retryValidation.detectedTemplate})`)
        } else {
          console.warn('[AI Chat] ⚠️ Retry still has validation issues, but continuing')
          console.warn(formatValidationErrors(retryValidation))
        }
      } catch (retryError) {
        console.error('[AI Chat] Retry failed:', retryError)
        console.warn('[AI Chat] Using original response despite validation failure')
      }
    } else if (validation.isValid) {
      console.log(`[AI Chat] ✅ Response validated successfully (Template ${validation.detectedTemplate})`)
    }

    // Products to recommend (top 6)
    const recommendedProducts = filteredProducts.slice(0, 6)

    // Update session context with newly recommended products
    const newProductIds = extractProductIds(recommendedProducts)
    const updatedSessionContext = updateSessionContext(sessionContext, newProductIds)

    console.log(`[AI Chat] Recommended ${newProductIds.length} new products. Total in session: ${updatedSessionContext.recommendedProductIds.length}`)

    // Parse AI response to extract product recommendations
    // For now, we'll return the filtered products
    // In a more advanced version, we'd parse the AI response to extract specific SKUs

    // Generate outfit description for auto-image generation
    const distinctProducts = recommendedProducts.slice(0, 3); // Use top 3 distinct products for description
    const productNames = distinctProducts.map(p => p.name.en || p.name.th || 'Fashion Item').join(', ');
    const autoOutfitDescription = `Full body look for ${occasion || 'daily wear'}: ${productNames}. Context: ${occasion} setting.`;

    return {
      message: aiResponse,
      recommendedProducts,
      occasion,
      reasoning: `Found ${filteredProducts.length} unique products matching your request`,
      sessionContext: updatedSessionContext,
      // v3.2: Auto-trigger image generation if products are recommended
      imageRequest: recommendedProducts.length > 0,
      outfitDescription: autoOutfitDescription,
    }
  } catch (error) {
    console.error('AI Chat Service Error:', error)

    // Fallback logic also needs to trigger image?
    const fallbackResponse = getFallbackRecommendations(request, availableProducts)
    const detectedOccasion = detectOccasion(request.message)

    return {
      ...fallbackResponse,
      sessionContext: request.sessionContext,
      // Fallback auto-image
      imageRequest: fallbackResponse.recommendedProducts && fallbackResponse.recommendedProducts.length > 0,
      outfitDescription: `Fashion outfit for ${detectedOccasion || 'general wear'}`,
    }
  }
}

/**
 * Fallback recommendations when AI is unavailable
 */
export function getFallbackRecommendations(
  request: ChatRequest,
  availableProducts: EnhancedProduct[]
): ChatResponse {
  const occasion = detectOccasion(request.message)
  const filteredProducts = filterProductsForRequest(availableProducts, request, occasion)

  let message = 'สวัสดีค่ะ! นี่คือคำแนะนำสำหรับคุณ:\n\n'

  if (occasion) {
    const occasionNames: Record<OccasionType, string> = {
      work: 'การทำงาน/ออฟฟิศ',
      chill: 'วันชิลล์/วันหยุด',
      wedding: 'งานแต่งงาน',
      sport: 'การออกกำลังกาย',
      travel: 'การท่องเที่ยว',
      date: 'เดท',
      dinner: 'ดินเนอร์',
      cafe: 'ไปคาเฟ่',
      party: 'งานปาร์ตี้',
    }

    message += `สำหรับโอกาส: ${occasionNames[occasion]}\n\n`
  }

  message += `เราพบสินค้าที่เหมาะสมกับคุณ ${filteredProducts.length} รายการ`

  return {
    message,
    recommendedProducts: filteredProducts.slice(0, 6),
    occasion,
  }
}
