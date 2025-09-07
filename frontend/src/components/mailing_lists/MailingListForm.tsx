import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const mailingListSchema = z.object({
  nom_liste: z.string().min(3, 'List name must be at least 3 characters'),
  description: z.string().optional(),
});

export type MailingListFormInputs = z.infer<typeof mailingListSchema>;

interface MailingListFormProps {
  onSubmit: SubmitHandler<MailingListFormInputs>;
  isSubmitting?: boolean;
}

const MailingListForm: React.FC<MailingListFormProps> = ({ onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MailingListFormInputs>({
    resolver: zodResolver(mailingListSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nom_liste" className="block text-sm font-medium text-gray-700 dark:text-gray-300">List Name</label>
        <input
          type="text"
          id="nom_liste"
          {...register('nom_liste')}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.nom_liste && <p className="mt-1 text-sm text-red-500">{errors.nom_liste.message}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end">
        <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create and Continue'}
        </button>
      </div>
    </form>
  );
};

export default MailingListForm;
