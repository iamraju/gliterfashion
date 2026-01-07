import apiClient from "./client";
import type { Category } from "./categories";

export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  attributeValueId?: string | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  price: number;
  barcode?: string | null;
  compareAtPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold?: number | null;
  isActive: boolean;
  attributes: {
    attributeId: string;
    attributeValueId: string;
    attribute?: { name: string };
    attributeValue?: { value: string };
  }[];
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  salePrice?: number | null;
  sku: string;
  status: ProductStatus;
  weight?: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductVariantInput {
  sku: string;
  price: number;
  stockQuantity: number;
  attributes: { attributeId: string; attributeValueId: string }[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  salePrice?: number | null;
  sku: string;
  status?: ProductStatus;
  weight?: number;
  images?: File[];
  variants?: ProductVariantInput[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  // Add specific fields for update if needed
}

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>("/products");
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Product> => {
    const response = await apiClient.post<Product>("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
