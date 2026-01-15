import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const shippingMethods = [
  { title: 'Standard', charge: 0, deliveryTimeDays: 2, deliveryTimeHours: 0, description: 'Standard delivery in 2 days' },
  { title: 'Nepal Can Move', charge: 80, deliveryTimeDays: 1, deliveryTimeHours: 0, description: 'Fast delivery with Nepal Can Move' },
  { title: 'Pathao', charge: 100, deliveryTimeDays: 0, deliveryTimeHours: 12, description: 'Same day delivery via Pathao' },
];

const paymentMethods = [
  { title: 'Cash On Delivery', charge: 0, description: 'Pay with cash upon delivery' },
  { title: 'Esewa', charge: 5, description: 'Pay via Esewa wallet' },
  { title: 'Khalti', charge: 5, description: 'Pay via Khalti wallet' },
  { title: 'Bank Transfer', charge: 0, description: 'Direct bank transfer' },
];

async function main() {
  console.log('Seeding shipping methods...');
  for (const method of shippingMethods) {
    const existing = await prisma.shippingMethod.findFirst({
      where: { title: method.title }
    });

    if (existing) {
      console.log(`Updating shipping method: ${method.title}`);
      await prisma.shippingMethod.update({
        where: { id: existing.id },
        data: {
          charge: method.charge,
          deliveryTimeDays: method.deliveryTimeDays,
          deliveryTimeHours: method.deliveryTimeHours,
          description: method.description,
          isActive: true
        }
      });
    } else {
      console.log(`Creating shipping method: ${method.title}`);
      await prisma.shippingMethod.create({
        data: {
          ...method,
          charge: method.charge,
          isActive: true
        }
      });
    }
  }

  console.log('Seeding payment methods...');
  for (const method of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { title: method.title }
    });

    if (existing) {
      console.log(`Updating payment method: ${method.title}`);
      await prisma.paymentMethod.update({
        where: { id: existing.id },
        data: {
          charge: method.charge,
          description: method.description,
          isActive: true
        }
      });
    } else {
      console.log(`Creating payment method: ${method.title}`);
      await prisma.paymentMethod.create({
        data: {
          ...method,
          charge: method.charge,
          isActive: true
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
