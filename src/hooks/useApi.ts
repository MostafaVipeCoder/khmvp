// Custom Hook for API Calls with Error Handling and Loading States
// Simplifies data fetching with built-in error and loading management

import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean;
}

interface UseApiReturn<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    execute: () => Promise<void>;
    reset: () => void;
}

/**
 * Custom hook for data fetching operations.
 * Manages loading, error, and data states automatically.
 * @param apiFunction Function that returns a promise (the API call)
 * @param options Configuration options for the hook
 * @returns Object containing data, loading state, error, and execution controls
 */
export function useApi<T>(
    apiFunction: () => Promise<T>,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> {
    const { onSuccess, onError, immediate = false } = options;

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiFunction();
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [apiFunction, onSuccess, onError]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    return { data, isLoading, error, execute, reset };
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationReturn<T, V> {
    mutate: (variables: V) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    data: T | null;
    reset: () => void;
}

/**
 * Custom hook for data mutation operations (create, update, delete).
 * @param mutationFunction Function that performs the mutation
 * @param options Configuration options
 * @returns Object containing mutate function, loading state, error, etc.
 */
export function useMutation<T, V>(
    mutationFunction: (variables: V) => Promise<T>,
    options: UseApiOptions<T> = {}
): UseMutationReturn<T, V> {
    const { onSuccess, onError } = options;

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = useCallback(async (variables: V) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await mutationFunction(variables);
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [mutationFunction, onSuccess, onError]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return { mutate, isLoading, error, data, reset };
}
