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
        console.log('Adding movie:', movie.name, 'with slug:', movie.slug);
        const movieClone = JSON.parse(JSON.stringify(movie));
        this.savedMovies.push(movieClone);
        this.updateLocalStorage();
        console.log('Movie added successfully. Total saved movies:', this.savedMovies.length);
      } else {
        console.log('Movie not added - already exists or invalid data');
      }
    },

    removeMovie(movieSlug) {
      const initialLength = this.savedMovies.length;
      this.savedMovies = this.savedMovies.filter(movie => movie.slug !== movieSlug);
      if (this.savedMovies.length < initialLength) {
        this.updateLocalStorage();
      }
    },

    toggleSaveMovie(movie) {
      if (!movie || !movie.slug) {
        console.error('Movie object or slug is missing');
        return;
      }

      if (this.isMovieSaved(movie.slug)) {
        this.removeMovie(movie.slug);
      } else {
        this.addMovie(movie);
      }
    },

    updateLocalStorage() {
      try {
        localStorage.setItem('savedMovies', JSON.stringify(this.savedMovies));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },

    loadMovies() {
     try {
        const movies = localStorage.getItem('savedMovies');
        if (movies) {
          this.savedMovies = JSON.parse(movies);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        this.savedMovies = [];
      }
    }
  },
});