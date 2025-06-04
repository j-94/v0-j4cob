"use client"

import { use } from "react"
import type { Hit } from "@/lib/search"
import { TrendingUp, Star, Users, Zap } from "lucide-react"
import { cn } from "@/utils/cn"

type Props = {
  statsPromise: Promise<{ hits: Hit[]; executionTime: number }>
  classNames?: {
    root?: string
  }
}

export default function Stats({ statsPromise, classNames }: Props) {
  const { hits, executionTime } = use(statsPromise)

  const totalStars = hits.reduce((sum, hit) => sum + hit.raw_metadata.stars, 0)
  const avgPopularity =
    hits.length > 0 ? Math.round(hits.reduce((sum, hit) => sum + hit.popularity, 0) / hits.length) : 0
  const openSourceCount = hits.filter(
    (hit) =>
      hit.license.toLowerCase().includes("mit") ||
      hit.license.toLowerCase().includes("apache") ||
      hit.license.toLowerCase().includes("open source") ||
      hit.license.toLowerCase().includes("gpl"),
  ).length

  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs text-gray-400", classNames?.root)}>
      <div className="flex items-center space-x-1">
        <Zap className="w-3 h-3 text-purple-400" />
        <span>
          <strong className="text-gray-200">{hits.length}</strong> tools
        </span>
      </div>

      {totalStars > 0 && (
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>
            <strong className="text-gray-200">{totalStars.toLocaleString()}</strong> stars
          </span>
        </div>
      )}

      {avgPopularity > 0 && (
        <div className="hidden sm:flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span>
            <strong className="text-gray-200">{avgPopularity.toLocaleString()}</strong> avg
          </span>
        </div>
      )}

      {openSourceCount > 0 && (
        <div className="hidden md:flex items-center space-x-1">
          <Users className="w-3 h-3 text-blue-400" />
          <span>
            <strong className="text-gray-200">{openSourceCount}</strong> open source
          </span>
        </div>
      )}

      <div className="hidden sm:flex items-center space-x-1 ml-auto">
        <span className="text-gray-500">
          <strong className="text-gray-300">{executionTime}ms</strong>
        </span>
      </div>
    </div>
  )
}

export function StatsSkeleton({ classNames }: { classNames?: { root?: string } }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs text-gray-400 animate-pulse", classNames?.root)}>
      <div className="flex items-center space-x-1">
        <div className="w-3 h-3 bg-gray-700 rounded"></div>
        <div className="h-3 w-12 bg-gray-700 rounded"></div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="w-3 h-3 bg-gray-700 rounded"></div>
        <div className="h-3 w-16 bg-gray-700 rounded"></div>
      </div>
      <div className="hidden sm:flex items-center space-x-1">
        <div className="w-3 h-3 bg-gray-700 rounded"></div>
        <div className="h-3 w-14 bg-gray-700 rounded"></div>
      </div>
      <div className="hidden sm:flex items-center space-x-1 ml-auto">
        <div className="h-3 w-10 bg-gray-700 rounded"></div>
      </div>
    </div>
  )
}
