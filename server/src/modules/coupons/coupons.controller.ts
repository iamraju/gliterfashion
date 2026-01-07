
import { Request, Response } from 'express';
import { CouponsService } from './coupons.service';
import { createCouponSchema, updateCouponSchema } from './dto/coupons.dto';

const couponsService = new CouponsService();

export class CouponsController {
  async getAllCoupons(req: Request, res: Response) {
    try {
       // Filter by seller?
       // If Super Admin -> All
       // If Seller -> His only?
       // Currently strict separation might be needed.
       // User.role logic accessible via req.user
       
       // Just returning all for now as requested "CRUD". Access control in routes.
      const coupons = await couponsService.findAll();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Coupon ID required');
      const coupon = await couponsService.findById(id);
      res.json(coupon);
    } catch (error: any) {
      if (error.message === 'Coupon not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createCoupon(req: Request, res: Response) {
    try {
      const data = createCouponSchema.parse(req.body);
      const coupon = await couponsService.create(data);
      res.status(201).json(coupon);
    } catch (error: any) {
      if (error.constructor.name === "ZodError") {
        const formattedErrors = error.errors.map((err: any) => ({
            path: err.path.join("."),
            message: err.message
         }));
        res.status(400).json({ error: "Validation Error", details: formattedErrors });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async updateCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Coupon ID required');
      const data = updateCouponSchema.parse(req.body);
      const coupon = await couponsService.update(id, data);
      res.json(coupon);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        const formattedErrors = error.errors.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message
         }));
        res.status(400).json({ error: 'Validation Error', details: formattedErrors });
        return;
      }
      if (error.message === 'Coupon not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async deleteCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Coupon ID required');
      await couponsService.delete(id);
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error: any) {
       if (error.message === 'Coupon not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('Cannot delete')) {
          res.status(409).json({ error: error.message });
          return;
      }
      res.status(500).json({ error: error.message });
    }
  }
}
