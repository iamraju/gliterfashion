
import { Request, Response } from 'express';
import { TestimonialsService } from './testimonials.service';

const service = new TestimonialsService();

export class TestimonialsController {
  async list(req: Request, res: Response) {
    try {
      const active = req.query.active === 'true';
      const items = await service.getAll(active);
      
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
      const itemsWithUrl = items.map(item => ({
        ...item,
        imageUrl: item.imageUrl && !item.imageUrl.startsWith('http') 
          ? `${baseUrl}${item.imageUrl}` 
          : item.imageUrl
      }));

      res.json(itemsWithUrl);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      const item = await service.getById(id);
      if (!item) return res.status(404).json({ error: 'Not found' });

      if (item.imageUrl && !item.imageUrl.startsWith('http')) {
        const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
        item.imageUrl = `${baseUrl}${item.imageUrl}`;
      }

      res.json(item);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      const item = await service.update(id, req.body);
      res.json(item);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      await service.delete(id);
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
