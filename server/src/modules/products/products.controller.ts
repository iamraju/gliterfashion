
import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { createProductSchema, updateProductSchema } from './dto/products.dto';
import prisma from '../../database/client';
import { formatProductWithImages } from '../../common/utils/image';

const productsService = new ProductsService();

export class ProductsController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await productsService.findAll();
      const formattedProducts = products.map(product => formatProductWithImages(req, product));
      res.json(formattedProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Product ID required');
      const product = await productsService.findById(id);
      res.json(formatProductWithImages(req, product));
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      // 1. Get User
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const bodyData = { ...req.body };
      
      // 2. Inject Seller ID if user has a seller profile
      const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
      if (seller) {
        bodyData.sellerId = seller.id;
      } else {
        // Super admin or user without seller profile - sellerId will be null
        bodyData.sellerId = null;
      }

      // 3. Auto-generate Slug from Name if missing
      if (!bodyData.slug && bodyData.name) {
        bodyData.slug = bodyData.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // 4. Parse numeric fields from multipart body
      if (bodyData.basePrice) bodyData.basePrice = parseFloat(bodyData.basePrice);
      if (bodyData.salePrice) bodyData.salePrice = parseFloat(bodyData.salePrice);
      
      // Handle weight: allow empty string to be null
      if (bodyData.weight === '' || bodyData.weight === null || bodyData.weight === undefined || bodyData.weight === 'null') {
        bodyData.weight = null;
      } else {
        bodyData.weight = parseFloat(bodyData.weight);
      }
      
      // 5. Handle variants if sent as JSON string
      if (typeof bodyData.variants === 'string') {
        try {
          bodyData.variants = JSON.parse(bodyData.variants);
        } catch (e) {
          res.status(400).json({ error: 'Invalid variants JSON format', details: e });
          return;
        }
      }

      // 6. Handle images from req.files and combined metadata
      let images = [];
      if (typeof bodyData.images === 'string') {
          images = JSON.parse(bodyData.images);
      }
      
      const files = req.files as Express.Multer.File[];
      const imageMetadata = bodyData.imageMetadata ? JSON.parse(bodyData.imageMetadata) : [];
      
      if (files && files.length > 0) {
        const newImages = files.map((file, index) => {
          const metadata = imageMetadata[index] || {};
          return {
            imageUrl: file.filename,
            isPrimary: metadata.isPrimary ?? (images.length === 0 && index === 0),
            sortOrder: images.length + index,
            attributeValueId: metadata.attributeValueId || null
          };
        });
        images = [...images, ...newImages];
      }
      bodyData.images = images;

      const data = createProductSchema.parse(bodyData);
      const product = await productsService.create(data);
      res.status(201).json(formatProductWithImages(req, product));
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        // Return structured validation errors
        const formattedErrors = error.errors.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message
         }));
        res.status(400).json({ error: 'Validation Error', details: formattedErrors });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error('Create Product Error:', error);
      res.status(400).json({ message: error.message, error: error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Product ID required');

      const bodyData = { ...req.body };
      
      // Parse numeric fields
      if (bodyData.basePrice) bodyData.basePrice = parseFloat(bodyData.basePrice);
      if (bodyData.salePrice) bodyData.salePrice = parseFloat(bodyData.salePrice);
      if (bodyData.weight) bodyData.weight = parseFloat(bodyData.weight);

      // Handle variants if sent as JSON string
      if (typeof bodyData.variants === 'string') {
        try {
          bodyData.variants = JSON.parse(bodyData.variants);
        } catch (e) {
          res.status(400).json({ error: 'Invalid variants JSON format', details: e });
          return;
        }
      }

      // Handle images if any
      let images = [];
      if (typeof bodyData.images === 'string') {
          images = JSON.parse(bodyData.images);
      }

      const files = req.files as Express.Multer.File[];
      const imageMetadata = bodyData.imageMetadata ? JSON.parse(bodyData.imageMetadata) : [];

      if (files && files.length > 0) {
        const newImages = files.map((file, index) => {
          const metadata = imageMetadata[index] || {};
          return {
            imageUrl: file.filename,
            isPrimary: metadata.isPrimary ?? (images.length === 0 && index === 0),
            sortOrder: images.length + index,
            attributeValueId: metadata.attributeValueId || null
          };
        });
        images = [...images, ...newImages];
      }
      bodyData.images = images;

      const data = updateProductSchema.parse(bodyData);
      const product = await productsService.update(id, data);
      res.json(formatProductWithImages(req, product));
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
        return;
      }
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('Duplicate')) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Update Product Error:', error);
      res.status(400).json({ message: error.message, error: error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) throw new Error('Product ID required');
      await productsService.delete(id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error: any) {
       if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }
}
