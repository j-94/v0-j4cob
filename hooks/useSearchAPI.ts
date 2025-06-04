"use client"

import { useCallback, useMemo } from "react"
import { promiseCache } from "@/lib/promise-cache"
import { useAsyncData } from "./useAsyncData"
import type { Hit, SearchProps } from "@/lib/search"

export interface SearchResult {
  hits: Hit[]
  executionTime: number
  hasMore: boolean
  totalHits: number
}

export function useSearchAPI(searchParams: SearchProps) {
  const searchKey = useMemo(() => {
    return `search:${JSON.stringify(searchParams)}`
  }, [searchParams])

  const fetcher = useCallback(async (): Promise<SearchResult> => {
    const params = new URLSearchParams()

    if (searchParams.query) params.set("query", searchParams.query)
    if (searchParams.categories) {
      searchParams.categories.forEach((cat) => params.append("categories", cat))
    }
    if (searchParams.brand) {
      searchParams.brand.forEach((b) => params.append("brand", b))
    }
    if (searchParams.type) {
      searchParams.type.forEach((t) => params.append("type", t))
    }
    if (searchParams.price_range) {
      searchParams.price_range.forEach((pr) => params.append("price_range", pr))
    }
    if (searchParams.rating) {
      searchParams.rating.forEach((r) => params.append("rating", r.toString()))
    }
    if (searchParams.sort) params.set("sort", searchParams.sort)
    if (searchParams.page) params.set("page", searchParams.page.toString())
    if (searchParams.size) params.set("size", searchParams.size.toString())

    const url = `/api/search?${params.toString()}`
    return promiseCache.fetch(url)
  }, [searchParams])

  return useAsyncData<SearchResult>(searchKey, fetcher, {
    enabled: true,
    staleTime: 30000, // 30 seconds
  })
}
