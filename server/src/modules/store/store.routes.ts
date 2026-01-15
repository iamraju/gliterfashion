import { Router, Request, Response } from 'express';
import { storeService } from './store.service';
import { formatCategoryWithImage, formatProductWithImages, getFullImageUrl } from '../../common/utils/image';

const router = Router();

// Get Products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const result = await storeService.getProducts(req.query);
    const formattedData = result.data.map((p: any) => formatProductWithImages(req, p));
    res.json({
      ...result,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Product Details
router.get('/products/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    if (!idOrSlug) {
      res.status(400).json({ error: 'Product ID or slug is required' });
      return;
    }
    const product = await storeService.getProduct(idOrSlug as string);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(formatProductWithImages(req, product));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await storeService.getCategories(req.query);
    const formattedCategories = categories.map((cat: any) => formatCategoryWithImage(req, cat));
    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Brands
router.get('/brands', async (req: Request, res: Response) => {
  try {
    const brands = await storeService.getBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Attributes for filters
router.get('/attributes', async (req: Request, res: Response) => {
  try {
    const attributes = await storeService.getAttributes();
    res.json(attributes);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Shipping Methods
router.get('/shipping-methods', async (req: Request, res: Response) => {
  try {
    const methods = await storeService.getShippingMethods();
    const formatted = methods.map((m: any) => ({
      ...m,
      imageUrl: getFullImageUrl(req, m.imageUrl)
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Payment Methods
router.get('/payment-methods', async (req: Request, res: Response) => {
  try {
    const methods = await storeService.getPaymentMethods();
    const formatted = methods.map((m: any) => ({
      ...m,
      imageUrl: getFullImageUrl(req, m.imageUrl)
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
