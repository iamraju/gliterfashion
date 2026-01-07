import apiClient from './client';
import type { User } from './users';
import type { Order } from './orders';

export interface Customer extends User {
  orders?: Order[];
}

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    // Customers are just users with role CUSTOMER
    const response = await apiClient.get<Customer[]>('/users', {
      params: { role: 'CUSTOMER' }
    });
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/users/${id}`);
    return response.data;
  },
};
