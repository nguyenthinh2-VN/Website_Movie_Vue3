import { defineStore } from 'pinia';

export const useTheaterMovieStore = defineStore('theaterMovie', {
  state: () => ({
    movies: [],
    loading: false,
    error: null,
    lastFetchTime: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes cache

    // For list page with pagination
    listMovies: [],
    listLoading: false,
    listError: null,
    pagination: {
      totalItems: 0,
      totalItemsPerPage: 24,
      currentPage: 1,
      totalPages: 0
    }
  }),

  getters: {
    hasMovies: (state) => state.movies && state.movies.length > 0,
    featuredMovies: (state) => state.movies.slice(0, 15),
    isCacheValid: (state) => {
      if (!state.lastFetchTime) return false;
      return Date.now() - state.lastFetchTime < state.cacheTimeout;
    },
    hasListMovies: (state) => state.listMovies && state.listMovies.length > 0
  },

  actions: {
    // For homepage slide
    async fetchTheaterMovies(useCache = true) {
      if (useCache && this.isCacheValid && this.hasMovies) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('https://phimapi.com/danh-sach/phim-chieu-rap?page=1&limit=15');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === true && data.items) {
          this.movies = data.items;
          this.lastFetchTime = Date.now();
        } else {
          throw new Error(data.msg || 'Invalid API response');
        }

      } catch (error) {
        console.error('Error fetching theater movies:', error);
        this.error = error.message || 'Không thể tải danh sách phim chiếu rạp';
        if (!this.hasMovies) {
          this.movies = [];
        }
      } finally {
        this.loading = false;
      }
    },

    // For list page with pagination
    async fetchTheaterMovieList(page = 1) {
      this.listLoading = true;
      this.listError = null;

      try {
        const response = await fetch(`https://phimapi.com/danh-sach/phim-chieu-rap?page=${page}&limit=24`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === true && data.items) {
          this.listMovies = data.items;

          if (data.pagination) {
            this.pagination = {
              totalItems: data.pagination.totalItems || 0,
              totalItemsPerPage: data.pagination.totalItemsPerPage || 24,
              currentPage: data.pagination.currentPage || page,
              totalPages: data.pagination.totalPages || 1
            };
          }
        } else {
          throw new Error(data.msg || 'Invalid API response');
        }

      } catch (error) {
        console.error('Error fetching theater movie list:', error);
        this.listError = error.message || 'Không thể tải danh sách phim chiếu rạp';
        this.listMovies = [];
      } finally {
        this.listLoading = false;
      }
    },

    clearData() {
      this.movies = [];
      this.error = null;
      this.loading = false;
      this.lastFetchTime = null;
    }
  }
});
