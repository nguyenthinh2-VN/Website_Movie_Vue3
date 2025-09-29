import { defineStore } from 'pinia'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: [],
    loading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalItemsPerPage: 0,
      currentPage: 1,
      totalPages: 0,
      updateToday: 0
    },
    // Cache để lưu trữ dữ liệu các trang đã tải
    pageCache: new Map(),
    // Thời gian cache (5 phút)
    cacheExpiry: 5 * 60 * 1000
  }),

  getters: {
    hasMovies: (state) => state.movies.length > 0,
    
    getMoviesByCategory: (state) => (categorySlug) => {
      return state.movies.filter(movie => 
        movie.category.some(cat => cat.slug === categorySlug)
      )
    },
    
    getMoviesByYear: (state) => (year) => {
      return state.movies.filter(movie => movie.year === year)
    }
  },

  actions: {
    async fetchMovies(page = 1) {
      this.loading = true
      this.error = null

      // 🔹 Kiểm tra cache trước
      const cached = this.pageCache.get(page)
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        this.movies = cached.data.movies
        this.pagination = { ...cached.data.pagination, currentPage: page }
        this.loading = false
        return
      }

      try {
        const response = await fetch(
          `https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=${page}&limit=16`
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.status) {
          let movies = []
          let pagination = {}

          if (data.data && data.data.items) {
            movies = data.data.items
            pagination = data.data.pagination || {}
          } else if (data.items) {
            movies = data.items
            pagination = data.pagination || {}
          } else {
            throw new Error('Invalid data structure')
          }

          this.movies = movies
          this.pagination = { ...pagination, currentPage: page }

          // 🔹 Lưu cache
          this.pageCache.set(page, {
            data: { movies, pagination },
            timestamp: Date.now()
          })
        } else {
          throw new Error(data.msg || 'Failed to fetch movies')
        }
        
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async changePage(page) {
      if (page === this.pagination.currentPage || this.loading) return
      
      await this.fetchMovies(page)
      
      // Scroll to section-title when changing page
      const sectionTitle = document.querySelector('.section-title')
      if (sectionTitle) {
        sectionTitle.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },

    searchMovies(query) {
      if (!query) return this.movies
      return this.movies.filter(movie => 
        movie.name.toLowerCase().includes(query.toLowerCase()) ||
        movie.origin_name.toLowerCase().includes(query.toLowerCase())
      )
    },

    resetStore() {
      this.movies = []
      this.loading = false
      this.error = null
      this.pagination = {
        totalItems: 0,
        totalItemsPerPage: 0,
        currentPage: 1,
        totalPages: 0,
        updateToday: 0
      }
      this.pageCache.clear()
    }
  }
})
