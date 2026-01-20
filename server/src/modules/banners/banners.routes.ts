import { Router } from 'express';
import { BannersController } from './banners.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const bannersController = new BannersController();

// Public routes (for store)
router.get('/', bannersController.getAllBanners);

// Protected routes (for backoffice)
router.get('/:id', authenticate, authorize(['SUPER_ADMIN']), bannersController.getBanner);
router.post('/', authenticate, authorize(['SUPER_ADMIN']), bannersController.createBanner);
router.patch('/:id', authenticate, authorize(['SUPER_ADMIN']), bannersController.updateBanner);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), bannersController.deleteBanner);

export default router;
