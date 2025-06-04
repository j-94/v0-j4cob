"use client"

import { useState, useEffect } from "react"
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type FilterOptions = {
  categories: string[]
  authors: string[]
  toolTypes: string[]
  pricingCategories: string[]
  targetAudiences: string[]
  marketPositions: string[]
  totalTools: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  brand: string[]
  type: string[]
  priceRange: string[]
  rating: number[]
  sort: string
  onFilterChange: (filters: {
    categories?: string[]
    brand?: string[]
    type?: string[]
    priceRange?: string[]
    rating?: number[]
    sort?: string
  }) => void
  onClearAll: () => void
  resultCount: number
  filterOptions: FilterOptions
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  categories,
  brand,
  type,
  priceRange,
  rating,
  sort,
  onFilterChange,
  onClearAll,
  resultCount,
  filterOptions,
}: Props) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    pricing: true,
    toolType: false,
    sort: false,
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleFilter = (param: "categories" | "brand" | "type" | "priceRange", value: string) => {
    const currentValues =
      param === "categories" ? categories : param === "brand" ? brand : param === "type" ? type : priceRange

    const updated = currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value]

    onFilterChange({ [param]: updated })
  }

  const handleSortChange = (newSort: string) => {
    onFilterChange({ sort: newSort })
  }

  const sortOptions = [
    { value: "", label: "Featured" },
    { value: "popularity_desc", label: "Most Popular" },
    { value: "stars_desc", label: "Most Stars" },
    { value: "newest", label: "Newest" },
    { value: "name_asc", label: "Name A-Z" },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 bg-gray-950 border-t border-gray-800 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-100">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Sort */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("sort")}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold text-gray-200">Sort By</h3>
              {expandedSections.sort ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedSections.sort && (
              <div className="grid grid-cols-2 gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-medium transition-all",
                      sort === option.value
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-400",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <FilterSection
            title="Categories"
            items={filterOptions.categories.slice(0, 12)}
            selectedItems={categories}
            onToggle={(value) => toggleFilter("categories", value)}
            isExpanded={expandedSections.categories}
            onToggleExpanded={() => toggleSection("categories")}
          />

          {/* Pricing */}
          <FilterSection
            title="Pricing"
            items={filterOptions.pricingCategories}
            selectedItems={priceRange}
            onToggle={(value) => toggleFilter("priceRange", value)}
            isExpanded={expandedSections.pricing}
            onToggleExpanded={() => toggleSection("pricing")}
          />

          {/* Tool Type */}
          <FilterSection
            title="Tool Type"
            items={filterOptions.toolTypes}
            selectedItems={type}
            onToggle={(value) => toggleFilter("type", value)}
            isExpanded={expandedSections.toolType}
            onToggleExpanded={() => toggleSection("toolType")}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">{resultCount.toLocaleString()} tools found</span>
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-gray-400">
              Clear all
            </Button>
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-medium"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilterSection({
  title,
  items,
  selectedItems,
  onToggle,
  isExpanded,
  onToggleExpanded,
}: {
  title: string
  items: string[]
  selectedItems: string[]
  onToggle: (value: string) => void
  isExpanded: boolean
  onToggleExpanded: () => void
}) {
  return (
    <div className="space-y-3">
      <button onClick={onToggleExpanded} className="flex items-center justify-between w-full text-left">
        <h3 className="font-semibold text-gray-200">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-${item}`}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => onToggle(item)}
              />
              <Label htmlFor={`${title}-${item}`} className="text-sm text-gray-300 cursor-pointer flex-1">
                {item}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
