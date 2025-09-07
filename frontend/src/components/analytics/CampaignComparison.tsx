import React, { useState } from 'react';
import { useCampaigns } from '../../hooks/useCampaigns';

const CampaignComparison: React.FC = () => {
  const { data: campaigns, isLoading } = useCampaigns();
  const [campaignA, setCampaignA] = useState<number | null>(null);
  const [campaignB, setCampaignB] = useState<number | null>(null);

  const campaignAData = campaigns?.find(c => c.id_campagne === campaignA);
  const campaignBData = campaigns?.find(c => c.id_campagne === campaignB);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4">Campaign Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          className="w-full p-2 border rounded-md"
          onChange={(e) => setCampaignA(parseInt(e.target.value))}
          disabled={isLoading}
        >
          <option>Select Campaign A</option>
          {campaigns?.map(c => <option key={c.id_campagne} value={c.id_campagne}>{c.nom_campagne}</option>)}
        </select>
        <select
          className="w-full p-2 border rounded-md"
          onChange={(e) => setCampaignB(parseInt(e.target.value))}
          disabled={isLoading}
        >
          <option>Select Campaign B</option>
          {campaigns?.map(c => <option key={c.id_campagne} value={c.id_campagne}>{c.nom_campagne}</option>)}
        </select>
      </div>

      {campaignAData && campaignBData && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="font-bold">{campaignAData.nom_campagne}</div>
          <div className="font-bold">{campaignBData.nom_campagne}</div>

          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">Status: {campaignAData.statut}</div>
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">Status: {campaignBData.statut}</div>

          {/* Add more comparison metrics here */}
        </div>
      )}
    </div>
  );
};

export default CampaignComparison;
