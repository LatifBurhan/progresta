/**
 * Simple localStorage cache utility
 * No dependencies, no complex hooks
 */

const CACHE_PREFIX = 'dashboard_cache_'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch (error) {
    console.error('Failed to set cache:', error)
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key)
    if (!item) return null

    const entry: CacheEntry<T> = JSON.parse(item)
    const now = Date.now()

    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }

    return entry.data
  } catch (error) {
    console.error('Failed to get cache:', error)
    return null
  }
}

export function clearCache(key?: string): void {
  try {
    if (key) {
      localStorage.removeItem(CACHE_PREFIX + key)
    } else {
      // Clear all dashboard caches
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k)
        }
      })
    }
  } catch (error) {
    console.error('Failed to clear cache:', error)
  }
}
