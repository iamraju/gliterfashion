import { Router } from 'express';
import { ContactController } from './contact.controller';

const router = Router();
const contactController = new ContactController();

// Public Routes
router.post('/', contactController.submitContactForm);

// Backoffice Routes (Protected - Middleware should be applied in app.ts or here)
// Assuming app.ts applies basic grouping, but for specific protection we might need middleware if not globally applied.
// For now, these will be mounted under /api/backoffice/contact
router.get('/', contactController.getAllSubmissions);
router.delete('/:id', contactController.deleteSubmission);

export default router;
