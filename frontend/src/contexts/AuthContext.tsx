import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // We will need to install jwt-decode

// Define the shape of the user object and the context
interface User {
  sub: string; // Subject, e.g., user identifier
  role: string;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: any) => void;
  logout: () => void;
  isLoading: boolean;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
});

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check for a token in local storage on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        // Check if the token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error("Invalid token found in localStorage", error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const loginMutation = useMutation(
    (credentials: any) => api.post('/auth/login', credentials),
    {
      onSuccess: (response) => {
        const { access_token } = response.data;
        localStorage.setItem('authToken', access_token);
        const decodedUser: User = jwtDecode(access_token);
        setUser(decodedUser);
        toast.success('Logged in successfully!');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
        toast.error(errorMessage);
      },
    }
  );

  const login = (data: any) => {
    loginMutation.mutate(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully.');
    // No need to redirect here, the routing logic will handle it
  };

  const authContextValue = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    isLoading: loginMutation.isLoading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
