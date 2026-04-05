import { useState } from 'react';
import { Home, Calendar, DollarSign, User, Shield } from 'lucide-react';
import SitterHome from './sitter/SitterHome';
import SitterBookings from './sitter/SitterBookings';
import SitterEarnings from './sitter/SitterEarnings';
import SitterProfile from './sitter/SitterProfile';
// import AvailabilityManagement from './sitter/AvailabilityManagement';
import WithdrawalManagement from './admin/WithdrawalManagement';
import type { Language } from '../stores/useAuthStore';
import { useAuthStore } from '../stores/useAuthStore';

export interface SitterAppProps {
  language: Language;
  onLogout: () => void;
  onLanguageChange: () => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

type SitterTab = 'home' | 'bookings' | 'earnings' | 'profile' | 'admin';

const translations = {
  ar: {
    home: 'الرئيسية',
    bookings: 'الحجوزات',
    earnings: 'الأرباح',
    profile: 'الملف الشخصي',
    admin: 'الإدارة'
  },
  en: {
    home: 'Home',
    bookings: 'Bookings',
    earnings: 'Earnings',
    profile: 'Profile',
    admin: 'Admin'
  }
};

/**
 * Sitter Main Application Shell
 * Manages navigation for sitter-side features: Home, Bookings, Earnings, Profile.
 * includes role-based access for Admin tab.
 * @param props Component props including language and theme handlers
 */
export default function SitterApp({ language, onLogout, onLanguageChange, theme, onThemeChange }: SitterAppProps) {
  const [activeTab, setActiveTab] = useState<SitterTab>('home');
  const { user } = useAuthStore();
  // Check if user has admin/khala role to show extra tab
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'khala';
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Main Content */}
      <div className="pt-4">
        {activeTab === 'home' && <SitterHome language={language} />}
        {activeTab === 'bookings' && <SitterBookings language={language} />}
        {activeTab === 'earnings' && <SitterEarnings language={language} />}
        {activeTab === 'profile' && <SitterProfile language={language} onLogout={onLogout} onLanguageChange={onLanguageChange} theme={theme} onThemeChange={onThemeChange} />}
        {activeTab === 'admin' && <WithdrawalManagement language={language} />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-3">
        <div className="max-w-lg mx-auto flex justify-between items-center px-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'home' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">{t.home}</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'bookings' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">{t.bookings}</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'earnings' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px]">{t.earnings}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'admin' ? 'text-[#FB5E7A]' : 'text-gray-500'
                }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px]">{t.admin}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'profile' ? 'text-[#FB5E7A]' : 'text-gray-500'
              }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">{t.profile}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}