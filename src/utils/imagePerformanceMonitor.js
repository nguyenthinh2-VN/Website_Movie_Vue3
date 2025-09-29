// Image Performance Monitor Utility
export class ImagePerformanceMonitor {
  static logImageLoad(imageElement, movieName) {
    if (!imageElement) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('imagekit.io') || entry.name.includes('phimimg.com')) {
          console.group(`🖼️ Image Performance - ${movieName}`);
          console.log('📏 Image URL:', entry.name);
          console.log('⏱️ Load Time:', `${entry.duration.toFixed(2)}ms`);
          console.log('📦 Transfer Size:', `${(entry.transferSize / 1024).toFixed(2)} KB`);
          console.log('💾 Encoded Size:', `${(entry.encodedBodySize / 1024).toFixed(2)} KB`);
          console.log('🔍 Decoded Size:', `${(entry.decodedBodySize / 1024).toFixed(2)} KB`);
          console.groupEnd();
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    // Log image dimensions when loaded
    imageElement.onload = () => {
      console.group(`📐 Image Dimensions - ${movieName}`);
      console.log('🖥️ Natural Size:', `${imageElement.naturalWidth}x${imageElement.naturalHeight}`);
      console.log('📱 Display Size:', `${imageElement.width}x${imageElement.height}`);
      console.log('🎯 Device Pixel Ratio:', window.devicePixelRatio);
      console.log('📏 Viewport Width:', window.innerWidth);
      console.groupEnd();
    };
  }

  static checkResponsiveBreakpoints() {
    const breakpoints = {
      'Mobile Small': 400,
      'Mobile Large': 576, 
      'Tablet': 768,
      'Desktop Small': 1024,
      'Desktop Large': 1200
    };

    const currentWidth = window.innerWidth;
    let currentBreakpoint = 'Desktop Large';

    for (const [name, width] of Object.entries(breakpoints)) {
      if (currentWidth <= width) {
        currentBreakpoint = name;
        break;
      }
    }

    console.log(`📱 Current Breakpoint: ${currentBreakpoint} (${currentWidth}px)`);
    return currentBreakpoint;
  }

  static measureImageOptimization() {
    const images = document.querySelectorAll('.poster-image');
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    images.forEach((img, index) => {
      if (img.complete) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // Estimate original vs optimized size
        const originalEstimate = img.naturalWidth * img.naturalHeight * 3; // RGB
        const optimizedSize = img.src.length; // Rough estimate

        totalOriginalSize += originalEstimate;
        totalOptimizedSize += optimizedSize;

        console.log(`🖼️ Image ${index + 1}:`, {
          dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
          estimatedOriginal: `${(originalEstimate / 1024).toFixed(2)} KB`,
          optimizedSize: `${(optimizedSize / 1024).toFixed(2)} KB`
        });
      }
    });

    const savings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2);
    console.log(`💰 Estimated Savings: ${savings}%`);
  }
}

// Auto-run breakpoint detection on resize
window.addEventListener('resize', () => {
  ImagePerformanceMonitor.checkResponsiveBreakpoints();
});
