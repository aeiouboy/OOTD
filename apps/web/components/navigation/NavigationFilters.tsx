'use client'

import { useState } from 'react'
import type { FilterState } from '@/lib/types'
import { CategoryFilter } from './CategoryFilter'
import { OccasionFilter } from './OccasionFilter'
import { PriceRangeSlider } from './PriceRangeSlider'
import { QuickPresets } from './QuickPresets'
import { Separator } from '@/components/ui/separator'

interface NavigationFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onResetFilters?: () => void
}

export function NavigationFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: NavigationFiltersProps) {
  const handleGenderChange = (gender: 'all' | 'women' | 'men') => {
    onFilterChange({ ...filters, gender })
  }

  const handleOccasionChange = (occasion: string[]) => {
    onFilterChange({ ...filters, occasion })
  }

  const handlePriceRangeChange = (priceRange: { min: number; max: number }) => {
    onFilterChange({ ...filters, priceRange })
  }

  const handlePresetSelect = (presetFilters: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...presetFilters })
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
        <OccasionFilter
          value={filters.occasion || []}
          onChange={handleOccasionChange}
        />

        <Separator />

        {/* Price Range */}
        <PriceRangeSlider
          value={filters.priceRange || { min: 0, max: 20000 }}
          onChange={handlePriceRangeChange}
        />

        <Separator />

        {/* Quick Presets */}
        <QuickPresets onPresetSelect={handlePresetSelect} />

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
