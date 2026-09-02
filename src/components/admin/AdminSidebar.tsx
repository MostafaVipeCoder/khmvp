import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  DollarSign, 
  Settings, 
  LogOut,
  Calendar,
  ClipboardList,
  MessageSquare,
  CreditCard
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
}

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'الإحصائيات الرئيسية' },
    { id: 'orders', icon: Calendar, label: 'الطلبات النشطة' },
    { id: 'interviews', icon: ClipboardList, label: 'مقابلات التوظيف' },
    { id: 'sitters', icon: Users, label: 'إدارة الخالات' },
    { id: 'clients', icon: UserCheck, label: 'التحقق الأمني للعملاء' },
    { id: 'finance', icon: DollarSign, label: 'الحسابات المالية والتحليلات' },
    { id: 'withdrawals', icon: CreditCard, label: 'إدارة السحوبات' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ]

  return (
    <div className="w-24 bg-white dark:bg-gray-800 h-screen fixed right-0 top-0 border-l border-gray-200 dark:border-gray-700 z-40 shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col items-center">
        <h1 className="text-lg font-bold text-[#FB5E7A">لوحة</h1>
        <p className="text-xs text-gray-500 mt-1">التحكم</p>
      </div>
      
      <nav className="p-4 space-y-3 flex-grow overflow-y-auto flex flex-col items-center">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-center px-4 py-4 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-[#FB5E7A]/10 text-[#FB5E7A] font-semibold shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex justify-center">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center px-4 py-4 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          title="تسجيل خروج"
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar
