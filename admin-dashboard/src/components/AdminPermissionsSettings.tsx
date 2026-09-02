import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface AdminPermission {
  id: string
  role: string
  allowed_tabs: string[]
}

interface AdminUser {
  id: string
  full_name?: string
  email?: string
  role?: string
}

interface AdminPermissionsSettingsProps {
  permissions: AdminPermission[]
  onRefresh: () => void
}

const allTabs = [
  { id: 'dashboard', label: 'الإحصائيات الرئيسية' },
  { id: 'orders', label: 'الطلبات النشطة' },
  { id: 'add-order', label: 'إضافة طلب' },
  { id: 'interviews', label: 'مقابلات التوظيف' },
  { id: 'sitters', label: 'إدارة الخالات' },
  { id: 'clients', label: 'التحقق الأمني للعملاء' },
  { id: 'add-client', label: 'إضافة عميل' },
  { id: 'finance', label: 'الحسابات المالية والتحليلات' },
  { id: 'withdrawals', label: 'إدارة السحوبات' },
  { id: 'settings', label: 'الإعدادات' },
]

const roleLabels: Record<string, string> = {
  super_admin: 'سوبر أدمن',
  client_manager: 'مدير العملاء',
  sitter_manager: 'مدير الخالات',
  admin: 'أدمن',
}

const allAdminRoles = ['super_admin', 'admin', 'client_manager', 'sitter_manager']

const AdminPermissionsSettings: React.FC<AdminPermissionsSettingsProps> = ({ permissions, onRefresh }) => {
  const [loading, setLoading] = useState(false)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [localPermissions, setLocalPermissions] = useState<AdminPermission[]>([])
  const [localUserRoles, setLocalUserRoles] = useState<Record<string, string>>({})

  useEffect(() => {
    loadAdminUsers()
    setLocalPermissions(permissions)
  }, [permissions])

  const loadAdminUsers = async () => {
    setUsersLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', allAdminRoles)

      if (data) {
        setAdminUsers(data)
        const roles: Record<string, string> = {}
        data.forEach(user => {
          roles[user.id] = user.role || ''
        })
        setLocalUserRoles(roles)
      }
    } catch (error) {
      console.error('Error loading admin users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleToggleTab = (role: string, tab: string) => {
    setLocalPermissions(prev => prev.map(p => {
      if (p.role !== role) return p
      const currentTabs = [...p.allowed_tabs]
      const newTabs = currentTabs.includes(tab)
        ? currentTabs.filter(t => t !== tab)
        : [...currentTabs, tab]
      return { ...p, allowed_tabs: newTabs }
    }))
  }

  const handleChangeUserRole = (userId: string, newRole: string) => {
    setLocalUserRoles(prev => ({ ...prev, [userId]: newRole }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save permissions
      for (const permission of localPermissions) {
        await supabase
          .from('admin_permissions')
          .update({ allowed_tabs: permission.allowed_tabs })
          .eq('role', permission.role)
      }

      // Save user roles
      for (const [userId, newRole] of Object.entries(localUserRoles)) {
        await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId)
      }

      onRefresh()
      loadAdminUsers()
    } catch (error) {
      console.error('Error saving changes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {localPermissions.map((permission) => (
        <div key={permission.id} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{roleLabels[permission.role]}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allTabs.map((tab) => (
              <label key={tab.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permission.allowed_tabs.includes(tab.id)}
                  onChange={() => handleToggleTab(permission.role, tab.id)}
                  disabled={loading}
                  className="w-5 h-5 text-[#FB5E7A] rounded border-gray-300 focus:ring-[#FB5E7A]"
                />
                <span className="text-gray-700 dark:text-gray-300">{tab.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">إدارة الحسابات</h2>
        {usersLoading ? (
          <div className="text-gray-500">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-gray-600 dark:text-gray-400">الاسم</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400">الدور الحالي</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400">تغيير الدور</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 text-gray-900 dark:text-white">{user.full_name || 'بدون اسم'}</td>
                    <td className="py-3">
                      <span className="px-3 py-1 rounded-full text-sm bg-[#FB5E7A]/10 text-[#FB5E7A]">
                        {roleLabels[localUserRoles[user.id] || user.role!] || user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={localUserRoles[user.id] || user.role}
                        onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FB5E7A] focus:border-transparent"
                      >
                        {allAdminRoles.map((role) => (
                          <option key={role} value={role}>{roleLabels[role]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-[#FB5E7A] text-white font-bold rounded-xl hover:bg-[#FB5E7A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  )
}

export default AdminPermissionsSettings