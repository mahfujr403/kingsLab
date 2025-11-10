import { useState, useEffect, useCallback, useRef } from "react";

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useApi<T>(
  fetcher: () => Promise<T>,
  fallbackData?: T,
  cacheKey?: string
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(fallbackData || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to avoid recreating callbacks when these change
  const fetcherRef = useRef(fetcher);
  const fallbackDataRef = useRef(fallbackData);
  const cacheKeyRef = useRef(cacheKey);
  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);

  // Update refs when props change (doesn't trigger re-fetch)
  useEffect(() => {
    fetcherRef.current = fetcher;
    fallbackDataRef.current = fallbackData;
    cacheKeyRef.current = cacheKey;
  }, [fetcher, fallbackData, cacheKey]);

  const fetchData = useCallback(async () => {
    // Check cache first if cacheKey is provided
    if (cacheKeyRef.current) {
      const cached = apiCache.get(cacheKeyRef.current);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (isMountedRef.current) {
          setData(cached.data);
          setLoading(false);
        }
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetcherRef.current();
      
      if (!isMountedRef.current) return;
      
      setData(result);
      
      // Cache the result if cacheKey is provided
      if (cacheKeyRef.current) {
        apiCache.set(cacheKeyRef.current, { data: result, timestamp: Date.now() });
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      // Silently use fallback data if available (no console spam)
      // The API Debug Panel will show detailed errors
      setError(err instanceof Error ? err : new Error("Unknown error"));
      
      // Use fallback data if available and there's an error
      if (fallbackDataRef.current) {
        setData(fallbackDataRef.current);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // Empty deps because we use refs

  useEffect(() => {
    isMountedRef.current = true;
    
    // Only fetch once on mount
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchData();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Export function to clear cache if needed
export function clearApiCache(key?: string) {
  if (key) {
    apiCache.delete(key);
  } else {
    apiCache.clear();
  }
}
