// utility/resourcePreloader.js
export class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set()
    this.preloadQueue = []
    this.isProcessing = false
  }

  // Preload critical images for LCP
  preloadImage(src, priority = 'high') {
    if (!src || this.preloadedResources.has(src)) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Set priority attributes if supported
      if (priority === 'high') {
        img.fetchPriority = 'high'
        img.loading = 'eager'
      }

      img.onload = () => {
        this.preloadedResources.add(src)
        performance.mark(`preload-image-${src.split('/').pop()}`)
        resolve(img)
      }

      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`)
        reject(new Error(`Failed to preload image: ${src}`))
      }

      img.src = src
    })
  }

  // Preload multiple images with priority queue
  async preloadImages(imageUrls, options = {}) {
    const { priority = 'high', concurrent = 3 } = options
    
    const preloadPromises = imageUrls
      .filter(url => url && !this.preloadedResources.has(url))
      .slice(0, concurrent) // Limit concurrent requests
      .map(url => this.preloadImage(url, priority))

    try {
      await Promise.allSettled(preloadPromises)
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }
  }

  // Preload CSS for route
  preloadCSS(href) {
    if (!href || this.preloadedResources.has(href)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.onload = () => {
      this.preloadedResources.add(href)
      // Convert to actual stylesheet
      link.rel = 'stylesheet'
    }
    
    document.head.appendChild(link)
  }

  // Preload JavaScript modules
  preloadModule(src) {
    if (!src || this.preloadedResources.has(src)) return

    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = src
    link.onload = () => {
      this.preloadedResources.add(src)
    }
    
    document.head.appendChild(link)
  }

  // Smart preloading based on user behavior
  preloadOnHover(element, resourceUrl, type = 'image') {
    if (!element || !resourceUrl) return

    let timeoutId
    const preloadResource = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        switch (type) {
          case 'image':
            this.preloadImage(resourceUrl, 'low')
            break
          case 'css':
            this.preloadCSS(resourceUrl)
            break
          case 'module':
            this.preloadModule(resourceUrl)
            break
        }
      }, 100) // Small delay to avoid unnecessary preloads
    }

    element.addEventListener('mouseenter', preloadResource)
    element.addEventListener('focus', preloadResource)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      element.removeEventListener('mouseenter', preloadResource)
      element.removeEventListener('focus', preloadResource)
    }
  }

  // Preload next page resources
  preloadNextPageImages(movies, count = 5) {
    if (!movies || movies.length === 0) return

    const imageUrls = movies
      .slice(0, count)
      .map(movie => this.getOptimizedImageUrl(movie.thumb_url))
      .filter(Boolean)

    this.preloadImages(imageUrls, { priority: 'low', concurrent: 2 })
  }

  // Get optimized image URL (same logic as in components)
  getOptimizedImageUrl(posterUrl) {
    if (!posterUrl) return ''
    
    let originalUrl
    if (posterUrl.startsWith("http") || posterUrl.startsWith("//")) {
      originalUrl = posterUrl
    } else {
      originalUrl = `https://phimimg.com/${posterUrl}`
    }
    
    return originalUrl.replace("https://phimimg.com/upload/vod/", "https://ik.imagekit.io/yuki/")
  }

  // Clear preloaded resources (for memory management)
  clearCache() {
    this.preloadedResources.clear()
  }

  // Get preload stats
  getStats() {
    return {
      preloadedCount: this.preloadedResources.size,
      preloadedResources: Array.from(this.preloadedResources)
    }
  }
}

// Global instance
export const resourcePreloader = new ResourcePreloader()

// Auto-preload critical resources based on route
export function autoPreloadForRoute(routeName, data = {}) {
  switch (routeName) {
    case 'HomePage':
      // Preload carousel images
      if (data.featuredMovies && data.featuredMovies.length > 0) {
        const firstImage = resourcePreloader.getOptimizedImageUrl(data.featuredMovies[0].thumb_url)
        if (firstImage) {
          resourcePreloader.preloadImage(firstImage, 'high')
        }
      }
      break
      
    case 'AnimePage':
    case 'CategoryPage':
      // Preload first few movie card images
      if (data.movies && data.movies.length > 0) {
        resourcePreloader.preloadNextPageImages(data.movies, 4)
      }
      break
      
    case 'MovieDetailPage':
      // Preload movie poster and backdrop
      if (data.movie) {
        const posterUrl = resourcePreloader.getOptimizedImageUrl(data.movie.thumb_url)
        const backdropUrl = resourcePreloader.getOptimizedImageUrl(data.movie.poster_url)
        
        Promise.allSettled([
          resourcePreloader.preloadImage(posterUrl, 'high'),
          resourcePreloader.preloadImage(backdropUrl, 'medium')
        ])
      }
      break
  }
}
