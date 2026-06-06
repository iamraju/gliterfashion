
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
