import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, CheckCircle } from 'lucide-react'

interface Order {
  id: string
  clientId: string
  sitterId: string
  date: string
  time: string
  status: 'active' | 'pending' | 'completed'
  clientName?: string
  sitterName?: string
}

const AdminActiveOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // We'll implement real data fetching later
        setOrders([])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'جارية الآن'
      case 'pending': return 'قيد الانتظار'
      case 'completed': return 'مكتملة'
      default: return 'غير معروف'
    }
  }

  const activeCount = orders.filter(o => o.status === 'active').length
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const completedCount = orders.filter(o => o.status === 'completed').length

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-green-600 mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">طلبات جارية</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-yellow-600 mb-4">
            <Clock className="w-10 h-10" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">طلبات قيد الانتظار</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-blue-600 mb-4">
            <Calendar className="w-10 h-10" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">طلبات مكتملة</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{completedCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">جاري تحميل البيانات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">لا توجد طلبات حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">رقم الطلب</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">العميل</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الخالة</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">التاريخ</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الوقت</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">#{order.id.slice(0, 8)}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FB5E7A]/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#FB5E7A]" />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{order.clientName || 'غير مشخص'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{order.sitterName || 'غير مشخص'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700 dark:text-gray-400">{order.date}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700 dark:text-gray-400">{order.time}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
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

export default AdminActiveOrdersView
