import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api, { setAuthToken } from '../services/api';
import { jwtDecode } from 'jwt-decode';

// Define the shape of the user object
interface User {
  sub: string; // Subject, typically the user ID or username
  role: 'admin' | 'agent';
  // Add any other properties from your JWT payload
}

// Define the shape of the Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        // Optional: Check for token expiration here
        // if (decodedUser.exp * 1000 < Date.now()) { ... }

        setUser(decodedUser);
        setAuthToken(token); // Set token for api requests
      } catch (error) {
        console.error("Invalid token on initial load", error);
        setAuthToken(null); // Clear invalid token
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      const decodedUser: User = jwtDecode(token);
      setAuthToken(token);
      setUser(decodedUser);
    } catch (error) {
      console.error("Failed to decode token on login", error);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
