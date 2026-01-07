"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("./categories.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const categoriesController = new categories_controller_1.CategoriesController();
router.use(auth_middleware_1.authenticate);
// Public-ish (Authenticated Users)
router.get("/", categoriesController.getAllCategories);
router.get("/:id", categoriesController.getCategory);
// Admin Only
router.post("/", (0, auth_middleware_1.authorize)(["SUPER_ADMIN"]), upload_middleware_1.upload.single("image"), categoriesController.createCategory);
router.patch("/:id", (0, auth_middleware_1.authorize)(["SUPER_ADMIN"]), upload_middleware_1.upload.single("image"), categoriesController.updateCategory);
router.delete("/:id", (0, auth_middleware_1.authorize)(["SUPER_ADMIN"]), categoriesController.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map