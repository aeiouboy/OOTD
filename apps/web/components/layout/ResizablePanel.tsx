'use client'

import { createContext, useContext, useEffect } from 'react'
import { useResizablePanel } from '@/lib/hooks/useResizablePanel'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidthPercent?: number
  className?: string
  ariaLabel?: string
}

interface ResizablePanelContextValue {
  panelWidth: number
  setPresetSize: (size: number) => void
}

const ResizablePanelContext = createContext<ResizablePanelContextValue | null>(null)

export function useResizablePanelContext() {
  const context = useContext(ResizablePanelContext)
  if (!context) {
    throw new Error('useResizablePanelContext must be used within a ResizablePanel')
  }
  return context
}

export function ResizablePanel({
  children,
  defaultWidth,
  minWidth,
  maxWidthPercent,
  className,
  ariaLabel = 'Resizable panel',
}: ResizablePanelProps) {
  const { panelWidth, isDragging, handleMouseDown, setPresetSize } =
    useResizablePanel({
      defaultWidth,
      minWidth,
      maxWidthPercent,
    })

  // Global keyboard shortcuts for resizing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on desktop (>= 1024px)
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return

      const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.platform)
      const modifierKey = isMac ? e.metaKey : e.ctrlKey

      if (modifierKey && e.key === '[') {
        e.preventDefault()
        setPresetSize(panelWidth - 40)
      } else if (modifierKey && e.key === ']') {
        e.preventDefault()
        setPresetSize(panelWidth + 40)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [panelWidth, setPresetSize])

  return (
    <ResizablePanelContext.Provider value={{ panelWidth, setPresetSize }}>
      <div
        className={cn(
          'relative flex-shrink-0',
          !isDragging && 'transition-[width] duration-200 ease-out',
          className
        )}
        style={{ width: `${panelWidth}px` }}
        data-dragging={isDragging || undefined}
        aria-label={ariaLabel}
      >
      {/* Resize Handle */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-2 -ml-1 z-50',
          'flex items-center justify-center',
          'cursor-col-resize hover:bg-muted/50',
          'group transition-colors',
          isDragging && 'bg-muted'
        )}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={panelWidth}
        aria-valuemin={minWidth || 280}
        aria-valuemax={Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1920) * 0.5)}
        aria-valuetext={`${panelWidth} pixels wide`}
        aria-label="Resize chat panel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setPresetSize(panelWidth - 10)
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            setPresetSize(panelWidth + 10)
          }
        }}
      >
        <GripVertical
          className={cn(
            'w-4 h-4 text-muted-foreground/40',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isDragging && 'opacity-100'
          )}
        />
      </div>

      {/* Border highlight during drag */}
      {isDragging && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary shadow-lg" />
      )}

      {/* Panel Content */}
      <div className="h-full">{children}</div>

      {/* Screen reader live region for announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isDragging && `Resizing panel to ${panelWidth} pixels`}
      </div>
      </div>
    </ResizablePanelContext.Provider>
  )
}
