import { defineStore } from 'pinia'

export const useNewStore = defineStore('newStoreName', {
  state: () => ({
    items: [], // Thay đổi tên phù hợp
    loading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalItemsPerPage: 20,
      currentPage: 1,
      totalPages: 0
    }
  }),

  getters: {
    // Kiểm tra có data hay không
    hasData: (state) => state.items.length > 0
  },

  actions: {
    async fetchData(page = 1, silent = false) {
      if (!silent) {
        this.loading = true
        this.error = null
      }
      
      try {
        // ⚠️ Thay đổi API URL phù hợp
        const response = await fetch(`YOUR_API_URL?page=${page}&limit=20`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (!silent) {
          console.log('API Response:', data)
        }
        
        if (data.status) {
          // ⚠️ Điều chỉnh theo cấu trúc API response
          if (data.data && data.data.items) {
            this.items = data.data.items
            
            // Cập nhật pagination
            if (data.data.params && data.data.params.pagination) {
              this.pagination = {
                totalItems: data.data.params.pagination.totalItems || 0,
                totalItemsPerPage: data.data.params.pagination.totalItemsPerPage || 20,
                currentPage: data.data.params.pagination.currentPage || page,
                totalPages: data.data.params.pagination.totalPages || 1
              }
            }
            
            if (!silent) {
              console.log('Data loaded:', this.items.length)
              console.log('Pagination info:', this.pagination)
            }
            
          } else {
            throw new Error('Invalid data structure')
          }
          
        } else {
          throw new Error(data.msg || 'Failed to fetch data')
        }
        
      } catch (error) {
        this.error = error.message
        console.error('Error fetching data:', error)
      } finally {
        if (!silent) {
          this.loading = false
        }
      }
    },

    async changePage(page) {
      if (page === this.pagination.currentPage || this.loading) return
      
      await this.fetchData(page)
      
      // ⚠️ QUAN TRỌNG: Scroll đến section-title khi chuyển trang
      const sectionTitle = document.querySelector('.section-title')
      if (sectionTitle) {
        sectionTitle.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      } else {
        // Fallback to top if section-title not found
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },

    // Reset store
    resetStore() {
      this.items = []
      this.loading = false
      this.error = null
      this.pagination = {
        totalItems: 0,
        totalItemsPerPage: 20,
        currentPage: 1,
        totalPages: 0
      }
    }
  }
})