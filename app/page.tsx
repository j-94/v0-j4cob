import { cookies } from "next/headers"
import Breadcrumbs from "@/components/Breadcrumbs"
import Search from "./Search"
import SearchProvider from "@/providers/SearchProvider"
import type { SearchProps } from "@/lib/search"
import { Sparkles } from "lucide-react"
import BottomSheet from "@/components/BottomSheet"

export const experimental_ppr = true

type PageProps = {
  searchParams: Promise<SearchProps>
}

export default async function Home({ searchParams }: PageProps) {
  const { query, categories, brand, type, price_range, rating, sort, page, size } = await searchParams

  const cookieStore = await cookies()
  const defaultView = cookieStore.get("hits-view")

  return (
    <>
      {/* Compact Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              j4cob AI Tools
            </h1>
            <p className="text-gray-400 text-sm">Discover the best AI tools for your workflow</p>
          </div>
        </div>
      </div>

      <Breadcrumbs />

      <SearchProvider defaultView={defaultView?.value}>
        <Search
          query={query}
          categories={
            Array.isArray(categories) ? categories.map(String) : categories ? [String(categories)] : undefined
          }
          brand={Array.isArray(brand) ? brand.map(String) : brand ? [String(brand)] : undefined}
          type={Array.isArray(type) ? type.map(String) : type ? [String(type)] : undefined}
          price_range={
            Array.isArray(price_range) ? price_range.map(String) : price_range ? [String(price_range)] : undefined
          }
          rating={Array.isArray(rating) ? rating.map(Number) : rating ? [Number(rating)] : undefined}
          sort={sort}
          page={Number(page) || 1}
          size={Number(size) || 24}
        />
        <BottomSheet />
      </SearchProvider>
    </>
  )
}
