import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '../../services/authService';
import { UserCreatePayload } from '../../services/adminApi';

const userSchema = z.object({
  nom_agent: z.string().min(1, 'Name is required'),
  identifiant: z.string().min(1, 'Identifier is required'),
  role: z.enum(['admin', 'agent', 'supervisor']),
  is_active: z.boolean(),
  password: z.string().optional(),
});

export type UserFormInputs = z.infer<typeof userSchema>;

interface UserFormProps {
  onSubmit: SubmitHandler<UserFormInputs>;
  defaultValues?: Partial<User>;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, defaultValues, isSubmitting, isEditMode }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      ...defaultValues,
      is_active: defaultValues?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('nom_agent')} placeholder="Full Name" className="w-full p-2 border rounded" />
      {errors.nom_agent && <p className="text-red-500">{errors.nom_agent.message}</p>}

      <input {...register('identifiant')} placeholder="Identifier (username)" className="w-full p-2 border rounded" />
      {errors.identifiant && <p className="text-red-500">{errors.identifiant.message}</p>}

      <select {...register('role')} className="w-full p-2 border rounded">
        <option value="agent">Agent</option>
        <option value="supervisor">Supervisor</option>
        <option value="admin">Admin</option>
      </select>

      {!isEditMode && (
        <>
          <input type="password" {...register('password')} placeholder="Password" className="w-full p-2 border rounded" />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </>
      )}

      <div className="flex items-center">
        <input type="checkbox" {...register('is_active')} id="is_active" />
        <label htmlFor="is_active" className="ml-2">Active</label>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
