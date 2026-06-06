import axios from 'axios';

// Create axios instance for Backoffice
const ADMIN_API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '') + '/backoffice';

export const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token from localStorage
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// API methods for Banners
export const bannersApi = {
  getAll: async () => {
    // Note: Backoffice uses different endpoint structure usually, but here we can reuse findAll if public
    // effectively backoffice might have its own list endpoint if we want draft items etc.
    // Our route for backoffice GET /:id is specific. 
    // Wait, in my routes:
    // router.get('/', bannersController.getAllBanners); (Public)
    // router.get('/:id', ... getBanner) (Protected)
    // So for listing, we can use the public one OR add a specific backoffice list route.
    // Let's use the public one from storeApi for listing if needed, OR call the same endpoint via adminApi if the controller permits.
    // controller.getAllBanners is not protected in routes.ts.
    // So adminApi.get('/banners') works and points to the same controller method.
    const response = await adminApi.get('/banners'); 
    // Wait, my routes:
    // app.use('/api/backoffice/banners', bannersRoutes);
    // bannersRoutes has router.get('/', bannersController.getAllBanners);
    // So calling /api/backoffice/banners will hit getAllBanners.
    return response.data;
  },

  getById: async (id: string) => {
    const response = await adminApi.get(`/banners/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/banners', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.patch(`/banners/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await adminApi.delete(`/banners/${id}`);
    return response.data;
  },
  
  // Helper for image upload if needed, usually handled by a separate upload endpoint
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    // Assuming generic upload route exists at /api/backoffice/upload
    const response = await adminApi.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data; // { url: ... }
  }
};
