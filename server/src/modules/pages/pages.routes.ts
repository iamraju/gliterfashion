import { Router } from 'express';
import { PagesController } from './pages.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new PagesController();

// Public routes
router.get('/slug/:slug', controller.getBySlug);
router.get('/public', (req, res, next) => {
    req.query.active = 'true';
    next();
}, controller.list);

// Admin routes
router.post('/', authenticate, authorize([Role.SUPER_ADMIN]), controller.create);
router.put('/:id', authenticate, authorize([Role.SUPER_ADMIN]), controller.update);
router.delete('/:id', authenticate, authorize([Role.SUPER_ADMIN]), controller.delete);
router.get('/:id', authenticate, authorize([Role.SUPER_ADMIN]), controller.getById);
router.get('/', authenticate, authorize([Role.SUPER_ADMIN]), controller.list);

export default router;
