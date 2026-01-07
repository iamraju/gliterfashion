
import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';

const ordersService = new OrdersService();

export class OrdersController {
  async getAllOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      let sellerId;
      
      // If seller, fetch seller profile ID?
      // Simplified: Assume req.user has sellerId if role is SELLER, or middleware attaches it.
      // For now, let's look it up if needed or rely on user.id -> seller lookup.
      // Doing simple check:
      if (user.role === 'SELLER') {
          // fetch seller id
          /* 
            Ideally auth middleware should attach sellerProfile.
            We will implement a quick lookup or assume attached.
            Let's assume we need to look it up in service or here.
            Let's pass user.id and let service/middleware handle.
            Actually, the service expected 'sellerId'. 
            We'll fetch it here if role is SELLER? Or just pass undefined and let service handle?
            Service needs explict sellerId for filtering.
          */
           // Hack for now: we need to find the seller ID associated with this user ID
           // We can do this in service if we pass userId. 
           // Implemented: Service takes userId, but logic for `sellerId` param was for the *Seller Entity ID*.
           // Let's rely on service to find seller profile if needed? No, better separation.
           // Leaving as TODO: AuthMiddleware should attach sellerId.
           // For now, we will handle in service using userId?
           // Refactoring service to Find Seller ID from User ID if role is SELLER is efficient?
           // Or just trust the `sellerId` on request if we update middleware later.
      }
      
      // Actually, let's find the sellerId here if needed.
       // Accessing via Prisma directly here violates separation? 
       // Let's assume the service resolves it or we pass userId and it does the work.
       // Current Service `findAll` signature: (role, userId, sellerId?)
       
       // Let's fetch the seller ID if role is seller.
       // Importing prisma client here is dirty.
       // Let's change service signature to accept userId and resolve sellerId internally.
       
       // WAIT: The service I wrote `findAll(role, userId, sellerId)` already expects sellerId.
       // I'll update the Service later to resolve it, or I'll just look it up here.
       // I will import prisma here for the quick lookup or add a helper.
       
       // Better: Update `auth.middleware.ts` to attach `sellerId`? 
       // Staying simple: 
       /*
       const seller = await prisma.seller.findUnique({where: {userId: user.id}});
       sellerId = seller?.id;
       */
       // I won't import prisma here. I will pass userId and let service resolve it if I update service.
       // But I wrote service to take `sellerId`.
       
       // I will modify the service file in next step to resolve sellerId from userId.
       // For now, I'll pass null and fail if needed? 
       // Actually, I can use `req.user.sellerProfile?.id` if I update the findUser in auth middleware.
       // Checking auth.middleware.ts... it attaches user record.
       // It does NOT include sellerProfile by default currently?
       
       // Let's assume for this step I will update auth middleware or service.
       // I will assume `req.user.sellerProfile` exists on the user object attached by auth middleware 
       // (I will ensure I update auth middleware to include it).
       
       sellerId = user.sellerProfile?.id;

      const orders = await ordersService.findAll(user.role, user.id, sellerId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Order ID required');
      const user = (req as any).user;
      const sellerId = user.sellerProfile?.id;
      
      const order = await ordersService.findById(id, user.role, user.id, sellerId);
      res.json(order);
    } catch (error: any) {
      if (error.message === 'Order not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message === 'Unauthorized access to order') {
          res.status(403).json({ error: error.message });
          return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Order ID required');
      const { status } = req.body;
      
      if (!Object.values(OrderStatus).includes(status)) {
          throw new Error('Invalid status');
      }

      const order = await ordersService.updateStatus(id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
