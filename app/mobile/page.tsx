import { Suspense } from "react"
import MobileDiscoveryInterface from "@/components/mobile/MobileDiscoveryInterface"
import { getResults, getFilterOptions } from "@/lib/search"
import type { SearchProps } from "@/lib/search"

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams: SearchProps
}

function MobileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="px-4 py-3 space-y-3">
          <div className="h-12 bg-gray-800 rounded-2xl animate-pulse" />
          <div className="flex justify-between">
            <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="flex space-x-2">
              <div className="h-8 w-16 bg-gray-800 rounded-xl animate-pulse" />
              <div className="h-8 w-16 bg-gray-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
                <div className="h-3 bg-gray-800 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function MobilePageContent({ searchParams }: PageProps) {
  try {
    const { query, categories, brand, type, price_range, rating, sort, page, size } = searchParams

    // Fetch initial data on the server with proper error handling
    const searchProps = {
      query,
      categories: Array.isArray(categories) ? categories.map(String) : categories ? [String(categories)] : undefined,
      brand: Array.isArray(brand) ? brand.map(String) : brand ? [String(brand)] : undefined,
      type: Array.isArray(type) ? type.map(String) : type ? [String(type)] : undefined,
      price_range: Array.isArray(price_range)
        ? price_range.map(String)
        : price_range
          ? [String(price_range)]
          : undefined,
      rating: Array.isArray(rating) ? rating.map(Number) : rating ? [Number(rating)] : undefined,
      sort,
      page: Number(page) || 1,
      size: Number(size) || 20,
    }

    const [initialResults, filterOptions] = await Promise.all([getResults(searchProps), getFilterOptions()])

    return (
      <MobileDiscoveryInterface
        initialResults={initialResults}
        filterOptions={filterOptions}
        initialQuery={query}
        initialCategories={searchProps.categories}
        initialBrand={searchProps.brand}
        initialType={searchProps.type}
        initialPriceRange={searchProps.price_range}
        initialRating={searchProps.rating}
        initialSort={sort}
        initialPage={Number(page) || 1}
        initialSize={Number(size) || 20}
      />
    )
  } catch (error) {
    console.error("Error loading mobile page data:", error)

    // Return fallback UI with retry option
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <div className="text-xl font-semibold text-gray-300">Unable to load data</div>
          <div className="text-gray-500">Please try refreshing the page</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
}

export default async function MobilePage(props: PageProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Suspense fallback={<MobileLoadingSkeleton />}>
        <MobilePageContent {...props} />
      </Suspense>
    </div>
  )
}
