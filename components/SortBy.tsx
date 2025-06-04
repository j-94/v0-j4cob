"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { ChevronDown } from "lucide-react"

const sortOptions = [
  { value: "", label: "Featured" },
  { value: "popularity_desc", label: "Most Popular" },
  { value: "popularity_asc", label: "Least Popular" },
  { value: "stars_desc", label: "Most Stars" },
  { value: "stars_asc", label: "Least Stars" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
]

export default function SortBy() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get("sort") || ""

  function handleSortChange(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("sort", value)
      } else {
        params.delete("sort")
      }
      params.delete("page") // Reset to first page when sorting
      router.push(`/?${params.toString()}`)
    })
  }

  const currentLabel = sortOptions.find((option) => option.value === currentSort)?.label || "Featured"

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="appearance-none bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 pr-10 text-gray-300 hover:border-purple-500/50 hover:bg-gray-800 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        data-pending={isPending ? "" : undefined}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-gray-300">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}
