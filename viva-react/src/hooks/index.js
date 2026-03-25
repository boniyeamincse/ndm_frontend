import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to track the current vertical scroll position.
 * @returns {number} Current scroll Y position.
 */
export const useScrollY = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

/**
 * Custom hook to detect if an element is visible in the viewport.
 * @param {object} ref - React ref of the target element.
 * @param {number} [threshold=0.1] - Percentage of visibility to trigger.
 * @returns {boolean} Whether the element is in view.
 */
export const useInView = (ref, threshold = 0.1) => {
  const [intersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return intersecting;
};

/**
 * Custom hook for an animated number counter.
 * @param {number} target - The final number to reach.
 * @param {number} [duration=2000] - Duration of the animation in ms.
 * @param {boolean} [trigger=true] - Condition to start the animation.
 * @returns {number} The current count value.
 */
export const useCounter = (target, duration = 2000, trigger = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration, trigger]);

  return count;
};

/**
 * Custom hook to debounce a value change.
 * @param {*} value - The value to debounce.
 * @param {number} delay - Delay in ms.
 * @returns {*} The debounced value.
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for local storage persistence.
 * @param {string} key - Storage key.
 * @param {*} defaultValue - Initial value.
 * @returns {[*, Function]} State and setter function.
 */
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

/**
 * Custom hook for responsive breakpoint detection.
 * @param {string} query - CSS media query (e.g., '(max-width: 768px)').
 * @returns {boolean} Whether the query matches.
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Custom hook to lock body scroll (e.g., during modals).
 */
export const useLockBodyScroll = () => {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = originalStyle);
  }, []);
};

/**
 * Custom hook to apply fade-up animations to elements on scroll.
 */
export const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up-active');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};
