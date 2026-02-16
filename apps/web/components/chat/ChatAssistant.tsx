'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChatHeader, ChatStatus } from './ChatHeader'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { QuickPrompts } from './QuickPrompts'
import { OutfitRecommendationCard } from './OutfitRecommendationCard'
import { InteractiveTestMode } from './InteractiveTestMode'
import { Button } from '@/components/ui/button'
import { PanelSizeControls } from '@/components/layout/PanelSizeControls'
import { useResizablePanelContext } from '@/components/layout/ResizablePanel'
import { ArrowRight, Beaker, BookOpen, Check, Info, Shirt, Sparkles, X } from 'lucide-react'
import { SettingsDialog } from './SettingsDialog'
import { UserProfileDialog } from './UserProfileDialog'
import type { ChatMessage as ChatMessageType, Outfit, FlatLayItem, Product } from '@/lib/types'
import type { TestResult } from '@/lib/types/test-types'
import { getMockOutfitResponse } from '@/lib/mock-data'
import { exportResultsBoth } from '@/lib/test-result-exporter'
import type { SessionContext } from '@/lib/types/chat-types'
import { createSessionContext } from '@/lib/utils/session-context'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { convertLooksToOutfits } from '@/lib/utils/chat-look-transformers'
import { selectCatalogFlatLayItems, selectFlatLaySupplements } from '@/lib/utils/styling-completion'

interface ChatAssistantProps {
  onViewOutfit: (outfit: Outfit) => void
  isInWishlist?: (outfitId: string) => boolean
  onToggleWishlist?: (outfit: Outfit) => void
}

export function ChatAssistant({
  onViewOutfit,
  isInWishlist,
  onToggleWishlist,
}: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [testMode, setTestMode] = useState(false)

  // v2.0: Session context for duplicate prevention
  const [sessionContext, setSessionContext] = useState<SessionContext>(() => createSessionContext())
  const [conversationId] = useState<string>(() => `conv-${Date.now()}`)

  // v2.4: User profile for gender preference (moved above)

  // v3.1: Image generation state (Customer Journey Step 4)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null)

  // v8.0: (Removed) All products state and replacement catalog removed to fix cross-look contamination

  // v9.0: Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // v10.0: User profile dialog state
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  
  // v10.0: Get updateProfile function
  const { profile, updateProfile } = useUserProfile()


  // v3.2: Initialize with Thai greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessageType = {
        id: 'greeting-initial',
        content: 'ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา',
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages([greeting])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Get resize controls from ResizablePanel context (optional - only if in resizable panel)
  let panelWidth = 420
  let setPresetSize: ((size: number) => void) | undefined
  try {
    const context = useResizablePanelContext()
    panelWidth = context.panelWidth
    setPresetSize = context.setPresetSize
  } catch {
    // Not in a resizable panel context, that's okay
  }

  const isTestModeEnabled = process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === 'true'
  const INFO_CTA_PROMPT = 'แนะนำลุคให้หน่อย'
  const INFO_CTA_LABEL = 'สร้างลุคให้ดู'
  const LOOK_CTA_YES_PREFIX = '__LOOK_CTA_YES__::'
  const LOOK_CTA_NO_PREFIX = '__LOOK_CTA_NO__::'
  const MAX_LOOKS_PER_RESPONSE = 2
  const ENABLE_CHAT_MOCK_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_CHAT_MOCK_FALLBACK === 'true'

  // v8.0: (Removed) applyProductReplacements and loadFallbackCatalog removed to fix cross-look contamination

  const handleTestComplete = (result: TestResult) => {
    console.log('Test completed:', result)
  }

  const handleExportResults = (results: unknown) => {
    console.log('Exported results:', results)
  }

  // v9.0: Clear chat handler for enhanced header
  const handleClearChat = useCallback(() => {
    // Reset to initial greeting
    const greeting: ChatMessageType = {
      id: 'greeting-initial',
      content: 'ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา',
      sender: 'assistant',
      timestamp: new Date(),
    }
    setMessages([greeting])
    // Reset session context
    setSessionContext(createSessionContext())
  }, [])

  // v9.0: Compute chat status based on current state
  const getChatStatus = useCallback((): ChatStatus => {
    if (isTyping) return 'typing'
    if (generatingImage) return 'generating'
    return 'online'
  }, [isTyping, generatingImage])

  const dismissMessageCtas = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((msg) => (
      msg.id === messageId
        ? { ...msg, showInfoCTA: false, showLookConfirmationCTA: false }
        : msg
    )))
  }, [])

  /**
   * v5.0: Generate flat-lay image for an outfit and update the message
   * v8.1: Simplified -- no cross-look replacement, includes stylingItems for total look
   */
  const generateFlatLayForOutfit = useCallback(async (
    outfit: Outfit,
    messageId: string,
  ) => {
    console.log(`[Chat] Generating flat-lay for outfit ${outfit.id}...`)

    const scopedCatalogItems = selectCatalogFlatLayItems(outfit.items, 5)

    // Build flat-lay items from catalog products (strict scoped subset)
    const catalogFlatLayItems: FlatLayItem[] = scopedCatalogItems.map((item: Product) => ({
      name: item.name,
      category: item.subCategory || item.category || 'Item',
      color: item.colors?.[0],
      visualDescription: item.visualDescription,
      sku: item.sku,
      thumbnailUrl: item.imageUrl,
    }))

    const flatLaySupplements = selectFlatLaySupplements({
      outfitTitle: outfit.title,
      outfitDescription: outfit.description,
      catalogItems: scopedCatalogItems,
      stylingItems: outfit.stylingItems || [],
    })

    // Add only non-garment supplements (footwear/accessories) to avoid cross-look contamination
    const stylingFlatLayItems: FlatLayItem[] = flatLaySupplements.map((s) => ({
      name: s.description,
      category: s.category || 'Shoes',
      visualDescription: s.description,
      // No sku, no thumbnailUrl -- these are knowledge-based, not catalog products
    }))

    // Combine: catalog items first, then styling items (max 6 total for layout)
    const flatLayItems = [...catalogFlatLayItems, ...stylingFlatLayItems].slice(0, 6)
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
                      flatLayGenerationFailed: false,
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
                      flatLayImageUrl: undefined,
                      flatLayImageBase64: undefined,
                      isGeneratingFlatLay: false,
                      flatLayGenerationFailed: true,
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
                    flatLayImageUrl: undefined,
                    flatLayImageBase64: undefined,
                    isGeneratingFlatLay: false,
                    flatLayGenerationFailed: true,
                  }
                  : o
              ),
            }
          }
          return msg
        })
      )
    }
  }, [])

  const handleSendMessage = async (
    content: string,
    options?: { apiMessage?: string }
  ) => {
    const normalizedMessage = content.trim()
    if (!normalizedMessage) return
    const apiMessage = options?.apiMessage?.trim() || normalizedMessage
    const isLookGenerationCtaRequest = apiMessage.startsWith(LOOK_CTA_YES_PREFIX)
    const pendingLookQueryFromCta = isLookGenerationCtaRequest
      ? apiMessage.slice(LOOK_CTA_YES_PREFIX.length).trim()
      : ''

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: normalizedMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    // Hide old INFO CTA chips when user sends a new message.
    setMessages((prev) => [
      ...prev.map((msg) => (
        msg.showInfoCTA || msg.showLookConfirmationCTA
          ? { ...msg, showInfoCTA: false, showLookConfirmationCTA: false }
          : msg
      )),
      userMessage,
    ])
    setIsTyping(true)

    try {
      const requestBody = {
        message: apiMessage,
        conversationHistory: messages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        sessionContext, // v2.0: Send current session context
        conversationId, // v2.0: Send conversation ID
        userPreferences: {
          gender: profile?.gender as 'men' | 'women' | undefined,
          userName: profile?.userName,
          ageRange: profile?.ageRange,
          stylePreferences: profile?.stylePreferences,
        }, // v2.5: Pass detailed profile info
      }

      type RetriableChatError = Error & { retriable?: boolean }
      const isRetriableNetworkError = (error: unknown): error is RetriableChatError => {
        if (error instanceof TypeError) {
          return /failed to fetch|networkerror|load failed/i.test(error.message)
        }
        if (error instanceof Error && 'retriable' in error) {
          return Boolean((error as RetriableChatError).retriable)
        }
        return false
      }

      const fetchChatResponse = async () => {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const retriableStatuses = new Set([502, 503, 504])
          const error: RetriableChatError = new Error(`Failed to get response from chat API (${response.status})`)
          error.retriable = retriableStatuses.has(response.status)
          throw error
        }

        return response.json()
      }

      const maxRetryAttempts = 2
      let data: Awaited<ReturnType<typeof fetchChatResponse>> | null = null
      let lastError: unknown = null

      for (let attempt = 1; attempt <= maxRetryAttempts; attempt++) {
        try {
          data = await fetchChatResponse()
          lastError = null
          break
        } catch (error) {
          lastError = error
          if (attempt >= maxRetryAttempts || !isRetriableNetworkError(error)) {
            break
          }

          const retryDelayMs = attempt * 350
          console.warn(
            `[Chat] /api/chat attempt ${attempt} failed with retriable error. Retrying in ${retryDelayMs}ms...`,
            error
          )
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
        }
      }

      if (!data) {
        throw (lastError instanceof Error ? lastError : new Error('Failed to get response from chat API'))
      }

      // v2.0: Update session context if returned
      if (data.sessionContext) {
        setSessionContext(data.sessionContext)
        console.log(`[Chat] Session updated: ${data.sessionContext.recommendedProductIds?.length || 0} total products recommended`)
      }

      // v5.0: Convert looks → Outfit[] if v5 API returned structured looks
      let resolvedOutfits: Outfit[] = data.outfits || []
      if (data.looks && Array.isArray(data.looks) && data.looks.length > 0) {
        const cappedLooks = data.looks.slice(0, MAX_LOOKS_PER_RESPONSE)
        if (data.looks.length > cappedLooks.length) {
          console.log(`[Chat] Capped looks on client: ${data.looks.length} → ${cappedLooks.length}`)
        }
        resolvedOutfits = convertLooksToOutfits(cappedLooks)
        console.log(`[Chat] Converted ${cappedLooks.length} v5 looks → Outfit[]`)
      }

      // Guardrail: Drop malformed looks that have no catalog items.
      // Rendering item-less cards causes flat-lay generation failures and poor UX.
      const validOutfits = resolvedOutfits.filter((outfit: Outfit) =>
        Array.isArray(outfit.items) && outfit.items.length > 0
      )
      if (validOutfits.length !== resolvedOutfits.length) {
        console.warn(
          `[Chat] Dropped ${resolvedOutfits.length - validOutfits.length} malformed outfit(s) without items`
        )
      }

      // CTA-triggered look generation should render the same flat-lay experience
      // as regular outfit recommendations (avoid falling back to mannequin photos).
      const shouldAutoGenerateFlatLay = Boolean(
        data.imageRequest &&
        validOutfits.length > 0
      )
      const allowLazyFlatLayGeneration = true

      // v5.0: Mark outfits as generating flat-lay only when auto image generation is enabled
      const outfitsWithLoading = validOutfits.map((outfit: Outfit) => ({
        ...outfit,
        isGeneratingFlatLay: shouldAutoGenerateFlatLay && outfit.items.length > 0,
        flatLayGenerationFailed: false,
        allowLazyFlatLayGeneration,
      }))

      // Create AI response message
      const messageId = `ai-${Date.now()}`
      const aiResponse: ChatMessageType = {
        id: messageId,
        content: data.message || 'สวัสดีค่ะ! นี่คือคำแนะนำสำหรับคุณ',
        sender: 'assistant',
        timestamp: new Date(),
        outfits: outfitsWithLoading,
        showInfoCTA: data.responseType === 'info',
        showLookConfirmationCTA: data.responseType === 'look_confirmation',
        pendingLookQuery: data.pendingLookQuery,
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // v5.0: Generate flat-lay images for each outfit (embedded in card, no separate message)
      if (shouldAutoGenerateFlatLay && outfitsWithLoading.length > 0) {
        console.log('[Chat] Image request detected, generating flat-lay for outfit cards...')

        // Add AI acknowledgment message for generation
        const acknowledgmentMessage: ChatMessageType = {
          id: `ai-ack-${Date.now()}`,
          content: 'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨',
          sender: 'assistant',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, acknowledgmentMessage])

        setGeneratingImage(true)
        setImageGenerationError(null)

        // Generate flat-lay for each outfit (isolated per-look, no cross-look replacement)
        for (const outfit of outfitsWithLoading) {
          if (outfit.items.length > 0) {
            await generateFlatLayForOutfit(outfit, messageId)
          }
        }

        // Remove the acknowledgment message now that flat-lay images are shown in cards
        setMessages((prev) => prev.filter((msg) =>
          msg.content !== 'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨'
        ))

        setGeneratingImage(false)
      }
    } catch (error) {
      console.error('Chat error:', error)

      // CTA look-generation path should never fall back to generic mock looks.
      // Keep UX in "information mode" and let user retry generation explicitly.
      if (isLookGenerationCtaRequest) {
        const ctaFallbackMessage: ChatMessageType = {
          id: `ai-cta-fallback-${Date.now()}`,
          content: 'ยังสร้างลุคไม่สำเร็จในรอบนี้ เดี๋ยวคุยข้อมูลต่อให้ก่อนนะ ถ้าพร้อมเมื่อไรค่อยกดสร้างลุคอีกครั้งได้เลย',
          sender: 'assistant',
          timestamp: new Date(),
          showInfoCTA: true,
          pendingLookQuery: pendingLookQueryFromCta || INFO_CTA_PROMPT,
        }
        setMessages((prev) => [...prev, ctaFallbackMessage])
        setIsTyping(false)
        setGeneratingImage(false)
        return
      }

      // Optional debug fallback: only enable mock payload if explicitly requested.
      if (ENABLE_CHAT_MOCK_FALLBACK) {
        const aiResponse = getMockOutfitResponse(content)
        const messageId = `ai-mock-${Date.now()}`

        // v5.0: Mark mock outfits as generating flat-lay
        const mockOutfitsWithLoading = (aiResponse.outfits || [])
          .filter((outfit: Outfit) => Array.isArray(outfit.items) && outfit.items.length > 0)
          .map((outfit: Outfit) => ({
          ...outfit,
          isGeneratingFlatLay: outfit.items.length > 0,
          flatLayGenerationFailed: false,
        }))

        const mockMessage: ChatMessageType = {
          ...aiResponse,
          id: messageId,
          outfits: mockOutfitsWithLoading,
        }

        setMessages((prev) => [...prev, mockMessage])
        setIsTyping(false)

        // v5.0: Auto-generate flat-lay for mock responses
        if (mockOutfitsWithLoading.length > 0) {
          console.log('[Chat] Fallback: Auto-generating flat-lay for mock response...')

          // Add acknowledgement
          const acknowledgmentMessage: ChatMessageType = {
            id: `ai-ack-${Date.now()}`,
            content: 'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨',
            sender: 'assistant',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, acknowledgmentMessage])

          setGeneratingImage(true)
          setImageGenerationError(null)

          for (const outfit of mockOutfitsWithLoading) {
            if (outfit.items.length > 0) {
              await generateFlatLayForOutfit(outfit, messageId)
            }
          }

          // Remove the acknowledgment message now that flat-lay images are shown in cards
          setMessages((prev) => prev.filter((msg) =>
            msg.content !== 'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨'
          ))

          setGeneratingImage(false)
        }

        return
      }

      setMessages((prev) => [...prev, {
        id: `ai-error-${Date.now()}`,
        content: 'ตอนนี้เชื่อมต่อระบบไม่เสถียรชั่วคราว เลยยังสร้างลุคไม่ได้ ลองส่งอีกครั้งได้เลย เดี๋ยวช่วยต่อให้ทันที',
        sender: 'assistant',
        timestamp: new Date(),
      }])
      setImageGenerationError('Network error while requesting /api/chat')
      setIsTyping(false)
      setGeneratingImage(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Test Mode Header */}
      {isTestModeEnabled && (
        <div className={`border-b px-4 py-3 flex items-center justify-between ${testMode ? 'bg-orange-50' : ''}`}>
          <div className="flex items-center gap-2">
            {testMode && (
              <span className="px-3 py-1 bg-orange-500 text-white font-bold rounded-md text-sm flex items-center gap-1">
                <Beaker className="w-4 h-4" />
                TEST MODE
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {testMode ? 'LLM Model Testing Interface' : 'OOTDay Stylist'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {setPresetSize && <PanelSizeControls currentWidth={panelWidth} onSizeChange={setPresetSize} />}
            <Button
              size="sm"
              variant={testMode ? "primary" : "outline"}
              onClick={() => setTestMode(!testMode)}
              className={testMode ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <Beaker className="w-4 h-4 mr-2" />
              {testMode ? 'Exit Test Mode' : 'Test Mode'}
            </Button>
          </div>
        </div>
      )}

      {/* Regular Header with resize controls */}
      {!isTestModeEnabled && !testMode && (
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">OOTDay Stylist</span>
          {setPresetSize && <PanelSizeControls currentWidth={panelWidth} onSizeChange={setPresetSize} />}
        </div>
      )}

      {/* Interactive Test Mode - Full Screen */}
      {testMode && (
        <div className="flex-1 overflow-hidden">
          <InteractiveTestMode onExport={handleExportResults} />
        </div>
      )}

      {!testMode && (
        <ChatHeader
          status={getChatStatus()}
          onClearChat={handleClearChat}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onProfileClick={() => setIsProfileOpen(true)}
        />
      )}

      {/* Messages Area */}
      {!testMode && (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                สวัสดีค่ะ! OOTDay Stylist พร้อมช่วยหาลุคที่ใช่สำหรับคุณค่ะ ✨
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessage message={message} />

              {/* Outfit recommendations with embedded flat-lay images */}
              {message.outfits && message.outfits.length > 0 && (
                <div className="ml-10 mt-2 space-y-2">
                  {message.outfits.map((outfit) => (
                    <OutfitRecommendationCard
                      key={outfit.id}
                      outfit={outfit}
                      onViewOutfit={onViewOutfit}
                      isInWishlist={isInWishlist?.(outfit.id)}
                      onToggleWishlist={onToggleWishlist}
                    />
                  ))}
                </div>
              )}

              {message.showInfoCTA && message.sender === 'assistant' && (
                <div className="relative ml-10 mt-3 max-w-md overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-3 shadow-[0_10px_28px_-22px_rgba(194,65,12,0.85)]">
                  <div className="absolute -right-9 -top-9 h-24 w-24 rounded-full bg-orange-200/35 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 rounded-full bg-amber-100 p-1.5 text-amber-700">
                        <Info className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800">
                          <Sparkles className="h-3 w-3" />
                          โหมดข้อมูล
                        </div>
                        <p className="mt-1.5 text-xs font-semibold text-amber-950">
                          ได้คำตอบแล้ว ถ้าต้องการเดี๋ยวต่อยอดเป็นลุคให้ดูทันที
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-amber-900/80">
                          ใช้บริบทเดิมทั้งหมด และยังคุยแบบข้อมูลต่อได้
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage(INFO_CTA_LABEL, {
                          apiMessage: `${LOOK_CTA_YES_PREFIX}${message.pendingLookQuery || INFO_CTA_PROMPT}`,
                        })}
                        disabled={isTyping}
                        className="h-8 rounded-full bg-amber-600 px-3 text-xs text-white transition-transform hover:-translate-y-0.5 hover:bg-amber-700"
                      >
                        <Shirt className="mr-1.5 h-3.5 w-3.5" />
                        {INFO_CTA_LABEL}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissMessageCtas(message.id)}
                        disabled={isTyping}
                        className="h-8 rounded-full px-3 text-xs text-amber-900 hover:bg-amber-100/80"
                      >
                        <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                        ถามต่อ
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {message.showLookConfirmationCTA && message.sender === 'assistant' && (
                <div className="relative ml-10 mt-3 max-w-md overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-cyan-50 to-white p-3 shadow-[0_10px_28px_-22px_rgba(2,132,199,0.85)]">
                  <div className="absolute -left-9 -bottom-9 h-24 w-24 rounded-full bg-sky-200/35 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-800">
                        <Sparkles className="h-3 w-3" />
                        เลือกโหมดตอบ
                      </div>
                      <span className="text-[10px] font-medium text-sky-800/80">ขั้นตอนถัดไป</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-sky-950">
                      ต่อจากข้อมูลนี้ อยากให้เราสร้างลุคให้ดูเลยไหม
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-sky-900/80">
                      เลือกได้เลยว่าจะ “สร้างลุคทันที” หรือ “คุยข้อมูลต่อก่อน”
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage('ใช่ สร้างลุคให้ดู', {
                          apiMessage: `${LOOK_CTA_YES_PREFIX}${message.pendingLookQuery || ''}`,
                        })}
                        disabled={isTyping}
                        className="h-auto min-h-14 rounded-xl bg-sky-600 px-3 py-2 text-left text-xs text-white transition-transform hover:-translate-y-0.5 hover:bg-sky-700"
                      >
                        <span className="flex w-full items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="leading-tight">
                            <span className="block font-semibold">ใช่ สร้างลุคให้ดู</span>
                            <span className="mt-0.5 block text-[10px] text-sky-100">
                              ใช้บริบทเดิม สร้างทันที
                            </span>
                          </span>
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage('ไม่ ขอดูข้อมูลก่อน', {
                          apiMessage: `${LOOK_CTA_NO_PREFIX}${message.pendingLookQuery || ''}`,
                        })}
                        disabled={isTyping}
                        className="h-auto min-h-14 rounded-xl border-sky-200 bg-white/85 px-3 py-2 text-left text-xs text-sky-900 transition-transform hover:-translate-y-0.5 hover:bg-sky-100"
                      >
                        <span className="flex w-full items-start gap-2">
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="leading-tight">
                            <span className="block font-semibold">ยังไม่ คุยข้อมูลต่อ</span>
                            <span className="mt-0.5 block text-[10px] text-sky-700/80">
                              จะไม่สร้างลุคอัตโนมัติ
                            </span>
                          </span>
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts */}
      {!testMode && <QuickPrompts onPromptClick={handleSendMessage} />}

      {/* Chat Input */}
      {!testMode && <ChatInput onSend={handleSendMessage} disabled={isTyping} />}

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        testMode={testMode}
        onToggleTestMode={() => setTestMode(!testMode)}
        onClearChat={handleClearChat}
        currentVersion={process.env.NEXT_PUBLIC_SYSTEM_PROMPT_VERSION || 'v5.0'}
      />
      
      <UserProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profile={profile}
        onSave={updateProfile}
      />
    </div>
  )
}
