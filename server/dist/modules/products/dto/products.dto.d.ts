import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    sellerId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        OUT_OF_STOCK: "OUT_OF_STOCK";
        DISCONTINUED: "DISCONTINUED";
    }>>;
    basePrice: z.ZodNumber;
    salePrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    sku: z.ZodString;
    weight: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        price: z.ZodNumber;
        compareAtPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        stockQuantity: z.ZodNumber;
        barcode: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<string | null | undefined, string | null | undefined>>;
        attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            attributeId: z.ZodString;
            attributeValueId: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        imageUrl: z.ZodString;
        isPrimary: z.ZodOptional<z.ZodBoolean>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
        attributeValueId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodOptional<z.ZodNumber>;
    salePrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    sku: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        OUT_OF_STOCK: "OUT_OF_STOCK";
        DISCONTINUED: "DISCONTINUED";
    }>>;
    weight: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        price: z.ZodNumber;
        compareAtPrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        stockQuantity: z.ZodNumber;
        barcode: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<string | null | undefined, string | null | undefined>>;
        attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            attributeId: z.ZodString;
            attributeValueId: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        imageUrl: z.ZodString;
        isPrimary: z.ZodOptional<z.ZodBoolean>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
        attributeValueId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
//# sourceMappingURL=products.dto.d.ts.map