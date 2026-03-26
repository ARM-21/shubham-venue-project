import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      const savedUserStr = await SecureStore.getItemAsync('auth_user');
      
      if (savedToken && savedUserStr) {
        setToken(savedToken);
        try {
          const user = JSON.parse(savedUserStr);
          setUser(user);
        } catch (parseError) {
          console.warn('Failed to parse saved user');
          setToken(null);
        }
      }
    } catch (e) {
      console.warn('Failed to restore token (this is normal on first app load)');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

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
      });
      await SecureStore.setItemAsync('auth_user', String(userStr));
      
      setToken(token);
      setUser({
        id: userId,
        email: userData.email,
        username: userData.username,
      });
      
      console.log('Login successful, token set:', token.substring(0, 10) + '...');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
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
