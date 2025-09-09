import React from 'react';
import { usePreviewCampaign, useLaunchCampaign } from '../../hooks/useCampaigns';
import { Campaign } from '../../services/campaignApi';
import { Rocket, Eye, Loader2 } from 'lucide-react';

interface CampaignLauncherProps {
  campaign: Partial<Campaign>;
  onLaunch: () => void;
}

const CampaignLauncher: React.FC<CampaignLauncherProps> = ({ campaign, onLaunch }) => {
  console.log('CampaignLauncher received campaign:', campaign);
  
  if (!campaign.id_campagne) {
    console.error('Campaign ID is missing:', campaign);
    return <p className="text-red-500">Campaign ID is missing. Cannot proceed.</p>;
  }

  const { refetch: getPreview, data: previewData, isLoading: isPreviewing, isError: isPreviewError } = usePreviewCampaign(campaign.id_campagne);
  const launchMutation = useLaunchCampaign();

  const handleLaunch = () => {
    console.log('Attempting to launch campaign:', campaign.id_campagne);
    launchMutation.mutate(campaign.id_campagne!, {
      onSuccess: (data) => {
        console.log('Campaign launch successful:', data);
        onLaunch(); // This will close the wizard
      },
      onError: (error) => {
        console.error('Campaign launch failed:', error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-lg mb-2">Review Campaign Details</h4>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm">
          <p><strong>Name:</strong> {campaign.nom_campagne}</p>
          <p><strong>Type:</strong> {campaign.type_campagne}</p>
          <p><strong>Status:</strong> {campaign.statut}</p>
          {/* Add more details as needed */}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg mb-2">Preview</h4>
        <button
          onClick={() => getPreview()}
          disabled={isPreviewing}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          {isPreviewing ? <Loader2 className="animate-spin mr-2" /> : <Eye size={16} className="mr-2" />}
          Generate Preview
        </button>
        {isPreviewError && <p className="text-red-500 mt-2">Could not fetch preview.</p>}
        {previewData && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            <p className="text-xs text-gray-500">{previewData.preview_count} contacts will be messaged.</p>
            {previewData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <p className="font-semibold text-sm">{item.contact_name} ({item.phone_number})</p>
                <p className="text-xs italic">"{item.personalized_message}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-lg mb-2 text-red-600">Final Step</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Once you launch this campaign, it will be queued for sending and can no longer be edited.
        </p>
        <button
          onClick={handleLaunch}
          disabled={launchMutation.isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50"
        >
          {launchMutation.isLoading ? <Loader2 className="animate-spin mr-2" /> : <Rocket size={20} className="mr-2" />}
          Launch Campaign Now
        </button>
      </div>
    </div>
  );
};

export default CampaignLauncher;
