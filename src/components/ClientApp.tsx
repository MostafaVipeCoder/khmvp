import { useState, lazy, Suspense } from 'react';
import { Home, User, Clock, FileText } from 'lucide-react';
import ClientHome from './client/ClientHome';
const ClientBookings = lazy(() => import('./client/ClientBookings'));
import ClientActiveBookings from './client/ClientActiveBookings';
import ClientProfile from './client/ClientProfile';
import { useTranslation } from '../hooks/useTranslation';

export interface ClientAppProps {
  language: string;
  onLogout: () => void;
  onLanguageChange: () => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

type ClientTab = 'home' | 'requests' | 'schedule' | 'profile';


/**
 * Client Main Application Shell
 * Manages navigation for client-side features: Home, Requests, Schedule, Profile.
 * Uses lazy loading for performance.
 * @param props Component props including language and theme handlers
 */
export default function ClientApp({ language: propLanguage, onLogout, onLanguageChange, theme, onThemeChange }: ClientAppProps) {
  const [activeTab, setActiveTab] = useState<ClientTab>('home');
  const { t, language } = useTranslation();
  const clientT = t.client;

  if (propLanguage && false) console.log(propLanguage); // Avoid unused warning

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Main Content */}
      <div className="pt-4">
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab === 'home' && <ClientHome onNavigate={(tab: ClientTab) => setActiveTab(tab)} />}
          {activeTab === 'requests' && <ClientBookings />}
          {activeTab === 'schedule' && <ClientActiveBookings onNavigate={(tab: 'home' | 'requests' | 'schedule' | 'profile') => setActiveTab(tab)} />}
          {activeTab === 'profile' && <ClientProfile language={language} onLogout={onLogout} onLanguageChange={onLanguageChange} theme={theme} onThemeChange={onThemeChange} />}
        </Suspense>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">{clientT.home}</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'requests' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-xs">{clientT.requests}</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'schedule' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <Clock className="w-6 h-6" />
            <span className="text-xs">{clientT.schedule}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">{clientT.profile}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}