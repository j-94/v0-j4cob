"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Filter, LayoutGrid, Grid, List, Settings, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSearch } from "@/providers/SearchProvider"
import { cn } from "@/utils/cn"
import SortBy from "@/components/SortBy"
import { getFilterOptions } from "@/lib/search"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type FilterOptions = {
  categories: string[]
  authors: string[]
  toolTypes: string[]
  pricingCategories: string[]
  targetAudiences: string[]
  marketPositions: string[]
  totalTools: number
}

export default function BottomSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"filters" | "view" | "sort">("filters")
  const [startY, setStartY] = useState<number | null>(null)
  const [currentY, setCurrentY] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const { view, setView, density, setDensity } = useSearch()
  const router = useRouter()

  // Handle opening and closing the sheet
  const openSheet = (tab: "filters" | "view" | "sort") => {
    setActiveTab(tab)
    setIsOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeSheet = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      document.body.style.overflow = "auto"
    }, 300)
  }

  // Handle touch events for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return
    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff > 0) {
      // Only allow dragging down
      setCurrentY(diff)
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${diff}px)`
      }
    }
  }

  const handleTouchEnd = () => {
    if (currentY === null || startY === null) return

    if (currentY > 100) {
      // If dragged down more than 100px, close the sheet
      closeSheet()
    } else {
      // Otherwise, snap back
      if (sheetRef.current) {
        sheetRef.current.style.transform = "translateY(0)"
      }
    }

    setStartY(null)
    setCurrentY(null)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // Toggle view function
  function toggleView() {
    const newView = view === "grid" ? "list" : "grid"
    setView(newView)
    document.cookie = `hits-view=${newView}`
    router.refresh()
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 lg:hidden">
        <div className="flex items-center justify-around p-3 mobile-safe-area">
          <button
            onClick={() => openSheet("filters")}
            className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-purple-400 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="text-xs">Filters</span>
          </button>
          <button
            onClick={() => openSheet("sort")}
            className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-purple-400 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-xs">Sort</span>
          </button>
          <button
            onClick={() => openSheet("view")}
            className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-purple-400 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">View</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeSheet}
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            className={`fixed inset-x-0 bottom-0 z-50 bg-gray-950 border-t border-gray-800 rounded-t-3xl shadow-2xl lg:hidden transition-transform duration-300 ease-out ${
              isClosing ? "translate-y-full" : "translate-y-0"
            }`}
            style={{ maxHeight: "85vh" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-gray-100">
                {activeTab === "filters" && "Filters"}
                {activeTab === "sort" && "Sort By"}
                {activeTab === "view" && "View Options"}
              </h2>
              <button
                onClick={closeSheet}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 120px)" }}>
              {activeTab === "filters" && <FilterContent />}
              {activeTab === "sort" && <SortContent />}
              {activeTab === "view" && (
                <ViewContent view={view} toggleView={toggleView} density={density} setDensity={setDensity} />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950 mobile-safe-area">
              <div className="flex space-x-3">
                <button
                  onClick={closeSheet}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={closeSheet}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function FilterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    pricing: true,
    toolType: false,
    marketPosition: false,
    targetAudience: false,
    author: false,
  })

  // Load filter options
  useEffect(() => {
    getFilterOptions().then(setFilterOptions)
  }, [])

  const updateSearchParams = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      params.delete(key)
      if (value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else {
          params.set(key, value)
        }
      }
    })

    // Reset to first page when filters change
    params.delete("page")

    router.push(`/?${params.toString()}`)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getSelectedValues = (param: string): string[] => {
    return searchParams.getAll(param)
  }

  const toggleFilter = (param: string, value: string) => {
    const current = getSelectedValues(param)
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]

    updateSearchParams({ [param]: updated.length > 0 ? updated : null })
  }

  const clearAllFilters = () => {
    updateSearchParams({
      categories: null,
      brand: null,
      type: null,
      price_range: null,
      rating: null,
    })
  }

  const hasActiveFilters =
    getSelectedValues("categories").length > 0 ||
    getSelectedValues("brand").length > 0 ||
    getSelectedValues("type").length > 0 ||
    getSelectedValues("price_range").length > 0 ||
    getSelectedValues("rating").length > 0

  if (!filterOptions) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-800 rounded"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const FilterSection = ({
    title,
    items,
    param,
    sectionKey,
    limit = 10,
  }: {
    title: string
    items: string[]
    param: string
    sectionKey: keyof typeof expandedSections
    limit?: number
  }) => {
    const selectedValues = getSelectedValues(param)
    const isExpanded = expandedSections[sectionKey]
    const displayItems = isExpanded ? items : items.slice(0, limit)

    return (
      <div className="space-y-3">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-200">{title}</h3>
          {isExpanded ? <X className="w-4 h-4 text-gray-400" /> : <Filter className="w-4 h-4 text-gray-400" />}
        </button>

        {isExpanded && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {displayItems.map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  id={`${param}-${item}`}
                  checked={selectedValues.includes(item)}
                  onCheckedChange={() => toggleFilter(param, item)}
                />
                <Label
                  htmlFor={`${param}-${item}`}
                  className="text-sm text-gray-300 cursor-pointer flex-1 truncate"
                  title={item}
                >
                  {item}
                </Label>
              </div>
            ))}
            {items.length > limit && !isExpanded && (
              <button
                onClick={() => toggleSection(sectionKey)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Show {items.length - limit} more...
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Active Filters</h4>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-gray-400 hover:text-gray-200">
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedValues("categories").map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleFilter("categories", category)} />
              </Badge>
            ))}
            {getSelectedValues("price_range").map((price) => (
              <Badge key={price} variant="secondary" className="text-xs">
                {price}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleFilter("price_range", price)} />
              </Badge>
            ))}
            {getSelectedValues("type").map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleFilter("type", type)} />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-gray-800" />

      {/* Categories */}
      <FilterSection
        title="Categories"
        items={filterOptions.categories}
        param="categories"
        sectionKey="categories"
        limit={8}
      />

      <Separator className="bg-gray-800" />

      {/* Pricing */}
      <FilterSection title="Pricing" items={filterOptions.pricingCategories} param="price_range" sectionKey="pricing" />

      <Separator className="bg-gray-800" />

      {/* Tool Type */}
      <FilterSection title="Tool Type" items={filterOptions.toolTypes} param="type" sectionKey="toolType" />

      <Separator className="bg-gray-800" />

      {/* Market Position */}
      <FilterSection
        title="Market Position"
        items={filterOptions.marketPositions}
        param="market_position"
        sectionKey="marketPosition"
      />

      <Separator className="bg-gray-800" />

      {/* Target Audience */}
      <FilterSection
        title="Target Audience"
        items={filterOptions.targetAudiences}
        param="target_audience"
        sectionKey="targetAudience"
        limit={8}
      />

      <Separator className="bg-gray-800" />

      {/* Authors */}
      <FilterSection
        title="Authors"
        items={filterOptions.authors.slice(0, 50)} // Limit to top 50 authors
        param="brand"
        sectionKey="author"
        limit={8}
      />

      {/* Stats */}
      <div className="pt-4 border-t border-gray-800">
        <p className="text-sm text-gray-500">Total Tools: {filterOptions.totalTools.toLocaleString()}</p>
      </div>
    </div>
  )
}

function SortContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Sort Results By</h3>
        <SortBy classNames={{ root: "w-full" }} />
      </div>

      <Separator className="bg-gray-800" />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Quick Filters</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors">
            🔥 Trending
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors">
            🆓 Free Tools
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors">
            ⭐ Highest Rated
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors">
            🎨 Image Generation
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors">
            💬 Chat & Text
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors">
            💻 Code Assistant
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewContent({
  view,
  toggleView,
  density,
  setDensity,
}: {
  view: string
  toggleView: () => void
  density: number
  setDensity: (value: number) => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Layout</h3>
        <div className="flex space-x-4">
          <button
            onClick={toggleView}
            className={cn(
              "flex-1 flex flex-col items-center space-y-2 p-4 rounded-xl border",
              view === "grid"
                ? "bg-purple-900/20 border-purple-500/50 text-purple-300"
                : "bg-gray-800/50 border-gray-700 text-gray-400",
            )}
          >
            <Grid className="w-6 h-6" />
            <span>Grid</span>
          </button>
          <button
            onClick={toggleView}
            className={cn(
              "flex-1 flex flex-col items-center space-y-2 p-4 rounded-xl border",
              view === "list"
                ? "bg-purple-900/20 border-purple-500/50 text-purple-300"
                : "bg-gray-800/50 border-gray-700 text-gray-400",
            )}
          >
            <List className="w-6 h-6" />
            <span>List</span>
          </button>
        </div>
      </div>

      {view === "grid" && (
        <>
          <Separator className="bg-gray-800" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Grid Density</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <LayoutGrid className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={density}
                    onChange={(e) => setDensity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${
                        ((density - 1) / 7) * 100
                      }%, rgb(55 65 81) ${((density - 1) / 7) * 100}%, rgb(55 65 81) 100%)`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-300 min-w-[2rem] text-center">{density}×</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                  <button
                    key={value}
                    onClick={() => setDensity(value)}
                    className={cn(
                      "p-3 rounded-lg border text-center",
                      density === value
                        ? "bg-purple-900/20 border-purple-500/50 text-purple-300"
                        : "bg-gray-800/50 border-gray-700 text-gray-400",
                    )}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <Separator className="bg-gray-800" />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Display Options</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="show-stars" defaultChecked />
            <Label htmlFor="show-stars" className="text-sm text-gray-300">
              Show stars count
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="show-popularity" defaultChecked />
            <Label htmlFor="show-popularity" className="text-sm text-gray-300">
              Show popularity
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="show-categories" defaultChecked />
            <Label htmlFor="show-categories" className="text-sm text-gray-300">
              Show categories
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
