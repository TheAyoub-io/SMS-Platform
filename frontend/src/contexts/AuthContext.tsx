import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '../services/api';
import { AxiosError } from 'axios';

interface User {
  id_agent: number;
  nom_agent: string;
  identifiant: string;
  role: 'admin' | 'supervisor' | 'agent';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifiant: string, mot_de_passe: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isAgent: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data: userData } = await api.get<User>('/users/me');
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user', error);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (identifiant: string, mot_de_passe: string) => {
    try {
      const { access_token } = await api.post<{ access_token: string }>('/auth/login', {
        identifiant,
        password: mot_de_passe,
      });
      setToken(access_token);
      localStorage.setItem('token', access_token);
      const { data: userData } = await api.get<User>('/users/me');
      setUser(userData);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(axiosError.response.data.detail || 'Login failed');
      }
      throw new Error('An unknown error occurred');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const isAgent = user?.role === 'agent';

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, isAdmin, isSupervisor, isAgent }}
    >
      {children}
    </AuthContext.Provider>
  );
};
