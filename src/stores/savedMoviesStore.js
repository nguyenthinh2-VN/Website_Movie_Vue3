import { defineStore } from 'pinia';

export const useSavedMoviesStore = defineStore('savedMovies', {
  state: () => ({
    savedMovies: JSON.parse(localStorage.getItem('savedMovies')) || [],
  }),
  getters: {
    // Getter này sẽ tự động phản ứng với thay đổi của state.savedMovies
    savedCount: (state) => state.savedMovies.length,

    isMovieSaved: (state) => (movieSlug) => {
      return state.savedMovies.some(movie => movie.slug === movieSlug);
    },
  },
  actions: {
    addMovie(movie) {
      // Đảm bảo movie và movie.slug tồn tại trước khi thêm
      if (movie && movie.slug && !this.isMovieSaved(movie.slug)) {
        // Create a plain JavaScript object clone to remove reactivity before saving
        const movieClone = JSON.parse(JSON.stringify(movie));
        this.savedMovies.push(movieClone);
        this.updateLocalStorage();
      }
    },

    removeMovie(movieSlug) {
      this.savedMovies = this.savedMovies.filter(movie => movie.slug !== movieSlug);
      this.updateLocalStorage();
    },

    toggleSaveMovie(movie) {
      if (this.isMovieSaved(movie.slug)) {
        this.removeMovie(movie.slug);
      } else {
        this.addMovie(movie);
      }
    },

    updateLocalStorage() {
      localStorage.setItem('savedMovies', JSON.stringify(this.savedMovies));
    },

    loadMovies() {
      const movies = localStorage.getItem('savedMovies');
      if (movies) {
        this.savedMovies = JSON.parse(movies);
      }
    }
  },
});
