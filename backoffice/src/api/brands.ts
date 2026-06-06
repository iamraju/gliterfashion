import apiClient from './client';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  sellerId?: string | null;
  createdAt: string;
  _count?: {
    products: number;
  };
}

export const brandsApi = {
  getAll: async () => {
    const response = await apiClient.get<Brand[]>('/brands');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Brand>(`/brands/${id}`);
    return response.data;
  },

  create: async (data: Partial<Brand>) => {
    const response = await apiClient.post<Brand>('/brands', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Brand>) => {
    const response = await apiClient.patch<Brand>(`/brands/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/brands/${id}`);
  }
};
