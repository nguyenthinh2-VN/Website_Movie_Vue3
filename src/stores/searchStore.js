import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchResults: [],
    loading: false,
    error: null,
    cache: {}, // Cache for search results
    searchHistory: [],
    currentKeyword: '',
    currentPage: 1,
    totalPages: 0,
    totalResults: 0,
    suggestions: [],
    suggestionsLoading: false
  }),

  getters: {
    // Kiểm tra có kết quả tìm kiếm hay không
    hasResults: (state) => state.searchResults.length > 0,
    
    // Lấy kết quả tìm kiếm theo trang
    getResultsByPage: (state) => (page) => {
      const startIndex = (page - 1) * 20
      const endIndex = startIndex + 20
      return state.searchResults.slice(startIndex, endIndex)
    },
    
    // Lấy lịch sử tìm kiếm gần đây
    recentSearches: (state) => {
      return state.searchHistory.slice(-10).reverse() // Lấy 10 tìm kiếm gần nhất
    }
  },

  actions: {
    async searchMovies(keyword, page = 1, limit = 20) {
      this.loading = true
      this.error = null
      this.currentKeyword = keyword
      this.currentPage = page
      
      try {
        // Kiểm tra cache
        const cacheKey = `${keyword.trim()}-${page}`
        if (this.cache[cacheKey]) {
          this.searchResults = this.cache[cacheKey]
          this.loading = false
          return this.searchResults
        }

        const response = await fetch(
          `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&limit=${limit}`
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Search API Response:', data)
        
        // Xử lý dữ liệu trả về
        if (data.status === 'success' && data.data) {
          this.searchResults = data.data.items || []
          this.totalPages = data.data.params?.pagination?.totalPages || 1
          this.totalResults = data.data.params?.pagination?.totalItems || 0
          
          // Lưu vào cache
          this.cache[cacheKey] = this.searchResults
          
          // Thêm vào lịch sử tìm kiếm
          this.addToHistory(keyword)
          
        } else if (Array.isArray(data.data)) {
          // Fallback cho trường hợp API trả về trực tiếp array
          this.searchResults = data.data
          this.cache[cacheKey] = this.searchResults
          this.addToHistory(keyword)
        } else {
          this.searchResults = []
          this.totalPages = 0
          this.totalResults = 0
        }
        
      } catch (error) {
        this.error = error.message
        this.searchResults = []
        console.error('Error searching movies:', error)
      } finally {
        this.loading = false
      }
      
      return this.searchResults
    },

    // Thêm từ khóa vào lịch sử tìm kiếm
    addToHistory(keyword) {
      const trimmedKeyword = keyword.trim()
      if (trimmedKeyword && !this.searchHistory.includes(trimmedKeyword)) {
        this.searchHistory.push(trimmedKeyword)
        
        // Giới hạn lịch sử tối đa 50 mục
        if (this.searchHistory.length > 50) {
          this.searchHistory = this.searchHistory.slice(-50)
        }
      }
    },

    // Xóa lịch sử tìm kiếm
    clearHistory() {
      this.searchHistory = []
    },

    // Xóa cache
    clearCache() {
      this.cache = {}
    },

    // Reset store
    resetStore() {
      this.searchResults = []
      this.loading = false
      this.error = null
      this.currentKeyword = ''
      this.currentPage = 1
      this.totalPages = 0
      this.totalResults = 0
    },

    clearSuggestions() {
      this.suggestions = []
    },

    // Tìm kiếm gợi ý (autocomplete)
    async fetchSearchSuggestions(keyword, limit = 10) {
      if (!keyword.trim()) {
        this.suggestions = [];
        return;
      }

      this.suggestionsLoading = true;
      try {
        const cacheKey = `suggestions-${keyword.trim()}-${limit}`;
        if (this.cache[cacheKey]) {
          this.suggestions = this.cache[cacheKey];
          this.suggestionsLoading = false;
          return;
        }

        const response = await fetch(
          `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword.trim())}&page=1&limit=${limit}`
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        let suggestions = []
        
        if (data.status === 'success' && data.data) {
          suggestions = data.data.items || []
        } else if (Array.isArray(data.data)) {
          suggestions = data.data
        }
        
        // Lưu vào cache
        this.cache[cacheKey] = suggestions
        this.suggestions = suggestions.slice(0, limit)
      } catch (error) {
        console.error('Error fetching search suggestions:', error)
        this.suggestions = []
      } finally {
        this.suggestionsLoading = false
      }
        
    }
  }
})
