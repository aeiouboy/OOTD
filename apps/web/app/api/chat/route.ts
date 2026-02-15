/**
 * Chat API Route
 * Handles AI-powered fashion recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import type { EnhancedProduct } from '@/lib/types/product-types'
import type { UserProfile } from '@/lib/types/user-profile-types'
import { loadProductsServerSide, loadProductsFromSupabase } from '@/lib/server-product-loader'
import { transformDbProductsToEnhanced } from '@/lib/transformers/db-product-to-enhanced'
import {
  processAIChatRequest,
  getFallbackRecommendations,
  type ChatRequest,
} from '@/lib/services/ai-chat-service'
import { generateOutfitsFromQuery } from '@/lib/enhanced-outfit-generator'
import { getProductName, getProductPrice, getProductImageUrl } from '@/lib/utils/product-utils'
import { VersionUtils } from '@/lib/prompts/prompt-version'
import { detectColorsInMessage } from '@/lib/utils/color-normalizer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userPreferences, conversationHistory, sessionContext, conversationId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('[Chat API] Processing message:', message)

    // Log session context if provided (v2.0 feature)
    if (sessionContext) {
      console.log(`[Chat API] Session has ${sessionContext.recommendedProductIds?.length || 0} previously recommended products`)
    }

    // Load enhanced products - prefer Supabase, fallback to JSON files
    let products: EnhancedProduct[] = []
    const detectedColors = detectColorsInMessage(message)
    // Also check for auspicious color requests (เสริมดวง/สีมงคล) — these need more products
    // even though no explicit color name is mentioned in the user message
    const auspiciousKeywords = ['เสริมดวง', 'สีมงคล', 'สีเสริม', 'สีนำโชค', 'เสริมโชค', 'สีอะไรดี']
    const hasAuspiciousRequest = auspiciousKeywords.some(kw => message.includes(kw))
    const parsedDefaultLimit = Number(process.env.SUPABASE_CHAT_PRODUCT_LIMIT)
    const parsedColorLimit = Number(process.env.SUPABASE_CHAT_COLOR_PRODUCT_LIMIT)
    const defaultSupabaseLimit = Number.isFinite(parsedDefaultLimit) && parsedDefaultLimit > 0 ? parsedDefaultLimit : 200
    const colorAwareSupabaseLimit = Number.isFinite(parsedColorLimit) && parsedColorLimit > 0 ? parsedColorLimit : 1000
    const supabaseLimit = (detectedColors.length > 0 || hasAuspiciousRequest) ? colorAwareSupabaseLimit : defaultSupabaseLimit

    if (process.env.SUPABASE_PRODUCTS_ENABLED === 'true') {
      console.log(`[Chat API] Supabase load limit: ${supabaseLimit} (colors: ${detectedColors.join(', ') || 'none'})`)
      const dbProducts = await loadProductsFromSupabase(undefined, supabaseLimit)
      if (dbProducts && dbProducts.length > 0) {
        products = transformDbProductsToEnhanced(dbProducts)
        console.log(`[Chat API] Using Supabase products (${products.length} items)`)
      }
    }

    if (products.length === 0) {
      products = await loadProductsServerSide()
      console.log(`[Chat API] Using JSON products (${products.length} items)`)
    }

    if (products.length === 0) {
      console.warn('[Chat API] No enhanced products available, falling back to mock data')
    }

    console.log(`[Chat API] Using ${products.length} enhanced products`)

    // Check if AI is enabled AND products are available
    const useAI = process.env.OPENROUTER_API_KEY !== undefined && products.length > 0

    let response

    if (useAI) {
      // Use AI-powered recommendations
      console.log('[Chat API] Using AI-powered recommendations')

      const chatRequest: ChatRequest = {
        message,
        userPreferences,
        conversationHistory,
        sessionContext, // v2.0: Include session context for duplicate prevention
        conversationId, // v2.0: Include conversation ID for session tracking
      }

      response = await processAIChatRequest(chatRequest, products)
    } else {
      // Use rule-based fallback
      console.log('[Chat API] Using rule-based recommendations (no AI key)')

      const chatRequest: ChatRequest = {
        message,
        userPreferences,
        sessionContext, // v2.0: Include session context even for fallback
        conversationId, // v2.0: Include conversation ID
      }

      const fallbackResponse = getFallbackRecommendations(chatRequest, products)

      // Ensure imageRequest is set for flat-lay generation even in fallback mode
      response = {
        ...fallbackResponse,
        imageRequest: (fallbackResponse.recommendedProducts?.length ?? 0) > 0,
        outfitDescription: `Fashion outfit for ${fallbackResponse.occasion || 'general wear'}`,
      }
    }

    // v5.0: When v5 is active, return structured looks directly (no generateOutfitsFromQuery)
    if (VersionUtils.isV5Active() && response.looks) {
      console.log(`[Chat API v5] Returning ${response.looks.length} looks`)

      return NextResponse.json({
        message: response.message,
        looks: response.looks.map(look => ({
          lookNumber: look.lookNumber,
          styleName: look.styleName,
          items: look.items.map(item => ({
            name: item.name,
            brand: item.brand,
            category: item.category,
            color: item.color,
            description: item.description,
            sku: item.sku,
            price: item.price,
            url: item.url,
            imageUrl: item.imageUrl,
          })),
          stylingItems: look.stylingItems || [],
          tip: look.tip,
          totalPrice: look.totalPrice,
          imageStatus: look.imageStatus || 'pending',
        })),
        outfits: [], // Empty for backward compatibility
        occasion: response.occasion,
        reasoning: response.reasoning,
        sessionContext: response.sessionContext,
        imageRequest: response.imageRequest,
        outfitDescription: response.outfitDescription,
      })
    }

    // v4 and below: Legacy outfit generation
    // Convert userPreferences to UserProfile if available
    const userProfile: UserProfile | null = userPreferences ? {
      userName: userPreferences.userName || '',
      gender: 'women', // Currently fixed to women
      ageRange: userPreferences.ageRange || '20-29',
      stylePreferences: userPreferences.stylePreferences || [],
      userPhoto: userPreferences.userPhoto,
      fittingModelUrl: userPreferences.fittingModelUrl,
      onboardingCompleted: userPreferences.onboardingCompleted || false,
      createdAt: userPreferences.createdAt || new Date().toISOString(),
    } : null

    // Generate outfits from recommended products with user profile
    const outfits = generateOutfitsFromQuery(
      response.recommendedProducts || products,
      message,
      5,
      userProfile
    )

    console.log(`[Chat API] Generated ${outfits.length} outfits`)
    console.log(`[Chat API] imageRequest: ${response.imageRequest}, outfitDescription: ${response.outfitDescription ? 'yes' : 'no'}`)

    // Convert outfits to response format
    const outfitResponses = outfits.map((outfit) => ({
      id: outfit.id,
      title: outfit.title,
      description: outfit.description,
      totalPrice: outfit.totalPrice,
      items: outfit.products.map((product) => ({
        sku: product.sku,
        id: product.id,
        name: getProductName(product, 'th'),
        nameEn: getProductName(product, 'en'),
        brand: product.brand,
        price: getProductPrice(product),
        imageUrl: getProductImageUrl(product),
        onlineUrl: product.centralIntegration?.productUrl || '',
        category: product.classification?.category?.category || '',
        gender: product.classification?.gender || 'unisex',
        occasion: product.classification?.tags?.occasion || [],
        formality: product.style?.formalityLevel || 5,
        colors: [
          product.style?.colors?.primary || 'unknown',
          ...(product.style?.colors?.secondary || []),
        ].filter(Boolean),
        sizes: product.sizing?.availableSizes || [],
        availability: product.availability?.status || 'unknown',
      })),
      occasion: outfit.occasion,
      formality: outfit.formality,
      imageUrl: outfit.primaryImage,
    }))

    return NextResponse.json({
      message: response.message,
      outfits: outfitResponses,
      occasion: response.occasion,
      reasoning: response.reasoning,
      sessionContext: response.sessionContext, // v2.0: Return updated session context to client
      imageRequest: response.imageRequest, // Image generation flag
      outfitDescription: response.outfitDescription, // Outfit description for image generation
    })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
