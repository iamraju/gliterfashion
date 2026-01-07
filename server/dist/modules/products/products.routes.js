"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const productsController = new products_controller_1.ProductsController();
router.use(auth_middleware_1.authenticate);
// Public-ish (Authenticated Users) - Maybe all authenticated users can list products?
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProduct);
// Admin / Seller Only (For now Super Admin for creation, can expand later)
router.post('/', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), upload_middleware_1.upload.array('images', 10), productsController.createProduct);
router.patch('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), upload_middleware_1.upload.array('images', 10), productsController.updateProduct);
router.delete('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), productsController.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.routes.js.map