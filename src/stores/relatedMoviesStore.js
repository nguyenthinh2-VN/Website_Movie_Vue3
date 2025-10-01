import { defineStore } from 'pinia'

export const useRelatedMoviesStore = defineStore('relatedMovies', {
  state: () => ({
    movies: [],
    loading: false,
    error: null,
    currentCategorySlug: null
  }),

  getters: {
    // Kiểm tra có phim hay không
    hasMovies: (state) => state.movies.length > 0
  },

  actions: {
    async fetchRelatedMovies(categorySlug, currentMovieId, limit = 30) {
      // Tránh fetch lại nếu đã có dữ liệu của cùng thể loại
      if (this.currentCategorySlug === categorySlug && this.hasMovies && !this.loading) {
        return this.getFilteredMovies(currentMovieId, limit)
      }

      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`https://phimapi.com/v1/api/the-loai/${categorySlug}?page=1&limit=50`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.status && data.data && data.data.items) {
          this.movies = data.data.items
          this.currentCategorySlug = categorySlug
          return this.getFilteredMovies(currentMovieId, limit)
        } else {
          throw new Error('Invalid data structure')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching related movies:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Lọc bỏ phim hiện tại và giới hạn số lượng
    getFilteredMovies(currentMovieId, limit = 30) {
      if (!this.movies || this.movies.length === 0) {
        return []
      }

      return this.movies
        .filter(movie => movie._id !== currentMovieId)
        .slice(0, limit)
    },

    // Reset store
    resetStore() {
      this.movies = []
      this.loading = false
      this.error = null
      this.currentCategorySlug = null
    }
  }
})
