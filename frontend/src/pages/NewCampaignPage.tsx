import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import toast from 'react-hot-toast';

interface CampaignFormData {
  nom_campagne: string;
  date_debut: string;
  date_fin: string;
  type_campagne: string;
}

const NewCampaignPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<CampaignFormData>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const campaignService = new ApiService('campaigns');

  const mutation = useMutation((newCampaign: CampaignFormData) => campaignService.create(newCampaign), {
    onSuccess: () => {
      toast.success('Campagne créée avec succès!');
      queryClient.invalidateQueries('campaigns');
      navigate('/campaigns');
    },
    onError: () => {
      toast.error('Erreur lors de la création de la campagne.');
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Créer une Nouvelle Campagne</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow dark:bg-gray-800">
        <div>
          <label htmlFor="nom_campagne" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la Campagne</label>
          <input
            id="nom_campagne"
            type="text"
            {...register('nom_campagne', { required: 'Le nom de la campagne est requis' })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          {errors.nom_campagne && <p className="mt-2 text-sm text-red-600">{errors.nom_campagne.message}</p>}
        </div>

        <div>
          <label htmlFor="type_campagne" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Campagne</label>
          <select
            id="type_campagne"
            {...register('type_campagne', { required: 'Le type de campagne est requis' })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="promotional">Promotionnelle</option>
            <option value="informational">Informationnelle</option>
            <option value="follow_up">Suivi</option>
          </select>
          {errors.type_campagne && <p className="mt-2 text-sm text-red-600">{errors.type_campagne.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de Début</label>
            <input
              id="date_debut"
              type="date"
              {...register('date_debut', { required: 'La date de début est requise' })}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            {errors.date_debut && <p className="mt-2 text-sm text-red-600">{errors.date_debut.message}</p>}
          </div>
          <div>
            <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de Fin</label>
            <input
              id="date_fin"
              type="date"
              {...register('date_fin', { required: 'La date de fin est requise' })}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            {errors.date_fin && <p className="mt-2 text-sm text-red-600">{errors.date_fin.message}</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {mutation.isLoading ? 'Création...' : 'Créer la Campagne'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCampaignPage;
