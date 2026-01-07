
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().or(z.literal('')).transform(val => val === '' ? null : val),
  imageUrl: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
  sortOrder: z.preprocess((val) => {
    if (val === '' || val === null) return undefined;
    if (typeof val === 'string') return Number(val);
    return val;
  }, z.number().int().optional()),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).nullish()
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().or(z.literal('')).transform(val => val === '' ? null : val).nullable(),
  imageUrl: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
  sortOrder: z.preprocess((val) => {
    if (val === '' || val === null) return undefined;
    if (typeof val === 'string') return Number(val);
    return val;
  }, z.number().int().optional()),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).nullish()
});
