"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupons_controller_1 = require("./coupons.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const couponsController = new coupons_controller_1.CouponsController();
router.use(auth_middleware_1.authenticate);
// Public-ish (Authenticated Users) - Viewing coupons?
// Usually only Admins/Sellers manage them. Customers only "apply" them (which is checkout logic, not here yet).
// So this is Backoffice API.
router.get('/', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), couponsController.getAllCoupons);
router.get('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), couponsController.getCoupon);
router.post('/', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), couponsController.createCoupon);
router.patch('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), couponsController.updateCoupon);
router.delete('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), couponsController.deleteCoupon);
exports.default = router;
//# sourceMappingURL=coupons.routes.js.map