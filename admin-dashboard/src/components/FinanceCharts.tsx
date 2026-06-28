import React from 'react'

const FinanceCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">الإيرادات الشهرية</h3>
        <div className="text-center py-12 text-gray-500">لا توجد بيانات متاحة</div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">الحجوزات الشهرية</h3>
        <div className="text-center py-12 text-gray-500">لا توجد بيانات متاحة</div>
      </div>
    </div>
  )
}

export default FinanceCharts
