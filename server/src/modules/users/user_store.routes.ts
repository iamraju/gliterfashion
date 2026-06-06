
import { Router } from 'express';
import { UsersController } from './users.controller';
import { AddressesController } from './addresses.controller';
import { OrdersController } from '../orders/orders.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();
const addressesController = new AddressesController();
const ordersController = new OrdersController();

// Store-side user routes
// Store-side user routes
router.get('/me', authenticate, usersController.getMe);
router.patch('/me', authenticate, usersController.updateMe);

// Address Management
// Address Management
router.get('/me/addresses', authenticate, addressesController.getAddresses);
router.post('/me/addresses', authenticate, addressesController.createAddress);
router.patch('/me/addresses/:id', authenticate, addressesController.updateAddress);
router.delete('/me/addresses/:id', authenticate, addressesController.deleteAddress);
router.post('/me/addresses/:id/default', authenticate, addressesController.setDefault);

// Order History
// Order History
router.get('/me/orders', authenticate, ordersController.getAllOrders);
router.get('/me/orders/:id', authenticate, ordersController.getOrder);
router.post('/me/orders/:id/cancel', authenticate, ordersController.cancelOrder);

export default router;
