"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: zod_1.z.enum(['SUPER_ADMIN', 'SELLER', 'CUSTOMER']).optional(),
    // For Seller registration
    companyName: zod_1.z.string().optional(),
    streetAddress: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional()
}).refine(data => {
    if (data.role === 'SELLER') {
        return data.streetAddress && data.city && data.state && data.country;
    }
    return true;
}, {
    message: "Address fields are required for Sellers",
    path: ["streetAddress"] // Error will point to streetAddress
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email()
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string().min(6)
});
//# sourceMappingURL=auth.dto.js.map