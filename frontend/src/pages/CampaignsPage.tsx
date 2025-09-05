import { useState } from 'react';
import { useCampaigns, useDeleteCampaign, useLaunchCampaign, usePauseCampaign } from '../hooks/useCampaigns';
import { Button } from '../components/common/Button';
import { PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Campaign {
    id: number;
    name: string;
    status: string;
    type: string;
    created_at: string;
}

const CampaignsPage = () => {
  const [filters, setFilters] = useState({});
  const { data: campaigns, isLoading } = useCampaigns(filters);
  const deleteCampaignMutation = useDeleteCampaign();
  const launchCampaignMutation = useLaunchCampaign();
  const pauseCampaignMutation = usePauseCampaign();

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const handleLaunch = (id: number) => {
    launchCampaignMutation.mutate(id);
  };

  const handlePause = (id: number) => {
    pauseCampaignMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button asChild>
          <Link to="/campaigns/new">
            <PlusCircle className="w-5 h-5 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      <div className="mb-4">
        {/* Filters and Search */}
        <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="pl-10 pr-4 py-2 border rounded-md"
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
            </div>
          {/* Add more filters here */}
        </div>
      </div>

import CampaignList from '../components/campaigns/CampaignList';

// ... (keep the rest of the component the same)

      {isLoading ? (
        <p>Loading campaigns...</p>
      ) : (
        <CampaignList
          campaigns={campaigns?.data || []}
          onLaunch={handleLaunch}
          onPause={handlePause}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CampaignsPage;
