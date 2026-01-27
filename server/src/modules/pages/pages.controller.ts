import { Request, Response } from 'express';
import { PagesService } from './pages.service';

const pagesService = new PagesService();

export class PagesController {
  async create(req: Request, res: Response) {
    try {
      const page = await pagesService.createPage(req.body);
      res.status(201).json(page);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID ID required');
      const page = await pagesService.updatePage(id, req.body);
      res.json(page);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      // If public route access, we might want only active? 
      // Or if backoffice, all.
      // Let's assume query param ?active=true for public
      const onlyActive = req.query.active === 'true';
      const pages = await pagesService.getAllPages(onlyActive);
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      if (!slug) throw new Error('Slug is required');
      const page = await pagesService.getPageBySlug(slug);
      res.json(page);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      const page = await pagesService.getPageById(id);
      res.json(page);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error('ID is required');
      await pagesService.deletePage(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
