
import 'dotenv/config';
import { Role, UserStatus, ProductStatus, CategoryGender } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/database/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Helper to ensure image exists locally
async function ensureImage(url: string, targetDir: string, filename: string): Promise<string> {
  const uploadDir = path.join(__dirname, '../uploads');
  const targetPath = path.join(uploadDir, targetDir);
  const filePath = path.join(targetPath, filename);
  const relativePath = path.join(targetDir, filename);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    // console.log(`Image already exists: ${relativePath}`);
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
      writer.on('error', (err) => {
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

async function main() {
  console.log('Seeding database with comprehensive test data...');

  // 1. Admin User
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@glitter.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Admin user created/updated');

  // 2. Attributes and Values
  // Create Attributes first
  const sizeAttr = await prisma.attribute.upsert({
    where: { slug: 'size' },
    update: {},
    create: { name: 'Size', slug: 'size' },
  });

  const colorAttr = await prisma.attribute.upsert({
    where: { slug: 'color' },
    update: {},
    create: { name: 'Color', slug: 'color' },
  });

  // Helper to ensure values exist
  const ensureAttributeValues = async (attrId: string, values: string[]) => {
    for (const val of values) {
      const exists = await prisma.attributeValue.findFirst({
        where: { attributeId: attrId, value: val }
      });
      if (!exists) {
        await prisma.attributeValue.create({
          data: { attributeId: attrId, value: val }
        });
      }
    }
  };

  const sizeValues = ['XS', 'S', 'M', 'L', 'XL', '28', '30', '32', '34', '36', '6', '7', '8', '9', '10'];
  await ensureAttributeValues(sizeAttr.id, sizeValues);

  const colorValues = ['Midnight Black', 'Royal Blue', 'Ruby Red', 'Snow White', 'Forest Green', 'Slate Grey', 'Gold', 'Silver'];
  await ensureAttributeValues(colorAttr.id, colorValues);

  console.log('Attributes and values created/updated');

  // Fetch updated attributes with values for lookups
  const sizeAttrWithValues = await prisma.attribute.findUniqueOrThrow({
    where: { id: sizeAttr.id },
    include: { values: true }
  });

  const colorAttrWithValues = await prisma.attribute.findUniqueOrThrow({
    where: { id: colorAttr.id },
    include: { values: true }
  });

  const getAttrValId = (attr: any, val: string) => {
    const found = attr.values.find((v: any) => v.value === val);
    if (!found) throw new Error(`Attribute value '${val}' not found for attribute '${attr.name}'`);
    return found.id;
  };

  // 3. Categories
  // Parent Categories
  const menCat = await prisma.category.upsert({
    where: { slug: 'mens-fashion' },
    update: { showInNavBar: true, showInHomePage: true, isActive: true },
    create: {
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Trendsetting styles for men',
      gender: CategoryGender.MEN,
      showInNavBar: true,
      showInHomePage: true,
      sortOrder: 1,
    },
  });

  const womenCat = await prisma.category.upsert({
    where: { slug: 'womens-fashion' },
    update: { showInNavBar: true, showInHomePage: true, isActive: true },
    create: {
      name: "Women's Fashion",
      slug: 'womens-fashion',
      description: 'Elegant and contemporary styles for women',
      gender: CategoryGender.WOMEN,
      showInNavBar: true,
      showInHomePage: true,
      sortOrder: 2,
    },
  });

  const unisexCat = await prisma.category.upsert({
    where: { slug: 'unisex-collections' },
    update: { showInNavBar: true, showInHomePage: false, isActive: true },
    create: {
      name: "Unisex Collections",
      slug: 'unisex-collections',
      description: 'Styles for everyone',
      gender: CategoryGender.UNISEX,
      showInNavBar: true,
      showInHomePage: false,
      sortOrder: 3,
    },
  });

  // Sub Categories
  const createSubCat = async (parent: any, name: string, slug: string, nav = false) => {
    return prisma.category.upsert({
      where: { slug },
      update: { parentId: parent.id, showInHomePage: true },
      create: {
        name,
        slug,
        parentId: parent.id,
        gender: parent.gender,
        showInNavBar: nav,
        showInHomePage: true,
        isActive: true,
      },
    });
  };

  const menTshirts = await createSubCat(menCat, 'T-Shirts', 'men-tshirts');
  const menJeans = await createSubCat(menCat, 'Jeans', 'men-jeans');
  const menJackets = await createSubCat(menCat, 'Jackets', 'men-jackets');
  const menShoes = await createSubCat(menCat, 'Shoes', 'men-shoes');

  const womenDresses = await createSubCat(womenCat, 'Dresses', 'women-dresses');
  const womenTops = await createSubCat(womenCat, 'Tops', 'women-tops');
  const womenSkirts = await createSubCat(womenCat, 'Skirts', 'women-skirts');
  const womenHeels = await createSubCat(womenCat, 'Heels', 'women-heels');

  const accessories = await createSubCat(unisexCat, 'Accessories', 'accessories', true);
  const bags = await createSubCat(unisexCat, 'Bags', 'bags');

  console.log('Categories created');

  // 4. Seller Profile
  const seller = await prisma.seller.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      companyName: 'Glitter Boutique',
      streetAddress: '123 Fashion Ave',
      city: 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal',
    },
  });

  // 5. Products
  const createProduct = async (
    name: string, 
    slug: string, 
    catId: string, 
    basePrice: number, 
    baseSku: string, 
    imageName: string,
    variantsConfig: { size: string, color: string, qty: number }[]
  ) => {
    const product = await prisma.product.upsert({
      where: { slug },
      update: { 
        categoryId: catId, 
        basePrice, 
        status: ProductStatus.ACTIVE,
        // isFeatured: Math.random() < 0.3 
      },
      create: {
        name,
        slug,
        description: `This is a premium ${name.toLowerCase()}. Crafted with care for style and comfort.`,
        basePrice,
        sku: baseSku,
        status: ProductStatus.ACTIVE,
        categoryId: catId,
        sellerId: seller.id,
        isFeatured: Math.random() < 0.3,
        images: {
          create: [{ imageUrl: imageName, isPrimary: true, sortOrder: 1 }],
        },
      },
    });

    // Create Variants
    for (const v of variantsConfig) {
      const vSku = `${baseSku}-${v.size}-${v.color.substring(0, 3).toUpperCase()}`;
      
      const sizeId = getAttrValId(sizeAttrWithValues, v.size);
      const colorId = getAttrValId(colorAttrWithValues, v.color);

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
              { 
                attribute: { connect: { id: sizeAttr.id } }, 
                attributeValue: { connect: { id: sizeId } } 
              },
              { 
                attribute: { connect: { id: colorAttr.id } }, 
                attributeValue: { connect: { id: colorId } } 
              },
            ]
          }
        }
      });
    }
    return product;
  };

  // --- MEN PRODUCTS ---
  await createProduct('Classic White Tee', 'classic-white-tee', menTshirts.id, 25.00, 'M-TEE-001', 'products/men_white_tee.jpg', [
    { size: 'S', color: 'Snow White', qty: 20 },
    { size: 'M', color: 'Snow White', qty: 30 },
    { size: 'L', color: 'Snow White', qty: 25 },
  ]);
  await createProduct('Urban Denim Jacket', 'urban-denim-jacket', menJackets.id, 89.99, 'M-JKT-001', 'products/men_denim_jacket.jpg', [
    { size: 'M', color: 'Royal Blue', qty: 10 },
    { size: 'L', color: 'Royal Blue', qty: 15 },
  ]);
  await createProduct('Slim Fit Chinos', 'slim-fit-chinos', menJeans.id, 45.00, 'M-PNT-001', 'products/men_chinos.jpg', [
    { size: '30', color: 'Slate Grey', qty: 20 },
    { size: '32', color: 'Slate Grey', qty: 25 },
    { size: '34', color: 'Slate Grey', qty: 20 },
  ]);
  await createProduct('Leather Biker Jacket', 'leather-biker-jacket', menJackets.id, 150.00, 'M-JKT-002', 'products/men_leather_jacket.jpg', [
    { size: 'M', color: 'Midnight Black', qty: 5 },
    { size: 'L', color: 'Midnight Black', qty: 8 },
  ]);
  await createProduct('Running Sneakers', 'running-sneakers', menShoes.id, 79.99, 'M-SHOE-001', 'products/men_sneakers.jpg', [
    { size: '8', color: 'Silver', qty: 12 },
    { size: '9', color: 'Silver', qty: 15 },
    { size: '10', color: 'Silver', qty: 10 },
  ]);

  // --- WOMEN PRODUCTS ---
  await createProduct('Summer Floral Dress', 'summer-floral-dress', womenDresses.id, 55.00, 'W-DRS-001', 'products/women_floral_dress.jpg', [
    { size: 'S', color: 'Ruby Red', qty: 15 },
    { size: 'M', color: 'Ruby Red', qty: 20 },
  ]);
  await createProduct('Silk Blouse', 'silk-blouse', womenTops.id, 45.00, 'W-TOP-001', 'products/women_silk_blouse.jpg', [
    { size: 'S', color: 'Snow White', qty: 10 },
    { size: 'M', color: 'Snow White', qty: 15 },
  ]);
  await createProduct('Pencil Skirt', 'pencil-skirt', womenSkirts.id, 35.00, 'W-SKT-001', 'products/women_pencil_skirt.jpg', [
    { size: 'S', color: 'Midnight Black', qty: 12 },
    { size: 'M', color: 'Midnight Black', qty: 18 },
  ]);
  await createProduct('Evening Gown', 'evening-gown-lux', womenDresses.id, 120.00, 'W-DRS-002', 'products/women_gown.jpg', [
    { size: 'S', color: 'Gold', qty: 5 },
    { size: 'M', color: 'Gold', qty: 8 },
  ]);
  await createProduct('Stiletto Heels', 'stiletto-heels', womenHeels.id, 65.00, 'W-SHOE-001', 'products/women_heels.jpg', [
    { size: '6', color: 'Ruby Red', qty: 10 },
    { size: '7', color: 'Ruby Red', qty: 12 },
  ]);

  // --- UNISEX / ACCESSORIES ---
  await createProduct('Canvas Tote Bag', 'canvas-tote', bags.id, 20.00, 'U-BAG-001', 'products/tote_bag.jpg', [
    { size: 'M', color: 'Forest Green', qty: 50 },
  ]);
  await createProduct('Classic Sunglasses', 'classic-sunglasses', accessories.id, 15.00, 'U-ACC-001', 'products/sunglasses.jpg', [
    { size: 'M', color: 'Midnight Black', qty: 100 },
  ]);
  await createProduct('Wool Scarf', 'wool-scarf', accessories.id, 25.00, 'U-ACC-002', 'products/scarf.jpg', [
    { size: 'M', color: 'Slate Grey', qty: 30 },
  ]);
  await createProduct('Leather Belt', 'leather-belt', accessories.id, 30.00, 'U-ACC-003', 'products/belt.jpg', [
    { size: 'L', color: 'Midnight Black', qty: 40 },
  ]);
  await createProduct('Beanie Hat', 'beanie-hat', accessories.id, 12.00, 'U-ACC-004', 'products/beanie.jpg', [
    { size: 'M', color: 'Royal Blue', qty: 60 },
  ]);

  console.log('Products and variants created');

  console.log('Products and variants created');
  console.log('Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
