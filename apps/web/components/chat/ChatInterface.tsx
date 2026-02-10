"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { ChatMessage, ConversationStarter, Outfit } from "@/lib/types"
import { conversationStarters, quickActions, getMockOutfitResponse } from "@/lib/mock-data"
import { Send, Camera, Sparkles, Beaker } from "lucide-react"
import { InteractiveTestMode } from "./InteractiveTestMode"
import type { TestResult } from "@/lib/types/test-types"
import { exportResultsBoth } from "@/lib/test-result-exporter"
import type { SessionContext } from "@/lib/types/chat-types"
import { createSessionContext } from "@/lib/utils/session-context"
import { useUserProfile } from "@/lib/hooks/useUserProfile"

interface ChatInterfaceProps {
  onOutfitSelect?: (outfitId: string) => void
  onViewDetails?: (outfit: Outfit) => void
}

export default function ChatInterface({ onOutfitSelect, onViewDetails }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showStarters, setShowStarters] = useState(true)
  const [testMode, setTestMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // v2.0: Session context for duplicate prevention
  const [sessionContext, setSessionContext] = useState<SessionContext>(() => createSessionContext())
  const [conversationId] = useState<string>(() => `conv-${Date.now()}`)

  // v2.4: User profile for gender preference
  const { profile } = useUserProfile()

  // v3.1: Image generation state (Customer Journey Step 4)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null)

  // Check if test mode is enabled in environment
  const isTestModeEnabled = process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === 'true'

  const handleTestComplete = (result: TestResult) => {
    console.log('Test completed:', result)
  }

  const handleExportResults = (results: TestResult[]) => {
    exportResultsBoth(results)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setShowStarters(false)
    setIsTyping(true)

    try {
      // Call real chat API with session context (v2.0)
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
          }, // v2.4: Pass user gender from profile
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

      // v3.1: Check if this is an image generation request
      if (data.imageRequest && data.outfitDescription) {
        console.log('[Chat] Image request detected, generating image...')

        // Add AI acknowledgment message
        const acknowledgmentMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          content: data.message || 'เจ๋งเลย! กำลังสร้างภาพชุดที่เราแนะนำให้ดูนะ ✨ รอแป๊บนึงนะจ้า! 📸',
          sender: 'assistant',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, acknowledgmentMessage])
        setIsTyping(false)

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
            // Add image message
            const imageMessage: ChatMessage = {
              id: `ai-image-${Date.now()}`,
              content: 'นี่คือภาพชุดที่เราคิด! ✨',
              sender: 'assistant',
              timestamp: new Date(),
              imageUrl: imageData.imageUrl,
              imageBase64: imageData.imageBase64,
              outfitDescription: data.outfitDescription,
            }
            setMessages((prev) => [...prev, imageMessage])
          } else {
            // Image generation failed
            setImageGenerationError(imageData.message || 'ไม่สามารถสร้างภาพได้ กรุณาลองใหม่อีกครั้ง')

            const errorMessage: ChatMessage = {
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

          const errorMessage: ChatMessage = {
            id: `ai-error-${Date.now()}`,
            content: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการสร้างภาพ ลองใหม่อีกครั้งได้นะคะ 😊',
            sender: 'assistant',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setGeneratingImage(false)
        }

        return // Skip normal message flow
      }

      // Create AI response message (normal flow)
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.message || 'สวัสดีค่ะ! นี่คือคำแนะนำสำหรับคุณ',
        sender: 'assistant',
        timestamp: new Date(),
        outfits: data.outfits || [],
        looks: data.looks || [],
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // v5.0: Trigger async image generation for looks
      if (data.looks && data.looks.length > 0) {
        const looksWithItems = data.looks.filter((l: { items: unknown[] }) => l.items?.length > 0)
        if (looksWithItems.length > 0) {
          try {
            const imgRes = await fetch('/api/chat/looks-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ looks: looksWithItems }),
            })
            if (imgRes.ok) {
              const imgData = await imgRes.json()
              // Update the message with generated images
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponse.id
                    ? { ...msg, looks: imgData.looks }
                    : msg
                )
              )
            }
          } catch (imgError) {
            console.error('[Chat] Looks image generation error:', imgError)
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)

      // Fallback to mock response on error
      const aiResponse = getMockOutfitResponse(content)
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action: string) => {
    handleSendMessage(action)
  }

  const handleStarterClick = (starter: ConversationStarter) => {
    handleSendMessage(starter.text)
  }

  // Format timestamp for messages
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Test Mode Toggle */}
      {isTestModeEnabled && (
        <div className={`border-b px-4 py-3 flex items-center justify-between ${testMode ? 'bg-orange-50' : 'bg-background'}`}>
          <div className="flex items-center gap-2">
            {testMode && (
              <span className="px-3 py-1 bg-orange-500 text-white font-bold rounded-md text-sm flex items-center gap-1">
                <Beaker className="w-4 h-4" />
                TEST MODE
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {testMode ? 'LLM Model Testing Interface' : 'OOTDay Fashion Assistant'}
            </span>
          </div>
          <Button
            size="sm"
            variant={testMode ? "default" : "outline"}
            onClick={() => setTestMode(!testMode)}
            className={testMode ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            <Beaker className="w-4 h-4 mr-2" />
            {testMode ? 'Exit Test Mode' : 'Test Mode'}
          </Button>
        </div>
      )}

      {/* Interactive Test Mode - Full Screen */}
      {testMode && isTestModeEnabled && (
        <div className="flex-1 overflow-hidden">
          <InteractiveTestMode onExport={handleExportResults} />
        </div>
      )}

      {/* Chat Messages Area */}
      {!testMode && (
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center py-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              OOTDay Assistant
            </div>
            <h2 className="text-2xl font-bold text-balance mb-2">Hi! I&apos;m your AI fashion assistant</h2>
            <p className="text-muted-foreground text-pretty max-w-sm mx-auto">
              Ask me what to wear today, and I&apos;ll help you find the perfect outfit from Central Group&apos;s collection.
            </p>
          </div>
        )}

        {/* Quick Action Pills */}
        {showStarters && messages.length === 0 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  className="h-12 justify-center text-center rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                  onClick={() => handleQuickAction(action)}
                >
                  <span className="text-sm font-medium">{action}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground px-2">Or try asking:</p>
              <div className="grid gap-2">
                {conversationStarters.slice(0, 3).map((starter) => (
                  <Button
                    key={starter.id}
                    variant="outline"
                    className="justify-start text-left h-auto p-4 text-wrap bg-transparent"
                    onClick={() => handleStarterClick(starter)}
                  >
                    {starter.text}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
          >
            <div className="flex items-start gap-3 max-w-[85%]">
              {/* Assistant Avatar */}
              {message.sender === "assistant" && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-primary text-white"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-gray-500" : "text-white/70"
                }`}>{formatTime(message.timestamp)}</p>

                {/* v5.0: Look Cards */}
                {message.looks && message.looks.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {message.looks.map((look) => (
                      <Card key={`look-${look.lookNumber}`} className="p-3 bg-white/20 backdrop-blur-sm">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-white">
                              Look {look.lookNumber}: {look.styleName}
                            </h4>
                            <span className="text-sm font-bold text-white">
                              ฿{look.totalPrice.toLocaleString()}
                            </span>
                          </div>

                          {/* Flat-lay image */}
                          {look.imageUrl && (
                            <img
                              src={look.imageUrl}
                              alt={look.styleName}
                              className="w-full rounded-lg object-cover aspect-square"
                            />
                          )}
                          {look.imageStatus === 'pending' && (
                            <div className="w-full h-32 rounded-lg bg-white/10 flex items-center justify-center">
                              <span className="text-xs text-white/70">Generating flat-lay...</span>
                            </div>
                          )}

                          {/* Items list */}
                          <div className="space-y-1.5">
                            {look.items.map((item, idx) => (
                              <div key={`${item.sku}-${idx}`} className="flex items-center justify-between text-xs">
                                <div className="flex-1 min-w-0">
                                  <span className="text-white font-medium">{item.name}</span>
                                  <span className="text-white/60 ml-1">({item.brand})</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-white/80">฿{item.price.toLocaleString()}</span>
                                  {item.url && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white underline hover:text-white/80"
                                    >
                                      Buy
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Styling tip */}
                          {look.tip && (
                            <p className="text-xs text-white/70 italic mt-1">
                              Tip: {look.tip}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Legacy Outfit Cards (v4 and below) */}
                {message.outfits && message.outfits.length > 0 && (!message.looks || message.looks.length === 0) && (
                  <div className="mt-3 space-y-3">
                    {message.outfits.map((outfit) => (
                      <Card key={outfit.id} className="p-3 bg-white/20 backdrop-blur-sm">
                        <div className="flex gap-3">
                          <img
                            src={outfit.imageUrl || "/placeholder.svg?height=80&width=80"}
                            alt={outfit.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-balance text-white">{outfit.title}</h4>
                            <p className="text-xs text-white/70 text-pretty mt-1">{outfit.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-bold text-white">฿{outfit.totalPrice.toLocaleString()}</span>
                              <Button size="sm" className="h-7 px-3 text-xs bg-white text-primary hover:bg-white/90" onClick={() => {
                                onOutfitSelect?.(outfit.id);
                                onViewDetails?.(outfit);
                              }}>
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-primary rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-typing"></div>
                    <div
                      className="w-2 h-2 bg-white/70 rounded-full animate-typing"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white/70 rounded-full animate-typing"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/70 ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      )}

      {/* Quick Actions */}
      {!testMode && messages.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="whitespace-nowrap flex-shrink-0 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                onClick={() => handleQuickAction(action)}
              >
                <span className="text-xs font-medium">{action}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      {!testMode && (
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-end gap-2 p-4">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me what to wear..."
              className="pr-12 min-h-[44px] resize-none rounded-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(inputValue)
                }
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
              disabled
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="sm"
            className="h-11 w-11 rounded-full p-0"
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      )}
    </div>
  )
}
