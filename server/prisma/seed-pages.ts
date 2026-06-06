
import 'dotenv/config';
import prisma from '../src/database/client';

// const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pages...');

  const pages = [
    {
      title: 'About Us',
      slug: 'about-us',
      content: `
        <h2>Who We Are</h2>
        <p>Glitter Fashion is more than just a clothing store; we are a destination for style, elegance, and expression. Founded in 2026, we set out with a simple mission: to make premium fashion accessible to everyone, everywhere.</p>
        <p>Our journey began in the vibrant streets of Kathmandu, inspired by the rich tapestry of culture and the modern pulse of global trends. We curate collections that blend timeless classics with contemporary designs, ensuring that every piece tells a story.</p>
        <h3>Our Values</h3>
        <ul>
            <li><strong>Quality:</strong> We never compromise on materials or craftsmanship.</li>
            <li><strong>Sustainability:</strong> We are committed to eco-friendly practices and ethical sourcing.</li>
            <li><strong>Community:</strong> We believe in empowering our customers and supporting local artisans.</li>
        </ul>
        <p>Join us on this fashion journey and define your own style with Glitter Fashion.</p>
      `
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `
        <h2>Privacy Policy</h2>
        <p><strong>Effective Date:</strong> January 1, 2026</p>
        <p>At Glitter Fashion, we value your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and safeguard your information.</p>
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter. This includes your name, email address, shipping address, and payment details.</p>
        <h3>2. How We Use Your Information</h3>
        <p>We use your data to:</p>
        <ul>
            <li>Process and deliver your orders.</li>
            <li>Send you order updates and promotional offers.</li>
            <li>Improve our website and customer service.</li>
        </ul>
        <h3>3. Data Security</h3>
        <p>We implement industry-standard security measures to unauthorized access to your data. Your payment information is encrypted and processed securely by our payment partners.</p>
        <p>If you have any questions about this policy, please contact us at privacy@glitterfashion.com.</p>
      `
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-conditions',
      content: `
        <h2>Terms and Conditions</h2>
        <p>Welcome to Glitter Fashion. By accessing or using our website, you agree to be bound by these terms.</p>
        <h3>1. Purchases</h3>
        <p>All purchases made through our site are subject to product availability and acceptance. We reserve the right to refuse or cancel any order for any reason.</p>
        <h3>2. Returns and Refunds</h3>
        <p>Please refer to our Return Policy for detailed information on returns and refunds. Items must be returned in their original condition within 30 days of receipt.</p>
        <h3>3. Intellectual Property</h3>
        <p>All content on this site, including text, graphics, logos, and images, is the property of Glitter Fashion and protected by copyright laws.</p>
        <p>We reserve the right to modify these terms at any time. Please check back regularly for updates.</p>
      `
    },
    {
      title: 'Return Policy',
      slug: 'return-policy',
      content: `
        <h2>Return & Refund Policy</h2>
        <p>We want you to love your purchase. If you are not completely satisfied, we're here to help.</p>
        <h3>Returns</h3>
        <p>You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. It must be in the original packaging.</p>
        <h3>Refunds</h3>
        <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
        <p>If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer's policies.</p>
        <h3>Shipping</h3>
        <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
      `
    }
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { content: page.content, isActive: true },
      create: {
        title: page.title,
        slug: page.slug,
        content: page.content,
        isActive: true,
      }
    });
  }

  console.log('Pages Seeding Done.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
