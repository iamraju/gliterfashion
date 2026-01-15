
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
  role: string;
  addresses?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
  initProfile: () => Promise<void>;
}

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/store') + '/auth';
const USER_API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/store') + '/users';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (data) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_URL}/login`, data);
          const { token, user } = response.data;
          set({ token, user, isAuthenticated: true });
          localStorage.setItem('token', token);
          // Fetch full profile to get addresses
          const profileResponse = await axios.get(`${USER_API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: profileResponse.data, loading: false });
          toast.success(`Welcome back, ${user.firstName}!`);
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          throw error;
        }
      },

      register: async (data) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_URL}/register`, { ...data, role: 'CUSTOMER' });
          const { token, user } = response.data;
          
          set({ token, user, isAuthenticated: true });
          localStorage.setItem('token', token);
          
          // Fetch full profile (though for new user addresses will be empty)
          const profileResponse = await axios.get(`${USER_API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: profileResponse.data, loading: false });
          toast.success(`Welcome to Glitter, ${user.firstName}!`);
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
      },

      initAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          const authState = (useAuthStore.getState() as any);
          set({ token, isAuthenticated: true });
          authState.initProfile();
        }
      },

      initProfile: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await axios.get(`${USER_API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: response.data });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          // If token is invalid, logout (optional but good practice)
          // set({ user: null, token: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
