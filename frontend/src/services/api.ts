import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This will be proxied by Vite during development
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle global errors, like 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Here you could trigger a logout action
      // For now, we'll just log the error and reject the promise
      console.error('Unauthorized request. Logging out.');
      localStorage.removeItem('authToken');
      // window.location.href = '/login'; // This would force a redirect
    }
    return Promise.reject(error);
  }
);

export default api;
