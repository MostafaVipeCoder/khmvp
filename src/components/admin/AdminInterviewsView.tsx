import React, { useState, useEffect } from 'react'
import { User, Calendar, CheckCircle, XCircle, MessageSquare, MoreVertical, Clock } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface Interview {
  id: string
  name: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string
}

const AdminInterviewsView: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        // We'll implement real data fetching later
        setInterviews([])
      } catch (error) {
        console.error('Error fetching interviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدولة'
      case 'completed': return 'مكتملة'
      case 'cancelled': return 'ملغاة'
      default: return 'غير معروف'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مقابلات التوظيف</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {interviews.length} مقابلة
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">جاري تحميل البيانات...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">لا توجد مقابلات حتى الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {interviews.map((interview) => (
            <div key={interview.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FB5E7A]/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#FB5E7A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{interview.name}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusStyle(interview.status)}`}>
                      {getStatusText(interview.status)}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{interview.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{interview.time}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4 mt-1" />
                  <span>{interview.notes}</span>
                </div>
              </div>

              {interview.status === 'scheduled' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button className="flex-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    إكمال المقابلة
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm">
                    <XCircle className="w-4 h-4 inline mr-2" />
                    إلغاء المقابلة
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminInterviewsView
