import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireRole } from '../../common/middlewares/rbac.middleware';

const router = Router();

// Example protected route for Seller
router.get('/dashboard', authenticate, requireRole(['SELLER', 'SUPER_ADMIN']), (req, res) => {
  res.json({ message: 'Welcome to Seller Dashboard' });
});

export default router;
