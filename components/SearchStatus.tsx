import { Search, Loader2 } from "lucide-react"

export default function SearchStatus({ searching }: { searching: boolean }) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2">
      {searching ? (
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
      ) : (
        <Search className="w-5 h-5 text-gray-400" />
      )}
    </div>
  )
}
