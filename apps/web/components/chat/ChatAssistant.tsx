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
import { Beaker } from 'lucide-react'
import type { ChatMessage as ChatMessageType, Outfit, FlatLayItem, Product } from '@/lib/types'
import {
  findReplacementsForInconsistentProducts,
  validateProductVisualConsistency,
} from '@/lib/utils/product-visual-validator'
import type { TestResult } from '@/lib/types/test-types'
import { getMockOutfitResponse } from '@/lib/mock-data'
import { exportResultsBoth } from '@/lib/test-result-exporter'
import type { SessionContext } from '@/lib/types/chat-types'
import { createSessionContext } from '@/lib/utils/session-context'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

interface ChatAssistantProps {
  onViewOutfit: (outfit: Outfit) => void
}

export function ChatAssistant({ onViewOutfit }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [testMode, setTestMode] = useState(false)

  // v2.0: Session context for duplicate prevention
  const [sessionContext, setSessionContext] = useState<SessionContext>(() => createSessionContext())
  const [conversationId] = useState<string>(() => `conv-${Date.now()}`)

  // v2.4: User profile for gender preference
  const { profile } = useUserProfile()

  // v3.1: Image generation state (Customer Journey Step 4)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null)

  // v8.0: All products for visual consistency replacement lookup
  const [allProducts, setAllProducts] = useState<Product[]>([])

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

  /**
   * v8.0: Apply product replacements to an outfit for visual consistency
   * Creates a new outfit with items array where mismatched items are replaced
   * Recalculates totalPrice based on replacement prices
   */
  const applyProductReplacements = useCallback((
    outfit: Outfit,
    replacements: Map<string, Product>
  ): Outfit => {
    if (replacements.size === 0) return outfit

    const updatedItems = outfit.items.map(item => {
      const replacement = replacements.get(item.sku)
      return replacement || item
    })

    // Recalculate total price
    const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0)

    return {
      ...outfit,
      items: updatedItems,
      totalPrice: newTotalPrice,
    }
  }, [])

  const handleTestComplete = (result: TestResult) => {
    console.log('Test completed:', result)
  }

  const handleExportResults = (results: TestResult[]) => {
    exportResultsBoth(results)
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

  /**
   * v5.0: Generate flat-lay image for an outfit and update the message
   * v8.0: Enhanced with visual consistency validation and product replacement
   *
   * This function:
   * 1. Validates visual consistency between product text and thumbnails
   * 2. Replaces visually inconsistent products with consistent alternatives
   * 3. Generates flat-lay image using the corrected products
   * 4. Updates both the flat-lay image AND the product list in the message
   */
  const generateFlatLayForOutfit = useCallback(async (
    outfit: Outfit,
    messageId: string,
    productCatalog?: Product[]
  ) => {
    console.log(`[Chat] Generating flat-lay for outfit ${outfit.id}...`)

    // v8.0: Check for visual inconsistencies and find replacements if catalog provided
    let effectiveOutfit = outfit
    let replacementsMade = new Map<string, Product>()

    if (productCatalog && productCatalog.length > 0) {
      const replacementResult = findReplacementsForInconsistentProducts(
        outfit.items,
        productCatalog,
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

        // Apply replacements to create the effective outfit
        effectiveOutfit = applyProductReplacements(outfit, replacementResult.replacements)
        replacementsMade = replacementResult.replacements

        // Update the message with corrected product list BEFORE generating flat-lay
        // This ensures the product thumbnails shown match the flat-lay image
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

    // Extract FlatLayItem array from effective outfit items (with replacements applied)
    const flatLayItems: FlatLayItem[] = effectiveOutfit.items.slice(0, 5).map((item: Product) => ({
      name: item.name,
      category: item.subCategory || item.category || 'Item',
      color: item.colors?.[0],
      visualDescription: item.visualDescription,
    }))
    const occasionContext = outfit.description

    if (flatLayItems.length === 0) {
      console.log('[Chat] No items to generate flat-lay for')
      return
    }

    try {
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: outfit.description || 'LOOKs Inspiration',
          generationType: 'flat-lay',
          flatLayItems,
          occasionContext,
        }),
      })

      const imageData = await imageResponse.json()

      if (imageData.success && (imageData.imageUrl || imageData.imageBase64)) {
        console.log(`[Chat] Flat-lay generated successfully for outfit ${outfit.id}`)

        // Update the message's outfit with the flat-lay image
        // Note: Product items were already updated above if replacements were made
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
                        // Ensure items are the effective items (with replacements)
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
        // Mark as not generating (will show fallback thumbnail)
        // Still apply any product replacements even if image generation failed
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
      // Mark as not generating on error
      // Still apply any product replacements even if image generation failed
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
  }, [applyProductReplacements])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Call real chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chat API')
      }

      const data = await response.json()

      // v2.0: Update session context if returned
      if (data.sessionContext) {
        setSessionContext(data.sessionContext)
        console.log(`[Chat] Session updated: ${data.sessionContext.recommendedProductIds?.length || 0} total products recommended`)
      }

      // v8.0: Collect all products from outfits for visual consistency replacement lookup
      const outfitProducts: Product[] = (data.outfits || []).flatMap((o: Outfit) => o.items || [])
      if (outfitProducts.length > 0) {
        setAllProducts(prev => {
          // Merge with existing products, avoiding duplicates by SKU
          const existingSkus = new Set(prev.map(p => p.sku))
          const newProducts = outfitProducts.filter((p: Product) => !existingSkus.has(p.sku))
          return [...prev, ...newProducts]
        })
      }

      // v5.0: Mark outfits as generating flat-lay if we have image request
      const outfitsWithLoading = (data.outfits || []).map((outfit: Outfit) => ({
        ...outfit,
        isGeneratingFlatLay: data.imageRequest && outfit.items.length > 0,
      }))

      // Create AI response message
      const messageId = `ai-${Date.now()}`
      const aiResponse: ChatMessageType = {
        id: messageId,
        content: data.message || 'สวัสดีค่ะ! นี่คือคำแนะนำสำหรับคุณ',
        sender: 'assistant',
        timestamp: new Date(),
        outfits: outfitsWithLoading,
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // v5.0: Generate flat-lay images for each outfit (embedded in card, no separate message)
      if (data.imageRequest && outfitsWithLoading.length > 0) {
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

        // Generate flat-lay for each outfit, passing allProducts for visual consistency replacement
        for (const outfit of outfitsWithLoading) {
          if (outfit.items.length > 0) {
            await generateFlatLayForOutfit(outfit, messageId, allProducts)
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

      // Fallback to mock response on error
      const aiResponse = getMockOutfitResponse(content)
      const messageId = `ai-mock-${Date.now()}`

      // v5.0: Mark mock outfits as generating flat-lay
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
            await generateFlatLayForOutfit(outfit, messageId, allProducts)
          }
        }

        // Remove the acknowledgment message now that flat-lay images are shown in cards
        setMessages((prev) => prev.filter((msg) =>
          msg.content !== 'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨'
        ))

        setGeneratingImage(false)
      }
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
      {testMode && isTestModeEnabled && (
        <div className="flex-1 overflow-hidden">
          <InteractiveTestMode onExport={handleExportResults} />
        </div>
      )}

      {!testMode && (
        <ChatHeader
          status={getChatStatus()}
          onClearChat={handleClearChat}
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
                    />
                  ))}
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
    </div>
  )
}
