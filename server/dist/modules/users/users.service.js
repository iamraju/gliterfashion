"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const client_1 = __importDefault(require("../../database/client"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UsersService {
    async findAll(role) {
        const where = role ? { role } : {};
        return client_1.default.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                sellerProfile: true // Include seller profile if exists
            }
        });
    }
    async findById(id) {
        const user = await client_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                sellerProfile: true
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async update(id, data) {
        // Check if user exists
        const existingUser = await client_1.default.user.findUnique({ where: { id }, include: { sellerProfile: true } });
        if (!existingUser) {
            throw new Error('User not found');
        }
        // Prepare User update data
        const userUpdateData = {};
        if (data.firstName)
            userUpdateData.firstName = data.firstName;
        if (data.lastName)
            userUpdateData.lastName = data.lastName;
        if (data.email)
            userUpdateData.email = data.email;
        if (data.role)
            userUpdateData.role = data.role;
        if (data.status)
            userUpdateData.status = data.status;
        // Prepare Seller update data
        const sellerUpdateData = {};
        if (data.companyName !== undefined)
            sellerUpdateData.companyName = data.companyName;
        if (data.streetAddress !== undefined)
            sellerUpdateData.streetAddress = data.streetAddress;
        if (data.city !== undefined)
            sellerUpdateData.city = data.city;
        if (data.state !== undefined)
            sellerUpdateData.state = data.state;
        if (data.country !== undefined)
            sellerUpdateData.country = data.country;
        // Transaction for atomic update
        const result = await client_1.default.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: userUpdateData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    updatedAt: true
                }
            });
            // Handle Seller Profile
            // If role is changing to SELLER, ensure profile exists
            if (data.role === 'SELLER' || existingUser.role === 'SELLER') {
                const hasSellerUpdates = Object.keys(sellerUpdateData).length > 0;
                // Upsert seller profile
                // If data.role is changing to SELLER, we must ensure a profile exists even if no seller data provided
                const isSwitchingToSeller = data.role === 'SELLER';
                if (hasSellerUpdates || isSwitchingToSeller) {
                    await tx.seller.upsert({
                        where: { userId: id },
                        create: {
                            userId: id,
                            companyName: sellerUpdateData.companyName || null,
                            streetAddress: sellerUpdateData.streetAddress || null,
                            city: sellerUpdateData.city || null,
                            state: sellerUpdateData.state || null,
                            country: sellerUpdateData.country || null
                        },
                        update: sellerUpdateData
                    });
                }
            }
            return user;
        });
        return result;
    }
    async create(data) {
        // Check if user exists
        const existingUser = await client_1.default.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
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
                await tx.seller.create({
                    data: {
                        userId: user.id,
                        companyName: data.companyName || null,
                        streetAddress: data.streetAddress || null,
                        city: data.city || null,
                        state: data.state || null,
                        country: data.country || null,
                    }
                });
            }
            return user;
        });
        return {
            id: result.id,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            role: result.role
        };
    }
    async changePassword(userId, data) {
        const user = await client_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid current password');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.newPassword, 10);
        await client_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { message: 'Password changed successfully' };
    }
    async delete(id) {
        // Check if user exists
        const existingUser = await client_1.default.user.findUnique({ where: { id } });
        if (!existingUser) {
            throw new Error('User not found');
        }
        // Potentially unsafe to hard delete, but per requirements we'll do delete
        await client_1.default.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map