import React from 'react';
import { useTrends, useSegmentPerformance, useCampaignRoi } from '../../hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

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
  // Example for a single campaign's ROI
  const { data: roiData, isLoading: isLoadingRoi } = useCampaignRoi(1);

  const segmentData = segmentPerf ? Object.entries(segmentPerf).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Executive Summary</h2>
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
