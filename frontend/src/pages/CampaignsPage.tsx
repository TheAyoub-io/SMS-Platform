import React, { useState, useMemo } from 'react';
import CampaignList from '../components/campaigns/CampaignList';
import CampaignWizard from '../components/campaigns/CampaignWizard';
import EditCampaignModal from '../components/campaigns/EditCampaignModal';
import { useCampaigns } from '../hooks/useCampaigns';
import { Campaign } from '../services/campaignApi';
import { Plus, Search } from 'lucide-react';

const CampaignsPage: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const { data: campaigns, isLoading, isError } = useCampaigns();

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.nom_campagne.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? campaign.statut === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} className="mr-2" />
          Create Campaign
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="finished">Finished</option>
          <option value="paused">Paused</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {isLoading && <p>Loading campaigns...</p>}
      {isError && <p className="text-red-500">Error loading campaigns.</p>}
      {!isLoading && !isError && <CampaignList campaigns={filteredCampaigns} onEdit={handleEditCampaign} />}

      <CampaignWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      <EditCampaignModal
        campaign={editingCampaign}
        isOpen={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
      />
    </div>
  );
};

export default CampaignsPage;
