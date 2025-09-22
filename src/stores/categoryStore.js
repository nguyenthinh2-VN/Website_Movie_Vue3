import { defineStore } from 'pinia'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
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
    }
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('https://phimapi.com/the-loai')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Categories API Response:', data)
        
        // API trả về trực tiếp một array các thể loại
        if (Array.isArray(data)) {
          this.categories = data
          console.log('Categories loaded:', this.categories.length)
        } else if (data.status && data.data && Array.isArray(data.data)) {
          // Fallback cho trường hợp API có wrapper
          this.categories = data.data
          console.log('Categories loaded:', this.categories.length)
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
    },

    // Reset store
    resetStore() {
      this.categories = []
      this.loading = false
      this.error = null
    }
  }
})
