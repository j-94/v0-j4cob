"use client"
import type { Hit as _Hit } from "@/lib/search"
import { Star, ExternalLink, Zap, TrendingUp, Crown, GitFork, Target } from "lucide-react"
import { cn } from "@/utils/cn"

type Props = {
  hit: _Hit
  view: string
  density: number
  query?: string
}

function Highlight({ text, word }: { text: string; word?: string }) {
  return word ? (
    <span
      dangerouslySetInnerHTML={{
        __html: text.replace(new RegExp(word, "gi"), (match) => {
          return `<mark class="bg-purple-500/20 text-purple-300 px-1 rounded">${match}</mark>`
        }),
      }}
    />
  ) : (
    <span>{text}</span>
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

function getMarketPositionColor(position: string) {
  switch (position.toLowerCase()) {
    case "established":
      return "text-green-400"
    case "emerging":
      return "text-yellow-400"
    default:
      return "text-gray-400"
  }
}

export default function Hit({ hit, view, density, query }: Props) {
  const pricingBadge = getPricingBadge(hit.pricing_category)
  const isCompact = density >= 6

  return view === "grid" ? (
    <article className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-purple-500/50 hover:bg-gray-900/80 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer overflow-hidden">
      {/* Market Position Indicator */}
      {hit.market_position && !isCompact && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              hit.market_position.toLowerCase() === "established" ? "bg-green-400" : "bg-yellow-400",
            )}
          ></div>
        </div>
      )}

      {/* Featured Badge for high popularity */}
      {hit.popularity > 10000 && !isCompact && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>Popular</span>
          </div>
        </div>
      )}

      <div className={cn("p-4", isCompact ? "p-3" : "p-6")}>
        {/* Tool Icon/Image */}
        <div
          className={cn(
            "relative mx-auto mb-3 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30",
            isCompact ? "w-12 h-12 mb-2" : "w-16 h-16 mb-4",
          )}
        >
          {hit.image_url ? (
            <img src={hit.image_url || "/placeholder.svg"} alt={hit.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className={cn("text-purple-400", isCompact ? "w-6 h-6" : "w-8 h-8")} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <div>
            <h3
              className={cn(
                "font-semibold text-gray-100 group-hover:text-purple-300 transition-colors line-clamp-1",
                isCompact ? "text-sm" : "text-lg",
              )}
            >
              <Highlight text={hit.name} word={query} />
            </h3>
            {!isCompact && (
              <p className="text-sm text-purple-400 font-medium line-clamp-1">
                <Highlight text={hit.author} word={query} />
              </p>
            )}
          </div>

          {!isCompact && (
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {hit.short_description || hit.description}
            </p>
          )}

          {/* Stats */}
          <div
            className={cn(
              "flex items-center justify-center text-xs text-gray-500",
              isCompact ? "space-x-2" : "space-x-4",
            )}
          >
            {hit.raw_metadata.stars > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{hit.raw_metadata.stars.toLocaleString()}</span>
              </div>
            )}
            {!isCompact && hit.raw_metadata.forks > 0 && (
              <div className="flex items-center space-x-1">
                <GitFork className="w-3 h-3" />
                <span>{hit.raw_metadata.forks.toLocaleString()}</span>
              </div>
            )}
            {!isCompact && hit.popularity > 0 && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{hit.popularity.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Pricing & Tool Type */}
          <div className="flex items-center justify-center space-x-2">
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", pricingBadge.color)}>
              {pricingBadge.text}
            </span>
            {!isCompact && (
              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md">{hit.tool_type}</span>
            )}
          </div>

          {/* Categories - Only show in non-compact mode */}
          {!isCompact && (
            <div className="flex flex-wrap gap-1 justify-center">
              {hit.categories?.slice(0, 2).map((category, index) => (
                <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md">
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Action Button - Only in non-compact mode */}
          {!isCompact && (
            <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 group">
              <span>Explore Tool</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </article>
  ) : view === "list" ? (
    <article className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tool Icon */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            {hit.image_url ? (
              <img src={hit.image_url || "/placeholder.svg"} alt={hit.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-purple-400" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-100 group-hover:text-purple-300 transition-colors">
                <Highlight text={hit.name} word={query} />
              </h3>
              <p className="text-purple-400 font-medium">
                <Highlight text={hit.author} word={query} />
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn("text-xs", getMarketPositionColor(hit.market_position))}>
                  {hit.market_position}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-500">{hit.creation_year}</span>
              </div>
            </div>
            {hit.popularity > 10000 && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>Popular</span>
              </div>
            )}
          </div>

          <p className="text-gray-400 leading-relaxed">{hit.short_description || hit.description}</p>

          {/* Enhanced Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            {hit.raw_metadata.stars > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{hit.raw_metadata.stars.toLocaleString()} stars</span>
              </div>
            )}
            {hit.raw_metadata.forks > 0 && (
              <div className="flex items-center space-x-1">
                <GitFork className="w-4 h-4" />
                <span>{hit.raw_metadata.forks.toLocaleString()} forks</span>
              </div>
            )}
            {hit.popularity > 0 && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>{hit.popularity.toLocaleString()} popularity</span>
              </div>
            )}
          </div>

          {/* Key Features */}
          {hit.key_features && hit.key_features.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-300">Key Features:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                {hit.key_features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={cn("px-3 py-1 rounded-full text-sm font-medium border", pricingBadge.color)}>
                {pricingBadge.text}
              </span>
              <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg">{hit.tool_type}</span>
              <span className="text-xs text-gray-500">{hit.license}</span>
            </div>

            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-6 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 group">
              <span>Explore Tool</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Categories & Target Audience */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {hit.categories?.slice(0, 4).map((category, index) => (
                <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg">
                  {category}
                </span>
              ))}
            </div>
            {hit.target_audience && hit.target_audience.length > 0 && (
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">For: {hit.target_audience.slice(0, 3).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  ) : null
}

export function HitSkeleton({ view, density }: { view: string; density: number }) {
  const isCompact = density >= 6

  return view === "grid" ? (
    <article className="bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse overflow-hidden">
      <div className={cn("p-4", isCompact ? "p-3" : "p-6")}>
        <div
          className={cn("mx-auto mb-3 bg-gray-800 rounded-2xl", isCompact ? "w-12 h-12 mb-2" : "w-16 h-16 mb-4")}
        ></div>
        <div className="space-y-2">
          <div className={cn("h-4 bg-gray-800 rounded mx-auto", isCompact ? "w-3/4" : "w-3/4")}></div>
          {!isCompact && <div className="h-3 bg-gray-800 rounded mx-auto w-1/2"></div>}
          {!isCompact && (
            <>
              <div className="h-3 bg-gray-800 rounded mx-auto w-full"></div>
              <div className="h-3 bg-gray-800 rounded mx-auto w-2/3"></div>
              <div className="h-8 bg-gray-800 rounded mx-auto w-full mt-4"></div>
            </>
          )}
        </div>
      </div>
    </article>
  ) : (
    <article className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 animate-pulse">
      <div className="flex gap-6">
        <div className="w-20 h-20 bg-gray-800 rounded-2xl flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-10 bg-gray-800 rounded w-32 ml-auto"></div>
        </div>
      </div>
    </article>
  )
}
