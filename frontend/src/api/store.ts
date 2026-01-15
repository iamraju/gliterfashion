import axios from 'axios';

// Get API URL from env, ensuring no trailing slash
const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// Create axios instance
const api = axios.create({
  baseURL: API_URL, // Path already includes /store from .env
  headers: {
    'Content-Type': 'application/json',
  },
});

export const storeApi = {
  getProducts: async (params?: any) => {
    const response = await api.get('/products', { params });
    // Handle both wrapped { data: [], pagination: {} } and direct array (if backend changes) behaviors
    // Our service returns { data: [], pagination: {} }
    return response.data;
  },
  
  getCategories: async (params?: any) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },
  
  getProduct: async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  getBrands: async () => {
    const response = await api.get('/brands');
    return response.data;
  },

  getCart: async (sessionId?: string) => {
    const response = await api.get('/cart', { params: { sessionId } });
    return response.data;
  },

  addCartItem: async (data: { variantId: string; quantity: number; sessionId?: string }) => {
    const response = await api.post('/cart/items', data);
    return response.data;
  },

  updateCartItem: async (id: string, quantity: number) => {
    const response = await api.patch(`/cart/items/${id}`, { quantity });
    return response.data;
  },

  removeCartItem: async (id: string) => {
    const response = await api.delete(`/cart/items/${id}`);
    return response.data;
  },
  
  getAttributes: async () => {
    const response = await api.get('/attributes');
    return response.data;
  },

  getCountries: async () => {
    const response = await api.get('/countries');
    return response.data;
  },

  applyCoupon: async (data: { code: string; sessionId?: string }) => {
    const response = await api.post('/cart/coupon', data);
    return response.data;
  },

  removeCoupon: async (sessionId?: string) => {
    const response = await api.delete('/cart/coupon', { data: { sessionId } });
    return response.data;
  }
};
