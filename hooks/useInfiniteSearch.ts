"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { promiseCache } from "@/lib/promise-cache"
import type { Hit, SearchProps } from "@/lib/search"

export interface InfiniteSearchState {
  hits: Hit[]
  hasMore: boolean
  totalHits: number
  loading: boolean
  loadingMore: boolean
  error: Error | null
}

export function useInfiniteSearch(
  initialData: { hits: Hit[]; hasMore: boolean; totalHits: number },
  searchParams: Omit<SearchProps, "page" | "size">,
) {
  const [state, setState] = useState<InfiniteSearchState>({
    hits: initialData.hits,
    hasMore: initialData.hasMore,
    totalHits: initialData.totalHits,
    loading: false,
    loadingMore: false,
    error: null,
  })

  const [currentPage, setCurrentPage] = useState(2) // Start from page 2
  const searchParamsRef = useRef(searchParams)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Reset state when search params change
  useEffect(() => {
    const paramsChanged = JSON.stringify(searchParamsRef.current) !== JSON.stringify(searchParams)

    if (paramsChanged) {
      searchParamsRef.current = searchParams
      setState({
        hits: initialData.hits,
        hasMore: initialData.hasMore,
        totalHits: initialData.totalHits,
        loading: false,
        loadingMore: false,
        error: null,
      })
      setCurrentPage(2)

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [searchParams, initialData])

  const loadMore = useCallback(async (): Promise<void> => {
    if (state.loadingMore || !state.hasMore || state.loading) {
      return
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setState((prev) => ({ ...prev, loadingMore: true, error: null }))

    try {
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

      params.set("page", currentPage.toString())
      params.set("size", "20")

      const url = `/api/search?${params.toString()}`
      const result = await promiseCache.fetch(url)

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      setState((prev) => ({
        ...prev,
        hits: [...prev.hits, ...result.hits],
        hasMore: result.hasMore,
        totalHits: result.totalHits,
        loadingMore: false,
      }))

      setCurrentPage((prev) => prev + 1)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return // Ignore aborted requests
      }

      setState((prev) => ({
        ...prev,
        loadingMore: false,
        error: error as Error,
      }))
    }
  }, [state.loadingMore, state.hasMore, state.loading, searchParams, currentPage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    loadMore,
  }
}
