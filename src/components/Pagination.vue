<template>
  <nav aria-label="Movie pagination" class="pagination-wrapper">
    <ul class="pagination justify-content-center">
      <!-- Previous Button -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button
          class="page-link"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <i class="bi bi-chevron-left"></i>
          Trước
        </button>
      </li>

      <!-- First Page -->
      <li
        v-if="showFirstPage"
        class="page-item"
        :class="{ active: currentPage === 1 }"
      >
        <button class="page-link" @click="changePage(1)">1</button>
      </li>

      <!-- First Ellipsis -->
      <li v-if="showFirstEllipsis" class="page-item disabled">
        <span class="page-link">...</span>
      </li>

      <!-- Page Numbers -->
      <li
        v-for="page in visiblePages"
        :key="page"
        class="page-item"
        :class="{ active: currentPage === page }"
      >
        <button class="page-link" @click="changePage(page)">{{ page }}</button>
      </li>

      <!-- Last Ellipsis -->
      <li v-if="showLastEllipsis" class="page-item disabled">
        <span class="page-link">...</span>
      </li>

      <!-- Last Page -->
      <li
        v-if="showLastPage"
        class="page-item"
        :class="{ active: currentPage === totalPages }"
      >
        <button class="page-link" @click="changePage(totalPages)">
          {{ totalPages }}
        </button>
      </li>

      <!-- Next Button -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button
          class="page-link"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Sau
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>

    <!-- Page Info -->
    <div class="pagination-info">
      <span class="page-info-text">
        Trang {{ currentPage }} / {{ totalPages }} ({{
          totalItems.toLocaleString()
        }}
        phim)
      </span>
    </div>
  </nav>
</template>

<script>
export default {
  name: "MoviePagination",
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    maxVisiblePages: {
      type: Number,
      default: 5,
    },
  },
  emits: ["page-change"],
  computed: {
    visiblePages() {
      const pages = [];
      const half = Math.floor(this.maxVisiblePages / 2);
      let start = Math.max(2, this.currentPage - half);
      let end = Math.min(this.totalPages - 1, this.currentPage + half);

      // Adjust if we're near the beginning or end
      if (this.currentPage <= half + 1) {
        end = Math.min(this.totalPages - 1, this.maxVisiblePages);
      }
      if (this.currentPage >= this.totalPages - half) {
        start = Math.max(2, this.totalPages - this.maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== this.totalPages) {
          pages.push(i);
        }
      }
      return pages;
    },
    showFirstPage() {
      return this.totalPages > 1;
    },
    showLastPage() {
      return this.totalPages > 1 && this.currentPage !== this.totalPages;
    },
    showFirstEllipsis() {
      return this.visiblePages.length > 0 && this.visiblePages[0] > 2;
    },
    showLastEllipsis() {
      return (
        this.visiblePages.length > 0 &&
        this.visiblePages[this.visiblePages.length - 1] < this.totalPages - 1
      );
    },
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit("page-change", page);
      }
    },
  },
};
</script>

<style scoped>
.pagination-wrapper {
  margin: 3rem 0;
  text-align: center;
}

.pagination {
  margin-bottom: 1rem;
}

.page-link {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 0.75rem 1rem;
  margin: 0 2px;
  border-radius: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.page-link:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  transform: translateY(-2px);
}

.page-item.active .page-link {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-color: transparent;
  color: #ffffff;
  font-weight: bold;
}

.page-item.disabled .page-link {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.page-link:disabled {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.pagination-info {
  margin-top: 1rem;
}

.page-info-text {
  color: #a0a0a0;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .page-info-text {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 576px) {
  .page-link {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
    margin: 0 1px;
  }

  .pagination-wrapper {
    margin: 2rem 0;
  }
}
</style>
