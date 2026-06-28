import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DashboardStats from './components/DashboardStats'
import FinanceCharts from './components/FinanceCharts'
import SitterManagement from './components/SitterManagement'
import ClientVerification from './components/ClientVerification'
import Login from './components/Login'
import { supabase } from './lib/supabase'
import { Profile, VerificationRequest as VerificationRequestType } from './types'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sitters, setSitters] = useState<Profile[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequestType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // Check auth state on load
  useEffect(() => {
    checkAuth()
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Check if user is admin
        checkIsAdmin(session.user.id)
      } else {
        setIsAuthenticated(false)
        setAuthLoading(false)
      }
    })
    return () => authListener.subscription.unsubscribe()
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
        // Sign out if not admin
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
      
      // Manually join requests with profiles
      const requestsWithUsers = (requestsResult.data || []).map(req => {
        const userId = req.user_id || req.sitter_id
        const user = allProfiles.find(p => p.id === userId)
        console.log('Processing request:', req, 'userId:', userId, 'user:', user)
        return { ...req, user }
      })
      
      console.log('Requests with users:', requestsWithUsers)
      setVerificationRequests(requestsWithUsers)
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
    activeSittersCount: sitters.filter(s => s.is_active).length,
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
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="mr-64 p-8">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">الإحصائيات الرئيسية</h1>
            <DashboardStats stats={stats} />
            <FinanceCharts />
          </div>
        )}

        {activeTab === 'sitters' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">إدارة الخالات</h1>
            <SitterManagement sitters={sitters} verificationRequests={verificationRequests} onRefresh={loadData} />
          </div>
        )}

        {activeTab === 'clients' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">التحقق الأمني للعملاء</h1>
            <ClientVerification clients={clients} verificationRequests={verificationRequests} onRefresh={loadData} />
          </div>
        )}

        {activeTab === 'finance' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">الحسابات المالية والتحليلات</h1>
            <FinanceCharts />
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">الإعدادات</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500">الإعدادات قيد التطوير...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
