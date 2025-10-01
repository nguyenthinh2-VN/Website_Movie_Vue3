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
          :breakpoints="{
            320: { slidesPerView: 2, spaceBetween: 8},
            768: { slidesPerView: 3, spaceBetween: 8},
            992: { slidesPerView: 4, spaceBetween: 10},
            1200: { slidesPerView: 5, spaceBetween: 12},
          }"
          :modules="modules"
          class="movies-swiper"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
        >
          <swiper-slide v-for="movie in relatedMovies" :key="movie._id">
            <MovieCard :movie="movie" />
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
import { useRelatedMoviesStore } from "@/stores/relatedMoviesStore";
import MovieCard from "@/components/MovieCardNew.vue";
import "swiper/css";

export default {
  name: "RelatedMoviesNew",
  components: {
    Swiper,
    SwiperSlide,
    MovieCard,
  },
  props: {
    currentMovie: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const relatedMoviesStore = useRelatedMoviesStore();
    return {
      relatedMoviesStore,
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

        // Fetch related movies từ store mới
        this.relatedMovies = await this.relatedMoviesStore.fetchRelatedMovies(
          firstCategory.slug,
          this.currentMovie._id,
          30
        );
        
        // Force load images after swiper is ready
        this.$nextTick(() => {
          setTimeout(() => {
            this.forceLoadVisibleImages();
          }, 500);
        });
      } catch (error) {
        this.error = "Không thể tải phim tương tự";
        console.error("Error loading related movies:", error);
      } finally {
        this.loading = false;
      }
    },

    // Force load images for visible cards
    forceLoadVisibleImages() {
      const movieCards = this.$el.querySelectorAll('.movie-card-new');
      movieCards.forEach((card, index) => {
        if (index < 6) { // Load first 6 cards immediately
          const cardComponent = card.__vueParentComponent;
          if (cardComponent && cardComponent.ctx.forceLoadImages) {
            cardComponent.ctx.forceLoadImages();
          }
        }
      });
    },

    // Swiper methods
    onSwiper(swiper) {
      this.swiperInstance = swiper;
      this.updateNavigationState();
      
      // Force load images when swiper is ready
      setTimeout(() => {
        this.forceLoadVisibleImages();
      }, 200);
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.swiper-nav-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.4);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
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
}
</style>