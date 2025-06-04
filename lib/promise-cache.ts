"use client"

// Promise cache implementation to prevent uncached promise errors
class PromiseCache {
  private cache = new Map<string, Promise<any>>()
  private results = new Map<string, any>()
  private errors = new Map<string, Error>()

  private generateKey(url: string, options?: RequestInit): string {
    return `${url}:${JSON.stringify(options || {})}`
  }

  async fetch(url: string, options?: RequestInit): Promise<any> {
    const key = this.generateKey(url, options)

    // Return cached error if exists
    if (this.errors.has(key)) {
      throw this.errors.get(key)
    }

    // Return cached result if exists
    if (this.results.has(key)) {
      return this.results.get(key)
    }

    // Return existing promise if in flight
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    // Create and cache new promise
    const promise = this.executeRequest(url, options)
    this.cache.set(key, promise)

    try {
      const result = await promise
      this.results.set(key, result)
      this.cache.delete(key)
      return result
    } catch (error) {
      this.errors.set(key, error as Error)
      this.cache.delete(key)
      throw error
    }
  }

  private async executeRequest(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
          this.results.delete(key)
          this.errors.delete(key)
        }
      }
    } else {
      this.cache.clear()
      this.results.clear()
      this.errors.clear()
    }
  }

  preload(url: string, options?: RequestInit): void {
    // Start loading without waiting for result
    this.fetch(url, options).catch(() => {
      // Ignore preload errors
    })
  }
}

// Global cache instance
export const promiseCache = new PromiseCache()
