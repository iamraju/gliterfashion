
import { Request, Response } from 'express';
import { AddressesService } from './addresses.service';
import { createAddressSchema, updateAddressSchema } from './dto/address.dto';

const addressesService = new AddressesService();

export class AddressesController {
  async getAddresses(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id as string;
      const addresses = await addressesService.findAll(userId);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id as string;
      const data = createAddressSchema.parse(req.body);
      const address = await addressesService.create(userId, data);
      res.status(201).json(address);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id as string;
      const id = req.params.id as string;
      const data = updateAddressSchema.parse(req.body);
      const address = await addressesService.update(id, userId, data);
      res.json(address);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error.message === 'Address not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id as string;
      const id = req.params.id as string;
      await addressesService.delete(id, userId);
      res.json({ message: 'Address deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Address not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async setDefault(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id as string;
      const id = req.params.id as string;
      const address = await addressesService.setDefault(id, userId);
      res.json(address);
    } catch (error: any) {
      if (error.message === 'Address not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }
}
