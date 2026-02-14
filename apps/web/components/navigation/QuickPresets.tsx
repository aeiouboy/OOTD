'use client'

import { Button } from "@/components/ui/button"
import type { FilterState } from "@/lib/types"
import type { OccasionPreset } from "@/lib/types/image-types"

interface QuickPresetsProps {
  onPresetSelect: (filters: Partial<FilterState>) => void
  onOccasionFlatLay?: (preset: OccasionPreset) => void
  generatingPreset?: OccasionPreset | null
}

const presets: Array<{
  id: OccasionPreset
  label: string
  emoji: string
  filters: Partial<FilterState>
}> = [
  {
    id: 'weekend-social',
    label: 'Weekend & Social',
    emoji: '☀️',
    filters: {
      occasion: ['chill', 'cafe'],
    } as Partial<FilterState>,
  },
  {
    id: 'date-night',
    label: 'Date Night',
    emoji: '🌙',
    filters: {
      occasion: ['date', 'dinner'],
    } as Partial<FilterState>,
  },
  {
    id: 'everyday-casual',
    label: 'Everyday Casual',
    emoji: '👟',
    filters: {
      occasion: ['chill', 'travel'],
    } as Partial<FilterState>,
  },
]

export function QuickPresets({ onPresetSelect, onOccasionFlatLay, generatingPreset }: QuickPresetsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Quick Search</h3>
      <div className="space-y-2">
        {presets.map((preset) => {
          const isGenerating = generatingPreset === preset.id
          return (
            <Button
              key={preset.id}
              variant="outline"
              className="w-full justify-start text-sm"
              disabled={isGenerating}
              onClick={() => {
                onPresetSelect(preset.filters)
                onOccasionFlatLay?.(preset.id)
              }}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Generating...
                </span>
              ) : (
                <span>{preset.emoji} {preset.label}</span>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
