import { defineStore } from 'pinia'

export const useMovieDetailStore = defineStore('movieDetail', {
  state: () => ({
    movie: null,
    episodesData: [], // Đổi tên để tránh conflict với getter
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
    
    // Lấy episodes - episodes nằm ngoài movie object
    episodes: (state) => {
      // Trả về episodes từ state (đã được lưu từ API)
      return Array.isArray(state.episodesData) ? state.episodesData : []
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
          // API trả về movie detail trong data.movie và episodes trong data.episodes
          if (data.movie) {
            this.movie = data.movie
            
            // Lấy episodes từ API response (cùng cấp với movie theo file mẫu)
            this.episodesData = data.episodes || []
            
            console.log('Raw episodes from API:', data.episodes)
            console.log('Episodes type:', typeof data.episodes)
            console.log('Episodes is array:', Array.isArray(data.episodes))
            console.log('Movie detail loaded:', this.movie.name)
            console.log('Episodes saved to state:', this.episodesData)
            
            if (this.episodesData && Array.isArray(this.episodesData) && this.episodesData.length > 0) {
              console.log('Episodes loaded:', this.episodesData.length, 'servers')
              // Log chi tiết từng server
              this.episodesData.forEach((server, index) => {
                console.log(`Server ${index + 1}: ${server.server_name} - ${server.server_data?.length || 0} episodes`)
              })
            } else {
              console.log('No episodes available for this movie')
            }
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
      this.episodesData = [] // Reset về array rỗng
      this.loading = false
      this.error = null
    }
  }
})
