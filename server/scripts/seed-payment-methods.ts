
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const methods = [
    { title: 'eSewa Mobile Wallet', charge: 0, description: 'Pay via eSewa' },
    { title: 'Khalti Digital Wallet', charge: 0, description: 'Pay via Khalti' },
    { title: 'PayPal International', charge: 5, description: 'Pay via PayPal' },
    { title: 'Mollie Payment', charge: 0, description: 'Pay via Mollie (Credit Card, iDeal, etc.)' },
    { title: 'Bank Transfer', charge: 0, description: 'Direct Bank Transfer. Upload voucher.' },
    { title: 'Cash on Delivery', charge: 100, description: 'Pay when you receive.' },
  ];

  for (const m of methods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { title: m.title }
    });

    if (!existing) {
      await prisma.paymentMethod.create({
        data: {
          title: m.title,
          charge: m.charge,
          description: m.description,
          isActive: true
        }
      });
      console.log(`Created ${m.title}`);
    } else {
      console.log(`${m.title} already exists`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
