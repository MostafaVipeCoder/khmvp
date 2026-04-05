// Polling Hook for State Synchronization
// Automatically refetches data at specified intervals

import { useEffect, useRef } from 'react';
import { useInterval } from './index';

interface UsePollingOptions {
    interval: number; // in milliseconds
    enabled?: boolean;
    onError?: (error: Error) => void;
}

/**
 * Custom hook for periodic data fetching (polling).
 * Useful for keeping data synchronized in real-time.
 * @param fetchFunction Async function to execute periodically
 * @param options Configuration for interval and error handling
 */
export function usePolling(
    fetchFunction: () => Promise<void>,
    options: UsePollingOptions
) {
    const { interval, enabled = true, onError } = options;
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useInterval(
        async () => {
            if (!enabled || !isMountedRef.current) return;

            try {
                await fetchFunction();
            } catch (error) {
                if (isMountedRef.current && onError) {
                    onError(error as Error);
                }
            }
        },
        enabled ? interval : null
    );
}

// Example usage:
/*
function BookingsList() {
  const { execute } = useApi(() => bookingService.getAll());
  
  // Poll every 30 seconds
  usePolling(execute, {
    interval: 30000,
    enabled: true,
    onError: (error) => console.error('Polling error:', error),
  });
  
  return <div>...</div>;
}
*/
