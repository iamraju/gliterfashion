
import { Router } from 'express';
import { CouponsController } from './coupons.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const couponsController = new CouponsController();

router.use(authenticate);

// Public-ish (Authenticated Users) - Viewing coupons?
// Usually only Admins/Sellers manage them. Customers only "apply" them (which is checkout logic, not here yet).
// So this is Backoffice API.

router.get('/', authorize(['SUPER_ADMIN', 'SELLER']), couponsController.getAllCoupons);
router.get('/:id', authorize(['SUPER_ADMIN', 'SELLER']), couponsController.getCoupon);
router.post('/', authorize(['SUPER_ADMIN', 'SELLER']), couponsController.createCoupon);
router.patch('/:id', authorize(['SUPER_ADMIN', 'SELLER']), couponsController.updateCoupon);
router.delete('/:id', authorize(['SUPER_ADMIN', 'SELLER']), couponsController.deleteCoupon);

export default router;
