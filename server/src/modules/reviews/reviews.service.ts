
import prisma from '../../database/client';
import { ReviewStatus } from '@prisma/client';

export class ReviewsService {
  async findAll(productId?: string, status?: ReviewStatus) {
    const where: any = {};
    if (productId) where.productId = productId;
    if (status) where.status = status;

    return prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        product: { select: { id: true, name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: ReviewStatus) {
    return prisma.review.update({
        where: { id },
        data: { status }
    });
  }
}
