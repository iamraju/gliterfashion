"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attributes_controller_1 = require("./attributes.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const attributesController = new attributes_controller_1.AttributesController();
router.use(auth_middleware_1.authenticate);
// Public-ish (Authenticated Users)
router.get('/', attributesController.getAllAttributes);
router.get('/:id', attributesController.getAttribute);
// Admin Only
router.post('/', (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), attributesController.createAttribute);
router.patch('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), attributesController.updateAttribute);
router.delete('/:id', (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), attributesController.deleteAttribute);
exports.default = router;
//# sourceMappingURL=attributes.routes.js.map