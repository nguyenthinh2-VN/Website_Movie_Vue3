import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import CategoryPage from '@/views/CategoryPage.vue'
import MovieDetailPage from '@/views/MovieDetailPage.vue'
import AnimePage from '@/views/AnimePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/the-loai/:slug',
    name: 'Category',
    component: CategoryPage,
    props: true
  },
  {
    path: '/phim/:slug',
    name: 'MovieDetail',
    component: MovieDetailPage,
    props: true
  },
  {
    path: '/hoat-hinh',
    name: 'Anime',
    component: AnimePage
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a new route
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router
