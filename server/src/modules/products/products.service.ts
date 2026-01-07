
import prisma from '../../database/client';
import { Prisma } from '@prisma/client';
import { createProductSchema, updateProductSchema } from './dto/products.dto';
import { z } from 'zod';

export class ProductsService {
  async findAll() {
    return prisma.product.findMany({
      include: {
        images: true,
        category: true,
        seller: {
            include: { user: true }
        },
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        seller: true,
        variants: {
            include: {
                productVariantAttribute: {
                    include: {
                        attribute: true,
                        attributeValue: true
                    }
                }
            }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async create(data: z.infer<typeof createProductSchema>) {
    // Check slug uniqueness (now globally unique)
    const existingProduct = await prisma.product.findUnique({
        where: { slug: data.slug }
    });
    if (existingProduct) {
        throw new Error('Product with this slug already exists');
    }
    
    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
        throw new Error('Product with this SKU already exists');
    }

    return prisma.$transaction(async (tx) => {
        // Create Product
        const product = await tx.product.create({
            data: {
                sellerId: data.sellerId || null,
                categoryId: data.categoryId,
                name: data.name,
                slug: data.slug,
                description: data.description || null,
                basePrice: data.basePrice,
                salePrice: data.salePrice || null,
                sku: data.sku,
                status: data.status || 'DRAFT',
                weight: data.weight || null
            }
        });

        // Create Images
        if (data.images && data.images.length > 0) {
            await tx.productImage.createMany({
                data: data.images.map(img => ({
                    productId: product.id,
                    imageUrl: img.imageUrl,
                    isPrimary: img.isPrimary ?? false,
                    sortOrder: img.sortOrder ?? 0,
                    attributeValueId: img.attributeValueId || null
                }))
            });
        }

        // Create Variants
        if (data.variants && data.variants.length > 0) {
            for (const variant of data.variants) {
                // Create Variant
                const createdVariant = await tx.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: variant.sku,
                        price: variant.price,
                        compareAtPrice: variant.compareAtPrice || null,
                        barcode: variant.barcode || null,
                        stockQuantity: variant.stockQuantity,
                    }
                });

                // Link Attributes
                if (variant.attributes && variant.attributes.length > 0) {
                    await tx.productVariantAttribute.createMany({
                        data: variant.attributes.map(attr => ({
                            variantId: createdVariant.id,
                            attributeId: attr.attributeId,
                            attributeValueId: attr.attributeValueId
                        }))
                    });
                }
            }
        }

        return product;
    }).catch(error => {
        const errorMsg = error.message || '';
        // Check code P2002 or if the message explicitly mentions unique constraint and barcode/sku
        if (error.code === 'P2002' || errorMsg.includes('P2002') || errorMsg.includes('Unique constraint failed')) {
            if (errorMsg.includes('barcode') || (error.meta?.target || []).includes('barcode')) {
                throw new Error('Duplicate barcode numbers found, check and update to make unique or empty');
            }
            if (errorMsg.includes('sku') || (error.meta?.target || []).includes('sku')) {
                throw new Error('Duplicate SKU found. Each variant must have a unique SKU.');
            }
        }
        throw error;
    });
  }

  async update(id: string, data: z.infer<typeof updateProductSchema>) {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    // Sanitize
    const updateData: any = {};
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice;
    if (data.sku) updateData.sku = data.sku;
    if (data.status) updateData.status = data.status;
    if (data.weight !== undefined) updateData.weight = data.weight;

    return prisma.$transaction(async (tx) => {
        // Update Product Info
        const updatedProduct = await tx.product.update({
            where: { id },
            data: updateData
        });
        
        // Update Images if provided
        if (data.images !== undefined) {
             // 1. Delete existing images
             await tx.productImage.deleteMany({
                 where: { productId: id }
             });

             // 2. Create new images
             if (data.images.length > 0) {
                 await tx.productImage.createMany({
                     data: data.images.map(img => ({
                         productId: id,
                         imageUrl: img.imageUrl,
                         isPrimary: img.isPrimary ?? false,
                         sortOrder: img.sortOrder ?? 0,
                         attributeValueId: img.attributeValueId || null
                     }))
                 });
             }
        }

        // Sync Variants if provided
        if (data.variants !== undefined) {
            // Get existing variants
            const existingVariants = await tx.productVariant.findMany({
                where: { productId: id }
            });

            const incomingSkus = data.variants.map(v => v.sku);

            // 1. Delete variants not in incoming list
            await tx.productVariant.deleteMany({
                where: {
                    productId: id,
                    sku: { notIn: incomingSkus }
                }
            });

            // 2. Update existing or Create new
            for (const variant of data.variants) {
                const existing = existingVariants.find(v => v.sku === variant.sku);

                if (existing) {
                    // Update existing variant
                    await tx.productVariant.update({
                        where: { id: existing.id },
                        data: {
                            price: variant.price,
                            compareAtPrice: variant.compareAtPrice || null,
                            barcode: variant.barcode || null,
                            stockQuantity: variant.stockQuantity,
                        }
                    });
                    // Attributes are generally fixed for a SKU in this flow, 
                    // but we could refresh them if needed. 
                    // For now, assume attributes stay same for existing SKU.
                } else {
                    // Create new variant
                    const createdVariant = await tx.productVariant.create({
                        data: {
                            productId: id,
                            sku: variant.sku,
                            barcode: variant.barcode || null,
                            price: variant.price,
                            compareAtPrice: variant.compareAtPrice || null,
                            stockQuantity: variant.stockQuantity,
                        }
                    });

                    // Link Attributes for new variant
                    if (variant.attributes && variant.attributes.length > 0) {
                        await tx.productVariantAttribute.createMany({
                            data: variant.attributes.map(attr => ({
                                variantId: createdVariant.id,
                                attributeId: attr.attributeId,
                                attributeValueId: attr.attributeValueId
                            }))
                        });
                    }
                }
            }
        }

        return updatedProduct;
    }).catch(error => {
        const errorMsg = error.message || '';
        // Check code P2002 or if the message explicitly mentions unique constraint and barcode/sku
        if (error.code === 'P2002' || errorMsg.includes('P2002') || errorMsg.includes('Unique constraint failed')) {
            if (errorMsg.includes('barcode') || (error.meta?.target || []).includes('barcode')) {
                throw new Error('Duplicate barcode numbers found, check and update to make unique or empty');
            }
            if (errorMsg.includes('sku') || (error.meta?.target || []).includes('sku')) {
                throw new Error('Duplicate SKU found. Each variant must have a unique SKU.');
            }
        }
        throw error;
    });
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    await prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }
}
