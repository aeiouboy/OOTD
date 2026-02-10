'use client'

import { cn } from '@/lib/utils'
import type { OccasionType } from '@/lib/supabase/types'
import { Calendar, Heart, Coffee } from 'lucide-react'

interface OccasionFilterChipsProps {
  selected: OccasionType | null
  onSelect: (occasion: OccasionType | null) => void
}

const occasions = [
  { id: 'weekend_social' as OccasionType, label: 'Weekend & Social', labelTh: '\u0e2a\u0e38\u0e14\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c', icon: Calendar, color: 'purple' },
  { id: 'date_night' as OccasionType, label: 'Date Night', labelTh: '\u0e40\u0e14\u0e17\u0e44\u0e19\u0e17\u0e4c', icon: Heart, color: 'pink' },
  { id: 'everyday_casual' as OccasionType, label: 'Everyday Casual', labelTh: '\u0e41\u0e04\u0e0a\u0e0a\u0e27\u0e25', icon: Coffee, color: 'blue' },
] as const

const activeStyles: Record<string, string> = {
  purple: 'bg-purple-50 border-purple-300 text-purple-700',
  pink: 'bg-pink-50 border-pink-300 text-pink-700',
  blue: 'bg-blue-50 border-blue-300 text-blue-700',
}

export function OccasionFilterChips({ selected, onSelect }: OccasionFilterChipsProps) {
  return (
    <div role="group" aria-label="Filter by occasion" className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1">
      {occasions.map((occasion) => {
        const isActive = selected === occasion.id
        const Icon = occasion.icon

        return (
          <button
            key={occasion.id}
            onClick={() => onSelect(isActive ? null : occasion.id)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              isActive
                ? activeStyles[occasion.color]
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            )}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4" />
            <span className="flex flex-col items-start leading-tight">
              <span>{occasion.label}</span>
              <span className="text-[10px] opacity-70">{occasion.labelTh}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
