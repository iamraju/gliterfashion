"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCouponSchema = exports.createCouponSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCouponSchema = zod_1.z.object({
    sellerId: zod_1.z.string().uuid().optional(), // Null for platform-wide
    code: zod_1.z.string().min(3).toUpperCase(),
    type: zod_1.z.nativeEnum(client_1.CouponType),
    value: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().min(0)),
    minOrderAmount: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().min(0).optional()),
    maxDiscountAmount: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().min(0).optional()),
    usageLimit: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().int().min(0).optional()),
    startsAt: zod_1.z.string().datetime(), // Receive as ISO string
    expiresAt: zod_1.z.string().datetime(),
    productIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
}).refine((data) => {
    return new Date(data.startsAt) < new Date(data.expiresAt);
}, {
    message: "Start date must be before expiration date",
    path: ["startsAt"]
});
exports.updateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(3).toUpperCase().optional(),
    value: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().min(0).optional()),
    minOrderAmount: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().min(0).optional()),
    maxDiscountAmount: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().min(0).optional()),
    usageLimit: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number().int().min(0).optional()),
    startsAt: zod_1.z.string().datetime().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional(),
    productIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
}).refine((data) => {
    if (data.startsAt && data.expiresAt) {
        return new Date(data.startsAt) < new Date(data.expiresAt);
    }
    return true;
}, {
    message: "Start date must be before expiration date",
    path: ["startsAt"]
});
//# sourceMappingURL=coupons.dto.js.map