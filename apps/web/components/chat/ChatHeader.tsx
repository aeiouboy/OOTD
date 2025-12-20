'use client'

import { Sparkles } from 'lucide-react'

export function ChatHeader() {
  return (
    <div className="border-b px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-base">OOTDay Stylist</h2>
          <p className="text-xs text-muted-foreground">Your fashion consultant</p>
        </div>
      </div>
    </div>
  )
}
