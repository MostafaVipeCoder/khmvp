import { View, Text } from '../tw';
import { Component, ErrorInfo, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react-native';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleContactSupport = () => {
        Alert.alert(
            'الدعم الفني',
            'يرجى التواصل معنا على:\nsupport@khalaeyal.com',
            [{ text: 'حسناً' }]
        );
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View className="flex-1 items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                    <Card className="w-full p-8">
                        <View className="items-center">
                            {/* Icon */}
                            <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </View>

                            {/* Title */}
                            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
                                عذراً، حدث خطأ ما
                            </Text>
                            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
                                نعتذر عن هذا الإزعاج. حدث خطأ غير متوقع في التطبيق.
                            </Text>

                            {/* Error Details (Development Only) */}
                            {__DEV__ && this.state.error && (
                                <View className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
                                    <Text className="text-sm text-red-600 dark:text-red-400 mb-2">
                                        {this.state.error.toString()}
                                    </Text>
                                    {this.state.errorInfo && (
                                        <Text className="text-xs text-gray-600 dark:text-gray-400">
                                            {this.state.errorInfo.componentStack}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Actions */}
                            <View className="w-full gap-3">
                                <Button
                                    onPress={this.handleReset}
                                    className="bg-[#FB5E7A] hover:bg-[#e5536e] w-full"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    حاول مرة أخرى
                                </Button>
                                <Button
                                    onPress={this.handleContactSupport}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    التواصل مع الدعم الفني
                                </Button>
                            </View>
                        </View>
                    </Card>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
