"use client"

import { useState } from "react"
import { Search, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const NODE_COLORS: Record<string, string> = {
  category: "#6366f1",
  occasion: "#f59e0b",
  brand: "#10b981",
  style: "#ec4899",
  product: "#3b82f6",
  knowledge: "#8b5cf6",
}

interface GraphControlsProps {
  nodeTypes: string[]
  activeFilters: Set<string>
  onToggleFilter: (type: string) => void
  onSearch: (query: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
}

export function GraphControls({
  nodeTypes,
  activeFilters,
  onToggleFilter,
  onSearch,
  onZoomIn,
  onZoomOut,
  onResetView,
}: GraphControlsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    onSearch(val)
  }

  return (
    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100%-1rem)] sm:max-w-none">
      {/* Search - narrower on mobile */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="h-8 w-40 sm:w-56 rounded-md bg-[#1a1a3a]/90 backdrop-blur-sm border border-white/10 pl-8 pr-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Filter Chips - stack vertically on small screens */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-end gap-1 sm:gap-1.5">
        {nodeTypes.map((type) => {
          const active = activeFilters.has(type)
          const color = NODE_COLORS[type] || "#6b7280"
          return (
            <button
              key={type}
              onClick={() => onToggleFilter(type)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                active
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/5 bg-white/5 text-gray-500"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: active ? color : color + "66",
                }}
              />
              {type}
            </button>
          )
        })}
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-[#1a1a3a]/90 backdrop-blur-sm rounded-md border border-white/10 p-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          className="h-7 w-7 min-h-0 min-w-0 p-0 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          className="h-7 w-7 min-h-0 min-w-0 p-0 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-4 bg-white/10" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetView}
          className="h-7 w-7 min-h-0 min-w-0 p-0 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
