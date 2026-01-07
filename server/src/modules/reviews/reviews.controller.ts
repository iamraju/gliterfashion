
import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { ReviewStatus } from '@prisma/client';

const reviewsService = new ReviewsService();

export class ReviewsController {
  async getAllReviews(req: Request, res: Response) {
    try {
      const { productId, status } = req.query;
      const reviews = await reviewsService.findAll(
          productId as string, 
          status as ReviewStatus
      );
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateReviewStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Review ID required');
      const { status } = req.body;
      
      if (!Object.values(ReviewStatus).includes(status)) {
           throw new Error('Invalid status');
      }

      const review = await reviewsService.updateStatus(id, status);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
