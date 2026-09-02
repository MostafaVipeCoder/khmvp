import { useState, useEffect } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminDashboardStats from './AdminDashboardStats'
import AdminFinanceCharts from './AdminFinanceCharts'
import AdminSitterManagement from './AdminSitterManagement'
import AdminClientVerification from './AdminClientVerification'
import AdminActiveOrdersView from './AdminActiveOrdersView'
import AdminInterviewsView from './AdminInterviewsView'
import AdminLogin from './AdminLogin'
import WithdrawalManagement from './WithdrawalManagement'
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

const AdminApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sitters, setSitters] = useState<Profile[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkIsAdmin(session.user.id)
      } else {
        setIsAuthenticated(false)
        setAuthLoading(false)
      }
    })
    return () => authListener?.subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Auth error:', error)
        setIsAuthenticated(false)
        return
      }
      
      if (session) {
        await checkIsAdmin(session.user.id)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Check auth error:', error)
      setIsAuthenticated(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const checkIsAdmin = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profile?.role === 'admin') {
        setIsAuthenticated(true)
        loadData()
      } else {
        await supabase.auth.signOut()
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Check admin error:', error)
      await supabase.auth.signOut()
      setIsAuthenticated(false)
    }
  }

  const loadData = async () => {
    try {
      console.log('Starting to load data...')
      const [profilesResult, requestsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('verification_requests').select('*').order('created_at', { ascending: false })
      ])
      
      console.log('Profiles result:', profilesResult)
      console.log('Requests result:', requestsResult)
      
      if (profilesResult.error) {
        console.error('Error loading profiles:', profilesResult.error)
      }
      if (requestsResult.error) {
        console.error('Error loading requests:', requestsResult.error)
      }
      
      const allProfiles = profilesResult.data || []
      console.log('All profiles:', allProfiles)
      setSitters(allProfiles.filter(p => p.role === 'khala'))
      setClients(allProfiles.filter(p => p.role === 'client'))
      
      const requestsWithUsers = (requestsResult.data || []).map(req => {
        const userId = req.user_id || req.sitter_id
        const user = allProfiles.find(p => p.id === userId)
        console.log('Processing request:', req, 'userId:', userId, 'user:', user)
        return { ...req, user }
      })
      
      console.log('Requests with users:', requestsWithUsers)
      setVerificationRequests(requestsWithUsers as VerificationRequest[])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
  }

  const stats = {
    clientsCount: clients.length,
    sittersCount: sitters.length,
    activeSittersCount: sitters.filter(s => s.is_verified).length,
    totalHoursSold: 1247
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">جاري التحميل...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="mr-24 p-8 md:p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الإحصائيات الرئيسية</h1>
              <AdminDashboardStats stats={stats} />
              <AdminFinanceCharts />
            </div>
          )}

          {activeTab === 'sitters' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">إدارة الخالات</h1>
              <AdminSitterManagement 
                sitters={sitters} 
                verificationRequests={verificationRequests} 
                onRefresh={loadData} 
              />
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">التحقق الأمني للعملاء</h1>
              <AdminClientVerification 
                clients={clients} 
                verificationRequests={verificationRequests} 
                onRefresh={loadData} 
              />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الطلبات النشطة</h1>
              <AdminActiveOrdersView />
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">مقابلات التوظيف</h1>
              <AdminInterviewsView />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الحسابات المالية والتحليلات</h1>
              <AdminFinanceCharts />
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">إدارة السحوبات</h1>
              <WithdrawalManagement />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الإعدادات</h1>
              <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 text-lg">الإعدادات قيد التطوير...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminApp
