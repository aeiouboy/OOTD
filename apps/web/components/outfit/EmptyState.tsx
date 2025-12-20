"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  className?: string
  onGetStarted?: () => void
  conversationStarters?: string[]
}

export default function EmptyState({
  title = "Start a conversation",
  description = "Ask me about outfits and I'll show recommendations here",
  className = "",
  onGetStarted,
  conversationStarters = [
    "What should I wear today?",
    "Show me work outfits",
    "Casual weekend looks",
    "Special occasion outfit"
  ]
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center h-full text-center ${className}`}>
      <div className="max-w-md mx-auto px-6">
        {/* Icon with subtle animation */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-pulse">
          <Sparkles className="w-10 h-10 text-white" aria-hidden="true" />
        </div>

        {/* Title with improved hierarchy */}
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
          {title}
        </h2>

        {/* Description with better contrast */}
        <p className="text-muted-foreground text-base leading-relaxed mb-8">
          {description}
        </p>

        {/* Conversation Starters */}
        {conversationStarters && conversationStarters.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-semibold mb-4 uppercase tracking-wide">
              Try asking:
            </p>
            <div className="grid gap-3">
              {conversationStarters.map((starter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="default"
                  className="w-full justify-start text-left text-sm bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary transition-all duration-200 hover:scale-105 hover:shadow-md"
                  onClick={() => onGetStarted?.()}
                  aria-label={`Ask: ${starter}`}
                >
                  <Sparkles className="w-4 h-4 mr-3 flex-shrink-0 text-primary" />
                  <span className="font-medium">{starter}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Get Started Button */}
        {onGetStarted && !conversationStarters?.length && (
          <Button
            onClick={onGetStarted}
            className="mt-4"
            aria-label="Start a conversation"
          >
            Get Started
          </Button>
        )}
      </div>
    </div>
  )
}