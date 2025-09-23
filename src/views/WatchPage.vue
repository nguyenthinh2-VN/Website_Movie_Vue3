<template>
  <div class="watch-page">
    <AppHeader></AppHeader>
    
    <main class="main-content">
      <!-- Loading State -->
      <div v-if="watchStore.loading" class="loading-section">
        <div class="container">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="loading-text">Đang tải video...</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="watchStore.error" class="error-section">
        <div class="container">
          <div class="alert alert-danger" role="alert">
            Lỗi tải video: {{ watchStore.error }}
            <button @click="loadEpisode" class="btn btn-sm btn-outline-danger ms-2">Thử lại</button>
          </div>
        </div>
      </div>
      
      <!-- Watch Content -->
      <div v-else-if="watchStore.hasMovie" class="watch-content">
        <div class="container-fluid">
          <!-- Video Player Section -->
          <div class="video-section">
            <div class="video-container">
              <div class="video-header">
                <h2 class="video-title">{{ watchStore.movieInfo?.name }}</h2>
                <p class="video-episode">{{ getCurrentEpisodeName() }}</p>
              </div>
              
              <!-- Video Player -->
              <div class="video-player">
                <iframe
                  v-if="watchStore.currentEpisodeUrl"
                  :src="watchStore.currentEpisodeUrl"
                  frameborder="0"
                  allowfullscreen
                  class="video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
                <div v-else class="video-placeholder">
                  <i class="bi bi-play-circle display-1"></i>
                  <p>Chọn tập để bắt đầu xem</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Episodes Section -->
          <div class="episodes-section">
            <div class="container">
              <h3 class="episodes-title">Danh sách tập phim</h3>
              
              <div class="episodes-container" v-if="Array.isArray(watchStore.episodes) && watchStore.episodes.length > 0">
                <div 
                  v-for="(server, serverIndex) in watchStore.episodes" 
                  :key="serverIndex"
                  class="server-section"
                >
                  <div class="server-header">
                    <n-tag type="error" size="large">
                      {{ server.server_name }}
                    </n-tag>
                  </div>
                  
                  <div class="episodes-grid" v-if="Array.isArray(server.server_data) && server.server_data.length > 0">
                    <n-button
                      v-for="(episode, episodeIndex) in server.server_data"
                      :key="episodeIndex"
                      size="small"
                      :type="isCurrentEpisode(serverIndex, episodeIndex) ? 'error' : 'default'"
                      class="episode-btn"
                      :class="{ 'current-episode': isCurrentEpisode(serverIndex, episodeIndex) }"
                      @click="playEpisode(serverIndex, episodeIndex)"
                    >
                      {{ getEpisodeNumber(episode.name) }}
                    </n-button>
                  </div>
                  
                  <div v-else class="no-server-data">
                    <p class="text-muted">Server này chưa có tập phim nào.</p>
                  </div>
                </div>
              </div>
              
              <div v-else class="no-episodes">
                <p>Chưa có tập phim nào được cập nhật.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Data State -->
      <div v-else-if="!watchStore.loading && !watchStore.error && !watchStore.hasMovie" class="no-data-section">
        <div class="container">
          <div class="no-data-content">
            <i class="bi bi-film display-1 text-muted mb-3"></i>
            <h3 class="text-light mb-2">Không tìm thấy phim</h3>
            <p class="text-muted mb-3">
              Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <button @click="$router.push('/')" class="btn btn-retry">
              <i class="bi bi-house me-2"></i>
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </main>
    
    <AppFooter></AppFooter>
  </div>
</template>

<script>
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'
import { useWatchStore } from '@/stores/watchStore'
import { NButton, NTag } from 'naive-ui'

export default {
  name: 'WatchPage',
  components: {
    AppHeader,
    AppFooter,
    NButton,
    NTag
  },
  setup() {
    const watchStore = useWatchStore()
    return { watchStore }
  },
  data() {
    return {
      movieSlug: null,
      currentServerIndex: 0,
      currentEpisodeIndex: 0
    }
  },
  async mounted() {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Lấy movie slug và episode info từ route params
    this.movieSlug = this.$route.params.slug
    this.currentServerIndex = (parseInt(this.$route.params.serverIndex) || 1) - 1 // Chuyển từ 1-based về 0-based
    this.currentEpisodeIndex = (parseInt(this.$route.params.episodeIndex) || 1) - 1 // Chuyển từ 1-based về 0-based
    
    if (this.movieSlug) {
      await this.loadEpisode()
    }
  },
  async beforeRouteUpdate(to, from, next) {
    // Scroll to top when route changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Khi route thay đổi (chuyển tập khác)
    this.movieSlug = to.params.slug
    this.currentServerIndex = (parseInt(to.params.serverIndex) || 1) - 1 // Chuyển từ 1-based về 0-based
    this.currentEpisodeIndex = (parseInt(to.params.episodeIndex) || 1) - 1 // Chuyển từ 1-based về 0-based
    
    if (this.movieSlug) {
      await this.loadEpisode()
    }
    next()
  },
  methods: {
    async loadEpisode() {
      try {
        await this.watchStore.fetchMovieDetail(this.movieSlug)
        // Sau khi load xong, set episode hiện tại
        this.watchStore.setCurrentEpisode(this.currentServerIndex, this.currentEpisodeIndex)
      } catch (error) {
        console.error('Error loading episode:', error)
      }
    },
    
    playEpisode(serverIndex, episodeIndex) {
      // Cập nhật current episode
      this.currentServerIndex = serverIndex
      this.currentEpisodeIndex = episodeIndex
      
      // Cập nhật store
      this.watchStore.setCurrentEpisode(serverIndex, episodeIndex)
      
      // Cập nhật URL mà không reload trang
      const newRoute = {
        name: 'watch',
        params: {
          slug: this.movieSlug,
          serverIndex: (serverIndex + 1).toString(), // Chuyển về 1-based cho URL
          episodeIndex: (episodeIndex + 1).toString() // Chuyển về 1-based cho URL
        }
      }
      
      if (this.$route.params.serverIndex !== (serverIndex + 1).toString() || 
          this.$route.params.episodeIndex !== (episodeIndex + 1).toString()) {
        this.$router.replace(newRoute)
      }
    },
    
    isCurrentEpisode(serverIndex, episodeIndex) {
      return this.currentServerIndex === serverIndex && this.currentEpisodeIndex === episodeIndex
    },
    
    getCurrentEpisodeName() {
      const currentEpisode = this.watchStore.getCurrentEpisode
      return currentEpisode ? currentEpisode.name : 'Chọn tập để xem'
    },
    
    getEpisodeNumber(episodeName) {
      // Bỏ chữ "Tập" và chỉ lấy số: "Tập 01" -> "1", "Tập 1" -> "1"
      return episodeName.replace(/^Tập\s*0?/, '').trim()
    }
  }
}
</script>

<style scoped>
.watch-page {
  min-height: 100vh;
  background: #131419;
  color: white;
}

.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

/* Loading & Error States */
.loading-section,
.error-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  color: #a0a0a0;
}

/* Video Section */
.video-section {
  margin-bottom: 3rem;
}

.video-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.video-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.video-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.video-episode {
  font-size: 1.2rem;
  color: #a0a0a0;
  margin: 0;
}

.video-player {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
}

.video-placeholder i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Episodes Section */
.episodes-section {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0;
}

.episodes-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #fff;
}

.episodes-container {
  padding: 1rem 0;
}

.server-section {
  margin-bottom: 2rem;
}

.server-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(35px, max-content));
  gap: 8px;
  max-width: 100%;
  justify-content: start;
}

.episode-btn {
  min-width: 35px !important;
  width: max-content !important;
  height: 35px !important;
  max-width: none !important;
  max-height: 100% !important;
  font-size: 0.75rem;
  font-weight: 600;
  color: white !important;
  padding: 2px 6px !important;
  margin: 2px !important;
  background-color: #282F33 !important;
  overflow: visible;
  white-space: nowrap;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.episode-btn:hover {
  background-color: #E46565 !important;
}

/* Current Episode Highlight */
.episode-btn.current-episode {
  background-color: #E46565 !important;
  box-shadow: 0 0 10px rgba(228, 101, 101, 0.5);
  transform: scale(1.05);
}

.no-episodes,
.no-server-data {
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
}

/* No Data State */
.no-data-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.no-data-content {
  text-align: center;
  max-width: 400px;
}

.btn-retry {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .video-title {
    font-size: 1.5rem;
  }
  
  .video-episode {
    font-size: 1rem;
  }
  
  .episodes-grid {
    grid-template-columns: repeat(auto-fill, minmax(35px, max-content));
    gap: 0.3rem;
  }
  
  .episode-btn {
    font-size: 0.65rem;
    padding: 2px 5px !important;
  }
}

@media (max-width: 576px) {
  .episodes-grid {
    grid-template-columns: repeat(auto-fill, minmax(32px, max-content));
    gap: 0.25rem;
  }
  
  .episode-btn {
    min-width: 32px !important;
    height: 32px !important;
    font-size: 0.6rem;
    padding: 1px 4px !important;
    margin: 1px !important;
    border-radius: 3px;
  }
}
</style>
