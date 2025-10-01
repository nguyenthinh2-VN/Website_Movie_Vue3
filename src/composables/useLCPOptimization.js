// composables/useLCPOptimization.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useLCPOptimization() {
  const intersectionObserver = ref(null)
  const lcpElementsLoaded = ref(new Set())

  // Tự động tìm và tối ưu phần tử LCP đầu tiên trên page
  const optimizeFirstLCPElement = () => {
    // Thứ tự ưu tiên tìm LCP elements
    const lcpSelectors = [
      'img[src]:not([loading="lazy"]):first-of-type',
      '.hero-section img:first-of-type',
      '.banner img:first-of-type', 
      '.carousel img:first-of-type',
      '.movie-card-new img:first-of-type',
      '.slide-background:first-of-type',
      'video[poster]:first-of-type'
    ]

    for (const selector of lcpSelectors) {
      const element = document.querySelector(selector)
      if (element && !lcpElementsLoaded.value.has(selector)) {
        optimizeLCPElement(element)
        lcpElementsLoaded.value.add(selector)
        break // Chỉ tối ưu element đầu tiên tìm thấy
      }
    }
  }

  // Tối ưu một element cụ thể cho LCP
  const optimizeLCPElement = (element) => {
    if (!element) return

    // Set high priority attributes
    if (element.tagName === 'IMG') {
      element.setAttribute('fetchpriority', 'high')
      element.setAttribute('loading', 'eager')
      
      // Add performance mark when loaded
      element.addEventListener('load', () => {
        if (typeof window !== 'undefined' && window.performance) {
          performance.mark('lcp-element-loaded')
        }
      }, { once: true })
    }

    // For background images
    if (element.style.backgroundImage || getComputedStyle(element).backgroundImage !== 'none') {
      element.style.willChange = 'transform'
      
      // Preload background image
      const bgImage = getComputedStyle(element).backgroundImage
      const imageUrl = bgImage.slice(4, -1).replace(/["']/g, "")
      
      if (imageUrl && imageUrl !== 'none') {
        const img = new Image()
        img.onload = () => {
          if (typeof window !== 'undefined' && window.performance) {
            performance.mark('lcp-bg-image-loaded')
          }
        }
        img.src = imageUrl
      }
    }
  }

  // Setup Intersection Observer để lazy load các elements khác
  const setupLazyLoading = (elements, callback) => {
    if (intersectionObserver.value) return

    intersectionObserver.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry.target)
            intersectionObserver.value.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.1,
      }
    )

    elements.forEach(element => {
      if (element) {
        intersectionObserver.value.observe(element)
      }
    })
  }

  // Cleanup function
  const cleanup = () => {
    if (intersectionObserver.value) {
      intersectionObserver.value.disconnect()
      intersectionObserver.value = null
    }
    lcpElementsLoaded.value.clear()
  }

  // Auto-initialize on mount
  onMounted(() => {
    // Delay để đảm bảo DOM đã render
    setTimeout(optimizeFirstLCPElement, 100)
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    optimizeFirstLCPElement,
    optimizeLCPElement,
    setupLazyLoading,
    cleanup,
    lcpElementsLoaded: lcpElementsLoaded.value
  }
}
