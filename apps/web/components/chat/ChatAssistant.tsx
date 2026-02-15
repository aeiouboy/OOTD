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
import { ensureFootwearStyling } from '@/lib/utils/styling-completion'

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

  /**
   * v5.0: Generate flat-lay image for an outfit and update the message
   * v8.1: Simplified -- no cross-look replacement, includes stylingItems for total look
   */
  const generateFlatLayForOutfit = useCallback(async (
    outfit: Outfit,
    messageId: string,
  ) => {
    console.log(`[Chat] Generating flat-lay for outfit ${outfit.id}...`)

    // Build flat-lay items from catalog products (max 5)
    const catalogFlatLayItems: FlatLayItem[] = outfit.items.slice(0, 5).map((item: Product) => ({
      name: item.name,
      category: item.subCategory || item.category || 'Item',
      color: item.colors?.[0],
      visualDescription: item.visualDescription,
      sku: item.sku,
      thumbnailUrl: item.imageUrl,
    }))

    const completedStylingItems = ensureFootwearStyling({
      outfitTitle: outfit.title,
      outfitDescription: outfit.description,
      catalogItems: outfit.items,
      stylingItems: outfit.stylingItems || [],
    })

    // Add styling items (knowledge-based) for flat-lay visualization only
    const stylingFlatLayItems: FlatLayItem[] = completedStylingItems.map((s) => ({
      name: s.description,
      category: s.category || 'Accessory',
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
                    ? { ...o, flatLayImageUrl: imageData.imageUrl, flatLayImageBase64: imageData.imageBase64, isGeneratingFlatLay: false }
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
                  o.id === outfit.id ? { ...o, isGeneratingFlatLay: false } : o
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
                o.id === outfit.id ? { ...o, isGeneratingFlatLay: false } : o
              ),
            }
          }
          return msg
        })
      )
    }
  }, [])

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

      // v5.0: Convert looks → Outfit[] if v5 API returned structured looks
      let resolvedOutfits: Outfit[] = data.outfits || []
      if (data.looks && Array.isArray(data.looks) && data.looks.length > 0) {
        resolvedOutfits = convertLooksToOutfits(data.looks)
        console.log(`[Chat] Converted ${data.looks.length} v5 looks → Outfit[]`)
      }

      // v5.0: Mark outfits as generating flat-lay if we have image request
      const outfitsWithLoading = resolvedOutfits.map((outfit: Outfit) => ({
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
            await generateFlatLayForOutfit(outfit, messageId)
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
