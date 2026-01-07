
import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const createProductSchema = z.object({
  sellerId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  basePrice: z.number().min(0),
  salePrice: z.number().min(0).optional().nullable(),
  sku: z.string().min(1),
  weight: z.number().min(0).optional().nullable(),
  
  // Variants (Optional initial creation? Usually yes)
  variants: z.array(z.object({
      sku: z.string().min(1),
      price: z.number().min(0),
      compareAtPrice: z.number().min(0).optional().nullable(),
      stockQuantity: z.number().int().min(0),
      barcode: z.string().optional().nullable().transform(val => val === '' ? null : val),
      attributes: z.array(z.object({
          attributeId: z.string().uuid(),
          attributeValueId: z.string().uuid()
      })).optional()
  })).optional(),
  
  // Images
  images: z.array(z.object({
      imageUrl: z.string(),
      isPrimary: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
      attributeValueId: z.string().uuid().optional().nullable()
  })).optional()
});

export const updateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  basePrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional().nullable(),
  sku: z.string().min(1).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  weight: z.number().min(0).optional().nullable(),
  variants: z.array(z.object({
      sku: z.string().min(1),
      price: z.number().min(0),
      compareAtPrice: z.number().min(0).optional().nullable(),
      stockQuantity: z.number().int().min(0),
      barcode: z.string().optional().nullable().transform(val => val === '' ? null : val),
      attributes: z.array(z.object({
          attributeId: z.string().uuid(),
          attributeValueId: z.string().uuid()
      })).optional()
  })).optional(),
  images: z.array(z.object({
      imageUrl: z.string(),
      isPrimary: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
      attributeValueId: z.string().uuid().optional().nullable()
  })).optional()
});
