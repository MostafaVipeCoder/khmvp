import React, { useState, useEffect } from 'react'
import { DollarSign, User, CheckCircle, XCircle, Calendar, MoreVertical } from 'lucide-react'

interface Withdrawal {
  id: string
  sitterName: string
  amount: number
  date: string
  status: 'pending' | 'approved' | 'rejected'
  notes: string
}

const WithdrawalManagement: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        // We'll implement real data fetching later
        setWithdrawals([])
      } catch (error) {
        console.error('Error fetching withdrawals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawals()
  }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة'
      case 'approved': return 'تم الموافقة'
      case 'rejected': return 'مرفوض'
      default: return 'غير معروف'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة السحوبات</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {withdrawals.length} طلب سحب
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">جاري تحميل البيانات...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">لا توجد طلبات سحب حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الكود</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الخالة</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">المبلغ</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">التاريخ</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">ملاحظات</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">#{withdrawal.id.slice(0, 8)}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FB5E7A]/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#FB5E7A]" />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{withdrawal.sitterName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                        <DollarSign className="w-4 h-4" />
                        {withdrawal.amount} جنيه
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {withdrawal.date}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(withdrawal.status)}`}>
                        {getStatusText(withdrawal.status)}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{withdrawal.notes}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      {withdrawal.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {withdrawal.status !== 'pending' && (
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      )}
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

export default WithdrawalManagement