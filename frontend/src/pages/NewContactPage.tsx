import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import toast from 'react-hot-toast';

interface ContactFormData {
  nom: string;
  prenom: string;
  numero_telephone: string;
  email?: string;
  statut_opt_in: boolean;
  segment?: string;
  zone_geographique?: string;
  type_client?: string;
}

const NewContactPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    defaultValues: {
      statut_opt_in: true,
    },
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contactService = new ApiService('contacts');

  const mutation = useMutation((newContact: ContactFormData) => contactService.create(newContact), {
    onSuccess: () => {
      toast.success('Contact créé avec succès!');
      queryClient.invalidateQueries('contacts');
      navigate('/contacts');
    },
    onError: () => {
      toast.error('Erreur lors de la création du contact.');
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Créer un Nouveau Contact</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
            <input
              id="prenom"
              type="text"
              {...register('prenom', { required: 'Le prénom est requis' })}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.prenom && <p className="mt-2 text-sm text-red-600">{errors.prenom.message}</p>}
          </div>
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
            <input
              id="nom"
              type="text"
              {...register('nom', { required: 'Le nom est requis' })}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.nom && <p className="mt-2 text-sm text-red-600">{errors.nom.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="numero_telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de Téléphone</label>
          <input
            id="numero_telephone"
            type="text"
            {...register('numero_telephone', { required: 'Le numéro de téléphone est requis' })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.numero_telephone && <p className="mt-2 text-sm text-red-600">{errors.numero_telephone.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="segment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Segment</label>
            <input
              id="segment"
              type="text"
              {...register('segment')}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="zone_geographique" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zone Géographique</label>
            <input
              id="zone_geographique"
              type="text"
              {...register('zone_geographique')}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="type_client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Client</label>
            <input
              id="type_client"
              type="text"
              {...register('type_client')}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="statut_opt_in"
            type="checkbox"
            {...register('statut_opt_in')}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="statut_opt_in" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Opt-in pour les communications
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {mutation.isLoading ? 'Création...' : 'Créer le Contact'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewContactPage;
