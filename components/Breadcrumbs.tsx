import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export default function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ul className="flex items-center space-x-2 text-sm text-gray-400">
        <li className="flex items-center">
          <Link href="/" className="flex items-center space-x-1 hover:text-purple-400 transition-colors">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </li>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <li className="text-purple-400 font-medium">AI Tools Directory</li>
      </ul>
    </nav>
  )
}
