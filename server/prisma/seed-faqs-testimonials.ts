
import 'dotenv/config';
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

async function main() {
  console.log('🌱 Seeding FAQs and Testimonials...');

  // FAQs
  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unused items with original tags attached. You can initiate a return from your account dashboard.',
      sortOrder: 1,
      isActive: true,
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. International shipping times vary by location.',
      sortOrder: 2,
      isActive: true,
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to over 100 countries worldwide. Shipping costs and delivery times will be calculated at checkout.',
      sortOrder: 3,
      isActive: true,
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive an email with a tracking number. You can also track your order status in your account.',
      sortOrder: 4,
      isActive: true,
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, MasterCard, American Express, PayPal, and Apple Pay. We also support local payment methods like eSewa and Khalti in Nepal.',
      sortOrder: 5,
      isActive: true,
    },
    {
      question: 'Do you have a physical store?',
      answer: 'Yes, our flagship store is located at 123 Fashion Ave, Kathmandu. Come visit us!',
      sortOrder: 6,
      isActive: true,
    },
  ];

  for (const faq of faqs) {
     const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
     if (existing) {
         await prisma.faq.update({
             where: { id: existing.id },
             data: faq
         });
     } else {
         await prisma.faq.create({ data: faq });
     }
  }

  console.log(`✅ Processed ${faqs.length} FAQs`);

  // Testimonials
  const testimonials = [
    {
      name: 'Alice Johnson',
      role: 'Fashion Blogger',
      content: 'I absolutely love the quality of the dresses! Highly recommended.',
      rating: 5,
      imageUrl: 'https://placehold.co/100x100/png?text=AJ',
      filename: 'alice.png',
      isActive: true,
    },
    {
      name: 'Michael Smith',
      role: 'Verified Customer',
      content: 'Great service and fast shipping. The jeans fit perfectly.',
      rating: 4,
      imageUrl: 'https://placehold.co/100x100/png?text=MS',
      filename: 'michael.png',
      isActive: true,
    },
    {
      name: 'Sarah Lee',
      role: 'Designer',
      content: 'The accessories are unique and stylish. Will buy again!',
      rating: 5,
      imageUrl: 'https://placehold.co/100x100/png?text=SL',
      filename: 'sarah.png',
      isActive: true,
    },
    {
      name: 'Priya Sharma',
      role: 'Designer',
      content: 'As a designer myself, I appreciate the attention to detail in the stitching and finishing. Very impressed with the craftsmanship.',
      rating: 5,
      imageUrl: 'https://placehold.co/100x100/png?text=PS',
      filename: 'priya.png',
      isActive: true,
    },
    {
      name: 'David Wilson',
      role: 'Business Professional',
      content: 'Formal wear selection is top notch. The suits fit like they were custom made. Highly recommended for office wear.',
      rating: 5,
      imageUrl: 'https://placehold.co/100x100/png?text=DW',
      filename: 'david.png',
      isActive: true,
    },
  ];

  for (const t of testimonials) {
    let relativePath = null;
    if (t.imageUrl && t.filename) {
        relativePath = await ensureImage(t.imageUrl, 'testimonials', t.filename);
    }

    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } });

    if (existing) {
       await prisma.testimonial.update({
         where: { id: existing.id },
         data: {
           role: t.role,
           content: t.content,
           rating: t.rating,
           imageUrl: relativePath || existing.imageUrl,
           isActive: t.isActive,
         }
       });
    } else {
      await prisma.testimonial.create({
        data: {
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
          imageUrl: relativePath,
          isActive: t.isActive,
        }
      });
    }
  }

  console.log(`✅ Processed ${testimonials.length} testimonials`);
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
