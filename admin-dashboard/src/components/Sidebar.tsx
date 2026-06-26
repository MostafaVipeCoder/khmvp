import React from 'react'
import { LayoutDashboard, Users, UserCheck, DollarSign, Settings, LogOut } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'الإحصائيات الرئيسية' },
    { id: 'sitters', icon: Users, label: 'إدارة الخالات' },
    { id: 'clients', icon: UserCheck, label: 'التحقق الأمني للعملاء' },
    { id: 'finance', icon: DollarSign, label: 'الحسابات المالية والتحليلات' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen fixed right-0 top-0 border-l border-gray-200 dark:border-gray-700 z-40 shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-1">خالة العيال</p>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
          <LogOut className="w-5 h-5" />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
