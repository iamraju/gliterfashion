import { createCouponSchema, updateCouponSchema } from './dto/coupons.dto';
import { z } from 'zod';
export declare class CouponsService {
    findAll(sellerId?: string): Promise<({
        products: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ProductStatus;
            name: string;
            slug: string;
            description: string | null;
            sellerId: string | null;
            brandId: string | null;
            categoryId: string;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            sku: string;
            isFeatured: boolean;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            showInNavBar: boolean;
            showInHomePage: boolean;
            sortOrder: number;
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ProductStatus;
            name: string;
            slug: string;
            description: string | null;
            sellerId: string | null;
            brandId: string | null;
            categoryId: string;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            sku: string;
            isFeatured: boolean;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            showInNavBar: boolean;
            showInHomePage: boolean;
            sortOrder: number;
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ProductStatus;
            name: string;
            slug: string;
            description: string | null;
            sellerId: string | null;
            brandId: string | null;
            categoryId: string;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            sku: string;
            isFeatured: boolean;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            showInNavBar: boolean;
            showInHomePage: boolean;
            sortOrder: number;
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