import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import toast from 'react-hot-toast';

interface Campaign {
  id_campagne: number;
  nom_campagne: string;
}

interface MailingListFormData {
  nom_liste: string;
  description?: string;
  id_campagne: number;
}

const NewMailingListPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<MailingListFormData>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mailingListService = new ApiService('mailing-lists');
  const campaignService = new ApiService<Campaign>('campaigns');

  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery('campaigns', () => campaignService.getAll());

  const mutation = useMutation((newList: MailingListFormData) => mailingListService.create(newList), {
    onSuccess: () => {
      toast.success('Liste de diffusion créée avec succès!');
      queryClient.invalidateQueries('mailingLists');
      navigate('/mailing-lists');
    },
    onError: () => {
      toast.error('Erreur lors de la création de la liste de diffusion.');
    },
  });

  const onSubmit = (data: MailingListFormData) => {
    mutation.mutate({
      ...data,
      id_campagne: Number(data.id_campagne),
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Créer une Nouvelle Liste de Diffusion</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow dark:bg-gray-800">
        <div>
          <label htmlFor="nom_liste" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la Liste</label>
          <input
            id="nom_liste"
            type="text"
            {...register('nom_liste', { required: 'Le nom de la liste est requis' })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.nom_liste && <p className="mt-2 text-sm text-red-600">{errors.nom_liste.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="id_campagne" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campagne Associée</label>
          <select
            id="id_campagne"
            {...register('id_campagne', { required: 'La campagne est requise' })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            disabled={isLoadingCampaigns}
          >
            <option value="">Sélectionnez une campagne</option>
            {campaigns?.map(campaign => (
              <option key={campaign.id_campagne} value={campaign.id_campagne}>
                {campaign.nom_campagne}
              </option>
            ))}
          </select>
          {errors.id_campagne && <p className="mt-2 text-sm text-red-600">{errors.id_campagne.message}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {mutation.isLoading ? 'Création...' : 'Créer la Liste'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMailingListPage;
