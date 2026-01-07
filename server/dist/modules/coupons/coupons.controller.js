"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsController = void 0;
const coupons_service_1 = require("./coupons.service");
const coupons_dto_1 = require("./dto/coupons.dto");
const couponsService = new coupons_service_1.CouponsService();
class CouponsController {
    async getAllCoupons(req, res) {
        try {
            // Filter by seller?
            // If Super Admin -> All
            // If Seller -> His only?
            // Currently strict separation might be needed.
            // User.role logic accessible via req.user
            // Just returning all for now as requested "CRUD". Access control in routes.
            const coupons = await couponsService.findAll();
            res.json(coupons);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getCoupon(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Coupon ID required');
            const coupon = await couponsService.findById(id);
            res.json(coupon);
        }
        catch (error) {
            if (error.message === 'Coupon not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async createCoupon(req, res) {
        try {
            const data = coupons_dto_1.createCouponSchema.parse(req.body);
            const coupon = await couponsService.create(data);
            res.status(201).json(coupon);
        }
        catch (error) {
            if (error.constructor.name === "ZodError") {
                const formattedErrors = error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message
                }));
                res.status(400).json({ error: "Validation Error", details: formattedErrors });
                return;
            }
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async updateCoupon(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Coupon ID required');
            const data = coupons_dto_1.updateCouponSchema.parse(req.body);
            const coupon = await couponsService.update(id, data);
            res.json(coupon);
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                const formattedErrors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({ error: 'Validation Error', details: formattedErrors });
                return;
            }
            if (error.message === 'Coupon not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async deleteCoupon(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Coupon ID required');
            await couponsService.delete(id);
            res.status(200).json({ message: 'Coupon deleted successfully' });
        }
        catch (error) {
            if (error.message === 'Coupon not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('Cannot delete')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
}
exports.CouponsController = CouponsController;
//# sourceMappingURL=coupons.controller.js.map