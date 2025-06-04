import { Suspense, memo } from "react"
import Stats, { StatsSkeleton } from "@/components/Stats"
import Hits, { HitsSkeleton } from "@/components/Hits"
import Sidebar from "@/components/Sidebar"
import { getFacets, getResults, getStats, type SearchProps } from "@/lib/search"
import { stopwatchWrapper } from "@/utils/stopwatch"

const StatsMemo = memo(Stats)
const HitsMemo = memo(Hits)

const facets = [
  {
    attribute: "categories",
    title: "Categories",
  },
  {
    attribute: "brand",
    title: "Company",
  },
  {
    attribute: "type",
    title: "Type",
  },
  {
    attribute: "price_range",
    title: "Pricing",
  },
  {
    attribute: "rating",
    title: "Rating",
  },
]

export default async function Search(props: SearchProps) {
  const { sort, page, size, ...queryProps } = props

  const facetsPromise = stopwatchWrapper(getFacets(queryProps))
  const statsPromise = stopwatchWrapper(getStats(queryProps))
  const hitsResult = await stopwatchWrapper(getResults({ ...props, size: size || 24 }))

  return (
    <div className="telegram-viewer flex pb-16 lg:pb-0">
      <Sidebar>
        <div className="space-y-6">
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Quick Filters</h3>
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
      </Sidebar>

      <div className="flex-1 min-w-0">
        {/* Compact Top Controls */}
        <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 -mx-4 px-4 py-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Suspense key={`stats`} fallback={<StatsSkeleton classNames={{ root: "flex-none" }} />}>
                <StatsMemo statsPromise={statsPromise} classNames={{ root: "flex-none min-w-0" }} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Results with Infinite Scroll */}
        <div className="telegram-scroll-container">
          <Suspense key={`hits`} fallback={<HitsSkeleton />}>
            <HitsMemo
              initialHits={hitsResult.hits}
              hasMore={hitsResult.hasMore}
              executionTime={hitsResult.executionTime}
              totalHits={hitsResult.totalHits}
              query={props.query}
              searchParams={props}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
