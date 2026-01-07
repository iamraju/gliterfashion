import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { CategoriesService } from './categories.service';
import { createCategorySchema, updateCategorySchema } from './dto/categories.dto';
import { formatCategoryWithImage } from '../../common/utils/image';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await categoriesService.findAll();
      const formattedCategories = categories.map(cat => formatCategoryWithImage(req, cat));
      res.json(formattedCategories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Category ID required');
      const category = await categoriesService.findById(id);
      res.json(formatCategoryWithImage(req, category));
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const bodyData = { ...req.body };
      if (req.file) {
        bodyData.imageUrl = req.file.filename;
      }
      const data = createCategorySchema.parse(bodyData);
      const category = await categoriesService.create(data);
      res.status(201).json(formatCategoryWithImage(req, category));
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = (error.issues || []).map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        res.status(400).json({ 
          error: 'Validation failed', 
          details: formattedErrors 
        });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Category ID required');
      
      const bodyData = { ...req.body };
      if (req.file) {
        bodyData.imageUrl = req.file.filename;
      }
      
      const data = updateCategorySchema.parse(bodyData);
      const category = await categoriesService.update(id, data);
      res.json(formatCategoryWithImage(req, category));
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = (error.issues || []).map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        res.status(400).json({ 
          error: 'Validation failed', 
          details: formattedErrors 
        });
        return;
      }
      if (error.message === 'Category not found') {
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

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Category ID required');
      await categoriesService.delete(id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error: any) {
       if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      // Conflict if has children/products
      if (error.message.includes('Cannot delete')) {
          res.status(409).json({ error: error.message });
          return;
      }
      res.status(500).json({ error: error.message });
    }
  }
}
