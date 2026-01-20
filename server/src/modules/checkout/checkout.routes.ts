
import { Router } from 'express';
import { CheckoutController } from './checkout.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();
const checkoutController = new CheckoutController();

// Upload Payment Proof (Public/Guest allowed)
router.post('/upload-proof', (req, res, next) => {
    // Optional auth check if needed, but primarily just upload
    next();
}, upload.single('proof'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fullUrl, filename: req.file.filename });
});

router.post('/paypal/capture', checkoutController.capturePayPalPayment);
router.post('/', (req, res, next) => {
    // If authorization header exists, try to authenticate
    if (req.headers.authorization) {
        return authenticate(req, res, next);
    }
    next();
}, checkoutController.placeOrder);

export default router;
