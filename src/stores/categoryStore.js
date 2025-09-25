import { defineStore } from 'pinia'

const CACHE_KEY = 'categories_cache'
const CACHE_TIME_KEY = 'categories_cache_time'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
    lastFetched: null, // Thời gian fetch lần cuối
    cacheExpiry: 30 * 60 * 1000, // Cache 30 phút (30 * 60 * 1000 ms)
  }),

  getters: {
    // Kiểm tra có thể loại hay không
    hasCategories: (state) => state.categories.length > 0,
    
    // Lấy thể loại theo slug
    getCategoryBySlug: (state) => (slug) => {
      return state.categories.find(category => category.slug === slug)
    },
    
    // Lấy danh sách thể loại phổ biến (có thể customize sau)
    popularCategories: (state) => {
      const popularSlugs = ['hanh-dong', 'hai-huoc', 'tinh-cam', 'kinh-di', 'phieu-luu', 'vo-thuat']
      return state.categories.filter(category => popularSlugs.includes(category.slug))
    },

    // Kiểm tra cache có còn hợp lệ không
    isCacheValid: (state) => {
      if (!state.lastFetched) {
        // Kiểm tra localStorage cache
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cachedTime) {
          const now = Date.now()
          return (now - parseInt(cachedTime)) < state.cacheExpiry
        }
        return false
      }
      const now = Date.now()
      return (now - state.lastFetched) < state.cacheExpiry
    },

    // Kiểm tra có cần fetch lại không
    shouldFetch: (state) => {
      return !state.hasCategories || !state.isCacheValid
    }
  },

  actions: {
    // Load cache từ localStorage
    loadFromCache() {
      try {
        const cachedCategories = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        
        if (cachedCategories && cachedTime) {
          const now = Date.now()
          const cacheAge = now - parseInt(cachedTime)
          
          if (cacheAge < this.cacheExpiry) {
            this.categories = JSON.parse(cachedCategories)
            this.lastFetched = parseInt(cachedTime)
            console.log('Categories loaded from localStorage cache')
            return true
          } else {
            // Cache hết hạn, xóa đi
            this.clearLocalStorageCache()
          }
        }
      } catch (error) {
        console.error('Error loading categories from cache:', error)
        this.clearLocalStorageCache()
      }
      return false
    },

    // Lưu cache vào localStorage
    saveToCache() {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.categories))
        localStorage.setItem(CACHE_TIME_KEY, this.lastFetched.toString())
      } catch (error) {
        console.error('Error saving categories to cache:', error)
      }
    },

    // Xóa localStorage cache
    clearLocalStorageCache() {
      try {
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(CACHE_TIME_KEY)
      } catch (error) {
        console.error('Error clearing localStorage cache:', error)
      }
    },

    async fetchCategories(forceRefresh = false) {
      // Load từ localStorage cache nếu chưa có data
      if (!this.hasCategories && !forceRefresh) {
        this.loadFromCache()
      }

      // Nếu không force refresh và cache còn hợp lệ thì không fetch
      if (!forceRefresh && this.hasCategories && this.isCacheValid) {
        console.log('Categories loaded from memory cache')
        return this.categories
      }

      // Nếu đang loading thì không fetch nữa
      if (this.loading) {
        console.log('Categories already loading, skipping...')
        return this.categories
      }

      this.loading = true
      this.error = null
      
      try {
        console.log('Fetching categories from API...')
        const response = await fetch('https://phimapi.com/the-loai')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Categories API Response:', data)
        
        // API trả về trực tiếp một array các thể loại
        if (Array.isArray(data)) {
          this.categories = data
          this.lastFetched = Date.now() // Lưu thời gian fetch
          this.saveToCache() // Lưu vào localStorage
          console.log('Categories loaded from API:', this.categories.length)
        } else if (data.status && data.data && Array.isArray(data.data)) {
          // Fallback cho trường hợp API có wrapper
          this.categories = data.data
          this.lastFetched = Date.now() // Lưu thời gian fetch
          this.saveToCache() // Lưu vào localStorage
          console.log('Categories loaded from API:', this.categories.length)
        } else {
          console.error('Unexpected categories data structure:', data)
          throw new Error('Invalid categories data structure')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching categories:', error)
      } finally {
        this.loading = false
      }

      return this.categories
    },

    // Method để force refresh cache
    async refreshCategories() {
      return await this.fetchCategories(true)
    },

    // Method để clear cache
    clearCache() {
      this.lastFetched = null
      this.clearLocalStorageCache()
      console.log('Categories cache cleared')
    },

    // Reset store
    resetStore() {
      this.categories = []
      this.loading = false
      this.error = null
      this.lastFetched = null
      this.clearLocalStorageCache()
    }
  }
})
