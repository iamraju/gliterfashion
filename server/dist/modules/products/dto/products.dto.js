"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createProductSchema = zod_1.z.object({
    sellerId: zod_1.z.string().uuid().optional().nullable(),
    categoryId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.ProductStatus).optional(),
    basePrice: zod_1.z.number().min(0),
    salePrice: zod_1.z.number().min(0).optional().nullable(),
    sku: zod_1.z.string().min(1),
    weight: zod_1.z.number().min(0).optional().nullable(),
    // Variants (Optional initial creation? Usually yes)
    variants: zod_1.z.array(zod_1.z.object({
        sku: zod_1.z.string().min(1),
        price: zod_1.z.number().min(0),
        compareAtPrice: zod_1.z.number().min(0).optional().nullable(),
        stockQuantity: zod_1.z.number().int().min(0),
        barcode: zod_1.z.string().optional().nullable().transform(val => val === '' ? null : val),
        attributes: zod_1.z.array(zod_1.z.object({
            attributeId: zod_1.z.string().uuid(),
            attributeValueId: zod_1.z.string().uuid()
        })).optional()
    })).optional(),
    // Images
    images: zod_1.z.array(zod_1.z.object({
        imageUrl: zod_1.z.string(),
        isPrimary: zod_1.z.boolean().optional(),
        sortOrder: zod_1.z.number().int().optional(),
        attributeValueId: zod_1.z.string().uuid().optional().nullable()
    })).optional()
});
exports.updateProductSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    basePrice: zod_1.z.number().min(0).optional(),
    salePrice: zod_1.z.number().min(0).optional().nullable(),
    sku: zod_1.z.string().min(1).optional(),
    status: zod_1.z.nativeEnum(client_1.ProductStatus).optional(),
    weight: zod_1.z.number().min(0).optional().nullable(),
    variants: zod_1.z.array(zod_1.z.object({
        sku: zod_1.z.string().min(1),
        price: zod_1.z.number().min(0),
        compareAtPrice: zod_1.z.number().min(0).optional().nullable(),
        stockQuantity: zod_1.z.number().int().min(0),
        barcode: zod_1.z.string().optional().nullable().transform(val => val === '' ? null : val),
        attributes: zod_1.z.array(zod_1.z.object({
            attributeId: zod_1.z.string().uuid(),
            attributeValueId: zod_1.z.string().uuid()
        })).optional()
    })).optional(),
    images: zod_1.z.array(zod_1.z.object({
        imageUrl: zod_1.z.string(),
        isPrimary: zod_1.z.boolean().optional(),
        sortOrder: zod_1.z.number().int().optional(),
        attributeValueId: zod_1.z.string().uuid().optional().nullable()
    })).optional()
});
//# sourceMappingURL=products.dto.js.map