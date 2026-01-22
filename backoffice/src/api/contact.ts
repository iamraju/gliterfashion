import api from './client';

export const contactApi = {
  getAll: async () => {
    const response = await api.get('/contact');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },
};
