
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../database/client';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    // Debug logging
    console.log('Verifying token:', token.substring(0, 10) + '...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Decoded Payload:', decoded);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      res.status(401).json({ error: 'Invalid token.' });
       return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Access denied.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
};
