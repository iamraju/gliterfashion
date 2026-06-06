import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserData: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronously initialize state from localStorage if available (Hydration)
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('auth_user');
        return null;
      }
    }
    return null;
  });
  
  // If we have a user in localStorage, we can start with isLoading = false or true
  // Let's keep isLoading = true for initial background verification but use user for immediate UI
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      console.log('[AuthContext] Initializing auth. Token:', !!token, 'Saved User:', !!savedUser);
      
      if (token) {
        try {
          console.log('[AuthContext] Verifying session with backend...');
          const userData = await authApi.getProfile();
          console.log('[AuthContext] Session verified. User:', userData.email);
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch (error: any) {
          console.error('[AuthContext] Session verification failed:', error.response?.status, error.message);
          // Only clear if it's a 401 Unauthorized or 403 Forbidden
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('[AuthContext] Clearing invalid session');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setUser(null);
          } else {
            console.warn('[AuthContext] Background verification failed but keeping local session (likely network error)');
          }
        }
      } else {
        console.log('[AuthContext] No token found in localStorage');
        localStorage.removeItem('auth_user');
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: any) => {
    const response = await authApi.login(data);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authApi.register(data);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const updateUserData = (userData: User) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
