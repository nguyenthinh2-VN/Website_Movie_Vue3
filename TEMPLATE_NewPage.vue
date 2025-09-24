<template>
  <div class="new-page">
    <AppHeader></AppHeader>
    
    <main class="main-content">
      <div class="container new-container">
        <section class="new-section">
          <!-- Page Title -->
          <h2 class="section-title">
            Tên Page Mới
          </h2>
          
          <!-- Stats -->
          <div v-if="newStore.pagination.totalItems > 0" class="new-stats">
            <p class="stats-text">
              Tìm thấy <strong>{{ newStore.pagination.totalItems.toLocaleString() }}</strong> items
            </p>
          </div>
          
          <!-- Loading State -->
          <div v-if="newStore.loading" class="loading-section">
            <div class="spinner-border text-light" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="loading-text">Đang tải dữ liệu...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="newStore.error" class="error-section">
            <div class="alert alert-danger" role="alert">
              Lỗi tải dữ liệu: {{ newStore.error }}
              <button @click="loadData" class="btn btn-sm btn-outline-danger ms-2">Thử lại</button>
            </div>
          </div>
          
          <!-- Data Grid -->
          <div v-else-if="newStore.hasData" class="data-grid">
            <MovieCard 
              v-for="item in newStore.items" 
              :key="item._id" 
              :movie="item"
            />
          </div>
          
          <!-- No Data State -->
          <div v-else class="no-data-section">
            <div class="no-data-content">
              <i class="bi bi-film display-1 text-muted mb-3"></i>
              <h3 class="text-light mb-2">Không có dữ liệu</h3>
              <p class="text-muted mb-3">Không tìm thấy dữ liệu nào.</p>
              <button @click="$router.push('/')" class="btn btn-retry">
                <i class="bi bi-house me-2"></i>
                Về trang chủ
              </button>
            </div>
          </div>
          
          <!-- Pagination -->
          <MoviePagination 
            v-if="newStore.hasData && newStore.pagination.totalPages > 1"
            :current-page="newStore.pagination.currentPage"
            :total-pages="newStore.pagination.totalPages"
            :total-items="newStore.pagination.totalItems"
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
import { useNewStore } from '@/stores/newStore' // Import store tương ứng

export default {
  name: 'NewPageName', // ⚠️ QUAN TRỌNG: Tên này phải match với keep-alive include
  components: {
    AppHeader,
    AppFooter,
    MovieCard,
    MoviePagination
  },
  setup() {
    const newStore = useNewStore()
    return { newStore }
  },
  data() {
    return {
      // Thêm data cần thiết
    }
  },
  async mounted() {
    // Load data when component mounts
    await this.loadData()
  },
  
  // ⚠️ QUAN TRỌNG: Thêm activated hook cho keep-alive
  async activated() {
    // Called when component is activated by keep-alive
    // Chỉ reload nếu cần thiết
    if (!this.newStore.hasData && !this.newStore.loading) {
      await this.loadData()
    }
  },
  
  methods: {
    async loadData() {
      // Lấy page từ URL query
      const page = this.$route.query.page ? parseInt(this.$route.query.page) : 1
      await this.newStore.fetchData(page)
    },
    
    async handlePageChange(page) {
      await this.newStore.changePage(page)
      // Cập nhật URL với page mới
      this.$router.push({ query: { page } })
    }
  }
}
</script>

<style scoped>
/* Copy CSS từ CategoryPage.vue hoặc AnimePage.vue và customize */
</style>