import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../common/Button";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{ access_token: string; user: any }>(
        "/auth/login",
        {
          identifiant: data.username,
          password: data.password,
        }
      );
      await login(response.data.access_token, response.data.user);
      navigate("/dashboard"); // Navigate to dashboard
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Username
        </label>
        <div className="mt-1">
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register("username")}
            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
            <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
            Password
            </label>
            <div className="text-sm">
                <a
                href="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                Forgot password?
                </a>
            </div>
        </div>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            {...register("rememberMe")}
            type="checkbox"
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="remember-me"
            className="block ml-2 text-sm text-gray-900 dark:text-gray-300"
          >
            Remember me
          </label>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
