"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsController = void 0;
const reviews_service_1 = require("./reviews.service");
const client_1 = require("@prisma/client");
const reviewsService = new reviews_service_1.ReviewsService();
class ReviewsController {
    async getAllReviews(req, res) {
        try {
            const { productId, status } = req.query;
            const reviews = await reviewsService.findAll(productId, status);
            res.json(reviews);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateReviewStatus(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Review ID required');
            const { status } = req.body;
            if (!Object.values(client_1.ReviewStatus).includes(status)) {
                throw new Error('Invalid status');
            }
            const review = await reviewsService.updateStatus(id, status);
            res.json(review);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.ReviewsController = ReviewsController;
//# sourceMappingURL=reviews.controller.js.map