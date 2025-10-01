// utils/lcpObserver.js
let lcpChosen = false;

export function initLCPObserver() {
  if (lcpChosen) return; // chỉ chạy 1 lần

  const targetSelector = getLCPSelectorByRoute();

  if (!targetSelector) return;

  const targetEl = document.querySelector(targetSelector);

  if (!targetEl) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !lcpChosen) {
        targetEl.setAttribute("fetchpriority", "high");
        targetEl.setAttribute("loading", "eager");
        lcpChosen = true;
        obs.disconnect();
      }
    });
  }, {
    rootMargin: "0px 0px 200px 0px",
    threshold: 0.1
  });

  observer.observe(targetEl);
}

// tuỳ route mà chọn element khác nhau
function getLCPSelectorByRoute() {
  const path = window.location.pathname;

  if (path === "/" || path.startsWith("/home")) {
    // Carousel image đầu tiên (LCP element cho HomePage)
    return ".lcp-preload-image, .slide-background";
  }

  if (path.startsWith("/hoat-hinh")) {
    // Card đầu tiên trong danh sách phim
    return ".movie-card-new img";
  }

  // Fallback cho các page khác - tìm phần tử đầu tiên có thể là LCP
  return getFirstLCPElement();
}

// Tự động tìm phần tử đầu tiên có thể là LCP cho các page khác
function getFirstLCPElement() {
  // Thứ tự ưu tiên: img, video, div có background-image
  const selectors = [
    'img[src]:not([loading="lazy"])',
    'video[poster]',
    '.hero-section img',
    '.banner img',
    '.carousel img',
    '.slide-background'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return selector;
    }
  }

  return null;
}
