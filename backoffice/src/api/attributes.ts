import apiClient from './client';

export interface AttributeValue {
  id: string;
  value: string;
  attributeId: string;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  values: AttributeValue[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    values: number;
  };
}

export interface CreateAttributeInput {
  name: string;
  slug: string;
  values: string[]; // List of value strings
}

export interface UpdateAttributeInput {
  name?: string;
  slug?: string;
  values?: string[]; // List of value strings to sync (replace existing)
}

export const attributesApi = {
  getAll: async (): Promise<Attribute[]> => {
    const response = await apiClient.get<Attribute[]>('/attributes');
    return response.data;
  },

  getById: async (id: string): Promise<Attribute> => {
    const response = await apiClient.get<Attribute>(`/attributes/${id}`);
    return response.data;
  },

  create: async (data: CreateAttributeInput): Promise<Attribute> => {
    const response = await apiClient.post<Attribute>('/attributes', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAttributeInput): Promise<Attribute> => {
    const response = await apiClient.patch<Attribute>(`/attributes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attributes/${id}`);
  },
};
