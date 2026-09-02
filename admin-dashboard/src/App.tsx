import { useState, useEffect } from 'react'
import AdminSidebar from './components/AdminSidebar'
import AdminDashboardStats from './components/AdminDashboardStats'
import AdminFinanceCharts from './components/AdminFinanceCharts'
import AdminSitterManagement from './components/AdminSitterManagement'
import AdminClientVerification from './components/AdminClientVerification'
import AdminActiveOrdersView from './components/AdminActiveOrdersView'
import AdminInterviewsView from './components/AdminInterviewsView'
import AdminLogin from './components/AdminLogin'
import WithdrawalManagement from './components/WithdrawalManagement'
import AdminPermissionsSettings from './components/AdminPermissionsSettings'
import AdminAddClient from './components/AdminAddClient'
import AdminAddOrder from './components/AdminAddOrder'
import { supabase } from './lib/supabase'

interface AppProfile {
  id: string
  full_name?: string
  location?: string
  average_rating?: number
  is_verified?: boolean
  role?: string
}

interface AppVerificationRequest {
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

interface AdminPermission {
  id: string
  role: string
  allowed_tabs: string[]
}

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sitters, setSitters] = useState<AppProfile[]>([])
  const [clients, setClients] = useState<AppProfile[]>([])
  const [verificationRequests, setVerificationRequests] = useState<AppVerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [allowedTabs, setAllowedTabs] = useState<string[]>([])
  const [permissions, setPermissions] = useState<AdminPermission[]>([])

  useEffect(() => {
    checkAuth()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        checkIsAdmin(session.user.id)
      } else {
        setIsAuthenticated(false)
        setAuthLoading(false)
        setUserRole(null)
        setAllowedTabs([])
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
      console.log('Checking admin for user id:', userId);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      console.log('Profile fetch result:', { profile, profileError });
      if (profileError) {
        console.error('Profile fetch error details:', profileError);
      }
      
      const validAdminRoles = ['admin', 'super_admin', 'client_manager', 'sitter_manager']
      
      if (profile && validAdminRoles.includes(profile.role!)) {
        console.log('Valid admin role found:', profile.role);
        setUserRole(profile.role)
        setIsAuthenticated(true)
        await loadPermissionsAndData(profile.role)
      } else {
        console.log('Not an admin, signing out');
        // Try to sign out but don't block UI if it fails
        supabase.auth.signOut().catch((err) => console.error("Logout error:", err))
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Check admin error:', error)
      // Try to sign out but don't block UI if it fails
      supabase.auth.signOut().catch((err) => console.error("Logout error:", err))
      setIsAuthenticated(false)
    }
  }

  const loadPermissionsAndData = async (role: string) => {
    try {
      const [permissionsResult, profilesResult, requestsResult] = await Promise.all([
        supabase.from('admin_permissions').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('verification_requests').select('*').order('created_at', { ascending: false })
      ])
      
      if (permissionsResult.error) console.error('Error loading permissions:', permissionsResult.error)
      if (profilesResult.error) console.error('Error loading profiles:', profilesResult.error)
      if (requestsResult.error) console.error('Error loading requests:', requestsResult.error)
      
      const allPermissions: AdminPermission[] = permissionsResult.data || []
      setPermissions(allPermissions)
      
      const userPermission = allPermissions.find(p => p.role === role)
      const tabs = userPermission?.allowed_tabs || ['dashboard']
      setAllowedTabs(tabs)
      
      if (!tabs.includes(activeTab)) {
        setActiveTab(tabs[0])
      }
      
      const allProfiles: AppProfile[] = profilesResult.data || []
      setSitters(allProfiles.filter((p: AppProfile) => p.role === 'khala'))
      setClients(allProfiles.filter((p: AppProfile) => p.role === 'client'))
      
      const requestsWithUsers = (requestsResult.data || []).map((req: any) => {
        const userId = req.user_id || req.sitter_id
        const user = allProfiles.find((p: AppProfile) => p.id === userId)
        return { ...req, user }
      })
      
      setVerificationRequests(requestsWithUsers as AppVerificationRequest[])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    if (!userRole) return
    await loadPermissionsAndData(userRole)
  }

  const handleLogout = () => {
    // Update state first for immediate UI feedback
    setIsAuthenticated(false)
    setUserRole(null)
    setAllowedTabs([])
    
    // Then call signOut in background without blocking
    supabase.auth.signOut().catch((err) => {
      console.error("Logout error:", err)
    })
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
        allowedTabs={allowedTabs}
      />
      
      <main className="mr-24 p-8 md:p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {activeTab === 'dashboard' && allowedTabs.includes('dashboard') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الإحصائيات الرئيسية</h1>
              <AdminDashboardStats stats={stats} />
              <AdminFinanceCharts />
            </div>
          )}

          {activeTab === 'sitters' && allowedTabs.includes('sitters') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">إدارة الخالات</h1>
              <AdminSitterManagement 
                sitters={sitters} 
                verificationRequests={verificationRequests} 
                onRefresh={loadData} 
              />
            </div>
          )}

          {activeTab === 'clients' && allowedTabs.includes('clients') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">التحقق الأمني للعملاء</h1>
              <AdminClientVerification 
                clients={clients} 
                verificationRequests={verificationRequests} 
                onRefresh={loadData} 
              />
            </div>
          )}

          {activeTab === 'orders' && allowedTabs.includes('orders') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الطلبات النشطة</h1>
              <AdminActiveOrdersView />
            </div>
          )}

          {activeTab === 'interviews' && allowedTabs.includes('interviews') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">مقابلات التوظيف</h1>
              <AdminInterviewsView />
            </div>
          )}

          {activeTab === 'finance' && allowedTabs.includes('finance') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الحسابات المالية والتحليلات</h1>
              <AdminFinanceCharts />
            </div>
          )}

          {activeTab === 'withdrawals' && allowedTabs.includes('withdrawals') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">إدارة السحوبات</h1>
              <WithdrawalManagement />
            </div>
          )}

          {activeTab === 'add-client' && allowedTabs.includes('add-client') && (
            <AdminAddClient />
          )}

          {activeTab === 'add-order' && allowedTabs.includes('add-order') && (
            <AdminAddOrder />
          )}

          {activeTab === 'settings' && allowedTabs.includes('settings') && (
            <div className="space-y-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">الإعدادات</h1>
              {userRole === 'super_admin' ? (
                <AdminPermissionsSettings 
                  permissions={permissions}
                  onRefresh={loadData}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500 text-lg">لا توجد إعدادات متاحة لك حالياً.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
