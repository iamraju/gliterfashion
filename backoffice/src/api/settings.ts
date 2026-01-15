import apiClient from "./client";

export interface ShippingMethod {
  id: string;
  title: string;
  charge: number;
  imageUrl?: string | null;
  deliveryTimeDays: number;
  deliveryTimeHours?: number | null;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  title: string;
  charge: number;
  imageUrl?: string | null;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = {
  // Shipping Methods
  getShippingMethods: async (): Promise<ShippingMethod[]> => {
    const response = await apiClient.get<ShippingMethod[]>("/settings/shipping-methods");
    return response.data;
  },

  getShippingMethodById: async (id: string): Promise<ShippingMethod> => {
    const response = await apiClient.get<ShippingMethod>(`/settings/shipping-methods/${id}`);
    return response.data;
  },

  createShippingMethod: async (data: FormData): Promise<ShippingMethod> => {
    const response = await apiClient.post<ShippingMethod>("/settings/shipping-methods", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateShippingMethod: async (id: string, data: FormData): Promise<ShippingMethod> => {
    const response = await apiClient.patch<ShippingMethod>(`/settings/shipping-methods/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteShippingMethod: async (id: string): Promise<void> => {
    await apiClient.delete(`/settings/shipping-methods/${id}`);
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<PaymentMethod[]>("/settings/payment-methods");
    return response.data;
  },

  getPaymentMethodById: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.get<PaymentMethod>(`/settings/payment-methods/${id}`);
    return response.data;
  },

  createPaymentMethod: async (data: FormData): Promise<PaymentMethod> => {
    const response = await apiClient.post<PaymentMethod>("/settings/payment-methods", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updatePaymentMethod: async (id: string, data: FormData): Promise<PaymentMethod> => {
    const response = await apiClient.patch<PaymentMethod>(`/settings/payment-methods/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await apiClient.delete(`/settings/payment-methods/${id}`);
  },


  // Site Settings
  getSettings: async (): Promise<{ key: string; value: string; group: string; label?: string; type?: string; description?: string }[]> => {
    const response = await apiClient.get<{ key: string; value: string; group: string; label?: string; type?: string; description?: string }[]>("/settings");
    return response.data;
  },

  updateSettings: async (settings: { key: string; value: string; group?: string; label?: string; type?: string }[]): Promise<any> => {
    const response = await apiClient.put("/settings", settings);
    return response.data;
  },
};
