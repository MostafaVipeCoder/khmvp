import React from 'react'
import { Users, Clock, TrendingUp, Shield } from 'lucide-react'

interface Stats {
  clientsCount: number
  sittersCount: number
  activeSittersCount: number
  totalHoursSold: number
}

const AdminDashboardStats: React.FC<{ stats: Stats }> = ({ stats }) => {
  const statCards = [
    { 
      label: 'عدد العملاء', 
      value: stats.clientsCount, 
      icon: Users, 
      color: 'text-[#FB5E7A]', 
      bg: 'bg-[#FB5E7A]/10'
    },
    { 
      label: 'عدد الخالات', 
      value: stats.sittersCount, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100'
    },
    { 
      label: 'الخالات الموثقة', 
      value: stats.activeSittersCount, 
      icon: Shield, 
      color: 'text-green-600', 
      bg: 'bg-green-100'
    },
    { 
      label: 'إجمالي الساعات', 
      value: stats.totalHoursSold, 
      icon: Clock, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex items-center gap-6">
              <div className={`p-5 rounded-2xl ${card.bg}`}>
                <Icon className={`w-8 h-8 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{card.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AdminDashboardStats
