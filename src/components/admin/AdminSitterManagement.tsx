import React, { useState } from 'react'
import { Eye, X, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Profile {
  id: string
  full_name?: string
  location?: string
  average_rating?: number
  is_verified?: boolean
  role?: string
}

interface VerificationRequest {
  id: string
  user_id?: string
  sitter_id?: string
  document_type: string
  document_url: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  reviewed_at?: string
}

interface AdminSitterManagementProps {
  sitters: Profile[]
  verificationRequests: VerificationRequest[]
  onRefresh: () => void
}

const AdminSitterManagement: React.FC<AdminSitterManagementProps> = ({ sitters, verificationRequests, onRefresh }) => {
  const [selectedSitter, setSelectedSitter] = useState<Profile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'verified' | 'pending'>('pending')

  const getDocumentTypeName = (type: string) => {
    const names: Record<string, string> = {
      'police_record': 'الفيش الجنائي',
      'national_id_front': 'الوجه الأمامي للبطاقة الشخصية',
      'national_id_back': 'الوجه الخلفي للبطاقة الشخصية',
    }
    return names[type] || type
  }

  const getSitterRequests = (sitterId: string) => {
    return verificationRequests.filter(req => 
      req.user_id === sitterId || req.sitter_id === sitterId
    )
  }

  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf')
  }

  const handleApprove = async (request: VerificationRequest) => {
    if (!selectedSitter) return
    const userId = request.user_id || request.sitter_id || selectedSitter.id
    setIsProcessing(true)
    try {
      console.log(`[Approval] Starting approval process for request ${request.id} (user: ${userId})`)
      
      // Update the verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (requestError) throw requestError
      console.log(`[Approval] Successfully updated request ${request.id} to approved`)

      // Re-fetch ALL user's verification requests from the database to ensure we have fresh data
      const orString = `user_id.eq.${userId},sitter_id.eq.${userId}`;
      const { data: freshRequests, error: fetchError } = await supabase
        .from('verification_requests')
        .select('*')
        .or(orString);
      
      if (fetchError) throw fetchError
      
      // Check if ALL user's documents are approved
      const allApproved = freshRequests.length > 0 && freshRequests.every(r => r.status === 'approved')
      console.log(`[Approval] User ${userId} has ${freshRequests.length} total requests, all approved: ${allApproved}`)
      
      if (allApproved) {
        // Update user's is_verified flag
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', userId)
        
        if (profileError) throw profileError
        console.log(`[Approval] Successfully updated user ${userId} profile to is_verified = true`)
      }

      // Send notification to user (non-blocking)
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'verification_approved',
          title: 'تمت الموافقة على طلبك',
          message: `تمت الموافقة على وثيقة ${getDocumentTypeName(request.document_type)}!`
        })
      } catch (notificationError) {
        console.warn('Notification failed to send, but approval was successful:', notificationError)
      }

      onRefresh()
    } catch (error) {
      console.error('[Approval] Error approving request:', error)
      alert(`حدث خطأ أثناء الموافقة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (request: VerificationRequest) => {
    if (!selectedSitter) return
    const userId = request.user_id || request.sitter_id || selectedSitter.id
    const reason = rejectionReasons[request.id] || ''
    if (!reason) return
    setIsProcessing(true)
    try {
      console.log(`[Rejection] Starting rejection process for request ${request.id} (user: ${userId})`)
      
      // Update the verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (requestError) throw requestError
      console.log(`[Rejection] Successfully updated request ${request.id} to rejected`)

      // Send notification to user (non-blocking)
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'verification_rejected',
          title: 'تم رفض طلبك',
          message: `تم رفض وثيقة ${getDocumentTypeName(request.document_type)}. السبب: ${reason}`
        })
      } catch (notificationError) {
        console.warn('Notification failed to send, but rejection was successful:', notificationError)
      }

      onRefresh()
      setRejectionReasons(prev => {
        const newReasons = {...prev}
        delete newReasons[request.id]
        return newReasons
      })
    } catch (error) {
      console.error('[Rejection] Error rejecting request:', error)
      alert(`حدث خطأ أثناء الرفض: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Get verification status for a sitter
  const getSitterVerificationStatus = (sitterId: string) => {
    const requests = getSitterRequests(sitterId)
    if (requests.length === 0) return 'لم يرفع مستندات'
    const allApproved = requests.every(r => r.status === 'approved')
    if (allApproved) return 'موثق'
    const anyPending = requests.some(r => r.status === 'pending')
    if (anyPending) return 'قيد المراجعة'
    return 'مرفوض'
  }

  const getStatusColor = (status: string) => {
    if (status === 'موثق') return 'bg-green-100 text-green-700'
    if (status === 'قيد المراجعة') return 'bg-yellow-100 text-yellow-700'
    if (status === 'مرفوض') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  // Organize sitters by verification status
  const verifiedSitters = sitters.filter(s => s.is_verified)
  const pendingSitters = sitters.filter(s => !s.is_verified)

  const displaySitters = activeTab === 'verified' ? verifiedSitters : pendingSitters

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-[#FB5E7A]/10 text-[#FB5E7A] border-b-2 border-[#FB5E7A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            الخالات بانتظار التأكيد ({pendingSitters.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'verified'
                ? 'bg-[#FB5E7A]/10 text-[#FB5E7A] border-b-2 border-[#FB5E7A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            الخالات الموثقة ({verifiedSitters.length})
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموقع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التقييم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عرض المستندات</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displaySitters.map((sitter) => {
                const status = getSitterVerificationStatus(sitter.id)
                return (
                  <tr key={sitter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{sitter.full_name || 'غير مشخص'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sitter.location || 'غير محدد'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {sitter.average_rating || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSitter(sitter)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="عرض المستندات"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for viewing sitter documents */}
      {selectedSitter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">مستندات {selectedSitter.full_name}</h2>
              <button
                onClick={() => {
                  setSelectedSitter(null)
                  setRejectionReasons({})
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {(() => {
                const sitterRequests = getSitterRequests(selectedSitter.id)
                if (sitterRequests.length === 0) {
                  return <div className="text-center py-8 text-gray-500">لا توجد مستندات لهذه الخالة</div>
                }
                return (
                  <div className="grid gap-4">
                    {sitterRequests.map(request => (
                      <div key={request.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{getDocumentTypeName(request.document_type)}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(request.created_at).toLocaleString('ar-EG')}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            request.status === 'approved' ? 'bg-green-100 text-green-700' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {request.status === 'approved' ? 'موافق عليه' :
                             request.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </span>
                        </div>
                        <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 mb-4">
                          {isPDF(request.document_url) ? (
                            <iframe
                              src={request.document_url}
                              title="وثيقة PDF"
                              className="w-full h-[600px]"
                            />
                          ) : (
                            <img
                              src={request.document_url}
                              alt="وثيقة"
                              className="w-full h-auto"
                            />
                          )}
                        </div>
                        {request.rejection_reason && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-red-700 mb-1">سبب الرفض</div>
                            <div className="text-gray-900 dark:text-white">{request.rejection_reason}</div>
                          </div>
                        )}
                        {request.status === 'pending' && (
                          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleApprove(request)}
                              disabled={isProcessing}
                              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Check className="w-5 h-5" />
                              موافق على الطلب
                            </button>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">سبب الرفض</label>
                              <textarea
                                value={rejectionReasons[request.id] || ''}
                                onChange={(e) => setRejectionReasons(prev => ({ ...prev, [request.id]: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                rows={3}
                                placeholder="أدخل سبب الرفض..."
                              />
                              <button
                                onClick={() => handleReject(request)}
                                disabled={isProcessing || !rejectionReasons[request.id]}
                                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <X className="w-5 h-5" />
                                رفض الطلب
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSitterManagement
