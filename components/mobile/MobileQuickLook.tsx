"use client"

import { useEffect } from "react"
import { X, ExternalLink, Star, TrendingUp, GitFork, Calendar, Tag, Target } from "lucide-react"
import { cn } from "@/utils/cn"
import type { Hit } from "@/lib/search"
import { Button } from "@/components/ui/button"

type Props = {
  isOpen: boolean
  onClose: () => void
  tool: Hit | null
}

export default function MobileQuickLook({ isOpen, onClose, tool }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen || !tool) return null

  const pricingColor =
    {
      free: "bg-green-500/20 text-green-400 border-green-500/30",
      freemium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      paid: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    }[tool.pricing_category.toLowerCase()] || "bg-gray-500/20 text-gray-400 border-gray-500/30"

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute inset-x-0 bottom-0 bg-gray-950 border-t border-gray-800 rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              {tool.image_url ? (
                <img
                  src={tool.image_url || "/placeholder.svg"}
                  alt={tool.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-400" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100 line-clamp-1">{tool.name}</h2>
              <p className="text-sm text-purple-400">{tool.author}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-200">About</h3>
            <p className="text-gray-400 leading-relaxed">{tool.summary || tool.description}</p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800/50">
              <div className="flex items-center space-x-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Stars</span>
              </div>
              <div className="text-lg font-semibold text-gray-200">{tool.raw_metadata.stars.toLocaleString()}</div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800/50">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Popularity</span>
              </div>
              <div className="text-lg font-semibold text-gray-200">{tool.popularity.toLocaleString()}</div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800/50">
              <div className="flex items-center space-x-2 mb-1">
                <GitFork className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Forks</span>
              </div>
              <div className="text-lg font-semibold text-gray-200">{tool.raw_metadata.forks.toLocaleString()}</div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800/50">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Created</span>
              </div>
              <div className="text-lg font-semibold text-gray-200">{tool.creation_year}</div>
            </div>
          </div>

          {/* Key Features */}
          {tool.key_features && tool.key_features.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-200">Key Features</h3>
              <div className="space-y-2">
                {tool.key_features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-200">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {tool.categories?.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg border border-gray-700"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          {tool.target_audience && tool.target_audience.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-200 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Target Audience</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {tool.target_audience.map((audience, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg border border-blue-500/30"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & License */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-300">Pricing</h4>
              <span className={cn("px-3 py-2 rounded-lg text-sm font-medium border inline-block", pricingColor)}>
                {tool.pricing_category}
              </span>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-300">License</h4>
              <span className="px-3 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg border border-gray-700 inline-block">
                {tool.license}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 space-y-3">
          <Button
            onClick={() => window.open(tool.source, "_blank")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit Website</span>
          </Button>

          {tool.repository && (
            <Button
              onClick={() => window.open(tool.repository!, "_blank")}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
            >
              <GitFork className="w-4 h-4" />
              <span>View Repository</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
