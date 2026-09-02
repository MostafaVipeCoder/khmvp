import React from 'react'

const AdminFinanceCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          لا توجد بيانات مالية حتى الآن
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          لا توجد بيانات طلبات حتى الآن
        </p>
      </div>
    </div>
  )
}

export default AdminFinanceCharts
