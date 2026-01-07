import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './dto/auth.dto';
import { z } from 'zod';
type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export declare class AuthService {
    register(data: RegisterInput): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    login(data: LoginInput): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            firstName: string;
            lastName: string;
        };
    }>;
    forgotPassword(data: ForgotPasswordInput): Promise<{
        message: string;
    }>;
    resetPassword(data: ResetPasswordInput): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map