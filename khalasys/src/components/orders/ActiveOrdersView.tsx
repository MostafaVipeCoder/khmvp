import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { CustomerOrderStatus, SitterWorkStatus } from '../../types';
import { Clock, User, Baby as ChildIcon, MapPin, CheckCircle2, AlertCircle, Play, Timer, Activity, Phone, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion } from 'motion/react';

export const ActiveOrdersView: React.FC = () => {
  const { state, startSession, endSession } = useApp();
  
  const assignedOrders = state.customers.filter(c => c.status === CustomerOrderStatus.ASSIGNED);
  const activeOrders = state.customers.filter(c => c.status === CustomerOrderStatus.ACTIVE);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">غرفة العمليات المركزية</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">متابعة حية لمسارات الجلسات الميدانية والتشغيل</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100 flex items-center gap-4">
              <Activity className="w-6 h-6 text-brand-600" />
              <div>
                 <span className="text-[10px] font-black text-brand-900 uppercase block leading-none">نشط الآن</span>
                 <span className="text-xl font-black text-brand-600 leading-none">{activeOrders.length}</span>
              </div>
           </div>
        </div>
      </header>

      {/* Assigned but not started section */}
      <section className="space-y-6">
         <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-6 bg-accent-500 rounded-full" />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
               جلسات بانتظار إشارة البدء
               <span className="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-full font-black">{assignedOrders.length}</span>
            </h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignedOrders.map((order, idx) => {
              const sitter = state.sitters.find(s => s.id === order.assignedSitterId);
              return (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all p-8 group relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:bg-brand-50 transition-colors" />
                   
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-8">
                        <div>
                           <h4 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">{order.name}</h4>
                           <div className="flex items-center gap-2 mt-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-300" />
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{order.location}</p>
                           </div>
                        </div>
                        <div className="bg-accent-50 text-accent-600 p-3 rounded-2xl shadow-sm">
                           <Calendar className="w-5 h-5" />
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[28px] border border-slate-100 mb-8 group-hover:bg-white transition-colors">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-100">
                           {sitter?.profilePhoto ? (
                             <img src={sitter.profilePhoto} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-brand-50 flex items-center justify-center text-brand-600 font-black text-xl">
                               {sitter?.name[0]}
                             </div>
                           )}
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">الكادر المسكن</p>
                           <p className="text-sm font-black text-slate-700">{sitter?.name}</p>
                        </div>
                     </div>

                     <button 
                       onClick={() => startSession(order.id)}
                       className="w-full bg-slate-900 text-white rounded-[24px] py-5 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 active:scale-95"
                     >
                        <Play className="w-4 h-4 fill-current" />
                        إعطاء أمر التشغيل
                     </button>
                   </div>
                </motion.div>
              );
            })}
            
            {assignedOrders.length === 0 && (
               <div className="col-span-full py-20 text-center bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-200">
                    <Timer className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">لا يوجد جلسات مسندة حالياً</h3>
                  <p className="text-slate-300 mt-2 font-bold italic">قم بتسكين الخالات على الطلبات من صفحة العملاء</p>
               </div>
            )}
         </div>
      </section>

      {/* Active sessions section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-6 bg-brand-500 rounded-full animate-pulse" />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
               المراقبة الحية للجلسات
               <span className="bg-brand-50 text-brand-600 text-[10px] px-3 py-1 rounded-full font-black">{activeOrders.length}</span>
            </h3>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeOrders.map((order, idx) => {
            const sitter = state.sitters.find(s => s.id === order.assignedSitterId);
            const startTime = order.startTime ? new Date(order.startTime) : new Date();
            
            return (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all group relative"
              >
                <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-bl-full opacity-10" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                           <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest">مهمة نشطة</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock className="w-4 h-4 text-brand-400" />
                            <span>منذ {formatDistanceToNow(startTime, { locale: ar })}</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black group-hover:text-brand-400 transition-colors">{order.name}</h3>
                      <div className="flex items-center gap-2 mt-3 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{order.location}</span>
                      </div>
                    </div>
                </div>
                
                <div className="p-10 space-y-10">
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 group-hover:bg-brand-50 transition-colors group-hover:border-brand-100">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100">
                          {sitter?.profilePhoto ? (
                            <img src={sitter.profilePhoto} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-brand-600 flex items-center justify-center text-white font-black text-2xl">
                               {sitter?.name[0]}
                            </div>
                          )}
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">الخالة المنفذة</p>
                          <p className="text-base font-black text-slate-900">{sitter?.name || 'غير محدد'}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <Phone className="w-3 h-3 text-brand-600" />
                             <span className="text-[10px] font-mono font-black text-brand-700 tracking-tighter">{sitter?.phone}</span>
                          </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">وقت الانطلاق</p>
                          <span className="text-sm font-black text-slate-800 font-mono tracking-tighter">{format(startTime, 'hh:mm a')}</span>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">النصاب الزمني</p>
                          <span className="text-sm font-black text-slate-800 font-mono tracking-tighter">{order.hoursNeeded} ساعات</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => endSession(order.id)}
                        className="w-full premium-gradient text-white rounded-[24px] py-5 text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-100"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        إنهاء الجلسة واعتماد الساعات
                      </button>
                    </div>
                </div>
              </motion.div>
            );
          })}

          {activeOrders.length === 0 && (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100">
               <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-200">
                 <Activity className="w-12 h-12" />
               </div>
               <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">غرفة العمليات فارغة</h3>
               <p className="text-slate-300 mt-2 font-bold italic">لا يوجد أي خالات في جولات ميدانية حالياً</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
