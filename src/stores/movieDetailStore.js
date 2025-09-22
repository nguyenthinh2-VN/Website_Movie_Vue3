import { defineStore } from 'pinia'

export const useMovieDetailStore = defineStore('movieDetail', {
  state: () => ({
    movie: null,
    loading: false,
    error: null
  }),

  getters: {
    // Kiểm tra có movie hay không
    hasMovie: (state) => state.movie !== null,
    
    // Lấy thông tin cơ bản
    movieInfo: (state) => {
      if (!state.movie) return null
      return {
        name: state.movie.name,
        origin_name: state.movie.origin_name,
        poster_url: state.movie.poster_url,
        thumb_url: state.movie.thumb_url,
        year: state.movie.year,
        quality: state.movie.quality,
        lang: state.movie.lang,
        time: state.movie.time,
        episode_current: state.movie.episode_current,
        content: state.movie.content,
        type: state.movie.type,
        status: state.movie.status,
        actor: state.movie.actor,
        director: state.movie.director,
        category: state.movie.category,
        country: state.movie.country,
        trailer_url: state.movie.trailer_url
      }
    },
    
    // Lấy episodes
    episodes: (state) => {
      if (!state.movie || !state.movie.episodes) return []
      return state.movie.episodes
    },
    
    // Lấy rating
    rating: (state) => {
      if (!state.movie || !state.movie.tmdb) return 0
      return state.movie.tmdb.vote_average || 0
    }
  },

  actions: {
    async fetchMovieDetail(slug) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`https://phimapi.com/phim/${slug}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Movie Detail API Response:', data)
        
        if (data.status) {
          // API trả về movie detail trong data.movie
          if (data.movie) {
            this.movie = data.movie
            console.log('Movie detail loaded:', this.movie.name)
          } else {
            console.error('Unexpected data structure:', data)
            throw new Error('Invalid movie data structure')
          }
          
        } else {
          throw new Error(data.msg || 'Failed to fetch movie detail')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching movie detail:', error)
      } finally {
        this.loading = false
      }
    },

    // Reset store
    resetStore() {
      this.movie = null
      this.loading = false
      this.error = null
    }
  }
})
