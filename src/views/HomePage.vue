<template>
  <div class="home-page">
    <AppHeader></AppHeader>
    <main class="main-content">
      <!-- Carousel Section -->
      <AnimeCarousel></AnimeCarousel>

      <div class="container featured-container">
        <section class="featured-section">
          <h2 class="section-title">Phim mới cập nhật</h2>

          <!-- Loading State -->
          <div v-if="movieStore.loading" class="loading-section">
            <div class="spinner-border text-light" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="loading-text">Đang tải danh sách phim...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="movieStore.error" class="error-section">
            <div class="alert alert-danger" role="alert">
              Lỗi tải dữ liệu: {{ movieStore.error }}
              <button
                @click="loadMovies"
                class="btn btn-sm btn-outline-danger ms-2"
              >
                Thử lại
              </button>
              <button @click="testAPI" class="btn btn-sm btn-outline-info ms-2">
                Test API
              </button>
            </div>
            <div class="debug-info mt-3" v-if="debugInfo">
              <h6>Debug Info:</h6>
              <pre>{{ debugInfo }}</pre>
            </div>
          </div>

          <!-- Movies Grid -->
          <div v-else-if="movieStore.hasMovies" class="movies-grid">
            <MovieCard
              v-for="movie in displayedMovies"
              :key="movie._id"
              :movie="movie"
            />
          </div>

          <!-- No Data State -->
          <div v-else class="no-data-section">
            <div class="no-data-content">
              <i class="bi bi-film display-1 text-muted mb-3"></i>
              <h3 class="text-light mb-2">Không có dữ liệu phim</h3>
              <p class="text-muted mb-3">
                Không thể tải danh sách phim. Vui lòng kiểm tra kết nối mạng và
                thử lại.
              </p>
              <button @click="loadMovies" class="btn btn-retry">
                <i class="bi bi-arrow-clockwise me-2"></i>
                Thử lại
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <MoviePagination
            v-if="movieStore.hasMovies && movieStore.pagination.totalPages > 1"
            :current-page="movieStore.pagination.currentPage"
            :total-pages="movieStore.pagination.totalPages"
            :total-items="movieStore.pagination.totalItems"
            @page-change="handlePageChange"
          />
        </section>
      </div>
    </main>
    <AppFooter></AppFooter>
  </div>
</template>

<script>
import AppHeader from "@/components/Header.vue";
import AppFooter from "@/components/Footer.vue";
import AnimeCarousel from "@/components/AnimeCarousel.vue";
import MovieCard from "@/components/MovieCard.vue";
import MoviePagination from "@/components/Pagination.vue";
import { useMovieStore } from "@/stores/movieStore";

export default {
  name: "HomePage",
  components: {
    AppHeader,
    AppFooter,
    AnimeCarousel,
    MovieCard,
    MoviePagination,
  },
  setup() {
    const movieStore = useMovieStore();
    return { movieStore };
  },
  data() {
    return {
      debugInfo: null,
    };
  },
  computed: {
    displayedMovies() {
      // Hiển thị tất cả phim vì carousel đã có store riêng
      return this.movieStore.movies;
    },
  },
  methods: {
    async loadMovies() {
      // lấy page từ URL query, nếu không có thì mặc định 1
      const page = this.$route.query.page
        ? parseInt(this.$route.query.page)
        : 1;
      await this.movieStore.fetchMovies(page);
    },
    //Đưa State lên URL
    async handlePageChange(page) {
      await this.movieStore.changePage(page);
      this.$router.push({ query: { page } }); // lưu số trang vào URL
    },
    async testAPI() {
      this.debugInfo = "Testing API...";
      try {
        const testUrl =
          "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1";
        console.log("Testing URL:", testUrl);

        const response = await fetch(testUrl);
        const data = await response.json();

        this.debugInfo = JSON.stringify(
          {
            url: testUrl,
            status: response.status,
            ok: response.ok,
            dataStructure: {
              hasStatus: !!data.status,
              statusValue: data.status,
              hasData: !!data.data,
              hasItems: !!(data.data && data.data.items),
              itemsLength:
                data.data && data.data.items ? data.data.items.length : 0,
              pagination:
                data.data && data.data.pagination ? data.data.pagination : null,
            },
            firstItem:
              data.data && data.data.items && data.data.items[0]
                ? data.data.items[0]
                : null,
          },
          null,
          2
        );
      } catch (error) {
        this.debugInfo = JSON.stringify(
          {
            error: error.message,
            stack: error.stack,
          },
          null,
          2
        );
      }
    },
  },
  async mounted() {
    // Load initial data
    await this.loadMovies();
  },
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

.main-content {
  flex: 1;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.featured-container {
  padding-top: 3rem;
}

/* Featured Section */
.featured-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  color: #ff6b6b;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 2px;
}

/* Loading and Error States */
.loading-section,
.error-section {
  text-align: center;
  padding: 3rem 0;
  color: #ffffff;
}

.loading-section .spinner-border {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.1rem;
  color: #a0a0a0;
}

.error-section .alert {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ffffff;
  max-width: 600px;
  margin: 0 auto;
}

.debug-info {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.debug-info pre {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  color: #ffffff;
  font-size: 0.85rem;
  overflow-x: auto;
  white-space: pre-wrap;
}

/* Movies Grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

/* No Data Section */
.no-data-section {
  text-align: center;
  padding: 4rem 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data-content {
  max-width: 500px;
  margin: 0 auto;
}

.no-data-content i {
  color: rgba(255, 255, 255, 0.3) !important;
}

.btn-retry {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  color: #ffffff;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .no-data-section {
    padding: 3rem 1rem;
    min-height: 300px;
  }

  .btn-retry {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }

  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .featured-container {
    padding-top: 2rem;
  }
}

@media (max-width: 400px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .container {
    padding: 0 0.5rem;
  }
}
</style>
