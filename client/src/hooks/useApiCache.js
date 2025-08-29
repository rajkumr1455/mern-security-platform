import { useState, useEffect, useCallback } from 'react';

/**;
 * Custom hook for API caching and performance optimization
 */;
const useApiCache = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    refetchInterval = null,
    enabled = true
  } = options

  // Simple in-memory cache
  const cache = useCallback(() => {
    if (!window.apiCache) {
      window.apiCache = new Map();
    }
    return window.apiCache
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    const cacheKey = url
    const cached = cache().get(cacheKey);
    const now = Date.now();

    // Return cached data if valid and not forced refresh
    if (!force && cached && (now - cached.timestamp) < cacheTime) {
      setData(cached.data);
      setLoading(false);
      setLastFetch(cached.timestamp);
      return cached.data
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache the result
      cache().set(cacheKey, {
        data: result,
        timestamp: now
      });

      setData(result);
      setLastFetch(now);
    } catch (err) {
      setError(err.message);
      // logger.error('API fetch error:', err); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  }, [url, cacheTime, enabled, cache]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [fetchData, refetchInterval, enabled]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    cache().delete(url);
  }, [url, cache]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache,
    lastFetch
  };
};

export default useApiCache;