"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("./users.service");
const users_dto_1 = require("./dto/users.dto");
const usersService = new users_service_1.UsersService();
class UsersController {
    async getAllUsers(req, res) {
        try {
            const role = req.query.role;
            const users = await usersService.findAll(role);
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getUser(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('User ID required');
            const user = await usersService.findById(id);
            res.json(user);
        }
        catch (error) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async createUser(req, res) {
        try {
            const data = users_dto_1.createUserSchema.parse(req.body);
            const user = await usersService.create(data);
            res.status(201).json(user);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            if (error.message === 'User already exists') {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('User ID required');
            const data = users_dto_1.updateUserSchema.parse(req.body);
            const updatedUser = await usersService.update(id, data);
            res.json(updatedUser);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            if (error.message === 'User not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('User ID required');
            await usersService.delete(id);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async getMe(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('Unauthorized');
            const user = await usersService.findById(userId);
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateMe(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('Unauthorized');
            const data = users_dto_1.updateProfileSchema.parse(req.body);
            const updatedUser = await usersService.update(userId, data);
            res.json(updatedUser);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('Unauthorized');
            const data = users_dto_1.changePasswordSchema.parse(req.body);
            const result = await usersService.changePassword(userId, data);
            res.json(result);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            if (error.message === 'Invalid current password') {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map