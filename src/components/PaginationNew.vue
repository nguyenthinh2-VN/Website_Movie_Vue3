<template>
  <div class="pagination-wrapper">
    <n-pagination 
      v-model:page="currentPageModel"
      :page-count="totalPages" 
      simple 
      @update:page="handlePageChange"
    />
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, watch } from "vue";
import { NPagination } from "naive-ui";

// Props
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1
  },
  totalPages: {
    type: Number,
    required: true,
    default: 1
  }
});

// Emits
const emit = defineEmits(['page-change']);

// Reactive current page model for v-model
const currentPageModel = ref(props.currentPage);

// Watch for prop changes to sync with parent
watch(() => props.currentPage, (newPage) => {
  if (newPage !== currentPageModel.value) {
    currentPageModel.value = newPage;
  }
}, { immediate: true });

// Handle page change
const handlePageChange = (page) => {
  emit('page-change', page);
};
</script>

<style scoped>
.pagination-wrapper {
  margin: 64px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

/* Fix for Naive UI input wrapper */
.pagination-wrapper :deep(.n-input-wrapper) {
  background: #2F3346 !important;
  border: none;
  border-radius: 6px !important;
}

.pagination-wrapper :deep(.n-input) {
  background: transparent !important;
  color: #ffffff !important;
}

.pagination-wrapper :deep(.n-input__input-el) {
  background: transparent !important;
  color: #ffffff !important;
  text-align: center !important;
  border: none;
}

.pagination-wrapper :deep(.n-pagination) {
  justify-content: center;
  align-items: center;
  display: flex !important;
  flex-wrap: nowrap !important;
  border: none;
  gap: 16px;
  width: 100%;
}

/* Custom styling for Naive UI pagination */
.pagination-wrapper :deep(.n-pagination-item) {
  background: #2F3346;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  margin: 0;
  padding: 8px 12px;
  min-width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 22.4px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  box-sizing: border-box;
}

.pagination-wrapper :deep(.n-pagination-item:hover) {
  background: #252837;
  border: none;
}

.pagination-wrapper :deep(.n-pagination-item--active) {
  background: #3A4052;
  color: black;
  font-weight: 600;
  border: none;
}

.pagination-wrapper :deep(.n-pagination-item--disabled) {
  background: #2f334670 !important;
  color: gray;
  cursor: not-allowed;
  border: none;
}

.pagination-wrapper :deep(.n-pagination-prefix),
.pagination-wrapper :deep(.n-pagination-suffix) {
  color: #ffffff;
  font-size: 14px;
  line-height: 22.4px;
  margin: 0 8px;
  white-space: nowrap;
  flex-shrink: 0;
  border: none;
}


/* Responsive */
@media (max-width: 768px) {
  .pagination-wrapper {
    margin: 32px 0;
  }
  
  .pagination-wrapper :deep(.n-pagination) {
    column-gap: 8px;
  }
  
  .pagination-wrapper :deep(.n-pagination-item) {
    min-width: 36px;
    height: 36px;
    padding: 6px 10px;
    font-size: 13px;
  }
}
</style>