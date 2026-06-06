
import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

// All routes require authentication
router.use(authenticate);
router.get('/me', usersController.getMe);
router.patch('/me', usersController.updateMe);
router.post('/me/change-password', usersController.changePassword);

// Get all users - Super Admin only
router.get('/', authorize(['SUPER_ADMIN']), usersController.getAllUsers);

// Create user - Super Admin only
router.post('/', authorize(['SUPER_ADMIN']), usersController.createUser);

// Get specific user - Super Admin or the user themselves (logic handled here or in controller? 
// Middleware is restrictive, so strictly Super Admin for now to follow "manage all types of users" request, 
// but usually users want to see their own profile. 
// For "management", typically admin access. Let's make it Super Admin only for management list, 
// but flexible for single get if needed. 
// Requirements: "manage all types of users" -> implied Admin feature.
// Let's stick to SUPER_ADMIN for management endpoints for now as per minimal requirements.
// But wait, users might need to see their own profile.
// Let's add specific logic for get/update.

router.get('/:id', (req, res, next) => {
    // Custom authorization: Super Admin OR param id matches authenticated user id
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    if (userRole === 'SUPER_ADMIN' || userId === req.params.id) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied.' });
    }
}, usersController.getUser);

router.patch('/:id', (req, res, next) => {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    if (userRole === 'SUPER_ADMIN' || userId === req.params.id) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied.' });
    }
}, usersController.updateUser);

router.delete('/:id', authorize(['SUPER_ADMIN']), usersController.deleteUser);

export default router;
