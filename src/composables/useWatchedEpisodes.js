import { ref, onMounted } from "vue";

export function useWatchedEpisodes(slug) {
  const watched = ref([]);

  onMounted(() => {
    const all = JSON.parse(localStorage.getItem("watchedData") || "{}");
    watched.value = all[slug] || [];
  });

  function markAsWatched(epId) {
    const all = JSON.parse(localStorage.getItem("watchedData") || "{}");
    if (!all[slug]) all[slug] = [];
    if (!all[slug].includes(epId)) {
      all[slug].push(epId);
      localStorage.setItem("watchedData", JSON.stringify(all));
    }
    watched.value = all[slug];
  }

  return { watched, markAsWatched };
}
