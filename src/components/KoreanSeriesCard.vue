<template>
  <div class="korean-series-card" @click="goToMovieDetail">
    <div class="movie-thumb">
      <img
        :src="getImageUrl(movie.thumb_url)"
        :alt="movie.name"
        class="thumb-image"
        loading="lazy"
      />
      
      <!-- Gradient overlay -->
      <div class="movie-overlay">
        <!-- Episode badge -->
        <div class="episode-badge">
          {{ movie.episode_current }}
        </div>
        
        <!-- Movie info -->
        <div class="movie-info">
          <h3 class="movie-title" :title="movie.name">{{ movie.name }}</h3>
          <p class="movie-origin" :title="movie.origin_name">{{ movie.origin_name }}</p>
        
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "KoreanSeriesCard",
  props: {
    movie: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getImageUrl(thumbUrl) {
      if (!thumbUrl) {
        return '';
      }
      let originalUrl;
      if (thumbUrl.startsWith("http") || thumbUrl.startsWith("//")) {
        originalUrl = thumbUrl;
      } else {
        originalUrl = `https://phimimg.com/${thumbUrl}`;
      }
      return originalUrl.replace("https://phimimg.com/upload/vod/", "https://ik.imagekit.io/yuki/");
    },

    goToMovieDetail() {
      this.$router.push(`/phim/${this.movie.slug}`);
    },
  },
};
</script>

<style scoped>
.korean-series-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  position: relative;
  height: 100%;
}

.korean-series-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 107, 107, 0.3);
}

.movie-thumb {
  position: relative;
  aspect-ratio: 16/9; /* Wide aspect ratio for Korean series */
  overflow: hidden;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.korean-series-card:hover .thumb-image {
  transform: scale(1.05);
}

/* Movie overlay */
.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.9) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

/* Episode badge */
.episode-badge {
  align-self: flex-end;
  background: red;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Movie info */
.movie-info {
  color: white;
}

.movie-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

.movie-origin {
  font-size: 0.85rem;
  color: #cccccc;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .movie-thumb {
    aspect-ratio: 4/3; /* Taller aspect ratio for mobile */
  }

  .movie-overlay {
    padding: 0.8rem;
  }

  .movie-title {
    font-size: 1rem;
  }

  .movie-origin {
    font-size: 0.8rem;
  }

  .episode-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .movie-thumb {
    aspect-ratio: 4/3; /* Even taller for very small screens */
  }

  .movie-overlay {
    padding: 0.6rem;
  }

  .movie-title {
    font-size: 12px;
    margin-bottom: 0.1rem;
  }

  .movie-origin {
    font-size: 11px;
    margin-bottom: 0;
  }

  .episode-badge {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>
