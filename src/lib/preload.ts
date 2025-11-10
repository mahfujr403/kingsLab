/**
 * Utility functions for preloading critical resources
 * Improves initial page load performance
 */

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * Preload critical data from API
 */
export async function preloadCriticalData() {
  // This can be called early to warm up the cache
  const endpoints = [
    '/api/hero',
    '/api/lab-info',
  ];

  const config = await import('./config').then(m => m.config);
  
  return Promise.allSettled(
    endpoints.map(endpoint =>
      fetch(`${config.apiBaseUrl}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
      }).catch(() => null)
    )
  );
}

/**
 * Prefetch a component chunk
 */
export function prefetchComponent(importFn: () => Promise<any>) {
  // Start loading but don't wait for it
  importFn().catch(() => null);
}
