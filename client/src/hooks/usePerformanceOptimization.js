import logger from '../utils/improvedLogger';
import { debounce, throttle } from 'lodash';
import { useCallback, useMemo, useRef, useEffect } from 'react';


/**;
 * Performance Optimization Hooks
 * Collection of custom hooks for React performance optimization
 */;

// Debounced callback hook
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay, ...deps]
  );

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback
};

// Throttled callback hook
export const useThrottledCallback = (callback, delay = 100, deps = []) => {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay, ...deps]
  );

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback
};

// Memoized value with performance tracking
export const useTrackedMemo = (factory, deps, name) => {
  const startTime = useRef();

  const memoizedValue = useMemo(() => {
    startTime.current = performance.now();
    const result = factory();
    const duration = performance.now() - startTime.current

    if (duration > 10) { // Log if computation takes more than 10ms
      logger.performance(`Memo computation: ${name}`, duration);
    }

    return result
  }, deps);

  return memoizedValue
};

// Optimized event handler
export const useOptimizedEventHandler = (handler, deps = []) => {
  return useCallback(handler, deps);
};

// Component render tracking
export const useRenderTracking = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current

    logger.componentLifecycle(componentName, 'render', {
      renderCount: renderCount.current,
      timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`
    });

    lastRenderTime.current = currentTime
  });

  return renderCount.current
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef();
  const observerRef = useRef();
  const isIntersecting = useRef(false);

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.current = entry.isIntersecting
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [elementRef, isIntersecting]
    };

// Virtual scrolling hook for large lists
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const scrollTop = useRef(0);
  const visibleStart = Math.floor(scrollTop.current / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleEnd).map((item, index) => ({
      ...item,
      index: visibleStart + index,
      top: (visibleStart + index) * itemHeight
    })
  }, [items, visibleStart, visibleEnd, itemHeight]);

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((event) => {
    scrollTop.current = event.target.scrollTop
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll
  };
};

// Memory usage tracking
export const useMemoryTracking = (componentName) => {
  useEffect(() => {
    if (performance.memory) {
      const memoryInfo = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };

      logger.debug(`Memory usage for ${componentName}`, memoryInfo);
    }
  }, [componentName]);
};

// Bundle size tracking
export const useBundleTracking = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Track bundle size in development
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const totalSize = scripts.reduce((size, script) => {
        return size + (script.src.includes('chunk') ? 1 : 0);
      }, 0);

      logger.debug('Bundle chunks loaded', { chunkCount: totalSize });
    }
  }, []);
};