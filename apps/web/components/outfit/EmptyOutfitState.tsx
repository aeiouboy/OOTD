'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyOutfitStateProps {
  onClearFilters?: () => void
}

export function EmptyOutfitState({ onClearFilters }: EmptyOutfitStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>

      <h3 className="text-xl font-semibold mb-2">
        Your perfect outfit awaits. Refine your search.
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md">
        Let OOTDay Stylist craft your perfect look.
      </p>

      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
