"use client"

import { useRef, useCallback, useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"

const ForceGraphWrapper = dynamic(
  () => import("./ForceGraphWrapper").then((mod) => mod.ForceGraphWrapper),
  { ssr: false }
)

const NODE_COLORS: Record<string, string> = {
  category: "#6366f1",
  occasion: "#f59e0b",
  brand: "#10b981",
  style: "#ec4899",
  product: "#3b82f6",
  knowledge: "#8b5cf6",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ForceGraphInstance = any

interface GraphNode {
  id: string
  label: string
  node_type: string
  metadata: Record<string, unknown>
  color: string | null
  size: number
  chunk?: { title: string; content: string; category: string; tier: string; source_file: string } | null
}

interface GraphEdge {
  id: string
  source_id: string
  target_id: string
  relationship: string
  weight: number
  metadata: Record<string, unknown>
}

// Force graph expects source/target string IDs
interface ForceNode {
  id: string
  label: string
  node_type: string
  metadata: Record<string, unknown>
  nodeColor: string
  nodeSize: number
  x?: number
  y?: number
}

interface ForceLink {
  source: string
  target: string
  relationship: string
  weight: number
}

interface KnowledgeGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  activeFilters: Set<string>
  searchQuery: string
  selectedNodeId: string | null
  onNodeClick: (nodeId: string) => void
  onGraphReady: (instance: ForceGraphInstance) => void
}

export function KnowledgeGraph({
  nodes,
  edges,
  activeFilters,
  searchQuery,
  selectedNodeId,
  onNodeClick,
  onGraphReady,
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Measure container size
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width: Math.floor(width), height: Math.floor(height) })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Filter nodes by active type filters
  const filteredNodes = useMemo(() => {
    if (activeFilters.size === 0) return nodes
    return nodes.filter((n) => activeFilters.has(n.node_type))
  }, [nodes, activeFilters])

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes]
  )

  // Match search query
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    return new Set(
      filteredNodes
        .filter((n) => n.label.toLowerCase().includes(q))
        .map((n) => n.id)
    )
  }, [filteredNodes, searchQuery])

  // Build graph data for force graph
  const graphData = useMemo(() => {
    const forceNodes: ForceNode[] = filteredNodes.map((n) => ({
      id: n.id,
      label: n.label,
      node_type: n.node_type,
      metadata: n.metadata,
      nodeColor: n.color || NODE_COLORS[n.node_type] || "#6b7280",
      nodeSize: n.size || 1,
    }))

    const forceLinks: ForceLink[] = edges
      .filter(
        (e) => filteredNodeIds.has(e.source_id) && filteredNodeIds.has(e.target_id)
      )
      .map((e) => ({
        source: e.source_id,
        target: e.target_id,
        relationship: e.relationship,
        weight: e.weight,
      }))

    return { nodes: forceNodes, links: forceLinks }
  }, [filteredNodes, edges, filteredNodeIds])

  // Connected nodes for hover highlighting
  const connectedMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const link of graphData.links) {
      const srcId = typeof link.source === "object" ? (link.source as ForceNode).id : link.source
      const tgtId = typeof link.target === "object" ? (link.target as ForceNode).id : link.target
      if (!map.has(srcId)) map.set(srcId, new Set())
      if (!map.has(tgtId)) map.set(tgtId, new Set())
      map.get(srcId)!.add(tgtId)
      map.get(tgtId)!.add(srcId)
    }
    return map
  }, [graphData.links])

  // Build a set of highlighted link keys for edge label rendering (Issue #4)
  const highlightedLinks = useMemo(() => {
    const focusId = hoveredNode || selectedNodeId
    if (!focusId) return new Set<string>()
    const links = new Set<string>()
    for (const link of graphData.links) {
      const srcId = typeof link.source === "object" ? (link.source as ForceNode).id : link.source
      const tgtId = typeof link.target === "object" ? (link.target as ForceNode).id : link.target
      if (srcId === focusId || tgtId === focusId) {
        links.add(`${srcId}->${tgtId}`)
      }
    }
    return links
  }, [graphData.links, hoveredNode, selectedNodeId])

  const isHighlighted = useCallback(
    (nodeId: string) => {
      if (!hoveredNode && !selectedNodeId) return true
      const focusId = hoveredNode || selectedNodeId
      if (!focusId) return true
      if (nodeId === focusId) return true
      return connectedMap.get(focusId)?.has(nodeId) ?? false
    },
    [hoveredNode, selectedNodeId, connectedMap]
  )

  // Determine which labels to show (larger nodes: category, occasion, brand)
  const labelTypes = useMemo(
    () => new Set(["category", "occasion", "brand", "style"]),
    []
  )

  const nodeCanvasObject = useCallback(
    (node: ForceNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const baseSize = node.nodeSize * 3 + 2
      const color = node.nodeColor
      const highlighted = isHighlighted(node.id)
      const isSearchMatch = searchMatches?.has(node.id)
      const isSelected = node.id === selectedNodeId
      const isHovered = node.id === hoveredNode
      const alpha = highlighted ? 1 : 0.12

      // Ambient glow for all visible nodes
      if (highlighted) {
        ctx.beginPath()
        ctx.arc(x, y, baseSize + 3, 0, 2 * Math.PI)
        ctx.fillStyle = color + "20"
        ctx.fill()
      }

      // Stronger glow for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath()
        ctx.arc(x, y, baseSize + 6, 0, 2 * Math.PI)
        ctx.fillStyle = color + "55"
        ctx.fill()
      }

      // Search match ring
      if (isSearchMatch) {
        ctx.beginPath()
        ctx.arc(x, y, baseSize + 3, 0, 2 * Math.PI)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Main circle
      ctx.beginPath()
      ctx.arc(x, y, baseSize, 0, 2 * Math.PI)
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.fill()
      ctx.globalAlpha = 1

      // Label for larger node types or when zoomed in
      const showLabel =
        labelTypes.has(node.node_type) ||
        isHovered ||
        isSelected ||
        globalScale > 2.5

      if (showLabel && highlighted) {
        const fontSize = Math.max(10 / globalScale, 2.5)
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillStyle = "rgba(255,255,255,0.85)"
        ctx.fillText(node.label, x, y + baseSize + 2)
      }
    },
    [isHighlighted, searchMatches, selectedNodeId, hoveredNode, labelTypes]
  )

  const linkColor = useCallback(
    (link: ForceLink) => {
      const srcId = typeof link.source === "object" ? (link.source as ForceNode).id : link.source
      const tgtId = typeof link.target === "object" ? (link.target as ForceNode).id : link.target
      const focusId = hoveredNode || selectedNodeId
      if (!focusId) return "rgba(245,158,11,0.25)"
      if (srcId === focusId || tgtId === focusId)
        return "rgba(245,158,11,0.7)"
      return "rgba(245,158,11,0.08)"
    },
    [hoveredNode, selectedNodeId]
  )

  // Issue #4: Draw edge labels on highlighted links
  const linkCanvasObjectMode = useCallback(
    (link: ForceLink) => {
      const srcId = typeof link.source === "object" ? (link.source as ForceNode).id : link.source
      const tgtId = typeof link.target === "object" ? (link.target as ForceNode).id : link.target
      const key = `${srcId}->${tgtId}`
      return highlightedLinks.has(key) ? "after" : undefined
    },
    [highlightedLinks]
  )

  const linkCanvasObject = useCallback(
    (link: ForceLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const src = link.source as unknown as ForceNode
      const tgt = link.target as unknown as ForceNode
      if (!src.x || !src.y || !tgt.x || !tgt.y) return

      const midX = (src.x + tgt.x) / 2
      const midY = (src.y + tgt.y) / 2

      const label = link.relationship.replace(/_/g, " ")
      const fontSize = Math.max(8 / globalScale, 1.5)
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Background for readability
      const textMetrics = ctx.measureText(label)
      const padding = 2 / globalScale
      ctx.fillStyle = "rgba(10,10,26,0.85)"
      ctx.fillRect(
        midX - textMetrics.width / 2 - padding,
        midY - fontSize / 2 - padding,
        textMetrics.width + padding * 2,
        fontSize + padding * 2
      )

      ctx.fillStyle = "rgba(255,255,255,0.6)"
      ctx.fillText(label, midX, midY)
    },
    []
  )

  const handleNodeClick = useCallback(
    (node: ForceNode) => {
      onNodeClick(node.id)
    },
    [onNodeClick]
  )

  const handleNodeHover = useCallback((node: ForceNode | null) => {
    setHoveredNode(node?.id ?? null)
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraphWrapper
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#0a0a1a"
          nodeCanvasObject={nodeCanvasObject as never}
          nodePointerAreaPaint={((node: ForceNode, color: string, ctx: CanvasRenderingContext2D) => {
            // Issue #3: Increase minimum hit area to 8px radius
            const size = Math.max((node.nodeSize || 1) * 3 + 4, 8)
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI)
            ctx.fill()
          }) as never}
          linkColor={linkColor as never}
          linkWidth={1}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={() => "rgba(245,158,11,0.8)"}
          linkCanvasObjectMode={linkCanvasObjectMode as never}
          linkCanvasObject={linkCanvasObject as never}
          onNodeClick={handleNodeClick as never}
          onNodeHover={handleNodeHover as never}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          onGraphReady={onGraphReady}
        />
      )}
    </div>
  )
}
