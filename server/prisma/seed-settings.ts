import 'dotenv/config';
import prisma from '../src/database/client';

const DEFAULT_SETTINGS = [
  // General Settings
  {
    key: 'siteName',
    value: 'Glitter Fashion',
    group: 'GENERAL',
    label: 'Site Name',
    type: 'text',
    description: 'The name of your e-commerce store.'
  },
  {
    key: 'supportEmail',
    value: 'support@glitterfashion.com',
    group: 'GENERAL',
    label: 'Support Email',
    type: 'text',
    description: 'Email address displayed for customer support.'
  },
  {
    key: 'currencyCode',
    value: 'NPR',
    group: 'GENERAL',
    label: 'Currency Code',
    type: 'text',
    description: 'ISO 4217 Currency Code (e.g., USD, NPR).'
  },
  {
    key: 'currencySymbol',
    value: 'Rs.',
    group: 'GENERAL',
    label: 'Currency Symbol',
    type: 'text',
    description: 'Symbol displayed next to prices (e.g., $, Rs.).'
  },
  
  // SEO Settings
  {
    key: 'metaTitle',
    value: 'Glitter Fashion | Trendy Clothing in Nepal',
    group: 'SEO',
    label: 'Default Meta Title',
    type: 'text',
    description: 'Default title tag for the website.'
  },
  {
    key: 'metaDescription',
    value: 'Shop the latest trends in men\'s and women\'s fashion at Glitter Fashion. High-quality clothing, shoes, and accessories delivered across Nepal.',
    group: 'SEO',
    label: 'Default Meta Description',
    type: 'textarea',
    description: 'Default meta description for SEO.'
  },
  {
    key: 'metaKeywords',
    value: 'fashion, clothing, nepal, online shopping, men, women, trendy',
    group: 'SEO',
    label: 'Default Meta Keywords',
    type: 'text',
    description: 'Comma-separated keywords for SEO.'
  },

  // Social Media
  {
    key: 'facebookUrl',
    value: 'https://facebook.com/glitterfashion',
    group: 'SOCIAL',
    label: 'Facebook Page URL',
    type: 'text',
    description: 'Link to Facebook page.'
  },
  {
    key: 'instagramUrl',
    value: 'https://instagram.com/glitterfashion',
    group: 'SOCIAL',
    label: 'Instagram Profile URL',
    type: 'text',
    description: 'Link to Instagram profile.'
  }
];

async function main() {
  console.log('🌱 Seeding default settings...');

  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        // Only update structural fields if they change, but keep value user-defined if exists?
        // Actually for a seed, we usually want to ensure structure (label, type, group) is correct.
        // But maybe not overwrite 'value' if it was changed by user?
        // Let's assume for this "Setup" phase we want to set defaults if they don't exist, 
        // OR update structure but keep value if it exists. 
        // Prisma upsert update runs if record found.
        group: setting.group,
        label: setting.label,
        type: setting.type,
        description: setting.description
        // We do NOT update 'value' here so user changes are preserved on re-seed
      },
      create: {
        key: setting.key,
        value: setting.value,
        group: setting.group,
        label: setting.label,
        type: setting.type,
        description: setting.description
      }
    });
  }

  console.log('✅ Settings seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
