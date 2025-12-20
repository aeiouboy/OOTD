'use client'

import { Button } from '@/components/ui/button'
import { Minimize2, Square, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PRESET_SIZES = {
  compact: 320,
  default: 420,
  wide: 560,
} as const

export const PRESET_LABELS = {
  compact: 'Compact',
  default: 'Default',
  wide: 'Wide',
} as const

export interface PanelSizeControlsProps {
  currentWidth: number
  onSizeChange: (width: number) => void
  className?: string
}

export function PanelSizeControls({
  currentWidth,
  onSizeChange,
  className,
}: PanelSizeControlsProps) {
  const isActive = (size: number) => {
    return Math.abs(currentWidth - size) < 20 // Within 20px tolerance
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-2 opacity-60 hover:opacity-100 transition-opacity',
          isActive(PRESET_SIZES.compact) && 'opacity-100 text-primary'
        )}
        onClick={() => onSizeChange(PRESET_SIZES.compact)}
        title={`${PRESET_LABELS.compact} (${PRESET_SIZES.compact}px)`}
        aria-label={`Set panel to compact size, ${PRESET_SIZES.compact} pixels`}
      >
        <Minimize2 className="w-4 h-4" />
        <span className="sr-only">{PRESET_LABELS.compact}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-2 opacity-60 hover:opacity-100 transition-opacity',
          isActive(PRESET_SIZES.default) && 'opacity-100 text-primary'
        )}
        onClick={() => onSizeChange(PRESET_SIZES.default)}
        title={`${PRESET_LABELS.default} (${PRESET_SIZES.default}px)`}
        aria-label={`Set panel to default size, ${PRESET_SIZES.default} pixels`}
      >
        <Square className="w-4 h-4" />
        <span className="sr-only">{PRESET_LABELS.default}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-2 opacity-60 hover:opacity-100 transition-opacity',
          isActive(PRESET_SIZES.wide) && 'opacity-100 text-primary'
        )}
        onClick={() => onSizeChange(PRESET_SIZES.wide)}
        title={`${PRESET_LABELS.wide} (${PRESET_SIZES.wide}px)`}
        aria-label={`Set panel to wide size, ${PRESET_SIZES.wide} pixels`}
      >
        <Maximize2 className="w-4 h-4" />
        <span className="sr-only">{PRESET_LABELS.wide}</span>
      </Button>
    </div>
  )
}
