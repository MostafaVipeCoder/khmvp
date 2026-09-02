import React from 'react';
import { 
  Users, 
  Baby, 
  LayoutDashboard, 
  Wallet, 
  Calendar,
  ClipboardList,
  RefreshCw,
  LogOut,
  Settings,
  ShieldCheck,
  UserCircle,
  Activity,
  Crown
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useApp } from '../../contexts/AppContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const { state, setRole, resetData } = useApp();
  const { currentUserRole } = state;

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.COORDINATOR] },
    { id: 'orders', label: 'غرفة العمليات', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.COORDINATOR] },
    { id: 'customers', label: 'إدارة العملاء', icon: Users, roles: [UserRole.ADMIN, UserRole.COORDINATOR] },
    { id: 'sitters', label: 'سجل الخالات', icon: Baby, roles: [UserRole.ADMIN, UserRole.COORDINATOR] },
    { id: 'interviews', label: 'التدريب والتوظيف', icon: Calendar, roles: [UserRole.ADMIN, UserRole.COORDINATOR] },
    { id: 'finance', label: 'التقارير المالية', icon: Wallet, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'إعدادات المنصة', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUserRole));

  return (
    <div className="w-80 bg-white border-l border-slate-100 h-screen flex flex-col fixed top-0 right-0 z-[100] shadow-2xl shadow-slate-200/50 overflow-hidden">
      <div className="p-10 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-0 opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl premium-gradient flex items-center justify-center text-white shadow-2xl shadow-brand-200 relative group overflow-hidden">
              <ShieldCheck className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-accent-700 tracking-tight">خالة وسند</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">الإصدار 2.4.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2 overflow-y-auto mt-4 custom-scrollbar">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4.5 rounded-3xl transition-all duration-500 group relative overflow-hidden",
              currentTab === item.id 
                ? "bg-slate-900 text-white shadow-2xl shadow-slate-300" 
                : "text-slate-400 hover:bg-slate-50 hover:text-brand-600"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-500",
              currentTab === item.id ? "bg-brand-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-black text-[13px] tracking-tight">{item.label}</span>
            
            {currentTab === item.id && (
              <motion.div 
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" 
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-8 space-y-6">
        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">تبديل صلاحية الوصول</span>
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={() => setRole(UserRole.ADMIN)}
                className={cn(
                  "flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 flex items-center justify-center gap-2",
                  currentUserRole === UserRole.ADMIN ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                <Crown className="w-3.5 h-3.5" />
                مدير
              </button>
              <button 
                onClick={() => setRole(UserRole.COORDINATOR)}
                className={cn(
                  "flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 flex items-center justify-center gap-2",
                  currentUserRole === UserRole.COORDINATOR ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                مسؤول
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white ring-4 ring-slate-50 group-hover:scale-105 transition-transform">
              {currentUserRole === UserRole.ADMIN ? <ShieldCheck className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">
              {currentUserRole === UserRole.ADMIN ? 'المدير العام' : 'مسؤولة التشغيل'}
            </p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">متصل الآن</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            if(confirm('هل أنت متأكد من إعادة تعيين كافة البيانات؟')) {
              resetData();
              window.location.reload();
            }
          }}
          className="w-full flex items-center justify-center gap-3 p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
          <span>إعادة ضبط المصنع</span>
        </button>
      </div>
    </div>
  );
};
