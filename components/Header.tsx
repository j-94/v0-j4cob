import { Suspense } from "react"
import Link from "next/link"
import SearchForm, { SearchFormSkeleton } from "./SearchForm"
import { Sparkles, Github, Twitter, Menu } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex flex-wrap items-center justify-between px-4 py-4 md:space-x-6 xl:px-16">
        <Link href="/" className="order-2 sm:order-1 flex items-center space-x-3" title="j4cob">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              j4cob
            </span>
            <span className="text-xs text-gray-400 -mt-1">AI Tools Directory</span>
          </div>
        </Link>

        <Suspense
          fallback={
            <SearchFormSkeleton
              classNames={{
                root: "order-4 sm:order-2 mt-4 sm:mt-0 relative flex w-full flex-col min-h-12 gap-1 sm:w-fit",
                label: "hidden font-semibold uppercase",
                input: "w-full h-12 pl-12 pr-4 sm:w-96 md:w-[500px] bg-gray-900/50 border border-gray-700 rounded-xl",
              }}
            />
          }
        >
          <SearchForm
            classNames={{
              root: "order-4 sm:order-2 mt-4 sm:mt-0 relative flex w-full flex-col min-h-12 gap-1 sm:w-fit",
              label: "hidden font-semibold uppercase",
              input:
                "w-full h-12 pl-12 pr-4 sm:w-96 md:w-[500px] bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all",
            }}
          />
        </Suspense>

        <div className="order-3 flex items-center space-x-4">
          <Link
            href="https://github.com"
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            title="GitHub"
          >
            <Github className="w-5 h-5" />
          </Link>
          <Link
            href="https://twitter.com"
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            title="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </Link>
          <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors md:hidden">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
