/**
 * Debouncing Utilities
 * Prevents excessive function calls and re-renders
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce a value - delays updating until user stops typing
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 500ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if value changes before delay
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounce a callback function
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds (default 500ms)
 * @returns {Function} Debounced function
 */
export function useDebouncedCallback(callback, delay = 500) {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Create debounced function
    const debouncedCallback = useCallback((...args) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * Throttle a callback - limits execution to once per interval
 * @param {Function} callback - Function to throttle
 * @param {number} interval - Minimum interval between calls in ms
 * @returns {Function} Throttled function
 */
export function useThrottle(callback, interval = 1000) {
    const lastCallRef = useRef(0);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args) => {
        const now = Date.now();
        if (now - lastCallRef.current >= interval) {
            lastCallRef.current = now;
            callbackRef.current(...args);
        }
    }, [interval]);
}

/**
 * Debounced state that only updates after user stops changing it
 * Returns [value, setValue, debouncedValue]
 */
export function useDebouncedState(initialValue, delay = 500) {
    const [value, setValue] = useState(initialValue);
    const debouncedValue = useDebounce(value, delay);

    return [value, setValue, debouncedValue];
}
