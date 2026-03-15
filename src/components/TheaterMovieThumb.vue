<template>
  <div class="thumb-container">
    <img
      :src="getImageUrl(movie.thumb_url)"
      :alt="movie.name"
      class="thumb-img"
      loading="lazy"
    />
  </div>
</template>

<script>
export default {
  name: "TheaterMovieThumb",
  props: {
    movie: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getImageUrl(thumbUrl) {
      if (!thumbUrl) return "";
      return thumbUrl.startsWith("http") || thumbUrl.startsWith("//")
        ? thumbUrl
        : `https://phimimg.com/${thumbUrl}`;
    },
  },
};
</script>

<style scoped>
.thumb-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
}

.thumb-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}
</style>
