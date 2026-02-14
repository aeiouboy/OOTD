"use client"

import { useRef, useEffect } from "react"
import ForceGraph2D from "react-force-graph-2d"
import type { ForceGraphMethods } from "react-force-graph-2d"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraphInstance = ForceGraphMethods<any, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ForceGraphWrapperProps extends Record<string, any> {
  onGraphReady: (instance: ForceGraphInstance) => void
}

/**
 * Wrapper around ForceGraph2D that captures the ref internally
 * and exposes it via onGraphReady callback.
 * This avoids the "Function components cannot be given refs" warning
 * that occurs when next/dynamic wraps the component.
 */
export function ForceGraphWrapper({ onGraphReady, ...props }: ForceGraphWrapperProps) {
  const fgRef = useRef<ForceGraphInstance | undefined>(undefined)
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (fgRef.current && !notifiedRef.current) {
      notifiedRef.current = true
      onGraphReady(fgRef.current as ForceGraphInstance)
    }
  })

  return (
    <ForceGraph2D
      ref={fgRef}
      {...props}
    />
  )
}
