"use client"

import { useEffect, useRef } from "react"
import { useSearch } from "@/providers/SearchProvider"
import { useInfiniteSearch } from "@/hooks/useInfiniteSearch"
import type { Hit as _Hit, SearchProps } from "@/lib/search"
import Hit, { HitSkeleton } from "@/components/Hit"
import { cn } from "@/utils/cn"
import { Loader2 } from "lucide-react"

type Props = {
  initialHits: _Hit[]
  hasMore: boolean
  executionTime: number
  totalHits: number
  query?: string
  searchParams: SearchProps
}

function getGridCols(density: number) {
  switch (density) {
    case 1:
      return "grid-cols-1"
    case 2:
      return "grid-cols-1 sm:grid-cols-2"
    case 3:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    case 4:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    case 5:
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    case 6:
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    case 7:
      return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
    case 8:
      return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }
}

function getGap(density: number) {
  return density >= 6 ? "gap-3" : "gap-6"
}

export default function Hits({
  initialHits,
  hasMore: initialHasMore,
  executionTime,
  totalHits,
  query,
  searchParams,
}: Props) {
  const { view, density, setHitsLoadingTime } = useSearch()
  const observerRef = useRef<IntersectionObserver>()
  const loadingRef = useRef<HTMLDivElement>(null)

  // Convert searchParams to the format expected by useInfiniteSearch
  const infiniteSearchParams = {
    query: searchParams.query,
    categories: searchParams.categories,
    brand: searchParams.brand,
    type: searchParams.type,
    price_range: searchParams.price_range,
    rating: searchParams.rating,
    sort: searchParams.sort,
  }

  // Use the infinite search hook with proper promise caching
  const infiniteSearch = useInfiniteSearch(
    { hits: initialHits, hasMore: initialHasMore, totalHits },
    infiniteSearchParams,
  )

  // Set loading time
  useEffect(() => {
    setHitsLoadingTime(executionTime)
  }, [executionTime, setHitsLoadingTime])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && infiniteSearch.hasMore && !infiniteSearch.loadingMore) {
          infiniteSearch.loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [infiniteSearch.hasMore, infiniteSearch.loadingMore, infiniteSearch.loadMore])

  return (
    <div className="ais-Hits">
      <ol
        className={cn(
          "ais-Hits-list grid transition-all duration-300 ease-out",
          view === "grid" ? `${getGridCols(density)} ${getGap(density)}` : "grid-cols-1 gap-6",
        )}
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {infiniteSearch.hits.map((hit: _Hit, index) => (
          <li
            className="ais-Hits-item grid-item opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
            key={`${hit.id}-${index}`}
            style={{
              animationDelay: `${(index % 24) * 50}ms`,
            }}
          >
            <Hit hit={hit} view={view} density={density} query={query} />
          </li>
        ))}
      </ol>

      {/* Loading indicator for infinite scroll */}
      {infiniteSearch.hasMore && (
        <div ref={loadingRef} className="flex items-center justify-center py-8 mt-8">
          {infiniteSearch.loadingMore ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more tools...</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Scroll to load more</div>
          )}
        </div>
      )}

      {/* Error state */}
      {infiniteSearch.error && (
        <div className="flex items-center justify-center py-8 mt-8">
          <div className="text-center space-y-2">
            <div className="text-red-400">⚠️ Error loading more results</div>
            <div className="text-sm text-gray-500">{infiniteSearch.error.message}</div>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!infiniteSearch.hasMore && infiniteSearch.hits.length > 0 && (
        <div className="flex items-center justify-center py-8 mt-8">
          <div className="text-center space-y-2">
            <div className="text-gray-400">🎉 You've reached the end!</div>
            <div className="text-sm text-gray-500">Showing all {infiniteSearch.totalHits} results</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function HitsSkeleton() {
  const { view, density } = useSearch()
  const items = new Array(density * 3).fill(null).map((_, i) => i + 1)

  return (
    <div className="ais-Hits">
      <ol
        className={cn(
          "ais-Hits-list grid transition-all duration-300",
          view === "grid" ? `${getGridCols(density)} ${getGap(density)}` : "grid-cols-1 gap-6",
        )}
      >
        {items.map((item: number) => (
          <li className="ais-Hits-item" key={item}>
            <HitSkeleton view={view} density={density} />
          </li>
        ))}
      </ol>
    </div>
  )
}
