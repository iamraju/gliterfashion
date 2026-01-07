import { updateUserSchema, createUserSchema, changePasswordSchema } from './dto/users.dto';
import { z } from 'zod';
import { Role } from '@prisma/client';
type UpdateUserInput = z.infer<typeof updateUserSchema>;
export declare class UsersService {
    findAll(role?: Role): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        sellerProfile: {
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
    }[]>;
    findById(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        sellerProfile: {
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
    }>;
    update(id: string, data: UpdateUserInput): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        updatedAt: Date;
    }>;
    create(data: z.infer<typeof createUserSchema>): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    changePassword(userId: string, data: z.infer<typeof changePasswordSchema>): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=users.service.d.ts.map