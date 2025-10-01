// utility/performanceMonitor.js
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
    this.isSupported = typeof window !== 'undefined' && 'performance' in window
  }

  // Monitor LCP (Largest Contentful Paint)
  observeLCP(callback) {
    if (!this.isSupported) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (lastEntry) {
          const lcpTime = lastEntry.startTime
          this.metrics.set('lcp', lcpTime)
          
          if (callback) {
            callback({
              value: lcpTime,
              element: lastEntry.element,
              url: lastEntry.url
            })
          }

          // Log LCP performance
          console.log(`🎯 LCP: ${lcpTime.toFixed(2)}ms`, {
            element: lastEntry.element,
            url: lastEntry.url
          })
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', observer)
    } catch (error) {
      console.warn('LCP observer not supported:', error)
    }
  }

  // Monitor FID (First Input Delay)
  observeFID(callback) {
    if (!this.isSupported) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          const fidTime = entry.processingStart - entry.startTime
          this.metrics.set('fid', fidTime)
          
          if (callback) {
            callback({
              value: fidTime,
              name: entry.name
            })
          }

          console.log(`⚡ FID: ${fidTime.toFixed(2)}ms`)
        })
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', observer)
    } catch (error) {
      console.warn('FID observer not supported:', error)
    }
  }

  // Monitor CLS (Cumulative Layout Shift)
  observeCLS(callback) {
    if (!this.isSupported) return

    try {
      let clsValue = 0
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.metrics.set('cls', clsValue)
            
            if (callback) {
              callback({
                value: clsValue,
                entries: entry.sources
              })
            }

            console.log(`📐 CLS: ${clsValue.toFixed(4)}`)
          }
        })
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('cls', observer)
    } catch (error) {
      console.warn('CLS observer not supported:', error)
    }
  }

  // Monitor custom marks and measures
  markEvent(name) {
    if (!this.isSupported) return

    try {
      performance.mark(name)
      console.log(`📍 Mark: ${name}`)
    } catch (error) {
      console.warn('Performance mark failed:', error)
    }
  }

  measureEvent(name, startMark, endMark) {
    if (!this.isSupported) return

    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name, 'measure')[0]
      
      if (measure) {
        console.log(`⏱️ Measure ${name}: ${measure.duration.toFixed(2)}ms`)
        return measure.duration
      }
    } catch (error) {
      console.warn('Performance measure failed:', error)
    }
  }

  // Get navigation timing
  getNavigationTiming() {
    if (!this.isSupported) return null

    try {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstByte: navigation.responseStart - navigation.requestStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart
        }
      }
    } catch (error) {
      console.warn('Navigation timing failed:', error)
    }
    return null
  }

  // Get resource timing for images
  getImageLoadTiming(imageUrl) {
    if (!this.isSupported) return null

    try {
      const resources = performance.getEntriesByType('resource')
      const imageResource = resources.find(resource => 
        resource.name.includes(imageUrl) || imageUrl.includes(resource.name)
      )

      if (imageResource) {
        return {
          duration: imageResource.duration,
          size: imageResource.transferSize,
          cached: imageResource.transferSize === 0
        }
      }
    } catch (error) {
      console.warn('Image timing failed:', error)
    }
    return null
  }

  // Get all metrics
  getAllMetrics() {
    const metrics = Object.fromEntries(this.metrics)
    const navigation = this.getNavigationTiming()
    
    return {
      coreWebVitals: metrics,
      navigation,
      timestamp: Date.now()
    }
  }

  // Start monitoring all core web vitals
  startMonitoring(options = {}) {
    const { 
      onLCP, 
      onFID, 
      onCLS,
      logToConsole = true 
    } = options

    if (logToConsole) {
      console.log('🚀 Performance monitoring started')
    }

    this.observeLCP(onLCP)
    this.observeFID(onFID)
    this.observeCLS(onCLS)

    // Mark monitoring start
    this.markEvent('performance-monitoring-start')
  }

  // Stop all observers
  stopMonitoring() {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers.clear()
    console.log('⏹️ Performance monitoring stopped')
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getAllMetrics()
    const report = {
      ...metrics,
      recommendations: this.getRecommendations(metrics.coreWebVitals)
    }

    console.log('📊 Performance Report:', report)
    return report
  }

  // Get performance recommendations
  getRecommendations(metrics) {
    const recommendations = []

    if (metrics.lcp > 2500) {
      recommendations.push('LCP is slow. Consider optimizing images and preloading critical resources.')
    }

    if (metrics.fid > 100) {
      recommendations.push('FID is slow. Consider reducing JavaScript execution time.')
    }

    if (metrics.cls > 0.1) {
      recommendations.push('CLS is high. Ensure elements have defined dimensions to prevent layout shifts.')
    }

    return recommendations
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring({
    logToConsole: true
  })
}
