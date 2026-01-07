
import { Router } from 'express';
import { AttributesController } from './attributes.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const attributesController = new AttributesController();

router.use(authenticate);

// Public-ish (Authenticated Users)
router.get('/', attributesController.getAllAttributes);
router.get('/:id', attributesController.getAttribute);

// Admin Only
router.post('/', authorize(['SUPER_ADMIN']), attributesController.createAttribute);
router.patch('/:id', authorize(['SUPER_ADMIN']), attributesController.updateAttribute);
router.delete('/:id', authorize(['SUPER_ADMIN']), attributesController.deleteAttribute);

export default router;
