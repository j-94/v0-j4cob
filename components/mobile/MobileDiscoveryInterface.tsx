"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { FixedSizeList as List } from "react-window"
import InfiniteLoader from "react-window-infinite-loader"
import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteSearch } from "@/hooks/useInfiniteSearch"
import type { Hit, SearchProps } from "@/lib/search"
import MobileSearchBar from "./MobileSearchBar"
import MobileFilterSheet from "./MobileFilterSheet"
import MobileToolCard from "./MobileToolCard"
import MobileQuickLook from "./MobileQuickLook"
import MobileLoadingState from "./MobileLoadingState"

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
  initialResults: { hits: Hit[]; executionTime: number; hasMore: boolean; totalHits: number }
  filterOptions: FilterOptions
  initialQuery?: string
  initialCategories?: string[]
  initialBrand?: string[]
  initialType?: string[]
  initialPriceRange?: string[]
  initialRating?: number[]
  initialSort?: string
  initialPage?: number
  initialSize?: number
}

export default function MobileDiscoveryInterface({
  initialResults,
  filterOptions,
  initialQuery = "",
  initialCategories = [],
  initialBrand = [],
  initialType = [],
  initialPriceRange = [],
  initialRating = [],
  initialSort = "",
}: Props) {
  // Core state
  const [query, setQuery] = useState(initialQuery)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [brand, setBrand] = useState<string[]>(initialBrand)
  const [type, setType] = useState<string[]>(initialType)
  const [priceRange, setPriceRange] = useState<string[]>(initialPriceRange)
  const [rating, setRating] = useState<number[]>(initialRating)
  const [sort, setSort] = useState(initialSort)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // UI state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Hit | null>(null)
  const [isQuickLookOpen, setIsQuickLookOpen] = useState(false)

  const router = useRouter()
  const listRef = useRef<List>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Memoized search params - CRITICAL: This prevents unnecessary re-renders
  const searchParams = useMemo(
    (): Omit<SearchProps, "page" | "size"> => ({
      query: debouncedQuery || undefined,
      categories: categories.length > 0 ? categories : undefined,
      brand: brand.length > 0 ? brand : undefined,
      type: type.length > 0 ? type : undefined,
      price_range: priceRange.length > 0 ? priceRange : undefined,
      rating: rating.length > 0 ? rating : undefined,
      sort: sort || undefined,
    }),
    [debouncedQuery, categories, brand, type, priceRange, rating, sort],
  )

  // Use the infinite search hook with proper promise caching
  const infiniteSearch = useInfiniteSearch(initialResults, searchParams)

  // Update URL when search params change - debounced to prevent excessive updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set("query", debouncedQuery)
      if (categories.length > 0) categories.forEach((cat) => params.append("categories", cat))
      if (brand.length > 0) brand.forEach((b) => params.append("brand", b))
      if (type.length > 0) type.forEach((t) => params.append("type", t))
      if (priceRange.length > 0) priceRange.forEach((pr) => params.append("price_range", pr))
      if (rating.length > 0) rating.forEach((r) => params.append("rating", r.toString()))
      if (sort) params.set("sort", sort)

      const newUrl = params.toString() ? `/mobile?${params.toString()}` : "/mobile"
      router.replace(newUrl, { scroll: false })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [debouncedQuery, categories, brand, type, priceRange, rating, sort, router])

  // Handle tool selection
  const handleToolSelect = useCallback((tool: Hit) => {
    setSelectedTool(tool)
    setIsQuickLookOpen(true)
  }, [])

  // Handle filter changes with batching
  const handleFilterChange = useCallback(
    (newFilters: {
      categories?: string[]
      brand?: string[]
      type?: string[]
      priceRange?: string[]
      rating?: number[]
      sort?: string
    }) => {
      // Batch state updates to prevent multiple re-renders
      if (newFilters.categories !== undefined) setCategories(newFilters.categories)
      if (newFilters.brand !== undefined) setBrand(newFilters.brand)
      if (newFilters.type !== undefined) setType(newFilters.type)
      if (newFilters.priceRange !== undefined) setPriceRange(newFilters.priceRange)
      if (newFilters.rating !== undefined) setRating(newFilters.rating)
      if (newFilters.sort !== undefined) setSort(newFilters.sort)
    },
    [],
  )

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setCategories([])
    setBrand([])
    setType([])
    setPriceRange([])
    setRating([])
    setSort("")
  }, [])

  // Check if item is loaded for infinite scroll
  const isItemLoaded = useCallback(
    (index: number) => {
      return !!infiniteSearch.hits[index]
    },
    [infiniteSearch.hits],
  )

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return categories.length + brand.length + type.length + priceRange.length + rating.length + (sort ? 1 : 0)
  }, [categories, brand, type, priceRange, rating, sort])

  // Render tool card with error boundary
  const renderToolCard = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const tool = infiniteSearch.hits[index]

      if (!tool) {
        return (
          <div style={style}>
            <MobileLoadingState />
          </div>
        )
      }

      return (
        <div style={style}>
          <MobileToolCard tool={tool} viewMode={viewMode} onSelect={handleToolSelect} searchQuery={debouncedQuery} />
        </div>
      )
    },
    [infiniteSearch.hits, viewMode, handleToolSelect, debouncedQuery],
  )

  // Handle window resize for react-window
  const [windowHeight, setWindowHeight] = useState(600)

  useEffect(() => {
    const updateHeight = () => {
      setWindowHeight(window.innerHeight - 120)
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-950 relative overflow-hidden">
      {/* Universal Search Bar */}
      <MobileSearchBar
        query={query}
        onQueryChange={setQuery}
        activeFilterCount={activeFilterCount}
        onFilterPress={() => setIsFilterSheetOpen(true)}
        totalCount={infiniteSearch.totalHits}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isLoading={infiniteSearch.loading || infiniteSearch.loadingMore}
      />

      {/* Main Content - Infinite Canvas */}
      <div className="flex-1 relative">
        {infiniteSearch.error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <div className="text-xl font-semibold text-gray-300">Error loading data</div>
              <div className="text-gray-500">{infiniteSearch.error.message}</div>
            </div>
          </div>
        ) : infiniteSearch.hits.length === 0 && !infiniteSearch.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-6xl">🔍</div>
              <div className="text-xl font-semibold text-gray-300">No tools found</div>
              <div className="text-gray-500">Try adjusting your search or filters</div>
            </div>
          </div>
        ) : (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={infiniteSearch.hasMore ? infiniteSearch.hits.length + 1 : infiniteSearch.hits.length}
            loadMoreItems={infiniteSearch.loadMore}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={(list) => {
                  ref(list)
                  listRef.current = list
                }}
                height={windowHeight}
                itemCount={infiniteSearch.hasMore ? infiniteSearch.hits.length + 1 : infiniteSearch.hits.length}
                itemSize={viewMode === "list" ? 140 : 200}
                onItemsRendered={onItemsRendered}
                className="scrollbar-hide"
              >
                {renderToolCard}
              </List>
            )}
          </InfiniteLoader>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        categories={categories}
        brand={brand}
        type={type}
        priceRange={priceRange}
        rating={rating}
        sort={sort}
        onFilterChange={handleFilterChange}
        onClearAll={clearAllFilters}
        resultCount={infiniteSearch.totalHits}
        filterOptions={filterOptions}
      />

      {/* Quick Look Panel */}
      <MobileQuickLook isOpen={isQuickLookOpen} onClose={() => setIsQuickLookOpen(false)} tool={selectedTool} />
    </div>
  )
}
