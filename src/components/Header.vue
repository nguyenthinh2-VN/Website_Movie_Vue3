<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
    <div class="container">
      <!-- Brand/Logo -->
      <a class="navbar-brand fw-bold" href="#">
        <span class="text-gradient">Yuki Anime</span>
      </a>

      <!-- Mobile search and menu buttons -->
      <div class="mobile-controls d-lg-none">
        <!-- Mobile search button -->
        <button
          class="mobile-search-btn"
          type="button"
          @click="toggleMobileSearch"
          aria-label="Toggle search"
        >
          <i class="bi bi-search"></i>
        </button>

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
      </div>

      <!-- Navbar content -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <!-- Navigation links -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: $route.name === 'Home' }"
              to="/"
              >Trang chủ</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: $route.name === 'Anime' }"
              to="/hoat-hinh"
              >Anime mới</router-link
            >
          </li>
          <li
            class="nav-item dropdown"
            @mouseenter="showDropdown = true"
            @mouseleave="showDropdown = false"
            :class="{ show: showDropdown || mobileDropdownOpen }"
          >
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              :class="{ show: showDropdown || mobileDropdownOpen }"
              @click.prevent="toggleMobileDropdown"
              aria-expanded="false"
            >
              Thể loại
            </a>
            <ul
              class="dropdown-menu"
              :class="{ show: showDropdown || mobileDropdownOpen }"
              v-if="categoryStore.hasCategories"
            >
              <li
                v-for="category in categoryStore.categories"
                :key="category._id"
              >
                <router-link
                  class="dropdown-item"
                  :to="`/the-loai/${category.slug}`"
                  @click="closeDropdowns"
                >
                  {{ category.name }}
                </router-link>
              </li>
            </ul>
            <ul
              class="dropdown-menu"
              :class="{ show: showDropdown || mobileDropdownOpen }"
              v-else-if="categoryStore.loading"
            >
              <li>
                <span class="dropdown-item-text text-muted">Đang tải...</span>
              </li>
            </ul>
            <ul
              class="dropdown-menu"
              :class="{ show: showDropdown || mobileDropdownOpen }"
              v-else-if="categoryStore.error"
            >
              <li>
                <span class="dropdown-item-text text-danger"
                  >Lỗi tải dữ liệu</span
                >
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Top anime</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Yêu thích</a>
          </li>
        </ul>

        <!-- Desktop Search form -->
        <div
          class="desktop-search-container position-relative d-none d-lg-flex"
        >
          <form
            class="w-100 d-flex"
            role="search"
            @submit.prevent="handleSearch"
          >
            <input
              class="form-control me-2 search-input"
              type="search"
              placeholder="Tìm kiếm anime..."
              v-model="searchQuery"
              @input="handleSearchInput"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
              autocomplete="off"
            />
            <button class="btn btn-search" type="submit">🔍</button>
          </form>

          <!-- Suggestions Dropdown -->
          <div
            v-if="showSuggestions && searchQuery.length > 0"
            class="suggestions-dropdown"
          >
            <div
              v-if="searchStore.suggestionsLoading"
              class="suggestion-item text-secondary"
            >
              Đang tìm...
            </div>
            <ul
              v-else-if="searchStore.suggestions.length > 0"
              class="list-unstyled mb-0"
            >
              <li
                v-for="movie in searchStore.suggestions.slice(0, 7)"
                :key="movie._id"
                class="suggestion-item"
                @mousedown.prevent="selectSuggestion(movie.slug)"
              >
                <img
                  :src="getImageUrl(movie.poster_url)"
                  alt=""
                  class="suggestion-poster"
                />
                <div class="suggestion-info">
                  <div class="suggestion-name">{{ movie.name }}</div>
                  <div class="suggestion-year text-muted">{{ movie.year }}</div>
                </div>
              </li>
              <li
                class="suggestion-item view-all"
                @mousedown.prevent="handleSearch"
              >
                Xem tất cả kết quả cho "{{ searchQuery }}"
              </li>
            </ul>
            <div v-else class="suggestion-item text-secondary">
              Không tìm thấy kết quả phù hợp.
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Search Dropdown -->
  <div
    class="mobile-search-dropdown d-lg-none"
    :class="{ show: showMobileSearch }"
  >
    <div class="container">
      <form
        class="mobile-search-form"
        role="search"
        @submit.prevent="handleSearch"
      >
        <div class="search-input-group">
          <input
            class="form-control mobile-search-input"
            type="search"
            placeholder="Tìm kiếm anime..."
            v-model="searchQuery"
            ref="mobileSearchInput"
            @input="handleSearchInput"
            autocomplete="off"
          />
          <button class="btn mobile-search-submit" type="submit">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </form>

      <!-- Mobile Suggestions -->
      <div
        v-if="searchQuery.length > 0"
        class="suggestions-dropdown mobile-suggestions"
      >
        <div
          v-if="searchStore.suggestionsLoading"
          class="suggestion-item text-secondary"
        >
          Đang tìm...
        </div>
        <ul
          v-else-if="searchStore.suggestions.length > 0"
          class="list-unstyled mb-0"
        >
          <li
            v-for="movie in searchStore.suggestions.slice(0, 5)"
            :key="movie._id"
            class="suggestion-item"
            @mousedown.prevent="selectSuggestion(movie.slug)"
          >
            <img
              :src="getImageUrl(movie.poster_url)"
              alt=""
              class="suggestion-poster"
            />
            <div class="suggestion-info">
              <div class="suggestion-name">{{ movie.name }}</div>
              <div class="suggestion-year text-muted">{{ movie.year }}</div>
            </div>
          </li>
          <li
            class="suggestion-item view-all"
            @mousedown.prevent="handleSearch"
          >
            Xem tất cả kết quả cho "{{ searchQuery }}"
          </li>
        </ul>
        <div v-else class="suggestion-item text-secondary">
          Không tìm thấy kết quả phù hợp.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCategoryStore } from "@/stores/categoryStore";
import { useSearchStore } from "@/stores/searchStore";

export default {
  name: "AppHeader",
  components: {},
  setup() {
    const categoryStore = useCategoryStore();
    const searchStore = useSearchStore();
    return { categoryStore, searchStore };
  },
  data() {
    return {
      searchQuery: "",
      showDropdown: false,
      mobileDropdownOpen: false,
      showMobileSearch: false,
      showSuggestions: false,
      debounceTimer: null,
    };
  },
  async mounted() {
    // Load categories when component mounts
    await this.categoryStore.fetchCategories();

    // Add scroll listener for navbar effects
    this.handleScroll();
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    // Remove scroll listener
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleSearchInput() {
      clearTimeout(this.debounceTimer);
      if (!this.searchQuery.trim()) {
        this.searchStore.clearSuggestions();
        return;
      }
      this.debounceTimer = setTimeout(() => {
        this.searchStore.fetchSearchSuggestions(this.searchQuery);
      }, 300);
    },
    hideSuggestions() {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    },
    selectSuggestion(slug) {
      this.searchQuery = "";
      this.searchStore.clearSuggestions();
      this.$router.push(`/phim/${slug}`);
    },
    getImageUrl(posterUrl) {
      if (
        posterUrl &&
        (posterUrl.startsWith("http") || posterUrl.startsWith("//"))
      ) {
        return posterUrl;
      }
      return `https://phimimg.com/${posterUrl}`;
    },
    handleSearch() {
      const q = this.searchQuery.trim();
      if (!q) return;
      // Close mobile search if open
      this.showMobileSearch = false;
      // Navigate to search page with page=1
      this.$router.push({ path: "/tim-kiem", query: { q, page: 1 } });
    },

    toggleMobileDropdown() {
      // Only toggle on mobile (when screen width < 992px)
      if (window.innerWidth < 992) {
        this.mobileDropdownOpen = !this.mobileDropdownOpen;
      }
      // Prevent default behavior for all cases since we're using @click.prevent
    },

    closeDropdowns() {
      // Close all dropdowns when navigating
      this.mobileDropdownOpen = false;
      this.showDropdown = false;
    },

    selectCategory(category) {
      console.log("Selected category:", category);
      this.closeDropdowns();

      // Navigate to category page
      try {
        this.$router.push(`/the-loai/${category.slug}`);
        console.log("Navigating to:", `/the-loai/${category.slug}`);
      } catch (error) {
        console.error("Navigation error:", error);
      }
    },

    handleScroll() {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }
    },

    toggleMobileSearch() {
      this.showMobileSearch = !this.showMobileSearch;

      // Focus on input when opening
      if (this.showMobileSearch) {
        this.$nextTick(() => {
          if (this.$refs.mobileSearchInput) {
            this.$refs.mobileSearchInput.focus();
          }
        });
      }
    },
  },
};
</script>

<style scoped>
/* Custom navbar background */
.navbar {
  background: #131419 !important;
  padding: 10px 0;
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  width: 100%;
  transition: all 0.3s ease;
}

.navbar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 107, 107, 0.05) 50%,
    transparent 100%
  );
  pointer-events: none;
}

/* Navbar scroll effects */
.navbar.scrolled {
  padding: 0.5rem 0;
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.navbar.scrolled::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 107, 107, 0.08) 50%,
    transparent 100%
  );
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

/* Mobile controls */
.mobile-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-search-btn {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mobile-search-btn:hover,
.mobile-search-btn:focus {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5);
  color: #ffffff;
  transform: scale(1.05);
}

.mobile-search-btn i {
  font-size: 1rem;
}

/* Mobile toggle button */
.navbar-toggler {
  border: 1px solid rgba(255, 107, 107, 0.3) !important;
  background: rgba(255, 107, 107, 0.2);
  width: 40px;
  height: 40px;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 107, 107, 0.3) !important;
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .navbar-nav {
    margin: 0.5rem 0;
  }

  .navbar-nav .nav-link {
    text-align: center;
    margin: 0.1rem 0;
    padding: 0.4rem 1rem !important;
  }

  form[role="search"] {
    margin-top: 0.75rem;
    justify-content: center;
  }

  .search-input {
    width: 200px !important;
  }

  /* Fix container spacing */
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Ensure proper sp

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
  margin-top: 0 !important;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem 0 !important;
  min-width: 180px;
  width: auto;
  white-space: nowrap;
  opacity: 0 !important;
  visibility: hidden !important;
  transform: translateY(-15px) scale(0.9) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  pointer-events: none !important;
  display: block !important;
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
  pointer-events: auto !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced nav-item dropdown show animation */
.nav-item.dropdown.show .dropdown-menu {
  opacity: 1 !important;
  visibility: visible !important;
  transform: translateY(0) scale(1) !important;
  pointer-events: auto !important;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: block !important;
}

/* Override Bootstrap dropdown defaults */
.navbar .dropdown-menu {
  display: block !important;
}

.navbar .dropdown-menu:not(.show) {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: all 0.5s ease !important;
  pointer-events: none !important;
}
/* Smooth transition for dropdown items */
.dropdown-menu li {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.2s ease;
  transition-delay: 0s;
}

.dropdown-menu.show li {
  opacity: 1;
  transform: translateX(0);
}

.dropdown-menu.show li:nth-child(1) {
  transition-delay: 0.05s;
}
.dropdown-menu.show li:nth-child(2) {
  transition-delay: 0.1s;
}
.dropdown-menu.show li:nth-child(3) {
  transition-delay: 0.15s;
}
.dropdown-menu.show li:nth-child(4) {
  transition-delay: 0.2s;
}
.dropdown-menu.show li:nth-child(5) {
  transition-delay: 0.25s;
}
.dropdown-menu.show li:nth-child(n + 6) {
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
  /* Add invisible bridge to prevent dropdown from disappearing */
  .dropdown::before {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 8px;
    background: transparent;
    z-index: 999;
  }

  .dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .dropdown:hover .dropdown-menu li {
    opacity: 1;
    transform: translateX(0);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 1000;
    min-width: 200px;
    width: max-content;
    max-width: 280px;
  }

  .dropdown.show .dropdown-menu,
  .dropdown-menu.show {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) scale(1) !important;
    pointer-events: auto !important;
  }

  .dropdown.show .dropdown-menu li,
  .dropdown-menu.show li {
    opacity: 1 !important;
    transform: translateX(0) !important;
  }

  .dropdown-item {
    width: auto;
    margin: 0 0.5rem !important;
  }
}

/* Mobile specific styles */
@media (max-width: 991px) {
  /* Remove bridge on mobile */
  .dropdown::before {
    display: none;
  }

  /* Fix navbar collapse positioning */
  .navbar-collapse {
    margin-top: 0.5rem;
  }

  .dropdown-menu {
    position: static !important;
    float: none;
    width: 100%;
    margin-top: 0.25rem !important;
    background: rgba(22, 33, 62, 0.95) !important;
    border-radius: 10px !important;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    overflow-x: hidden;
    min-width: unset;
    transform: translateY(-5px) scale(0.98);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 0;
    padding: 0 !important;
  }

  .dropdown-menu.show {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) scale(1) !important;
    pointer-events: auto !important;
    max-height: 300px !important;
    padding: 0.5rem 0 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .nav-item.dropdown.show .dropdown-menu {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) scale(1) !important;
    pointer-events: auto !important;
    max-height: 300px !important;
    padding: 0.5rem 0 !important;
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

  /* Fix navbar toggler positioning */
  .navbar-toggler {
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    line-height: 1;
    border-radius: 0.375rem;
  }

  .navbar-toggler-icon {
    width: 1.2em;
    height: 1.2em;
  }
}

/* Mobile Search Dropdown */
.mobile-search-dropdown {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 107, 107, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  padding: 1rem;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 1000;
  position: fixed;
}

.mobile-search-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.mobile-search-form {
  width: 100%;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.mobile-search-input {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border-radius: 25px !important;
  padding: 0.5rem 1rem !important;
  font-size: 1rem;
  flex: 1;
}

.mobile-search-input:focus {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 107, 107, 0.5) !important;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.3) !important;
  color: #ffffff !important;
  outline: none;
}

.mobile-search-input::placeholder {
  color: #a0a0a0 !important;
}

.mobile-search-submit {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d) !important;
  border: none !important;
  border-radius: 50% !important;
  color: #ffffff !important;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.mobile-search-submit:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4) !important;
  color: #ffffff !important;
}

.mobile-search-submit i {
  font-size: 1rem;
}

/* Hide mobile search on desktop */
@media (min-width: 992px) {
  .mobile-search-dropdown {
    display: none !important;
  }
}

/* Search Suggestions */
.desktop-search-container {
  flex: 1;
  max-width: 350px;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a2e;
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 15px;
  margin-top: 8px;
  z-index: 1100;
  max-height: 400px;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.suggestion-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-poster {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 0.75rem;
}

.suggestion-info {
  overflow: hidden;
}

.suggestion-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  color: #fff;
}

.suggestion-year {
  font-size: 0.8rem;
}

.view-all {
  font-weight: bold;
  color: #ff6b6b;
  justify-content: center;
  font-style: italic;
}

.mobile-suggestions {
  position: static;
  margin-top: 1rem;
  border-radius: 10px;
  max-height: calc(100vh - 200px); /* Prevent it from taking the whole screen */
}
</style>
