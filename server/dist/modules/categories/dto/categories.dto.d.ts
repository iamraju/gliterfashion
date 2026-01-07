import { z } from 'zod';
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentId: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | null | undefined, string | undefined>>;
    imageUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodBoolean>>;
    sortOrder: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    gender: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        MEN: "MEN";
        WOMEN: "WOMEN";
        UNISEX: "UNISEX";
    }>>>;
}, z.core.$strip>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentId: z.ZodNullable<z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | null | undefined, string | undefined>>>;
    imageUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodBoolean>>;
    sortOrder: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    gender: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        MEN: "MEN";
        WOMEN: "WOMEN";
        UNISEX: "UNISEX";
    }>>>;
}, z.core.$strip>;
//# sourceMappingURL=categories.dto.d.ts.map