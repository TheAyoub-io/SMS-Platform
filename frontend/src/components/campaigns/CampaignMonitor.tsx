import React from 'react';
import { useCampaignStatus, usePauseCampaign, useUpdateCampaign } from '../../hooks/useCampaigns';
import { Campaign } from '../../services/campaignApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pause, Play } from 'lucide-react';

interface CampaignMonitorProps {
  campaign: Campaign;
}

const CampaignMonitor: React.FC<CampaignMonitorProps> = ({ campaign }) => {
  const { data: status, isLoading, isError } = useCampaignStatus(campaign.id_campagne, {
    enabled: campaign.statut === 'active' || campaign.statut === 'paused',
  });

  const pauseMutation = usePauseCampaign();
  const updateMutation = useUpdateCampaign();

  const handlePause = () => {
    pauseMutation.mutate(campaign.id_campagne);
  };

  const handleResume = () => {
    const payload = { ...campaign, statut: 'active' as const };
    updateMutation.mutate({ id: campaign.id_campagne, payload });
  };

  if (isLoading && !status) return <p>Loading status...</p>;
  if (isError) return <p className="text-red-500">Could not load campaign status.</p>;
  if (!status) return <p>No status data available.</p>;

  const chartData = [
    { name: 'Pending', count: status.pending },
    { name: 'Sent', count: status.sent },
    { name: 'Delivered', count: status.delivered },
    { name: 'Failed', count: status.failed },
  ];

  const totalSent = status.sent + status.delivered + status.failed;
  const progressPercent = status.total_messages > 0 ? (totalSent / status.total_messages) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold mb-4">Campaign Monitor</h3>
        <div>
          {campaign.statut === 'active' && (
            <button onClick={handlePause} disabled={pauseMutation.isLoading} className="flex items-center px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200">
              <Pause size={16} className="mr-1" /> Pause
            </button>
          )}
          {campaign.statut === 'paused' && (
            <button onClick={handleResume} disabled={updateMutation.isLoading} className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">
              <Play size={16} className="mr-1" /> Resume
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-blue-700 dark:text-white">Progress</span>
          <span className="text-sm font-medium text-blue-700 dark:text-white">{totalSent} / {status.total_messages}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip contentStyle={{ background: '#333', border: 'none', borderRadius: '0.5rem' }} />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampaignMonitor;
