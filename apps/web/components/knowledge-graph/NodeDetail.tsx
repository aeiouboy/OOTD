"use client"

import { useMemo } from "react"
import { X, FileText, Tag, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * Lightweight markdown renderer for knowledge chunk content.
 * Handles: ### headings, **bold**, - list items, and line breaks.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let listKey = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-0.5 my-1">
          {listItems}
        </ul>
      )
      listItems = []
    }
  }

  const renderInline = (line: string): React.ReactNode[] => {
    // Handle **bold** inline
    const parts: React.ReactNode[] = []
    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-gray-200">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }

    return parts.length > 0 ? parts : [line]
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line
    if (!trimmed) {
      flushList()
      elements.push(<div key={`br-${i}`} className="h-1.5" />)
      continue
    }

    // Headings: ### Heading
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      const content = renderInline(headingMatch[2])
      if (level <= 2) {
        elements.push(
          <h3 key={`h-${i}`} className="text-xs font-semibold text-gray-200 mt-2 mb-0.5">
            {content}
          </h3>
        )
      } else {
        elements.push(
          <h4 key={`h-${i}`} className="text-xs font-medium text-gray-300 mt-1.5 mb-0.5">
            {content}
          </h4>
        )
      }
      continue
    }

    // List items: - item or * item
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/)
    if (listMatch) {
      listItems.push(
        <li key={`li-${i}`} className="text-xs text-gray-300 leading-relaxed">
          {renderInline(listMatch[1])}
        </li>
      )
      continue
    }

    // Regular paragraph
    flushList()
    elements.push(
      <p key={`p-${i}`} className="text-xs text-gray-300 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    )
  }

  flushList()
  return elements
}

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

interface NodeDetailProps {
  node: GraphNode | null
  edges: GraphEdge[]
  nodes: GraphNode[]
  onClose: () => void
  onNodeClick: (nodeId: string) => void
}

export function NodeDetail({ node, edges, nodes, onClose, onNodeClick }: NodeDetailProps) {
  const renderedContent = useMemo(() => {
    if (!node?.chunk?.content) return null
    return renderMarkdown(node.chunk.content)
  }, [node?.chunk?.content])

  if (!node) return null

  const connectedEdges = edges.filter(
    (e) => e.source_id === node.id || e.target_id === node.id
  )

  const connectedNodes = connectedEdges.map((e) => {
    const targetId = e.source_id === node.id ? e.target_id : e.source_id
    const targetNode = nodes.find((n) => n.id === targetId)
    return { edge: e, node: targetNode }
  }).filter((c) => c.node != null)

  const typeColor = node.color || NODE_COLORS[node.node_type] || "#6b7280"
  const chunk = node.chunk

  return (
    <div
      className="absolute top-0 right-0 h-full w-full sm:w-[380px] z-20 animate-in slide-in-from-right duration-200"
    >
      <div className="h-full rounded-none border-l border-white/10 bg-[#0f0f2a]/95 backdrop-blur-md overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f0f2a]/95 backdrop-blur-md border-b border-white/5 p-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: typeColor }}
              />
              <h2 className="text-base font-semibold text-white truncate">
                {node.label}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2">
            <Badge
              className="text-[10px] border-0 px-2 py-0.5"
              style={{ backgroundColor: typeColor + "22", color: typeColor }}
            >
              {node.node_type}
            </Badge>
            {chunk?.category && (
              <Badge className="text-[10px] border-0 px-2 py-0.5 bg-white/5 text-gray-400">
                {chunk.category}
              </Badge>
            )}
            {chunk?.tier && (
              <Badge className="text-[10px] border-0 px-2 py-0.5 bg-white/5 text-gray-400">
                Tier {chunk.tier}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Chunk Content */}
          {chunk?.content && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Knowledge Content
                </h4>
              </div>
              <div className="rounded-md bg-white/[0.03] border border-white/5 p-3">
                <div className="text-xs text-gray-300 leading-relaxed break-words knowledge-content">
                  {renderedContent}
                </div>
              </div>
            </div>
          )}

          {/* Source file */}
          {chunk?.source_file && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Source
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 font-mono bg-white/[0.03] px-2 py-1 rounded">
                {chunk.source_file}
              </p>
            </div>
          )}

          {/* Node metadata (for non-knowledge nodes like category) */}
          {!chunk && node.metadata && Object.keys(node.metadata).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Details
                </h4>
              </div>
              <div className="space-y-1.5">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start gap-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-gray-300 text-right max-w-[200px] break-words">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Nodes */}
          {connectedNodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Related ({connectedNodes.length})
              </h4>
              <div className="space-y-1">
                {connectedNodes.slice(0, 20).map(({ edge, node: relatedNode }) => {
                  if (!relatedNode) return null
                  const relColor =
                    relatedNode.color ||
                    NODE_COLORS[relatedNode.node_type] ||
                    "#6b7280"
                  return (
                    <button
                      key={edge.id}
                      onClick={() => onNodeClick(relatedNode.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left"
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: relColor }}
                      />
                      <span className="text-xs text-gray-300 truncate flex-1">
                        {relatedNode.label}
                      </span>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">
                        {edge.relationship.replace(/_/g, " ")}
                      </span>
                    </button>
                  )
                })}
                {connectedNodes.length > 20 && (
                  <p className="text-xs text-gray-500 px-2">
                    +{connectedNodes.length - 20} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
