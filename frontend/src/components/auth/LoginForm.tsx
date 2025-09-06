import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { LogIn } from 'lucide-react';

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading } = useAuth();

  const onSubmit = (data: any) => {
    // The backend expects 'identifiant' and 'password'
    const credentials = {
      identifiant: data.username,
      password: data.password,
    };
    login(credentials);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Sign in to your account
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register('username', { required: 'Username is required' })}
            className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="your-username"
          />
          {errors.username && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.username.message as string}</p>}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.password.message as string}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {isLoading ? (
            'Signing in...'
          ) : (
            <span className="flex items-center justify-center">
              <LogIn className="w-5 h-5 mr-2" />
              Sign in
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
