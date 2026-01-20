
import 'dotenv/config';
import prisma from '../src/database/client';

async function main() {
  console.log('Seeding FAQs and Testimonials...');

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
    await prisma.faq.create({ data: faq });
  }

  console.log(`Created ${faqs.length} FAQs`);

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fashion Blogger',
      content: 'I absolutely love the quality of the clothes! The fabrics are premium and the fit is perfect. Highly updated my wardrobe with Glitter Fashion.',
      rating: 5,
      isActive: true,
    },
    {
      name: 'Michael Chen',
      role: 'Verified Buyer',
      content: 'Great shipping speed and excellent customer service. Had IT issue with size and they swapped it out immediately. Will buy again.',
      rating: 5,
      isActive: true,
    },
    {
      name: 'Emily Davis',
      role: 'Regular Customer',
      content: 'The summer collection is to die for! I bought three dresses and they are all stunning. Can\'t wait for the winter release.',
      rating: 4,
      isActive: true,
    },
    {
      name: 'Priya Sharma',
      role: 'Designer',
      content: 'As a designer myself, I appreciate the attention to detail in the stitching and finishing. Very impressed with the craftsmanship.',
      rating: 5,
      isActive: true,
    },
    {
      name: 'David Wilson',
      role: 'Business Professional',
      content: 'Formal wear selection is top notch. The suits fit like they were custom made. Highly recommended for office wear.',
      rating: 5,
      isActive: true,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log(`Created ${testimonials.length} testimonials`);
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
