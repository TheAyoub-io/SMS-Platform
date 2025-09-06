import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const loginSchema = z.object({
  identifiant: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response: { access_token: string } = await api.post('/auth/login', {
        identifiant: data.identifiant,
        password: data.password,
      });

      if (response.access_token) {
        login(response.access_token);
        toast.success('Logged in successfully!');
        // In a real app, you would be redirected by a protected route component
        // For now, we can force a redirect to see the effect.
        window.location.href = '/';
      } else {
        throw new Error("No access token returned from API");
      }
    } catch (error) {
      toast.error('Failed to log in. Please check your credentials.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="p-8 bg-white dark:bg-gray-700 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
            <input
              {...register('identifiant')}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.identifiant && <p className="text-sm text-red-500 mt-1">{errors.identifiant.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Remember me</label>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
