import React, { useState } from 'react'
import { Check, X, Eye, FileText, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { VerificationRequest } from '../types'

interface VerificationRequestsProps {
  requests: VerificationRequest[]
  onRefresh: () => void
}

const VerificationRequests: React.FC<VerificationRequestsProps> = ({ requests, onRefresh }) => {
  console.log('VerificationRequests received requests:', requests)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async (request: VerificationRequest) => {
    if (!request.user) return
    const userId = request.user_id || request.sitter_id || request.user.id
    setIsProcessing(true)
    try {
      // Update the verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (requestError) throw requestError

      // Check if all user's documents are approved
      let userRequests = []
      
      // Try query by user_id first
      const { data: requestsByUser } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        
      if (requestsByUser && requestsByUser.length > 0) {
        userRequests = requestsByUser
      } else {
        // Fallback to sitter_id
        const { data: requestsBySitter } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('sitter_id', userId)
        userRequests = requestsBySitter || []
      }

      if (userRequests.every(r => r.status === 'approved')) {
        // Update user's is_verified flag
        await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', userId)
      }

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'verification_approved',
        title: 'تمت الموافقة على طلبك',
        message: `تمت الموافقة على وثيقة ${getDocumentTypeName(request.document_type)}!`
      })

      onRefresh()
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error approving request:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (request: VerificationRequest) => {
    if (!request.user) return
    const userId = request.user_id || request.sitter_id || request.user.id
    setIsProcessing(true)
    try {
      // Update the verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (requestError) throw requestError

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'verification_rejected',
        title: 'تم رفض طلبك',
        message: `تم رفض وثيقة ${getDocumentTypeName(request.document_type)}. السبب: ${rejectionReason}`
      })

      onRefresh()
      setRejectionReason('')
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getDocumentTypeName = (type: string) => {
    const names: Record<string, string> = {
      'police_record': 'الفيش الجنائي',
      'national_id_front': 'الوجه الأمامي للبطاقة الشخصية',
      'national_id_back': 'الوجه الخلفي للبطاقة الشخصية',
    }
    return names[type] || type
  }

  const getRoleName = (role: string) => {
    return role === 'khala' ? 'خالة' : 'عميل'
  }

  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf')
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">طلبات جديدة ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد طلبات جديدة</div>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{request.user?.full_name}</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                        {getRoleName(request.user?.role || '')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{getDocumentTypeName(request.document_type)}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(request.created_at).toLocaleString('ar-EG')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    title="عرض الوثيقة"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleApprove(request)}
                    disabled={isProcessing}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg disabled:opacity-50"
                    title="موافق"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    title="رفض"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">الطلبات المعالجة ({processedRequests.length})</h2>
        {processedRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد طلبات معالجة</div>
        ) : (
          <div className="grid gap-4">
            {processedRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{request.user?.full_name}</span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                        {getRoleName(request.user?.role || '')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{getDocumentTypeName(request.document_type)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {request.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                  </span>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    title="عرض الوثيقة"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل الطلب</h2>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setRejectionReason('')
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedRequest.user?.full_name}</div>
                  <div className="text-sm text-gray-500">
                    {getRoleName(selectedRequest.user?.role || '')} • {selectedRequest.user?.phone}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نوع الوثيقة</label>
                  <div className="mt-1 text-gray-900 dark:text-white">{getDocumentTypeName(selectedRequest.document_type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      selectedRequest.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedRequest.status === 'pending' ? 'قيد المراجعة' :
                       selectedRequest.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                    </span>
                  </div>
                </div>
                {selectedRequest.rejection_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">سبب الرفض</label>
                    <div className="mt-1 text-gray-900 dark:text-white">{selectedRequest.rejection_reason}</div>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                {isPDF(selectedRequest.document_url) ? (
                  <iframe
                    src={selectedRequest.document_url}
                    title="وثيقة PDF"
                    className="w-full h-[600px]"
                  />
                ) : (
                  <img
                    src={selectedRequest.document_url}
                    alt="وثيقة"
                    className="w-full h-auto"
                  />
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={isProcessing}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    موافق على الطلب
                  </button>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">سبب الرفض</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="أدخل سبب الرفض..."
                    />
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      disabled={isProcessing || !rejectionReason}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      رفض الطلب
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerificationRequests
