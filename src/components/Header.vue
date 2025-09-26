<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
    <div class="container">
      <!-- Brand/Logo -->
      <router-link class="navbar-brand fw-bold" to="/">
        <span class="text-gradient">Yuki Anime</span>
      </router-link>

      <!-- Mobile search and menu buttons -->
      <div class="mobile-controls d-lg-none">
        <!-- Mobile search button -->
        <button
          class="btn-mobile-header mobile-search-btn"
          type="button"
          @click="toggleMobileSearch"
          aria-label="Toggle search"
        >
          <i class="bi bi-search"></i>
        </button>

        <!-- Mobile menu button -->
        <button
          class="btn-mobile-header navbar-toggler"
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
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" @click="closeDropdowns">
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
          <li class="nav-item dropdown" ref="categoryDropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              :class="{ show: isCategoryDropdownOpen }"
              @click.prevent.stop="toggleCategoryDropdown"
              :aria-expanded="isCategoryDropdownOpen"
            >
              Thể loại
            </a>
            <ul
              class="dropdown-menu"
              :class="{ show: isCategoryDropdownOpen }"
              v-if="categoryStore.hasCategories"
            >
              <li
                v-for="category in categoryStore.categories"
                :key="category._id"
              >
                <router-link
                  class="dropdown-item"
                  :class="{
                    'active-category': activeCategorySlug === category.slug,
                  }"
                  :to="`/the-loai/${category.slug}`"
                  @click="closeDropdowns"
                >
                  {{ category.name }}
                </router-link>
              </li>
            </ul>
            <ul
              class="dropdown-menu"
              :class="{ show: isCategoryDropdownOpen }"
              v-else
            >
              <li>
                <span class="dropdown-item-text text-muted">{{
                  categoryStore.loading ? "Đang tải..." : "Lỗi"
                }}</span>
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
                  :alt="movie.name"
                  class="suggestion-poster"
                  loading="lazy"
                  @error="handleImageError"
                  @load="handleImageLoad"
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
              :alt="movie.name"
              class="suggestion-poster"
              loading="lazy"
              @error="handleImageError"
              @load="handleImageLoad"
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
      isCategoryDropdownOpen: false,
      showMobileSearch: false,
      showSuggestions: false,
      debounceTimer: null,
    };
  },
  computed: {
    // Tính toán active category một lần duy nhất
    activeCategorySlug() {
      const path = this.$route.path;
      if (path.startsWith("/the-loai/")) {
        return path.replace("/the-loai/", "");
      }
      return null;
    },
  },

  async mounted() {
    // Load categories when component mounts (sử dụng cache nếu có)
    await this.categoryStore.fetchCategories();

    // Add scroll listener for navbar effects
    this.handleScroll();
    window.addEventListener("scroll", this.handleScroll);
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    // Remove scroll listener
    window.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("click", this.handleClickOutside);
  },
  watch: {
    $route() {
      // Close category dropdown on navigation
      this.isCategoryDropdownOpen = false;

      // Close mobile navbar manually
      const navbarContent = document.getElementById("navbarContent");
      if (navbarContent) {
        navbarContent.classList.remove("show");
      }
    },
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
      if (!posterUrl) {
        return "";
      }
      let originalUrl;
      if (posterUrl.startsWith("http") || posterUrl.startsWith("//")) {
        originalUrl = posterUrl;
      } else {
        originalUrl = `https://phimimg.com/${posterUrl}`;
      }
      return `https://phimapi.com/image.php?url=${encodeURIComponent(
        originalUrl
      )}`;
    },
    handleSearch() {
      const q = this.searchQuery.trim();
      if (!q) return;
      // Close mobile search if open
      this.showMobileSearch = false;
      // Navigate to search page with page=1
      this.$router.push({ path: "/tim-kiem", query: { q, page: 1 } });
    },

    toggleCategoryDropdown() {
      this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    },

    closeDropdowns() {
      // Close category dropdown
      this.isCategoryDropdownOpen = false;

      // Close main navbar on mobile manually
      const navbarContent = document.getElementById("navbarContent");
      if (navbarContent) {
        navbarContent.classList.remove("show");
      }

      // Scroll to top of the page smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    handleClickOutside(event) {
      if (
        this.$refs.categoryDropdown &&
        !this.$refs.categoryDropdown.contains(event.target)
      ) {
        this.isCategoryDropdownOpen = false;
      }
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

    handleImageError(event) {
      // Set placeholder image when original fails to load
      event.target.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA0MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yMCAzMEM4Ljk1NDMgMzAgMCAyMS4wNDU3IDAgMTBDMCAxOC45NTQzIDguOTU0MyAzMCAyMCAzMFoiIGZpbGw9IiM1NTUiLz4KPHN2Zz4K";
      event.target.classList.add("error-placeholder");
    },

    handleImageLoad(event) {
      // Remove any error styling when image loads successfully
      event.target.classList.remove("error-placeholder");
    },
  },
};
</script>

<style scoped>
/* Custom navbar background */
.navbar {
  background: #131419 !important;
  padding: 9px 0;
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

/* Shared styles for mobile header buttons */
.btn-mobile-header {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3) !important; /* Use important to override Bootstrap */
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0; /* Reset padding to ensure perfect centering */
}

.btn-mobile-header:hover,
.btn-mobile-header:focus {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.5) !important;
  color: #ffffff;
  transform: scale(1.05);
  box-shadow: none !important; /* Remove Bootstrap's focus shadow */
}

/* Icon-specific adjustments for visual balance */
.mobile-search-btn i {
  font-size: 1.1rem; /* Slightly larger search icon */
}

.navbar-toggler-icon {
  width: 1.2em;
  height: 1.2em;
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

/* === New, Simplified Dropdown Styles === */
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
  transition: transform 0.2s ease-in-out;
}

/* Rotate arrow when dropdown is open */
.dropdown-toggle.show::after {
  transform: rotate(180deg);
}

.dropdown-menu {
  background: #1a1a2e;
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  margin-top: 0.5rem;
  min-width: 200px;
  max-height: 300px; /* Limit height and allow scrolling */
  overflow-y: auto;
  display: none; /* Hidden by default */
  position: absolute;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

/* Custom scrollbar for dropdown */
.dropdown-menu::-webkit-scrollbar {
  width: 5px;
}
.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}
.dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 107, 0.4);
  border-radius: 3px;
}

/* Show the dropdown when it has the .show class */
.dropdown-menu.show {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.dropdown-item {
  color: #e0e0e0 !important;
  padding: 0.5rem 1rem !important;
  border-radius: 8px !important;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Hover and focus effects */
.dropdown-item:hover,
.dropdown-item:focus {
  background: rgba(255, 107, 107, 0.15) !important;
  color: #ff8a8a !important;
}

/* Active category style */
.dropdown-item.active-category {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3) !important;
}

/* Active category hover effect */
.dropdown-item.active-category:hover,
.dropdown-item.active-category:focus {
  background: linear-gradient(45deg, #ff8a8a, #ffdd5d) !important;
  color: #ffffff !important;
  transform: translateX(2px);
}

.dropdown-item-text {
  padding: 0.5rem 1rem;
  color: black;
}

/* Mobile specific adjustments */
@media (max-width: 991px) {
  .dropdown-menu {
    position: static; /* Let it flow in the document */
    width: 100%;
    margin-top: 0.5rem;
    max-height: 250px;
    box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.3);
    background: rgba(15, 15, 25, 0.8);
  }

  .dropdown-item {
    text-align: center;
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
  background: linear-gradient(45deg, #333, #555);
  transition: opacity 0.3s ease;
}

.suggestion-poster[loading="lazy"] {
  background: linear-gradient(45deg, #333, #555);
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
}

.suggestion-poster.error-placeholder {
  opacity: 0.6;
  filter: grayscale(100%);
}

@keyframes shimmer {
  0% {
    background-position: -200% -200%;
  }
  100% {
    background-position: 200% 200%;
  }
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
