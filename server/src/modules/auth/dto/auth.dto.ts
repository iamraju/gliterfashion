import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'SELLER', 'CUSTOMER']).optional(),

  // For Seller registration
  companyName: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional()
}).refine(data => {
  if (data.role === 'SELLER') {
    return data.streetAddress && data.city && data.state && data.country;
  }
  return true;
}, {
  message: "Address fields are required for Sellers",
  path: ["streetAddress"] // Error will point to streetAddress
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6)
});
