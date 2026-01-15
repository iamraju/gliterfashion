import { Router, Request, Response } from 'express';
import { brandsService } from './brands.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { formatBrandWithLogo } from '../../common/utils/image';

const router = Router();

// Get All Brands
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'SELLER']), async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is attached by middleware
    const { role, id: userId, sellerProfile } = req.user;
    const sellerId = sellerProfile?.id;

    const brands = await brandsService.findAll(role, sellerId);
    const formattedBrands = brands.map(brand => formatBrandWithLogo(req, brand));
    res.json(formattedBrands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Brand by ID
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'SELLER']), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Brand ID is required' });

    const brand = await brandsService.findById(id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(formatBrandWithLogo(req, brand));
  } catch (error) {
     res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Brand
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'SELLER']), async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { role, sellerProfile } = req.user;
    
    // Admins create Global Brands (sellerId = null)
    // Sellers create Private Brands (sellerId = their id)
    const sellerId = role === 'SELLER' ? sellerProfile?.id : undefined;

    const brand = await brandsService.create({
      ...req.body,
      sellerId
    });
    res.status(201).json(formatBrandWithLogo(req, brand));
  } catch (error: any) {
    console.error('Error creating brand:', error);
    if (error.code === 'P2002') { // Unique constraint
        return res.status(400).json({ message: 'Brand with this name already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Brand
router.patch('/:id', authenticate, authorize(['SUPER_ADMIN', 'SELLER']), async (req: Request, res: Response) => {
  try {
     // @ts-ignore
     const { role, sellerProfile } = req.user;
     const sellerId = sellerProfile?.id;
     const id = req.params.id;
     if (!id) return res.status(400).json({ message: 'Brand ID is required' });

     const brand = await brandsService.update(id, req.body, role, sellerId);
     res.json(formatBrandWithLogo(req, brand));
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
});

// Delete Brand
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'SELLER']), async (req: Request, res: Response) => {
  try {
      // @ts-ignore
     const { role, sellerProfile } = req.user;
     const sellerId = sellerProfile?.id;
     const id = req.params.id;
     if (!id) return res.status(400).json({ message: 'Brand ID is required' });

     await brandsService.delete(id, role, sellerId);
     res.json({ message: 'Brand deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
