import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Campaign {
  id_campagne: number;
  nom_campagne: string;
  statut: string;
  date_debut: string;
  date_fin: string;
  type_campagne: string;
}

const CampaignsPage: React.FC = () => {
  const { isAdmin, isSupervisor } = useAuth();
  const campaignService = new ApiService<Campaign>('campaigns');
  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>(
    'campaigns',
    () => campaignService.getAll()
  );

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Une erreur est survenue lors de la récupération des campagnes.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campagnes</h1>
        {(isAdmin || isSupervisor) && (
          <Link
            to="/campaigns/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nouvelle Campagne
          </Link>
        )}
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nom</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Statut</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Date de Début</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Date de Fin</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Modifier</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {campaigns?.map((campaign) => (
              <tr key={campaign.id_campagne}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{campaign.nom_campagne}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.statut}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.type_campagne}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(campaign.date_debut).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(campaign.date_fin).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/campaigns/${campaign.id_campagne}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Voir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignsPage;
