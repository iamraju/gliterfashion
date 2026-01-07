
import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const ordersController = new OrdersController();

router.use(authenticate);

router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrder);
router.patch('/:id/status', authorize(['SUPER_ADMIN', 'SELLER']), ordersController.updateOrderStatus);

export default router;
