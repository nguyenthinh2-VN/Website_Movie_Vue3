import { defineStore } from 'pinia'

export const useCarouselStore = defineStore('carousel', {
  state: () => ({
    featuredMovies: [],
    loading: false,
    error: null
  }),

  getters: {
    // Kiểm tra có phim hay không
    hasMovies: (state) => state.featuredMovies.length > 0
  },

  actions: {
    async fetchFeaturedMovies() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Carousel API Response:', data)
        
        if (data.status) {
          let movies = []
          
          // Kiểm tra cấu trúc data
          if (data.data && data.data.items) {
            movies = data.data.items
          } else if (data.items) {
            movies = data.items
          } else {
            console.error('Unexpected data structure:', data)
            throw new Error('Invalid data structure')
          }
          
          // Lọc và lấy 5 phim hoạt hình đầu tiên
          const animeMovies = movies.filter(movie => {
            // Kiểm tra xem phim có phải hoạt hình không
            if (movie.category && Array.isArray(movie.category)) {
              return movie.category.some(cat => 
                cat.name && (
                  cat.name.toLowerCase().includes('hoạt hình') ||
                  cat.name.toLowerCase().includes('anime') ||
                  cat.slug === 'hoat-hinh'
                )
              )
            }
            return false
          })
          
          // Nếu không đủ phim hoạt hình, lấy phim thường để đủ 5 phim
          if (animeMovies.length < 5) {
            const remainingMovies = movies.filter(movie => !animeMovies.includes(movie))
            this.featuredMovies = [...animeMovies, ...remainingMovies].slice(0, 10)
          } else {
            this.featuredMovies = animeMovies.slice(0, 10)
          }
          
          console.log('Featured movies loaded:', this.featuredMovies.length)
          
        } else {
          throw new Error(data.msg || 'Failed to fetch featured movies')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching featured movies:', error)
      } finally {
        this.loading = false
      }
    },

    // Reset store
    resetStore() {
      this.featuredMovies = []
      this.loading = false
      this.error = null
    }
  }
})
