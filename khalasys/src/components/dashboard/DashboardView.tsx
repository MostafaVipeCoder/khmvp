import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Users, 
  Baby, 
  DollarSign, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  Target,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserRole, CustomerOrderStatus } from '../../types';

export const DashboardView: React.FC = () => {
  const { state } = useApp();
  const isAdmin = state.currentUserRole === UserRole.ADMIN;

  const stats = [
    { label: 'خالات متاحات حالياً', value: state.sitters.filter(s => s.status === 'qualified' && s.workStatus === 'available').length, icon: Baby, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'جلسات جارية الآن', value: state.customers.filter(c => c.status === CustomerOrderStatus.ACTIVE).length, icon: Activity, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'بانتظار البدء', value: state.customers.filter(c => c.status === CustomerOrderStatus.ASSIGNED).length, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'طلبات جديدة', value: state.customers.filter(c => c.status === CustomerOrderStatus.PENDING).length, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const availableSitters = state.sitters.filter(s => s.status === 'qualified' && s.workStatus === 'available');

  // Dummy chart data
  const data = [
    { name: '1 May', revenue: 4000 },
    { name: '2 May', revenue: 3000 },
    { name: '3 May', revenue: 2000 },
    { name: '4 May', revenue: 2780 },
    { name: '5 May', revenue: 1890 },
    { name: '6 May', revenue: 2390 },
    { name: '7 May', revenue: 3490 },
  ];

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="space-y-10 pb-20">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ملخص النشاط اليومي</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">نظرة عامة على أداء المنصة التشغيلي والفني</p>
        </div>
        {isAdmin && (
           <div className="text-left bg-slate-50 p-4 px-6 rounded-2xl border border-slate-100 flex items-center gap-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">إجمالي إيرادات الأسبوع</span>
                <span className="text-2xl font-black text-brand-600 font-mono tracking-tighter">{totalRevenue.toLocaleString()} ج.م</span>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-green-500">
                <ArrowUpRight className="w-6 h-6" />
              </div>
           </div>
        )}
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-slate-200 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:bg-brand-50 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`${stat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">معدل النمو</div>
                   <div className="text-green-500 text-xs font-black">+12%</div>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter font-mono">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative ${!isAdmin && 'opacity-50 grayscale pointer-events-none'}`}
        >
          {!isAdmin && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-xl">
               <div className="bg-slate-900 text-white px-8 py-4 rounded-[24px] flex items-center gap-4 shadow-2xl">
                  <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">بيانات الأرباح للمديرين فقط</span>
               </div>
            </div>
          )}
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Target className="w-6 h-6 text-brand-600" />
                تحليل الإيرادات والنمو
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1">تتبع مؤشرات الأداء المالي خلال الأيام السبعة الأخيرة</p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                 <button className="bg-white border border-slate-200 px-5 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">تصدير PDF</button>
                 <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-brand-600 transition-all shadow-lg shadow-slate-200">التقارير التفصيلية</button>
              </div>
            )}
          </div>
          
          <div className="p-10 w-full" style={{ height: 400, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} 
                />
                <Tooltip 
                  cursor={{ stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '8 8' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '20px',
                    backgroundColor: '#fff'
                  }}
                  itemStyle={{ fontWeight: 900, color: '#0ea5e9', fontSize: '14px' }}
                  labelStyle={{ fontWeight: 900, color: '#64748b', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0ea5e9" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full opacity-30 -z-0" />
          
          <div className="relative z-10 flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900">أقوى الكوادر المتاحة</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full border border-brand-100">
               <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
               <span className="text-[10px] font-black uppercase">متاح الآن</span>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            {availableSitters.slice(0, 5).map((sitter, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02, x: -5 }}
                className="flex items-center gap-5 p-5 border border-slate-50 rounded-3xl hover:border-brand-200 hover:bg-brand-50/20 cursor-pointer transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-brand-100/20 group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-slate-100 group-hover:rotate-3 transition-transform">
                  {sitter.profilePhoto ? (
                    <img src={sitter.profilePhoto} alt={sitter.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <Baby className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate group-hover:text-brand-600 transition-colors">{sitter.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <Award className="w-3 h-3 text-brand-500" />
                     <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tight">{sitter.rank || 'خالة جديدة'}</p>
                  </div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm text-[10px] font-black text-brand-600">
                   5.0 ⭐
                </div>
              </motion.div>
            ))}
            {availableSitters.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-sm">
                   <Users className="w-8 h-8" />
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">لا يوجد خالات متاحات حالياً</p>
              </div>
            )}
          </div>
          
          <div className="mt-10 pt-10 border-t border-slate-50 relative z-10">
            <button className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-2xl shadow-slate-200 active:scale-95">
              فتح كافة ملفات التوظيف
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
