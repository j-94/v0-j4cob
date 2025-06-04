"use client"

import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react"

interface SearchContext {
  showSidebar: boolean
  setShowSidebar: (newValue: boolean) => void
  view: string
  setView: (newValue: string) => void
  density: number
  setDensity: (newValue: number) => void
  statsLoadingTime: number
  setStatsLoadingTime: (newValue: number) => void
  facetsLoadingTime: number
  setFacetsLoadingTime: (newValue: number) => void
  hitsLoadingTime: number
  setHitsLoadingTime: (newValue: number) => void
}

const SearchContext = createContext<SearchContext | undefined>(undefined)

export default function SearchProvider({
  defaultView,
  children,
}: PropsWithChildren<{
  defaultView?: string
}>) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [view, setView] = useState(defaultView || "grid")
  const [density, setDensity] = useState(4) // Default to 4 columns
  const [statsLoadingTime, setStatsLoadingTime] = useState(0)
  const [facetsLoadingTime, setFacetsLoadingTime] = useState(0)
  const [hitsLoadingTime, setHitsLoadingTime] = useState(0)

  const value = useMemo(
    () => ({
      showSidebar,
      setShowSidebar,
      view,
      setView,
      density,
      setDensity,
      statsLoadingTime,
      setStatsLoadingTime,
      facetsLoadingTime,
      setFacetsLoadingTime,
      hitsLoadingTime,
      setHitsLoadingTime,
    }),
    [showSidebar, view, density, statsLoadingTime, facetsLoadingTime, hitsLoadingTime],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const context = useContext(SearchContext)

  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }

  return context
}
