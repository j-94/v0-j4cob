"use client"

import { useState, useRef } from "react"
import { Search, Filter, Grid, List, Mic, X } from "lucide-react"
import { cn } from "@/utils/cn"

type Props = {
  query: string
  onQueryChange: (query: string) => void
  activeFilterCount: number
  onFilterPress: () => void
  totalCount: number
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  isLoading: boolean
}

export default function MobileSearchBar({
  query,
  onQueryChange,
  activeFilterCount,
  onFilterPress,
  totalCount,
  viewMode,
  onViewModeChange,
  isLoading,
}: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onQueryChange("")
    inputRef.current?.focus()
  }

  return (
    <div className="bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
      <div className="px-4 py-3 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <div
            className={cn(
              "flex items-center bg-gray-900/50 border rounded-2xl transition-all duration-200",
              isFocused ? "border-purple-500/50 bg-gray-900/80" : "border-gray-700/50",
            )}
          >
            <div className="pl-4 pr-2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search AI tools, categories, use cases..."
              className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 py-3 pr-2 focus:outline-none"
            />

            {query && (
              <button onClick={handleClear} className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}

            <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Results Count & Loading */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-400">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <span>
                  <span className="text-gray-200 font-medium">{totalCount.toLocaleString()}</span> tools
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Filter Button */}
            <button
              onClick={onFilterPress}
              className={cn(
                "relative flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all",
                activeFilterCount > 0
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600",
              )}
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {activeFilterCount}
                </div>
              )}
            </button>

            {/* View Mode Toggle */}
            <button
              onClick={() => onViewModeChange(viewMode === "list" ? "grid" : "list")}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-gray-700/50 bg-gray-800/50 text-gray-400 hover:border-gray-600 transition-all"
            >
              {viewMode === "list" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
