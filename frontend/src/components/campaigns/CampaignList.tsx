import React from 'react';
import { Campaign } from '../../services/campaignApi';
import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const CampaignStatusBadge: React.FC<{ status: Campaign['statut'] }> = ({ status }) => {
  const statusClasses = {
    draft: 'bg-gray-200 text-gray-800',
    active: 'bg-green-200 text-green-800',
    paused: 'bg-yellow-200 text-yellow-800',
    finished: 'bg-blue-200 text-blue-800',
    scheduled: 'bg-purple-200 text-purple-800',
    archived: 'bg-red-200 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-200'}`}>
      {status}
    </span>
  );
};

interface CampaignListProps {
  campaigns: Campaign[];
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns }) => {

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campaign Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {campaigns && campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <tr key={campaign.id_campagne} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  <Link to={`/campaigns/${campaign.id_campagne}`} className="hover:underline text-blue-600 dark:text-blue-400">
                    {campaign.nom_campagne}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <CampaignStatusBadge status={campaign.statut} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.type_campagne}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{format(new Date(campaign.date_debut), 'PPp')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{format(new Date(campaign.date_fin), 'PPp')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Actions dropdown will go here */}
                  <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                No campaigns found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignList;
