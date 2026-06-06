import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new WishlistController();

router.get('/', authenticate, controller.getWishlist);
router.post('/', authenticate, controller.addToWishlist);
router.delete('/:productId', authenticate, controller.removeFromWishlist);

export default router;
