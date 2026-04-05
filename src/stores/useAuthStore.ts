// Authentication Store
// Manages user authentication state, language preferences, and theme settings.
// This store persists critical session data and handles all Supabase auth interactions.

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { preferencesStorage, secureStorage } from '@/utils/secureStorage';
import { monitoring } from '@/lib/monitoring';

// -- Types --

export type UserType = 'client' | 'sitter' | 'khala' | 'admin' | null;
export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

/**
 * Extended User interface including metadata specific to the application.
 */
interface User {
    id: string;
    email?: string;
    user_metadata: {
        full_name?: string;
        phone?: string;
        role?: UserType;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
}

/**
 * Main Auth State Interface for Zustand Store
 */
interface AuthState {
    // -- State --
    user: User | null;
    userType: UserType;
    isAuthenticated: boolean;
    language: Language;
    theme: Theme;
    isLoading: boolean;

    // -- App Configuration Actions --

    /** Sets the active user type context */
    setUserType: (type: UserType) => void;
    /** Sets the application language */
    setLanguage: (lang: Language) => void;
    /** Sets the application theme */
    setTheme: (theme: Theme) => void;
    /** Toggles between Arabic and English */
    toggleLanguage: () => void;
    /** Toggles between Light and Dark mode */
    toggleTheme: () => void;

    // -- Authentication Actions --

    /**
     * Signs in a user with email and password.
     * @param email User email
     * @param password User password
     * @returns Object containing error if any
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signIn: (email: string, password: string) => Promise<{ error: any }>;

    /**
     * Registers a new user.
     * @param email User email
     * @param password User password
     * @param data Additional profile data
     * @returns Object containing error if any
     */
    signUp: (email: string, password: string, data: {
        full_name: string;
        phone: string;
        mother_job?: string;
        father_job?: string;
        default_address?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) => Promise<{ error: any }>;

    /**
     * Verifies the OTP token for various auth flows.
     * @param email User email
     * @param token OTP Token
     * @param type Type of verification
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verifyOTP: (email: string, token: string, type: 'signup' | 'recovery' | 'email_change') => Promise<{ error: any }>;

    /**
     * Resends the OTP token.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resendOTP: (email: string, type: 'signup' | 'email_change') => Promise<{ error: any }>;

    /**
     * Signs out the current user and clears local storage.
     */
    logout: () => Promise<void>;

    // -- Initialization --

    /**
     * Initializes the store, checking for existing session and preferences.
     */
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // -- Initial State --
    user: null,
    userType: null,
    isAuthenticated: false,
    language: 'ar',
    theme: 'light',
    isLoading: true,

    // -- Implementation --

    setUserType: (type) => {
        set({ userType: type });
        secureStorage.setUserType(type);
    },

    setLanguage: (lang) => {
        set({ language: lang });
        preferencesStorage.setLanguage(lang);
    },

    setTheme: (theme) => {
        set({ theme });
        preferencesStorage.setTheme(theme);
        // Apply theme to document directly for immediate effect
        document.documentElement.classList.toggle('dark', theme === 'dark');
    },

    toggleLanguage: () => {
        const newLang = get().language === 'ar' ? 'en' : 'ar';
        get().setLanguage(newLang);
    },

    toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
    },

    /**
     * Internal helper to ensure a profile exists in the database.
     * Creates one if missing based on user metadata.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ensureProfile: async (user: any, requestedType?: UserType) => {
        // Attempt to fetch profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            monitoring.logError(error as any as Error, { context: 'ensureProfile_fetch', metadata: { userId: user.id } });
            return null;
        }

        if (profile) return profile;

        // If no profile exists, create a default one based on metadata
        const metadata = user.user_metadata || {};
        const newProfile = {
            id: user.id,
            full_name: metadata.full_name || user.email?.split('@')[0] || 'User',
            phone: metadata.phone || '',
            role: metadata.role || requestedType || 'client',
            is_active: true,
            is_verified: metadata.role === 'admin', // Admins are auto-verified
            created_at: new Date().toISOString()
        };

        const { data: createdProfile, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .maybeSingle();

        if (insertError) {
            monitoring.logError(insertError as any as Error, { context: 'ensureProfile_create', metadata: { userId: user.id } });
            return null;
        }

        return createdProfile;
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { error };

        if (data.user) {
            // Ensure profile exists and get it
            const profile = await (get() as any).ensureProfile(data.user);

            set({
                user: data.user,
                isAuthenticated: true,
                userType: profile?.role as UserType || get().userType
            });
        }
        return { error: null };
    },

    signUp: async (email, password, { full_name, phone, mother_job, father_job, default_address }) => {
        const userType = get().userType;

        // 1. Sign up auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    phone,
                    role: userType
                }
            }
        });

        if (authError) return { error: authError };

        if (authData.user) {
            // Profile is created automatically via database trigger (handle_new_user)
            // If user is a client, we attempt to update additional fields
            if (userType === 'client' && (mother_job || father_job || default_address)) {
                let retries = 3;
                while (retries > 0) {
                    const { data: updatedData, error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            mother_job,
                            father_job,
                            default_address
                        })
                        .eq('id', authData.user.id)
                        .select();

                    if (updateError) {
                        monitoring.logError(updateError, { context: 'signUp_profile_update' });
                        break;
                    }

                    if (updatedData && updatedData.length > 0) {
                        break;
                    }

                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        }
        return { error: null };
    },

    verifyOTP: async (email, token, type) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type,
        });

        if (error) return { error };

        if (data.user) {
            // Ensure profile exists and get it
            const profile = await (get() as any).ensureProfile(data.user, get().userType);

            set({
                user: data.user,
                isAuthenticated: true,
                userType: profile?.role as UserType || get().userType
            });
        }
        return { error: null };
    },

    resendOTP: async (email, type) => {
        const { error } = await supabase.auth.resend({
            type,
            email,
        });
        return { error };
    },

    logout: async () => {
        await supabase.auth.signOut();
        secureStorage.clearAll();
        set({
            user: null,
            userType: null,
            isAuthenticated: false,
        });
    },

    initialize: async () => {
        const savedLanguage = preferencesStorage.getLanguage();
        const savedTheme = preferencesStorage.getTheme();

        set({
            language: savedLanguage,
            theme: savedTheme,
        });

        document.documentElement.classList.toggle('dark', savedTheme === 'dark');

        const initPromise = (async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const savedUserType = secureStorage.getUserType();
                if (savedUserType && !session?.user) {
                    set({ userType: savedUserType });
                }

                if (session?.user) {
                    // Ensure profile exists and get it
                    const profile = await (get() as any).ensureProfile(session.user, savedUserType);

                    if (profile) {
                        set({
                            user: session.user as User,
                            isAuthenticated: true,
                            userType: (profile.role as UserType) || savedUserType,
                        });
                        if (profile.role) secureStorage.setUserType(profile.role as UserType);
                    } else {
                        monitoring.logInfo('Profile not found during initialization, signing out...');
                        await supabase.auth.signOut();
                        secureStorage.clearAll();
                        set({ user: null, isAuthenticated: false, userType: null });
                    }
                }
            } catch (err) {
                monitoring.logError(err as Error, { context: 'auth_initialize' });
            }
        })();

        // Race between initialization and a timeout to prevent infinite loading
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));
        await Promise.race([initPromise, timeoutPromise]);
        set({ isLoading: false });

        // Listen for auth state changes (e.g. from other tabs/windows)
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                if (get().user?.id === session.user.id && get().isAuthenticated) return;

                // Ensure profile exists and get it
                const profile = await (get() as any).ensureProfile(session.user);

                if (profile) {
                    set({
                        user: session.user as User,
                        isAuthenticated: true,
                        userType: profile.role as UserType
                    });
                }
            } else if (event === 'SIGNED_OUT') {
                set({
                    user: null,
                    isAuthenticated: false,
                    userType: null
                });
            }
        });
    },
}));
