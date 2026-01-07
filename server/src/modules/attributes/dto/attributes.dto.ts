
import { z } from 'zod';

export const createAttributeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  values: z.array(z.string().min(1)).min(1)
});

export const updateAttributeSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  values: z.array(z.string().min(1)).optional()
});
