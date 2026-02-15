'use client'

import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import { LooksInspiration } from './LooksInspiration'

interface ChatMessageProps {
  message: ChatMessageType
}

function renderInlineFormatting(line: string): ReactNode[] {
  const parts = line.split(/(\*\*[^*\n]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`bold-${index}`}>
          {part.slice(2, -2)}
        </strong>
      )
    }

    return <span key={`text-${index}`}>{part}</span>
  })
}

function renderFormattedText(text: string): ReactNode[] {
  const lines = text.split('\n')
  return lines.map((line, index) => (
    <span key={`line-${index}`}>
      {renderInlineFormatting(line)}
      {index < lines.length - 1 && <br />}
    </span>
  ))
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user'
  const hasImage = !!(message.imageUrl || message.imageBase64)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  // Render image message (v3.1 - Customer Journey Step 4)
  // v4.0: Updated to pass displayMode and recommendedItems for flat-lay support
  if (hasImage && !isUser) {
    return (
      <div className="flex justify-start mb-3">
        <div className="flex items-start gap-2 w-full max-w-md">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1">
            <LooksInspiration
              outfitDescription={message.outfitDescription || 'Outfit visualization'}
              imageUrl={message.imageUrl}
              imageBase64={message.imageBase64}
              isLoading={false}
              displayMode={message.displayMode || 'portrait'}
              recommendedItems={message.recommendedItems}
            />
          </div>
        </div>
      </div>
    )
  }

  // Render normal text message
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex items-start gap-2 max-w-[80%]`}>
        {!isUser && (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}

        <div
          className={`rounded-lg px-3 py-2 shadow-sm ${
            isUser
              ? 'bg-[var(--chat-user)] text-foreground ml-auto'
              : 'bg-[var(--chat-assistant)] text-foreground mr-auto border border-border'
          }`}
        >
          <div className="text-sm break-words">
            {renderFormattedText(message.content)}
          </div>
          <p className={`text-xs mt-1 text-muted-foreground`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}
