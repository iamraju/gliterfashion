"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../common/middlewares/auth.middleware");
const rbac_middleware_1 = require("../../common/middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// Example protected route for Seller
router.get('/dashboard', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(['SELLER', 'SUPER_ADMIN']), (req, res) => {
    res.json({ message: 'Welcome to Seller Dashboard' });
});
exports.default = router;
//# sourceMappingURL=seller.routes.js.map