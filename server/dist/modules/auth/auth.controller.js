"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const data = auth_dto_1.registerSchema.parse(req.body);
            const user = await authService.register(data);
            res.status(201).json(user);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const data = auth_dto_1.loginSchema.parse(req.body);
            const result = await authService.login(data);
            res.json(result);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(401).json({ error: error.message });
        }
    }
    async forgotPassword(req, res) {
        try {
            const data = auth_dto_1.forgotPasswordSchema.parse(req.body);
            const result = await authService.forgotPassword(data);
            res.json(result);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async resetPassword(req, res) {
        try {
            const data = auth_dto_1.resetPasswordSchema.parse(req.body);
            const result = await authService.resetPassword(data);
            res.json(result);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map