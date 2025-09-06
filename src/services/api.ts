import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // The address of our FastAPI backend
});

// Request interceptor to add the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors, e.g., 401 Unauthorized for token expiration
    if (error.response && error.response.status === 401) {
      // For example, redirect to login or refresh token
      localStorage.removeItem('authToken');
      // This line would cause a reload and redirect to the login page
      // window.location.href = '/login';
      console.error('Unauthorized! Redirecting to login...');
    }
    return Promise.reject(error);
  }
);

export default api;
