import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import ErrorHandler, { ApiError } from '@/utils/errorHandler';

interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: ApiError }>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: ApiError | null;
  isLogoutLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      const savedUserStr = await SecureStore.getItemAsync('auth_user');
      
      if (savedToken && savedUserStr) {
        try {
          const user = JSON.parse(savedUserStr);
          setToken(savedToken);
          setUser(user);
        } catch (parseError) {
          console.warn('Failed to parse saved user:', parseError);
          // Clear invalid data
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('auth_user');
          setToken(null);
          setUser(null);
        }
      }
    } catch (e) {
      console.warn('Failed to restore token:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: ApiError }> => {
      try {
        setError(null);

        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

        const response = await ErrorHandler.retry(
          async () => {
            const res = await fetch(`${apiUrl}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
              const errorData = await res.json();
              const error = new Error(errorData.message || 'Login failed');
              (error as any).response = {
                status: res.status,
                data: errorData,
              };
              throw error;
            }

            return res;
          },
          3, // max attempts
          1000, // initial delay
          (attempt) => console.log(`Login attempt ${attempt}/3...`)
        );

        const data = await response.json();

        // Get user data and token from backend
        const userData = data.data || data;
        const token = userData.token;
        const userId = userData.id || userData._id;

        if (!token) {
          throw new Error('No token received from server');
        }

        if (!userId) {
          throw new Error('Invalid response from server');
        }

        // Store token and user info securely
        await SecureStore.setItemAsync('auth_token', String(token));
        const userStr = JSON.stringify({
          id: userId,
          email: userData.email,
          username: userData.username,
          role: userData.role,
        });
        await SecureStore.setItemAsync('auth_user', String(userStr));

        setToken(token);
        setUser({
          id: userId,
          email: userData.email,
          username: userData.username,
          role: userData.role,
        });

        console.debug('Login successful');
        return { success: true };
      } catch (error: any) {
        const apiError = ErrorHandler.parseError(error);
        ErrorHandler.logError('LOGIN', apiError);
        setError(apiError);
        return { success: false, error: apiError };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setIsLogoutLoading(true);
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      setToken(null);
      setUser(null);
      setError(null);
      console.debug('Logout successful');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLogoutLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    clearError,
    error,
    isLogoutLoading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
