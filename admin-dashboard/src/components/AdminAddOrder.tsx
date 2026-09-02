import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Client {
  id: string;
  full_name: string | null;
  client_unique_code: string;
}

const AdminAddOrder: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientCode, setSelectedClientCode] = useState<string>('');

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    duration_hours: 1,
    location: '',
    booking_type: 'home' as 'home' | 'outside',
    total_price: 0,
    children_count: 1,
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, client_unique_code')
        .eq('role', 'client')
        .not('client_unique_code', 'is', null);
      if (data) setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientCode) {
      setError('يرجى اختيار كود العميل');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get client id from code
      const client = clients.find(c => c.client_unique_code === selectedClientCode);
      if (!client) {
        throw new Error('العميل غير موجود');
      }

      // Create booking
      const { error: bookingError } = await supabase.from('bookings').insert({
        client_id: client.id,
        date: formData.date,
        start_time: formData.start_time,
        duration_hours: formData.duration_hours,
        location: formData.location,
        booking_type: formData.booking_type,
        status: 'pending',
        total_price: formData.total_price,
        children_count: formData.children_count,
        notes: formData.notes,
      });

      if (bookingError) throw bookingError;

      setSuccess('تم إضافة الطلب بنجاح!');
      setFormData({
        date: '',
        start_time: '',
        duration_hours: 1,
        location: '',
        booking_type: 'home',
        total_price: 0,
        children_count: 1,
        notes: '',
      });
      setSelectedClientCode('');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">إضافة طلب جديد</h1>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اختر كود العميل *</label>
          {clientsLoading ? (
            <div className="text-gray-500">جاري تحميل العملاء...</div>
          ) : (
            <select
              value={selectedClientCode}
              onChange={(e) => setSelectedClientCode(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
            >
              <option value="">اختر كود العميل...</option>
              {clients.map(client => (
                <option key={client.id} value={client.client_unique_code}>
                  {client.client_unique_code} - {client.full_name || 'بدون اسم'}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedClientCode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التاريخ *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وقت البدء *</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مدة الساعات *</label>
              <input
                type="number"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عدد الأطفال *</label>
              <input
                type="number"
                name="children_count"
                value={formData.children_count}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الحجز *</label>
              <select
                name="booking_type"
                value={formData.booking_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              >
                <option value="home">في المنزل</option>
                <option value="outside">خارج المنزل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">السعر الإجمالي *</label>
              <input
                type="number"
                name="total_price"
                value={formData.total_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الموقع *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ملاحظات</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              ></textarea>
            </div>
          </div>
        )}

        {selectedClientCode && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#FB5E7A] text-white rounded-lg font-semibold hover:bg-[#e5536e] disabled:opacity-50 transition-colors"
            >
              {loading ? 'جاري إضافة الطلب...' : 'إضافة الطلب'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminAddOrder;
