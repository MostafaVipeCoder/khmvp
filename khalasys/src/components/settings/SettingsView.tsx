import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Package as PackageIcon, 
  Plus, 
  Trash2, 
  DollarSign, 
  Clock, 
  Award,
  Settings as SettingsIcon,
  Save,
  Trash,
  Archive,
  Eye,
  EyeOff,
  Edit2,
  RefreshCw,
  Zap,
  Layout,
  Globe,
  Bell,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { Package } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const SettingsView: React.FC = () => {
  const { state, addPackage, updatePackage, deletePackage, restorePackage } = useApp();
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    hours: 0,
    price: 0,
    sitterPay: 0,
  });

  const activePackages = state.packages.filter(p => !p.archived);
  const archivedPackages = state.packages.filter(p => p.archived);

  const handleDeleteClick = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من أرشفة باقة "${name}"؟ لن يتم حذف البيانات التاريخية المرتبطة بها، ولكنها لن تظهر في الخيارات الجديدة.`)) {
      deletePackage(id);
    }
  };

  const handleRestoreClick = (id: string, name: string) => {
    if (window.confirm(`هل تريد استعادة باقة "${name}" لتظهر مرة أخرى في الخيارات النشطة؟`)) {
      restorePackage(id);
    }
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackageId) {
      updatePackage(editingPackageId, packageFormData);
    } else {
      addPackage(packageFormData);
    }
    setPackageFormData({ name: '', hours: 0, price: 0, sitterPay: 0 });
    setShowPackageForm(false);
    setEditingPackageId(null);
  };

  const startEdit = (pkg: Package) => {
    setEditingPackageId(pkg.id);
    setPackageFormData({
      name: pkg.name,
      hours: pkg.hours,
      price: pkg.price,
      sitterPay: pkg.sitterPay || 0,
    });
    setShowPackageForm(true);
  };

  const cancelEdit = () => {
    setEditingPackageId(null);
    setPackageFormData({ name: '', hours: 0, price: 0, sitterPay: 0 });
    setShowPackageForm(false);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة المنظومة والأسعار</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">تخصيص باقات الخدمة، التسعير، والإعدادات التقنية للنظام</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Packages Management Card */}
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6 bg-slate-50/50">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm">
                     <PackageIcon className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900">هيكلة الباقات والخدمات</h3>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">تحديث قوائم الأسعار ونسب العمولات</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {archivedPackages.length > 0 && (
                    <button 
                      onClick={() => setShowArchived(!showArchived)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showArchived ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                       {showArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       {showArchived ? 'إخفاء الأرشيف' : 'سجل الأرشيف'}
                    </button>
                  )}
                  {!showPackageForm && (
                    <button 
                      onClick={() => setShowPackageForm(true)}
                      className="btn-primary"
                    >
                       <Plus className="w-5 h-5" />
                       باقة جديدة
                    </button>
                  )}
               </div>
            </div>

            <AnimatePresence>
              {showPackageForm && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-brand-50/30 border-b border-brand-100"
                >
                  <div className="p-10">
                    <h4 className="text-xs font-black text-brand-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
                      {editingPackageId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingPackageId ? 'تعديل بيانات الباقة الحالية' : 'تكويد باقة خدمة جديدة'}
                    </h4>
                    <form onSubmit={handlePackageSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">اسم الباقة</label>
                        <input 
                          required
                          type="text"
                          placeholder="مثلاً: باقة 6 ساعات"
                          value={packageFormData.name}
                          onChange={(e) => setPackageFormData({...packageFormData, name: e.target.value})}
                          className="input-field"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">عدد الساعات</label>
                        <input 
                          required
                          type="number"
                          value={packageFormData.hours}
                          onChange={(e) => setPackageFormData({...packageFormData, hours: parseInt(e.target.value) || 0})}
                          className="input-field"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">سعر العميل (ج.م)</label>
                        <input 
                          required
                          type="number"
                          value={packageFormData.price}
                          onChange={(e) => setPackageFormData({...packageFormData, price: parseInt(e.target.value) || 0})}
                          className="input-field"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">نصيب الخالة (ج.م)</label>
                        <input 
                          required
                          type="number"
                          value={packageFormData.sitterPay}
                          onChange={(e) => setPackageFormData({...packageFormData, sitterPay: parseInt(e.target.value) || 0})}
                          className="input-field"
                        />
                      </div>
                      <div className="md:col-span-4 flex justify-end gap-4 mt-4">
                         <button type="button" onClick={cancelEdit} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">تراجع</button>
                         <button type="submit" className="btn-primary px-10 shadow-2xl shadow-brand-200">
                           {editingPackageId ? 'تحديث البيانات' : 'اعتماد الباقة'}
                         </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 space-y-4">
               {(showArchived ? state.packages : activePackages).map((pkg, idx) => (
                  <motion.div 
                    key={pkg.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-6 rounded-[32px] flex items-center justify-between group transition-all duration-500 border ${pkg.archived ? 'bg-slate-50/50 grayscale border-slate-100 opacity-60' : 'bg-white border-transparent hover:border-brand-200 hover:shadow-2xl hover:shadow-slate-200'}`}
                  >
                     <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[22px] flex flex-col items-center justify-center transition-all duration-500 shadow-sm border ${pkg.archived ? 'bg-slate-200 border-slate-300' : 'bg-brand-50 border-brand-100 text-brand-600 group-hover:scale-110 group-hover:rotate-3'}`}>
                           <span className="text-xl font-black font-mono leading-none tracking-tighter">{pkg.hours}</span>
                           <span className="text-[8px] uppercase font-black tracking-widest mt-1">ساعة</span>
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                             <h4 className="text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors">{pkg.name}</h4>
                             {pkg.archived && (
                               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-black rounded-lg uppercase tracking-tighter">
                                 <Archive className="w-2.5 h-2.5" />
                                 مؤرشفة
                               </div>
                             )}
                           </div>
                           <div className="flex items-center gap-6 mt-2">
                              <div className="flex items-center gap-2">
                                 <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                                 <span className="text-[11px] font-black text-slate-500 tracking-tight">العميل: <span className="text-teal-600">{pkg.price} ج.م</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Award className="w-3.5 h-3.5 text-orange-500" />
                                 <span className="text-[11px] font-black text-slate-500 tracking-tight">الخالة: <span className="text-orange-500">{pkg.sitterPay} ج.م</span></span>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end">
                           <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">صافي العائد</p>
                           <p className="text-base font-black text-slate-900 font-mono tracking-tighter">{pkg.price - (pkg.sitterPay || 0)} ج.م</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!pkg.archived ? (
                            <>
                              <button 
                                onClick={() => startEdit(pkg)}
                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                              >
                                 <Edit2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(pkg.id, pkg.name)}
                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                 <Archive className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleRestoreClick(pkg.id, pkg.name)}
                              className="px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                            >
                               <RefreshCw className="w-4 h-4" />
                               استعادة
                            </button>
                          )}
                        </div>
                     </div>
                  </motion.div>
               ))}
               {(showArchived ? state.packages : activePackages).length === 0 && (
                 <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <PackageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest italic">لا توجد باقات لعرضها حالياً</p>
                 </div>
               )}
            </div>
          </section>

          {/* System Settings Card */}
          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 opacity-40" />
             <div className="relative z-10">
               <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                     <SettingsIcon className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900">بروفايل المنصة والإعدادات</h3>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">تخصيص الهوية البصرية والرسائل التلقائية</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Layout className="w-3 h-3" />
                       الاسم التجاري للمنصة
                     </label>
                     <input type="text" defaultValue="خالة وسند" className="input-field" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Globe className="w-3 h-3" />
                       العملة المستخدمة
                     </label>
                     <div className="relative">
                       <input type="text" defaultValue="جنيه مصري (EGP)" className="input-field pr-10 opacity-60" disabled />
                       <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                     </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Bell className="w-3 h-3" />
                       رسالة الترحيب الرقمية للعملاء الجدد
                     </label>
                     <textarea className="input-field h-32 resize-none p-6 font-medium leading-relaxed" defaultValue="أهلاً بك في نظام خالة وسند الرقمي. نحن هنا لخدمتكم ورعاية أطفالكم بأمان وحب فائقين." />
                  </div>
               </div>

               <div className="mt-12 flex justify-end">
                  <button className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-300 hover:bg-brand-600 transition-all active:scale-95 group">
                     <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                     حفظ كافة الإعدادات
                  </button>
               </div>
             </div>
          </section>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-10">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity" />
              
              <h3 className="text-xl font-black mb-3 flex items-center gap-3 relative z-10">
                 <DollarSign className="w-6 h-6 text-brand-400" />
                 محلل الهامش الربحي
              </h3>
              <p className="text-slate-400 text-xs mb-10 opacity-80 font-bold leading-relaxed relative z-10">تحليل كفاءة التسعير بناءً على الباقات الحالية ونسب العمولات المحددة.</p>
              
              <div className="space-y-8 relative z-10">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">متوسط سعر الساعة (عميل)</span>
                       <span className="text-sm font-black font-mono text-brand-400 tracking-tighter">~120 ج.م</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-brand-500 rounded-full shadow-[0_0_8px_rgba(var(--brand-primary),0.8)]" 
                       />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">متوسط تكلفة الكادر (خالة)</span>
                       <span className="text-sm font-black font-mono text-orange-400 tracking-tighter">~85 ج.م</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '55%' }}
                        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                        className="h-full bg-orange-400 rounded-full shadow-[0_0_8px_rgba(251,146,60,0.8)]" 
                       />
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-800 relative z-10">
                 <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 group-hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-400">
                       <Zap className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">توصية النظام</p>
                       <p className="text-[11px] text-slate-300 font-bold leading-tight">تأكد من أن صافي ربح الساعة لا يقل عن <span className="text-white">35 جنيه</span> لتغطية المصاريف الإدارية.</p>
                    </div>
                 </div>
              </div>
           </motion.div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
                <Layout className="w-4 h-4 text-brand-600" />
                تطوير الواجهة
              </h4>
              <div className="space-y-4">
                 {[
                   { label: 'تفعيل الوضع الليلي', status: 'تجريبي', enabled: false },
                   { label: 'تعدد اللغات (Arabic/English)', status: 'قريباً', enabled: false },
                   { label: 'إشعارات لحظية للتشغيل', status: 'نشط', enabled: true },
                 ].map((opt, i) => (
                   <div key={i} className="flex justify-between items-center p-4 border border-slate-50 rounded-2xl group hover:bg-slate-50 transition-all cursor-pointer">
                      <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900">{opt.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${opt.enabled ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{opt.status}</span>
                        <div className={`w-10 h-5 rounded-full p-1 transition-colors ${opt.enabled ? 'bg-brand-600' : 'bg-slate-200'}`}>
                           <div className={`w-3 h-3 bg-white rounded-full transition-transform ${opt.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-brand-50 rounded-[40px] border border-brand-100 text-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <RefreshCw className="w-6 h-6 text-brand-600" />
              </div>
              <h4 className="text-sm font-black text-brand-900 mb-2">نسخة النظام v2.4.0</h4>
              <p className="text-[10px] text-brand-700 font-bold opacity-80">جميع الحقوق محفوظة لمنصة خالة وسند © 2024</p>
           </div>
        </div>
      </div>
    </div>
  );
};
