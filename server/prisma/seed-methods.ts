import 'dotenv/config';
import prisma from '../src/database/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Helper to ensure image exists locally (Moved from seed.ts)
async function ensureImage(url: string, targetDir: string, filename: string): Promise<string> {
  const uploadDir = path.join(__dirname, '../uploads');
  const targetPath = path.join(uploadDir, targetDir);
  const filePath = path.join(targetPath, filename);
  const relativePath = path.join(targetDir, filename);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    return relativePath;
  }

  try {
    console.log(`Downloading image: ${url} -> ${relativePath}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error: Error | null = null;
      writer.on('error', (err: any) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(relativePath);
        }
      });
    });
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error);
    return ''; // Return empty string or handle error as needed
  }
}

const shippingMethods = [
  {
    title: 'Standard Delivery',
    charge: 5.00,
    deliveryTimeDays: 5,
    description: 'Delivery within 5-7 business days.',
    isActive: true,
  },
  {
    title: 'Express Delivery',
    charge: 15.00,
    deliveryTimeDays: 2,
    description: 'Delivery within 1-2 business days.',
    isActive: true,
  },
  {
    title: 'Local Pickup',
    charge: 0,
    deliveryTimeDays: 1,
    description: 'Pick up from our store.',
    isActive: true,
  },
  { 
    title: 'Nepal Can Move', 
    charge: 80, 
    deliveryTimeDays: 1, 
    description: 'Fast delivery with Nepal Can Move', 
    isActive: true 
  },
  { 
    title: 'Pathao', 
    charge: 100, 
    deliveryTimeDays: 0, 
    deliveryTimeHours: 12, 
    description: 'Same day delivery via Pathao', 
    isActive: true 
  },
];

const paymentMethods = [
  {
    title: 'Credit Card',
    charge: 0,
    description: 'Pay securely with your credit card.',
    imageUrl: 'https://placehold.co/400x300/png?text=Credit+Card',
    filename: 'credit-card.png',
    isActive: true,
  },
  {
    title: 'PayPal',
    charge: 0,
    description: 'Pay with your PayPal account.',
    imageUrl: 'https://placehold.co/400x300/png?text=PayPal',
    filename: 'paypal.png',
    isActive: true,
  },
  {
    title: 'Cash on Delivery',
    charge: 0,
    description: 'Pay with cash upon delivery.',
    imageUrl: 'https://placehold.co/400x300/png?text=COD',
    filename: 'cod.png',
    isActive: true,
  },
  { 
    title: 'Esewa', 
    charge: 5, 
    description: 'Pay via Esewa wallet',
    imageUrl: 'https://placehold.co/400x300/png?text=Esewa',
    filename: 'esewa.png',
    isActive: true,
  },
  { 
    title: 'Khalti', 
    charge: 5, 
    description: 'Pay via Khalti wallet',
    imageUrl: 'https://placehold.co/400x300/png?text=Khalti',
    filename: 'khalti.png',
    isActive: true,
  },
  { 
    title: 'Bank Transfer', 
    charge: 0, 
    description: 'Direct bank transfer',
    imageUrl: 'https://placehold.co/400x300/png?text=Bank',
    filename: 'bank.png',
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Seeding shipping methods...');
  for (const method of shippingMethods) {
    const existing = await prisma.shippingMethod.findFirst({
      where: { title: method.title }
    });

    if (existing) {
      await prisma.shippingMethod.update({
        where: { id: existing.id },
        data: {
          charge: method.charge,
          deliveryTimeDays: method.deliveryTimeDays,
          deliveryTimeHours: (method as any).deliveryTimeHours, // Allow optional
          description: method.description,
          isActive: method.isActive,
        }
      });
    } else {
      await prisma.shippingMethod.create({
        data: {
          title: method.title,
          charge: method.charge,
          deliveryTimeDays: method.deliveryTimeDays,
          deliveryTimeHours: (method as any).deliveryTimeHours,
          description: method.description,
          isActive: method.isActive,
        }
      });
    }
  }

  console.log('🌱 Seeding payment methods...');
  for (const method of paymentMethods) {
    let relativePath = null;
    if (method.imageUrl && method.filename) {
        relativePath = await ensureImage(method.imageUrl, 'payment-methods', method.filename);
    }
    
    const existing = await prisma.paymentMethod.findFirst({
      where: { title: method.title }
    });

    if (existing) {
      await prisma.paymentMethod.update({
        where: { id: existing.id },
        data: {
          charge: method.charge,
          description: method.description,
          imageUrl: relativePath || existing.imageUrl,
          isActive: method.isActive,
        }
      });
    } else {
      await prisma.paymentMethod.create({
        data: {
          title: method.title,
          charge: method.charge,
          description: method.description,
          imageUrl: relativePath,
          isActive: method.isActive,
        }
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
