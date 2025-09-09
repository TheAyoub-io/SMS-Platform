import React from 'react';
import { useTrends, useSegmentPerformance, useCampaignRoi } from '../../hooks/useAnalytics';
import { useDashboardStats } from '../../hooks/useReports';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, MessageSquare, DollarSign, Activity } from 'lucide-react';

const StatsCard: React.FC<{ title: string, value: number | string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const TrendCard: React.FC<{ title: string, value: number, period: string }> = ({ title, value, period }) => {
  const isPositive = value >= 0;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="flex items-center mt-1">
        <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {(value * 100).toFixed(1)}%
        </p>
        {isPositive ? <ArrowUpRight className="h-5 w-5 text-green-500 ml-2" /> : <ArrowDownRight className="h-5 w-5 text-red-500 ml-2" />}
      </div>
      <p className="text-xs text-gray-400 mt-1">{period}</p>
    </div>
  );
};

const AdvancedDashboard: React.FC = () => {
  const { data: trends, isLoading: isLoadingTrends } = useTrends();
  const { data: segmentPerf, isLoading: isLoadingSegments } = useSegmentPerformance();
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats();
  // Example for a single campaign's ROI
  const { data: roiData, isLoading: isLoadingRoi } = useCampaignRoi(1);

  const segmentData = segmentPerf ? Object.entries(segmentPerf).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h2>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingStats ? (
          <div className="col-span-4 text-center">Loading platform stats...</div>
        ) : dashboardStats ? (
          <>
            <StatsCard
              title="Total Campaigns"
              value={dashboardStats.total_campaigns}
              icon={<Activity className="h-6 w-6 text-white" />}
              color="bg-blue-500"
            />
            <StatsCard
              title="Total Contacts"
              value={dashboardStats.total_contacts.toLocaleString()}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-green-500"
            />
            <StatsCard
              title="Messages Sent"
              value={dashboardStats.total_sms_sent.toLocaleString()}
              icon={<MessageSquare className="h-6 w-6 text-white" />}
              color="bg-purple-500"
            />
            <StatsCard
              title="Delivery Rate"
              value={`${(dashboardStats.overall_delivery_rate * 100).toFixed(1)}%`}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              color="bg-orange-500"
            />
          </>
        ) : null}
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance Trends</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingTrends ? <p>Loading trends...</p> : (
          <>
            <TrendCard title="Engagement Change" value={trends?.week_over_week_change || 0} period="vs. last week" />
            <TrendCard title="Engagement Change" value={trends?.month_over_month_change || 0} period="vs. last month" />
          </>
        )}
        {isLoadingRoi ? <p>Loading ROI...</p> : (
           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
             <p className="text-sm text-gray-500">Campaign 1 ROI</p>
             <p className="text-2xl font-bold text-blue-500">{roiData?.roi_percent.toFixed(1)}%</p>
           </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Segment Performance</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-80">
          {isLoadingSegments ? <p>Loading segment data...</p> : (
            <ResponsiveContainer>
              <BarChart data={segmentData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
