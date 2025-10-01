<template>
  <div class="movie-detail-page">
    <AppHeader></AppHeader>

    <main class="main-content">
      <!-- Loading State -->
      <div v-if="movieDetailStore.loading" class="loading-section">
        <div class="container">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="loading-text">Đang tải thông tin phim...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="movieDetailStore.error" class="error-section">
        <div class="container">
          <div class="alert alert-danger" role="alert">
            Lỗi tải dữ liệu: {{ movieDetailStore.error }}
            <button
              @click="loadMovieDetail"
              class="btn btn-sm btn-outline-danger ms-2"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>

      <!-- Movie Detail Content -->
      <div v-else-if="movieDetailStore.hasMovie" class="movie-detail-content">
        <div class="container">
          <div class="row container-body">
            <!-- Movie Poster -->
            <div class="col-lg-4 col-md-5">
              <div class="movie-poster-section">
                <div class="poster-container">
                  <img
                    :src="getImageUrl(movieDetailStore.movieInfo.poster_url)"
                    :alt="movieDetailStore.movieInfo.name"
                    class="movie-poster-img"
                  />
                  <div class="poster-overlay">
                    <div class="quality-badge">
                      {{ movieDetailStore.movieInfo.quality }}
                    </div>
                    <div class="episode-badge">
                      {{ movieDetailStore.movieInfo.episode_current }}
                    </div>
                  </div>
                </div>

                <!-- Action Buttons with Naive UI -->
                <div class="action-buttons">
                  <n-button
                    type="info"
                    size="large"
                    @click="toggleEpisodes"
                    class="btn-episodes"
                  >
                    <template #icon>
                      <i class="bi bi-play-circle"></i>
                    </template>
                    Chọn Tập
                  </n-button>

                  <n-button
                    v-if="movieDetailStore.movieInfo?.trailer_url"
                    type="success"
                    size="large"
                    @click="openTrailerModal"
                    class="btn-trailer"
                  >
                    <template #icon>
                      <i class="bi bi-camera-video"></i>
                    </template>
                    Trailer
                  </n-button>

                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-button
                        circle
                        size="large"
                        class="btn-bookmark"
                        :class="{ saved: isSaved }"
                        @click="toggleSaveMovieHandler"
                      >
                        <template #icon>
                          <i :class="isSaved ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'"></i>
                        </template>
                      </n-button>
                    </template>
                    {{ isSaved ? 'Bỏ lưu' : 'Lưu phim' }}
                  </n-tooltip>
                </div>
              </div>
            </div>

            <!-- Movie Info -->
            <div class="col-lg-8 col-md-7">
              <div class="movie-info-section">
                <!-- Title -->
                <h1 class="movie-title">
                  {{ movieDetailStore.movieInfo.name }}
                </h1>
                <h2 class="movie-subtitle">
                  {{ movieDetailStore.movieInfo.origin_name }}
                </h2>

                <!-- Movie Meta Info -->
                <div class="movie-meta">
                  <div class="meta-row">
                    <span class="meta-label">Trạng thái:</span>
                    <span class="meta-value status">{{
                      movieDetailStore.movieInfo.episode_current
                    }}</span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-label">Năm phát hành:</span>
                    <span class="meta-value">{{
                      movieDetailStore.movieInfo.year
                    }}</span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-label">Thời lượng:</span>
                    <span class="meta-value">{{
                      movieDetailStore.movieInfo.time
                    }}</span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-label">Thể loại:</span>
                    <span class="meta-value categories">
                      <span
                        v-for="(category, index) in movieDetailStore.movieInfo
                          .category"
                        :key="category.id"
                        class="category-link"
                        @click="goToCategory(category.slug)"
                      >
                        {{ category.name
                        }}<span
                          v-if="
                            index <
                            movieDetailStore.movieInfo.category.length - 1
                          "
                          >,
                        </span>
                      </span>
                    </span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-label">Quốc gia:</span>
                    <span class="meta-value">
                      {{
                        movieDetailStore.movieInfo.country
                          ?.map((c) => c.name)
                          .join(", ")
                      }}
                    </span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-label">Đạo diễn:</span>
                    <span class="meta-value">{{
                      movieDetailStore.movieInfo.director?.join(", ") ||
                      "Đang cập nhật"
                    }}</span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-label">Diễn viên:</span>
                    <span class="meta-value">{{
                      movieDetailStore.movieInfo.actor?.join(", ") ||
                      "Đang cập nhật"
                    }}</span>
                  </div>

                  <div class="meta-row">
                    <span class="meta-label">Yêu thích:</span>
                    <div class="rating-stars">
                      <i
                        v-for="star in 5"
                        :key="star"
                        :class="getStarClass(star, movieDetailStore.rating)"
                      ></i>
                      <span class="rating-text"
                        >({{ movieDetailStore.rating }}/10)</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Movie Description - Moved here -->
                <div class="movie-description-inline">
                  <h3 class="description-title">Nội dung phim</h3>
                  <div class="description-content">
                    <p
                      class="description-text"
                      :class="{
                        collapsed: !isDescriptionExpanded && isDescriptionLong,
                      }"
                      ref="descriptionText"
                    >
                      {{
                        movieDetailStore.movieInfo.content ||
                        "Nội dung phim đang được cập nhật..."
                      }}
                    </p>
                    <button
                      v-if="isDescriptionLong"
                      class="btn btn-toggle-description"
                      @click="toggleDescription"
                    >
                      {{ isDescriptionExpanded ? "Thu gọn" : "Xem thêm" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Episodes Section (Outside container-body) -->
          <div
            v-if="movieDetailStore.hasMovie && showEpisodes"
            class="episodes-section"
          >
            <div class="container">
              <n-collapse
                v-model:expanded-names="expandedEpisodes"
                class="episodes-collapse"
              >
                <div
                  class="episodes-container"
                  v-if="
                    Array.isArray(movieDetailStore.episodes) &&
                    movieDetailStore.episodes.length > 0
                  "
                >
                  <div
                    v-for="(server, serverIndex) in movieDetailStore.episodes"
                    :key="serverIndex"
                    class="server-section"
                  >
                    <div class="server-header">
                      <n-tag type="error" size="large">
                        {{ server.server_name }}
                      </n-tag>
                    </div>
                    <div
                      class="episodes-grid"
                      v-if="
                        Array.isArray(server.server_data) &&
                        server.server_data.length > 0
                      "
                    >
                      <n-button
                        v-for="(episode, episodeIndex) in server.server_data"
                        :key="episodeIndex"
                        size="small"
                        class="episode-btn"
                        @click="playEpisode(serverIndex, episodeIndex, episode)"
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
              </n-collapse>
            </div>
          </div>

          <!-- Related Movies Section -->
          <div class="row mt-4" v-if="movieDetailStore.hasMovie">
            <div class="col-12">
              <RelatedMoviesNew :currentMovie="movieDetailStore.movie" />
            </div>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div
        v-else-if="
          !movieDetailStore.loading &&
          !movieDetailStore.error &&
          !movieDetailStore.hasMovie
        "
        class="no-data-section"
      >
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

    <!-- Trailer Modal -->
    <div
      v-if="showTrailerModal"
      class="trailer-modal-overlay"
      @click="closeTrailerModal"
    >
      <div class="trailer-modal" @click.stop>
        <div class="trailer-modal-header">
          <h5 class="modal-title">
            {{ movieDetailStore.movieInfo.name }} - Trailer
          </h5>
          <button type="button" class="btn-close" @click="closeTrailerModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="trailer-modal-body">
          <div class="trailer-video-container">
            <iframe
              v-if="trailerEmbedUrl"
              :src="trailerEmbedUrl"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="trailer-iframe"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <AppFooter></AppFooter>
  </div>
</template>

<script>
import AppHeader from "@/components/Header.vue";
import AppFooter from "@/components/Footer.vue";
import RelatedMoviesNew from "@/components/RelatedMoviesNew.vue";
import { useMovieDetailStore } from "@/stores/movieDetailStore";
import { useSavedMoviesStore } from '@/stores/savedMoviesStore';
import { NButton, NCollapse, NTag, NTooltip } from "naive-ui";

export default {
  name: "MovieDetailPage",
  components: {
    AppHeader,
    AppFooter,
    RelatedMoviesNew,
    NButton,
    NCollapse,
    NTag,
    NTooltip,
  },
  setup() {
    const movieDetailStore = useMovieDetailStore();
    const savedMoviesStore = useSavedMoviesStore();
    return { movieDetailStore, savedMoviesStore };
  },
  data() {
    return {
      movieSlug: null,
      isDescriptionExpanded: false,
      isDescriptionLong: false,
      showTrailerModal: false,
      trailerEmbedUrl: null,
      expandedEpisodes: [], // For collapse control
      showEpisodes: false, // Control episodes section visibility
    };
  },
  async mounted() {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Debug: Check if stores are properly initialized
    console.log('MovieDetailPage mounted');
    console.log('movieDetailStore:', this.movieDetailStore);
    console.log('savedMoviesStore:', this.savedMoviesStore);

    // Lấy movie slug từ route params
    this.movieSlug = this.$route.params.slug;
    if (this.movieSlug) {
      await this.loadMovieDetail();
    }
  },

  async beforeRouteUpdate(to, from, next) {
    // Scroll to top when changing to different movie
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Khi route thay đổi (chuyển sang phim khác)
    this.movieSlug = to.params.slug;
    if (this.movieSlug) {
      await this.loadMovieDetail();
    }
    next();
  },

  watch: {
    // Cập nhật title khi movieInfo thay đổi
    "movieDetailStore.movieInfo": {
      handler(newMovieInfo) {
        if (newMovieInfo && newMovieInfo.name) {
          document.title = `${newMovieInfo.name} - Yuki Movie`;
        } else {
          document.title = "Chi Tiết Phim - Yuki Movie";
        }
      },
      immediate: true,
      deep: true,
    },
  },

  computed: {
    isSaved() {
      if (!this.movieDetailStore?.movieInfo || !this.savedMoviesStore) {
        return false;
      }
      const slug = this.movieDetailStore.movieInfo.slug;
      return this.savedMoviesStore.isMovieSaved(slug);
    },
  },


  methods: {
    toggleSaveMovieHandler() {
      console.log('Toggle save clicked');
      
      // Kiểm tra xem các store có tồn tại không
      if (!this.savedMoviesStore) {
        console.error('savedMoviesStore is not available');
        return;
      }
      
      if (!this.movieDetailStore?.movieInfo) {
        console.error('No movieInfo available');
        return;
      }
     
      try {
        this.savedMoviesStore.toggleSaveMovie(this.movieDetailStore.movieInfo);

        this.$nextTick(() => {
          console.log('After toggle - saved state:', this.isSaved);
          console.log('Saved movies count:', this.savedMoviesStore.savedMovies.length);
        });
      } catch (error) {
        console.error('Error toggling save movie:', error);
      }
    },

    async loadMovieDetail() {
      if (this.movieSlug) {
        await this.movieDetailStore.fetchMovieDetail(this.movieSlug);
        /* // Debug: Log episodes data
        console.log("Episodes data:", this.movieDetailStore.episodes);
        console.log("Movie data:", this.movieDetailStore.movie); */
        // Check if description is long after loading
        this.$nextTick(() => {
          this.checkDescriptionLength();
        });
      }
    },

    checkDescriptionLength() {
      const content = this.movieDetailStore.movieInfo?.content || "";
      // Consider description long if it's more than 200 characters
      this.isDescriptionLong = content.length > 200;
    },

    toggleDescription() {
      this.isDescriptionExpanded = !this.isDescriptionExpanded;
    },

    openTrailerModal() {
      const trailerUrl = this.movieDetailStore.movieInfo?.trailer_url;
      if (trailerUrl && trailerUrl.trim() !== "") {
        this.trailerEmbedUrl = this.convertToEmbedUrl(trailerUrl);
        this.showTrailerModal = true;
        // Prevent body scroll when modal is open
        document.body.style.overflow = "hidden";
      }
    },

    closeTrailerModal() {
      this.showTrailerModal = false;
      this.trailerEmbedUrl = null;
      // Restore body scroll
      document.body.style.overflow = "auto";
    },

    convertToEmbedUrl(url) {
      // Convert YouTube URL to embed URL
      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } else if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      // Return original URL if not YouTube
      return url;
    },

    getImageUrl(posterUrl) {
      if (!posterUrl) {
        return '';
      }
      let originalUrl;
      if (posterUrl.startsWith("http") || posterUrl.startsWith("//")) {
        originalUrl = posterUrl;
      } else {
        originalUrl = `https://phimimg.com/${posterUrl}`;
      }
      return originalUrl.replace("https://phimimg.com/upload/vod/", "https://ik.imagekit.io/yuki/");
    },

    getStarClass(starPosition, rating) {
      if (rating === 0) {
        return "bi bi-star no-rating";
      }

      const starRating = rating / 2;

      if (starPosition <= Math.floor(starRating)) {
        return "bi bi-star-fill";
      } else if (
        starPosition === Math.floor(starRating) + 1 &&
        starRating % 1 >= 0.5
      ) {
        return "bi bi-star-half";
      } else {
        return "bi bi-star";
      }
    },

    goToCategory(categorySlug) {
      this.$router.push(`/the-loai/${categorySlug}`);
    },

    playEpisode(serverIndex, episodeIndex) {
      /* console.log("Play episode:", episode);
      console.log("Server index:", serverIndex);
      console.log("Episode index:", episodeIndex); */

      // Chuyển hướng đến trang xem phim
      this.$router.push({
        name: "watch",
        params: {
          slug: this.movieSlug,
          serverIndex: (serverIndex + 1).toString(), // Server bắt đầu từ 1
          episodeIndex: (episodeIndex + 1).toString(), // Episode bắt đầu từ 1
        },
      });
    },

    toggleEpisodes() {
      this.showEpisodes = !this.showEpisodes;
      if (this.showEpisodes) {
        // Auto expand episodes when showing
        this.expandedEpisodes = ["episodes"];
        // Scroll to episodes section
        this.$nextTick(() => {
          const episodesSection = document.querySelector(".description-content");
          if (episodesSection) {
            episodesSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      }
    },

    getEpisodeNumber(episodeName) {
      // Bỏ chữ "Tập" và chỉ lấy số: "Tập 01" -> "1", "Tập 1" -> "1"
      return episodeName.replace(/^Tập\s*0?/, "").trim();
    },
  },
};
</script>

<style scoped>
.movie-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  overflow-x: hidden; /* Ngăn scroll ngang */
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  box-sizing: border-box;
}

/* Loading and Error States */
.loading-section,
.error-section {
  text-align: center;
  padding: 4rem 0;
  color: #ffffff;
}

.loading-section .spinner-border {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.1rem;
  color: #a0a0a0;
}

.error-section .alert {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ffffff;
  max-width: 600px;
  margin: 0 auto;
}

/* Movie Detail Content */
.movie-detail-content {
  color: #ffffff;
}

/* Poster Section */
.movie-poster-section {
  margin-bottom: 2rem;
}

.poster-container {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.movie-poster-img {
  width: 100%;
  height: auto;
  display: block;
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

.quality-badge,
.episode-badge {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  align-self: flex-start;
  margin-bottom: 0.5rem;
}

.episode-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  align-self: flex-end;
  margin-bottom: 0;
  margin-top: auto;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
} 


/* Custom styling for bookmark button */
.btn-bookmark {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.btn-bookmark:hover {
  background: rgba(255, 107, 107, 0.2) !important;
  border-color: rgba(255, 107, 107, 0.3) !important;
  color: #ffd93d !important;
  transform: translateY(-2px);
}

.btn-bookmark.saved {
  background: #ff6b6b !important;
  border-color: #ff6b6b !important;
  color: white !important;
}

.btn-bookmark.saved:hover {
  background: #e45a5a !important;
  border-color: #e45a5a !important;
  color: white !important;
}

/* Custom styling for bookmark button */
.btn-bookmark {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.btn-bookmark:hover {
  background: rgba(255, 107, 107, 0.2) !important;
  border-color: rgba(255, 107, 107, 0.3) !important;
  color: #ffd93d !important;
  transform: translateY(-2px);
}

/* Episodes Collapse Styling */
.episodes-collapse {
  margin-top: 1.5rem;
}

.episodes-container {
  padding: 1rem 0;
}

.server-section {
  margin-bottom: 1.5rem;
}

.server-header {
  margin-bottom: 0.8rem;
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
  background-color: #282f33 !important;
  overflow: visible;
  white-space: nowrap;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.episode-btn:hover {
  background-color: #e46565 !important;
}

.no-episodes {
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
}

.no-server-data {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-style: italic;
}

/* Movie Info Section */
.movie-info-section {
  padding-left: 1rem;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.movie-subtitle {
  font-size: 1.2rem;
  color: #f0ffff;
  margin-bottom: 1.5rem;
  font-style: italic;
}

/* Movie Meta PC */
.movie-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.meta-label {
  min-width: 120px;
  color: #a0a0a0;
  font-weight: 500;
}

.meta-value {
  color: #ffffff;
  flex: 1;
}

.meta-value.status {
  color: #4caf50;
  font-weight: bold;
}

.category-link {
  color: #ff6b6b;
  cursor: pointer;
  transition: color 0.3s ease;
}

.category-link:hover {
  color: #ffd93d;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-stars i {
  color: #ffd93d;
  font-size: 1rem;
}

.rating-stars i.no-rating {
  color: #666;
}

.rating-text {
  color: #a0a0a0;
  font-size: 0.9rem;
}

/* Description Inline */
.movie-description-inline {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.description-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
}

.description-content {
  position: relative;
}

.description-text {
  line-height: 1.6;
  color: #e0e0e0;
  margin: 0;
  transition: all 0.3s ease;
}

.description-text.collapsed {
  max-height: 4.8em; /* Approximately 3 lines */
  overflow: hidden;
  position: relative;
}

.description-text.collapsed::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5em;
  background: linear-gradient(transparent, rgba(26, 26, 46, 1));
  pointer-events: none;
}

.btn-toggle-description {
  background: transparent;
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-toggle-description:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.5);
  color: #ffd93d;
}

/* No Data Section */
.no-data-section {
  text-align: center;
  padding: 4rem 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data-content {
  max-width: 500px;
  margin: 0 auto;
}

.no-data-content i {
  color: rgba(255, 255, 255, 0.3) !important;
}

.btn-retry {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  color: #ffffff;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

/* Responsive Design */
@media (max-width: 992px) {
  .movie-info-section {
    padding-left: 0;
    margin-top: 2rem;
  }

  .movie-title {
    font-size: 2rem;
  }

  .meta-row {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .meta-label {
    min-width: 100px;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  /* Mobile Layout: Stack poster on top */
  .row {
    flex-direction: column;
  }

  .col-lg-4,
  .col-md-5 {
    order: 1;
    margin-bottom: 1.5rem;
  }

  .col-lg-8,
  .col-md-7 {
    order: 2;
  }

  /* Smaller poster for mobile */
  .poster-container {
    max-width: 250px;
    margin: 0 auto 1rem auto;
  }

  .movie-title {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .movie-subtitle {
    font-size: 1rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  /* Keep meta info inline on mobile */
  .meta-row {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
  }

  .meta-label {
    min-width: 100px;
    flex-shrink: 0;
    font-size: 0.9rem;
  }

  .meta-value {
    font-size: 0.9rem;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1rem;
  }

  /* Episodes collapse responsive */
  .episodes-grid {
    grid-template-columns: repeat(auto-fill, minmax(35px, max-content));
    gap: 0.3rem;
    justify-content: start;
  }

  .episode-btn {
    min-width: 35px !important;
    width: max-content !important;
    height: 35px !important;
    max-width: none !important;
    max-height: 100% !important;
    font-size: 0.65rem;
    font-weight: 600;
    color: white !important;
    padding: 2px 5px !important;
    margin: 2px !important;
    background-color: #282f33 !important;
    overflow: visible;
    white-space: nowrap;
    display: flex !important;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .episode-btn:hover {
    background-color: #e46565 !important;
  }

  .movie-description-inline {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }

  .description-title {
    font-size: 1.1rem;
    text-align: center;
  }
  .trailer-modal {
    width: 95%;
    margin: 1rem;
  }

  .trailer-modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-watch,
  .btn-trailer {
    flex: 1;
    min-width: 120px;
  }

  .btn-bookmark {
    flex-shrink: 0;
  }
}

/* Trailer Modal */
.trailer-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.trailer-modal {
  background: rgba(26, 26, 46, 0.95);
  border-radius: 15px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.trailer-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  color: #ffffff;
  margin: 0;
  font-size: 1.3rem;
  font-weight: bold;
}

.btn-close {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ff6b6b;
}

.trailer-modal-body {
  padding: 0;
}

.trailer-video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 576px) {
  /* Even smaller poster for very small screens */
  .poster-container {
    max-width: 300px;
  }

  .movie-title {
    font-size: 1.5rem;
  }

  /* Movie Meta Mobile */
  .movie-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  /* Compact meta info for small screens */
  .meta-label {
    min-width: 80px;
    font-size: 0.85rem;
  }

  .meta-value {
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  /* Smaller episodes buttons on mobile */
  .episodes-grid {
    grid-template-columns: repeat(auto-fill, minmax(32px, max-content));
    gap: 0.25rem;
    justify-content: start;
  }

  .episode-btn {
    min-width: 32px !important;
    width: max-content !important;
    height: 32px !important;
    max-width: none !important;
    max-height: 100% !important;
    font-size: 0.6rem;
    font-weight: 600;
    color: white !important;
    padding: 1px 4px !important;
    margin: 1px !important;
    background-color: #282f33 !important;
    overflow: visible;
    white-space: nowrap;
    display: flex !important;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    transition: background-color 0.3s ease;
  }

  .episode-btn:hover {
    background-color: #e46565 !important;
  }

  .server-header {
    margin-bottom: 0.6rem;
  }

  .trailer-modal-header {
    padding: 0.8rem;
  }

  .modal-title {
    font-size: 1rem;
  }
}
</style>