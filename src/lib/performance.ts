/**
 * Performance monitoring utilities
 */

/**
 * Measure and log component render time
 */
export function measureRender(componentName: string, callback: () => void) {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`⚡ ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
  } else {
    callback();
  }
}

/**
 * Log Web Vitals metrics
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  // Log when fully loaded
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      console.log('📊 Performance Metrics:');
      console.log(`  DNS Lookup: ${perfData.domainLookupEnd - perfData.domainLookupStart}ms`);
      console.log(`  TCP Connection: ${perfData.connectEnd - perfData.connectStart}ms`);
      console.log(`  Request Time: ${perfData.responseStart - perfData.requestStart}ms`);
      console.log(`  Response Time: ${perfData.responseEnd - perfData.responseStart}ms`);
      console.log(`  DOM Processing: ${perfData.domContentLoadedEventEnd - perfData.responseEnd}ms`);
      console.log(`  Total Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
    }

    // Log Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`🎨 LCP: ${lastEntry.startTime}ms`);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  });
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    return setTimeout(callback, 1);
  }
}
