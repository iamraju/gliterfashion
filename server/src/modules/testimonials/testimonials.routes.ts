
import { Router } from 'express';
import { TestimonialsController } from './testimonials.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new TestimonialsController();

// Public
router.get('/public', (req, res, next) => {
    req.query.active = 'true';
    next();
}, controller.list);

// Admin
router.get('/', authenticate, authorize([Role.SUPER_ADMIN]), controller.list);
router.get('/:id', authenticate, authorize([Role.SUPER_ADMIN]), controller.getById);
router.post('/', authenticate, authorize([Role.SUPER_ADMIN]), controller.create);
router.put('/:id', authenticate, authorize([Role.SUPER_ADMIN]), controller.update);
router.delete('/:id', authenticate, authorize([Role.SUPER_ADMIN]), controller.delete);

export default router;
