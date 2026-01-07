
import prisma from '../../database/client';
import { createCouponSchema, updateCouponSchema } from './dto/coupons.dto';
import { z } from 'zod';

export class CouponsService {
  async findAll(sellerId?: string) {
      if (sellerId) {
          return prisma.coupon.findMany({
              where: {
                  OR: [
                      { sellerId },
                      { sellerId: null }
                  ]
              },
              include: {
                  categories: true,
                  products: true
              },
              orderBy: { createdAt: 'desc' }
          });
      }
      return prisma.coupon.findMany({ 
          include: {
              categories: true,
              products: true
          },
          orderBy: { createdAt: 'desc' } 
      });
  }

  async findById(id: string) {
    const coupon = await prisma.coupon.findUnique({ 
        where: { id },
        include: {
            categories: true,
            products: true
        }
    });
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    return coupon;
  }

  async findByCode(code: string) {
      const coupon = await prisma.coupon.findUnique({ where: { code } });
      if (!coupon) {
          throw new Error('Invalid coupon code');
      }
      return coupon;
  }

  async create(data: z.infer<typeof createCouponSchema>) {
    const existingCoupon = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existingCoupon) {
      throw new Error('Coupon with this code already exists');
    }

    // Sanitize dates
    const startsAt = new Date(data.startsAt);
    const expiresAt = new Date(data.expiresAt);
    
    // Explicit nulls for prisma types if needed, but Zod .optional() returns undefined.
    // DTO maps undefined -> null manually or just let Prisma handle if configured (standard Prisma ignores undefined updates, but creates? undefined is not null)
    
    // Explicit mapping to handle undefined -> null for optional fields on CREATE
    return prisma.coupon.create({
      data: {
          sellerId: data.sellerId || null,
          code: data.code,
          type: data.type,
          value: data.value,
          minOrderAmount: data.minOrderAmount || null,
          maxDiscountAmount: data.maxDiscountAmount || null,
          usageLimit: data.usageLimit || null,
          startsAt,
          expiresAt,
          ...(data.productIds ? { 
              products: { connect: data.productIds.map(id => ({ id })) }
          } : {}),
          ...(data.categoryIds ? {
              categories: { connect: data.categoryIds.map(id => ({ id })) }
          } : {})
      }
    });
  }

  async update(id: string, data: z.infer<typeof updateCouponSchema>) {
    const existingCoupon = await prisma.coupon.findUnique({ where: { id } });
    if (!existingCoupon) {
      throw new Error('Coupon not found');
    }

    if (data.code) {
        const codeCheck = await prisma.coupon.findUnique({ where: { code: data.code } });
        if (codeCheck && codeCheck.id !== id) {
             throw new Error('Coupon with this code already exists');
        }
    }
    
    // Sanitize
    const updateData: any = {};
    if (data.code) updateData.code = data.code;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount || null;
    if (data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = data.maxDiscountAmount || null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit || null;
    if (data.startsAt) updateData.startsAt = new Date(data.startsAt);
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.productIds !== undefined) {
        updateData.products = {
            set: data.productIds.map(id => ({ id }))
        };
    }
    if (data.categoryIds !== undefined) {
        updateData.categories = {
            set: data.categoryIds.map(id => ({ id }))
        };
    }

    return prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
          categories: true,
          products: true
      }
    });
  }

  async delete(id: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
        throw new Error('Coupon not found');
    }
    
    // Soft delete or real delete?
    // If usage exists, maybe disable instead?
    // User requested Structure doesn't specify soft delete behavior explicitly but has `isActive`.
    // Let's try real delete, if usage exists FK constraint will block it.
    
    try {
        await prisma.coupon.delete({ where: { id } });
    } catch (e: any) {
        if (e.code === 'P2003') { // Foreign key constraint
            // Fallback to deactivating?
            // "Cannot delete coupon with usage history"
            throw new Error('Cannot delete coupon that has been used.');
        }
        throw e;
    }

    return { message: 'Coupon deleted successfully' };
  }
}
