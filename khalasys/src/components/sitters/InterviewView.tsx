import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'motion/react';

export const InterviewView: React.FC = () => {
  const { state, updateSitter, updateRecruitmentCycle } = useApp();
  const [activeTab, setActiveTab] = useState<'track' | 'workflow' | 'guide'>('track');

  const currentCycle = state.recruitmentCycles[0]; 
  const qualifiedThisCycle = state.sitters.filter(s => 
    s.status === SitterStatus.QUALIFIED && 
    new Date(s.createdAt) >= new Date(currentCycle.startDate)
  ).length;

  const interviewSitters = state.sitters.filter(s => 
    [SitterStatus.PENDING, SitterStatus.INTERVIEW_SCHEDULED, SitterStatus.TRAINING].includes(s.status)
  );

  const getStep = (status: SitterStatus) => {
    switch (status) {
      case SitterStatus.PENDING: return 1;
      case SitterStatus.INTERVIEW_SCHEDULED: return 2;
      case SitterStatus.TRAINING: return 3;
      case SitterStatus.QUALIFIED: return 4;
      default: return 0;
    }
  };

  const progressPercentage = Math.min((qualifiedThisCycle / currentCycle.targetCount) * 100, 100);

  const renderSitterGroup = (title: string, status: SitterStatus, icon: React.ReactNode, color: string) => {
    const sitters = interviewSitters.filter(s => s.status === status);
    if (sitters.length === 0) return null;

    return (
      <div className="space-y-6">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${color} flex items-center gap-3 px-2`}>
          <span className="w-8 h-px bg-current opacity-20" />
          {icon}
          {title} ({sitters.length})
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {sitters.map((sitter) => (
            <motion.div 
              key={sitter.id} 
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative group overflow-hidden hover:border-brand-200 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all duration-500 shadow-inner">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{sitter.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase">{sitter.qualification || sitter.phone}</p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md px-4">
                    <div className="relative flex items-center justify-between">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-50 -translate-y-1/2 -z-10 rounded-full">
                        <motion.div 
                          className="h-full bg-brand-200 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(getStep(sitter.status) / 4) * 100}%` }}
                        />
                      </div>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-500 relative ${
                          getStep(sitter.status) >= i 
                             ? (i === 4 ? 'bg-brand-600 border-brand-100' : 'bg-slate-900 border-slate-700') + ' text-white shadow-lg' 
                             : 'bg-white border-slate-100 text-slate-200'
                        }`}>
                            {i === 1 && <Plus className="w-4 h-4" />}
                            {i === 2 && <UserCheck className="w-4 h-4" />}
                            {i === 3 && <BrainCircuit className="w-4 h-4" />}
                            {i === 4 && <Award className="w-4 h-4" />}
                            
                            <span className={`absolute -bottom-6 whitespace-nowrap text-[8px] font-black uppercase tracking-widest ${getStep(sitter.status) >= i ? 'text-slate-900' : 'text-slate-300'}`}>
                              {i === 1 && 'تقديم'}
                              {i === 2 && 'مقابلة'}
                              {i === 3 && 'تدريب'}
                              {i === 4 && 'اعتماد'}
                            </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {sitter.status === SitterStatus.PENDING && (
                        <button 
                          onClick={() => updateSitter(sitter.id, { status: SitterStatus.INTERVIEW_SCHEDULED })}
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-slate-100"
                        >
                          تحديد موعد
                        </button>
                    )}
                    {sitter.status === SitterStatus.INTERVIEW_SCHEDULED && (
                        <button 
                          onClick={() => updateSitter(sitter.id, { status: SitterStatus.TRAINING })}
                          className="px-6 py-3 bg-accent-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-600 transition-all shadow-lg shadow-accent-100"
                        >
                          بدء التدريب
                        </button>
                    )}
                    {sitter.status === SitterStatus.TRAINING && (
                        <button 
                          onClick={() => updateSitter(sitter.id, { status: SitterStatus.QUALIFIED })}
                          className="btn-primary px-6 py-3 text-[10px]"
                        >
                          اعتماد نهائي
                        </button>
                    )}
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">استقطاب الكوادر وتأهيلها</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">إدارة دورة حياة الخالات من التقديم حتى الاعتماد</p>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-[20px] border border-slate-100">
           {[
             { id: 'track', label: 'مسار التأهيل', icon: Target },
             { id: 'workflow', label: 'خطة الدورة', icon: Settings },
             { id: 'guide', label: 'دليل الجودة', icon: Star }
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-brand-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <tab.icon className="w-3.5 h-3.5" />
               {tab.label}
             </button>
           ))}
        </div>
      </header>

      {activeTab === 'track' && (
        <div className="space-y-12">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-12">
                {renderSitterGroup('طلبات جديدة قيد المراجعة', SitterStatus.PENDING, <Plus className="w-4 h-4" />, 'text-slate-400')}
                {renderSitterGroup('مقابلات شخصية مجدولة', SitterStatus.INTERVIEW_SCHEDULED, <UserCheck className="w-4 h-4" />, 'text-accent-500')}
                {renderSitterGroup('كوادر تحت التدريب المكثف', SitterStatus.TRAINING, <BrainCircuit className="w-4 h-4" />, 'text-brand-600')}

                {interviewSitters.length === 0 && (
                  <div className="text-center py-24 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <Users className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">المسار خالي حالياً</h3>
                    <p className="text-xs text-slate-300 mt-2 font-bold uppercase tracking-tighter">ابدأ حملة توظيف جديدة لجذب أفضل الخالات</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group"
                 >
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-700" />
                    <h3 className="text-xs font-black mb-6 flex items-center gap-3 text-brand-400 tracking-[0.2em] uppercase">
                       <Target className="w-4 h-4" />
                       مؤشر الأداء الشهري
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">دورة: {currentCycle.month}</p>
                            <span className="text-4xl font-black tracking-tighter">{qualifiedThisCycle}<span className="text-lg text-slate-500 mx-2">/</span>{currentCycle.targetCount}</span>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-brand-400">{progressPercentage.toFixed(0)}%</p>
                          </div>
                       </div>
                       <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-brand-500 rounded-full shadow-[0_0_15px_rgba(var(--brand-primary),0.5)]" 
                          />
                       </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-6 leading-relaxed font-bold italic border-t border-white/5 pt-6">
                       تبقي <span className="text-white">{currentCycle.targetCount - qualifiedThisCycle} خالات</span> للوصول للهدف. الاستمرارية في التوظيف تضمن نمو العمليات.
                    </p>
                 </motion.div>

                 <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm group">
                    <h3 className="text-[10px] font-black mb-6 flex items-center gap-3 text-slate-400 tracking-[0.2em] uppercase">
                       <ExternalLink className="w-4 h-4" />
                       رابط التقديم الرقمي
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">شارك هذا الرابط في منصات التواصل لاستقبال طلبات الانضمام للفريق.</p>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 break-all mb-6 group-hover:border-brand-200 transition-colors">
                       <code className="text-[10px] font-black font-mono text-brand-600 uppercase tracking-tight">khala.io/careers/apply</code>
                    </div>
                    <button className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 bg-brand-50 py-4 rounded-2xl hover:bg-brand-600 hover:text-white transition-all duration-500 shadow-sm">
                       نسخ الرابط
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8">
              <section className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                 <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-xl text-slate-900 tracking-tight">التسلسل الزمني للاعتماد</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">الخطة المعيارية لدورة الاستقطاب</p>
                    </div>
                 </div>
                 <div className="p-12">
                    <div className="relative space-y-16">
                       <div className="absolute top-0 right-10 w-1 bg-slate-50 h-full -z-10 rounded-full" />
                       
                       <div className="flex items-start gap-12 group">
                          <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 relative z-10 ${currentCycle.stages.calls.status === 'done' ? 'bg-brand-600 text-white shadow-brand-200' : 'bg-white border border-slate-100 text-slate-200'}`}>
                             <Users className="w-10 h-10" />
                          </div>
                          <div className="flex-1 pt-2">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">المرحلة 01: فتح باب القبول</h4>
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${currentCycle.stages.calls.status === 'done' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                                   {currentCycle.stages.calls.status === 'done' ? 'مكتملة' : 'قيد الانتظار'}
                                </span>
                             </div>
                             <p className="text-[11px] text-slate-400 font-bold uppercase">المدة المقررة: <span className="text-slate-900">7 أيام عمل</span></p>
                             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                                  نشر الإعلان الرقمي الموحد
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                                  الفلترة الآلية للمؤهلات
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-start gap-12 group">
                          <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 relative z-10 ${currentCycle.stages.interviews.status === 'active' ? 'bg-accent-500 text-white shadow-accent-200' : 'bg-white border border-slate-100 text-slate-200'}`}>
                             <Calendar className="w-10 h-10" />
                          </div>
                          <div className="flex-1 pt-2">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">المرحلة 02: المقابلات الفنية</h4>
                                <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-accent-50 text-accent-600 ring-1 ring-accent-100">نشطة حالياً</span>
                             </div>
                             <p className="text-[11px] text-slate-400 font-bold uppercase">المدة المقررة: <span className="text-slate-900">يومين عمل</span></p>
                             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-accent-500" />
                                  تقييم الثبات الانفعالي واللباقة
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-accent-500" />
                                  استلام مسوغات التعيين (قانوني)
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-start gap-12 group">
                          <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 relative z-10 ${currentCycle.stages.training.status === 'active' ? 'bg-brand-600 text-white shadow-brand-200' : 'bg-white border border-slate-100 text-slate-200'}`}>
                             <BrainCircuit className="w-10 h-10" />
                          </div>
                          <div className="flex-1 pt-2">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">المرحلة 03: التدريب والتأهيل</h4>
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${currentCycle.stages.training.status === 'pending' ? 'bg-slate-50 text-slate-400' : 'bg-brand-50 text-brand-600'}`}>
                                   متبقي 12 يوم
                                </span>
                             </div>
                             <p className="text-[11px] text-slate-400 font-bold uppercase">المدة المقررة: <span className="text-slate-900">14 يوم تدريبي</span></p>
                             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                                  تدريب الإسعافات وتعديل السلوك
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-bold text-slate-600 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                                  أسبوع المحاكاة المنزلية
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </section>
           </div>
           
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-full h-1 premium-gradient" />
                 <h4 className="text-[11px] font-black uppercase text-slate-400 mb-8 tracking-widest">تحديث بارامترات الدورة</h4>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">تارجت الاعتماد المستهدف</label>
                       <input 
                         type="number" 
                         value={currentCycle.targetCount}
                         onChange={(e) => updateRecruitmentCycle(currentCycle.id, { targetCount: parseInt(e.target.value) || 0 })}
                         className="input-field bg-slate-50 border-none font-mono" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">تاريخ إطلاق الدورة</label>
                       <input 
                         type="date" 
                         className="input-field bg-slate-50 border-none cursor-pointer" 
                       />
                    </div>
                    <button className="w-full premium-gradient text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-100 active:scale-95 transition-all">
                       حفظ التعديلات
                    </button>
                 </div>
              </div>
              
              <div className="bg-brand-50 border border-brand-100 p-8 rounded-[32px] shadow-sm">
                 <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-200">
                    <ClipboardList className="w-6 h-6" />
                 </div>
                 <h4 className="text-base font-black text-brand-900 mb-2 uppercase tracking-tight">ثبات معايير الجودة</h4>
                 <p className="text-xs text-brand-700 leading-relaxed font-bold">
                    هذا النظام يضمن بقاء المعايير ثابتة عبر الأجيال الوظيفية. الالتزام بالجدول الزمني يقلل من مخاطر التوظيف المتسرع.
                 </p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { title: 'الكاريزما واللباقة', icon: Star, color: 'text-amber-500', items: ['الحديث الهادئ والثبات الانفعالي تحت الضغط', 'المظهر اللائق والاهتمام ببروتوكول النظافة', 'إتقان التعامل مع الأدوات الرقمية الحديثة', 'الوضوح والصدق في سرد السيرة المهنية'] },
             { title: 'التقييم السلوكي', icon: BrainCircuit, color: 'text-brand-600', items: ['سرعة البديهة في التعامل مع الطوارئ الطبية', 'مهارات التواصل مع الأطفال ذوي الاحتياجات', 'الانضباط والالتزام بالمواعيد والعهود', 'القابلية للتعلم وتقبل الملاحظات الفنية'] },
             { title: 'المعايير القانونية', icon: Award, color: 'text-red-500', items: ['أصل بطاقة الرقم القومي (سارية وصحيحة)', 'فيش جنائي حديث (خالي من السوابق)', 'تحليل مخدرات شامل من جهة معتمدة للشركة', 'شهادة صحية متكاملة (فحص دوري)'] }
           ].map((section, idx) => (
             <motion.section 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
             >
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                   <h3 className="font-black text-slate-900 flex items-center gap-4 uppercase tracking-tight">
                      <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${section.color}`}>
                        <section.icon className="w-5 h-5" />
                      </div>
                      {section.title}
                   </h3>
                </div>
                <div className="p-8 space-y-5">
                   {section.items.map((text, i) => (
                      <div key={i} className="flex items-start gap-4 group">
                         <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${idx === 2 ? 'border-red-100 bg-red-50 text-red-500' : 'border-brand-100 bg-brand-50 text-brand-600'}`}>
                           <CheckCircle className="w-3 h-3" />
                         </div>
                         <p className={`text-[11px] leading-relaxed font-bold ${idx === 2 ? 'text-slate-900' : 'text-slate-600'} group-hover:text-brand-600 transition-colors`}>{text}</p>
                      </div>
                   ))}
                </div>
             </motion.section>
           ))}
        </div>
      )}
    </div>
  );
};

import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  UserCheck,
  BrainCircuit,
  Award,
  Target,
  ArrowRight,
  ClipboardList,
  Clock,
  ExternalLink,
  Plus,
  Users,
  Settings,
  Star,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { SitterStatus } from '../../types';
