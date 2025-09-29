<template>
  <div class="saved-movies-page">
    <AppHeader />
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">Phim Đã Lưu</h1>
          <p v-if="savedMoviesStore.savedMovies.length > 0" class="page-subtitle">
            Đang hiển thị {{ displayedItemsCount }} / {{ savedMoviesStore.savedMovies.length }} phim
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-section text-center py-5">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="loading-text mt-3">Đang tải danh sách phim đã lưu...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-section alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ error }}
          <button @click="loadSavedMovies" class="btn btn-sm btn-outline-light ms-3">
            Thử lại
          </button>
        </div>

        <!-- Movies Grid -->
        <div v-else-if="paginatedMovies.length > 0" class="movies-grid">
          <MovieCardNew 
            v-for="movie in paginatedMovies"
            :key="movie.slug"
            :movie="movie"
            :show-remove-button="true"
            @remove-movie="handleRemoveMovie"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="bi bi-bookmark-x-fill empty-icon"></i>
          <h2 class="empty-title">Chưa có phim nào được lưu</h2>
          <p class="empty-text">Hãy khám phá và lưu lại những bộ phim bạn yêu thích nhé!</p>
          <router-link to="/" class="btn btn-primary mt-3">
            <i class="bi bi-film me-2"></i>Khám phá phim
          </router-link>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="savedMoviesStore.savedMovies.length"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSavedMoviesStore } from '@/stores/savedMoviesStore';
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';
import MovieCardNew from '@/components/MovieCardNew.vue';
import Pagination from '@/components/PaginationNew.vue';
import { useRoute, useRouter } from 'vue-router';

const savedMoviesStore = useSavedMoviesStore();
const route = useRoute();
const router = useRouter();

const handleRemoveMovie = (movieSlug) => {
  savedMoviesStore.removeMovie(movieSlug);
};

// State
const currentPage = ref(1);
const moviesPerPage = ref(20);
const isLoading = ref(true);
const error = ref(null);

// Load saved movies on component mount
onMounted(async () => {
  await loadSavedMovies();
  
  // Check for page parameter in URL
  if (route.query.page) {
    const page = parseInt(route.query.page, 10);
    if (!isNaN(page) && page > 0 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Watch for changes in the saved movies
watch(() => savedMoviesStore.savedMovies, () => {
  // Reset to first page if current page is no longer valid
  if (currentPage.value > 1 && currentPage.value > totalPages.value) {
    currentPage.value = 1;
    updateUrl();
  }
});

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(savedMoviesStore.savedMovies.length / moviesPerPage.value);
});

const paginatedMovies = computed(() => {
  const startIndex = (currentPage.value - 1) * moviesPerPage.value;
  const endIndex = startIndex + moviesPerPage.value;
  // Return a reversed copy of the array to show newest first
  return [...savedMoviesStore.savedMovies].reverse().slice(startIndex, endIndex);
});

const displayedItemsCount = computed(() => {
  const start = (currentPage.value - 1) * moviesPerPage.value + 1;
  const end = Math.min(currentPage.value * moviesPerPage.value, savedMoviesStore.savedMovies.length);
  return start <= end ? `${start}-${end}` : '0';
});

// Methods
const loadSavedMovies = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    await savedMoviesStore.loadMovies();
  } catch (err) {
    console.error('Lỗi khi tải phim đã lưu:', err);
    error.value = 'Không thể tải danh sách phim đã lưu. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const updateUrl = () => {
  const query = { ...route.query };
  
  if (currentPage.value > 1) {
    query.page = currentPage.value;
  } else {
    delete query.page;
  }
  
  router.replace({ query });
};
</script>

<style scoped>
.saved-movies-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

.main-content {
  flex: 1;
  padding: 2rem 0 4rem;
  color: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ff6b6b;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
}

.page-subtitle {
  color: #a0a0a0;
  font-size: 0.95rem;
  margin: 0;
}

/* Movies Grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* Loading State */
.loading-section {
  padding: 3rem 0;
  text-align: center;
}

.loading-text {
  color: #a0a0a0;
  margin-top: 1rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.2em;
}

/* Error State */
.error-section {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-section i {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.empty-icon {
  font-size: 4.5rem;
  color: rgba(255, 107, 107, 0.5);
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.7rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.75rem;
}

.empty-text {
  font-size: 1.05rem;
  color: #a0a0a0;
  max-width: 420px;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

/* Pagination Container */
.pagination-container {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 992px) {
  .page-title {
    font-size: 2rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 0 3rem;
  }
  
  .page-header {
    margin-bottom: 2rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .empty-icon {
    font-size: 4rem;
  }
  
  .empty-title {
    font-size: 1.5rem;
  }
  
  .empty-text {
    font-size: 1rem;
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
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .empty-icon {
    font-size: 3.5rem;
  }
  
  .empty-title {
    font-size: 1.3rem;
  }
  
  .empty-text {
    font-size: 0.95rem;
    max-width: 320px;
  }
}

@media (max-width: 400px) {
  .movies-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .btn-primary {
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
  }

  .container {
    padding: 0 0.5rem;
  }
}
</style>