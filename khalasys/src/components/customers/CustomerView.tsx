import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Search, MapPin, User, Baby as ChildIcon, Clock, Phone, DollarSign, UserCheck, XCircle, CheckCircle2, MessageSquare, CreditCard, Package as PackageIcon, Camera } from 'lucide-react';
import { CustomerOrderStatus, SitterWorkStatus, SitterStatus, Customer } from '../../types';
import { format } from 'date-fns';
import { motion } from 'motion/react';


export const CustomerView: React.FC = () => {
  const { state, addCustomer, updateCustomer, assignSitterToOrder, startSession, endSession, addInvoice } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [selectedSitter, setSelectedSitter] = useState('');
  const [editingNotes, setEditingNotes] = useState<{ id: string, notes: string } | null>(null);
  const [paymentModal, setPaymentModal] = useState<Customer | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    items: '',
    idPhoto: ''
  });

  const openPaymentModal = (customer: Customer) => {
    const pkg = state.packages.find(p => p.id === customer.packageId);
    setPaymentModal(customer);
    setPaymentFormData({
      amount: pkg ? pkg.price : 0,
      items: pkg ? pkg.name : `جلسة ${customer.hoursNeeded} ساعات في ${customer.location}`,
      idPhoto: customer.idPhoto || ''
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentModal) {
      if (!paymentFormData.idPhoto) {
        alert('يرجى رفع صورة البطاقة لإتمام تفعيل الأوردر وإصدار الفاتورة');
        return;
      }

      addInvoice({
        customerId: paymentModal.id,
        amount: paymentFormData.amount,
        items: paymentFormData.items.split(',').map(i => i.trim()),
        status: 'paid',
      });

      updateCustomer(paymentModal.id, { 
        idPhoto: paymentFormData.idPhoto,
        status: CustomerOrderStatus.PENDING 
      });

      setPaymentModal(null);
    }
  };

  const handleNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotes) {
      updateCustomer(editingNotes.id, { notes: editingNotes.notes });
      setEditingNotes(null);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    childName: '',
    childAge: '',
    tasks: '',
    hoursNeeded: 4,
    location: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    if (!value) return '';
    switch (name) {
      case 'name':
      case 'childName':
        if (!/^[\u0621-\u064A\s]+$/.test(value)) {
          return 'يجب أن يحتوي على حروف عربية فقط بدون رموز أو أرقام.';
        }
        break;
      case 'phone':
        if (!/^01[0125][0-9]{8}$/.test(value)) {
          return 'رقم التليفون يجب أن يكون رقم مصري صحيح (11 رقم).';
        }
        break;
      case 'childAge':
        if (!/^[0-9]+$/.test(value)) {
          return 'عمر الطفل يجب أن يكون أرقام فقط.';
        }
        break;
    }
    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {
      name: validateField('name', formData.name),
      phone: validateField('phone', formData.phone),
      childName: validateField('childName', formData.childName),
      childAge: validateField('childAge', formData.childAge)
    };

    if (Object.values(errors).some(err => err !== '')) {
      setFormErrors(errors);
      return;
    }

    addCustomer(formData);
    setShowForm(false);
    setFormData({
      name: '',
      phone: '',
      address: '',
      childName: '',
      childAge: '',
      tasks: '',
      hoursNeeded: 4,
      location: '',
    });
    setFormErrors({});
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (assigningTo && selectedSitter) {
      assignSitterToOrder(assigningTo, selectedSitter);
      setAssigningTo(null);
      setSelectedSitter('');
    }
  };

  const getOrderStatusLabel = (status: CustomerOrderStatus) => {
    switch (status) {
      case CustomerOrderStatus.PENDING: return { label: 'قيد التسكين', class: 'bg-amber-50 text-amber-600 border-amber-100' };
      case CustomerOrderStatus.ASSIGNED: return { label: 'تم التسكين', class: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case CustomerOrderStatus.ACTIVE: return { label: 'جاري العمل', class: 'bg-green-50 text-green-600 border-green-100' };
      case CustomerOrderStatus.COMPLETED: return { label: 'تم التنفيذ', class: 'bg-slate-50 text-slate-600 border-slate-100' };
      case CustomerOrderStatus.CANCELLED: return { label: 'ملغي', class: 'bg-red-50 text-red-600 border-red-100' };
      default: return { label: 'غير معروف', class: 'bg-slate-50 text-slate-400 border-slate-100' };
    }
  };

  const availableSitters = state.sitters.filter(s => 
    s.status === SitterStatus.QUALIFIED && s.workStatus === SitterWorkStatus.AVAILABLE
  );

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">طلبات العملاء</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">إدارة سجلات العملاء وعمليات التسكين</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary group"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-5 h-5" />
          </div>
          <span>تسجيل طلب جديد</span>
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">اسم الأم / العميل</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`input-field ${formErrors.name ? 'border-red-400 focus:ring-red-50' : ''}`}
                  placeholder="الاسم بالكامل"
                />
                {formErrors.name && <span className="text-xs text-red-500 mt-2 block font-bold">{formErrors.name}</span>}
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">رقم التليفون</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className={`input-field ${formErrors.phone ? 'border-red-400 focus:ring-red-50' : ''}`}
                  placeholder="01xxxxxxxxx"
                />
                {formErrors.phone && <span className="text-xs text-red-500 mt-2 block font-bold">{formErrors.phone}</span>}
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">العنوان بالتفصيل</label>
                <textarea 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field h-32 resize-none"
                  placeholder="العنوان السكني.."
                ></textarea>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">اسم الطفل</label>
                  <input 
                    required
                    type="text" 
                    value={formData.childName}
                    onChange={(e) => handleFieldChange('childName', e.target.value)}
                    className={`input-field ${formErrors.childName ? 'border-red-400 focus:ring-red-50' : ''}`}
                  />
                  {formErrors.childName && <span className="text-xs text-red-500 mt-2 block font-bold">{formErrors.childName}</span>}
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">عمر الطفل</label>
                  <input 
                    required
                    type="text" 
                    value={formData.childAge}
                    onChange={(e) => handleFieldChange('childAge', e.target.value)}
                    className={`input-field ${formErrors.childAge ? 'border-red-400 focus:ring-red-50' : ''}`}
                  />
                  {formErrors.childAge && <span className="text-xs text-red-500 mt-2 block font-bold">{formErrors.childAge}</span>}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">المهام المطلوبة من الخالة</label>
                <textarea 
                  required
                  value={formData.tasks}
                  onChange={(e) => setFormData({...formData, tasks: e.target.value})}
                  className="input-field h-32 resize-none"
                  placeholder="مثال: إطعام الطفل، اللعب معه.."
                ></textarea>
              </div>
              <div className="flex justify-end pt-4 gap-4">
                 <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                >
                  إلغاء
                </button>
                 <button 
                  type="submit" 
                  className="btn-primary px-8"
                >
                  حفظ الطلب
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[32px] border border-slate-100 flex flex-col overflow-hidden shadow-sm relative">
          {assigningTo && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-8 animate-in fade-in duration-300">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] shadow-2xl p-8 text-center"
               >
                  <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600 shadow-inner">
                    <UserCheck className="w-10 h-10" />
                  </div>
                  <h4 className="font-black text-2xl text-slate-900 mb-2">تسكين خالة للطلب</h4>
                  <p className="text-sm text-slate-400 font-medium mb-8">اختر الخالة المناسبة من قائمة الكوادر المؤهلة</p>
                  
                  <form onSubmit={handleAssign} className="space-y-6">
                     <div className="relative group">
                       <select 
                        required
                        value={selectedSitter}
                        onChange={(e) => setSelectedSitter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-brand-50 transition-all appearance-none cursor-pointer"
                       >
                         <option value="">اختر خالة...</option>
                         {availableSitters.map(s => (
                           <option key={s.id} value={s.id}>{s.name} ({s.experience})</option>
                         ))}
                         {availableSitters.length === 0 && <option disabled>لا يوجد خالات متاحات حالياً</option>}
                       </select>
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-brand-500 transition-colors">
                         <Search className="w-4 h-4" />
                       </div>
                     </div>
                     
                     <div className="flex gap-4">
                        <button 
                          type="submit" 
                          disabled={!selectedSitter}
                          className="btn-primary flex-1 py-4"
                        >
                          تأكيد التسكين
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAssigningTo(null)}
                          className="flex-1 bg-slate-100 text-slate-500 rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                          إلغاء
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
          )}

          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-900">سجل العمليات والطلبات</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">تتبع حالة كل عميل بشكل لحظي</p>
            </div>
            <div className="flex gap-3">
              <span className="text-[10px] bg-white shadow-sm border border-slate-100 px-3 py-1.5 rounded-full text-slate-500 font-bold">الكل ({state.customers.length})</span>
              <span className="text-[10px] bg-amber-50 shadow-sm border border-amber-100 px-3 py-1.5 rounded-full text-amber-600 font-bold">انتظار ({state.customers.filter(c => c.status === CustomerOrderStatus.PENDING).length})</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest min-w-[150px]">العميل</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest">الطفل والمنطقة</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest">الباقة</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest">الحالة</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest">الخالة</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {state.customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{customer.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-slate-600 text-xs font-bold">{customer.childName} <span className="text-slate-300 mx-1">•</span> {customer.childAge}</p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-brand-500" />
                        {customer.location || 'غير محدد'}
                      </p>
                    </td>
                    <td className="p-6">
                       <select 
                         value={customer.packageId || ''}
                         onChange={(e) => updateCustomer(customer.id, { packageId: e.target.value })}
                         className="bg-slate-50 hover:bg-slate-100 border-none rounded-xl px-3 py-1.5 text-[10px] font-black outline-none text-brand-700 transition-colors cursor-pointer"
                       >
                          <option value="">اختر الباقة..</option>
                          {state.packages.filter(p => !p.archived).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                       </select>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black border ${getOrderStatusLabel(customer.status).class}`}>
                        {getOrderStatusLabel(customer.status).label}
                      </span>
                    </td>
                    <td className="p-6">
                       {customer.assignedSitterId ? (
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                               {state.sitters.find(s => s.id === customer.assignedSitterId)?.name[0]}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{state.sitters.find(s => s.id === customer.assignedSitterId)?.name}</span>
                         </div>
                       ) : (
                         <span className="text-[10px] text-slate-300 font-bold italic tracking-wider">بانتظار خالة..</span>
                       )}
                    </td>
                    <td className="p-6">
                       <div className="flex justify-end gap-2.5">
                          {customer.status === CustomerOrderStatus.PENDING && (
                            <>
                              <button 
                                onClick={() => openPaymentModal(customer)}
                                className={`p-2.5 rounded-xl transition-all shadow-sm ${customer.idPhoto ? 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white' : 'bg-orange-50 text-orange-600 animate-pulse border border-orange-100'}`}
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setAssigningTo(customer.id)}
                                className="p-2.5 bg-accent-50 text-accent-600 rounded-xl hover:bg-accent-600 hover:text-white transition-all shadow-sm border border-accent-100"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => updateCustomer(customer.id, { status: CustomerOrderStatus.CANCELLED })}
                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {customer.status === CustomerOrderStatus.ASSIGNED && (
                             <button 
                                onClick={() => startSession(customer.id)}
                                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                             >
                                <Clock className="w-4 h-4" />
                             </button>
                          )}
                          {customer.status === CustomerOrderStatus.ACTIVE && (
                             <button 
                                onClick={() => endSession(customer.id)}
                                className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                             >
                               <CheckCircle2 className="w-4 h-4" />
                             </button>
                          )}
                          <button 
                            onClick={() => setEditingNotes({ id: customer.id, notes: customer.notes || '' })}
                            className={`p-2.5 rounded-xl transition-all shadow-sm ${customer.notes ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 border border-slate-100'}`}
                          >
                             <MessageSquare className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {state.customers.length === 0 && (
              <div className="text-center py-20 text-slate-300 italic">
                 <Search className="w-10 h-10 mx-auto mb-2 opacity-20" />
                 لا يوجد سجلات حالياً
              </div>
            )}
          </div>

          {/* Notes Modal */}
          {editingNotes && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-10 relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] -z-10" />
                  
                  <div className="flex justify-between items-center mb-10">
                     <div>
                        <h3 className="font-black text-2xl text-slate-900 flex items-center gap-3">
                           <MessageSquare className="w-8 h-8 text-amber-500" />
                           ملاحظات العملية
                        </h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">تحديث سجل المتابعة للطلب</p>
                     </div>
                     <button onClick={() => setEditingNotes(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                        <XCircle className="w-8 h-8" />
                     </button>
                  </div>
                  
                  <form onSubmit={handleNotesSubmit} className="space-y-6">
                     <textarea
                       autoFocus
                       className="w-full h-48 bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-sm font-medium focus:ring-4 focus:ring-amber-50 outline-none resize-none transition-all"
                       placeholder="اكتب ملاحظاتك هنا... (مثلاً: العميل طلب خالة تتحدث الانجليزية، أو تم تغيير الموعد)"
                       value={editingNotes.notes}
                       onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                     />
                     <button 
                       type="submit"
                       className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200"
                     >
                        حفظ التغييرات
                     </button>
                  </form>
               </motion.div>
            </div>
          )}

          {/* Payment & Activation Modal */}
          {paymentModal && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-12 relative overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-2 premium-gradient" />
                  
                  <div className="flex justify-between items-start mb-12">
                     <div>
                        <div className="flex items-center gap-4 mb-2">
                           <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                             <CreditCard className="w-6 h-6" />
                           </div>
                           <h3 className="font-black text-3xl text-slate-900">تفعيل الطلب المالي</h3>
                        </div>
                        <p className="text-slate-400 font-bold text-sm">يرجى مراجعة تفاصيل الفاتورة وإثبات الهوية</p>
                     </div>
                     <button onClick={() => setPaymentModal(null)} className="text-slate-200 hover:text-slate-400 transition-colors">
                        <XCircle className="w-10 h-10" />
                     </button>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-8">
                     <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 space-y-6">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-black text-slate-400 uppercase tracking-widest">صاحب الطلب</span>
                           <span className="text-lg font-black text-slate-900">{paymentModal.name}</span>
                        </div>
                        
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">البند / الباقة المختارة</label>
                           <input 
                             type="text"
                             value={paymentFormData.items}
                             onChange={(e) => setPaymentFormData({...paymentFormData, items: e.target.value})}
                             className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-brand-700 outline-none focus:ring-4 focus:ring-brand-50 transition-all"
                           />
                        </div>

                        <div className="pt-6 border-t border-slate-200/50 flex justify-between items-center">
                           <span className="text-xl font-black text-slate-900 tracking-tight">إجمالي المستحق</span>
                           <div className="flex items-center gap-3">
                              <input 
                                type="number"
                                value={paymentFormData.amount}
                                onChange={(e) => setPaymentFormData({...paymentFormData, amount: parseInt(e.target.value) || 0})}
                                className="w-32 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-2xl font-black text-brand-600 outline-none text-center focus:ring-4 focus:ring-brand-50 transition-all shadow-sm"
                              />
                              <span className="text-sm font-black text-slate-400">ج.م</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="flex items-center gap-3 text-sm font-black text-slate-700">
                           <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                             <Camera className="w-4 h-4" />
                           </div>
                           صورة هوية العميل (الرقم القومي)
                        </label>
                        <div className="relative group">
                          <input 
                            required
                            type="text"
                            placeholder="ضع رابط صورة البطاقة للمعاينة..."
                            value={paymentFormData.idPhoto}
                            onChange={(e) => setPaymentFormData({...paymentFormData, idPhoto: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-6 text-sm font-medium outline-none focus:border-brand-400 focus:bg-white transition-all text-center"
                          />
                        </div>
                     </div>

                     <button 
                       type="submit"
                       className="w-full premium-gradient text-white py-5 rounded-[24px] font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand-200 flex items-center justify-center gap-4"
                     >
                        <CheckCircle2 className="w-8 h-8" />
                        تأكيد الدفع واعتماد الطلب
                     </button>
                  </form>
               </motion.div>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-fit sticky top-8">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm">
                 <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">باقات الخدمة</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">الأسعار الحالية</p>
              </div>
           </div>
           <div className="space-y-4">
              {state.packages.map(pkg => (
                <motion.div 
                  key={pkg.id} 
                  whileHover={{ x: -5 }}
                  className="p-5 border border-slate-50 rounded-2xl hover:border-brand-100 hover:bg-brand-50/20 transition-all group cursor-default"
                >
                   <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-black text-slate-800">{pkg.name}</p>
                      <p className="text-sm font-black text-brand-600 font-mono tracking-tighter">{pkg.price} ج.م</p>
                   </div>
                   <div className="flex justify-between items-center text-[10px]">
                      <p className="text-slate-400 font-bold tracking-tight">{pkg.hours} ساعة تدريب ومجالسة</p>
                      <div className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-black italic">
                        {pkg.sitterPay} ج.م
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
           <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed text-center">
                 * القائمة توضح إجمالي تكلفة الباقة على العميل وصافي الربح المخصص للجليسة بعد استقطاع رسوم المنصة.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
