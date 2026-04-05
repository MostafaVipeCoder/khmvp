import { useEffect, useState, lazy, Suspense } from 'react';
import type React from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useAuthStore } from './stores/useAuthStore';
import type { ClientAppProps } from './components/ClientApp';
import type { SitterAppProps } from './components/SitterApp';
import SplashScreen from './components/SplashScreen';

export type { Language, UserType } from './stores/useAuthStore';

// Lazy load main components for better performance
const AuthPage = lazy(() => import('./components/AuthPage'));
const ClientApp = lazy<React.ComponentType<ClientAppProps>>(() => import('./components/ClientApp'));
const SitterApp = lazy<React.ComponentType<SitterAppProps>>(() => import('./components/SitterApp'));

// Loading fallback component
/**
 * Global Loading Spinner Component
 * Displayed during lazy loading of routes or initial app initialization.
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2596be]"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
        جاري التحميل...
      </p>
    </div>
  </div>
);

/**
 * Root Application Component
 * Handles global state initialization (auth, theme, language).
 * Manages splash screen display and top-level routing based on user authentication and role.
 */
function App() {
  // Use Zustand store instead of local state
  const {
    userType,
    isAuthenticated,
    language,
    theme,
    isLoading,
    toggleLanguage,
    toggleTheme,
    logout,
    initialize,
  } = useAuthStore();

  const [splashMinTimeElapsed, setSplashMinTimeElapsed] = useState(false);

  // Initialize store from storage on mount
  useEffect(() => {
    initialize();

    // Splash screen minimum timer (3 seconds)
    const timer = setTimeout(() => {
      setSplashMinTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [initialize]);

  if (isLoading || !splashMinTimeElapsed) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Toast Notifications */}
        <Toaster
          position={language === 'ar' ? 'top-left' : 'top-right'}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          richColors
          closeButton
        />

        {/* Main Content */}
        <Suspense fallback={<PageLoader />}>
          {!isAuthenticated ? (
            <AuthPage />
          ) : userType === 'client' ? (
            <ClientApp
              language={language}
              onLogout={logout}
              onLanguageChange={toggleLanguage}
              theme={theme}
              onThemeChange={toggleTheme}
            />
          ) : (
            <SitterApp
              language={language}
              onLogout={logout}
              onLanguageChange={toggleLanguage}
              theme={theme}
              onThemeChange={toggleTheme}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;