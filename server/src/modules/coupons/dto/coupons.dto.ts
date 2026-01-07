
import { z } from 'zod';
import { CouponType } from '@prisma/client';

export const createCouponSchema = z.object({
  sellerId: z.string().uuid().optional(), // Null for platform-wide
  code: z.string().min(3).toUpperCase(),
  type: z.nativeEnum(CouponType),
  value: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(0)),
  minOrderAmount: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(0).optional()),
  maxDiscountAmount: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(0).optional()),
  usageLimit: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().int().min(0).optional()),
  startsAt: z.string().datetime(), // Receive as ISO string
  expiresAt: z.string().datetime(),
  productIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
}).refine((data) => {
    return new Date(data.startsAt) < new Date(data.expiresAt);
}, {
    message: "Start date must be before expiration date",
    path: ["startsAt"]
});

export const updateCouponSchema = z.object({
  code: z.string().min(3).toUpperCase().optional(),
  value: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(0).optional()),
  minOrderAmount: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(0).optional()),
  maxDiscountAmount: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().min(0).optional()),
  usageLimit: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().int().min(0).optional()),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  productIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
}).refine((data) => {
    if (data.startsAt && data.expiresAt) {
        return new Date(data.startsAt) < new Date(data.expiresAt);
    }
    return true;
}, {
    message: "Start date must be before expiration date",
    path: ["startsAt"]
});
