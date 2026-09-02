/**
 * Simple Monitoring Utility
 * In a real production environment, this would integrate with Sentry, LogRocket, or Datadog.
 */

interface ErrorDetails {
    componentStack?: string;
    context?: string;
    metadata?: Record<string, any>;
}

export const monitoring = {
    logError: (error: Error, details?: ErrorDetails) => {
        // 1. Log to console for development
        console.error('[Monitoring] Error captured:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            ...details
        });

        // 2. Here you would send to your error tracking service
        // example: Sentry.captureException(error, { extra: details });
    },

    logInfo: (message: string, metadata?: Record<string, any>) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Monitoring] ${message}`, metadata);
        }
    },

    logUserAction: (action: string, metadata?: Record<string, any>) => {
        // Track business KPIs or user flow issues
        console.log(`[KPI] Action: ${action}`, metadata);
    }
};
