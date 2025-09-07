import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Contact } from '../../services/contactApi';

const contactSchema = z.object({
  prenom: z.string().min(1, 'First name is required'),
  nom: z.string().min(1, 'Last name is required'),
  numero_telephone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  segment: z.string().optional(),
  zone_geographique: z.string().optional(),
  statut_opt_in: z.boolean(),
});

export type ContactFormInputs = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmit: SubmitHandler<ContactFormInputs>;
  defaultValues?: Partial<Contact>;
  isSubmitting?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, defaultValues, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      ...defaultValues,
      statut_opt_in: defaultValues?.statut_opt_in ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input {...register('prenom')} placeholder="First Name" className="w-full p-2 border rounded" />
        <input {...register('nom')} placeholder="Last Name" className="w-full p-2 border rounded" />
      </div>
      {errors.prenom && <p className="text-red-500">{errors.prenom.message}</p>}
      {errors.nom && <p className="text-red-500">{errors.nom.message}</p>}

      <input {...register('numero_telephone')} placeholder="Phone Number" className="w-full p-2 border rounded" />
      {errors.numero_telephone && <p className="text-red-500">{errors.numero_telephone.message}</p>}

      <input {...register('email')} placeholder="Email Address" className="w-full p-2 border rounded" />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input {...register('segment')} placeholder="Segment" className="w-full p-2 border rounded" />
        <input {...register('zone_geographique')} placeholder="Zone" className="w-full p-2 border rounded" />
      </div>

      <div className="flex items-center">
        <input type="checkbox" {...register('statut_opt_in')} id="opt-in" className="h-4 w-4 rounded" />
        <label htmlFor="opt-in" className="ml-2">Opt-In for marketing</label>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
