import React, { useState } from 'react';
import { Campaign } from '../../services/campaignApi';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDeleteCampaign } from '../../hooks/useCampaigns';
import toast from 'react-hot-toast';

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
  onEdit?: (campaign: Campaign) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onEdit }) => {
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const deleteCampaignMutation = useDeleteCampaign();

  const handleDelete = async (campaignId: number) => {
    try {
      await deleteCampaignMutation.mutateAsync(campaignId);
      toast.success('Campaign deleted successfully!');
      setConfirmDelete(null);
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    if (onEdit) {
      onEdit(campaign);
    } else {
      // Default edit behavior - you can customize this
      toast.success('Edit functionality - please implement in parent component');
    }
    setDropdownOpen(null);
  };

  const toggleDropdown = (campaignId: number) => {
    setDropdownOpen(dropdownOpen === campaignId ? null : campaignId);
  };

  return (
    <>
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
                    <div className="relative">
                      <button 
                        onClick={() => toggleDropdown(campaign.id_campagne)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {dropdownOpen === campaign.id_campagne && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                          <div className="py-1">
                            <button
                              onClick={() => handleEdit(campaign)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit2 size={16} className="mr-2" />
                              Edit Campaign
                            </button>
                            <button
                              onClick={() => setConfirmDelete(campaign.id_campagne)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete Campaign
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Delete Campaign
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this campaign? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleteCampaignMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md disabled:cursor-not-allowed"
                >
                  {deleteCampaignMutation.isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </>
  );
};

export default CampaignList;
