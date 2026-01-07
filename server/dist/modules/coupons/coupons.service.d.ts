import { createCouponSchema, updateCouponSchema } from './dto/coupons.dto';
import { z } from 'zod';
export declare class CouponsService {
    findAll(sellerId?: string): Promise<({
        products: {
            id: string;
            status: import(".prisma/client").$Enums.ProductStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            sellerId: string | null;
            categoryId: string;
            sku: string;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            sortOrder: number;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
        }[];
    } & {
        type: import(".prisma/client").$Enums.CouponType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sellerId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        minOrderAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxDiscountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        startsAt: Date;
        expiresAt: Date;
        usageCount: number;
    })[]>;
    findById(id: string): Promise<{
        products: {
            id: string;
            status: import(".prisma/client").$Enums.ProductStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            sellerId: string | null;
            categoryId: string;
            sku: string;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            sortOrder: number;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
        }[];
    } & {
        type: import(".prisma/client").$Enums.CouponType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sellerId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        minOrderAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxDiscountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        startsAt: Date;
        expiresAt: Date;
        usageCount: number;
    }>;
    findByCode(code: string): Promise<{
        type: import(".prisma/client").$Enums.CouponType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sellerId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        minOrderAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxDiscountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        startsAt: Date;
        expiresAt: Date;
        usageCount: number;
    }>;
    create(data: z.infer<typeof createCouponSchema>): Promise<{
        type: import(".prisma/client").$Enums.CouponType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sellerId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        minOrderAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxDiscountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        startsAt: Date;
        expiresAt: Date;
        usageCount: number;
    }>;
    update(id: string, data: z.infer<typeof updateCouponSchema>): Promise<{
        products: {
            id: string;
            status: import(".prisma/client").$Enums.ProductStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            sellerId: string | null;
            categoryId: string;
            sku: string;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            sortOrder: number;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
        }[];
    } & {
        type: import(".prisma/client").$Enums.CouponType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sellerId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        code: string;
        minOrderAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxDiscountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        startsAt: Date;
        expiresAt: Date;
        usageCount: number;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=coupons.service.d.ts.map