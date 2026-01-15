import { z } from 'zod';

export const createShippingMethodSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  charge: z.string().optional().transform(val => val ? parseFloat(val) : 0),
  deliveryTimeDays: z.string().min(1, 'Delivery days is required').transform(val => parseInt(val)),
  deliveryTimeHours: z.string().optional().transform(val => val ? parseInt(val) : 0),
  isActive: z.string().optional().transform(val => val === 'true'),
  description: z.string().optional(),
});

export const updateShippingMethodSchema = createShippingMethodSchema.partial();

export type CreateShippingMethodDto = z.infer<typeof createShippingMethodSchema>;
export type UpdateShippingMethodDto = z.infer<typeof updateShippingMethodSchema>;
