import { Router } from 'express';
import { cartController } from './cart.controller';

const router = Router();

// Optional: Add middleware to detect user if logged in
// For now, these routes work with sessionId or userId passed explicitly or via req.user

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:id', cartController.updateItem);
router.delete('/items/:id', cartController.removeItem);
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

export default router;
