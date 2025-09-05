import { Campaign } from '../../pages/CampaignsPage';
import { Button } from '../common/Button';

interface CampaignListProps {
  campaigns: Campaign[];
  onLaunch: (id: number) => void;
  onPause: (id: number) => void;
  onDelete: (id: number) => void;
}

const CampaignList = ({ campaigns, onLaunch, onPause, onDelete }: CampaignListProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td className="px-6 py-4 whitespace-nowrap">{campaign.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    campaign.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {campaign.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{campaign.type}</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(campaign.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => onLaunch(campaign.id)} size="sm" className="mr-2">Launch</Button>
                <Button onClick={() => onPause(campaign.id)} size="sm" variant="secondary" className="mr-2">Pause</Button>
                <Button onClick={() => onDelete(campaign.id)} size="sm" variant="destructive">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignList;
