"use client"

import { useEffect, use, useTransition, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSearch } from "@/providers/SearchProvider"
import type { Hit as _Hit } from "@/lib/search"
import Hit, { HitSkeleton } from "@/components/Hit"
import { cn } from "@/utils/cn"
import { Grid, List, LayoutGrid, Loader2 } from "lucide-react"

type Props = {
  hitsPromise: Promise<{ hits: _Hit[]; executionTime: number; hasMore: boolean }>
  query?: string
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

export default function Hits({ hitsPromise, query }: Props) {
  const initialData = use(hitsPromise)
  const [allHits, setAllHits] = useState<_Hit[]>(initialData.hits)
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const { view, density, setHitsLoadingTime } = useSearch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const observerRef = useRef<IntersectionObserver>()
  const loadingRef = useRef<HTMLDivElement>(null)

  // Reset when search params change
  useEffect(() => {
    setAllHits(initialData.hits)
    setHasMore(initialData.hasMore)
    setPage(1)
    setHitsLoadingTime(initialData.executionTime)
  }, [initialData, setHitsLoadingTime])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = page + 1

    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", nextPage.toString())
      params.set("size", "24") // Load more items per page for infinite scroll

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      if (data.hits && data.hits.length > 0) {
        setAllHits((prev) => [...prev, ...data.hits])
        setPage(nextPage)
        setHasMore(data.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more results:", error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, page, searchParams])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
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
  }, [hasMore, isLoadingMore, loadMore])

  return (
    <div className="ais-Hits group-has-[[data-pending]]:animate-pulse">
      <ol
        className={cn(
          "ais-Hits-list grid transition-all duration-300 ease-out",
          view === "grid" ? `${getGridCols(density)} ${getGap(density)}` : "grid-cols-1 gap-6",
        )}
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {allHits.map((hit: _Hit, index) => (
          <li
            className="ais-Hits-item grid-item opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
            key={`${hit.id}-${index}`}
            style={{
              animationDelay: `${(index % 24) * 50}ms`, // Stagger animation for new items
            }}
          >
            <Hit hit={hit} view={view} density={density} query={query} />
          </li>
        ))}
      </ol>

      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={loadingRef} className="flex items-center justify-center py-8 mt-8">
          {isLoadingMore ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more tools...</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Scroll to load more</div>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && allHits.length > 0 && (
        <div className="flex items-center justify-center py-8 mt-8">
          <div className="text-center space-y-2">
            <div className="text-gray-400">🎉 You've reached the end!</div>
            <div className="text-sm text-gray-500">Showing all {allHits.length} results</div>
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

export function ViewButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { view, setView } = useSearch()

  function toggleView() {
    startTransition(() => {
      const currentValue = view
      setView(currentValue === "grid" ? "list" : "grid")
      document.cookie = `hits-view=${currentValue === "grid" ? "list" : "grid"}`
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        className="flex h-9 flex-none cursor-pointer items-center space-x-2 rounded-xl border border-gray-700 bg-gray-800/50 px-3 text-gray-300 hover:border-purple-500/50 hover:bg-gray-800 transition-all"
        onClick={() => toggleView()}
        data-pending={isPending ? "" : undefined}
      >
        <span className="text-xs hidden sm:inline">View:</span>
        {view === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
      </button>
    </>
  )
}

export function DensitySlider() {
  const { density, setDensity, view } = useSearch()

  if (view !== "grid") return null

  return (
    <div className="hidden sm:flex items-center space-x-2">
      <LayoutGrid className="w-3 h-3 text-gray-400" />
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">1</span>
        <input
          type="range"
          min="1"
          max="8"
          value={density}
          onChange={(e) => setDensity(Number(e.target.value))}
          className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${((density - 1) / 7) * 100}%, rgb(55 65 81) ${((density - 1) / 7) * 100}%, rgb(55 65 81) 100%)`,
          }}
        />
        <span className="text-xs text-gray-500">8</span>
      </div>
      <span className="text-xs text-gray-400">{density}×</span>
    </div>
  )
}
