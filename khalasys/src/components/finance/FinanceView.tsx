import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { 
  FileText, 
  DollarSign, 
  Camera, 
  Search, 
  ArrowUpRight 
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { state, addInvoice, updateCustomer } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'customer' as 'customer' | 'sitter',
    targetId: '',
    amount: 0,
    status: 'pending' as 'paid' | 'pending',
    items: '',
    customerIdPhoto: '' 
  });

  const selectedTarget = formData.type === 'customer' 
    ? state.customers.find(c => c.id === formData.targetId)
    : state.sitters.find(s => s.id === formData.targetId);

  const isIdMissing = formData.type === 'customer' && selectedTarget && !(selectedTarget as any).idPhoto;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'sitter'>('all');

  const filteredInvoices = state.invoices.filter(inv => {
    const customer = state.customers.find(c => c.id === inv.customerId);
    const sitter = state.sitters.find(s => s.id === inv.sitterId);
    const targetName = (customer?.name || sitter?.name || '').toLowerCase();
    const matchesSearch = targetName.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesType = filterType === 'all' || (filterType === 'customer' ? !!inv.customerId : !!inv.sitterId);
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, current) => acc + current.amount, 0);

  const pendingPayments = filteredInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((acc, current) => acc + current.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.targetId || formData.amount <= 0) return;
    
    // Duplicate Protection Logic
    const isDuplicate = state.invoices.some(inv => {
      const sameTarget = formData.type === 'customer' ? inv.customerId === formData.targetId : inv.sitterId === formData.targetId;
      const sameAmount = inv.amount === formData.amount;
      const sameItems = inv.items.join(', ') === formData.items;
      const isRecent = new Date().getTime() - new Date(inv.date).getTime() < 1000 * 60 * 60 * 24; // Within last 24 hours
      return sameTarget && sameAmount && sameItems && isRecent && inv.status === 'pending';
    });

    if (isDuplicate) {
      if (!confirm('توجد فاتورة (قيد الانتظار) بنفس القيمة لهذا الشخص تم إصدارها مؤخراً. هل أنت متأكد من تكرار العملية؟')) {
        return;
      }
    }

    // Validate ID photo if missing (for customers only)
    if (formData.type === 'customer' && isIdMissing && !formData.customerIdPhoto) {
      alert('لا يمكن إصدار فاتورة بدون صورة بطاقة العميل');
      return;
    }

    // Save ID photo for customer if provided
    if (formData.type === 'customer' && isIdMissing && formData.customerIdPhoto) {
      updateCustomer(formData.targetId, { idPhoto: formData.customerIdPhoto });
    }
    
    addInvoice({
      customerId: formData.type === 'customer' ? formData.targetId : undefined,
      sitterId: formData.type === 'sitter' ? formData.targetId : undefined,
      amount: formData.amount,
      status: formData.status,
      items: formData.items.split(',').map(item => item.trim()),
    });
    setShowForm(false);
    setFormData({ type: 'customer', targetId: '', amount: 0, status: 'pending', items: '', customerIdPhoto: '' });
  };

  const handlePackageSelect = (pkgId: string) => {
    const pkg = state.packages.find(p => p.id === pkgId);
    if (pkg) {
      setFormData({
        ...formData,
        amount: pkg.price,
        items: pkg.name
      });
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">المالية والحسابات</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">إدارة التدفقات النقدية والفواتير</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <FileText className="w-5 h-5" />
          <span>إصدار فاتورة جديدة</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm col-span-2 relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500" />
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">إجمالي المحصل (الصافي)</p>
               <h3 className="text-4xl font-black text-brand-600 tracking-tighter">{totalRevenue.toLocaleString()} ج.م</h3>
               <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full">
                 <ArrowUpRight className="w-3 h-3" />
                 <span>+12.5% عن الشهر الماضي</span>
               </div>
             </div>
             <div className="bg-brand-600 p-4 rounded-2xl shadow-xl shadow-brand-200 text-white">
                <DollarSign className="w-8 h-8" />
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
        >
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">فواتير معلقة</p>
          <p className="text-4xl font-black text-amber-500 tracking-tighter">{state.invoices.filter(i => i.status === 'pending').length}</p>
          <p className="text-[11px] text-slate-400 font-bold mt-4 bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
            إجمالي: {pendingPayments.toLocaleString()} ج.م
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
        >
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">نسبة التحصيل</p>
          <p className="text-4xl font-black text-accent-600 tracking-tighter">88.4%</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '88.4%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="premium-gradient h-full rounded-full" 
             />
          </div>
        </motion.div>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-3 flex p-1.5 bg-slate-50 rounded-2xl w-fit border border-slate-100">
                <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: 'customer', targetId: ''})}
                   className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'customer' ? 'bg-white text-brand-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   إيراد من عميل
                </button>
                <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: 'sitter', targetId: ''})}
                   className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'sitter' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   صرف مستحقات خالة
                </button>
             </div>

             <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   {formData.type === 'customer' ? 'اختيار العميل' : 'اختيار الخالة'}
                </label>
                <select 
                  required
                  value={formData.targetId}
                  onChange={(e) => setFormData({...formData, targetId: e.target.value})}
                  className="input-field appearance-none bg-slate-50 border-none cursor-pointer"
                >
                  <option value="">اختر الاسم من السجل..</option>
                  {formData.type === 'customer' ? (
                    state.customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    state.sitters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))
                  )}
                </select>
             </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">الباقة المرتبطة (اختياري)</label>
                <select 
                  onChange={(e) => handlePackageSelect(e.target.value)}
                  className="input-field appearance-none bg-slate-50 border-none cursor-pointer"
                >
                  <option value="">تخصيص يدوي..</option>
                  {state.packages.filter(p => !p.archived).map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price} ج.م)</option>
                  ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">المبلغ المالي</label>
                <div className="relative">
                  <input 
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value) || 0})}
                    className="input-field bg-slate-50 border-none pl-12"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ج.م</span>
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">حالة الفاتورة</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'paid' | 'pending'})}
                  className="input-field appearance-none bg-slate-50 border-none cursor-pointer"
                >
                  <option value="pending">قيد الانتظار (غير مدفوعة)</option>
                  <option value="paid">تم التحصيل / الصرف</option>
                </select>
             </div>

             <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">محتويات الفاتورة</label>
                <input 
                  type="text"
                  value={formData.items}
                  onChange={(e) => setFormData({...formData, items: e.target.value})}
                  className="input-field bg-slate-50 border-none"
                  placeholder="مثال: باقة البريميم، رسوم تدريب، سلفة..."
                />
             </div>

             {isIdMissing && (
               <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-3 p-6 bg-amber-50 border border-amber-100 rounded-[24px] flex items-center gap-6"
               >
                  <div className="w-16 h-16 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
                     <Camera className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-black text-amber-900 mb-2">تنبيه: لا توجد صورة بطاقة لهذا العميل بالسجل</p>
                     <input 
                       required
                       type="text" 
                       placeholder="يرجى وضع رابط صورة البطاقة لإتمام العملية.."
                       value={formData.customerIdPhoto}
                       onChange={(e) => setFormData({...formData, customerIdPhoto: e.target.value})}
                       className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                     />
                  </div>
               </motion.div>
             )}

             <div className="md:col-span-3 flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">تراجع</button>
                <button type="submit" className="btn-primary px-10">إصدار واعتماد الفاتورة</button>
             </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">سجل المعاملات المالية</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">تاريخ العمليات المالية المكتملة والمعلقة</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم.."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-brand-50 transition-all group-hover:border-slate-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
              </div>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-black outline-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="all">كل التصنيفات</option>
                <option value="customer">إيرادات عملاء</option>
                <option value="sitter">صرف خالات</option>
              </select>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-black outline-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <option value="all">كل الحالات</option>
                <option value="paid">مدفوعة</option>
                <option value="pending">معلقة</option>
              </select>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">الجهة / الهدف</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">تاريخ العملية</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">البيان</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">المبلغ</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">الحالة الضريبية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((invoice) => {
                const customer = state.customers.find(c => c.id === invoice.customerId);
                const sitter = state.sitters.find(s => s.id === invoice.sitterId);
                const targetName = customer ? customer.name : (sitter ? sitter.name : 'غير معروف');
                const isSitter = !!invoice.sitterId;

                return (
                  <tr key={invoice.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${isSitter ? 'bg-orange-50 text-orange-600' : 'bg-brand-50 text-brand-600'}`}>
                            {isSitter ? <ArrowUpRight className="w-5 h-5 rotate-180" /> : <DollarSign className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{targetName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isSitter ? 'مستحقات جليسة' : 'تحصيل من عميل'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6 text-slate-600 font-bold text-xs font-mono">
                       {format(new Date(invoice.date), 'dd MMMM yyyy')}
                    </td>
                    <td className="p-6 text-[11px] text-slate-500 font-bold max-w-xs truncate">
                       {invoice.items.join(' • ')}
                    </td>
                    <td className="p-6 font-black text-slate-900">
                       <span className={isSitter ? 'text-red-500' : 'text-brand-600'}>
                         {isSitter ? '-' : '+'}{invoice.amount.toLocaleString()} ج.م
                       </span>
                    </td>
                    <td className="p-6">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-colors ${
                         invoice.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                         {invoice.status === 'paid' ? 'تمت التسوية' : 'قيد المراجعة'}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
            <div className="p-20 text-center text-slate-300 italic font-medium flex flex-col items-center gap-4">
               <Search className="w-12 h-12 opacity-10" />
               <p>لا توجد سجلات مالية مطابقة للبحث حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
