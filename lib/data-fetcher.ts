"use client"

import { useState, useEffect, useCallback } from "react"
import type { Hit, SearchProps } from "./search"

// Client-side data fetcher with proper promise caching
class DataCache {
  private cache = new Map<string, Promise<any>>()
  private results = new Map<string, any>()

  private getCacheKey(params: SearchProps): string {
    return JSON.stringify(params)
  }

  async fetchData(
    params: SearchProps,
  ): Promise<{ hits: Hit[]; executionTime: number; hasMore: boolean; totalHits: number }> {
    const cacheKey = this.getCacheKey(params)

    // Return cached result if available
    if (this.results.has(cacheKey)) {
      return this.results.get(cacheKey)
    }

    // Return cached promise if in progress
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Create new promise and cache it
    const promise = this.performFetch(params)
    this.cache.set(cacheKey, promise)

    try {
      const result = await promise
      this.results.set(cacheKey, result)
      this.cache.delete(cacheKey)
      return result
    } catch (error) {
      this.cache.delete(cacheKey)
      throw error
    }
  }

  private async performFetch(params: SearchProps) {
    const searchParams = new URLSearchParams()

    if (params.query) searchParams.set("query", params.query)
    if (params.categories) params.categories.forEach((cat) => searchParams.append("categories", cat))
    if (params.brand) params.brand.forEach((b) => searchParams.append("brand", b))
    if (params.type) params.type.forEach((t) => searchParams.append("type", t))
    if (params.price_range) params.price_range.forEach((pr) => searchParams.append("price_range", pr))
    if (params.rating) params.rating.forEach((r) => searchParams.append("rating", r.toString()))
    if (params.sort) searchParams.set("sort", params.sort)
    if (params.page) searchParams.set("page", params.page.toString())
    if (params.size) searchParams.set("size", params.size.toString())

    const response = await fetch(`/api/search?${searchParams.toString()}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  clearCache() {
    this.cache.clear()
    this.results.clear()
  }
}

// Global cache instance
const dataCache = new DataCache()

// Custom hook for data fetching with proper caching
export function useSearchData(params: SearchProps) {
  const [data, setData] = useState<{ hits: Hit[]; executionTime: number; hasMore: boolean; totalHits: number } | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await dataCache.fetchData(params)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// Hook for infinite loading
export function useInfiniteSearch(
  initialData: { hits: Hit[]; hasMore: boolean; totalHits: number },
  searchParams: SearchProps,
) {
  const [allHits, setAllHits] = useState<Hit[]>(initialData.hits)
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [totalHits, setTotalHits] = useState(initialData.totalHits)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(2)

  // Reset when search params change
  useEffect(() => {
    setAllHits(initialData.hits)
    setHasMore(initialData.hasMore)
    setTotalHits(initialData.totalHits)
    setPage(2)
  }, [initialData])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const result = await dataCache.fetchData({
        ...searchParams,
        page,
        size: 20,
      })

      if (result.hits && result.hits.length > 0) {
        setAllHits((prev) => [...prev, ...result.hits])
        setPage((prev) => prev + 1)
        setHasMore(result.hasMore)
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

  return {
    allHits,
    hasMore,
    totalHits,
    isLoadingMore,
    loadMore,
  }
}
