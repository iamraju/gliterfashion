import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';

const wishlistService = new WishlistService();

export class WishlistController {
  async getWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const items = await wishlistService.getWishlist(userId);
      res.json(items);
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({ message: 'Failed to fetch wishlist' });
    }
  }

  async addToWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { productId } = req.body;
      
      if (!productId) {
         return res.status(400).json({ message: 'Product ID is required' });
      }

      const item = await wishlistService.addToWishlist(userId, productId);
      res.json(item);
    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({ message: 'Failed to add to wishlist' });
    }
  }

  async removeFromWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      await wishlistService.removeFromWishlist(userId, productId);
      res.status(200).json({ message: 'Removed from wishlist' });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
  }
}
