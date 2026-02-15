'use client'

import { Button } from "@/components/ui/button"

interface QuickPresetsProps {
  onSendMessage: (message: string) => void
}

const presets = [
  {
    id: 'weekend-social',
    label: 'Weekend & Social',
    emoji: '\u2600\uFE0F',
    message: '\u0E41\u0E19\u0E30\u0E19\u0E33\u0E0A\u0E38\u0E14\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27\u0E27\u0E31\u0E19\u0E2B\u0E22\u0E38\u0E14\u0E2B\u0E19\u0E48\u0E2D\u0E22',
  },
  {
    id: 'date-night',
    label: 'Date Night',
    emoji: '\uD83C\uDF19',
    message: '\u0E41\u0E19\u0E30\u0E19\u0E33\u0E0A\u0E38\u0E14\u0E44\u0E1B\u0E40\u0E14\u0E17\u0E2B\u0E19\u0E48\u0E2D\u0E22',
  },
  {
    id: 'everyday-casual',
    label: 'Everyday Casual',
    emoji: '\uD83D\uDC5F',
    message: '\u0E41\u0E19\u0E30\u0E19\u0E33\u0E0A\u0E38\u0E14\u0E43\u0E2A\u0E48\u0E17\u0E38\u0E01\u0E27\u0E31\u0E19\u0E2B\u0E19\u0E48\u0E2D\u0E22',
  },
]

export function QuickPresets({ onSendMessage }: QuickPresetsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Quick Chat</h3>
      <div className="space-y-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={() => onSendMessage(preset.message)}
          >
            <span>{preset.emoji} {preset.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
