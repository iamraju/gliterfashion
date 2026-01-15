
import { Router } from 'express';
import { CheckoutController } from './checkout.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const checkoutController = new CheckoutController();

// Optional auth: handles both guest and logged in users
router.post('/', (req, res, next) => {
    // If authorization header exists, try to authenticate
    if (req.headers.authorization) {
        return authenticate(req, res, next);
    }
    next();
}, checkoutController.placeOrder);

export default router;
