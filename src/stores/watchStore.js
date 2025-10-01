import { defineStore } from 'pinia'

export const useWatchStore = defineStore('watch', {
  state: () => ({
    movie: null,
    episodesData: [],
    loading: false,
    error: null,
    currentServerIndex: 0,
    currentEpisodeIndex: 0,
    currentEpisodeUrl: null
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
      return Array.isArray(state.episodesData) ? state.episodesData : []
    },
    
    // Lấy episode hiện tại
    getCurrentEpisode: (state) => {
      if (!state.episodesData || !Array.isArray(state.episodesData)) return null
      
      const currentServer = state.episodesData[state.currentServerIndex]
      if (!currentServer || !Array.isArray(currentServer.server_data)) return null
      
      return currentServer.server_data[state.currentEpisodeIndex] || null
    },
    
    // Lấy server hiện tại
    getCurrentServer: (state) => {
      if (!state.episodesData || !Array.isArray(state.episodesData)) return null
      return state.episodesData[state.currentServerIndex] || null
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
        
        if (data.status) {
          if (data.movie) {
            this.movie = data.movie
            this.episodesData = data.episodes || []
            
            console.log('Movie and episodes loaded for watch')
          } else {
            throw new Error('Invalid movie data structure')
          }
        } else {
          throw new Error(data.msg || 'Failed to fetch movie detail')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching movie for watch:', error)
      } finally {
        this.loading = false
      }
    },

    // Set episode hiện tại và tạo URL
    setCurrentEpisode(serverIndex, episodeIndex) {
      this.currentServerIndex = serverIndex
      this.currentEpisodeIndex = episodeIndex
      
      // Tạo URL cho video player
      const currentEpisode = this.getCurrentEpisode
      if (currentEpisode && currentEpisode.link_m3u8) {
        // Sử dụng link_m3u8 để tạo URL cho iframe
        this.currentEpisodeUrl = `https://player.phimapi.com/player/?url=${encodeURIComponent(currentEpisode.link_m3u8)}`
        console.log('Episode URL updated')
      } else {
        this.currentEpisodeUrl = null
        console.log('No valid episode found')
      }
    },

    // Chuyển tập tiếp theo
    nextEpisode() {
      const currentServer = this.getCurrentServer
      if (!currentServer || !Array.isArray(currentServer.server_data)) return false
      
      if (this.currentEpisodeIndex < currentServer.server_data.length - 1) {
        this.setCurrentEpisode(this.currentServerIndex, this.currentEpisodeIndex + 1)
        return true
      }
      
      // Nếu hết tập trong server hiện tại, chuyển sang server tiếp theo
      if (this.currentServerIndex < this.episodesData.length - 1) {
        this.setCurrentEpisode(this.currentServerIndex + 1, 0)
        return true
      }
      
      return false // Đã hết tập
    },

    // Chuyển tập trước đó
    previousEpisode() {
      if (this.currentEpisodeIndex > 0) {
        this.setCurrentEpisode(this.currentServerIndex, this.currentEpisodeIndex - 1)
        return true
      }
      
      // Nếu đang ở tập đầu tiên của server hiện tại, chuyển về server trước đó
      if (this.currentServerIndex > 0) {
        const prevServer = this.episodesData[this.currentServerIndex - 1]
        if (prevServer && Array.isArray(prevServer.server_data) && prevServer.server_data.length > 0) {
          this.setCurrentEpisode(this.currentServerIndex - 1, prevServer.server_data.length - 1)
          return true
        }
      }
      
      return false // Đã ở tập đầu tiên
    },

    // Reset store
    resetStore() {
      this.movie = null
      this.episodesData = []
      this.loading = false
      this.error = null
      this.currentServerIndex = 0
      this.currentEpisodeIndex = 0
      this.currentEpisodeUrl = null
    }
  }
})
