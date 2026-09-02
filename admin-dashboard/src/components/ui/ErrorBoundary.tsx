import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { monitoring } from "../../lib/monitoring";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        monitoring.logError(error, {
            componentStack: errorInfo.componentStack || undefined
        });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
                    <div className="bg-red-50 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500 mb-6 max-w-md">
                        We apologize for the inconvenience. Please try refreshing the page.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </Button>
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
