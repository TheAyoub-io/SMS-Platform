import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Campaign {
  id_campagne: number;
  nom_campagne: string;
  // Add other campaign properties as needed
}

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/api/v1/campaigns/');
        setCampaigns(response.data);
      } catch (err) {
        setError('Failed to fetch campaigns.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id_campagne} className="mb-2 p-2 border rounded">
            {campaign.nom_campagne}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignsPage;
