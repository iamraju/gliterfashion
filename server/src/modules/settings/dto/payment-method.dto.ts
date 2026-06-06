import { z } from 'zod';

export const createPaymentMethodSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  charge: z.string().optional().transform(val => val ? parseFloat(val) : 0),
  isActive: z.string().optional().transform(val => val === 'true'),
  description: z.string().optional(),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial();

export type CreatePaymentMethodDto = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodDto = z.infer<typeof updatePaymentMethodSchema>;
