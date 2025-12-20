'use client'

import { Button } from "@/components/ui/button"
import type { FilterState } from "@/lib/types"

interface QuickPresetsProps {
  onPresetSelect: (filters: Partial<FilterState>) => void
}

// Quick presets only filter by occasion to avoid filtering out all results
// Price range is intentionally omitted - users can adjust manually if needed
const presets = [
  {
    id: 'work',
    label: '💼 Work Outfit',
    filters: {
      occasion: ['work'],
    } as Partial<FilterState>,
  },
  {
    id: 'party',
    label: '💃 Party Outfit',
    filters: {
      occasion: ['party'],
    } as Partial<FilterState>,
  },
  {
    id: 'travel',
    label: '🌴 Travel Outfit',
    filters: {
      occasion: ['travel'],
    } as Partial<FilterState>,
  },
  {
    id: 'casual',
    label: '👕 Casual Outfit',
    filters: {
      occasion: ['casual'],
    } as Partial<FilterState>,
  },
  {
    id: 'date',
    label: '💕 Date Night',
    filters: {
      occasion: ['date'],
    } as Partial<FilterState>,
  },
]

export function QuickPresets({ onPresetSelect }: QuickPresetsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Quick Search</h3>
      <div className="space-y-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={() => onPresetSelect(preset.filters)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
