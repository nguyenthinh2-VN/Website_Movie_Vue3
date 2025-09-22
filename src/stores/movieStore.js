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
    // Kiểm tra có phim hay không
    hasMovies: (state) => state.movies.length > 0,
    
    // Lấy phim theo thể loại
    getMoviesByCategory: (state) => (categorySlug) => {
      return state.movies.filter(movie => 
        movie.category.some(cat => cat.slug === categorySlug)
      )
    },
    
    // Lấy phim theo năm
    getMoviesByYear: (state) => (year) => {
      return state.movies.filter(movie => movie.year === year)
    }
  },

  actions: {
    async fetchMovies(page = 1) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=${page}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API Response:', data)
        
        if (data.status) {
          // Kiểm tra cấu trúc data
          if (data.data && data.data.items) {
            this.movies = data.data.items
            this.pagination = data.data.pagination || {}
            this.pagination.currentPage = page
          } else if (data.items) {
            this.movies = data.items
            this.pagination = data.pagination || {}
            this.pagination.currentPage = page
          } else {
            console.error('Unexpected data structure:', data)
            throw new Error('Invalid data structure')
          }
        } else {
          throw new Error(data.msg || 'Failed to fetch movies')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching movies:', error)
      } finally {
        this.loading = false
      }
    },

    async loadMoreMovies(page) {
      this.loading = true
      
      try {
        const response = await fetch(`https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=${page}`)
        const data = await response.json()
        
        if (data.status) {
          // Thêm phim mới vào danh sách hiện tại
          if (data.data && data.data.items) {
            this.movies.push(...data.data.items)
            this.pagination = data.data.pagination || {}
          } else if (data.items) {
            this.movies.push(...data.items)
            this.pagination = data.pagination || {}
          }
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error loading more movies:', error)
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
        sectionTitle.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      } else {
        // Fallback to top if section-title not found
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },

    // Tìm kiếm phim theo tên
    searchMovies(query) {
      if (!query) return this.movies
      
      return this.movies.filter(movie => 
        movie.name.toLowerCase().includes(query.toLowerCase()) ||
        movie.origin_name.toLowerCase().includes(query.toLowerCase())
      )
    },

    // Reset store
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
    }
  }
})
