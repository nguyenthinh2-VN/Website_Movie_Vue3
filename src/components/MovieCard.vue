<template>
  <div class="movie-card" @click="goToMovieDetail">
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
        <div class="movie-info-overlay">
          <span class="movie-type">{{ getMovieType(movie.type) }}</span>
          <span class="movie-quality">{{ movie.quality }}</span>
        </div>
      </div>
    </div>

    <div class="movie-details">
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

      <div class="movie-meta">
        <span class="meta-value episode">{{ movie.episode_current }}</span>
        <!--         <span class="meta-value quality">{{ movie.quality }}</span> -->
        <span class="meta-value lang">{{ movie.lang }}</span>
        <span class="meta-value year">{{ movie.year }}</span>
      </div>

      <div class="movie-categories">
        <span
          v-for="category in movie.category.slice(0, 2)"
          :key="category.id"
          class="category-tag"
        >
          {{ category.name }}
        </span>
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
  methods: {
    getImageUrl(posterUrl) {
      // Nếu URL đã có domain thì return luôn, ngược lại thêm CDN domain
      if (
        posterUrl &&
        (posterUrl.startsWith("http") || posterUrl.startsWith("//"))
      ) {
        return posterUrl;
      }
      // Thêm CDN domain từ API mẫu
      return `https://phimimg.com/${posterUrl}`;
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
.movie-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.movie-card:hover {
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

.movie-card:hover .poster-image {
  transform: scale(1.05);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.play-button {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.movie-card:hover .play-button {
  transform: scale(1);
}

.movie-info-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.movie-type,
.movie-quality {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.movie-type {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
}

.movie-details {
  padding: 1rem;
  color: white;
}

.movie-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #ffffff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
  min-height: 2.6rem;
}

.movie-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: #ffd93d;
  font-size: 0.9rem;
}

.stars .bi-star {
  color: rgba(255, 217, 61, 0.3);
}

.stars .bi-star.no-rating {
  color: rgba(255, 255, 255, 0.2);
}

.rating-score {
  font-size: 0.85rem;
  color: #ffd93d;
  font-weight: bold;
  background: rgba(255, 217, 61, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 217, 61, 0.2);
}

.rating-score.no-rating {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.movie-origin-name {
  font-size: 0.9rem;
  color: #a0a0a0;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

.movie-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.meta-value {
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.meta-value.episode {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.meta-value.quality {
  background: rgba(255, 215, 61, 0.2);
  color: #ffd93d;
  border: 1px solid rgba(255, 215, 61, 0.3);
}

.meta-value.lang {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.meta-value.year {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

.movie-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tag {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .movie-details {
    padding: 0.8rem;
  }

  .movie-title {
    font-size: 1rem;
  }

  .movie-rating {
    margin-bottom: 0.6rem;
  }

  .stars i {
    font-size: 0.8rem;
  }

  .rating-score {
    font-size: 0.8rem;
  }

  .movie-meta {
    gap: 0.4rem;
  }

  .meta-value {
    font-size: 0.75rem;
    padding: 3px 8px;
  }

  .play-button {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .movie-details {
    padding: 0.6rem;
  }

  .movie-title {
    font-size: 0.9rem;
    min-height: 2.2rem;
    margin-bottom: 0.6rem;
  }

  .movie-rating {
    margin-bottom: 0.6rem;
    gap: 0.4rem;
  }

  .stars i {
    font-size: 0.75rem;
  }

  .rating-score {
    font-size: 0.75rem;
    padding: 1px 4px;
  }

  .movie-meta {
    gap: 0.25rem;
    margin-bottom: 0.8rem;
  }

  .meta-value {
    font-size: 0.65rem;
    padding: 2px 5px;
  }

  .category-tag {
    font-size: 0.65rem;
    padding: 2px 6px;
  }

  .play-button {
    width: 45px;
    height: 45px;
    font-size: 1.5rem;
  }
}

@media (max-width: 400px) {
  .movie-details {
    padding: 0.5rem;
  }

  .movie-title {
    font-size: 0.85rem;
    min-height: 2rem;
    margin-bottom: 0.5rem;
  }

  .movie-rating {
    margin-bottom: 0.5rem;
    gap: 0.3rem;
  }

  .stars i {
    font-size: 0.7rem;
  }

  .rating-score {
    font-size: 0.7rem;
    padding: 1px 3px;
  }

  .movie-meta {
    gap: 0.2rem;
  }

  .meta-value {
    font-size: 0.6rem;
    padding: 1px 4px;
  }

  .category-tag {
    font-size: 0.6rem;
    padding: 2px 5px;
  }

  .play-button {
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
  }
}
</style>