import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management functions
export const setToken = (token: string) => {
  localStorage.setItem("access_token", token);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
  delete api.defaults.headers.common["Authorization"];
};

// Add a request interceptor to set the token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";
    toast.error(message);

    if (error.response?.status === 401) {
      // For example, redirect to login or refresh token
      removeToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Base API service with CRUD operations
export const apiService = {
  get: <T>(url: string, params?: object) => api.get<T>(url, { params }),
  post: <T>(url:string, data: object) => api.post<T>(url, data),
  put: <T>(url: string, data: object) => api.put<T>(url, data),
  patch: <T>(url: string, data: object) => api.patch<T>(url, data),
  delete: <T>(url: string) => api.delete<T>(url),
};

export default api;
