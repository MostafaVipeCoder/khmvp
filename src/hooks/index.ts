// Custom React Hooks for common functionality
// React Native compatible version

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useDebounce - Debounce a value
 * Useful for search inputs to avoid excessive API calls
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * useLocalStorage - Persist state in AsyncStorage (React Native compatible)
 * Note: async, initial value is used until storage resolves
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        AsyncStorage.getItem(key)
            .then((item) => {
                if (item !== null) {
                    setStoredValue(JSON.parse(item));
                }
            })
            .catch((error) => {
                console.error(`Error loading AsyncStorage key "${key}":`, error);
            });
    }, [key]);

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        setStoredValue((prevStored) => {
            const valueToStore =
                value instanceof Function ? value(prevStored) : value;
            AsyncStorage.setItem(key, JSON.stringify(valueToStore)).catch((error) => {
                console.error(`Error setting AsyncStorage key "${key}":`, error);
            });
            return valueToStore;
        });
    }, [key]);

    return [storedValue, setValue];
}

/**
 * useMediaQuery - Always returns true on mobile (React Native compatible stub)
 * On RN every screen is "mobile", so media queries are irrelevant.
 */
export function useMediaQuery(_query: string): boolean {
    return true;
}

/**
 * useIntersectionObserver - Not available in React Native, always returns false
 */
export function useIntersectionObserver(
    _elementRef: any,
    _options?: any
): boolean {
    return false;
}

/**
 * useOnClickOutside - Not applicable in React Native (touch model is different)
 */
export function useOnClickOutside(
    _ref: any,
    _handler: (event: any) => void
) {
    // No-op in React Native
}

/**
 * usePrevious - Get previous value of a state/prop
 * Useful for comparing with current value
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * useToggle - Boolean state toggle
 * Simpler than useState for boolean toggles
 */
export function useToggle(
    initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => {
        setValue((v) => !v);
    }, []);

    return [value, toggle, setValue];
}

/**
 * useAsync - Handle async operations
 * Manages loading, error, and data states
 */
export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate: boolean = true
) {
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async () => {
        setStatus('pending');
        setData(null);
        setError(null);

        try {
            const response = await asyncFunction();
            setData(response);
            setStatus('success');
            return response;
        } catch (error) {
            setError(error as Error);
            setStatus('error');
            throw error;
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { execute, status, data, error };
}

/**
 * useWindowSize - Get screen dimensions (React Native compatible)
 * Uses Dimensions API instead of window.innerWidth/Height
 */
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState(() => {
        const { width, height } = Dimensions.get('window');
        return { width, height };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setWindowSize({ width: window.width, height: window.height });
        });
        return () => subscription?.remove();
    }, []);

    return windowSize;
}

/**
 * useInterval - setInterval with hooks
 * Automatically cleans up
 */
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}

/**
 * useTimeout - setTimeout with hooks
 * Automatically cleans up
 */
export function useTimeout(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setTimeout(() => savedCallback.current(), delay);
        return () => clearTimeout(id);
    }, [delay]);
}
