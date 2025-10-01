import { defineStore } from 'pinia'

export const useAnimeStore = defineStore('anime', {
  state: () => ({
    movies: [],
    loading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalItemsPerPage: 20,
      currentPage: 1,
      totalPages: 0
    }
  }),

  getters: {
    // Kiểm tra có phim hay không
    hasMovies: (state) => state.movies.length > 0
  },

  actions: {
    async fetchAnimeMovies(page = 1, silent = false) {
      if (!silent) {
        this.loading = true
        this.error = null
      }
      
      try {
        const response = await fetch(`https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=${page}&limit=20`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.status) {
          // Kiểm tra cấu trúc data theo API mẫu
          if (data.data && data.data.items) {
            this.movies = data.data.items
            if (!silent) {
              console.log('Anime movies loaded successfully')
            }
            
            // Cập nhật pagination từ data.data.params.pagination
            if (data.data.params && data.data.params.pagination) {
              this.pagination = {
                totalItems: data.data.params.pagination.totalItems || 0,
                totalItemsPerPage: data.data.params.pagination.totalItemsPerPage || 20,
                currentPage: data.data.params.pagination.currentPage || page,
                totalPages: data.data.params.pagination.totalPages || 1
              }
            } else {
              // Fallback pagination
              this.pagination = {
                totalItems: this.movies.length,
                totalItemsPerPage: 20,
                currentPage: page,
                totalPages: Math.ceil(this.movies.length / 20)
              }
            }
            
          } else {
            console.error('Unexpected data structure:', data)
            throw new Error('Invalid data structure')
          }
          
        } else {
          throw new Error(data.msg || 'Failed to fetch anime movies')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching anime movies:', error)
      } finally {
        if (!silent) {
          this.loading = false
        }
      }
    },

    async changePage(page) {
      if (page === this.pagination.currentPage || this.loading) return
      
      await this.fetchAnimeMovies(page)
      
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

    // Reset store
    resetStore() {
      this.movies = []
      this.loading = false
      this.error = null
      this.pagination = {
        totalItems: 0,
        totalItemsPerPage: 20,
        currentPage: 1,
        totalPages: 0
      }
    }
  }
})