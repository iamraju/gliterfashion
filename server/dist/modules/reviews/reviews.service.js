"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const client_1 = __importDefault(require("../../database/client"));
class ReviewsService {
    async findAll(productId, status) {
        const where = {};
        if (productId)
            where.productId = productId;
        if (status)
            where.status = status;
        return client_1.default.review.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true } },
                product: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateStatus(id, status) {
        return client_1.default.review.update({
            where: { id },
            data: { status }
        });
    }
}
exports.ReviewsService = ReviewsService;
//# sourceMappingURL=reviews.service.js.map