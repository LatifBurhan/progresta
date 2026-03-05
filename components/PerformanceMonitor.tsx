'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PerformanceMonitor() {
  const pathname = usePathname()

  useEffect(() => {
    // Report Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            console.log('⚡ Navigation Performance:', {
              page: pathname,
              loadTime: Math.round(navEntry.loadEventEnd - navEntry.fetchStart),
              domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.fetchStart),
              firstPaint: Math.round(navEntry.responseEnd - navEntry.fetchStart),
            })
          }
        }
      })

      observer.observe({ entryTypes: ['navigation'] })

      return () => observer.disconnect()
    }
  }, [pathname])

  return null
}
