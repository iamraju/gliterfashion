"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const usersController = new users_controller_1.UsersController();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
router.get('/me', usersController.getMe);
router.patch('/me', usersController.updateMe);
router.post('/me/change-password', usersController.changePassword);
// Get all users - Super Admin only
router.get('/', (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), usersController.getAllUsers);
// Create user - Super Admin only
router.post('/', (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), usersController.createUser);
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
    const userRole = req.user?.role;
    const userId = req.user?.id;
    if (userRole === 'SUPER_ADMIN' || userId === req.params.id) {
        next();
    }
    else {
        res.status(403).json({ error: 'Access denied.' });
    }
}, usersController.getUser);
router.patch('/:id', (req, res, next) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    if (userRole === 'SUPER_ADMIN' || userId === req.params.id) {
        next();
    }
    else {
        res.status(403).json({ error: 'Access denied.' });
    }
}, usersController.updateUser);
router.delete('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), usersController.deleteUser);
exports.default = router;
//# sourceMappingURL=users.routes.js.map