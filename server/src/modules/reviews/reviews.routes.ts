
import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const reviewsController = new ReviewsController();

router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN', 'SELLER']), reviewsController.getAllReviews);
router.patch('/:id/status', authorize(['SUPER_ADMIN']), reviewsController.updateReviewStatus);

export default router;
