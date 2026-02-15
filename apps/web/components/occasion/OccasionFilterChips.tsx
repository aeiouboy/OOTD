'use client'

import { cn } from '@/lib/utils'
import type { OccasionType } from '@/lib/types/enums'
import type { OccasionFilter } from '@/lib/hooks/useOccasionSuggestions'
import { OCCASIONS } from '@/lib/constants/occasions'
import {
  Briefcase,
  Sun,
  Gem,
  Dumbbell,
  Plane,
  Heart,
  UtensilsCrossed,
  Coffee,
  PartyPopper,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface OccasionFilterChipsProps {
  selected: OccasionFilter | null
  onSelect: (occasion: OccasionFilter | null) => void
}

const occasionChips: Array<{
  id: OccasionType
  icon: LucideIcon
  color: string
}> = [
  { id: 'work', icon: Briefcase, color: 'slate' },
  { id: 'chill', icon: Sun, color: 'amber' },
  { id: 'wedding', icon: Gem, color: 'rose' },
  { id: 'sport', icon: Dumbbell, color: 'green' },
  { id: 'travel', icon: Plane, color: 'sky' },
  { id: 'date', icon: Heart, color: 'pink' },
  { id: 'dinner', icon: UtensilsCrossed, color: 'purple' },
  { id: 'cafe', icon: Coffee, color: 'orange' },
  { id: 'party', icon: PartyPopper, color: 'violet' },
]

const activeStyles: Record<string, string> = {
  slate: 'bg-slate-50 border-slate-400 text-slate-700',
  amber: 'bg-amber-50 border-amber-400 text-amber-700',
  rose: 'bg-rose-50 border-rose-400 text-rose-700',
  green: 'bg-green-50 border-green-400 text-green-700',
  sky: 'bg-sky-50 border-sky-400 text-sky-700',
  pink: 'bg-pink-50 border-pink-400 text-pink-700',
  purple: 'bg-purple-50 border-purple-400 text-purple-700',
  orange: 'bg-orange-50 border-orange-400 text-orange-700',
  violet: 'bg-violet-50 border-violet-400 text-violet-700',
}

export function OccasionFilterChips({ selected, onSelect }: OccasionFilterChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filter by occasion"
      className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
    >
      {occasionChips.map((chip) => {
        const isActive = selected === chip.id
        const Icon = chip.icon
        const occasion = OCCASIONS[chip.id]

        return (
          <button
            key={chip.id}
            onClick={() => onSelect(isActive ? null : chip.id)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              isActive
                ? activeStyles[chip.color]
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            )}
            aria-pressed={isActive}
            aria-label={`${occasion.name.en} - ${occasion.name.th}`}
          >
            <Icon className="w-4 h-4" />
            <span className="flex flex-col items-start leading-tight">
              <span>{occasion.name.en}</span>
              <span className="text-[10px] opacity-70">{occasion.name.th}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
