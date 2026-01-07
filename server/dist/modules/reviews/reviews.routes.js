"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("./reviews.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const reviewsController = new reviews_controller_1.ReviewsController();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'SELLER']), reviewsController.getAllReviews);
router.patch('/:id/status', (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), reviewsController.updateReviewStatus);
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map