import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerView } from './components/customers/CustomerView';
import { SitterView } from './components/sitters/SitterView';
import { FinanceView } from './components/finance/FinanceView';
import { InterviewView } from './components/sitters/InterviewView';
import { ActiveOrdersView } from './components/orders/ActiveOrdersView';
import { SettingsView } from './components/settings/SettingsView';
import { useApp } from './contexts/AppContext';
import { UserRole } from './types';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { state } = useApp();
  const isAdmin = state.currentUserRole === UserRole.ADMIN;

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <DashboardView />;
      case 'customers': return <CustomerView />;
      case 'orders': return <ActiveOrdersView />;
      case 'sitters': return <SitterView />;
      case 'finance': return isAdmin ? <FinanceView /> : <DashboardView />;
      case 'interviews': return <InterviewView />;
      case 'settings': return isAdmin ? <SettingsView /> : <DashboardView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />
      <main className="pr-64 min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
