"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Filter, ChevronDown, ChevronUp, Settings } from "lucide-react"
import { getFilterOptions } from "@/lib/search"

type FilterOptions = {
  categories: string[]
  authors: string[]
  toolTypes: string[]
  pricingCategories: string[]
  targetAudiences: string[]
  marketPositions: string[]
  totalTools: number
}

function SidebarContent() {
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

  const updateSearchParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
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
    },
    [router, searchParams],
  )

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
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-200">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-gray-400 hover:text-gray-200">
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Active Filters</h4>
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

export default function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hidden lg:block w-80 bg-gray-900/50 border-r border-gray-800 p-6 overflow-y-auto">
      <SidebarContent />
      {children}
    </div>
  )
}

export function ShowSidebarButton() {
  const [showDrawer, setShowDrawer] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const closeDrawer = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowDrawer(false)
      setIsClosing(false)
    }, 300) // Match animation duration
  }

  const openDrawer = () => {
    setShowDrawer(true)
  }

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (showDrawer) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showDrawer])

  return (
    <>
      <button
        type="button"
        className="flex h-10 cursor-pointer items-center justify-center space-x-2 whitespace-nowrap rounded-xl border border-gray-700 bg-gray-800/50 px-4 text-gray-300 hover:border-purple-500/50 hover:bg-gray-800 transition-all lg:hidden"
        onClick={openDrawer}
      >
        <Settings className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {/* Bottom Drawer for Mobile */}
      {showDrawer && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeDrawer}
          />

          {/* Bottom Drawer */}
          <div
            className={`fixed inset-x-0 bottom-0 z-50 bg-gray-950 border-t border-gray-800 shadow-2xl lg:hidden transition-transform duration-300 ease-out ${
              isClosing ? "translate-y-full" : "translate-y-0"
            }`}
            style={{ maxHeight: "85vh" }}
          >
            {/* Drawer Handle */}
            <div className="flex justify-center py-3 border-b border-gray-800">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-100">Filters & Sort</h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 140px)" }}>
              <SidebarContent />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950">
              <div className="flex space-x-3">
                <button
                  onClick={closeDrawer}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={closeDrawer}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
