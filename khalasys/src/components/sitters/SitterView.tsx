import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Plus, 
  Baby as ChildIcon, 
  Phone, 
  MapPin, 
  Briefcase, 
  Clock, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Star,
  Award,
  History,
  Camera,
  XCircle,
  Save,
  User,
  Calendar,
  FileCheck,
  Zap
} from 'lucide-react';
import { SitterStatus, SitterWorkStatus, Sitter } from '../../types';
import { motion } from 'motion/react';

export const SitterView: React.FC = () => {
  const { state, addSitter, updateSitter } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const selectedSitter = state.sitters.find(s => s.id === selectedProfileId);

  const ONBOARDING_FLOW = [
    { status: SitterStatus.PENDING, label: 'تقديم الطلب', duration: '7 أيام', icon: User, color: 'bg-brand-50 text-brand-600' },
    { status: SitterStatus.INTERVIEW_SCHEDULED, label: 'المقابلات', duration: 'يومين', icon: Calendar, color: 'bg-accent-50 text-accent-600' },
    { status: SitterStatus.TRAINING, label: 'التطوير والتدريب', duration: '14 يوم', icon: Zap, color: 'bg-orange-50 text-orange-600' },
    { status: SitterStatus.QUALIFIED, label: 'خالة مؤهلة', duration: 'مستمر', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    age: '',
    qualification: '',
    experience: '',
    availability: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSitter(formData);
    setShowForm(false);
    setFormData({
      name: '',
      phone: '',
      address: '',
      age: '',
      qualification: '',
      experience: '',
      availability: '',
    });
  };

  const [editProfileData, setEditProfileData] = useState<Partial<Sitter> | null>(null);

  const handleOpenProfile = (sitter: Sitter) => {
    setSelectedProfileId(sitter.id);
    setEditProfileData({ ...sitter });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProfileId && editProfileData) {
      if (editProfileData.status === SitterStatus.QUALIFIED && !editProfileData.criminalRecordPhoto) {
        alert('لا يمكن تفعيل "خالة مؤهلة" بدون رفع صورة الفيش الجنائي. هذا الإجراء ضروري للأمان.');
        return;
      }

      updateSitter(selectedProfileId, editProfileData);
      setSelectedProfileId(null);
      setEditProfileData(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case SitterStatus.QUALIFIED: return 'bg-green-50 text-green-600 border-green-100';
      case SitterStatus.PENDING: return 'bg-slate-50 text-slate-400 border-slate-100';
      case SitterStatus.TRAINING: return 'bg-brand-50 text-brand-600 border-brand-100';
      case SitterStatus.INTERVIEW_SCHEDULED: return 'bg-accent-50 text-accent-600 border-accent-100';
      case SitterStatus.REJECTED: return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getWorkStatusStyle = (status: SitterWorkStatus) => {
    switch (status) {
      case SitterWorkStatus.AVAILABLE: return 'bg-green-500';
      case SitterWorkStatus.BUSY: return 'bg-red-500';
      case SitterWorkStatus.AWAY: return 'bg-slate-300';
      default: return 'bg-slate-200';
    }
  };

  const getWorkStatusLabel = (status: SitterWorkStatus) => {
    switch (status) {
      case SitterWorkStatus.AVAILABLE: return 'متاحة حالياً';
      case SitterWorkStatus.BUSY: return 'في جولة عمل';
      case SitterWorkStatus.AWAY: return 'غير متفرغة';
      default: return status;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case SitterStatus.QUALIFIED: return 'خالة مؤهلة';
      case SitterStatus.PENDING: return 'بانتظار المراجعة';
      case SitterStatus.TRAINING: return 'تحت التدريب';
      case SitterStatus.INTERVIEW_SCHEDULED: return 'موعد مقابلة';
      case SitterStatus.REJECTED: return 'تم الرفض';
      default: return status;
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">سجل الكوادر البشرية</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">إدارة ملفات الخالات وتتبع مسارهم المهني والتشغيلي</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة كادر جديد</span>
        </button>
      </header>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">اسم الخالة الرباعي</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="الاسم بالكامل كما في البطاقة"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">رقم الهاتف الأساسي</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">العمر</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="input-field"
                    placeholder="بالسنوات"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">المؤهل الدراسي</label>
                  <input 
                    type="text" 
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="input-field"
                    placeholder="أعلى مؤهل حصلت عليه"
                  />
                </div>
              </div>

              <div className="p-5 bg-brand-50 rounded-2xl border border-brand-100 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-brand-600 mt-0.5" />
                <p className="text-[11px] text-brand-800 font-bold leading-relaxed">
                   سيتم إدراج المتقدمة في مرحلة "بانتظار المراجعة" تلقائياً. يرجى مراجعة ملفها وتحديد موعد مقابلة في أقرب وقت.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">العنوان بالتفصيل</label>
                <input 
                   required
                   type="text" 
                   value={formData.address}
                   onChange={(e) => setFormData({...formData, address: e.target.value})}
                   className="input-field"
                   placeholder="المحافظة، المنطقة، الشارع، علامة مميزة"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">المواعيد المتاحة</label>
                <input 
                  required
                  type="text" 
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="input-field"
                  placeholder="مثال: طوال الأسبوع، أو السبت-الخميس (8ص-6م)"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">الخبرات السابقة والتدريبات</label>
                <textarea 
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="input-field h-24 resize-none"
                  placeholder="ذكر أي دورات تدريبية أو خبرة سابقة في رعاية الأطفال..."
                ></textarea>
              </div>
              
              <div className="flex justify-end pt-4 gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                >
                  تراجع
                </button>
                <button 
                  type="submit" 
                  className="btn-primary px-10"
                >
                  اعتماد الطلب الأولية
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          {state.sitters.map((sitter, idx) => (
            <motion.div 
              key={sitter.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleOpenProfile(sitter)}
              className="bg-white rounded-[32px] border border-slate-100 p-6 hover:border-brand-200 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer group relative overflow-hidden"
            >
               {/* Rank Badge */}
               <div className="absolute top-6 left-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full border border-brand-100 shadow-sm">
                     <Award className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-tight">{sitter.rank || 'خالة جديدة'}</span>
                  </div>
               </div>

               <div className="flex items-center gap-6 mb-8">
                 <div className="relative">
                    <div className="w-20 h-20 rounded-[28px] overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 group-hover:scale-105 transition-transform duration-500">
                      {sitter.profilePhoto ? (
                        <img 
                          src={sitter.profilePhoto} 
                          alt={sitter.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                          <User className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-xl border-4 border-white shadow-lg ${getWorkStatusStyle(sitter.workStatus)} animate-pulse`} />
                 </div>

                 <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">{sitter.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-5 h-5 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                         <MapPin className="w-3 h-3" />
                       </div>
                       <p className="text-[11px] text-slate-400 font-black tracking-tight truncate uppercase">
                         {sitter.address.split('،')[0]}
                       </p>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                     <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">طاقة التشغيل</p>
                     <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-500" />
                        <span className="text-xs font-black text-slate-800 tracking-tighter">{sitter.availability}</span>
                     </div>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                     <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">رصيد الخبرة</p>
                     <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-brand-500" />
                        <span className="text-xs font-black text-slate-800 tracking-tighter">{sitter.totalHours || 0} ساعة</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-500 font-mono tracking-tighter">{sitter.phone}</span>
                  </div>
                  <div className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border transition-all shadow-sm ${getStatusStyle(sitter.status)}`}>
                    {getStatusLabel(sitter.status)}
                  </div>
               </div>
            </motion.div>
          ))}

          {state.sitters.length === 0 && (
             <div className="md:col-span-2 text-center py-32 bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100">
               <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-200">
                 <User className="w-12 h-12" />
               </div>
               <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">لا توجد بيانات مسجلة</h3>
               <p className="text-slate-300 mt-2 font-bold italic">ابدأ ببناء فريق الخالات الخاص بك الآن</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-fit sticky top-8">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                   <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">بدلات التشغيل</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">صافي الربح للجلسة</p>
                </div>
             </div>
             <div className="space-y-4">
                {state.packages.map(pkg => (
                  <div key={pkg.id} className="p-5 border border-slate-50 rounded-2xl bg-slate-50/20 hover:bg-white hover:border-orange-100 transition-all cursor-default group">
                     <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-black text-slate-800">{pkg.name}</p>
                        <p className="text-sm font-black text-orange-600 font-mono tracking-tighter group-hover:scale-110 transition-transform">{pkg.sitterPay} ج.م</p>
                     </div>
                     <div className="flex justify-between items-center text-[10px]">
                        <p className="text-slate-400 font-bold uppercase tracking-tight">{pkg.hours} ساعة تدريب</p>
                        <p className="text-teal-600 font-black italic">باقة معتمدة</p>
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-10 p-6 bg-brand-50 rounded-3xl border border-brand-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-200">
                     <Star className="w-4 h-4 fill-current" />
                   </div>
                   <h4 className="text-xs font-black text-brand-900 uppercase tracking-widest">نظام الترقيات الفني</h4>
                </div>
                <div className="space-y-3">
                   {[
                     { label: 'خالة جديدة', hours: '0 - 50 ساعة', color: 'text-slate-400' },
                     { label: 'خالة فضية', hours: '50 - 150 ساعة', color: 'text-brand-600' },
                     { label: 'خالة ذهبية', hours: '150 - 400 ساعة', color: 'text-accent-600' },
                     { label: 'خالة ماسية', hours: '+400 ساعة', color: 'text-indigo-600' }
                   ].map((rank, i) => (
                     <div key={i} className="flex justify-between items-center group">
                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${rank.color}`}>{rank.label}</span>
                        <span className="text-[9px] font-bold text-slate-500 font-mono">{rank.hours}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="mt-10 p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl shadow-slate-300 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-6 relative">
                   <Calendar className="w-5 h-5 text-brand-400" />
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">مخطط الدورة الشهرية</h4>
                </div>
                <div className="space-y-6 relative">
                   {[
                     { time: 'الأسبوع 01', task: 'فرز طلبات الانضمام الرقمية' },
                     { time: 'يوم 08-10', task: 'مقابلات التقييم النفسي والفني' },
                     { time: 'الأسبوع 02', task: 'دورة التدريب العملي المكثفة' },
                     { time: 'الشهر القادم', task: 'الاعتماد النهائي وشهادة الأمان' }
                   ].map((step, i) => (
                     <div key={i} className="relative pr-6 border-r border-slate-700">
                        <div className="absolute -right-[4.5px] top-0 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-primary),0.8)]" />
                        <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-1">{step.time}</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{step.task}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Sitter Profile Detail Modal */}
      {selectedSitter && editProfileData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[48px] shadow-2xl w-full max-w-4xl relative overflow-hidden"
           >
              <div className="relative h-48 bg-slate-900 overflow-hidden">
                 <div className="absolute inset-0 opacity-20 premium-gradient blur-3xl scale-150 rotate-12" />
                 <button 
                   onClick={() => setSelectedProfileId(null)}
                   className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all backdrop-blur-md z-20 group"
                 >
                   <XCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                 </button>
                 
                 <div className="absolute -bottom-16 right-12 flex items-end gap-8 z-10">
                    <div className="relative group">
                       <div className="w-40 h-40 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl bg-white">
                          <img 
                            src={editProfileData.profilePhoto || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200'} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                       </div>
                       <label className="absolute inset-0 bg-black/60 rounded-[40px] opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                          <div className="flex flex-col items-center gap-2">
                             <Camera className="w-10 h-10 text-white" />
                             <span className="text-[10px] text-white font-black uppercase tracking-widest">تغيير الصورة</span>
                          </div>
                          <input 
                            type="text" 
                            className="hidden" 
                            onChange={(e) => setEditProfileData({...editProfileData, profilePhoto: e.target.value})}
                          />
                       </label>
                    </div>
                    <div className="pb-4">
                       <h3 className="text-4xl font-black text-slate-900 tracking-tight">{editProfileData.name}</h3>
                       <div className="flex items-center gap-3 mt-3">
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(editProfileData.status || SitterStatus.PENDING)}`}>
                             {getStatusLabel(editProfileData.status || '')}
                          </div>
                          <div className="flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                             <Award className="w-4 h-4" />
                             {editProfileData.rank}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="px-12 pt-24 pb-12 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">تعديل الرتبة</label>
                             <select 
                               value={editProfileData.rank}
                               onChange={(e) => setEditProfileData({...editProfileData, rank: e.target.value})}
                               className="input-field bg-slate-50 border-none font-black text-brand-600 cursor-pointer appearance-none"
                             >
                                <option value="خالة جديدة">خالة جديدة</option>
                                <option value="خالة متدربة">خالة متدربة</option>
                                <option value="خالة فضية">خالة فضية</option>
                                <option value="خالة ذهبية">خالة ذهبية</option>
                                <option value="خالة ماسية">خالة ماسية</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">تحديث الساعات</label>
                             <input 
                               type="number"
                               value={editProfileData.totalHours}
                               onChange={(e) => setEditProfileData({...editProfileData, totalHours: parseInt(e.target.value) || 0})}
                               className="input-field bg-slate-50 border-none font-mono font-black"
                             />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">العنوان المسجل</label>
                          <input 
                            type="text"
                            value={editProfileData.address}
                            onChange={(e) => setEditProfileData({...editProfileData, address: e.target.value})}
                            className="input-field bg-slate-50 border-none font-bold"
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">الحالة التشغيلية</label>
                             <select 
                               value={editProfileData.workStatus}
                               onChange={(e) => setEditProfileData({...editProfileData, workStatus: e.target.value as SitterWorkStatus})}
                               className="input-field bg-slate-50 border-none font-black cursor-pointer appearance-none"
                             >
                                <option value={SitterWorkStatus.AVAILABLE}>🟢 متاحة للعمل</option>
                                <option value={SitterWorkStatus.BUSY}>🔴 في مهمة حالياً</option>
                                <option value={SitterWorkStatus.AWAY}>⚪ غير متفرغة</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">الموبايل</label>
                             <input 
                               type="tel"
                               value={editProfileData.phone}
                               onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                               className="input-field bg-slate-50 border-none font-mono font-black"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ملخص الخبرات والتدريبات</label>
                          <textarea 
                            value={editProfileData.experience}
                            onChange={(e) => setEditProfileData({...editProfileData, experience: e.target.value})}
                            className="input-field h-40 bg-slate-50 border-none resize-none p-6 font-medium leading-relaxed"
                          />
                       </div>
                       
                       {/* Criminal Record Field */}
                       <div className={`p-6 rounded-[48px] border-2 border-dashed transition-all ${editProfileData.criminalRecordPhoto ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editProfileData.criminalRecordPhoto ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                                 <FileCheck className="w-5 h-5" />
                               </div>
                               <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">شهادة الأمان (الفيش الجنائي)</h4>
                             </div>
                             {editProfileData.criminalRecordPhoto && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                          <input 
                            type="text"
                            placeholder="ضع رابط صورة الفيش الجنائي المحدث..."
                            value={editProfileData.criminalRecordPhoto || ''}
                            onChange={(e) => setEditProfileData({...editProfileData, criminalRecordPhoto: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-4 focus:ring-brand-50"
                          />
                          {!editProfileData.criminalRecordPhoto && (
                            <p className="text-[10px] text-red-600 font-black mt-3 italic">* إجراء قانوني إلزامي للعمل داخل منازل العملاء.</p>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Onboarding Timeline */}
                 <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 mb-8 flex items-center gap-4 uppercase tracking-widest">
                       <History className="w-5 h-5 text-brand-600" />
                       خارطة التأهيل الفني
                    </h4>
                    <div className="flex items-start justify-between relative px-4">
                       <div className="absolute top-6 left-12 right-12 h-1 bg-slate-200 -z-0 rounded-full">
                          <motion.div 
                            className="h-full bg-brand-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(ONBOARDING_FLOW.findIndex(s => s.status === editProfileData.status) / 3) * 100}%` }}
                          />
                       </div>
                       
                       {ONBOARDING_FLOW.map((stage, idx) => {
                          const isActive = editProfileData.status === stage.status;
                          const isPast = idx < ONBOARDING_FLOW.findIndex(s => s.status === editProfileData.status);
                          
                          return (
                            <div key={stage.status} className="relative z-10 flex flex-col items-center flex-1">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isActive ? stage.color + ' ring-8 ring-white scale-125' : (isPast ? 'bg-brand-600 text-white' : 'bg-white text-slate-200 border border-slate-100')}`}>
                                  {isPast ? <CheckCircle className="w-6 h-6" /> : <stage.icon className="w-6 h-6" />}
                               </div>
                               <p className={`text-[10px] font-black mt-6 uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{stage.label}</p>
                               <span className="text-[9px] text-slate-400 font-black font-mono mt-1">{stage.duration}</span>
                            </div>
                          );
                       })}
                    </div>
                 </div>

                 <div className="flex items-center gap-6 pt-6">
                    <button 
                      type="submit"
                      className="flex-1 premium-gradient text-white p-5 rounded-[24px] font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-100"
                    >
                       <Save className="w-6 h-6" />
                       اعتماد كافة التحديثات
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedProfileId(null)}
                      className="px-10 p-5 bg-slate-100 text-slate-500 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                       إلغاء
                    </button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
};
