# LCP Optimization System

Hệ thống tối ưu LCP (Largest Contentful Paint) được thiết kế để cải thiện performance và user experience của website movie.

## 🎯 Mục tiêu

- **HomePage**: Carousel sẽ được load đầu tiên với priority cao cho LCP
- **Các page khác**: Tự động tìm và tối ưu phần tử đầu tiên có thể là LCP
- **Lazy Loading**: Các component khác sẽ được lazy load bằng Intersection Observer

## 📁 Cấu trúc Files

### Core Files
- `src/composables/useLCPOptimization.js` - Composable chính cho LCP optimization
- `src/utility/lcpObserver.js` - Observer cho LCP elements theo route
- `src/utility/resourcePreloader.js` - Preload images và resources
- `src/utility/performanceMonitor.js` - Monitor performance metrics

### Updated Components
- `src/views/HomePage.vue` - Tối ưu cho carousel LCP + lazy loading
- `src/components/CarouselNew.vue` - Preload ảnh đầu tiên với high priority
- `src/views/AnimePage.vue` - Auto LCP optimization

## 🚀 Cách sử dụng

### 1. HomePage (Đã tối ưu)
```vue
<template>
  <div class="home-page">
    <!-- Carousel load đầu tiên cho LCP -->
    <CarouselNew></CarouselNew>
    
    <!-- Lazy load các component khác -->
    <div ref="koreanSeriesContainer">
      <KoreanSeriesSlide v-if="showKoreanSeries"></KoreanSeriesSlide>
    </div>
  </div>
</template>

<script>
import { useLCPOptimization } from "@/composables/useLCPOptimization.js";

export default {
  setup() {
    const { setupLazyLoading } = useLCPOptimization();
    return { setupLazyLoading };
  }
}
</script>
```

### 2. Các Page khác (Auto optimization)
```vue
<script>
import { useLCPOptimization } from "@/composables/useLCPOptimization.js";

export default {
  setup() {
    // Tự động tối ưu LCP element đầu tiên
    useLCPOptimization();
  }
}
</script>
```

### 3. Manual LCP Optimization
```javascript
import { resourcePreloader } from "@/utility/resourcePreloader.js";

// Preload critical images
await resourcePreloader.preloadImage(imageUrl, 'high');

// Preload multiple images
await resourcePreloader.preloadImages(imageUrls, { 
  priority: 'high', 
  concurrent: 3 
});
```

## 🔧 Tính năng

### LCP Optimization
- ✅ Tự động detect LCP element theo route
- ✅ Set `fetchpriority="high"` và `loading="eager"` cho ảnh LCP
- ✅ Preload critical images với high priority
- ✅ Performance tracking với marks/measures

### Lazy Loading
- ✅ Intersection Observer cho components
- ✅ Configurable rootMargin và threshold
- ✅ Prevent layout shift với min-height
- ✅ Auto cleanup observers

### Resource Preloading
- ✅ Smart image preloading
- ✅ Priority-based loading (high/medium/low)
- ✅ Concurrent request limiting
- ✅ Hover-based preloading
- ✅ Memory management

### Performance Monitoring
- ✅ LCP, FID, CLS tracking
- ✅ Custom performance marks
- ✅ Navigation timing
- ✅ Performance recommendations

## 📊 Performance Metrics

### LCP Targets
- **Good**: < 2.5s
- **Needs Improvement**: 2.5s - 4.0s  
- **Poor**: > 4.0s

### Optimization Strategies
1. **Critical Path**: Carousel image được ưu tiên cao nhất
2. **Preloading**: Top 3-6 images được preload
3. **Lazy Loading**: Non-critical content lazy load
4. **Resource Hints**: fetchpriority, loading attributes

## 🛠️ Cấu hình

### Route-based LCP Selectors
```javascript
// lcpObserver.js
function getLCPSelectorByRoute() {
  const path = window.location.pathname;
  
  if (path === "/" || path.startsWith("/home")) {
    return ".lcp-preload-image, .slide-background";
  }
  
  if (path.startsWith("/hoat-hinh")) {
    return ".movie-card-new img";
  }
  
  return getFirstLCPElement(); // Auto-detect
}
```

### Preload Configuration
```javascript
// resourcePreloader.js
const preloadOptions = {
  priority: 'high',    // high, medium, low
  concurrent: 3,       // Max concurrent requests
  count: 6            // Number of images to preload
};
```

## 🐛 Debug & Monitoring

### Console Logs
- 🎯 LCP timing và element info
- ⚡ FID measurements  
- 📐 CLS values
- 📍 Performance marks
- ⏱️ Custom measures

### Performance Report
```javascript
import { performanceMonitor } from "@/utility/performanceMonitor.js";

// Generate detailed report
const report = performanceMonitor.generateReport();
console.log(report);
```

## 🔄 Workflow

1. **Page Load**: LCP observer khởi tạo
2. **LCP Detection**: Tìm và tối ưu LCP element
3. **Critical Loading**: Load carousel/critical content
4. **Lazy Loading**: Load non-critical content khi cần
5. **Preloading**: Preload next page resources
6. **Monitoring**: Track performance metrics

## 📈 Expected Improvements

- **LCP**: Giảm 30-50% thời gian load
- **FCP**: Faster first paint với preloaded images
- **CLS**: Reduced layout shift với proper sizing
- **User Experience**: Smoother loading progression

## 🚨 Lưu ý

1. **Image Optimization**: Đảm bảo images đã được optimize
2. **CDN**: Sử dụng ImageKit CDN cho faster loading
3. **Caching**: Browser caching cho preloaded resources
4. **Memory**: Auto cleanup observers và preloaded resources
5. **Fallback**: Graceful degradation nếu APIs không support

## 🔧 Troubleshooting

### LCP không được detect
- Kiểm tra selector trong `getLCPSelectorByRoute()`
- Đảm bảo element tồn tại khi observer chạy
- Check console logs cho debug info

### Images không preload
- Verify image URLs
- Check network tab cho preload requests
- Ensure proper CORS headers

### Performance issues
- Reduce concurrent preload requests
- Adjust rootMargin cho lazy loading
- Monitor memory usage với dev tools
