import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  FileText,
  MessageSquare,
  PlusCircle,
  Users,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  total_campaigns: number;
  total_contacts: number;
  total_sms_sent: number;
  total_cost: number;
  overall_delivery_rate: number;
  total_messages_delivered: number;
  total_messages_failed: number;
}

interface Campaign {
  id_campagne: number;
  nom_campagne: string;
  statut: string;
  date_debut: string;
  date_fin: string;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
    <div className="flex items-center">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{title}</dt>
          <dd className="text-3xl font-bold text-gray-900 dark:text-white">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats, error: errorStats } = useQuery<DashboardStats>(
    'dashboardStats',
    () => api.get('/reports/dashboard')
  );

  const { data: campaigns, isLoading: isLoadingCampaigns, error: errorCampaigns } = useQuery<Campaign[]>(
    'recentCampaigns',
    () => api.get('/campaigns?limit=5')
  );

  if (isLoadingStats || isLoadingCampaigns) {
    return <div>Chargement...</div>;
  }

  if (errorStats || errorCampaigns) {
    return <div>Erreur lors du chargement du tableau de bord.</div>;
  }

  const chartData = [
    { name: 'Livrés', value: stats?.total_messages_delivered || 0 },
    { name: 'Échoués', value: stats?.total_messages_failed || 0 },
  ];

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenue, {user?.nom_agent}!</h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Voici un résumé de votre plateforme SMS.</p>

      {(isAdmin || isSupervisor) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/campaigns/new" className="flex items-center justify-center p-6 bg-white rounded-lg shadow hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
              <PlusCircle className="w-8 h-8 text-blue-500" />
              <span className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Nouvelle Campagne</span>
            </Link>
            <Link to="/contacts/new" className="flex items-center justify-center p-6 bg-white rounded-lg shadow hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
              <PlusCircle className="w-8 h-8 text-green-500" />
              <span className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Nouveau Contact</span>
            </Link>
            <Link to="/mailing-lists/new" className="flex items-center justify-center p-6 bg-white rounded-lg shadow hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
              <PlusCircle className="w-8 h-8 text-purple-500" />
              <span className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Nouvelle Liste de Diffusion</span>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Campagnes Totales" value={stats?.total_campaigns || 0} icon={<FileText className="w-10 h-10 text-blue-500" />} />
          <StatCard title="Contacts Totals" value={stats?.total_contacts || 0} icon={<Users className="w-10 h-10 text-green-500" />} />
          <StatCard title="SMS Envoyés" value={stats?.total_sms_sent || 0} icon={<MessageSquare className="w-10 h-10 text-purple-500" />} />
          <StatCard title="Coût Total" value={`$${(stats?.total_cost || 0).toFixed(2)}`} icon={<DollarSign className="w-10 h-10 text-yellow-500" />} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Campagnes Récentes</h2>
          <div className="mt-4 overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {campaigns?.map(campaign => (
                <li key={campaign.id_campagne}>
                  <Link to={`/campaigns/${campaign.id_campagne}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center px-4 py-4 sm:px-6">
                      <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate dark:text-indigo-400">{campaign.nom_campagne}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            Statut: {campaign.statut}
                          </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-5">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Se termine le {new Date(campaign.date_fin).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-5">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Statut des Messages</h2>
          <div className="mt-4 p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
