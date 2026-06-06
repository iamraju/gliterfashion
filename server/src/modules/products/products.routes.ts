
import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();
const productsController = new ProductsController();

router.use(authenticate);

// Public-ish (Authenticated Users) - Maybe all authenticated users can list products?
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProduct);

// Admin / Seller Only (For now Super Admin for creation, can expand later)
router.post('/', authorize(['SUPER_ADMIN', 'SELLER']), upload.array('images', 10), productsController.createProduct);
router.patch('/:id', authorize(['SUPER_ADMIN', 'SELLER']), upload.array('images', 10), productsController.updateProduct);
router.delete('/:id', authorize(['SUPER_ADMIN', 'SELLER']), productsController.deleteProduct);

export default router;
