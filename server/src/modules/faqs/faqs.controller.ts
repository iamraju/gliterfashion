
import { Request, Response } from 'express';
import { FaqsService } from './faqs.service';

const faqsService = new FaqsService();

export class FaqsController {
  async list(req: Request, res: Response) {
    try {
      const active = req.query.active === 'true';
      const faqs = await faqsService.getAll(active);
      res.json(faqs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      const faq = await faqsService.getById(id);
      if (!faq) return res.status(404).json({ error: 'Not found' });
      res.json(faq);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const faq = await faqsService.create(req.body);
      res.status(201).json(faq);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      const faq = await faqsService.update(id, req.body);
      res.json(faq);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      await faqsService.delete(id);
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
