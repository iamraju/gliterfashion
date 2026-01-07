"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: zod_1.z.enum(['SUPER_ADMIN', 'SELLER', 'CUSTOMER']), // Required
    // Optional Seller creation details
    companyName: zod_1.z.string().nullable().optional(),
    streetAddress: zod_1.z.string().nullable().optional(),
    city: zod_1.z.string().nullable().optional(),
    state: zod_1.z.string().nullable().optional(),
    country: zod_1.z.string().nullable().optional()
});
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(['SUPER_ADMIN', 'SELLER', 'CUSTOMER']).optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
    // Seller specific fields
    companyName: zod_1.z.string().nullable().optional(),
    streetAddress: zod_1.z.string().nullable().optional(),
    city: zod_1.z.string().nullable().optional(),
    state: zod_1.z.string().nullable().optional(),
    country: zod_1.z.string().nullable().optional()
});
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6),
});
//# sourceMappingURL=users.dto.js.map