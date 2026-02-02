
import 'dotenv/config';
import { ProductStatus } from '@prisma/client';
import prisma from '../src/database/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// const prisma = new PrismaClient();

// Helper: Ensure image exists locally
async function ensureImage(url: string, targetDir: string, filename: string): Promise<string> {
  const uploadDir = path.join(__dirname, '../public/uploads'); // Changed to public/uploads to serve directly? Or assuming uploads is served.
  // Check where uploads are served from. Usually 'uploads' at root or 'public/uploads'. 
  // Previous `seed.ts` used `../uploads`. User probably mapped it. 
  // Let's stick to `../uploads` but verify server config later.
  
  // Reverting to `../uploads` based on `seed.ts`
  const finalUploadDir = path.join(__dirname, '../uploads');
  const targetPath = path.join(finalUploadDir, targetDir);
  const filePath = path.join(targetPath, filename);
  const relativePath = path.join(targetDir, filename);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(`Image already exists: ${relativePath}`);
    return relativePath; // Return relative path for DB
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
    return ''; // Handle gracefully
  }
}

async function main() {
  console.log('Seeding Products with Images...');

  const seller = await prisma.seller.findFirst();
  if (!seller) {
    console.error('No seller found. Run seed.ts first.');
    return;
  }

  // --- ATTRIBUTES --
  const sizeAttr = await prisma.attribute.findUnique({ where: { slug: 'size' }, include: { values: true } });
  const colorAttr = await prisma.attribute.findUnique({ where: { slug: 'color' }, include: { values: true } });

  if (!sizeAttr || !colorAttr) {
    console.error('Attributes not found. Run seed.ts first.');
    return;
  }

  const getAttrValId = (attr: any, val: string) => {
    const found = attr.values.find((v: any) => v.value === val);
    return found ? found.id : null;
  };

  // --- CATEGORIES ---
  const cats = await prisma.category.findMany();
  const getCatId = (slug: string) => cats.find(c => c.slug === slug)?.id;

  // PRODUCT HELPER
  const createProduct = async (
    name: string, 
    slug: string, 
    catSlug: string, 
    basePrice: number, 
    baseSku: string, 
    imageUrl: string, // External URL
    imageFilename: string,
    variantsConfig: { size: string, color: string, qty: number }[]
  ) => {
    const catId = getCatId(catSlug);
    if (!catId) {
      console.warn(`Category ${catSlug} not found, skipping ${name}`);
      return;
    }

    // 1. Download Image
    const localImagePath = await ensureImage(imageUrl, 'products', imageFilename);
    if (!localImagePath) {
        console.warn(`Could not download image for ${name}, creating without image.`);
    }

    const productCreateData: any = {
        name,
        slug,
        description: `This is a premium ${name.toLowerCase()}. Crafted with care for style and comfort.`,
        basePrice,
        sku: baseSku,
        status: ProductStatus.ACTIVE,
        categoryId: catId,
        sellerId: seller.id,
        isFeatured: Math.random() < 0.3,
    };

    if (localImagePath) {
        productCreateData.images = {
            create: [{ imageUrl: localImagePath, isPrimary: true, sortOrder: 1 }],
        };
    }

    const product = await prisma.product.upsert({
      where: { slug },
      update: { categoryId: catId, basePrice, status: ProductStatus.ACTIVE },
      create: productCreateData,
    });

    // VARIANTS
    for (const v of variantsConfig) {
      const vSku = `${baseSku}-${v.size}-${v.color.substring(0, 3).toUpperCase()}`;
      const sizeId = getAttrValId(sizeAttr, v.size);
      const colorId = getAttrValId(colorAttr, v.color);

      if (sizeId && colorId) {
        await prisma.productVariant.upsert({
          where: { sku: vSku },
          update: {},
          create: {
            productId: product.id,
            sku: vSku,
            price: basePrice,
            stockQuantity: v.qty,
            productVariantAttribute: {
              create: [
                { attribute: { connect: { id: sizeAttr.id } }, attributeValue: { connect: { id: sizeId } } },
                { attribute: { connect: { id: colorAttr.id } }, attributeValue: { connect: { id: colorId } } },
              ]
            }
          }
        });
      }
    }
    console.log(`Created/Updated: ${name}`);
  };

  // --- DEFINING PRODUCTS WITH REAL IMAGE URLS ---
  // Using reliable Unsplash IDs
  
  // MEN
  await createProduct('Classic White Tee', 'classic-white-tee', 'men-tshirts', 25.00, 'M-TEE-001', 
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'men_white_tee.jpg', 
    [{ size: 'S', color: 'Snow White', qty: 20 }, { size: 'M', color: 'Snow White', qty: 30 }, { size: 'L', color: 'Snow White', qty: 25 }]
  );

  await createProduct('Urban Denim Jacket', 'urban-denim-jacket', 'men-jackets', 89.99, 'M-JKT-001', 
    'https://images.unsplash.com/photo-1523205565295-f8e91625443b?w=800', 'men_denim_jacket.jpg',
    [{ size: 'M', color: 'Royal Blue', qty: 10 }, { size: 'L', color: 'Royal Blue', qty: 15 }]
  );

  await createProduct('Slim Fit Chinos', 'slim-fit-chinos', 'men-jeans', 45.00, 'M-PNT-001',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', 'men_chinos.jpg',
    [{ size: '30', color: 'Slate Grey', qty: 20 }, { size: '32', color: 'Slate Grey', qty: 25 }, { size: '34', color: 'Slate Grey', qty: 20 }]
  );

  // WOMEN
  await createProduct('Summer Floral Dress', 'summer-floral-dress', 'women-dresses', 55.00, 'W-DRS-001',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', 'women_floral_dress.jpg',
    [{ size: 'S', color: 'Ruby Red', qty: 15 }, { size: 'M', color: 'Ruby Red', qty: 20 }]
  );

  await createProduct('Silk Blouse', 'silk-blouse', 'women-tops', 45.00, 'W-TOP-001',
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800', 'women_silk_blouse.jpg',
    [{ size: 'S', color: 'Snow White', qty: 10 }, { size: 'M', color: 'Snow White', qty: 15 }]
  );

  // ACCESSORIES
  await createProduct('Canvas Tote Bag', 'canvas-tote', 'bags', 20.00, 'U-BAG-001',
    'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800', 'tote_bag.jpg',
    [{ size: 'M', color: 'Forest Green', qty: 50 }]
  );
  
  await createProduct('Classic Sunglasses', 'classic-sunglasses', 'accessories', 15.00, 'U-ACC-001',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', 'sunglasses.jpg',
    [{ size: 'M', color: 'Midnight Black', qty: 100 }]
  );

  console.log('Product Seeding Done.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

