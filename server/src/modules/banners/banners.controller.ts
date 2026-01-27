import { Request, Response } from 'express';
import { BannersService } from './banners.service';

const bannersService = new BannersService();

export class BannersController {
  async getAllBanners(req: Request, res: Response) {
    try {
      const banners = await bannersService.findAll();
      res.json(banners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getBanner(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) {
        return res.status(400).json({ message: 'Banner ID is required' });
      }
      const banner = await bannersService.findById(id);
      res.json(banner);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async createBanner(req: Request, res: Response) {
    try {
      const banner = await bannersService.create(req.body);
      res.status(201).json(banner);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateBanner(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) {
        return res.status(400).json({ message: 'Banner ID is required' });
      }
      const banner = await bannersService.update(id, req.body);
      res.json(banner);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteBanner(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) {
        return res.status(400).json({ message: 'Banner ID is required' });
      }
      await bannersService.delete(id);
      res.json({ message: 'Banner deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
