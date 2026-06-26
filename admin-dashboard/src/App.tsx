import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DashboardStats from './components/DashboardStats'
import FinanceCharts from './components/FinanceCharts'
import SitterManagement from './components/SitterManagement'
import ClientVerification from './components/ClientVerification'
import { supabase } from './lib/supabase'
import { Profile } from './types'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sitters, setSitters] = useState<Profile[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
      
      const allProfiles = profilesData || []
      setSitters(allProfiles.filter(p => p.role === 'khala'))
      setClients(allProfiles.filter(p => p.role === 'client'))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    clientsCount: clients.length,
    sittersCount: sitters.length,
    activeSittersCount: sitters.filter(s => s.is_active).length,
    totalHoursSold: 1247
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
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
            <SitterManagement sitters={sitters} />
          </div>
        )}

        {activeTab === 'clients' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">التحقق الأمني للعملاء</h1>
            <ClientVerification clients={clients} />
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
