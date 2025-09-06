import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder for stats cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Campaigns</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">12</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Messages Sent</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">1,234</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Delivery Rate</h2>
          <p className="text-3xl font-bold text-green-500 mt-2">98.5%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Cost</h2>
          <p className="text-3xl font-bold text-red-500 mt-2">$92.55</p>
        </div>
      </div>
      {/* Placeholder for a chart */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Campaign Performance Over Time</h2>
        <div className="h-64 mt-4 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-500">Chart will be here</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
