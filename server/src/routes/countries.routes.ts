import { Router } from 'express';
import prisma from '../database/client';

const router = Router();

// Get all active countries
router.get('/', async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        code3: true
      }
    });
    res.json(countries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
