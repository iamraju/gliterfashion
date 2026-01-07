
import { Request, Response } from 'express';
import { AttributesService } from './attributes.service';
import { createAttributeSchema, updateAttributeSchema } from './dto/attributes.dto';

const attributesService = new AttributesService();

export class AttributesController {
  async getAllAttributes(req: Request, res: Response) {
    try {
      const attributes = await attributesService.findAll();
      res.json(attributes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAttribute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Attribute ID required');
      const attribute = await attributesService.findById(id);
      res.json(attribute);
    } catch (error: any) {
      if (error.message === 'Attribute not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createAttribute(req: Request, res: Response) {
    try {
      const data = createAttributeSchema.parse(req.body);
      const attribute = await attributesService.create(data);
      res.status(201).json(attribute);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  async updateAttribute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Attribute ID required');
      const data = updateAttributeSchema.parse(req.body);
      const attribute = await attributesService.update(id, data);
      res.json(attribute);
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error.message === 'Attribute not found') {
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

  async deleteAttribute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Attribute ID required');
      await attributesService.delete(id);
      res.status(200).json({ message: 'Attribute deleted successfully' });
    } catch (error: any) {
       if (error.message === 'Attribute not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }
}
