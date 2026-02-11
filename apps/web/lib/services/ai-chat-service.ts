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
import { applyFilters, filterByThaiOccasion, filterByMonthSuitability, rankProductsByRelevance } from '../utils/product-filters'
import { mapProductToOccasions } from '../categorization/occasion-mapper'
import type { OccasionType } from '../types/enums'
import type { SessionContext } from '../types/chat-types'
// KB003: Import Thai cultural matcher for occasion detection
import {
  detectThaiOccasion as detectThaiOccasionFromMatcher,
  type ThaiOccasion,
} from '../matching/thai-cultural-matcher'
import {
  calculateOutfitCostPerWear,
  getOutfitCostPerWearTier,
} from '../matching/price-intelligence-optimizer'
import {
  getTrendingProducts,
  getOutfitHashtags,
} from '../matching/social-proof-ranker'
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
  getInsufficientProductsMessage,
} from '../utils/duplicate-filter'
import { getActiveSystemPrompt, VersionUtils } from '../prompts/prompt-version'
// v5.0: Looks parser and catalog serializer
import { parseLooksData, validateLooksAgainstCatalog } from '../parsers/looks-parser'
import { serializeCatalogForV5 } from '../utils/ai-serializer'
import type { ChatLook } from '../types/chat-types'
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
// Supabase RAG integration (v4.0)
import { retrieveFromSupabase, searchProductsFromSupabase } from '../rag/supabase-retrieval'
import { transformDbProductsToEnhanced } from '../transformers/db-product-to-enhanced'
// v5.1: Query translator for hybrid search
import { translateQueryForRAG } from '../rag/query-translator'

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
  /** v5.0: Structured looks with per-look items and flat-lay images */
  looks?: ChatLook[]
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
    /(?:budget|ราคา|งบ).*?(\d[\d,]*(?:\.\d{2})?)/i,
    /(\d[\d,]*)\s*(?:baht|บาท|thb)/i,
    /(?:under|below|ไม่เกิน).*?(\d[\d,]*)/i,
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

/**
 * Vector-only knowledge retrieval (Supabase → Vectra cascade)
 * Used as one arm of the hybrid search pipeline.
 */
async function retrieveVectorKnowledge(
  query: string,
  detectedGender?: 'men' | 'women',
  detectedOccasion?: string
): Promise<RetrievalResult> {
  // Build retrieval options
  const retrievalOptions: RetrievalOptions = {
    topK: 5,
    threshold: 0.25,
    filters: {},
  }
  if (detectedGender) retrievalOptions.filters!.gender = detectedGender
  if (detectedOccasion) retrievalOptions.filters!.occasion = detectedOccasion

  // Try Supabase first if enabled
  if (process.env.SUPABASE_RAG_ENABLED === 'true') {
    try {
      console.log('[AI Chat] RAG: Using Supabase pgvector')
      const result = await retrieveFromSupabase(query, retrievalOptions)
      if (result.documents.length > 0) {
        console.log(`[AI Chat] RAG: Supabase retrieved ${result.documents.length} documents`)
        return result
      }
      console.warn('[AI Chat] RAG: Supabase returned no documents, trying Vectra')
    } catch (err) {
      console.error('[AI Chat] RAG: Supabase failed, trying Vectra:', err)
    }
  }

  // Vectra fallback
  try {
    console.log('[AI Chat] RAG: Using Vectra in-memory')
    const ragService = getRAGService()
    const result = await ragService.retrieve(query, retrievalOptions)
    if (result.documents.length > 0) {
      console.log(`[AI Chat] RAG: Vectra retrieved ${result.documents.length} documents`)
      return result
    }
  } catch (err) {
    console.error('[AI Chat] RAG: Vectra failed:', err)
  }

  // Return empty result (keyword layer will still provide context)
  return {
    documents: [],
    scores: [],
    totalFound: 0,
    metadata: { retrievalTimeMs: 0, query, normalizedQuery: query.toLowerCase(), appliedFilters: {}, tokenCount: 0 },
  }
}

/**
 * Merge vector search results with keyword search results.
 * Vector context comes first, keyword context appended as additional knowledge.
 */
function mergeRAGResults(
  vectorResult: PromiseSettledResult<RetrievalResult>,
  keywordResult: PromiseSettledResult<RAGRetrievalResult>,
  originalQuery: string
): RAGRetrievalResult {
  // Extract vector docs
  const vectorDocs = vectorResult.status === 'fulfilled' ? vectorResult.value.documents : []
  const vectorContext = vectorDocs.length > 0
    ? buildFashionContext(vectorResult.status === 'fulfilled' ? vectorResult.value : { documents: [], scores: [], totalFound: 0, metadata: { retrievalTimeMs: 0, query: '', normalizedQuery: '', appliedFilters: {}, tokenCount: 0 } }, originalQuery)
    : ''

  // Extract keyword context
  const keywordContext = keywordResult.status === 'fulfilled'
    ? keywordResult.value.knowledgeContext
    : ''

  // Merge contexts
  let knowledgeContext = ''
  if (vectorContext && keywordContext) {
    knowledgeContext = `${vectorContext}\n\n--- Additional Fashion Knowledge ---\n${keywordContext}`
  } else {
    knowledgeContext = vectorContext || keywordContext
  }

  const retrievedIds = vectorResult.status === 'fulfilled'
    ? vectorResult.value.documents.map(d => d.id)
    : []

  const usedFallback = vectorDocs.length === 0

  console.log(`[AI Chat] RAG Hybrid: ${vectorDocs.length} vector docs + keyword context (${keywordContext.length} chars), usedFallback=${usedFallback}`)

  return {
    knowledgeContext,
    retrievedIds,
    usedFallback,
  }
}

/**
 * Hybrid RAG retrieval: runs vector search + keyword search in parallel, merges results.
 *
 * v5.1: Replaces the old cascade architecture (Supabase → Vectra → keyword).
 * - Thai queries are translated to English for vector search
 * - Original Thai text is used for keyword matching
 * - Both run in parallel via Promise.allSettled for better recall + lower latency
 */
async function retrieveKnowledgeWithRAG(
  message: string,
  detectedGender?: 'men' | 'women',
  detectedOccasion?: string
): Promise<RAGRetrievalResult> {
  try {
    // Step 1: Translate Thai → English (for vector search only)
    const translatedQuery = await translateQueryForRAG(message)

    // Step 2: Run vector search and keyword search in parallel
    const [vectorResult, keywordResult] = await Promise.allSettled([
      retrieveVectorKnowledge(translatedQuery, detectedGender, detectedOccasion),
      Promise.resolve(useKeywordFallback(message)),  // Use ORIGINAL Thai message for keyword matching
    ])

    // Step 3: Merge results
    return mergeRAGResults(vectorResult, keywordResult, message)
  } catch (error) {
    console.error('[AI Chat] RAG: Hybrid retrieval failed:', error)
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
 * KB003: Detect Thai cultural occasion from message
 * Supports both Thai and English keywords
 */
export function detectThaiOccasionFromMessage(message: string): ThaiOccasion | null {
  return detectThaiOccasionFromMatcher(message)
}

/**
 * Filter products based on user request
 * KB003: Enhanced with Thai occasion and month-based filtering
 */
export function filterProductsForRequest(
  products: EnhancedProduct[],
  request: ChatRequest,
  occasion?: OccasionType,
  thaiOccasion?: ThaiOccasion | null,
  colors?: string[]
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

  // KB003: Apply Thai occasion filter if detected
  if (thaiOccasion) {
    const thaiFiltered = filterByThaiOccasion(filtered, thaiOccasion)
    if (thaiFiltered.length >= 3) {
      filtered = thaiFiltered
      console.log(`[AI Chat] Applied Thai occasion filter (${thaiOccasion}): ${filtered.length} products`)
    }
  }

  // KB003: Apply month suitability filter
  const currentMonth = new Date().getMonth()
  const monthFiltered = filterByMonthSuitability(filtered, currentMonth, 5)
  if (monthFiltered.length >= 3) {
    filtered = monthFiltered
  }

  // Apply color filter if colors are specified (only if result still has >= 3 products)
  if (colors && colors.length > 0) {
    const colorFiltered = applyFilters(filtered, { colors })
    if (colorFiltered.length >= 3) {
      filtered = colorFiltered
      console.log(`[AI Chat v5] Applied color filter (${colors.join(', ')}): ${filtered.length} products`)
    } else {
      console.log(`[AI Chat v5] Color filter (${colors.join(', ')}) would leave ${colorFiltered.length} products, skipping`)
    }
  }

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

  console.log(`[AI Chat v5] Product filter: ${products.length} → ${filtered.length} (gender=${gender}, occasion=${occasion}, budget=${budget})`)
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
      content: getActiveSystemPrompt(),
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
        max_tokens: VersionUtils.isV5Active() ? 3000 : 2000,
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
 * v5.0: Process chat request with structured looks output + anti-hallucination
 *
 * This replaces the old flow where AI text and product recommendations were disconnected.
 * New flow:
 * 1. Keep all existing guardrails, clarification, session management
 * 2. Inject pipe-delimited catalog into the prompt
 * 3. AI returns conversational Thai text + ---LOOKS_DATA--- structured block
 * 4. parseLooksData() extracts text + per-Look items
 * 5. validateLooksAgainstCatalog() verifies SKUs, forces catalog URLs
 * 6. Return { message, looks } — images generated async by /api/chat/looks-images
 */
async function processAIChatRequestV5(
  request: ChatRequest,
  availableProducts: EnhancedProduct[]
): Promise<ChatResponse> {
  // Initialize or get session context
  let sessionContext = request.sessionContext || createSessionContext(request.conversationId)

  // Check if session should be reset
  if (shouldResetSession(request.message)) {
    sessionContext = createSessionContext(request.conversationId)
    console.log('[AI Chat v5] Session reset requested')
  }

  // STEP 1: Check guardrails first - redirect if off-topic
  const guardrailMessage = checkGuardrails(request.message)
  if (guardrailMessage) {
    console.log('[AI Chat v5] Off-topic query detected, redirecting')
    return {
      message: guardrailMessage,
      recommendedProducts: [],
      looks: [],
      sessionContext,
    }
  }

  // STEP 1.5: Check for image generation request (v3.1)
  const isImageRequest = detectImageRequest(request.message)
  if (isImageRequest) {
    console.log('[AI Chat v5] Image generation request detected')
    const conversationMessages = request.conversationHistory || []
    const outfitDescription = extractOutfitDescription(request.message, conversationMessages, 5)
    return {
      message: 'เจ๋งเลย! กำลังสร้างภาพชุดที่เราแนะนำให้ดูนะ ✨ รอแป๊บนึงนะจ้า! 📸',
      recommendedProducts: [],
      looks: [],
      sessionContext,
      imageRequest: true,
      outfitDescription,
    }
  }

  // STEP 2: Analyze user query and extract detected info
  const userQuery = analyzeUserQuery(request.message)
  const detectedInfo: Partial<SessionContext['conversationContext']> = {}
  if (userQuery.detectedGender) detectedInfo.gender = userQuery.detectedGender
  if (userQuery.detectedOccasion) detectedInfo.occasion = userQuery.detectedOccasion
  if (userQuery.detectedBudget) detectedInfo.budget = userQuery.detectedBudget
  if (userQuery.detectedDestination) detectedInfo.destination = userQuery.detectedDestination
  if (userQuery.detectedColors) detectedInfo.colors = userQuery.detectedColors

  // v5.2: Use profile gender when message doesn't explicitly mention gender
  if (!userQuery.detectedGender && request.userPreferences?.gender) {
    detectedInfo.gender = request.userPreferences.gender as 'men' | 'women'
  }

  if (Object.keys(detectedInfo).length > 0) {
    sessionContext = updateSessionContext(sessionContext, [], undefined, detectedInfo)
  }

  // STEP 3: Check turn count and force recommendations
  const clarificationCount = getClarificationCount(sessionContext)
  const shouldForceNow = shouldForceRecommendationsUtil(sessionContext)
  const hasProvidedRecommendations = sessionContext.hasProvidedRecommendations || false
  const isFollowUpPhase = sessionContext.dialoguePhase === 'follow-up' || hasProvidedRecommendations

  // v2.2: Detect follow-up request
  const followUpDetection = detectFollowUpRequest(request.message, hasProvidedRecommendations)
  console.log(formatFollowUpDetection(followUpDetection))

  // Check if clarifications are needed
  const clarificationsNeeded = getClarificationsNeeded(
    userQuery,
    request.conversationHistory,
    sessionContext.askedClarifications,
    sessionContext.conversationContext,
    sessionContext.clarificationTurnCount,
    hasProvidedRecommendations
  )

  if (clarificationsNeeded.length > 0) {
    const clarificationQuestion = formatClarificationQuestions(clarificationsNeeded)
    const clarificationType = clarificationsNeeded[0].type
    console.log(`[AI Chat v5] Clarification needed: ${clarificationType}`)

    const updatedSession = updateSessionContext(sessionContext, [], clarificationType)
    return {
      message: clarificationQuestion,
      recommendedProducts: [],
      looks: [],
      sessionContext: updatedSession,
    }
  }

  // STEP 4: Detect occasion
  const occasion = detectOccasion(request.message)
  const thaiOccasion = detectThaiOccasionFromMessage(request.message)
  if (thaiOccasion) {
    console.log(`[AI Chat v5] Thai occasion detected: ${thaiOccasion}`)
  }

  // STEP 5: Filter products
  // Resolve colors from multiple sources (priority: follow-up newColor > current message > session context)
  const resolvedColors: string[] = followUpDetection.parameters.newColor
    ? [followUpDetection.parameters.newColor]
    : userQuery.detectedColors || sessionContext.conversationContext.colors || []

  let filteredProducts = filterProductsForRequest(availableProducts, request, occasion, thaiOccasion, resolvedColors.length > 0 ? resolvedColors : undefined)

  // v4.0: Enhance with semantic search
  if (process.env.SUPABASE_RAG_ENABLED === 'true' && request.message.length > 5) {
    try {
      const semanticProducts = await searchProductsFromSupabase(request.message, occasion || undefined, 30)
      if (semanticProducts.length > 0) {
        const enhancedSemantic = transformDbProductsToEnhanced(semanticProducts)
        const seenSkus = new Set<string>()
        const merged: EnhancedProduct[] = []
        for (const product of [...enhancedSemantic, ...filteredProducts]) {
          const key = product.sku || product.id
          if (!seenSkus.has(key)) {
            seenSkus.add(key)
            merged.push(product)
          }
        }
        filteredProducts = merged
        console.log(`[AI Chat v5] Semantic search: ${merged.length} total products`)
      }
    } catch (semanticError) {
      console.error('[AI Chat v5] Semantic search failed:', semanticError)
    }
  }

  // Apply duplicate prevention
  const { products: uniqueProducts, hasSufficientProducts: sufficient } = filterAndValidateProducts(
    filteredProducts,
    sessionContext,
    3
  )

  console.log(`[AI Chat v5] After duplicate filter: ${uniqueProducts.length} unique products (sufficient: ${sufficient})`)

  // Only block if truly zero products remain; otherwise let AI work with what's available
  if (uniqueProducts.length === 0) {
    return {
      message: getInsufficientProductsMessage(),
      recommendedProducts: [],
      looks: [],
      sessionContext,
    }
  }
  filteredProducts = uniqueProducts

  if (filteredProducts.length === 0) {
    return {
      message: 'ขออภัยค่ะ ไม่พบสินค้าที่ตรงกับความต้องการของคุณในขณะนี้ คุณลองปรับเกณฑ์การค้นหาหรือถามคำถามใหม่ได้ค่ะ',
      recommendedProducts: [],
      looks: [],
      sessionContext,
    }
  }

  // Rank products by relevance so truncation keeps the best candidates
  const budget = request.userPreferences?.budget || extractBudget(request.message)
  filteredProducts = rankProductsByRelevance(filteredProducts, occasion, budget)
  console.log(`[AI Chat v5] Ranked ${filteredProducts.length} products by relevance`)

  // STEP 6: Serialize catalog for v5 pipe-delimited format
  const catalogContext = serializeCatalogForV5(filteredProducts.slice(0, 50))
  console.log(`[AI Chat v5] Catalog injected: ${Math.min(filteredProducts.length, 50)} products`)

  // Category detection for template instruction
  const categoryDetection = detectCategory(request.message)
  console.log(formatCategoryDetection(categoryDetection))

  // RAG-based knowledge retrieval
  const ragResult = await retrieveKnowledgeWithRAG(
    request.message,
    userQuery.detectedGender || sessionContext.conversationContext.gender,
    userQuery.detectedOccasion || sessionContext.conversationContext.occasion
  )
  const knowledgeContext = ragResult.knowledgeContext

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

  // Build v5 enhanced prompt with catalog injection
  const prefs = request.userPreferences
  let userPreferencesContext = ''
  if (prefs) {
    const parts = []
    if (prefs.userName) parts.push(`Name: ${prefs.userName}`)
    if (prefs.gender) parts.push(`Gender: ${prefs.gender}`)
    if (prefs.ageRange) parts.push(`Age: ${prefs.ageRange}`)
    if (prefs.stylePreferences?.length) parts.push(`Style: ${prefs.stylePreferences.join(', ')}`)
    if (parts.length > 0) {
      userPreferencesContext = `[USER PROFILE]\n${parts.join('\n')}\n`
    }
  }

  const templateInstruction = getTemplateInstruction(categoryDetection.category)
  const followUpInstruction = generateFollowUpInstruction(followUpDetection)

  // v5.0: Build prompt with catalog context (pipe-delimited) instead of old createOutfitPrompt
  let enhancedPrompt = `${userPreferencesContext}${templateInstruction}${knowledgeContext}\n\n${catalogContext}\n\nUser message: ${request.message}`

  if (followUpInstruction) {
    enhancedPrompt = `${followUpInstruction}\n\n${enhancedPrompt}`
    console.log('[AI Chat v5] Follow-up instruction injected')
  }

  // Determine force recommendation flag
  const lastAssistantMessage = request.conversationHistory?.filter(m => m.role === 'assistant').pop()
  const isAnsweringPreviousClarification = lastAssistantMessage &&
    sessionContext.askedClarifications.length > 0 &&
    isAnsweringClarification(request.message, sessionContext.askedClarifications[sessionContext.askedClarifications.length - 1])
  const shouldInjectForceInstruction = shouldForceNow || isAnsweringPreviousClarification || isFollowUpPhase

  if (shouldInjectForceInstruction) {
    console.log('[AI Chat v5] Force recommendation mode active')
  }

  // STEP 7: Call AI with v5 system prompt + catalog
  let aiResponse = await callOpenRouter(
    enhancedPrompt,
    request.conversationHistory,
    sessionContext,
    shouldInjectForceInstruction
  )

  // Loop detection (same as v4)
  let loopDetection: LoopDetectionResult = { isLoop: false, suggestedAction: 'allow-response' }
  let hasRetriedForLoop = false

  if (shouldCheckForLoop(request.conversationHistory)) {
    loopDetection = detectLoop(aiResponse, sessionContext, clarificationCount)
    console.log(formatLoopDetection(loopDetection))

    if (loopDetection.isLoop && loopDetection.suggestedAction === 'retry-with-force') {
      console.log('[AI Chat v5] Retrying with force instruction due to loop detection')
      const retryForceInstruction = generateForceInstruction(loopDetection.loopType, clarificationCount)
      const retryPrompt = `${enhancedPrompt}\n\n${retryForceInstruction}`
      aiResponse = await callOpenRouter(retryPrompt, request.conversationHistory, sessionContext, true)
      hasRetriedForLoop = true
    }
  }

  // Response validation
  const validation = validateResponseWithPhase(aiResponse, isFollowUpPhase)
  console.log(formatValidationErrors(validation))

  if (!validation.isValid && !hasRetriedForLoop) {
    console.warn('[AI Chat v5] Retrying due to template validation failure')
    const expectedTemplate = categoryDetection.category === 'CLOTHS' ? 'A' : 'B'
    const correctionInstruction = `[CRITICAL CORRECTION - TEMPLATE VIOLATION DETECTED]\nYour previous response did not follow Template ${expectedTemplate}.\nERRORS: ${validation.errors.join('; ')}\nRegenerate following Template ${expectedTemplate} structure.\n${getTemplateInstruction(categoryDetection.category)}`
    const correctionPrompt = `${enhancedPrompt}\n\n${correctionInstruction}`
    try {
      aiResponse = await callOpenRouter(correctionPrompt, request.conversationHistory, sessionContext, true)
    } catch (retryError) {
      console.error('[AI Chat v5] Retry failed:', retryError)
    }
  }

  // STEP 8: Parse AI response for structured looks data
  const parsedResponse = parseLooksData(aiResponse)
  console.log(`[AI Chat v5] Parsed: ${parsedResponse.looks.length} looks from AI response`)

  // STEP 9: Validate looks against catalog (anti-hallucination)
  const validatedLooks = validateLooksAgainstCatalog(parsedResponse.looks, filteredProducts)
  console.log(`[AI Chat v5] Validated: ${validatedLooks.length} looks (${validatedLooks.reduce((sum, l) => sum + l.items.length, 0)} items)`)

  // Collect recommended products from validated looks for session tracking
  const recommendedProducts = filteredProducts.slice(0, 6)
  const newProductIds = extractProductIds(recommendedProducts)
  const updatedSessionContext = updateSessionContext(sessionContext, newProductIds)

  console.log(`[AI Chat v5] Recommended ${newProductIds.length} new products. Total in session: ${updatedSessionContext.recommendedProductIds.length}`)

  // STEP 10: Return response with looks
  return {
    message: parsedResponse.text || aiResponse,
    recommendedProducts,
    occasion,
    reasoning: `Found ${filteredProducts.length} unique products, AI curated ${validatedLooks.length} looks`,
    sessionContext: updatedSessionContext,
    looks: validatedLooks,
    // Still trigger auto-image if looks have items
    imageRequest: validatedLooks.some(l => l.items.length > 0),
    outfitDescription: validatedLooks.length > 0
      ? `Fashion looks for ${occasion || 'daily wear'}: ${validatedLooks.map(l => l.styleName).join(', ')}`
      : undefined,
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
  // v5.0: Delegate to v5 pipeline when active
  if (VersionUtils.isV5Active()) {
    console.log('[AI Chat] v5.0 active — using structured looks pipeline')
    return processAIChatRequestV5(request, availableProducts)
  }

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

    // v5.2: Use profile gender when message doesn't explicitly mention gender
    if (!userQuery.detectedGender && request.userPreferences?.gender) {
      detectedInfo.gender = request.userPreferences.gender as 'men' | 'women';
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

    // KB003: Detect Thai cultural occasion
    const thaiOccasion = detectThaiOccasionFromMessage(request.message)
    if (thaiOccasion) {
      console.log(`[AI Chat] KB003: Detected Thai occasion: ${thaiOccasion}`)
    }

    // Filter products based on request (with Thai occasion)
    let filteredProducts = filterProductsForRequest(availableProducts, request, occasion, thaiOccasion)

    // v4.0: Enhance with semantic search when Supabase RAG is enabled
    if (process.env.SUPABASE_RAG_ENABLED === 'true' && request.message.length > 5) {
      try {
        console.log('[AI Chat] Semantic search: querying Supabase for relevant products')
        const semanticProducts = await searchProductsFromSupabase(
          request.message,
          occasion || undefined,
          30
        )

        if (semanticProducts.length > 0) {
          const enhancedSemantic = transformDbProductsToEnhanced(semanticProducts)

          // Merge: semantic results first, then heuristic results, deduped by SKU
          const seenSkus = new Set<string>()
          const merged: EnhancedProduct[] = []

          for (const product of [...enhancedSemantic, ...filteredProducts]) {
            const key = product.sku || product.id
            if (!seenSkus.has(key)) {
              seenSkus.add(key)
              merged.push(product)
            }
          }

          filteredProducts = merged
          console.log(`[AI Chat] Semantic search: merged ${enhancedSemantic.length} semantic + ${filteredProducts.length - enhancedSemantic.length} heuristic = ${merged.length} total`)
        }
      } catch (semanticError) {
        console.error('[AI Chat] Semantic search failed, using heuristic only:', semanticError)
        // Continue with heuristic-only results
      }
    }

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

    // Rank products by relevance so truncation keeps the best candidates
    const legacyBudget = request.userPreferences?.budget || extractBudget(request.message)
    filteredProducts = rankProductsByRelevance(filteredProducts, occasion, legacyBudget)
    console.log(`[AI Chat] Ranked ${filteredProducts.length} products by relevance`)

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

    // KB003: Calculate cost-per-wear for recommended products
    if (recommendedProducts.length > 0) {
      const avgCostPerWear = calculateOutfitCostPerWear(recommendedProducts)
      const cpwTier = getOutfitCostPerWearTier(recommendedProducts)
      console.log(`[AI Chat] KB003: Cost-per-wear: ฿${avgCostPerWear.toFixed(0)}/wear (${cpwTier} tier)`)

      // Get trending hashtags for social proof context
      const hashtags = getOutfitHashtags(recommendedProducts)
      if (hashtags.length > 0) {
        console.log(`[AI Chat] KB003: Trending hashtags: ${hashtags.slice(0, 5).join(', ')}`)
      }
    }

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
