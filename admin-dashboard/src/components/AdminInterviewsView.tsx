import React, { useState, useEffect } from 'react'
import { User, Calendar, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { SitterEvaluation, SitterDBProfile } from '../types'

const AdminInterviewsView: React.FC = () => {
  const [evaluations, setEvaluations] = useState<SitterEvaluation[]>([])
  const [sitters, setSitters] = useState<SitterDBProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvaluation, setEditingEvaluation] = useState<SitterEvaluation | null>(null)
  const [formData, setFormData] = useState<Partial<SitterEvaluation>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [evaluationsResult, sittersResult] = await Promise.all([
        supabase.from('sitter_evaluations').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'khala')
      ])
      
      if (evaluationsResult.error) throw evaluationsResult.error
      if (sittersResult.error) throw sittersResult.error
      
      setEvaluations(evaluationsResult.data || [])
      setSitters(sittersResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Calculate total score and percentage
      const scores = [
        formData.q1_score || 0,
        formData.q2_score || 0,
        formData.q3_score || 0,
        formData.q4_score || 0,
        formData.q5_score || 0,
        formData.q6_score || 0,
        formData.q7_score || 0,
        formData.q8_score || 0
      ]
      const totalScore = scores.reduce((a, b) => a + b, 0)
      const evaluationPercentage = (totalScore / 80) * 100 // Max 10 per question, 8 questions
      
      const evaluationData = {
        ...formData,
        total_score: totalScore,
        evaluation_percentage: evaluationPercentage,
        evaluated_by: user?.id
      }

      if (editingEvaluation) {
        const { error } = await supabase
          .from('sitter_evaluations')
          .update(evaluationData)
          .eq('id', editingEvaluation.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('sitter_evaluations')
          .insert([evaluationData])
        if (error) throw error
      }
      
      setShowForm(false)
      setEditingEvaluation(null)
      setFormData({})
      fetchData()
    } catch (error) {
      console.error('Error saving evaluation:', error)
    }
  }

  const handleEdit = (evaluation: SitterEvaluation) => {
    setEditingEvaluation(evaluation)
    setFormData(evaluation)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return
    try {
      const { error } = await supabase.from('sitter_evaluations').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting evaluation:', error)
    }
  }

  const getSitterName = (sitterId: string) => {
    return sitters.find(s => s.id === sitterId)?.full_name || 'غير معروف'
  }

  const getPercentageColor = (percentage: number = 0) => {
    if (percentage >= 60) return 'text-green-600 bg-green-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تقييمات الخالات</h2>
        <button
          onClick={() => { setEditingEvaluation(null); setFormData({}); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FB5E7A] text-white rounded-lg hover:bg-[#e04a66] transition-colors"
        >
          <Plus className="w-5 h-5" />
          تقييم جديد
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingEvaluation ? 'تعديل التقييم' : 'تقييم جديد'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الخالة</label>
                <select
                  value={formData.sitter_id || ''}
                  onChange={(e) => setFormData({ ...formData, sitter_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                  required
                >
                  <option value="">اختر الخالة</option>
                  {sitters.map(sitter => (
                    <option key={sitter.id} value={sitter.id}>{sitter.full_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تاريخ المقابلة</label>
                <input
                  type="datetime-local"
                  value={formData.interview_date ? new Date(formData.interview_date).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, interview_date: new Date(e.target.value).toISOString() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التزام بالمواعيد (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.punctuality_score || ''}
                  onChange={(e) => setFormData({ ...formData, punctuality_score: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المستوى التعليمي</label>
                <input
                  type="text"
                  value={formData.education_level || ''}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العمر</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم هاتف ثانوي</label>
                <input
                  type="text"
                  value={formData.secondary_phone || ''}
                  onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">منطقة الإقامة</label>
                <input
                  type="text"
                  value={formData.residence_area || ''}
                  onChange={(e) => setFormData({ ...formData, residence_area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">أقرب محطة مترو</label>
                <input
                  type="text"
                  value={formData.nearest_metro || ''}
                  onChange={(e) => setFormData({ ...formData, nearest_metro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الهاتف</label>
                <input
                  type="text"
                  value={formData.phone_type || ''}
                  onChange={(e) => setFormData({ ...formData, phone_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الحالة الاجتماعية</label>
                <input
                  type="text"
                  value={formData.marital_status || ''}
                  onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عدد الأطفال</label>
                <input
                  type="number"
                  value={formData.number_of_children || ''}
                  onChange={(e) => setFormData({ ...formData, number_of_children: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الحالة العمل الحالية</label>
                <input
                  type="text"
                  value={formData.current_employment_status || ''}
                  onChange={(e) => setFormData({ ...formData, current_employment_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ملاحظات العمل الإضافي</label>
              <textarea
                value={formData.additional_work_notes || ''}
                onChange={(e) => setFormData({ ...formData, additional_work_notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">أسئلة التقييم (0-10)</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
                    const key = `q${num}_score` as keyof SitterEvaluation;
                    const value = formData[key] as number | undefined;
                    return (
                      <div key={num}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">سؤال {num}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={value !== undefined ? value : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, [key]: val ? parseInt(val) : undefined });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">أسئلة مفتوحة</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">إجابة مفتوحة 1</label>
                  <textarea
                    value={formData.open_answer_1 || ''}
                    onChange={(e) => setFormData({ ...formData, open_answer_1: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">إجابة مفتوحة 2</label>
                  <textarea
                    value={formData.open_answer_2 || ''}
                    onChange={(e) => setFormData({ ...formData, open_answer_2: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">إجابة مفتوحة 3</label>
                  <textarea
                    value={formData.open_answer_3 || ''}
                    onChange={(e) => setFormData({ ...formData, open_answer_3: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.has_camera_issue || false}
                    onChange={(e) => setFormData({ ...formData, has_camera_issue: e.target.checked })}
                    className="rounded text-[#FB5E7A] focus:ring-[#FB5E7A]"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">هل توجد مشكلة بالكاميرا؟</span>
                </label>
                <input
                  type="text"
                  placeholder="ملاحظات الكاميرا"
                  value={formData.camera_issue_notes || ''}
                  onChange={(e) => setFormData({ ...formData, camera_issue_notes: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الدورات</label>
                  <textarea
                    value={formData.courses || ''}
                    onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الشهادات</label>
                  <textarea
                    value={formData.certificates || ''}
                    onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ملاحظات عامة</label>
                <textarea
                  value={formData.general_notes || ''}
                  onChange={(e) => setFormData({ ...formData, general_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ملخص التقييم</label>
                <textarea
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-[#FB5E7A] text-white rounded-lg hover:bg-[#e04a66] transition-colors"
              >
                <Save className="w-5 h-5" />
                {editingEvaluation ? 'حفظ التغييرات' : 'حفظ التقييم'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingEvaluation(null); setFormData({}) }}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">جاري تحميل البيانات...</p>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">لا توجد تقييمات حتى الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {evaluations.map((evaluation) => (
            <div key={evaluation.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FB5E7A]/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#FB5E7A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{getSitterName(evaluation.sitter_id)}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getPercentageColor(evaluation.evaluation_percentage)}`}>
                      {evaluation.evaluation_percentage?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(evaluation)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(evaluation.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {evaluation.interview_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(evaluation.interview_date).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
                {evaluation.total_score !== undefined && (
                  <div className="flex items-center gap-2">
                    <span>المجموع: {evaluation.total_score}/80</span>
                  </div>
                )}
                {evaluation.summary && (
                  <p className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">{evaluation.summary}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminInterviewsView
