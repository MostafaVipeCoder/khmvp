import { Component, ErrorInfo, ReactNode } from "react";
import { DevSettings } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { View, Text } from "../../tw";
import { Button } from "./button";
import { monitoring } from "@/lib/monitoring";

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
                <View className="flex-1 flex-col items-center justify-center min-h-[400px] p-6 text-center bg-white dark:bg-neutral-900">
                    <View className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </View>
                    <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">Something went wrong</Text>
                    <Text className="text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-[280px]">
                        We apologize for the inconvenience. Please try again or restart the app.
                    </Text>
                    <View className="flex flex-row gap-4">
                        <Button
                            variant="outline"
                            onPress={() => DevSettings.reload()}
                        >
                            Reload App
                        </Button>
                        <Button
                            onPress={() => this.setState({ hasError: false })}
                        >
                            Try Again
                        </Button>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}
