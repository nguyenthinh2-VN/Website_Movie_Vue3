<template>
  <div class="carousel-container">
    <div v-if="carouselStore.loading" class="loading-container">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>
    
    <div v-else-if="carouselStore.error" class="error-container">
      <div class="alert alert-danger" role="alert">
        Lỗi tải dữ liệu: {{ carouselStore.error }}
        <button @click="loadFeaturedMovies" class="btn btn-sm btn-outline-danger ms-2">Thử lại</button>
      </div>
    </div>
    
    <swiper
      v-else-if="carouselStore.hasMovies"
      :slidesPerView="1"
      :spaceBetween="30"
      :loop="true"
      :pagination="{
        clickable: true,
      }"
      :navigation="true"
      :modules="modules"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
      }"
      class="anime-swiper"
    >
      <swiper-slide v-for="movie in carouselStore.featuredMovies" :key="movie._id">
        <div class="slide-content">
          <div class="slide-background" :style="{ backgroundImage: `url(${getImageUrl(movie.thumb_url)})` }">
            <div class="slide-overlay"></div>
          </div>
          <div class="slide-info">
            <div class="container">
              <div class="row align-items-center justify-content-center">
                <div class="col-lg-8 text-center">
                  <div class="anime-details">
                    <!-- <span class="anime-badge">{{ movie.episode_current }}</span> -->
                    <h1 class="anime-title">{{ movie.name }}</h1>
                    <h2 class="anime-subtitle">{{ movie.origin_name }}</h2>
                    <div class="anime-meta">
                      <span class="genre">{{ getGenres(movie.category) }}</span>
                      <!-- <span class="quality">{{ movie.quality }}</span> -->
                      <span class="anime-badge">{{ movie.episode_current }}</span>
                      <span class="year">{{ movie.year }}</span>
                      <!-- <span class="lang">{{ movie.lang }}</span> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// Import Pinia store
import { useCarouselStore } from '@/stores/carouselStore';

export default {
  name: 'AnimeCarousel',
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const carouselStore = useCarouselStore();
    
    return {
      modules: [Pagination, Navigation, Autoplay],
      carouselStore
    };
  },
  async mounted() {
    // Load featured movies when component mounts
    await this.loadFeaturedMovies();
  },
  methods: {
    async loadFeaturedMovies() {
      await this.carouselStore.fetchFeaturedMovies();
    },
    
    getImageUrl(imageUrl) {
      // Nếu URL đã có domain thì return luôn, ngược lại thêm CDN domain
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('//'))) {
        return imageUrl
      }
      // Thêm CDN domain từ API mẫu
      return `https://phimimg.com/${imageUrl}`
    },
    
    // Helper method to format genres
    getGenres(categories) {
      if (!categories || categories.length === 0) return 'Chưa phân loại';
      return categories.slice(0, 3).map(cat => cat.name).join(', ');
    }
  }
}
</script>

<style scoped>
.carousel-container {
  margin-bottom: 3rem;
}

/* Loading and Error States */
.loading-container,
.error-container {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  margin-bottom: 3rem;
}

.loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
}

.error-container .alert {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ffffff;
}

.anime-swiper {
  height: 88vh;
  min-height: 400px;
}

.slide-content {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.slide-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.6) 0%,
    rgba(22, 33, 62, 0.5) 50%,
    rgba(15, 52, 96, 0.45) 100%
  );
}

.slide-info {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 2rem 0;
}

.anime-details {
  color: white;
  text-align: center;
}

.anime-badge {
  background: rgba(248, 208, 47, 0.2) !important;
  border-color: rgba(255, 215, 61, 0.3) !important;
}

.anime-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

.anime-subtitle {
  font-size: 1.5rem;
  color: #e0e0e0;
  margin-bottom: 2rem;
  font-weight: 300;
  font-style: italic;
}

.anime-meta {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.anime-meta span {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

.anime-meta .genre {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.3);
}

.anime-meta .quality {
  background: rgba(255, 215, 61, 0.2);
  border-color: rgba(255, 215, 61, 0.3);
}

.anime-meta .year {
  background: rgba(108, 117, 125, 0.2);
  border-color: rgba(108, 117, 125, 0.3);
}

.anime-meta .lang {
  background: rgba(40, 167, 69, 0.2);
  border-color: rgba(40, 167, 69, 0.3);
}

/* Swiper custom styles */
:deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  width: 12px;
  height: 12px;
}

:deep(.swiper-pagination-bullet-active) {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #ff6b6b;
  width: 50px;
  height: 50px;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(255, 107, 107, 0.2);
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 991px) {
  .anime-swiper {
    height: 55vh;
    min-height: 350px;
  }
  
  .anime-title {
    font-size: 2.8rem;
  }
  
  .anime-subtitle {
    font-size: 1.3rem;
  }
  
  .anime-meta {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .anime-swiper {
    height: 50vh;
    min-height: 300px;
  }
  
  .anime-title {
    font-size: 2.2rem;
  }
  
  .anime-subtitle {
    font-size: 1.1rem;
  }
  
  .anime-meta {
    gap: 0.8rem;
  }
  
  .anime-meta span {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .anime-swiper {
    height: 45vh;
    min-height: 280px;
  }
  
  .anime-title {
    font-size: 1.8rem;
  }
  
  .anime-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .anime-badge {
    font-size: 0.8rem;
    padding: 0.3rem 1rem;
  }
  
  .anime-meta {
    gap: 0.5rem;
  }
  
  .anime-meta span {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 40px;
    height: 40px;
  }
  
  :deep(.swiper-pagination-bullet) {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 400px) {
  .anime-title {
    font-size: 1.5rem;
  }
  
  .anime-subtitle {
    font-size: 0.9rem;
  }
  
  .slide-info {
    padding: 1rem 0;
  }
}
</style>
