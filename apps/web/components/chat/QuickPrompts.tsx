'use client'

import { Button } from '@/components/ui/button'
import { Briefcase, Heart, Sparkles, Coffee } from 'lucide-react'

interface QuickPromptsProps {
  onPromptClick: (prompt: string) => void
}

const quickPrompts = [
  { id: 'work', label: 'ชุดไปทำงาน', prompt: 'อยากได้ชุดไปทำงาน', icon: Briefcase },
  { id: 'wedding', label: 'ชุดไปงานแต่ง', prompt: 'หาชุดไปงานแต่งงาน', icon: Heart },
  { id: 'travel', label: 'ชุดใส่เที่ยว', prompt: 'อยากได้ชุดใส่ไปเที่ยว', icon: Sparkles },
  { id: 'chill', label: 'ชุดวันหยุด', prompt: 'ชุดคาสชวล วันหยุด สบายๆ', icon: Coffee },
]

export function QuickPrompts({ onPromptClick }: QuickPromptsProps) {
  return (
    <div className="px-4 py-2 border-t">
      <div className="grid grid-cols-2 gap-2">
        {quickPrompts.map((prompt) => {
          const Icon = prompt.icon
          return (
            <Button
              key={prompt.id}
              variant="outline"
              size="sm"
              onClick={() => onPromptClick(prompt.prompt)}
              className="text-xs rounded-full h-8 gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {prompt.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
