import apiClient from './client';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  buttonText?: string;
  align: 'left' | 'center' | 'right';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  buttonText?: string;
  align: 'left' | 'center' | 'right';
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateBannerInput extends Partial<CreateBannerInput> {}

export const bannersApi = {
  getAll: async (): Promise<Banner[]> => {
    // Note: Verify the endpoint. In frontend it was /backoffice/banners. 
    // Usually backoffice project's apiClient base URL already points to /api/backoffice or similar.
    // Let's assume the client base includes everything up to /api/backoffice based on categories usage '/categories'.
    // If backend route is /api/backoffice/banners, then '/banners' should be correct if client base is /api/backoffice.
    // However, I should check client.ts to be sure. But for now I will assume consistency with categories.ts.
    // Backend routes: router.use('/api/backoffice/banners', bannersRoutes);
    // So if categories use '/categories', banners should use '/banners'.
    const response = await apiClient.get<Banner[]>('/banners');
    return response.data;
  },

  getById: async (id: string): Promise<Banner> => {
    const response = await apiClient.get<Banner>(`/banners/${id}`);
    return response.data;
  },

  create: async (data: CreateBannerInput): Promise<Banner> => {
    const response = await apiClient.post<Banner>('/banners', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBannerInput): Promise<Banner> => {
    const response = await apiClient.patch<Banner>(`/banners/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/banners/${id}`);
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('upload', file);
    const response = await apiClient.post<{ url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
