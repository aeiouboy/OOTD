'use client'

import { useState, useEffect } from 'react'
import { ChatHeader } from './ChatHeader'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { QuickPrompts } from './QuickPrompts'
import { OutfitRecommendationCard } from './OutfitRecommendationCard'
import { InteractiveTestMode } from './InteractiveTestMode'
import { Button } from '@/components/ui/button'
import { PanelSizeControls } from '@/components/layout/PanelSizeControls'
import { useResizablePanelContext } from '@/components/layout/ResizablePanel'
import { Beaker } from 'lucide-react'
import type { ChatMessage as ChatMessageType, Outfit } from '@/lib/types'
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

  // v3.2: Initialize with Thai greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessageType = {
        id: 'greeting-initial',
        content: 'อ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา',
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

  const handleTestComplete = (result: TestResult) => {
    console.log('Test completed:', result)
  }

  const handleExportResults = (results: TestResult[]) => {
    exportResultsBoth(results)
  }

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

      // Create AI response message (normal flow)
      const aiResponse: ChatMessageType = {
        id: `ai-${Date.now()}`,
        content: data.message || 'สวัสดีค่ะ! นี่คือคำแนะนำสำหรับคุณ',
        sender: 'assistant',
        timestamp: new Date(),
        outfits: data.outfits || [],
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // v3.1: Check if this is an image generation request (Auto or Manual)
      if (data.imageRequest && data.outfitDescription) {
        console.log('[Chat] Image request detected, generating image...')

        // Add AI acknowledgment message for auto-generation (UX Feedback)
        const acknowledgmentMessage: ChatMessageType = {
          id: `ai-ack-${Date.now()}`,
          content: 'กำลังสร้างภาพ Looks Inspire จากสินค้าที่แนะนำสักครู่นะคะ... 🎨',
          sender: 'assistant',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, acknowledgmentMessage])

        // Generate image
        setGeneratingImage(true)
        setImageGenerationError(null)

        try {
          const imageResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              description: data.outfitDescription,
            }),
          })

          const imageData = await imageResponse.json()

          if (imageData.success && (imageData.imageUrl || imageData.imageBase64)) {
            // Determine UI Description (Thai)
            const uiDescription = (data.outfits && data.outfits.length > 0)
              ? data.outfits[0].description
              : "ภาพตัวอย่าง Looks Inspire จากชุดที่แนะนำ ✨";

            const imageMessage: ChatMessageType = {
              id: `ai-image-${Date.now()}`,
              content: 'นี่คือภาพชุดที่เราคิด! ✨',
              sender: 'assistant',
              timestamp: new Date(),
              imageUrl: imageData.imageUrl,
              imageBase64: imageData.imageBase64,
              outfitDescription: uiDescription, // Use Thai Description for UI
            }
            setMessages((prev) => [...prev, imageMessage])
          } else {
            // Image generation failed
            setImageGenerationError(imageData.message || 'ไม่สามารถสร้างภาพได้ กรุณาลองใหม่อีกครั้ง')

            // Only show error message if it was an explicit request (optional, here we show small error)
            const errorMessage: ChatMessageType = {
              id: `ai-error-${Date.now()}`,
              content: `ขออภัยค่ะ ${imageData.message || 'ไม่สามารถสร้างภาพได้ กรุณาลองใหม่อีกครั้ง'} 😊`,
              sender: 'assistant',
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
          }
        } catch (error) {
          console.error('[Chat] Image generation error:', error)
          setImageGenerationError('เกิดข้อผิดพลาดในการสร้างภาพ')

          const errorMessage: ChatMessageType = {
            id: `ai-error-${Date.now()}`,
            content: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการสร้างภาพ ลองใหม่อีกครั้งได้นะคะ 😊',
            sender: 'assistant',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setGeneratingImage(false)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)

      // Fallback to mock response on error
      const aiResponse = getMockOutfitResponse(content)
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // v3.2: Auto-trigger image generation for Mock/Fallback responses
      if (aiResponse.outfits && aiResponse.outfits.length > 0) {
        console.log('[Chat] Fallback: Auto-generating image for mock response...')

        // Add acknowledgement
        const acknowledgmentMessage: ChatMessageType = {
          id: `ai-ack-${Date.now()}`,
          content: 'กำลังสร้างภาพ Looks Inspire จากสินค้าที่แนะนำสักครู่นะคะ... 🎨',
          sender: 'assistant',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, acknowledgmentMessage])

        // Trigger generation
        setGeneratingImage(true)
        setImageGenerationError(null)

        try {
          // Generate description from the first outfit/products
          const distinctProducts = aiResponse.outfits[0].items.slice(0, 3)
          const productDesc = distinctProducts.map(p => (p as any).visualDescription || p.name).join(', ')
          const desc = `Fashion outfit usage: ${productDesc}. Style: Professional fashion model.`

          const imageResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: desc }),
          })

          const imageData = await imageResponse.json()

          // Determine UI Description (Thai) from fallback response
          const uiDescription = (aiResponse.outfits && aiResponse.outfits.length > 0)
            ? aiResponse.outfits[0].description
            : "ภาพตัวอย่าง Looks Inspire จากชุดที่แนะนำ ✨";

          if (imageData.success && (imageData.imageUrl || imageData.imageBase64)) {
            const imageMessage: ChatMessageType = {
              id: `ai-image-${Date.now()}`,
              content: 'นี่คือภาพชุดที่เราคิด! ✨',
              sender: 'assistant',
              timestamp: new Date(),
              imageUrl: imageData.imageUrl,
              imageBase64: imageData.imageBase64,
              outfitDescription: uiDescription, // Use Thai Description for UI
            }
            setMessages((prev) => [...prev, imageMessage])
          } else {
            setImageGenerationError(imageData.message || 'Image generation failed')
            const errorMessage: ChatMessageType = {
              id: `ai-error-${Date.now()}`,
              content: `ขออภัยค่ะ ${imageData.message || 'ไม่สามารถสร้างภาพได้ (Mock Mode)'} 😊`,
              sender: 'assistant',
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
          }
        } catch (err) {
          console.error('Fallback Image Gen Error:', err)
          setImageGenerationError('Failed to generate image')
          const errorMessage: ChatMessageType = {
            id: `ai-error-${Date.now()}`,
            content: 'ขออภัยค่ะ ไม่สามารถเชื่อมต่อกับบริการสร้างภาพได้',
            sender: 'assistant',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setGeneratingImage(false)
        }
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

      {!testMode && <ChatHeader />}

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

              {/* Outfit recommendations */}
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
