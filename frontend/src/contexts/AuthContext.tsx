import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { setToken, getToken, removeToken, apiService } from "../services/api";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "agent";
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data: user } = await apiService.get<User>("/auth/me");
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setToken(token); // Set token in api headers
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = async (token: string) => {
    setIsLoading(true);
    setToken(token);
    await fetchUser();
    toast.success("Logged in successfully");
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
