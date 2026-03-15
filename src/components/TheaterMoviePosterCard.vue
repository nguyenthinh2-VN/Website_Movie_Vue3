<template>
  <div class="poster-card" @click="goToMovieDetail">
    <!-- Thumbnail 16:9 -->
    <TheaterMovieThumb :movie="movie" />

    <!-- Bottom: poster float + text -->
    <div class="card-bottom">
      <!-- Floating mini poster (desktop only) -->
      <div class="poster-float">
        <img
          :src="getPosterUrl(movie.poster_url)"
          :alt="movie.name"
          class="poster-img"
          loading="lazy"
        />
      </div>

      <!-- Text -->
      <div class="card-text">
        <p class="card-title" :title="movie.name">{{ movie.name }}</p>
        <p class="card-origin" :title="movie.origin_name">
          {{ movie.origin_name }}
        </p>
        <p v-if="movie.episode_current" class="card-episode">
          {{ movie.episode_current }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import TheaterMovieThumb from "@/components/TheaterMovieThumb.vue";

export default {
  name: "TheaterMoviePosterCard",
  components: { TheaterMovieThumb },
  props: {
    movie: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getPosterUrl(posterUrl) {
      if (!posterUrl) return "";
      return posterUrl.startsWith("http") || posterUrl.startsWith("//")
        ? posterUrl
        : `https://phimimg.com/${posterUrl}`;
    },

    goToMovieDetail() {
      this.$router.push(`/phim/${this.movie.slug}`);
    },
  },
};
</script>

<style scoped>
.poster-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  width: 100%;
}

.poster-card:hover {
  transform: translateY(-8px);
}

.poster-card:hover :deep(.thumb-img) {
  filter: brightness(0.75);
}

.poster-card:hover .card-title {
  color: #4ade80;
}

/* Bottom area */
.card-bottom {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

/* Floating poster */
.poster-float {
  display: none;
}

@media (min-width: 1024px) {
  .poster-float {
    display: block;
    margin-top: -70px;
    margin-left: 12px;
    flex-shrink: 0;
    z-index: 3;
  }
}

.poster-img {
  display: block;
  width: 70px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Text */
.card-text {
  flex: 1;
  min-width: 0;
  padding-top: 0.4rem;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f9fafb;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.card-origin {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.1rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-episode {
  font-size: 0.7rem;
  color: #4ade80;
  margin: 0.15rem 0 0;
}

@media (max-width: 768px) {
  .card-title {
    font-size: 0.8rem;
  }
  .card-origin {
    font-size: 0.7rem;
  }
}

@media (max-width: 576px) {
  .card-origin {
    display: none;
  }
}
</style>
