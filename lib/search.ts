import { unstable_cache } from "next/cache"

export type Hit = {
  id: number
  name: string
  description: string
  short_description?: string
  creation_date: string
  creation_year: number
  last_updated: string
  categories: string[]
  image_url?: string | null
  author: string
  source: string
  popularity: number
  license: string
  repository?: string | null
  raw_metadata: {
    stars: number
    forks: number
    followers: number
  }
  key_features: string[]
  primary_use_cases: string[]
  refined_tags: string[]
  summary: string
  target_audience: string[]
  market_position: string
  tool_type: string
  pricing_category: string
  resolve_group: number
  _counts_prereduce_merge_duplicate_tool_entries: number
}

export type SearchProps = {
  query?: string
  categories?: string[]
  brand?: string[]
  type?: string[]
  price_range?: string[]
  rating?: number[]
  sort?: string
  page?: number
  size?: number
}

export type FacetValue = {
  value: string
  count: number
  highlighted?: string
}

export type Facet = {
  attribute: string
  values: FacetValue[]
}

// Use the local dataset as fallback
const fallbackData: Hit[] = [
  {
    id: 1,
    name: "ChatGPT",
    description: "Advanced conversational AI assistant powered by OpenAI's GPT models.",
    short_description: "AI-powered conversational assistant for various tasks.",
    creation_date: "2022-11-30",
    creation_year: 2022,
    last_updated: "2024-01-01",
    categories: ["Chat & Text", "AI Assistant"],
    image_url: null,
    author: "OpenAI",
    source: "https://chat.openai.com",
    popularity: 50000,
    license: "Proprietary",
    repository: null,
    raw_metadata: {
      stars: 0,
      forks: 0,
      followers: 1000000,
    },
    key_features: ["Natural conversation", "Code generation", "Text analysis", "Creative writing"],
    primary_use_cases: ["Customer support", "Content creation", "Programming help"],
    refined_tags: ["ai", "chat", "gpt", "openai"],
    summary:
      "ChatGPT is an advanced AI assistant that can help with a wide variety of tasks through natural conversation.",
    target_audience: ["Professionals", "Students", "Developers"],
    market_position: "Established",
    tool_type: "Chat AI",
    pricing_category: "Freemium",
    resolve_group: 1,
    _counts_prereduce_merge_duplicate_tool_entries: 1,
  },
  {
    id: 2,
    name: "DALL-E 3",
    description: "Advanced AI image generation model that creates detailed images from text descriptions.",
    short_description: "AI image generator from text prompts.",
    creation_date: "2023-10-01",
    creation_year: 2023,
    last_updated: "2024-01-01",
    categories: ["Image Generation", "Art"],
    image_url: null,
    author: "OpenAI",
    source: "https://openai.com/dall-e-3",
    popularity: 35000,
    license: "Proprietary",
    repository: null,
    raw_metadata: {
      stars: 0,
      forks: 0,
      followers: 500000,
    },
    key_features: ["Text-to-image generation", "High resolution output", "Style control", "Safety filters"],
    primary_use_cases: ["Digital art", "Marketing materials", "Concept visualization"],
    refined_tags: ["ai", "image", "generation", "dall-e"],
    summary: "DALL-E 3 generates high-quality images from text descriptions with improved accuracy and detail.",
    target_audience: ["Artists", "Designers", "Marketers"],
    market_position: "Established",
    tool_type: "Image AI",
    pricing_category: "Paid",
    resolve_group: 2,
    _counts_prereduce_merge_duplicate_tool_entries: 1,
  },
  {
    id: 3,
    name: "GitHub Copilot",
    description: "AI-powered code completion and programming assistant integrated into development environments.",
    short_description: "AI coding assistant for developers.",
    creation_date: "2021-06-29",
    creation_year: 2021,
    last_updated: "2024-01-01",
    categories: ["Code Assistant", "Development"],
    image_url: null,
    author: "GitHub",
    source: "https://github.com/features/copilot",
    popularity: 40000,
    license: "Proprietary",
    repository: null,
    raw_metadata: {
      stars: 0,
      forks: 0,
      followers: 750000,
    },
    key_features: ["Code completion", "Function generation", "Comment-to-code", "Multi-language support"],
    primary_use_cases: ["Software development", "Code review", "Learning programming"],
    refined_tags: ["ai", "code", "programming", "github"],
    summary: "GitHub Copilot helps developers write code faster with AI-powered suggestions and completions.",
    target_audience: ["Developers", "Engineers", "Students"],
    market_position: "Established",
    tool_type: "Code AI",
    pricing_category: "Paid",
    resolve_group: 3,
    _counts_prereduce_merge_duplicate_tool_entries: 1,
  },
  {
    id: 4,
    name: "Midjourney",
    description: "AI art generator that creates stunning images from text prompts through Discord bot interface.",
    short_description: "Discord-based AI art generation tool.",
    creation_date: "2022-07-12",
    creation_year: 2022,
    last_updated: "2024-01-01",
    categories: ["Image Generation", "Art"],
    image_url: null,
    author: "Midjourney Inc.",
    source: "https://midjourney.com",
    popularity: 30000,
    license: "Proprietary",
    repository: null,
    raw_metadata: {
      stars: 0,
      forks: 0,
      followers: 400000,
    },
    key_features: ["Artistic image generation", "Style variations", "Upscaling", "Community gallery"],
    primary_use_cases: ["Digital art", "Concept art", "Creative projects"],
    refined_tags: ["ai", "art", "midjourney", "discord"],
    summary:
      "Midjourney creates beautiful, artistic images from text descriptions with a focus on creative and stylistic output.",
    target_audience: ["Artists", "Designers", "Creatives"],
    market_position: "Established",
    tool_type: "Image AI",
    pricing_category: "Paid",
    resolve_group: 4,
    _counts_prereduce_merge_duplicate_tool_entries: 1,
  },
  {
    id: 5,
    name: "Stable Diffusion",
    description: "Open-source text-to-image AI model that can be run locally or through various online services.",
    short_description: "Open-source AI image generation model.",
    creation_date: "2022-08-22",
    creation_year: 2022,
    last_updated: "2024-01-01",
    categories: ["Image Generation", "Open Source"],
    image_url: null,
    author: "Stability AI",
    source: "https://stability.ai/stable-diffusion",
    popularity: 25000,
    license: "Open Source",
    repository: "https://github.com/Stability-AI/stablediffusion",
    raw_metadata: {
      stars: 35000,
      forks: 5000,
      followers: 100000,
    },
    key_features: ["Local deployment", "Customizable models", "API access", "Community extensions"],
    primary_use_cases: ["Research", "Custom applications", "Art generation"],
    refined_tags: ["ai", "stable-diffusion", "open-source", "image"],
    summary:
      "Stable Diffusion is an open-source AI model for generating images from text, offering flexibility and customization.",
    target_audience: ["Developers", "Researchers", "Artists"],
    market_position: "Established",
    tool_type: "Image AI",
    pricing_category: "Free",
    resolve_group: 5,
    _counts_prereduce_merge_duplicate_tool_entries: 1,
  },
]

// Load the AI tools dataset with proper caching and error handling
const loadAIToolsData = unstable_cache(
  async (): Promise<Hit[]> => {
    try {
      const response = await fetch(
        "https://blobs.vusercontent.net/blob/ai_tools_directory_last_1000-3DCwnJTeqQCH8ElGzoWftJ0zkzbKP8.json",
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      )

      if (!response.ok) {
        console.warn("Failed to fetch AI tools data from blob, using fallback data")
        return fallbackData
      }

      const data = await response.json()

      // Validate the data structure
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("Invalid data structure from blob, using fallback data")
        return fallbackData
      }

      return data
    } catch (error) {
      console.warn("Error loading AI tools data from blob, using fallback data:", error)
      return fallbackData
    }
  },
  ["ai-tools-data"],
  {
    revalidate: 3600, // Cache for 1 hour
  },
)

// Apply filters to the dataset
function applyFilters(tools: Hit[], props: Omit<SearchProps, "sort" | "page" | "size">): Hit[] {
  let filteredTools = [...tools]

  // Apply search query filter
  if (props.query) {
    const query = props.query.toLowerCase()
    filteredTools = filteredTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.short_description?.toLowerCase().includes(query) ||
        tool.author.toLowerCase().includes(query) ||
        tool.summary.toLowerCase().includes(query) ||
        tool.categories.some((cat) => cat.toLowerCase().includes(query)) ||
        tool.refined_tags.some((tag) => tag.toLowerCase().includes(query)) ||
        tool.key_features.some((feature) => feature.toLowerCase().includes(query)) ||
        tool.primary_use_cases.some((useCase) => useCase.toLowerCase().includes(query)) ||
        tool.target_audience.some((audience) => audience.toLowerCase().includes(query)),
    )
  }

  // Apply category filter
  if (props.categories && props.categories.length > 0) {
    filteredTools = filteredTools.filter((tool) =>
      props.categories!.some(
        (category) =>
          tool.categories.some((toolCategory) => toolCategory.toLowerCase().includes(category.toLowerCase())) ||
          tool.refined_tags.some((tag) => tag.toLowerCase().includes(category.toLowerCase())),
      ),
    )
  }

  // Apply brand/author filter
  if (props.brand && props.brand.length > 0) {
    filteredTools = filteredTools.filter((tool) =>
      props.brand!.some((brand) => tool.author.toLowerCase().includes(brand.toLowerCase())),
    )
  }

  // Apply tool type filter
  if (props.type && props.type.length > 0) {
    filteredTools = filteredTools.filter((tool) =>
      props.type!.some((type) => tool.tool_type.toLowerCase().includes(type.toLowerCase())),
    )
  }

  // Apply pricing filter
  if (props.price_range && props.price_range.length > 0) {
    filteredTools = filteredTools.filter((tool) =>
      props.price_range!.some((priceRange) => tool.pricing_category.toLowerCase().includes(priceRange.toLowerCase())),
    )
  }

  // Apply rating filter (using popularity as a proxy)
  if (props.rating && props.rating.length > 0) {
    const minRating = Math.min(...props.rating)
    const maxRating = Math.max(...props.rating)

    filteredTools = filteredTools.filter((tool) => {
      const rating = Math.min(5, Math.max(1, Math.ceil((tool.popularity / 20000) * 5)))
      return rating >= minRating && rating <= maxRating
    })
  }

  return filteredTools
}

// Apply sorting to the dataset
function applySorting(tools: Hit[], sort?: string): Hit[] {
  const sortedTools = [...tools]

  if (sort) {
    switch (sort) {
      case "popularity_desc":
        sortedTools.sort((a, b) => b.popularity - a.popularity)
        break
      case "popularity_asc":
        sortedTools.sort((a, b) => a.popularity - b.popularity)
        break
      case "stars_desc":
        sortedTools.sort((a, b) => b.raw_metadata.stars - a.raw_metadata.stars)
        break
      case "stars_asc":
        sortedTools.sort((a, b) => a.raw_metadata.stars - b.raw_metadata.stars)
        break
      case "newest":
        sortedTools.sort((a, b) => b.creation_year - a.creation_year)
        break
      case "oldest":
        sortedTools.sort((a, b) => a.creation_year - b.creation_year)
        break
      case "name_asc":
        sortedTools.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        sortedTools.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        sortedTools.sort((a, b) => b.popularity - a.popularity)
    }
  } else {
    sortedTools.sort((a, b) => b.popularity - a.popularity)
  }

  return sortedTools
}

export const search = unstable_cache(
  async (props: SearchProps): Promise<{ hits: Hit[]; executionTime: number; hasMore: boolean; totalHits: number }> => {
    const startTime = Date.now()

    const allTools = await loadAIToolsData()
    const filteredTools = applyFilters(allTools, props)
    const sortedTools = applySorting(filteredTools, props.sort)

    // Apply pagination for infinite scroll
    const page = props.page || 1
    const size = props.size || 24
    const startIndex = (page - 1) * size
    const endIndex = startIndex + size
    const paginatedTools = sortedTools.slice(startIndex, endIndex)
    const hasMore = endIndex < sortedTools.length

    const executionTime = Date.now() - startTime

    return {
      hits: paginatedTools,
      executionTime,
      hasMore,
      totalHits: sortedTools.length,
    }
  },
  ["ai-tools-search"],
  {
    revalidate: 3600,
  },
)

// Get search results
export const getResults = unstable_cache(
  async (props: SearchProps): Promise<{ hits: Hit[]; executionTime: number; hasMore: boolean; totalHits: number }> => {
    return search(props)
  },
  ["ai-tools-results"],
  {
    revalidate: 3600,
  },
)

// Get search statistics
export const getStats = unstable_cache(
  async (props: Omit<SearchProps, "sort" | "page" | "size">): Promise<{ hits: Hit[]; executionTime: number }> => {
    const startTime = Date.now()

    const allTools = await loadAIToolsData()
    const filteredTools = applyFilters(allTools, props)

    const executionTime = Date.now() - startTime

    return {
      hits: filteredTools,
      executionTime,
    }
  },
  ["ai-tools-stats"],
  {
    revalidate: 3600,
  },
)

// Get facets for filtering
export const getFacets = unstable_cache(
  async (props: Omit<SearchProps, "sort" | "page" | "size">): Promise<{ facets: Facet[]; executionTime: number }> => {
    const startTime = Date.now()

    const allTools = await loadAIToolsData()
    const filteredTools = applyFilters(allTools, props)

    const facets: Facet[] = [
      {
        attribute: "categories",
        values: generateFacetValues(filteredTools, (tool) => tool.categories).slice(0, 20),
      },
      {
        attribute: "brand",
        values: generateFacetValues(filteredTools, (tool) => [tool.author]).slice(0, 20),
      },
      {
        attribute: "type",
        values: generateFacetValues(filteredTools, (tool) => [tool.tool_type]).slice(0, 20),
      },
      {
        attribute: "price_range",
        values: generateFacetValues(filteredTools, (tool) => [tool.pricing_category]),
      },
      {
        attribute: "rating",
        values: generateRatingFacets(filteredTools),
      },
    ]

    const executionTime = Date.now() - startTime

    return {
      facets,
      executionTime,
    }
  },
  ["ai-tools-facets"],
  {
    revalidate: 3600,
  },
)

// Helper function to generate facet values
function generateFacetValues(tools: Hit[], extractor: (tool: Hit) => string[]): FacetValue[] {
  const counts = new Map<string, number>()

  tools.forEach((tool) => {
    const values = extractor(tool)
    values.forEach((value) => {
      if (value && value.trim()) {
        const key = value.trim()
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    })
  })

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}

// Helper function to generate rating facets
function generateRatingFacets(tools: Hit[]): FacetValue[] {
  const ratingCounts = new Map<number, number>()

  tools.forEach((tool) => {
    const rating = Math.min(5, Math.max(1, Math.ceil((tool.popularity / 20000) * 5)))
    ratingCounts.set(rating, (ratingCounts.get(rating) || 0) + 1)
  })

  return Array.from(ratingCounts.entries())
    .map(([rating, count]) => ({ value: rating.toString(), count }))
    .sort((a, b) => Number(b.value) - Number(a.value))
}

// Helper function to get unique values for filters
export const getFilterOptions = unstable_cache(
  async () => {
    const allTools = await loadAIToolsData()

    const categories = [...new Set(allTools.flatMap((tool) => tool.categories))].sort()
    const authors = [...new Set(allTools.map((tool) => tool.author))].sort()
    const toolTypes = [...new Set(allTools.map((tool) => tool.tool_type))].sort()
    const pricingCategories = [...new Set(allTools.map((tool) => tool.pricing_category))].sort()
    const targetAudiences = [...new Set(allTools.flatMap((tool) => tool.target_audience))].sort()
    const marketPositions = [...new Set(allTools.map((tool) => tool.market_position))].sort()

    return {
      categories,
      authors,
      toolTypes,
      pricingCategories,
      targetAudiences,
      marketPositions,
      totalTools: allTools.length,
    }
  },
  ["ai-tools-filters"],
  {
    revalidate: 3600,
  },
)
