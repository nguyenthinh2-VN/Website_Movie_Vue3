<template>
  <div class="carousel-container">
    <div v-if="animeStore.loading" class="loading-container">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="animeStore.error" class="error-container">
      <div class="alert alert-danger" role="alert">
        Lỗi tải dữ liệu: {{ animeStore.error }}
        <button
          @click="animeStore.fetchAnimeMovies(1)"
          class="btn btn-sm btn-outline-danger ms-2"
        >
          Thử lại
        </button>
      </div>
    </div>

    <swiper
      v-else-if="featuredMovies.length > 0"
      :slidesPerView="1"
      :spaceBetween="30"
      :loop="true"
      :pagination="{
        clickable: true,
      }"
      :modules="modules"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
      }"
      class="anime-swiper"
    >
      <swiper-slide v-for="movie in featuredMovies" :key="movie._id">
        <div class="slide-content" @click="navigateToMovie(movie.slug)">
          <div
            class="slide-background"
            :style="{ backgroundImage: `url(${getImageUrl(movie.thumb_url)})` }"
          >
            <div class="slide-overlay"></div>
          </div>
          <div class="slide-info">
            <div class="container-fluid">
              <div class="row align-items-center">
                <div class="col-lg-5 col-md-7 ps-4">
                  <div class="anime-details">
                    <!-- Rating score with single star icon -->
                    <div class="anime-rating">
                      <i class="bi bi-star-fill rating-icon"></i>
                      <span
                        class="rating-score"
                        :class="{ 'no-rating': getRating(movie) === 0 }"
                        >{{ formatRating(getRating(movie)) }}</span
                      >
                    </div>

                    <h1
                      class="anime-title"
                      v-html="decodeHtmlEntities(movie.name)"
                    ></h1>
                    <h2
                      class="anime-subtitle"
                      v-html="decodeHtmlEntities(movie.origin_name)"
                    ></h2>
                    <div class="anime-meta">
                      <span class="genre">{{ getGenres(movie.category) }}</span>
                      <span class="anime-badge">{{
                        movie.episode_current
                      }}</span>
                      <span class="year">{{ movie.year }}</span>
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
import { Swiper, SwiperSlide } from "swiper/vue";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Pagination, Navigation, Autoplay } from "swiper/modules";

// Import Pinia store
import { useAnimeStore } from "@/stores/animeStore";

export default {
  name: "AnimeCarousel",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const animeStore = useAnimeStore();

    return {
      modules: [Pagination, Navigation, Autoplay],
      animeStore,
    };
  },
  computed: {
    // Lấy 10 phim đầu tiên từ animeStore
    featuredMovies() {
      return this.animeStore.movies.slice(0, 10);
    },
  },
  async mounted() {
    // Load anime movies nếu chưa có data
    if (!this.animeStore.hasMovies && !this.animeStore.loading) {
      await this.animeStore.fetchAnimeMovies(1);
    }
  },
  methods: {

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


    // Helper method to format genres
    getGenres(categories) {
      if (!categories || categories.length === 0) return "Chưa phân loại";
      return categories
        .slice(0, 3)
        .map((cat) => cat.name)
        .join(", ");
    },
    // Navigate to movie detail page
    navigateToMovie(movieSlug) {
      this.$router.push(`/phim/${movieSlug}`);
    },

    // Rating methods from MovieCardNew
    getRating(movie) {
      return movie.tmdb && movie.tmdb.vote_average
        ? movie.tmdb.vote_average
        : 0;
    },

    formatRating(rating) {
      if (rating === 0) {
        return "0.0";
      }
      const rounded = Math.round(rating * 10) / 10;
      return rounded.toFixed(1);
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

    // Decode HTML entities like &#39; &quot; &amp; etc.
    decodeHtmlEntities(text) {
      if (!text) return "";

      // Create a temporary element to decode HTML entities
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    },
  },
};
</script>

<style scoped>
.carousel-container {
  margin-bottom: 2rem;
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
    rgba(26, 26, 46, 0.6) 25%,
    rgba(22, 33, 62, 0.45) 50%,
    rgba(15, 52, 96, 0.4) 100%
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
  text-align: left !important;
}

/* Simple rating with single star */
.anime-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 217, 61, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  width: fit-content;
}

.anime-rating .rating-icon {
  color: #ffd93d;
  font-size: 1rem;
  text-shadow: 0 2px 8px rgba(255, 217, 61, 0.5);
}

.anime-rating .rating-score {
  font-size: 1rem;
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.anime-rating .rating-score.no-rating {
  color: rgba(255, 255, 255, 0.6);
}

.anime-badge {
  background: rgba(248, 208, 47, 0.2) !important;
  border-color: rgba(255, 215, 61, 0.3) !important;
}

.anime-title {
  font-size: 2.7rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: white;
  background-clip: text;
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
  gap: 1rem;
  justify-content: flex-start !important;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.anime-meta span {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
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

  .anime-rating {
    padding: 0.4rem 0.8rem;
    margin-bottom: 1.2rem;
  }

  .anime-rating .rating-icon {
    font-size: 1.1rem;
  }

  .anime-rating .rating-score {
    font-size: 1rem;
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

  .anime-rating {
    padding: 0.4rem 0.7rem;
    margin-bottom: 1rem;
    gap: 0.4rem;
  }

  .anime-rating .rating-icon {
    font-size: 1rem;
  }

  .anime-rating .rating-score {
    font-size: 0.95rem;
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

  .anime-rating {
    padding: 0.3rem 0.6rem;
    margin-bottom: 0.8rem;
    gap: 0.4rem;
  }

  .anime-rating .rating-icon {
    font-size: 0.9rem;
  }

  .anime-rating .rating-score {
    font-size: 0.9rem;
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
