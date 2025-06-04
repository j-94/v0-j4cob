"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface AsyncDataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface UseAsyncDataOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  staleTime?: number
}

export function useAsyncData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {},
): AsyncDataState<T> & {
  refetch: () => Promise<void>
  mutate: (data: T) => void
} {
  const { enabled = true, refetchOnMount = true, staleTime = 5 * 60 * 1000 } = options

  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const fetcherRef = useRef(fetcher)
  const keyRef = useRef(key)
  const lastFetchTime = useRef<number>(0)

  // Update refs when dependencies change
  useEffect(() => {
    fetcherRef.current = fetcher
    keyRef.current = key
  }, [fetcher, key])

  const executeRequest = useCallback(async (): Promise<void> => {
    if (!enabled) return

    const now = Date.now()
    const isStale = now - lastFetchTime.current > staleTime

    if (!isStale && state.data && !refetchOnMount) {
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await fetcherRef.current()
      lastFetchTime.current = now
      setState({
        data: result,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      })
    }
  }, [enabled, staleTime, refetchOnMount, state.data])

  const mutate = useCallback((newData: T) => {
    setState((prev) => ({
      ...prev,
      data: newData,
      error: null,
    }))
  }, [])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      executeRequest()
    }
  }, [key, enabled]) // Only depend on key and enabled

  return {
    ...state,
    refetch: executeRequest,
    mutate,
  }
}
