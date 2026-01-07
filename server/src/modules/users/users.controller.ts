
import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { updateUserSchema, createUserSchema, updateProfileSchema, changePasswordSchema } from './dto/users.dto';
import { Role } from '@prisma/client';

const usersService = new UsersService();

export class UsersController {
  
  async getAllUsers(req: Request, res: Response) {
    try {
      const role = req.query.role as Role | undefined;
      const users = await usersService.findAll(role);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('User ID required');
      const user = await usersService.findById(id);
      res.json(user);
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await usersService.create(data);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
         res.status(400).json({ error: error.errors });
         return 
      }
      if (error.message === 'User already exists') {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('User ID required');
      const data = updateUserSchema.parse(req.body);
      const updatedUser = await usersService.update(id, data);
      res.json(updatedUser);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
         res.status(400).json({ error: error.errors });
         return 
      }
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('User ID required');
      await usersService.delete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
       if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) throw new Error('Unauthorized');
      const user = await usersService.findById(userId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) throw new Error('Unauthorized');
      const data = updateProfileSchema.parse(req.body);
      const updatedUser = await usersService.update(userId, data);
      res.json(updatedUser);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) throw new Error('Unauthorized');
      const data = changePasswordSchema.parse(req.body);
      const result = await usersService.changePassword(userId, data);
      res.json(result);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error.message === 'Invalid current password') {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }
}

