<template>
  <div class="carousel-container mb-5">
    <!-- Header/Title -->
    <!-- Optional title if needed, left blank here as in original HP -->

    <div v-if="animeStore.loading" class="loading-container">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="animeStore.error" class="error-container">
      <div class="alert alert-danger" role="alert">
        Lỗi tải dữ liệu: {{ animeStore.error }}
        <button
          @click="loadFeaturedMovies"
          class="btn btn-sm btn-outline-danger ms-2"
        >
          Thử lại
        </button>
      </div>
    </div>

    <div class="relative-wrap" v-else-if="animeStore.hasMovies">
      <swiper
        @swiper="onSwiper"
        @slideChange="onSlideChange"
        :effect="'fade'"
        :slidesPerView="1"
        :spaceBetween="0"
        :loop="true"
        :modules="modules"
        :autoplay="{
          delay: 4000,
          disableOnInteraction: false,
        }"
        class="modern-anime-swiper"
      >
        <swiper-slide
          v-for="movie in animeStore.movies.slice(0, 10)"
          :key="movie._id"
        >
          <div class="slide-wrapper">
            <!-- Mobile Link Overlay Overlay like React -->
            <router-link
              :to="`/phim/${movie.slug}`"
              class="mobile-link-overlay"
            ></router-link>

            <!-- Lớp màng mờ mờ nổi hạt (Dotted Texture) -->
            <div class="dotted-overlay"></div>

            <div class="slide-inner">
              <!-- Nội dung bên trái -->
              <div class="slide-content">
                <h4 class="anime-title" :title="movie.name">
                  {{ movie.name }}
                </h4>
                <p class="anime-subtitle">{{ movie.origin_name }}</p>

                <div class="anime-badges-row">
                  <span
                    v-if="movie.tmdb?.vote_average"
                    class="badge-custom badge-tmdb"
                  >
                    <span class="tmdb-text">IMDb</span
                    ><span class="tmdb-score">{{
                      movie.tmdb.vote_average
                    }}</span>
                  </span>
                  <span
                    v-if="movie.quality"
                    class="badge-custom badge-quality"
                    >{{ movie.quality }}</span
                  >
                  <span
                    v-if="movie.episode_current"
                    class="badge-custom badge-xs"
                    >{{ movie.episode_current }}</span
                  >
                  <span v-if="movie.year" class="badge-custom badge-xs">{{
                    movie.year
                  }}</span>
                  <span v-if="movie.time" class="badge-custom badge-xs">{{
                    movie.time
                  }}</span>
                  <span
                    v-for="(lang, idx) in splitLang(movie.lang)"
                    :key="idx"
                    class="badge-custom badge-xs hide-on-mobile"
                  >
                    {{ lang }}
                  </span>
                </div>

                <div class="anime-categories">
                  <span
                    v-for="(cat, index) in (movie.category || []).slice(0, 4)"
                    :key="index"
                    class="badge-category"
                  >
                    {{ cat.name }}
                  </span>
                </div>

                <div class="anime-actions">
                  <router-link :to="`/phim/${movie.slug}`" class="btn-play">
                    <svg
                      class="icon-btn"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    Xem ngay
                  </router-link>
                  <router-link :to="`/phim/${movie.slug}`" class="btn-detail">
                    <svg
                      class="icon-btn"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    Chi tiết
                  </router-link>
                </div>
              </div>

              <!-- Ảnh nền bên phải áp dụng Mask Image -->
              <div class="slide-image-wrapper mask-gradient-banner">
                <img
                  :src="getImageUrl(movie.thumb_url)"
                  class="slide-image"
                  :alt="movie.name"
                />
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <!-- Custom Thumbnails Pagination -->
      <div
        v-show="animeStore.movies.length > 0"
        class="thumbnail-pagination-container"
      >
        <div class="thumbnail-pagination-inner">
          <div
            v-for="(item, idx) in animeStore.movies.slice(0, 10)"
            :key="idx"
            @click="slideToLoop(idx)"
            class="thumbnail-item"
            :class="{ active: activeIndex === idx }"
            :title="item.name"
            :aria-label="`Thumbnail ${idx + 1}`"
          >
            <div class="thumbnail-img-wrapper">
              <img
                :src="getImageUrl(item.thumb_url)"
                class="thumbnail-img"
                :alt="item.name"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";

// import required modules
import { Autoplay, EffectFade } from "swiper/modules";
import { useAnimeStore } from "@/stores/animeStore";

export default {
  name: "ModernBanner",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const animeStore = useAnimeStore();
    return {
      modules: [Autoplay, EffectFade],
      animeStore,
    };
  },
  data() {
    return {
      swiperInstance: null,
      activeIndex: 0,
    };
  },
  async mounted() {
    await this.loadFeaturedMovies();
  },
  methods: {
    async loadFeaturedMovies() {
      await this.animeStore.fetchAnimeMovies();
    },

    getImageUrl(imageUrl) {
      if (!imageUrl) return "";
      let originalUrl =
        imageUrl.startsWith("http") || imageUrl.startsWith("//")
          ? imageUrl
          : `https://phimimg.com/${imageUrl}`;
      return `https://phimapi.com/image.php?url=${encodeURIComponent(
        originalUrl
      )}`;
    },

    splitLang(langString) {
      if (!langString) return [];
      return langString.split("+").filter((l) => l.trim().length > 0);
    },

    stripHtml(html) {
      if (!html) return "";
      return html.replace(/<[^>]+>/g, "");
    },

    onSwiper(swiper) {
      this.swiperInstance = swiper;
    },

    onSlideChange(swiper) {
      this.activeIndex = swiper.realIndex ?? swiper.activeIndex ?? 0;
    },

    slideToLoop(index) {
      if (
        this.swiperInstance &&
        typeof this.swiperInstance.slideToLoop === "function"
      ) {
        this.swiperInstance.slideToLoop(index);
      }
    },
  },
};
</script>

<style scoped>
.carousel-container {
  width: 100%;
  max-width: 1920px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0;
  margin-bottom: 3rem;
  background-color: #0f121a; /* match typical dark theme */
}
@media (min-width: 1536px) {
  .carousel-container {
    padding: 0;
  }
}

.relative-wrap {
  position: relative;
  width: 100%;
}

/* Loading and Error States */
.loading-container,
.error-container {
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2f3346;
  border-radius: 1rem;
}

.slide-wrapper {
  position: relative;
  background-color: #0f121a;
  overflow: hidden;
  height: 400px;
  max-height: 200vh;
}
@media (min-width: 1024px) {
  .slide-wrapper {
    height: 900px;
    max-height: 100vh;
  }
}

.modern-anime-swiper {
  width: 100%;
  position: relative;
}

.mobile-link-overlay {
  display: flex;
  position: absolute;
  inset: 0;
  z-index: 30;
}
@media (min-width: 1024px) {
  .mobile-link-overlay {
    display: none; /* lg:hidden */
  }
}

.dotted-overlay {
  display: none;
}
@media (min-width: 1024px) {
  .dotted-overlay {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: radial-gradient(#ffffff 1px, transparent 1px);
    background-size: 4px 4px;
    opacity: 0.1;
    z-index: 2;
    pointer-events: none;
  }
}

.slide-inner {
  display: flex;
  flex-direction: column-reverse; /* mobile */
  height: 100%;
}
@media (min-width: 1024px) {
  .slide-inner {
    flex-direction: row;
  }
}

.slide-content {
  padding: 1rem 5% 5rem 5%;
  max-width: 100%;
  z-index: 10;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
  height: 100%;
}
@media (min-width: 1024px) {
  .slide-content {
    padding: 2rem 8%;
    max-width: 50vw;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
  }
}

.anime-title {
  font-family: inherit;
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  background: white; /* Make text white like the reference instead of gradient if preferred, or keep gradient */
  background-clip: text;
  color: white; /* solid white */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Allow 2 lines for full width */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .anime-title {
    font-size: 3.5rem;
    line-height: 1.2;
  }
}

.anime-subtitle {
  font-family: inherit;
  font-size: 1rem;
  color: #e5e7eb;
  font-weight: 300;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1.5rem;
}
@media (min-width: 1024px) {
  .anime-subtitle {
    font-size: 1.25rem;
  }
}

.anime-badges-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}
@media (min-width: 1024px) {
  .anime-badges-row {
    justify-content: flex-start;
  }
}

.badge-custom {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-tmdb {
  background-color: transparent;
  gap: 4px;
  border: 1px solid #facc15;
  color: #facc15;
}
.tmdb-text {
  font-weight: 800;
  color: #facc15;
  font-size: 0.75rem;
}
.tmdb-score {
  color: #ffffff;
  font-weight: 700;
  margin-left: 2px;
}

.badge-quality {
  background: transparent;
  border: 1px solid #facc15;
  color: #facc15;
}

.badge-xs {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.anime-categories {
  display: none;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
@media (min-width: 1024px) {
  .anime-categories {
    display: flex;
  }
}

.badge-category {
  font-size: 0.77rem;
  padding: 3px 9px;
  border-radius: 4px; /* pill shape */
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.anime-actions {
  display: none;
  gap: 1.5rem;
  align-items: center;
  margin-top: 2rem;
}
@media (min-width: 1024px) {
  .anime-actions {
    display: flex;
  }
}

.btn-play {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 2rem;
  font-size: 1.25rem;
  border-radius: 9999px; /* pill shape like reference */
  background: #facc15; /* reference uses yellow play button */
  color: #000;
  font-weight: 700;
  border: none;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 4px 14px 0 rgba(250, 204, 21, 0.39);
}
.btn-play:hover {
  transform: scale(1.05);
  background: #eab308;
}

.btn-detail {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 2rem;
  font-size: 1.25rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 500;
  transition: all 0.3s;
  text-decoration: none;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-detail:hover {
  transform: scale(1.05);
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.icon-btn {
  width: 1.5rem;
  height: 1.5rem;
}

.slide-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* Make image fill whole screen */
  z-index: 1;
}
@media (min-width: 1024px) {
  .slide-image-wrapper {
    position: absolute;
    top: 0;
    right: 0;
    left: auto;
    width: 65%; /* Only take up right side on desktop */
    height: 100%;
  }
}
@media (min-width: 1536px) {
  .slide-image-wrapper {
    width: 70%;
  }
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center; /* Focus on character faces */
}

.mask-gradient-banner {
  mask-image: none;
  -webkit-mask-image: none;
}
@media (min-width: 1024px) {
  .mask-gradient-banner {
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 0, 0, 0.1) 15%,
      black 40%,
      black 100%
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 0, 0, 0.1) 15%,
      black 40%,
      black 100%
    );
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
  }
}

.slide-image-wrapper::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 18, 26, 1) 0%,
    rgba(15, 18, 26, 0.8) 30%,
    transparent 80%
  );
  z-index: 2;
}
@media (min-width: 1024px) {
  .slide-image-wrapper::after {
    background: linear-gradient(to right, #0f121a 0%, transparent 30%);
  }
}

.thumbnail-pagination-container {
  pointer-events: auto;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.5rem;
  z-index: 50;
  display: flex;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
@media (min-width: 1024px) {
  .thumbnail-pagination-container {
    bottom: 3rem;
    right: 5%;
    left: auto;
    justify-content: flex-end;
    width: auto;
  }
}

.thumbnail-pagination-inner {
  display: flex;
  gap: 0.5rem;
  background-color: transparent;
  padding: 0.25rem;
  border-radius: 0.375rem;
}
@media (min-width: 1024px) {
  .thumbnail-pagination-inner {
    gap: 1rem;
  }
}

.thumbnail-item {
  cursor: pointer;
  border-radius: 50%; /* Tròn trên mobile */
  position: relative;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; /* kích thước nhỏ gọn cho mobile để ko bị tràn */
  height: 30px;
  border: 1.2px solid transparent; /* viền mỏng hơn trên mobile */
  opacity: 0.7;
  padding: 1.5px; /* viền bao ngoài như avatar */
  background-color: transparent;
  flex-shrink: 0; /* Chống bị bóp méo chữ nhật khi hẹp ngang */
}
.thumbnail-item.active {
  border-color: #facc15; /* Sáng viền vàng khi active trên mobile */
  opacity: 1;
  transform: scale(1.1);
}

@media (min-width: 1024px) {
  .thumbnail-item {
    width: 78px;
    height: 43px;
    border-radius: 4px;
    border: 1px solid transparent;
    opacity: 0.6; /* more faded */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0; /* xóa viền avatar trên PC */
    transform: none;
  }
  .thumbnail-item.active {
    border-color: #ffffff;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
    opacity: 1;
    transform: scale(1.05); /* slightly scale active */
  }
  .thumbnail-item:hover {
    border-color: #ffffff;
    opacity: 1;
    transform: translateY(-4px);
  }
}

.thumbnail-img-wrapper {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .thumbnail-img-wrapper {
    border-radius: 4px;
  }
}

.thumbnail-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
