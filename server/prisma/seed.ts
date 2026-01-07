
import 'dotenv/config';
import { Role, UserStatus, ProductStatus, CategoryGender } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/database/client';

async function main() {
  console.log('Seeding database...');

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
  const sizeAttr = await prisma.attribute.upsert({
    where: { slug: 'size' },
    update: {},
    create: {
      name: 'Size',
      slug: 'size',
      values: {
        create: [
          { value: 'XS' },
          { value: 'S' },
          { value: 'M' },
          { value: 'L' },
          { value: 'XL' },
        ],
      },
    },
    include: { values: true },
  });

  const colorAttr = await prisma.attribute.upsert({
    where: { slug: 'color' },
    update: {},
    create: {
      name: 'Color',
      slug: 'color',
      values: {
        create: [
          { value: 'Midnight Black' },
          { value: 'Royal Blue' },
          { value: 'Ruby Red' },
        ],
      },
    },
    include: { values: true },
  });

  console.log('Attributes created');

  // 3. Categories
  const menCat = await prisma.category.upsert({
    where: { slug: 'mens-collection' },
    update: {},
    create: {
      name: "Men's Collection",
      slug: 'mens-collection',
      description: 'Premium collection for men',
      gender: CategoryGender.MEN,
    },
  });

  const womenCat = await prisma.category.upsert({
    where: { slug: 'womens-collection' },
    update: {},
    create: {
      name: "Women's Collection",
      slug: 'womens-collection',
      description: 'Elegant evening wear for women',
      gender: CategoryGender.WOMEN,
    },
  });

  console.log('Categories created');

  // 4. Seller Profile
  // Associate seller profile with admin for testing convenience
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

  console.log('Seller profile created');

  // 5. Products
  const tshirt = await prisma.product.upsert({
    where: { slug: 'essential-v-neck-tshirt' },
    update: {},
    create: {
      name: 'Essential V-Neck T-Shirt',
      slug: 'essential-v-neck-tshirt',
      description: 'High-quality cotton V-neck t-shirt, perfect for everyday wear.',
      basePrice: 19.99,
      sku: 'EXTSHIRT-BASE',
      status: ProductStatus.ACTIVE,
      categoryId: menCat.id,
      sellerId: seller.id,
      images: {
        create: [
          { imageUrl: 'products/tshirt_black.png', isPrimary: true, sortOrder: 1 },
          { imageUrl: 'products/tshirt_blue.png', isPrimary: false, sortOrder: 2 },
        ],
      },
    },
  });

  const gown = await prisma.product.upsert({
    where: { slug: 'satin-evening-gown' },
    update: {},
    create: {
      name: 'Satin Evening Gown',
      slug: 'satin-evening-gown',
      description: 'Stunning ruby red satin gown for special occasions.',
      basePrice: 89.99,
      sku: 'GOWN-BASE',
      status: ProductStatus.ACTIVE,
      categoryId: womenCat.id,
      sellerId: seller.id,
      images: {
        create: [
          { imageUrl: 'products/gown_red.png', isPrimary: true, sortOrder: 1 },
        ],
      },
    },
  });

  console.log('Products created');

  // 6. Variants for T-Shirt (Sizes x Colors: Black & Blue)
  const sizes = sizeAttr.values;
  const colors = colorAttr.values;
  const blackValue = colors.find(v => v.value === 'Midnight Black')!;
  const blueValue = colors.find(v => v.value === 'Royal Blue')!;
  const redValue = colors.find(v => v.value === 'Ruby Red')!;

  for (const size of sizes) {
      // Black Variant
      await prisma.productVariant.upsert({
          where: { sku: `TSHIRT-BLK-${size.value}` },
          update: {},
          create: {
              productId: tshirt.id,
              sku: `TSHIRT-BLK-${size.value}`,
              price: 19.99,
              stockQuantity: 50,
              productVariantAttribute: {
                  create: [
                      { attributeId: sizeAttr.id, attributeValueId: size.id },
                      { attributeId: colorAttr.id, attributeValueId: blackValue.id },
                  ]
              }
          }
      });

      // Blue Variant
      await prisma.productVariant.upsert({
          where: { sku: `TSHIRT-BLU-${size.value}` },
          update: {},
          create: {
              productId: tshirt.id,
              sku: `TSHIRT-BLU-${size.value}`,
              price: 19.99,
              stockQuantity: 30,
              productVariantAttribute: {
                  create: [
                      { attributeId: sizeAttr.id, attributeValueId: size.id },
                      { attributeId: colorAttr.id, attributeValueId: blueValue.id },
                  ]
              }
          }
      });
  }

  // 7. Variants for Gown (Sizes x Red)
  for (const size of sizes) {
      await prisma.productVariant.upsert({
          where: { sku: `GOWN-RED-${size.value}` },
          update: {},
          create: {
              productId: gown.id,
              sku: `GOWN-RED-${size.value}`,
              price: 89.99,
              stockQuantity: 10,
              productVariantAttribute: {
                  create: [
                      { attributeId: sizeAttr.id, attributeValueId: size.id },
                      { attributeId: colorAttr.id, attributeValueId: redValue.id },
                  ]
              }
          }
      });
  }

  console.log('Product variants created');
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
