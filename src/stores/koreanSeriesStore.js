import { defineStore } from 'pinia';

export const useKoreanSeriesStore = defineStore('koreanSeries', {
  state: () => ({
    movies: [],
    loading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalItemsPerPage: 10,
      currentPage: 1,
      totalPages: 0
    },
    lastFetchTime: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes cache
  }),

  getters: {
    hasMovies: (state) => state.movies && state.movies.length > 0,
    
    // Get featured movies (limit to show in slide)
    featuredMovies: (state) => state.movies.slice(0, 12),
    
    // Check if data is cached and still valid
    isCacheValid: (state) => {
      if (!state.lastFetchTime) return false;
      return Date.now() - state.lastFetchTime < state.cacheTimeout;
    }
  },

  actions: {
    async fetchKoreanSeries(page = 1, useCache = true) {
      // Use cache if valid and requested
      if (useCache && this.isCacheValid && this.hasMovies && page === 1) {
        console.log('Using cached Korean series data');
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        // API endpoint for Korean series (phim-bo + han-quoc filter)
        const apiUrl = `https://phimapi.com/v1/api/danh-sach/phim-bo?page=${page}&country=han-quoc&limit=8`;
        
        console.log('Fetching Korean series from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === true && data.data) {
          // Update movies list
          if (page === 1) {
            this.movies = data.data.items || [];
          } else {
            // Append for pagination
            this.movies = [...this.movies, ...(data.data.items || [])];
          }
          
          // Update pagination info
          if (data.data.params && data.data.params.pagination) {
            this.pagination = {
              totalItems: data.data.params.pagination.totalItems || 0,
              totalItemsPerPage: data.data.params.pagination.totalItemsPerPage || 10,
              currentPage: data.data.params.pagination.currentPage || 1,
              totalPages: data.data.params.pagination.totalPages || 0
            };
          }
          
          this.lastFetchTime = Date.now();
          console.log(`Loaded ${this.movies.length} Korean series movies`);
          
        } else {
          throw new Error(data.msg || 'Invalid API response format');
        }
        
      } catch (error) {
        console.error('Error fetching Korean series:', error);
        this.error = error.message || 'Không thể tải danh sách phim bộ Hàn Quốc';
        
        // Don't clear existing data on error, just show error message
        if (!this.hasMovies) {
          this.movies = [];
        }
      } finally {
        this.loading = false;
      }
    },

    // Load more movies (pagination)
    async loadMore() {
      if (this.loading || this.pagination.currentPage >= this.pagination.totalPages) {
        return;
      }
      
      const nextPage = this.pagination.currentPage + 1;
      await this.fetchKoreanSeries(nextPage, false);
    },

    // Refresh data (force reload)
    async refresh() {
      this.lastFetchTime = null;
      await this.fetchKoreanSeries(1, false);
    },

    // Clear store data
    clearData() {
      this.movies = [];
      this.error = null;
      this.loading = false;
      this.lastFetchTime = null;
      this.pagination = {
        totalItems: 0,
        totalItemsPerPage: 10,
        currentPage: 1,
        totalPages: 0
      };
    }
  }
});
