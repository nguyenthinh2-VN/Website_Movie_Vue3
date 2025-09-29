<template>
  <div class="korean-series-section">
    <div class="container">
      <h3 class="section-title">Phim Bộ Hàn Quốc Mới</h3>

      <!-- Loading State -->
      <div v-if="koreanSeriesStore.loading" class="loading-state">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p>Đang tải phim bộ Hàn Quốc...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="koreanSeriesStore.error" class="error-state">
        <p class="text-danger">{{ koreanSeriesStore.error }}</p>
        <button @click="loadKoreanSeries" class="btn btn-sm btn-outline-danger">
          Thử lại
        </button>
      </div>

      <!-- Movies Swiper -->
      <div v-else-if="koreanSeriesStore.hasMovies" class="korean-series-swiper">
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
            :slidesPerView="3"
            :spaceBetween="20"
            :breakpoints="{
              320: { slidesPerView: 2, spaceBetween: 10 },
              768: { slidesPerView: 2, spaceBetween: 15 },
              992: { slidesPerView: 3, spaceBetween: 20 },
              1200: { slidesPerView: 3, spaceBetween: 20 },
            }"
            :modules="modules"
            class="movies-swiper"
            @swiper="onSwiper"
            @slideChange="onSlideChange"
          >
            <swiper-slide
              v-for="movie in koreanSeriesStore.featuredMovies"
              :key="movie._id"
            >
              <KoreanSeriesCard :movie="movie" />
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
        <p class="text-muted">Không tìm thấy phim bộ Hàn Quốc</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { useKoreanSeriesStore } from "@/stores/koreanSeriesStore";
import KoreanSeriesCard from "@/components/KoreanSeriesCard.vue";
import "swiper/css";

export default {
  name: "KoreanSeriesSlide",
  components: {
    Swiper,
    SwiperSlide,
    KoreanSeriesCard,
  },
  setup() {
    const koreanSeriesStore = useKoreanSeriesStore();
    return {
      koreanSeriesStore,
      modules: [],
    };
  },
  data() {
    return {
      swiperInstance: null,
      isBeginning: true,
      isEnd: false,
    };
  },
  async mounted() {
    await this.loadKoreanSeries();
  },
  methods: {
    async loadKoreanSeries() {
      try {
        await this.koreanSeriesStore.fetchKoreanSeries();
      } catch (error) {
        console.error("Error loading Korean series:", error);
      }
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
.korean-series-section {
  margin: 0.5rem 0;
  padding: 2rem 0;
  background: rgba(0, 0, 0, 0.2);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
  text-align: center;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 2px;
}

/* Loading, Error, No Data States */
.loading-state,
.error-state,
.no-data-state {
  text-align: center;
  padding: 3rem 0;
  color: #ffffff;
}

.loading-state .spinner-border {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
}

.error-state .btn {
  margin-top: 1rem;
}

/* Korean Series Swiper */
.korean-series-swiper {
  margin: 0 -10px;
}

.swiper-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.movies-swiper {
  padding: 20px 10px;
  flex: 1;
}

/* Navigation Buttons */
.swiper-nav-btn {
  position: absolute;
  background-color: #fff !important;
  z-index: 10;
  opacity: 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 20px;
}

.swiper-nav-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.2);
}

.swiper-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
}

.swiper-nav-prev {
  left: -30px;
}

.swiper-nav-next {
  right: -30px;
}

.movies-swiper .swiper-wrapper {
  align-items: stretch;
}

.movies-swiper .swiper-slide {
  height: auto;
  display: flex;
}

/* Responsive Design */
@media (max-width: 992px) {
  .section-title {
    font-size: 1.8rem;
  }

  .swiper-nav-btn {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .swiper-nav-prev {
    left: -25px;
  }

  .swiper-nav-next {
    right: -25px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .section-title {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .korean-series-swiper {
    margin: 0 -5px;
  }

  .movies-swiper {
    padding: 15px 5px;
  }

  .swiper-nav-btn {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
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
    font-size: 1.4rem;
  }

  .swiper-nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .swiper-nav-prev {
    left: -15px;
  }

  .swiper-nav-next {
    right: -15px;
  }
}
</style>
