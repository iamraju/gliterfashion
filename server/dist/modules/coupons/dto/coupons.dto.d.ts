import { z } from 'zod';
export declare const createCouponSchema: z.ZodObject<{
    sellerId: z.ZodOptional<z.ZodString>;
    code: z.ZodString;
    type: z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED_AMOUNT: "FIXED_AMOUNT";
    }>;
    value: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodNumber>;
    minOrderAmount: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    maxDiscountAmount: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    usageLimit: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    startsAt: z.ZodString;
    expiresAt: z.ZodString;
    productIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateCouponSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    value: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    minOrderAmount: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    maxDiscountAmount: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    usageLimit: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    startsAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    productIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=coupons.dto.d.ts.map