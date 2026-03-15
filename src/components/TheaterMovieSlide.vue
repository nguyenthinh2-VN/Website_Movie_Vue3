<template>
  <div class="theater-movie-section">
    <div class="section-container">
      <!-- Header -->
      <div class="section-header">
        <h3 class="section-title">Mãn Nhãn Với Phim Chiếu Rạp</h3>
        <router-link to="/danh-sach/phim-chieu-rap" class="view-all-link">
          <i class="bi bi-chevron-right"></i>
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="theaterMovieStore.loading" class="state-msg">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="theaterMovieStore.error" class="state-msg">
        <p class="text-danger">{{ theaterMovieStore.error }}</p>
        <button
          @click="loadTheaterMovies"
          class="btn btn-sm btn-outline-danger"
        >
          Thử lại
        </button>
      </div>

      <!-- Swiper -->
      <div v-else-if="theaterMovieStore.hasMovies" class="swiper-wrap">
        <swiper
          :slidesPerView="3"
          :spaceBetween="16"
          :breakpoints="{
            320: { slidesPerView: 2, spaceBetween: 8 },
            640: { slidesPerView: 2, spaceBetween: 10 },
            768: { slidesPerView: 3, spaceBetween: 12 },
            1024: { slidesPerView: 3, spaceBetween: 16 },
          }"
          :modules="modules"
          class="theater-swiper"
          @swiper="onSwiper"
        >
          <swiper-slide
            v-for="movie in theaterMovieStore.featuredMovies"
            :key="movie._id"
          >
            <TheaterMoviePosterCard :movie="movie" />
          </swiper-slide>
        </swiper>
      </div>

      <!-- No Data -->
      <div v-else class="state-msg">
        <p class="text-muted">Không tìm thấy phim chiếu rạp</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { useTheaterMovieStore } from "@/stores/theaterMovieStore";
import TheaterMoviePosterCard from "@/components/TheaterMoviePosterCard.vue";
import "swiper/css";

export default {
  name: "TheaterMovieSlide",
  components: { Swiper, SwiperSlide, TheaterMoviePosterCard },
  setup() {
    const theaterMovieStore = useTheaterMovieStore();
    return { theaterMovieStore, modules: [] };
  },
  data() {
    return { swiperInstance: null };
  },
  async mounted() {
    await this.loadTheaterMovies();
  },
  methods: {
    async loadTheaterMovies() {
      try {
        await this.theaterMovieStore.fetchTheaterMovies();
      } catch (error) {
        console.error("Error loading theater movies:", error);
      }
    },
    onSwiper(swiper) {
      this.swiperInstance = swiper;
    },
  },
};
</script>

<style scoped>
.theater-movie-section {
  padding: 2rem 0;
  background: rgba(0, 0, 0, 0.2);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: #fff;
  margin: 0;
}

.view-all-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.view-all-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #4ade80;
}

.state-msg {
  text-align: center;
  padding: 3rem 0;
  color: #fff;
}

/* Swiper */
.swiper-wrap {
  margin: 0;
}

.theater-swiper {
  padding: 4px 0 10px;
}

.theater-swiper :deep(.swiper-slide) {
  width: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .section-container {
    padding: 0 1rem;
  }
  .section-title {
    font-size: 1.2rem;
  }
}
</style>
