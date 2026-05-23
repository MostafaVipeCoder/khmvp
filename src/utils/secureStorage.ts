// Secure Storage Utility using React Native AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage for authentication data
 */
export const secureStorage = {
    // Authentication
    setAuth: async (isAuthenticated: boolean): Promise<void> => {
        await AsyncStorage.setItem('isAuth', isAuthenticated.toString());
    },

    getAuth: async (): Promise<boolean> => {
        const val = await AsyncStorage.getItem('isAuth');
        return val === 'true';
    },

    clearAuth: async (): Promise<void> => {
        await AsyncStorage.removeItem('isAuth');
    },

    // User Type
    setUserType: async (userType: 'client' | 'sitter' | 'khala' | 'admin' | null): Promise<void> => {
        if (userType) {
            await AsyncStorage.setItem('userType', userType);
        } else {
            await AsyncStorage.removeItem('userType');
        }
    },

    getUserType: async (): Promise<'client' | 'sitter' | 'khala' | 'admin' | null> => {
        const type = await AsyncStorage.getItem('userType');
        return type as 'client' | 'sitter' | 'khala' | 'admin' | null;
    },

    clearUserType: async (): Promise<void> => {
        await AsyncStorage.removeItem('userType');
    },

    // Clear all auth data
    clearAll: async (): Promise<void> => {
        await AsyncStorage.removeItem('isAuth');
        await AsyncStorage.removeItem('userType');
    },
};

/**
 * Preferences storage (language, theme, etc.)
 */
export const preferencesStorage = {
    // Language
    setLanguage: async (language: 'ar' | 'en'): Promise<void> => {
        await AsyncStorage.setItem('language', language);
    },

    getLanguage: async (): Promise<'ar' | 'en'> => {
        const lang = await AsyncStorage.getItem('language');
        return (lang as 'ar' | 'en') || 'ar';
    },

    // Theme
    setTheme: async (theme: 'light' | 'dark'): Promise<void> => {
        await AsyncStorage.setItem('theme', theme);
    },

    getTheme: async (): Promise<'light' | 'dark'> => {
        const theme = await AsyncStorage.getItem('theme');
        return (theme as 'light' | 'dark') || 'light';
    },

    // Clear all preferences
    clearAll: async (): Promise<void> => {
        await AsyncStorage.removeItem('language');
        await AsyncStorage.removeItem('theme');
    },
};
