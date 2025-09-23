<template>
  <div class="category-page">
    <AppHeader></AppHeader>
    
    <main class="main-content">
      <div class="container category-container">
        <section class="category-section">
          <!-- Category Title -->
          <h2 class="section-title">
            {{ categoryMovieStore.categoryInfo?.name || 'Thể loại phim' }}
          </h2>
          
          <!-- Category Stats -->
          <div v-if="categoryMovieStore.pagination.totalItems > 0" class="category-stats">
            <p class="stats-text">
              Tìm thấy <strong>{{ categoryMovieStore.pagination.totalItems.toLocaleString() }}</strong> phim 
              trong thể loại <strong>{{ categoryMovieStore.categoryInfo?.name }}</strong>
            </p>
          </div>
          
          <!-- Loading State -->
          <div v-if="categoryMovieStore.loading" class="loading-section">
            <div class="spinner-border text-light" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="loading-text">Đang tải danh sách phim...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="categoryMovieStore.error" class="error-section">
            <div class="alert alert-danger" role="alert">
              Lỗi tải dữ liệu: {{ categoryMovieStore.error }}
              <button @click="loadCategoryMovies" class="btn btn-sm btn-outline-danger ms-2">Thử lại</button>
            </div>
          </div>
          
          <!-- Movies Grid -->
          <div v-else-if="categoryMovieStore.hasMovies" class="movies-grid">
            <MovieCard 
              v-for="movie in categoryMovieStore.movies" 
              :key="movie._id" 
              :movie="movie"
            />
          </div>
          
          <!-- No Data State -->
          <div v-else class="no-data-section">
            <div class="no-data-content">
              <i class="bi bi-film display-1 text-muted mb-3"></i>
              <h3 class="text-light mb-2">Không có phim nào</h3>
              <p class="text-muted mb-3">
                Không tìm thấy phim nào trong thể loại này.
              </p>
              <button @click="$router.push('/')" class="btn btn-retry">
                <i class="bi bi-house me-2"></i>
                Về trang chủ
              </button>
            </div>
          </div>
          
          <!-- Pagination -->
          <MoviePagination 
            v-if="categoryMovieStore.hasMovies && categoryMovieStore.pagination.totalPages > 1"
            :current-page="categoryMovieStore.pagination.currentPage"
            :total-pages="categoryMovieStore.pagination.totalPages"
            :total-items="categoryMovieStore.pagination.totalItems"
            @page-change="handlePageChange"
          />
        </section>
      </div>
    </main>
    
    <AppFooter></AppFooter>
  </div>
</template>

<script>
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'
import MovieCard from '@/components/MovieCard.vue'
import MoviePagination from '@/components/Pagination.vue'
import { useCategoryMovieStore } from '@/stores/categoryMovieStore'

export default {
  name: 'CategoryPage',
  components: {
    AppHeader,
    AppFooter,
    MovieCard,
    MoviePagination
  },
  setup() {
    const categoryMovieStore = useCategoryMovieStore()
    return { categoryMovieStore }
  },
  data() {
    return {
      categorySlug: null
    }
  },
  async mounted() {
    // Lấy category slug từ route params
    this.categorySlug = this.$route.params.slug
    if (this.categorySlug) {
      await this.loadCategoryMovies()
    }
  },
  
  async activated() {
    // Called when component is activated by keep-alive
    const newSlug = this.$route.params.slug
    
    // If slug changed or no data, reload
    if (newSlug !== this.categorySlug || (!this.categoryMovieStore.hasMovies && !this.categoryMovieStore.loading)) {
      this.categorySlug = newSlug
      if (this.categorySlug) {
        await this.loadCategoryMovies()
      }
    }
  },
  async beforeRouteUpdate(to, from, next) {
    // Khi route thay đổi (chuyển sang thể loại khác)
    this.categorySlug = to.params.slug
    if (this.categorySlug) {
      await this.loadCategoryMovies()
    }
    next()
  },
  methods: {
    async loadCategoryMovies() {
      if (this.categorySlug) {
        await this.categoryMovieStore.fetchMoviesByCategory(this.categorySlug, 1)
      }
    },
    
    async handlePageChange(page) {
      if (this.categorySlug) {
        await this.categoryMovieStore.changePage(this.categorySlug, page)
      }
    }
  }
}
</script>

<style scoped>
.category-page {
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

.category-container {
  padding-top: 3rem;
}

/* Category Section */
.category-section {
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
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 2px;
}

/* Category Stats */
.category-stats {
  text-align: center;
  margin-bottom: 2rem;
}

.stats-text {
  color: #a0a0a0;
  font-size: 1rem;
  margin: 0;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: inline-block;
}

.stats-text strong {
  color: #ff6b6b;
  font-weight: 600;
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
  
  .stats-text {
    font-size: 0.9rem;
    padding: 0.6rem 1.2rem;
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
  
  .category-container {
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
