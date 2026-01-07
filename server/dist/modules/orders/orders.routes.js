"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_controller_1 = require("./orders.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ordersController = new orders_controller_1.OrdersController();
router.use(auth_middleware_1.authenticate);
router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrder);
router.patch('/:id/status', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), ordersController.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map