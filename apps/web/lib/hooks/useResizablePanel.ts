import { useState, useEffect, useCallback, useRef } from 'react'
import {
  clampWidth,
  calculateMaxWidth,
  DEFAULT_WIDTH,
  MIN_WIDTH,
  MAX_WIDTH_PERCENT,
  STORAGE_KEY,
} from '@/lib/utils/resize-utils'

export interface UseResizablePanelOptions {
  defaultWidth: number
  minWidth: number
  maxWidthPercent: number
  storageKey: string
}

export interface UseResizablePanelReturn {
  panelWidth: number
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  setPresetSize: (size: number) => void
  resetToDefault: () => void
}

export function useResizablePanel(
  options: Partial<UseResizablePanelOptions> = {}
): UseResizablePanelReturn {
  const {
    defaultWidth = DEFAULT_WIDTH,
    minWidth = MIN_WIDTH,
    maxWidthPercent = MAX_WIDTH_PERCENT,
    storageKey = STORAGE_KEY,
  } = options

  const [panelWidth, setPanelWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)

  // Refs for drag state
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const rafRef = useRef<number>()

  // Load saved width from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) {
        const savedWidth = parseInt(saved, 10)
        if (!isNaN(savedWidth)) {
          const viewportWidth = window.innerWidth
          const maxWidth = calculateMaxWidth(viewportWidth, maxWidthPercent)
          const constrainedWidth = clampWidth(
            savedWidth,
            minWidth,
            maxWidthPercent,
            viewportWidth
          )
          setPanelWidth(constrainedWidth)
        }
      }
    } catch (error) {
      console.error('Failed to load panel width from sessionStorage:', error)
      // Fall back to default width
      setPanelWidth(defaultWidth)
    }
  }, [defaultWidth, minWidth, maxWidthPercent, storageKey])

  // Debounced save to sessionStorage
  const saveToStorage = useCallback(
    (width: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        try {
          sessionStorage.setItem(storageKey, width.toString())
        } catch (error) {
          console.error('Failed to save panel width to sessionStorage:', error)
        }
      }, 300)
    },
    [storageKey]
  )

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const deltaX = dragStartX.current - e.clientX
        const newWidth = dragStartWidth.current + deltaX
        const viewportWidth = window.innerWidth
        const constrainedWidth = clampWidth(
          newWidth,
          minWidth,
          maxWidthPercent,
          viewportWidth
        )
        setPanelWidth(constrainedWidth)
      })
    },
    [isDragging, minWidth, maxWidthPercent]
  )

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      saveToStorage(panelWidth)
    }
  }, [isDragging, panelWidth, saveToStorage])

  // Attach/remove global mouse listeners during drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
        }
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth
      const maxWidth = calculateMaxWidth(viewportWidth, maxWidthPercent)

      setPanelWidth((currentWidth) => {
        if (currentWidth > maxWidth) {
          const newWidth = Math.min(currentWidth, maxWidth)
          saveToStorage(newWidth)
          return newWidth
        }
        return currentWidth
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [maxWidthPercent, saveToStorage])

  // Handle mouse down to start drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStartX.current = e.clientX
    dragStartWidth.current = panelWidth
    setIsDragging(true)
  }, [panelWidth])

  // Set preset size with smooth transition
  const setPresetSize = useCallback(
    (size: number) => {
      const viewportWidth = window.innerWidth
      const constrainedSize = clampWidth(
        size,
        minWidth,
        maxWidthPercent,
        viewportWidth
      )
      setPanelWidth(constrainedSize)
      saveToStorage(constrainedSize)
    },
    [minWidth, maxWidthPercent, saveToStorage]
  )

  // Reset to default width
  const resetToDefault = useCallback(() => {
    setPanelWidth(defaultWidth)
    saveToStorage(defaultWidth)
  }, [defaultWidth, saveToStorage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return {
    panelWidth,
    isDragging,
    handleMouseDown,
    setPresetSize,
    resetToDefault,
  }
}
