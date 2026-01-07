"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../../database/client"));
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
class AuthService {
    async register(data) {
        // Check if user exists
        const existingUser = await client_1.default.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
        // Transaction to create User and Seller profile if needed
        const result = await client_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role || 'CUSTOMER',
                }
            });
            if (data.role === 'SELLER') {
                // We know these fields are present because of Zod refinement
                await tx.seller.create({
                    data: {
                        userId: user.id,
                        companyName: data.companyName || null,
                        streetAddress: data.streetAddress,
                        city: data.city,
                        state: data.state,
                        country: data.country,
                    }
                });
            }
            return user;
        });
        return { id: result.id, email: result.email, role: result.role };
    }
    async login(data) {
        const user = await client_1.default.user.findUnique({ where: { email: data.email } });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        return { token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } };
    }
    async forgotPassword(data) {
        const user = await client_1.default.user.findUnique({ where: { email: data.email } });
        if (!user) {
            // Return true even if user not found to prevent enumeration
            return { message: 'If the email exists, a reset link has been sent.' };
        }
        // Generate a reset token (simple implementation for now)
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
        // In a real app, send email here
        console.log(`[Email Service] Password reset link for ${data.email}: http://localhost:3000/reset-password?token=${resetToken}`);
        return { message: 'If the email exists, a reset link has been sent.' };
    }
    async resetPassword(data) {
        try {
            const decoded = jsonwebtoken_1.default.verify(data.token, JWT_SECRET);
            if (decoded.type !== 'reset') {
                throw new Error('Invalid token type');
            }
            const hashedPassword = await bcryptjs_1.default.hash(data.newPassword, SALT_ROUNDS);
            await client_1.default.user.update({
                where: { id: decoded.userId },
                data: { password: hashedPassword }
            });
            return { message: 'Password has been reset successfully.' };
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map