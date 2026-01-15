import { Request, Response } from 'express';
import { cartService } from './cart.service';
import { formatCartWithImages } from '../../common/utils/image';

export class CartController {
  async getCart(req: Request, res: Response) {
    try {
      const sessionId = req.query.sessionId as string | undefined;
      const userId = (req as any).user?.id;
      
      const cart = await cartService.getCart(userId, sessionId);
      res.json(formatCartWithImages(req, cart || { items: [] }));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const { variantId, quantity, sessionId } = req.body;
      const userId = (req as any).user?.id;

      let cart = await cartService.getCart(userId, sessionId);
      if (!cart) {
        if (!sessionId && !userId) {
          res.status(400).json({ error: 'Session ID or User ID required' });
          return;
        }
        cart = await cartService.createCart(userId, sessionId);
      }

      if (!cart) {
        res.status(500).json({ error: 'Failed to create cart' });
        return;
      }

      const item = await cartService.addItem(cart.id, variantId, quantity);
      // For addItem, we return the item, but usually we might want to return the whole cart or formatted item
      // Let's just return the item for now as previously, but if we need images we'd need to fetch or format
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      if (!id) {
        res.status(400).json({ error: 'Item ID is required' });
        return;
      }
      const item = await cartService.updateItem(id, quantity);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Item ID is required' });
        return;
      }
      await cartService.removeItem(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async applyCoupon(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { code, sessionId } = req.body;

      if (!code) throw new Error('Coupon code required');

      const cart = await cartService.getCart(userId, sessionId);
      if (!cart) throw new Error('Cart not found');

      const coupon = await cartService.applyCoupon(cart.id, code);
      res.json({ message: 'Coupon applied successfully', coupon });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeCoupon(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { sessionId } = req.body;

      const cart = await cartService.getCart(userId, sessionId);
      if (!cart) throw new Error('Cart not found');

      await cartService.removeCoupon(cart.id);
      res.json({ message: 'Coupon removed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const cartController = new CartController();
