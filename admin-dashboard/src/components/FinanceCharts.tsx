import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

const monthlyRevenueData = [
  { name: 'يناير', revenue: 4000, bookings: 240 },
  { name: 'فبراير', revenue: 3000, bookings: 139 },
  { name: 'مارس', revenue: 5000, bookings: 980 },
  { name: 'أبريل', revenue: 2780, bookings: 390 },
  { name: 'مايو', revenue: 1890, bookings: 480 },
  { name: 'يونيو', revenue: 2390, bookings: 380 },
]

const COLORS = ['#FB5E7A', '#FFD1DA', '#82ca9d', '#8884d8']

const FinanceCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">الإيرادات الشهرية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#FB5E7A" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">الحجوزات الشهرية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#FB5E7A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default FinanceCharts
