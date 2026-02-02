import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.response?.data?.error;
    const isTokenError = 
      status === 401 || 
      (typeof errorMessage === 'string' && (
        errorMessage.toLowerCase().includes('invalid token') || 
        errorMessage.toLowerCase().includes('jwt expired') ||
        errorMessage.toLowerCase().includes('unauthorized')
      ));

    if (isTokenError) {
      // Don't redirect if we're already trying to login
      if (!error.config.url?.includes('/auth/login')) {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
