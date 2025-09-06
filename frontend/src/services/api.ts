import axios, { AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export class ApiService<T> {
  constructor(private resource: string) {}

  public async getAll(config?: AxiosRequestConfig): Promise<T[]> {
    return api.get(`/${this.resource}`, config);
  }

  public async getOne(id: number | string, config?: AxiosRequestConfig): Promise<T> {
    return api.get(`/${this.resource}/${id}`, config);
  }

  public async create(data: Partial<T>, config?: AxiosRequestConfig): Promise<T> {
    return api.post(`/${this.resource}`, data, config);
  }

  public async update(id: number | string, data: Partial<T>, config?: AxiosRequestConfig): Promise<T> {
    return api.put(`/${this.resource}/${id}`, data, config);
  }

  public async delete(id: number | string, config?: AxiosRequestConfig): Promise<void> {
    return api.delete(`/${this.resource}/${id}`, config);
  }
}

export default api;
