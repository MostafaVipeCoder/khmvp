import React from 'react'
import { Users, Baby, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change: string
  isPositive: boolean
  icon: React.ElementType
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </div>
)

interface DashboardStatsProps {
  stats: {
    clientsCount: number
    sittersCount: number
    activeSittersCount: number
    totalHoursSold: number
  }
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="عدد العملاء المسجلين"
        value={stats.clientsCount}
        change="+12% هذا الشهر"
        isPositive={true}
        icon={Users}
      />
      <StatCard
        title="عدد الخالات"
        value={stats.sittersCount}
        change="+8% هذا الشهر"
        isPositive={true}
        icon={Baby}
      />
      <StatCard
        title="الخالات النشطة"
        value={stats.activeSittersCount}
        change="+5% هذا الأسبوع"
        isPositive={true}
        icon={Users}
      />
      <StatCard
        title="إجمالي الساعات المباعة"
        value={stats.totalHoursSold}
        change="+15% هذا الشهر"
        isPositive={true}
        icon={Clock}
      />
    </div>
  )
}

export default DashboardStats
