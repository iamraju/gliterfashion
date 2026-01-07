import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './dto/auth.dto';

const authService = new AuthService();

export class AuthController {
  
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
         res.status(400).json({ error: error.errors });
         return 
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json(result);
    } catch (error: any) {
       if (error.constructor.name === 'ZodError') {
         res.status(400).json({ error: error.errors });
         return
      }
      res.status(401).json({ error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(data);
      res.json(result);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(data);
      res.json(result);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: error.message }); 
    }
  }
}
