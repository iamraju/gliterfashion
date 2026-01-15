import prisma from '../../database/client';
import { Prisma } from '@prisma/client';

export class BrandsService {
  async findAll(role: string, sellerId?: string) {
    // If Admin, show ALL brands
    /* 
       Logic:
       - Admins can see all brands.
       - Sellers can see GLOBAL brands (sellerId is null) AND their own brands.
    */
    const where: any = {};
    if (role === 'SELLER' && sellerId) {
       where.OR = [
         { sellerId: null },      // Global brands
         { sellerId: sellerId }   // My brands
       ];
    }
    // If Role is CUSTOMER? usually customers just see products, but if they need a brand list:
    // customers see active brands only? We'll focus on Backoffice logic here mostly.

    return prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.brand.findUnique({
      where: { id }
    });
  }

  async create(data: { name: string; description?: string; logoUrl?: string; sellerId?: string }) {
     // Generate slug from name
     const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
     
     // specific check to unique slug? Prisma will throw, but safer to check or appending random suffix if needed.
     // For now relying on unique constraint error.

     return prisma.brand.create({
       data: {
         ...data,
         slug
       }
     });
  }

  async update(id: string, data: { name?: string; description?: string; logoUrl?: string; isActive?: boolean }, role: string, sellerId?: string) {
    // Permission check
    const brand = await this.findById(id);
    if (!brand) throw new Error('Brand not found');

    if (role === 'SELLER') {
       if (brand.sellerId !== sellerId) {
         throw new Error('Unauthorized to update this brand'); // Can't edit Global or other's brands
       }
    }

    // Update slug if name changes? Usually risky for SEO, but for backend logic OK.
    let slug = undefined;
    if (data.name) {
       slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    return prisma.brand.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug } : {})
      }
    });
  }

  async delete(id: string, role: string, sellerId?: string) {
     const brand = await this.findById(id);
     if (!brand) throw new Error('Brand not found');

     if (role === 'SELLER') {
        if (brand.sellerId !== sellerId) {
          throw new Error('Unauthorized to delete this brand');
        }
     }

     return prisma.brand.delete({
       where: { id }
     });
  }
}

export const brandsService = new BrandsService();
