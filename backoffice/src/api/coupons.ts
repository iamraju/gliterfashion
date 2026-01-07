import axios from './client';

export const CouponType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;

export type CouponType = typeof CouponType[keyof typeof CouponType];

export interface Coupon {
  id: string;
  sellerId: string | null;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryIds?: string[];
  productIds?: string[];
  categories?: any[];
  products?: any[];
}

export const couponsApi = {
  getAll: async () => {
    const response = await axios.get<Coupon[]>('/coupons');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axios.get<Coupon>(`/coupons/${id}`);
    return response.data;
  },
  create: async (data: Partial<Coupon>) => {
    const response = await axios.post<Coupon>('/coupons', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Coupon>) => {
    const response = await axios.patch<Coupon>(`/coupons/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axios.delete(`/coupons/${id}`);
    return response.data;
  },
};
