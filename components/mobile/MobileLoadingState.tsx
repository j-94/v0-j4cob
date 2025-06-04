"use client"

export default function MobileLoadingState() {
  return (
    <div className="mx-4 mb-3 bg-gray-900/50 border border-gray-800/50 rounded-2xl p-4 animate-pulse">
      <div className="flex space-x-4">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}
