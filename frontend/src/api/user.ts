
import apiClient from './client';

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
  getAddresses: async () => {
    const response = await apiClient.get('/users/me/addresses');
    return response.data;
  },
  createAddress: async (data: any) => {
    const response = await apiClient.post('/users/me/addresses', data);
    return response.data;
  },
  updateAddress: async (id: string, data: any) => {
    const response = await apiClient.patch(`/users/me/addresses/${id}`, data);
    return response.data;
  },
  deleteAddress: async (id: string) => {
    const response = await apiClient.delete(`/users/me/addresses/${id}`);
    return response.data;
  },
  setDefaultAddress: async (id: string) => {
    const response = await apiClient.post(`/users/me/addresses/${id}/default`);
    return response.data;
  },
  getOrders: async () => {
    const response = await apiClient.get('/users/me/orders');
    return response.data;
  },
  getOrderDetails: async (id: string) => {
    const response = await apiClient.get(`/users/me/orders/${id}`);
    return response.data;
  },
  cancelOrder: async (id: string) => {
    const response = await apiClient.post(`/users/me/orders/${id}/cancel`);
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await apiClient.post('/users/me/change-password', data);
    return response.data;
  }
};
