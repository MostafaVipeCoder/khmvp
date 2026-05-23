import { View, Text, Pressable } from '../tw';
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
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Main Content */}
      <View className="pt-4">
        <Suspense fallback={<View>Loading...</View>}>
          {activeTab === 'home' && <ClientHome onNavigate={(tab: ClientTab) => setActiveTab(tab)} />}
          {activeTab === 'requests' && <ClientBookings />}
          {activeTab === 'schedule' && <ClientActiveBookings onNavigate={(tab: 'home' | 'requests' | 'schedule' | 'profile') => setActiveTab(tab)} />}
          {activeTab === 'profile' && <ClientProfile language={language} onLogout={onLogout} onLanguageChange={onLanguageChange} theme={theme} onThemeChange={onThemeChange} />}
        </Suspense>
      </View>

      {/* Bottom Navigation */}
      <View className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 z-50">
        <View className="max-w-lg mx-auto flex justify-around items-center">
          <Pressable
            onPress={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <Home className="w-6 h-6" />
            <Text className="text-xs">{clientT.home}</Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('requests')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'requests' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <FileText className="w-6 h-6" />
            <Text className="text-xs">{clientT.requests}</Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'schedule' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <Clock className="w-6 h-6" />
            <Text className="text-xs">{clientT.schedule}</Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <User className="w-6 h-6" />
            <Text className="text-xs">{clientT.profile}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}