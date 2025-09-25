<template>
  <div class="search-dropdown-wrapper">
    <button class="btn btn-search-icon" @click="toggleDropdown" aria-label="Tìm kiếm">
      <img src="/search-icon.png" alt="search" width="28" height="28" />
    </button>
    <transition name="fade">
      <div v-if="showDropdown" class="search-dropdown-content">
        <input
          v-model="keyword"
          @keyup.enter="goToSearchPage"
          @input="onInput"
          class="form-control search-input"
          placeholder="Nhập từ khóa phim..."
          autofocus
        />
        <ul v-if="results.length" class="search-result-list">
          <li v-for="movie in results.slice(0, 10)" :key="movie._id" @click="selectMovie(movie)">
            <img :src="movie.poster_url" alt="" class="result-thumb" />
            <span>{{ movie.name }}</span>
          </li>
        </ul>
        <div v-else-if="loading" class="search-loading">Đang tìm kiếm...</div>
        <div v-else-if="keyword && !loading" class="search-no-result">Không tìm thấy phim phù hợp.</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSearchStore } from '@/stores/searchStore';
import { useRouter } from 'vue-router';

const keyword = ref('');
const showDropdown = ref(false);
const loading = ref(false);
const results = ref([]);
const router = useRouter();
const store = useSearchStore();
const page = ref(1);
const limit = 20;

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    setTimeout(() => {
      document.querySelector('.search-input')?.focus();
    }, 100);
  }
}

async function onInput() {
  if (!keyword.value.trim()) {
    results.value = [];
    return;
  }
  loading.value = true;
  // Kiểm tra cache
  const cacheKey = `${keyword.value.trim()}-${page.value}`;
  const cached = store.cache[cacheKey];
  if (cached) {
    results.value = cached;
    loading.value = false;
    return;
  }
  // Gọi API
  try {
    const res = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword.value.trim())}&page=${page.value}&limit=${limit}`);
    const data = await res.json();
    results.value = data.data || [];
    store.cache[cacheKey] = results.value;
  } catch (e) {
    results.value = [];
  }
  loading.value = false;
}

function selectMovie(movie) {
  showDropdown.value = false;
  router.push(`/phim/${movie.slug}`);
}

function goToSearchPage() {
  showDropdown.value = false;
  router.push({ path: '/tim-kiem', query: { q: keyword.value.trim(), page: page.value } });
}

watch(keyword, onInput);
</script>

<style scoped>
.search-dropdown-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-search-icon {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  border-radius: 20px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.search-dropdown-content {
  position: absolute;
  left: 0;
  top: 48px;
  background: #23243a;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  padding: 16px;
  min-width: 320px;
  z-index: 1000;
}
.search-input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #ff6b6b;
  padding: 8px 12px;
  margin-bottom: 10px;
  background: #23243a;
  color: #fff;
}
.search-result-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 320px;
  overflow-y: auto;
}
.search-result-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}
.search-result-list li:hover {
  background: rgba(255,107,107,0.12);
}
.result-thumb {
  width: 32px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}
.search-loading,
.search-no-result {
  color: #ff6b6b;
  padding: 8px 0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>