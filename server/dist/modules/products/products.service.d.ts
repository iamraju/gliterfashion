import { Prisma } from '@prisma/client';
import { createProductSchema, updateProductSchema } from './dto/products.dto';
import { z } from 'zod';
export declare class ProductsService {
    findAll(): Promise<({
        seller: ({
            user: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                status: import(".prisma/client").$Enums.UserStatus;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            companyName: string | null;
            streetAddress: string | null;
            city: string | null;
            state: string | null;
            country: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        }) | null;
        category: {
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
        };
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            sortOrder: number;
            attributeValueId: string | null;
            isPrimary: boolean;
            productId: string;
        }[];
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sku: string;
            productId: string;
            price: Prisma.Decimal;
            compareAtPrice: Prisma.Decimal | null;
            stockQuantity: number;
            barcode: string | null;
            lowStockThreshold: number | null;
        }[];
    } & {
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
        basePrice: Prisma.Decimal;
        salePrice: Prisma.Decimal | null;
        weight: Prisma.Decimal | null;
    })[]>;
    findById(id: string): Promise<{
        seller: {
            companyName: string | null;
            streetAddress: string | null;
            city: string | null;
            state: string | null;
            country: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        } | null;
        category: {
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
        };
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            sortOrder: number;
            attributeValueId: string | null;
            isPrimary: boolean;
            productId: string;
        }[];
        variants: ({
            productVariantAttribute: ({
                attribute: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    slug: string;
                };
                attributeValue: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    value: string;
                    attributeId: string;
                };
            } & {
                id: string;
                attributeId: string;
                variantId: string;
                attributeValueId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sku: string;
            productId: string;
            price: Prisma.Decimal;
            compareAtPrice: Prisma.Decimal | null;
            stockQuantity: number;
            barcode: string | null;
            lowStockThreshold: number | null;
        })[];
    } & {
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
        basePrice: Prisma.Decimal;
        salePrice: Prisma.Decimal | null;
        weight: Prisma.Decimal | null;
    }>;
    create(data: z.infer<typeof createProductSchema>): Promise<{
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
        basePrice: Prisma.Decimal;
        salePrice: Prisma.Decimal | null;
        weight: Prisma.Decimal | null;
    }>;
    update(id: string, data: z.infer<typeof updateProductSchema>): Promise<{
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
        basePrice: Prisma.Decimal;
        salePrice: Prisma.Decimal | null;
        weight: Prisma.Decimal | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=products.service.d.ts.map