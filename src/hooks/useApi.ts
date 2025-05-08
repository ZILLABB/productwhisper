import { useState, useEffect, useCallback, useRef } from 'react';

// Cache for storing API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface UseApiOptions<T> {
  initialData?: T;
  cacheKey?: string;
  cacheDuration?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
  skipInitialCall?: boolean;
}

/**
 * Custom hook for making API calls with error handling and caching
 * @param apiCall - The API function to call
 * @param options - Configuration options
 * @returns Object containing data, loading state, error, and refetch function
 */
function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    initialData,
    cacheKey,
    cacheDuration = CACHE_DURATION,
    onSuccess,
    onError,
    dependencies = [],
    skipInitialCall = false
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(!skipInitialCall);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Function to fetch data
  const fetchData = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        // Check cache first if cacheKey is provided
        if (cacheKey) {
          const cachedData = apiCache.get(cacheKey);
          const now = Date.now();
          
          if (cachedData && now - cachedData.timestamp < cacheDuration) {
            setData(cachedData.data);
            setLoading(false);
            if (onSuccess) onSuccess(cachedData.data);
            return cachedData.data;
          }
        }

        // Make the API call
        const result = await apiCall(...args);
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          setData(result);
          setLoading(false);
          
          // Cache the result if cacheKey is provided
          if (cacheKey) {
            apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
          }
          
          if (onSuccess) onSuccess(result);
        }
        
        return result;
      } catch (err) {
        // Only update state if component is still mounted
        if (isMounted.current) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setLoading(false);
          if (onError) onError(error);
        }
        throw err;
      }
    },
    [apiCall, cacheKey, cacheDuration, onSuccess, onError]
  );

  // Initial API call
  useEffect(() => {
    if (!skipInitialCall) {
      fetchData();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, skipInitialCall, ...dependencies]);

  // Function to clear cache for a specific key or all cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      apiCache.delete(key);
    } else if (cacheKey) {
      apiCache.delete(cacheKey);
    }
  }, [cacheKey]);

  return { data, loading, error, refetch: fetchData, clearCache };
}

export default useApi;
