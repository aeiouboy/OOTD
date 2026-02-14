'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import type { ChatMessage as ChatMessageType, Outfit, FlatLayItem, Product } from '@/lib/types'
import type { ChatStatus } from './ChatHeader'
import type { SessionContext } from '@/lib/types/chat-types'
import { createSessionContext } from '@/lib/utils/session-context'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import {
  findReplacementsForInconsistentProducts,
  hasProblematicFlatLayImageUrl,
} from '@/lib/utils/product-visual-validator'
import { cleanProductNameForPrompt, extractColorFromProductName } from '@/lib/prompts/image-prompts'
import { getMockOutfitResponse } from '@/lib/mock-data'

// ─── Context value shape ────────────────────────────────────────────────────

interface ChatContextValue {
  messages: ChatMessageType[]
  isTyping: boolean
  generatingImage: boolean
  imageGenerationError: string | null
  sessionContext: SessionContext
  conversationId: string
  hasActiveConversation: boolean
  onViewOutfit: (outfit: Outfit) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  scrollToBottom: () => void

  handleSendMessage: (content: string) => Promise<void>
  handleClearChat: () => void
  getChatStatus: () => ChatStatus
}

const ChatContext = createContext<ChatContextValue | null>(null)

// ─── Hook for consumers ─────────────────────────────────────────────────────

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) {
    throw new Error('useChatContext must be used within a <ChatProvider>')
  }
  return ctx
}

// ─── Greeting constant ──────────────────────────────────────────────────────

const INITIAL_GREETING: ChatMessageType = {
  id: 'greeting-initial',
  content: '\u0e2e\u0e49\u0e32\u0e22\u0e2e\u0e32\u0e22\u0e22\ud83d\udc4b \u0e01\u0e33\u0e25\u0e31\u0e07\u0e2b\u0e32\u0e0a\u0e38\u0e14\u0e44\u0e1b\u0e44\u0e2b\u0e19\u0e2d\u0e22\u0e39\u0e48\u0e19\u0e49\u0e32\u0e32',
  sender: 'assistant',
  timestamp: new Date(),
}

// ─── Provider component ─────────────────────────────────────────────────────

interface ChatProviderProps {
  children: ReactNode
  onViewOutfit: (outfit: Outfit) => void
}

export function ChatProvider({ children, onViewOutfit }: ChatProviderProps) {
  // Greeting in useState default → runs exactly once, no double-greeting
  const [messages, setMessages] = useState<ChatMessageType[]>([INITIAL_GREETING])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionContext, setSessionContext] = useState<SessionContext>(() => createSessionContext())
  const [conversationId] = useState<string>(() => `conv-${Date.now()}`)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const fallbackCatalogRef = useRef<Product[] | null>(null)
  const fallbackCatalogPromiseRef = useRef<Promise<Product[]> | null>(null)

  const { profile } = useUserProfile()

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ── Derived ───────────────────────────────────────────────────────────────

  const hasActiveConversation = messages.some(m => m.sender === 'user')

  // ── Helpers ───────────────────────────────────────────────────────────────

  const applyProductReplacements = useCallback((
    outfit: Outfit,
    replacements: Map<string, Product>
  ): Outfit => {
    if (replacements.size === 0) return outfit

    const updatedItems = outfit.items.map(item => {
      const replacement = replacements.get(item.sku)
      return replacement || item
    })

    const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0)

    return {
      ...outfit,
      items: updatedItems,
      totalPrice: newTotalPrice,
    }
  }, [])

  const loadFallbackCatalog = useCallback(async (): Promise<Product[]> => {
    if (fallbackCatalogRef.current) return fallbackCatalogRef.current
    if (fallbackCatalogPromiseRef.current) return fallbackCatalogPromiseRef.current

    fallbackCatalogPromiseRef.current = fetch('/api/products')
      .then(async (res) => {
        if (!res.ok) return []
        const data = await res.json() as { products?: Product[] }
        const products = Array.isArray(data.products) ? data.products : []
        const filtered = products.filter((p) => p?.imageUrl && !hasProblematicFlatLayImageUrl(p.imageUrl))
        fallbackCatalogRef.current = filtered
        return filtered
      })
      .catch(() => [])
      .finally(() => {
        fallbackCatalogPromiseRef.current = null
      })

    return fallbackCatalogPromiseRef.current
  }, [])

  // ── Clear chat ────────────────────────────────────────────────────────────

  const handleClearChat = useCallback(() => {
    const greeting: ChatMessageType = {
      id: 'greeting-initial',
      content: '\u0e2e\u0e49\u0e32\u0e22\u0e2e\u0e32\u0e22\u0e22\ud83d\udc4b \u0e01\u0e33\u0e25\u0e31\u0e07\u0e2b\u0e32\u0e0a\u0e38\u0e14\u0e44\u0e1b\u0e44\u0e2b\u0e19\u0e2d\u0e22\u0e39\u0e48\u0e19\u0e49\u0e32\u0e32',
      sender: 'assistant',
      timestamp: new Date(),
    }
    setMessages([greeting])
    setSessionContext(createSessionContext())
  }, [])

  // ── Chat status ───────────────────────────────────────────────────────────

  const getChatStatus = useCallback((): ChatStatus => {
    if (isTyping) return 'typing'
    if (generatingImage) return 'generating'
    return 'online'
  }, [isTyping, generatingImage])

  // ── Flat-lay generation ───────────────────────────────────────────────────

  const generateFlatLayForOutfit = useCallback(async (
    outfit: Outfit,
    messageId: string,
    productCatalog?: Product[]
  ) => {
    console.log(`[Chat] Generating flat-lay for outfit ${outfit.id}...`)

    let effectiveOutfit = outfit
    let replacementsMade = new Map<string, Product>()

    let replacementCatalog: Product[] = productCatalog || []
    if (replacementCatalog.length < 50) {
      const fallbackCatalog = await loadFallbackCatalog()
      if (fallbackCatalog.length > 0) {
        const merged = new Map<string, Product>()
        for (const p of replacementCatalog) merged.set(p.sku, p)
        for (const p of fallbackCatalog) {
          if (!merged.has(p.sku)) merged.set(p.sku, p)
        }
        replacementCatalog = Array.from(merged.values())
      }
    }

    if (replacementCatalog.length > 0) {
      const replacementResult = findReplacementsForInconsistentProducts(
        outfit.items,
        replacementCatalog,
        { targetGender: 'women' }
      )

      if (replacementResult.replacements.size > 0) {
        console.log(
          `[Chat] Replacing ${replacementResult.replacements.size} visually inconsistent products in outfit ${outfit.id}:`,
          Array.from(replacementResult.replacements.entries()).map(([origSku, replacement]) => ({
            original: origSku,
            replacement: replacement.sku,
            name: replacement.name,
          }))
        )

        effectiveOutfit = applyProductReplacements(outfit, replacementResult.replacements)
        replacementsMade = replacementResult.replacements

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId && msg.outfits) {
              return {
                ...msg,
                outfits: msg.outfits.map((o) =>
                  o.id === outfit.id
                    ? {
                        ...o,
                        items: effectiveOutfit.items,
                        totalPrice: effectiveOutfit.totalPrice,
                      }
                    : o
                ),
              }
            }
            return msg
          })
        )
      }

      if (replacementResult.unreplaceableSkus.length > 0) {
        console.warn(
          `[Chat] ${replacementResult.unreplaceableSkus.length} items in outfit ${outfit.id} have visual mismatches but no replacement found:`,
          replacementResult.unreplaceableSkus
        )
      }
    }

    let hasApproximateColors = false
    const flatLayItems: FlatLayItem[] = effectiveOutfit.items.slice(0, 5).map((item: Product) => {
      const category = item.subCategory || item.category || 'Item'
      // Use the real color from the product name (e.g., "...Pants Black" → "Black")
      // rather than the AI-described color which may not match the actual product
      const extractedColor = extractColorFromProductName(item.name)
      const realColor = extractedColor || item.colors?.[0] || ''
      if (!extractedColor) hasApproximateColors = true
      // Build a descriptive visual description from the product name
      // This gives the image model specific details (e.g., "stand collar blouse" vs just "blouse")
      const visualDesc = item.visualDescription ||
        cleanProductNameForPrompt(item.name, category, realColor)
      return {
        name: item.name,
        category,
        color: realColor,
        visualDescription: visualDesc,
        sku: item.sku,
        thumbnailUrl: item.imageUrl,
      }
    })
    const occasionContext = outfit.description
    const generationType = 'flat-lay'

    if (flatLayItems.length === 0) {
      console.log('[Chat] No items to generate flat-lay for')
      return
    }

    try {
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: outfit.description || 'LOOKs Inspiration',
          generationType,
          flatLayItems,
          occasionContext,
        }),
      })

      const imageData = await imageResponse.json()

      if (imageData.success && (imageData.imageUrl || imageData.imageBase64)) {
        console.log(`[Chat] Flat-lay generated successfully for outfit ${outfit.id}`)

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId && msg.outfits) {
              return {
                ...msg,
                outfits: msg.outfits.map((o) =>
                  o.id === outfit.id
                    ? {
                        ...o,
                        flatLayImageUrl: imageData.imageUrl,
                        flatLayImageBase64: imageData.imageBase64,
                        isGeneratingFlatLay: false,
                        hasApproximateColors,
                        items: effectiveOutfit.items,
                        totalPrice: effectiveOutfit.totalPrice,
                      }
                    : o
                ),
              }
            }
            return msg
          })
        )
      } else {
        console.error('[Chat] Flat-lay generation failed:', imageData.message)
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId && msg.outfits) {
              return {
                ...msg,
                outfits: msg.outfits.map((o) =>
                  o.id === outfit.id
                    ? {
                        ...o,
                        isGeneratingFlatLay: false,
                        items: effectiveOutfit.items,
                        totalPrice: effectiveOutfit.totalPrice,
                      }
                    : o
                ),
              }
            }
            return msg
          })
        )
      }
    } catch (error) {
      console.error('[Chat] Flat-lay generation error:', error)
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.outfits) {
            return {
              ...msg,
              outfits: msg.outfits.map((o) =>
                o.id === outfit.id
                  ? {
                      ...o,
                      isGeneratingFlatLay: false,
                      items: effectiveOutfit.items,
                      totalPrice: effectiveOutfit.totalPrice,
                    }
                  : o
              ),
            }
          }
          return msg
        })
      )
    }
  }, [applyProductReplacements, loadFallbackCatalog])

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory: messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          sessionContext,
          conversationId,
          userPreferences: {
            gender: profile?.gender as 'men' | 'women' | undefined,
            userName: profile?.userName,
            ageRange: profile?.ageRange,
            stylePreferences: profile?.stylePreferences,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chat API')
      }

      const data = await response.json()

      if (data.sessionContext) {
        setSessionContext(data.sessionContext)
        console.log(`[Chat] Session updated: ${data.sessionContext.recommendedProductIds?.length || 0} total products recommended`)
      }

      let effectiveOutfits: Outfit[] = data.outfits || []
      let effectiveImageRequest = data.imageRequest

      if (data.looks && data.looks.length > 0 && effectiveOutfits.length === 0) {
        console.log(`[Chat] v5: Transforming ${data.looks.length} looks into outfit format`)
        effectiveOutfits = data.looks.map((look: any) => ({
          id: `look-${look.lookNumber}-${Date.now()}`,
          title: `Look ${look.lookNumber}: ${look.styleName}`,
          description: look.tip || look.styleName,
          totalPrice: look.totalPrice || look.items.reduce((sum: number, item: any) => sum + (item.price || 0), 0),
          items: look.items.map((item: any) => ({
            sku: item.sku || `sku-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: item.name,
            brand: item.brand || 'Unknown',
            price: item.price || 0,
            imageUrl: item.imageUrl || '/placeholder.svg',
            onlineUrl: item.url || '',
            category: item.category || '',
            colors: item.color ? [item.color] : [],
            sizes: [],
            availability: 'in_stock' as const,
            subCategory: item.category || '',
          })),
          imageUrl: '',
        }))
        effectiveImageRequest = effectiveOutfits.some(o => o.items.length > 0)
      }

      const outfitProducts: Product[] = effectiveOutfits.flatMap((o: Outfit) => o.items || [])
      if (outfitProducts.length > 0) {
        setAllProducts(prev => {
          const existingSkus = new Set(prev.map(p => p.sku))
          const newProducts = outfitProducts.filter((p: Product) => !existingSkus.has(p.sku))
          return [...prev, ...newProducts]
        })
      }

      const outfitsWithLoading = effectiveOutfits.map((outfit: Outfit) => ({
        ...outfit,
        isGeneratingFlatLay: effectiveImageRequest && outfit.items.length > 0,
      }))

      // v5.0: When looks are present, trim the message to just the intro greeting
      // since product details will be shown in OutfitRecommendationCard
      let displayMessage = data.message || 'สวัสดีค่ะ! นี่คือคำแนะนำสำหรับคุณ'
      if (outfitsWithLoading.length > 0 && displayMessage.length > 200) {
        const lookPatterns = [
          /[•\-]\s*\*\*Look\s*\d/i,
          /\*\*Look\s*\d/i,
          /LOOK:\d/,
          /---LOOKS_DATA---/,
          /\*\*\d+\.\s/,
          /\d+\.\s*\*\*/,
          /🔗\s*https?:\/\//,
          /\*\*แนะนำ/,
          /[•\-]\s*\*\*[A-Z]/,
        ]
        let cutIndex = displayMessage.length
        for (const pattern of lookPatterns) {
          const match = displayMessage.match(pattern)
          if (match && match.index !== undefined && match.index < cutIndex) {
            cutIndex = match.index
          }
        }
        if (cutIndex < displayMessage.length && cutIndex > 0) {
          displayMessage = displayMessage.substring(0, cutIndex).trim()
          displayMessage = displayMessage.replace(/[•\-\*:]+\s*$/, '').trim()
        }
      }

      const messageId = `ai-${Date.now()}`
      const aiResponse: ChatMessageType = {
        id: messageId,
        content: displayMessage,
        sender: 'assistant',
        timestamp: new Date(),
        outfits: outfitsWithLoading,
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      if (effectiveImageRequest && outfitsWithLoading.length > 0) {
        console.log('[Chat] Image request detected, generating flat-lay for outfit cards...')

        const acknowledgmentMessage: ChatMessageType = {
          id: `ai-ack-${Date.now()}`,
          content: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e20\u0e32\u0e1e LOOKs \u0e08\u0e32\u0e01\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e17\u0e35\u0e48\u0e41\u0e19\u0e30\u0e19\u0e33\u0e2a\u0e31\u0e01\u0e04\u0e23\u0e39\u0e48\u0e19\u0e30\u0e04\u0e30... \ud83c\udfa8',
          sender: 'assistant',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, acknowledgmentMessage])

        setGeneratingImage(true)
        setImageGenerationError(null)

        for (const outfit of outfitsWithLoading) {
          if (outfit.items.length > 0) {
            await generateFlatLayForOutfit(outfit, messageId, allProducts)
          }
        }

        setMessages((prev) => prev.filter((msg) =>
          msg.content !== '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e20\u0e32\u0e1e LOOKs \u0e08\u0e32\u0e01\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e17\u0e35\u0e48\u0e41\u0e19\u0e30\u0e19\u0e33\u0e2a\u0e31\u0e01\u0e04\u0e23\u0e39\u0e48\u0e19\u0e30\u0e04\u0e30... \ud83c\udfa8'
        ))

        setGeneratingImage(false)
      }
    } catch (error) {
      console.error('Chat error:', error)

      const aiResponse = getMockOutfitResponse(content)
      const messageId = `ai-mock-${Date.now()}`

      const mockOutfitsWithLoading = (aiResponse.outfits || []).map((outfit: Outfit) => ({
        ...outfit,
        isGeneratingFlatLay: outfit.items.length > 0,
      }))

      const mockMessage: ChatMessageType = {
        ...aiResponse,
        id: messageId,
        outfits: mockOutfitsWithLoading,
      }

      setMessages((prev) => [...prev, mockMessage])
      setIsTyping(false)

      if (mockOutfitsWithLoading.length > 0) {
        console.log('[Chat] Fallback: Auto-generating flat-lay for mock response...')

        const acknowledgmentMessage: ChatMessageType = {
          id: `ai-ack-${Date.now()}`,
          content: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e20\u0e32\u0e1e LOOKs \u0e08\u0e32\u0e01\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e17\u0e35\u0e48\u0e41\u0e19\u0e30\u0e19\u0e33\u0e2a\u0e31\u0e01\u0e04\u0e23\u0e39\u0e48\u0e19\u0e30\u0e04\u0e30... \ud83c\udfa8',
          sender: 'assistant',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, acknowledgmentMessage])

        setGeneratingImage(true)
        setImageGenerationError(null)

        for (const outfit of mockOutfitsWithLoading) {
          if (outfit.items.length > 0) {
            await generateFlatLayForOutfit(outfit, messageId, allProducts)
          }
        }

        setMessages((prev) => prev.filter((msg) =>
          msg.content !== '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e20\u0e32\u0e1e LOOKs \u0e08\u0e32\u0e01\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e17\u0e35\u0e48\u0e41\u0e19\u0e30\u0e19\u0e33\u0e2a\u0e31\u0e01\u0e04\u0e23\u0e39\u0e48\u0e19\u0e30\u0e04\u0e30... \ud83c\udfa8'
        ))

        setGeneratingImage(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, sessionContext, conversationId, profile, allProducts, generateFlatLayForOutfit])

  // ── Context value ─────────────────────────────────────────────────────────

  const value: ChatContextValue = {
    messages,
    isTyping,
    generatingImage,
    imageGenerationError,
    sessionContext,
    conversationId,
    hasActiveConversation,
    onViewOutfit,
    messagesEndRef,
    scrollToBottom,
    handleSendMessage,
    handleClearChat,
    getChatStatus,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
