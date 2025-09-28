<template>
  <div class="movie-card-new" @click="goToMovieDetail">
    <div class="movie-poster">
      
      <!-- Blur preview image (loads first) -->
      <img
        v-if="blurPreviewLoaded && !loaded && !imageError"
        :src="getBlurPreviewUrl(movie.poster_url)"
        :alt="movie.name"
        class="poster-image blur-preview"
        loading="lazy"
      />

      <!-- Main image -->
      <img
        v-if="loaded || imageError"
        :src="imageError ? fallbackImage : getImageUrl(movie.poster_url)"
        :alt="movie.name"
        class="poster-image main-image"
        :class="{ 'fade-in': loaded }"
        loading="lazy"
        @load="onImageLoad"
        @error="onImageError"
      />

      <!-- Overlay luôn hiển thị cho gradient -->
      <div class="movie-overlay-permanent"></div>

      <!-- Play overlay chỉ hiện khi hover -->
      <div class="play-overlay">
        <div class="play-button">
          <i class="bi bi-play-circle"></i>
        </div>
      </div>

      <!-- Episode badge ở góc trên phải -->
      <div class="episode-badge">{{ movie.episode_current }}</div>

      <!-- Movie info ở dưới -->
      <div class="movie-info-bottom">
        <h3 class="movie-title" :title="movie.name">{{ movie.name }}</h3>

        <div class="movie-rating">
          <div class="stars">
            <i
              v-for="star in 5"
              :key="star"
              :class="getStarClass(star, getRating())"
            ></i>
          </div>
          <span
            class="rating-score"
            :class="{ 'no-rating': getRating() === 0 }"
            >{{ formatRating(getRating()) }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MovieCard",
  props: {
    movie: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loaded: false,
      imageError: false,
      blurPreviewLoaded: false,
      isInViewport: false,
      observer: null,
      fallbackImage:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K",
    };
  },
  mounted() {
    if (this.movie.poster_url) {
      // Add small delay for Swiper compatibility
      setTimeout(() => {
        this.setupLazyLoading();
      }, 100);
    }
  },

  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    getImageUrl(posterUrl) {
      if (!posterUrl) {
        return "";
      }
      let originalUrl;
      if (posterUrl.startsWith("http") || posterUrl.startsWith("//")) {
        originalUrl = posterUrl;
      } else {
        originalUrl = `https://phimimg.com/${posterUrl}`;
      }
      
      // Responsive image sizing based on screen width
      const width = this.getOptimalImageWidth();
      const quality = this.getOptimalImageQuality();
      
      return `https://phimapi.com/image.php?url=${encodeURIComponent(
        originalUrl
      )}&w=${width}&q=${quality}&format=webp`;
    },

    getOptimalImageWidth() {
      // Get screen width and calculate optimal image size
      const screenWidth = window.innerWidth;
      if (screenWidth <= 400) return 200;      // Mobile small
      if (screenWidth <= 576) return 250;     // Mobile
      if (screenWidth <= 768) return 300;     // Tablet
      if (screenWidth <= 1200) return 350;    // Desktop small
      return 400;                             // Desktop large
    },

    getOptimalImageQuality() {
      // Lower quality for mobile to save bandwidth
      const screenWidth = window.innerWidth;
      if (screenWidth <= 576) return 70;      // Mobile - lower quality
      if (screenWidth <= 768) return 75;      // Tablet
      return 80;                              // Desktop - higher quality
    },

    getBlurPreviewUrl(posterUrl) {
      if (!posterUrl) {
        return "";
      }
      let originalUrl;
      if (posterUrl.startsWith("http") || posterUrl.startsWith("//")) {
        originalUrl = posterUrl;
      } else {
        originalUrl = `https://phimimg.com/${posterUrl}`;
      }
      // Ultra small blur preview (~1-2kb)
      return `https://phimapi.com/image.php?url=${encodeURIComponent(
        originalUrl
      )}&w=50&q=30&format=webp`;
    },

    setupLazyLoading() {
      // Use Intersection Observer for true lazy loading
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.isInViewport = true;
                this.loadImages();
                this.observer.disconnect(); // Stop observing after loading
              }
            });
          },
          {
            rootMargin: '100px', // Increase margin for Swiper
            threshold: 0.01 // Lower threshold for better detection
          }
        );
        
        // Wait for next tick to ensure element is mounted
        this.$nextTick(() => {
          if (this.$el) {
            this.observer.observe(this.$el);
          } else {
            // Fallback if element not ready
            this.isInViewport = true;
            this.loadImages();
          }
        });
      } else {
        // Fallback for older browsers
        this.isInViewport = true;
        this.loadImages();
      }
    },

    loadImages() {
      if (!this.isInViewport) return;
      
      // Load blur preview first
      this.loadBlurPreview();
      
      // Then load main image
      this.loadMainImage();
    },

    // Force load images (for debugging or manual trigger)
    forceLoadImages() {
      this.isInViewport = true;
      this.loadImages();
    },

    loadBlurPreview() {
      const blurImg = new Image();
      blurImg.onload = () => {
        this.blurPreviewLoaded = true;
      };
      blurImg.onerror = () => {
        // If blur preview fails, skip to main image
        this.blurPreviewLoaded = false;
      };
      // Add decode() for better performance
      blurImg.src = this.getBlurPreviewUrl(this.movie.poster_url);
      if (blurImg.decode) {
        blurImg.decode().catch(() => {});
      }
    },

    loadMainImage() {
      // Add small delay to show blur preview first
      setTimeout(() => {
        const img = new Image();
        img.onload = () => {
          this.loaded = true;
          this.imageError = false;
        };
        img.onerror = () => {
          this.imageError = true;
          this.loaded = false;
        };
        img.src = this.getImageUrl(this.movie.poster_url);
      }, 100);
    },

    onImageLoad() {
      this.loaded = true;
      this.imageError = false;
    },

    onImageError() {
      console.log(
        "Image failed to load:",
        this.getImageUrl(this.movie.poster_url)
      );
      this.imageError = true;
      this.loaded = false;
    },

    getMovieType(type) {
      const typeMap = {
        series: "Phim bộ",
        single: "Phim lẻ",
        hoathinh: "Hoạt hình",
      };
      return typeMap[type] || "Phim";
    },

    getRating() {
      // Trả về rating nếu có, ngược lại trả về 0
      return this.movie.tmdb && this.movie.tmdb.vote_average
        ? this.movie.tmdb.vote_average
        : 0;
    },

    formatRating(rating) {
      // Nếu rating = 0 thì hiển thị "0.0"
      if (rating === 0) {
        return "0.0";
      }
      // Làm tròn theo quy tắc: >= 0.5 thì làm tròn lên, < 0.5 thì làm tròn xuống
      const rounded = Math.round(rating * 10) / 10;
      return rounded.toFixed(1);
    },

    getStarClass(starPosition, rating) {
      // Nếu rating = 0, tất cả sao đều không màu
      if (rating === 0) {
        return "bi bi-star no-rating";
      }

      // Chuyển đổi rating từ thang 10 sang thang 5 sao (1 sao = 2 điểm)
      const starRating = rating / 2;

      if (starPosition <= Math.floor(starRating)) {
        // Sao đầy
        return "bi bi-star-fill";
      } else if (
        starPosition === Math.floor(starRating) + 1 &&
        starRating % 1 >= 0.5
      ) {
        // Sao nửa (nếu phần thập phân >= 0.5)
        return "bi bi-star-half";
      } else {
        // Sao rỗng
        return "bi bi-star";
      }
    },

    goToMovieDetail() {
      // Navigate to movie detail page
      this.$router.push(`/phim/${this.movie.slug}`);
      // Don't scroll here - let router scrollBehavior handle it
    },
  },
};
</script>

<style scoped>
.movie-card-new {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  position: relative;
}

.movie-card-new:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 107, 107, 0.3);
}

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

.blur-preview {
  filter: blur(8px);
  transform: scale(1.1); /* Slightly scale up to hide blur edges */
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.main-image.fade-in {
  opacity: 1;
}

.movie-card-new:hover .poster-image {
  transform: scale(1.05);
}

/* Overlay luôn hiển thị cho text và episode */
.movie-overlay-permanent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 0.8) 100%
  );
  pointer-events: none; /* Cho phép click through */
}

/* Play overlay chỉ hiện khi hover */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.movie-card-new:hover .play-overlay {
  opacity: 1;
}

/* Play button ở giữa */
.play-button {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  transform: scale(0.8);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.movie-card-new:hover .play-button {
  transform: scale(1);
}

/* Episode badge ở góc trên phải */
.episode-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: none; /* Cho phép click through */
}

/* Movie info ở dưới */
.movie-info-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    transparent 100%
  );
  pointer-events: none; /* Cho phép click through */
}

.movie-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

.movie-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: #ffd93d;
  font-size: 0.85rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.stars .bi-star {
  color: rgba(255, 217, 61, 0.4);
}

.stars .bi-star.no-rating {
  color: rgba(255, 255, 255, 0.3);
}

.rating-score {
  font-size: 0.8rem;
  color: #ffd93d;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 217, 61, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.rating-score.no-rating {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .movie-info-bottom {
    padding: 0.8rem;
  }

  .movie-title {
    font-size: 1rem;
  }

  .stars i {
    font-size: 0.8rem;
  }

  .rating-score {
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
  }

  .play-button {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .episode-badge {
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .movie-info-bottom {
    padding: 0.6rem;
  }

  .movie-title {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }

  .movie-rating {
    gap: 0.4rem;
  }

  .stars i {
    font-size: 0.75rem;
  }

  .rating-score {
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
  }

  .play-button {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }

  .episode-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
  }
}

@media (max-width: 400px) {
  .movie-info-bottom {
    padding: 0.5rem;
  }

  .movie-title {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }

  .movie-rating {
    gap: 0.3rem;
  }

  .stars i {
    font-size: 0.7rem;
  }

  .rating-score {
    font-size: 0.65rem;
    padding: 0.1rem 0.25rem;
  }

  .play-button {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .episode-badge {
    font-size: 0.6rem;
    padding: 0.15rem 0.3rem;
  }
}
</style>