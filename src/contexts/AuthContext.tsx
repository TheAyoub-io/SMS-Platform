import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // You'll need to add this dependency: npm install jwt-decode
import api from '../services/api';

interface User {
  sub: string; // Subject (user identifier, e.g., username or email)
  role: 'admin' | 'supervisor' | 'agent';
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decodedUser: User = jwtDecode(token);
        // Check if the token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          // Token is expired
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    const decodedUser: User = jwtDecode(token);
    setUser(decodedUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
