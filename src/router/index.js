import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import CategoryPage from '@/views/CategoryPage.vue'
import MovieDetailPage from '@/views/MovieDetailPage.vue'
import WatchPage from '@/views/WatchPage.vue'
import AnimePage from '@/views/AnimePage.vue'
import SearchPage from '@/views/SearchPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { title: "Trang Chủ - Yuki Movie" },
    component: HomePage
  },
  {
    path: '/the-loai/:slug',
    name: 'Category',
    component: CategoryPage,
    meta: { title: "Thể Loại - Yuki Movie" },
    props: true
  },
  {
    path: '/phim/:slug',
    name: 'MovieDetail',
    component: MovieDetailPage,
    props: true
  },
  {
    path: '/xem/:slug/:serverIndex/:episodeIndex',
    name: 'watch',
    component: WatchPage,
    meta: { title: "Xem Phim" },
    props: true
  },
  {
    path: '/hoat-hinh',
    name: 'Anime',
    component: AnimePage,
    meta: { title: "Hoạt Hình" },
    props: true
  },
  {
    path: '/tim-kiem',
    name: 'Search',
    component: SearchPage,
    meta: { title: 'Tìm kiếm' },
    props: true
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // If only query parameters changed (like pagination), don't scroll
    if (to.path === from.path && to.name === from.name) {
      return false // Don't scroll
    }

    // If returning to a keep-alive cached page, restore saved position
    if (savedPosition) {
      return savedPosition
    }

    // For keep-alive pages (list pages), don't auto-scroll to top
    const keepAlivePages = ['Home', 'Category', 'Anime', 'Search'] // Thêm route name mới vào đây
    if (keepAlivePages.includes(to.name)) {
      return false // Let the page handle its own scroll position
    }

    // For other pages (like MovieDetail), scroll to top
    return { top: 0, behavior: 'smooth' }
  }
})

// Cập nhật title cho từng trang
router.beforeEach((to, from, next) => {
  // Chỉ cập nhật title cho các trang không có title động
  // CategoryPage và MovieDetail sẽ tự cập nhật title dựa trên dữ liệu
  const dynamicTitlePages = ['Category', 'MovieDetail'];

  if (!dynamicTitlePages.includes(to.name) && to.meta && to.meta.title) {
    document.title = to.meta.title
  } else if (!dynamicTitlePages.includes(to.name)) {
    document.title = 'Yuki Movie' // Title mặc định
  }
  next()
})

export default router
