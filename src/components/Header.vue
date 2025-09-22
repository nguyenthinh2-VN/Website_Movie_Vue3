<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
    <div class="container">
      <!-- Brand/Logo -->
      <a class="navbar-brand fw-bold" href="#">
        <span class="text-gradient">Yuki Anime</span>
      </a>

      <!-- Mobile menu button -->
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarContent"
        aria-controls="navbarContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar content -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <!-- Navigation links -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: $route.name === 'Home' }" to="/">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Anime mới</a>
          </li>
          <li class="nav-item dropdown" 
              @mouseenter="showDropdown = true" 
              @mouseleave="showDropdown = false"
              :class="{ 'show': showDropdown || mobileDropdownOpen }"
          >
            <a class="nav-link dropdown-toggle" 
               href="#" 
               role="button" 
               :class="{ 'show': showDropdown || mobileDropdownOpen }"
               @click.prevent="toggleMobileDropdown"
               aria-expanded="false"
            >
              Thể loại
            </a>
            <ul class="dropdown-menu" 
                :class="{ 'show': showDropdown || mobileDropdownOpen }"
                v-if="categoryStore.hasCategories"
            >
              <li v-for="category in categoryStore.categories" :key="category._id">
                <router-link 
                   class="dropdown-item" 
                   :to="`/the-loai/${category.slug}`"
                   @click="closeDropdowns"
                >
                  {{ category.name }}
                </router-link>
              </li>
            </ul>
            <ul class="dropdown-menu" 
                :class="{ 'show': showDropdown || mobileDropdownOpen }"
                v-else-if="categoryStore.loading"
            >
              <li><span class="dropdown-item-text text-muted">Đang tải...</span></li>
            </ul>
            <ul class="dropdown-menu" 
                :class="{ 'show': showDropdown || mobileDropdownOpen }"
                v-else-if="categoryStore.error"
            >
              <li><span class="dropdown-item-text text-danger">Lỗi tải dữ liệu</span></li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Top anime</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Yêu thích</a>
          </li>
        </ul>

        <!-- Search form -->
        <form class="d-flex" role="search">
          <input 
            class="form-control me-2 search-input" 
            type="search" 
            placeholder="Tìm kiếm anime..." 
            v-model="searchQuery"
          >
          <button class="btn btn-search" type="submit" @click.prevent="handleSearch">
            🔍
          </button>
        </form>
      </div>
    </div>
  </nav>
</template>

<script>
import { useCategoryStore } from '@/stores/categoryStore'

export default {
  name: 'AppHeader',
  setup() {
    const categoryStore = useCategoryStore()
    return { categoryStore }
  },
  data() {
    return {
      searchQuery: '',
      showDropdown: false,
      mobileDropdownOpen: false
    }
  },
  async mounted() {
    // Load categories when component mounts
    await this.categoryStore.fetchCategories()
  },
  methods: {
    handleSearch() {
      console.log('Searching for:', this.searchQuery)
      // Implement search functionality here
    },
    
    toggleMobileDropdown() {
      // Only toggle on mobile (when screen width < 992px)
      if (window.innerWidth < 992) {
        this.mobileDropdownOpen = !this.mobileDropdownOpen
      }
      // Prevent default behavior for all cases since we're using @click.prevent
    },
    
    closeDropdowns() {
      // Close all dropdowns when navigating
      this.mobileDropdownOpen = false
      this.showDropdown = false
    },
    
    selectCategory(category) {
      console.log('Selected category:', category)
      this.closeDropdowns()
      
      // Navigate to category page
      try {
        this.$router.push(`/the-loai/${category.slug}`)
        console.log('Navigating to:', `/the-loai/${category.slug}`)
      } catch (error) {
        console.error('Navigation error:', error)
      }
    }
  }
}
</script>

<style scoped>
/* Custom navbar background */
.navbar {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
  padding: 1rem 0;
}

/* Logo gradient text */
.text-gradient {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.8rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Navigation links styling */
.navbar-nav .nav-link {
  color: #ffffff !important;
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  border-radius: 20px;
  transition: all 0.3s ease;
  margin: 0 0.2rem;
  position: relative;
}

.navbar-nav .nav-link:hover,
.navbar-nav .nav-link.active {
  background: rgba(255, 107, 107, 0.2) !important;
  transform: translateY(-2px);
}

/* Removed underline effects */

/* Search input styling */
.search-input {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border-radius: 20px !important;
  backdrop-filter: blur(10px);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 107, 107, 0.5) !important;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.3) !important;
  color: #ffffff !important;
}

.search-input::placeholder {
  color: #a0a0a0 !important;
}

/* Search button */
.btn-search {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d) !important;
  border: none !important;
  border-radius: 20px !important;
  color: #ffffff !important;
  font-size: 1.1rem;
  padding: 0.375rem 0.75rem !important;
  transition: all 0.3s ease;
}

.btn-search:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4) !important;
  color: #ffffff !important;
}

/* Mobile toggle button */
.navbar-toggler {
  border: 1px solid rgba(255, 107, 107, 0.3) !important;
  background: rgba(255, 107, 107, 0.2);
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 107, 0.3) !important;
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .navbar-nav {
    margin: 1rem 0;
  }
  
  .navbar-nav .nav-link {
    text-align: center;
    margin: 0.2rem 0;
  }
  
  form[role="search"] {
    margin-top: 1rem;
    justify-content: center;
  }
  
  .search-input {
    width: 200px !important;
  }
}

@media (max-width: 576px) {
  .text-gradient {
    font-size: 1.5rem;
  }
  
  .search-input {
    width: 180px !important;
    font-size: 0.9rem !important;
  }
  
  .navbar-nav .nav-link {
    font-size: 0.95rem;
    padding: 0.4rem 0.8rem !important;
  }
}

@media (max-width: 400px) {
  .search-input {
    width: 150px !important;
  }
  
  .text-gradient {
    font-size: 1.3rem;
  }
}

/* Smooth animations */
.navbar-collapse {
  transition: all 0.3s ease;
}

/* Shadow enhancement */
.shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

/* Dropdown Styles */
.dropdown {
  position: relative;
}

.dropdown-toggle::after {
  display: inline-block;
  margin-left: 0.255em;
  vertical-align: 0.255em;
  content: "";
  border-top: 0.3em solid;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
  transition: transform 0.3s ease;
}

.dropdown-toggle.show::after {
  transform: rotate(180deg);
}

.dropdown-menu {
  background: rgba(26, 26, 46, 0.95) !important;
  border: 1px solid rgba(255, 107, 107, 0.2) !important;
  border-radius: 15px !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  margin-top: 0.5rem !important;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem 0 !important;
  min-width: 180px;
  width: auto;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px) scale(0.95);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-delay: 0.1s;
}

.dropdown-item {
  color: #ffffff !important;
  padding: 0.6rem 1.2rem !important;
  transition: all 0.3s ease;
  border-radius: 8px !important;
  margin: 0 0.5rem !important;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: calc(100% - 1rem);

}

.dropdown-item:hover,
.dropdown-item:focus {
  background: rgba(255, 107, 107, 0.2) !important;
  color: #ff6b6b !important;
  transform: translateX(5px);
}

.dropdown-menu.show {
  opacity: 1 !important;
  visibility: visible !important;
  transform: translateY(0) scale(1) !important;
  transition-delay: 0.2s;
}

.dropdown:hover .dropdown-menu {
  transition-delay: 0.3s;
}

.dropdown:not(:hover) .dropdown-menu {
  transition-delay: 0.3s;
}

.dropdown-item-text {
  padding: 0.6rem 1.2rem !important;
  margin: 0 0.5rem !important;
  font-size: 0.9rem;
}

/* Custom scrollbar for dropdown */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 107, 0.5);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 107, 0.7);
}

/* Desktop hover behavior */
@media (min-width: 992px) {
  .dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 200px;
    width: max-content;
    max-width: 300px;
  }
  
  .dropdown.show .dropdown-menu,
  .dropdown-menu.show {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) scale(1) !important;
  }
  
  .dropdown-item {
    width: auto;
    margin: 0 0.5rem !important;
  }
}

/* Mobile specific styles */
@media (max-width: 991px) {
  .dropdown-menu {
    position: static !important;
    float: none;
    width: 100%;
    margin-top: 0.5rem !important;
    background: rgba(22, 33, 62, 0.95) !important;
    border-radius: 10px !important;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    overflow-x: hidden;
    min-width: unset;
    transform: translateY(-5px) scale(0.98);
    transition: all 0.25s ease-out;
  }
  
  .dropdown-menu.show {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) scale(1) !important;
  }
  
  .dropdown-item {
    text-align: center;
    margin: 0.2rem 0.5rem !important;
    width: calc(100% - 1rem);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .dropdown-item:hover {
    transform: none;
    background: rgba(255, 107, 107, 0.15) !important;
  }
}
</style>
