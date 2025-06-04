import { type NextRequest, NextResponse } from "next/server"
import { getResults } from "@/lib/search"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const props = {
    query: searchParams.get("query") || undefined,
    categories: searchParams.getAll("categories"),
    brand: searchParams.getAll("brand"),
    type: searchParams.getAll("type"),
    price_range: searchParams.getAll("price_range"),
    rating: searchParams.getAll("rating").map(Number),
    sort: searchParams.get("sort") || undefined,
    page: Number(searchParams.get("page")) || 1,
    size: Number(searchParams.get("size")) || 24,
  }

  try {
    const results = await getResults(props)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 })
  }
}
