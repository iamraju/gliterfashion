
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import prisma from '../src/database/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// const prisma = new PrismaClient();

// Reuse ensureImage logic (duplicated for standalone running, or could import utils if structured)
async function ensureImage(url: string, targetDir: string, filename: string): Promise<string> {
  const uploadDir = path.join(__dirname, '../uploads');
  const targetPath = path.join(uploadDir, targetDir);
  const filePath = path.join(targetPath, filename);
  const relativePath = path.join(targetDir, filename);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(`Image already exists: ${relativePath}`);
    return relativePath;
  }

  try {
    console.log(`Downloading: ${url} -> ${relativePath}`);
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
  } catch (error: any) {
    console.error(`Failed to download ${url}:`, error.message);
    return '';
  }
}

async function main() {
  console.log('Seeding Banners...');

  const banners = [
    {
      title: 'New Collection 2026',
      subtitle: 'Discover the latest trends',
      link: '/products/mens-fashion',
      buttonText: 'Shop Now',
      align: 'left',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
      filename: 'hero_fashion_1.jpg',
      sortOrder: 1
    },
    {
      title: 'Summer Sale',
      subtitle: 'Up to 50% Off on Women\'s Wear',
      link: '/products/womens-fashion',
      buttonText: 'View Offers',
      align: 'right',
      imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',
      filename: 'hero_fashion_2.jpg',
      sortOrder: 2
    }
  ];

  for (const b of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } });
    if (existing) {
        console.log(`Banner already exists: ${b.title}`);
        continue;
    }

    const localPath = await ensureImage(b.imageUrl, 'banners', b.filename);
    
    if (localPath) {
        await prisma.banner.create({
            data: {
                title: b.title,
                subtitle: b.subtitle,
                imageUrl: localPath,
                link: b.link,
                buttonText: b.buttonText,
                align: b.align,
                sortOrder: b.sortOrder,
                isActive: true
            }
        }); 
        console.log(`Created banner: ${b.title}`);
    } else {
        console.warn(`Skipping banner ${b.title} due to image download failure.`);
    }
  }

  console.log('Banners Seeding Done.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
