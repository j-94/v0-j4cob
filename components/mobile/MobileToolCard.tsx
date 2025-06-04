"use client"

import { memo } from "react"
import { Star, TrendingUp, Zap, Crown } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Hit } from "@/lib/search"

type Props = {
  tool: Hit
  viewMode: "list" | "grid"
  onSelect: (tool: Hit) => void
  searchQuery?: string
}

function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query) return <span>{text}</span>

  const regex = new RegExp(`(${query})`, "gi")
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-purple-500/30 text-purple-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  )
}

function getPricingBadge(pricingCategory: string) {
  switch (pricingCategory.toLowerCase()) {
    case "free":
      return { text: "Free", color: "bg-green-500/20 text-green-400 border-green-500/30" }
    case "freemium":
      return { text: "Freemium", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    case "enterprise":
      return { text: "Enterprise", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
    case "paid":
      return { text: "Paid", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
    default:
      return { text: pricingCategory, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
  }
}

const MobileToolCard = memo(function MobileToolCard({ tool, viewMode, onSelect, searchQuery }: Props) {
  const pricingBadge = getPricingBadge(tool.pricing_category)
  const isPopular = tool.popularity > 10000

  if (viewMode === "grid") {
    return (
      <div
        onClick={() => onSelect(tool)}
        className="mx-2 mb-3 bg-gray-900/50 border border-gray-800/50 rounded-2xl p-4 active:scale-95 transition-all duration-200 active:bg-gray-800/50"
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Crown className="w-3 h-3" />
          </div>
        )}

        {/* Tool Icon */}
        <div className="relative w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          {tool.image_url ? (
            <img src={tool.image_url || "/placeholder.svg"} alt={tool.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-gray-100 text-sm line-clamp-1">
            <Highlight text={tool.name} query={searchQuery} />
          </h3>

          <p className="text-xs text-gray-400 line-clamp-2">{tool.short_description || tool.description}</p>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
            {tool.raw_metadata.stars > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{tool.raw_metadata.stars.toLocaleString()}</span>
              </div>
            )}
            {tool.popularity > 0 && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{tool.popularity.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Pricing Badge */}
          <div className="flex justify-center">
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", pricingBadge.color)}>
              {pricingBadge.text}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => onSelect(tool)}
      className="mx-4 mb-3 bg-gray-900/50 border border-gray-800/50 rounded-2xl p-4 active:scale-[0.98] transition-all duration-200 active:bg-gray-800/50"
    >
      <div className="flex space-x-4">
        {/* Tool Icon */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          {tool.image_url ? (
            <img src={tool.image_url || "/placeholder.svg"} alt={tool.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          )}

          {/* Popular indicator */}
          {isPopular && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-100 line-clamp-1">
                <Highlight text={tool.name} query={searchQuery} />
              </h3>
              <p className="text-sm text-purple-400 font-medium line-clamp-1">
                <Highlight text={tool.author} query={searchQuery} />
              </p>
            </div>

            <span className={cn("px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0", pricingBadge.color)}>
              {pricingBadge.text}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 line-clamp-2">{tool.short_description || tool.description}</p>

          {/* Stats & Categories */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {tool.raw_metadata.stars > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{tool.raw_metadata.stars.toLocaleString()}</span>
                </div>
              )}
              {tool.popularity > 0 && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{tool.popularity.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {tool.categories?.slice(0, 2).map((category, index) => (
                <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default MobileToolCard
