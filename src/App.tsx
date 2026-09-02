import { useEffect, useState, lazy, Suspense } from 'react';
import type React from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useAuthStore } from './stores/useAuthStore';
import type { ClientAppProps } from './components/ClientApp';
import type { SitterAppProps } from './components/SitterApp';
import SplashScreen from './components/SplashScreen';
import AdminApp from './components/admin/AdminApp';
import { supabase } from './lib/supabase';

export type { Language, UserType } from './stores/useAuthStore';

const AuthPage = lazy(() => import('./components/AuthPage'));
const ClientApp = lazy<React.ComponentType<ClientAppProps>>(() => import('./components/ClientApp'));
const SitterApp = lazy<React.ComponentType<SitterAppProps>>(() => import('./components/SitterApp'));

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

function App() {
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
    user,
  } = useAuthStore();

  const [splashMinTimeElapsed, setSplashMinTimeElapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    initialize();

    const timer = setTimeout(() => {
      setSplashMinTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [initialize]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && profile?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkUserRole();
  }, [user]);

  if (isLoading || !splashMinTimeElapsed || checkingAdmin) {
    return <SplashScreen />;
  }

  // Show Admin App only if user is admin
  if (isAdmin) {
    return (
      <ErrorBoundary>
        <div className="rtl">
          <Toaster position="top-left" dir="rtl" richColors closeButton />
          <AdminApp />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Toaster
          position={language === 'ar' ? 'top-left' : 'top-right'}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          richColors
          closeButton
        />

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