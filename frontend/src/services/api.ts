import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Assuming the backend runs on port 8000
});

// Request interceptor to add the JWT token to the headers
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

// Response interceptor for handling token expiration or other global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Here you could handle 401 Unauthorized errors, e.g., by logging the user out
    if (error.response?.status === 401) {
      // For now, just log it. Later, we can redirect to login.
      console.error('Unauthorized request. User may need to log in again.');
      localStorage.removeItem('authToken');
      // window.location.href = '/login'; // This could be one way to handle it
    }
    return Promise.reject(error);
  }
);

export default api;
