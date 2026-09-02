import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface ClientProfile {
  id: string
  full_name: string | null
  client_unique_code: string | null
  phone: string | null
  location: string | null
  default_address: string | null
  mother_job: string | null
  father_job: string | null
  created_at: string
}

const AdminAddClient: React.FC = () => {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    mother_job: '',
    father_job: '',
    default_address: '',
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setClientsLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, client_unique_code, phone, location, default_address, mother_job, father_job, created_at')
        .eq('role', 'client')
        .order('created_at', { ascending: false })
      if (data) setClients(data)
    } catch (err) {
      console.error('Error loading clients:', err)
    } finally {
      setClientsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Generate a random UUID for id (since we don't have auth user)
      const newId = crypto.randomUUID()
      
      // Insert directly into profiles
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: newId,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          location: formData.location || null,
          mother_job: formData.mother_job || null,
          father_job: formData.father_job || null,
          default_address: formData.default_address || null,
          role: 'client',
          is_active: true,
          is_verified: true,
        })

      if (insertError) throw insertError

      // Get the inserted profile to show the unique code
      const { data: newClient } = await supabase
        .from('profiles')
        .select('client_unique_code')
        .eq('id', newId)
        .single()

      setSuccess(`تم إضافة العميل بنجاح! كود العميل الفريد: ${newClient?.client_unique_code}`)
      setFormData({
        full_name: '',
        phone: '',
        location: '',
        mother_job: '',
        father_job: '',
        default_address: '',
      })
      loadClients()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة العميل')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Add Client Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8">إضافة عميل جديد</h1>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم الكامل *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الموقع</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وظيفة الأم</label>
              <input
                type="text"
                name="mother_job"
                value={formData.mother_job}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وظيفة الأب</label>
              <input
                type="text"
                name="father_job"
                value={formData.father_job}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العنوان الافتراضي</label>
            <textarea
              name="default_address"
              value={formData.default_address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#FB5E7A] text-white rounded-lg font-semibold hover:bg-[#e5536e] disabled:opacity-50 transition-colors"
            >
              {loading ? 'جاري الإضافة...' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </div>

      {/* Clients List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">قائمة العملاء</h2>

        {clientsLoading ? (
          <div className="text-gray-500">جاري تحميل العملاء...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-gray-600 dark:text-gray-400">الاسم</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400">الكود الفريد</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400">رقم الهاتف</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400">الموقع</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 text-gray-900 dark:text-white">{client.full_name || 'بدون اسم'}</td>
                    <td className="py-3">
                      <span className="px-3 py-1 rounded-full text-sm bg-[#FB5E7A]/10 text-[#FB5E7A] font-mono">
                        {client.client_unique_code || '-'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{client.phone || '-'}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{client.location || '-'}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {new Date(client.created_at).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAddClient
