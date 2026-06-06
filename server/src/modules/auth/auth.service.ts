import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/client';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './dto/auth.dto';
import { z } from 'zod';
import { EmailService } from '../../common/services/EmailService';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export class AuthService {

  async register(data: RegisterInput) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Transaction to create User and Seller profile if needed
    const result = await prisma.$transaction(async (tx) => {
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
            streetAddress: data.streetAddress!,
            city: data.city!,
            state: data.state!,
            country: data.country!,
          }
        });
      }

      return user;
    });

    const token = jwt.sign(
      { userId: result.id, role: result.role, email: result.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Email Verification Logic
    if (result.role === 'CUSTOMER') {
      const verificationToken = jwt.sign(
        { userId: result.id, type: 'email-verification' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      await prisma.user.update({
        where: { id: result.id },
        data: { emailVerificationToken: verificationToken }
      });

      const emailService = new EmailService();
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?token=${verificationToken}`;
      
      try {
        await emailService.sendEmail({
          to: result.email,
          subject: 'Verify your email - Glitter Fashion',
          html: emailService.generateVerificationTemplate(verificationLink)
        });
      } catch (err) {
        console.error('Failed to send verification email:', err);
      }

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        requiresVerification: true
      };
    }

    // For other roles (if any) or if we decided to auto-login them
    // But currently only CUSTOMER/SELLER register here. 
    // If SELLER, maybe we still auto-login or same? 
    // Let's keep auto-login for non-customers if needed, or enforce for all? 
    // User said "register as customer". 
    // Existing code returned token for everyone.
    // I will return token only if NOT customer (e.g. Seller?) or just enforce for all?
    // Let's check logic: if result.role === 'CUSTOMER' we return above.
    
    // For others (Seller):
    return { 
      token, 
      user: { 
        id: result.id, 
        email: result.email, 
        role: result.role, 
        firstName: result.firstName, 
        lastName: result.lastName,
        isEmailVerified: false 
      } 
    };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    if (user.role === 'CUSTOMER' && !user.isEmailVerified) {
      throw new Error('Please verify your email address to login. Check your inbox for the verification link.');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      // Return true even if user not found to prevent enumeration
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    // Generate a reset token (simple implementation for now)
    const resetToken = jwt.sign({ userId: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });

    // In a real app, send email here
    console.log(`[Email Service] Password reset link for ${data.email}: http://localhost:3000/reset-password?token=${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(data: ResetPasswordInput) {
    try {
      const decoded = jwt.verify(data.token, JWT_SECRET) as any;
      if (decoded.type !== 'reset') {
        throw new Error('Invalid token type');
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      });

      return { message: 'Password has been reset successfully.' };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.type !== 'email-verification') {
        throw new Error('Invalid token type');
      }

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          isEmailVerified: true,
          emailVerificationToken: null
        }
      });
      
      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }
}
