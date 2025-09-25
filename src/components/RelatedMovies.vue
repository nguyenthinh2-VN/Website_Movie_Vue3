<template>
  <div class="related-movies-section">
    <h3 class="section-title">Phim tương tự</h3>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p>Đang tải phim tương tự...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="text-danger">{{ error }}</p>
    </div>

    <!-- Movies Swiper -->
    <div v-else-if="relatedMovies.length > 0" class="related-movies-swiper">
      <div class="swiper-container">
        <!-- Navigation Buttons -->
        <button
          class="swiper-nav-btn swiper-nav-prev"
          @click="slidePrev"
          :disabled="isBeginning"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <swiper
          ref="swiperRef"
          :slidesPerView="4"
          :spaceBetween="20"
          :slidesPerGroup="4"
          :breakpoints="{
            320: { slidesPerView: 2, spaceBetween: 8, slidesPerGroup: 2 },
            768: { slidesPerView: 3, spaceBetween: 8, slidesPerGroup: 3 },
            992: { slidesPerView: 4, spaceBetween: 10, slidesPerGroup: 4 },
            1200: { slidesPerView: 5, spaceBetween: 12, slidesPerGroup: 5 },
          }"
          :modules="modules"
          class="movies-swiper"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
        >
          <swiper-slide v-for="movie in relatedMovies" :key="movie._id">
            <div
              class="related-movie-card"
              @click="navigateToMovie(movie.slug)"
            >
              <div class="movie-poster">
                <img
                  :src="getImageUrl(movie.poster_url)"
                  :alt="movie.name"
                  class="poster-image"
                  loading="lazy"
                />
                <div class="movie-overlay">
                  <div class="play-button">
                    <i class="bi bi-play-circle"></i>
                  </div>
                  <div class="movie-badges">
                    <span class="quality-badge">{{ movie.quality }}</span>
                    <span class="episode-badge">{{
                      movie.episode_current
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="movie-info">
                <h4 class="movie-title" :title="movie.name">
                  {{ movie.name }}
                </h4>
                <p class="movie-year">{{ movie.year }}</p>
              </div>
            </div>
          </swiper-slide>
        </swiper>

        <button
          class="swiper-nav-btn swiper-nav-next"
          @click="slideNext"
          :disabled="isEnd"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="no-data-state">
      <p class="text-muted">Không tìm thấy phim tương tự</p>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { useCategoryMovieStore } from "@/stores/categoryMovieStore";
import "swiper/css";

export default {
  name: "RelatedMovies",
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    currentMovie: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const categoryMovieStore = useCategoryMovieStore();
    return {
      categoryMovieStore,
      modules: [],
    };
  },
  data() {
    return {
      relatedMovies: [],
      loading: false,
      error: null,
      swiperInstance: null,
      isBeginning: true,
      isEnd: false,
    };
  },
  async mounted() {
    await this.loadRelatedMovies();
  },
  watch: {
    currentMovie: {
      handler() {
        this.loadRelatedMovies();
      },
      deep: true,
    },
  },
  methods: {
    async loadRelatedMovies() {
      if (
        !this.currentMovie ||
        !this.currentMovie.category ||
        this.currentMovie.category.length === 0
      ) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        // Lấy thể loại đầu tiên của phim hiện tại
        const firstCategory = this.currentMovie.category[0];

        // Fetch movies từ thể loại đó
        await this.categoryMovieStore.fetchMoviesByCategory(
          firstCategory.slug,
          1
        );

        if (
          this.categoryMovieStore.movies &&
          this.categoryMovieStore.movies.length > 0
        ) {
          // Lọc bỏ phim hiện tại và lấy tối đa 30 phim
          this.relatedMovies = this.categoryMovieStore.movies
            .filter((movie) => movie._id !== this.currentMovie._id)
            .slice(0, 30);
        }
      } catch (error) {
        this.error = "Không thể tải phim tương tự";
        console.error("Error loading related movies:", error);
      } finally {
        this.loading = false;
      }
    },

    getImageUrl(imageUrl) {
      if (
        imageUrl &&
        (imageUrl.startsWith("http") || imageUrl.startsWith("//"))
      ) {
        return imageUrl;
      }
      return `https://phimimg.com/${imageUrl}`;
    },

    navigateToMovie(movieSlug) {
      // Navigate to movie detail page
      this.$router.push(`/phim/${movieSlug}`);
    },

    // Swiper methods
    onSwiper(swiper) {
      this.swiperInstance = swiper;
      this.updateNavigationState();
    },

    onSlideChange() {
      this.updateNavigationState();
    },

    updateNavigationState() {
      if (this.swiperInstance) {
        this.isBeginning = this.swiperInstance.isBeginning;
        this.isEnd = this.swiperInstance.isEnd;
      }
    },

    slidePrev() {
      if (this.swiperInstance && !this.isBeginning) {
        this.swiperInstance.slidePrev();
      }
    },

    slideNext() {
      if (this.swiperInstance && !this.isEnd) {
        this.swiperInstance.slideNext();
      }
    },
  },
};
</script>

<style scoped>
.related-movies-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 2px;
}

/* Loading, Error, No Data States */
.loading-state,
.error-state,
.no-data-state {
  text-align: center;
  padding: 2rem 0;
  color: #ffffff;
}

.loading-state .spinner-border {
  width: 2rem;
  height: 2rem;
  margin-bottom: 1rem;
}

/* Related Movies Swiper */
.related-movies-swiper {
  margin: 0 -10px;
}

.swiper-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.movies-swiper {
  padding: 10px;
  flex: 1;
}

/* Navigation Buttons */
.swiper-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ff4c00;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}



.swiper-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.swiper-nav-prev {
  left: -25px;
}

.swiper-nav-next {
  right: -25px;
}

.movies-swiper .swiper-wrapper {
  align-items: stretch;
}

.movies-swiper .swiper-slide {
  height: auto;
  display: flex;
}

/* Related Movie Card */
.related-movie-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Ensure all swiper slides have equal height */
.movies-swiper .swiper-slide {
  height: auto;
  display: flex;
}

.related-movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 107, 107, 0.3);
}

/* Movie Poster */
.movie-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.related-movie-card:hover .poster-image {
  transform: scale(1.05);
}

/* Movie Overlay */
.movie-overlay {
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
  padding: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.related-movie-card:hover .movie-overlay {
  opacity: 1;
}

.play-button {
  align-self: center;
  margin: auto;
  color: white;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.movie-badges {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.quality-badge,
.episode-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: bold;
}

.quality-badge {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: white;
}

/* Movie Info */
.movie-info {
  padding: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 75px;
}

.movie-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 2.8em;
  word-wrap: break-word;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: normal;
}

.movie-year {
  font-size: 0.8rem;
  color: #a0a0a0;
  margin: 0;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
  }

  .related-movies-swiper {
    margin: 0 -5px;
  }

  .movies-swiper {
    padding: 5px;
  }

  .swiper-nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .swiper-nav-prev {
    left: -20px;
  }

  .swiper-nav-next {
    right: -20px;
  }

  .movie-info {
    padding: 0.6rem;
    min-height: 70px;
  }

  .movie-title {
    font-size: 0.85rem;
    line-height: 1.3;
    max-height: 2.6em;
    margin-bottom: 0.4rem;
  }

  .movie-year {
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .section-title {
    font-size: 1.3rem;
  }

  .swiper-nav-btn {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }

  .swiper-nav-prev {
    left: -15px;
  }

  .swiper-nav-next {
    right: -15px;
  }

  .play-button {
    font-size: 2rem;
  }

  .quality-badge,
  .episode-badge {
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>
