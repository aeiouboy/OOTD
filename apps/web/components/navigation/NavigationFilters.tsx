'use client'

import type { FilterState } from '@/lib/types'
import type { OccasionType } from '@/lib/types/enums'
import type { OccasionFilter } from '@/lib/hooks/useOccasionSuggestions'
import { CategoryFilter } from './CategoryFilter'
import { PriceRangeSlider } from './PriceRangeSlider'
import { Separator } from '@/components/ui/separator'
import { OCCASIONS } from '@/lib/constants/occasions'
import { cn } from '@/lib/utils'
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
  CalendarDays,
  Moon,
  Shirt,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Primary occasion categories (matches DB primary_occasion values)
const primaryOccasionItems: Array<{ id: OccasionFilter; label: string; icon: LucideIcon; color: string }> = [
  { id: 'weekend_social', label: 'Weekend', icon: CalendarDays, color: 'sky' },
  { id: 'date_night', label: 'Date Night', icon: Moon, color: 'pink' },
  { id: 'everyday_casual', label: 'Everyday', icon: Shirt, color: 'amber' },
]

// Specific occasion sub-filters
const occasionItems: Array<{ id: OccasionFilter; icon: LucideIcon; color: string }> = [
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

interface NavigationFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onResetFilters?: () => void
  selectedOccasion: OccasionFilter | null
  onOccasionSelect: (occasion: OccasionFilter | null) => void
}

export function NavigationFilters({
  filters,
  onFilterChange,
  onResetFilters,
  selectedOccasion,
  onOccasionSelect,
}: NavigationFiltersProps) {
  const handleGenderChange = (gender: 'all' | 'women' | 'men') => {
    onFilterChange({ ...filters, gender })
  }

  const handlePriceRangeChange = (priceRange: { min: number; max: number }) => {
    onFilterChange({ ...filters, priceRange })
  }

  return (
    <aside
      className="w-full h-full overflow-y-auto bg-background border-r"
      aria-label="Navigation and Filters"
    >
      <div className="p-6 space-y-6">
        {/* Brand/Logo */}
        <div className="mb-2">
          <h1 className="text-xl font-bold text-primary">OOTDay</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Your AI Fashion Assistant
          </p>
        </div>

        <Separator />

        {/* Category Filter */}
        <CategoryFilter
          value={filters.gender || 'all'}
          onChange={handleGenderChange}
        />

        <Separator />

        {/* Occasion Filter */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Occasion</h3>
          {/* Primary categories */}
          <div className="flex flex-wrap gap-2">
            {primaryOccasionItems.map((item) => {
              const isActive = selectedOccasion === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onOccasionSelect(isActive ? null : item.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-2 border text-xs font-semibold transition-colors',
                    isActive
                      ? activeStyles[item.color]
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  )}
                  aria-pressed={isActive}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          {/* Specific occasions */}
          <div className="flex flex-wrap gap-1.5">
            {occasionItems.map((item) => {
              const isActive = selectedOccasion === item.id
              const Icon = item.icon
              const occasion = OCCASIONS[item.id as OccasionType]
              return (
                <button
                  key={item.id}
                  onClick={() => onOccasionSelect(isActive ? null : item.id)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2.5 py-1 border text-[11px] font-medium transition-colors',
                    isActive
                      ? activeStyles[item.color]
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  )}
                  aria-pressed={isActive}
                >
                  <Icon className="w-3 h-3" />
                  <span>{occasion.name.th}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <PriceRangeSlider
          value={filters.priceRange || { min: 0, max: 20000 }}
          onChange={handlePriceRangeChange}
        />

        {/* Reset Filters */}
        {onResetFilters && (
          <>
            <Separator />
            <button
              onClick={onResetFilters}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline py-2"
            >
              Clear all filters
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
