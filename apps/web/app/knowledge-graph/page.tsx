"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { KnowledgeGraph } from "@/components/knowledge-graph/KnowledgeGraph"
import { GraphControls } from "@/components/knowledge-graph/GraphControls"
import { NodeDetail } from "@/components/knowledge-graph/NodeDetail"

const NODE_COLORS: Record<string, string> = {
  category: "#6366f1",
  occasion: "#f59e0b",
  brand: "#10b981",
  style: "#ec4899",
  product: "#3b82f6",
  knowledge: "#8b5cf6",
}

interface ChunkData {
  title: string
  content: string
  category: string
  tier: string
  source_file: string
}

interface GraphNode {
  id: string
  label: string
  node_type: string
  metadata: Record<string, unknown>
  color: string | null
  size: number
  chunk?: ChunkData | null
}

interface GraphEdge {
  id: string
  source_id: string
  target_id: string
  relationship: string
  weight: number
  metadata: Record<string, unknown>
}

interface GraphStats {
  nodeCount: number
  edgeCount: number
  types: Record<string, number>
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  stats: GraphStats
}

export default function KnowledgeGraphPage() {
  const [data, setData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphInstanceRef = useRef<any>(null)

  const handleGraphReady = useCallback((instance: unknown) => {
    graphInstanceRef.current = instance
  }, [])

  // Fetch data
  useEffect(() => {
    fetch("/api/knowledge-graph")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json: GraphData) => {
        setData(json)
        // Initialize filters with all types active
        const types = Object.keys(json.stats.types)
        setActiveFilters(new Set(types))
      })
      .catch((err) => {
        setError(err.message || "Failed to load graph data")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const nodeTypes = useMemo(() => {
    if (!data) return []
    return Object.keys(data.stats.types).sort()
  }, [data])

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !data) return null
    return data.nodes.find((n) => n.id === selectedNodeId) ?? null
  }, [selectedNodeId, data])

  const handleToggleFilter = useCallback((type: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId))
  }, [])

  const handleZoomIn = useCallback(() => {
    const fg = graphInstanceRef.current as { zoom?: {(): number; (k: number, ms?: number): void} } | null
    if (fg && typeof fg.zoom === "function") {
      const currentZoom = fg.zoom()
      fg.zoom(currentZoom * 1.5, 300)
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    const fg = graphInstanceRef.current as { zoom?: {(): number; (k: number, ms?: number): void} } | null
    if (fg && typeof fg.zoom === "function") {
      const currentZoom = fg.zoom()
      fg.zoom(currentZoom / 1.5, 300)
    }
  }, [])

  const handleResetView = useCallback(() => {
    const fg = graphInstanceRef.current as { zoomToFit?: (ms: number, padding: number) => void } | null
    if (fg && typeof fg.zoomToFit === "function") {
      fg.zoomToFit(400, 50)
    }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0a0a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-full bg-[#0a0a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400 text-lg">!</span>
          </div>
          <p className="text-sm text-gray-300">Failed to load graph data</p>
          <p className="text-xs text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 text-xs text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div
      className="h-screen w-full bg-[#0a0a1a] flex flex-col overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm sm:text-lg font-semibold text-white truncate">Knowledge Graph</h1>
          <span className="text-xs text-gray-500 ml-1 sm:ml-2 hidden sm:inline">RAG Knowledge Base</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-400 flex-shrink-0">
          <span>
            <strong className="text-gray-200">{data.stats.nodeCount}</strong>{" "}
            <span className="hidden sm:inline">nodes</span>
            <span className="sm:hidden">n</span>
          </span>
          <span>
            <strong className="text-gray-200">{data.stats.edgeCount}</strong>{" "}
            <span className="hidden sm:inline">connections</span>
            <span className="sm:hidden">e</span>
          </span>
          {Object.entries(data.stats.types)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <span key={type} className="hidden md:inline-flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{
                    backgroundColor: NODE_COLORS[type] || "#6b7280",
                  }}
                />
                {count} {type}
              </span>
            ))}
        </div>
      </header>

      {/* Graph area */}
      <div className="flex-1 relative min-h-0">
        <KnowledgeGraph
          nodes={data.nodes}
          edges={data.edges}
          activeFilters={activeFilters}
          searchQuery={searchQuery}
          selectedNodeId={selectedNodeId}
          onNodeClick={handleNodeClick}
          onGraphReady={handleGraphReady}
        />

        {/* Controls overlay */}
        <GraphControls
          nodeTypes={nodeTypes}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          onSearch={handleSearch}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
        />

        {/* Legend (bottom-left) - hidden on mobile to avoid overlap */}
        <div className="hidden sm:block absolute bottom-4 left-4 z-10 bg-[#1a1a3a]/90 backdrop-blur-sm rounded-md border border-white/10 p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-medium">
            Node Types
          </p>
          <div className="space-y-1.5">
            {nodeTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: NODE_COLORS[type] || "#6b7280",
                  }}
                />
                <span className="text-[11px] text-gray-300 capitalize">
                  {type}
                </span>
                {data.stats.types[type] != null && (
                  <span className="text-[10px] text-gray-500 ml-auto">
                    {data.stats.types[type]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Node detail panel */}
        <NodeDetail
          node={selectedNode}
          edges={data.edges}
          nodes={data.nodes}
          onClose={() => setSelectedNodeId(null)}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  )
}
