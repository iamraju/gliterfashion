import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();
const settingsController = new SettingsController();

// Public Settings (Must be before auth middleware)
router.get('/public', settingsController.getPublicSettings);

// Shared auth middleware
router.use(authenticate);

// Shipping Methods
router.get('/shipping-methods', settingsController.getAllShippingMethods);
router.get('/shipping-methods/:id', settingsController.getShippingMethod);
router.post('/shipping-methods', authorize(['SUPER_ADMIN']), upload.single('image'), settingsController.createShippingMethod);
router.patch('/shipping-methods/:id', authorize(['SUPER_ADMIN']), upload.single('image'), settingsController.updateShippingMethod);
router.delete('/shipping-methods/:id', authorize(['SUPER_ADMIN']), settingsController.deleteShippingMethod);

// Payment Methods
router.get('/payment-methods', settingsController.getAllPaymentMethods);
router.get('/payment-methods/:id', settingsController.getPaymentMethod);
router.post('/payment-methods', authorize(['SUPER_ADMIN']), upload.single('image'), settingsController.createPaymentMethod);
router.patch('/payment-methods/:id', authorize(['SUPER_ADMIN']), upload.single('image'), settingsController.updatePaymentMethod);
router.delete('/payment-methods/:id', authorize(['SUPER_ADMIN']), settingsController.deletePaymentMethod);

// Site Settings
router.get('/', settingsController.getSettings); // Viewable by authenticated users (or restrict?) - keeping authenticated for now
router.put('/', authorize(['SUPER_ADMIN']), settingsController.updateSettings);

export default router;
