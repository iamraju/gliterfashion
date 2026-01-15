import { ReviewStatus } from '@prisma/client';
export declare class ReviewsService {
    findAll(productId?: string, status?: ReviewStatus): Promise<({
        user: {
            firstName: string;
            lastName: string;
            id: string;
        };
        product: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        userId: string;
        productId: string;
        orderItemId: string | null;
        rating: number;
        title: string | null;
        comment: string;
        isVerifiedPurchase: boolean;
    })[]>;
    updateStatus(id: string, status: ReviewStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        userId: string;
        productId: string;
        orderItemId: string | null;
        rating: number;
        title: string | null;
        comment: string;
        isVerifiedPurchase: boolean;
    }>;
}
//# sourceMappingURL=reviews.service.d.ts.map