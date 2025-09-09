import React, { useState, useEffect } from 'react';
import { Campaign } from '../../services/campaignApi';
import { useUpdateCampaign } from '../../hooks/useCampaigns';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditCampaignModal: React.FC<EditCampaignModalProps> = ({ campaign, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nom_campagne: '',
    type_campagne: 'promotional' as 'promotional' | 'informational' | 'follow_up',
    date_debut: '',
    date_fin: ''
  });

  const updateCampaignMutation = useUpdateCampaign();

  useEffect(() => {
    if (campaign && isOpen) {
      setFormData({
        nom_campagne: campaign.nom_campagne,
        type_campagne: campaign.type_campagne,
        date_debut: new Date(campaign.date_debut).toISOString().slice(0, 16),
        date_fin: new Date(campaign.date_fin).toISOString().slice(0, 16)
      });
    }
  }, [campaign, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    const updatePayload = {
      nom_campagne: formData.nom_campagne,
      type_campagne: formData.type_campagne,
      date_debut: new Date(formData.date_debut).toISOString(),
      date_fin: new Date(formData.date_fin).toISOString()
    };

    updateCampaignMutation.mutate(
      { id: campaign.id_campagne, payload: updatePayload },
      {
        onSuccess: () => {
          toast.success('Campaign updated successfully!');
          onClose();
        },
        onError: () => {
          toast.error('Failed to update campaign');
        }
      }
    );
  };

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Edit Campaign
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={formData.nom_campagne}
              onChange={(e) => setFormData({ ...formData, nom_campagne: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign Type
            </label>
            <select
              value={formData.type_campagne}
              onChange={(e) => setFormData({ ...formData, type_campagne: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="promotional">Promotional</option>
              <option value="informational">Informational</option>
              <option value="follow_up">Follow Up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.date_debut}
              onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              value={formData.date_fin}
              onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCampaignMutation.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md disabled:cursor-not-allowed"
            >
              {updateCampaignMutation.isLoading ? 'Updating...' : 'Update Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignModal;
