import "dotenv/config";
import prisma from "../src/database/client";

const DEFAULT_SETTINGS = [
  // General Settings
  {
    key: "siteName",
    value: "Glitter Fashion",
    group: "GENERAL",
    label: "Site Name",
    type: "text",
    description: "The name of your e-commerce store.",
  },

  {
    key: "currencyCode",
    value: process.env.CURRENCY || "NPR",
    group: "GENERAL",
    label: "Currency Code",
    type: "text",
    description: "ISO 4217 Currency Code (e.g., USD, NPR).",
  },
  {
    key: "currencySymbol",
    value: process.env.CURRENCY_SYMBOL || "Rs.",
    group: "GENERAL",
    label: "Currency Symbol",
    type: "text",
    description: "Symbol displayed next to prices (e.g., $, Rs.).",
  },

  // SEO Settings
  {
    key: "metaTitle",
    value: "Glitter Fashion | Trendy Clothing in Nepal",
    group: "SEO",
    label: "Default Meta Title",
    type: "text",
    description: "Default title tag for the website.",
  },
  {
    key: "metaDescription",
    value:
      "Shop the latest trends in men's and women's fashion at Glitter Fashion. High-quality clothing, shoes, and accessories delivered across Nepal.",
    group: "SEO",
    label: "Default Meta Description",
    type: "textarea",
    description: "Default meta description for SEO.",
  },
  {
    key: "metaKeywords",
    value: "fashion, clothing, nepal, online shopping, men, women, trendy",
    group: "SEO",
    label: "Default Meta Keywords",
    type: "text",
    description: "Comma-separated keywords for SEO.",
  },

  // Contact Settings
  {
    key: "contactAddress",
    value: "123 Fashion Ave, Kathmandu, Nepal",
    group: "CONTACT",
    label: "Physical Address",
    type: "text",
    description: "Physical address of the store.",
  },
  {
    key: "contactPhone",
    value: "+977 9812345678",
    group: "CONTACT",
    label: "Phone Number",
    type: "text",
    description: "Contact phone number for support.",
  },
  {
    key: "contactEmail",
    value: "support@glitterfashion.com",
    group: "CONTACT",
    label: "Support Email",
    type: "text",
    description: "Email address for customer inquiries.",
  },

  // Social Media
  {
    key: "facebookUrl",
    value: "https://facebook.com",
    group: "SOCIAL",
    label: "Facebook URL",
    type: "text",
    description: "Link to Facebook page.",
  },
  {
    key: "instagramUrl",
    value: "https://instagram.com",
    group: "SOCIAL",
    label: "Instagram URL",
    type: "text",
    description: "Link to Instagram profile.",
  },
  {
    key: "twitterUrl",
    value: "https://twitter.com",
    group: "SOCIAL",
    label: "Twitter/X URL",
    type: "text",
    description: "Link to Twitter profile.",
  },
  {
    key: "youtubeUrl",
    value: "https://youtube.com",
    group: "SOCIAL",
    label: "YouTube URL",
    type: "text",
    description: "Link to YouTube channel.",
  },

  // Payment Settings (eSewa & Khalti)
  {
    key: "ESEWA_MERCHANT_ID",
    value: "EPAYTEST",
    group: "PAYMENT",
    label: "eSewa Merchant ID",
    type: "text",
    description: "Merchant ID for eSewa (Use EPAYTEST for testing).",
  },
  {
    key: "ESEWA_SUCCESS_URL",
    value: "http://localhost:5173/checkout/esewa/success",
    group: "PAYMENT",
    label: "eSewa Success URL",
    type: "text",
    description: "URL to redirect after successful eSewa payment.",
  },
  {
    key: "ESEWA_FAILURE_URL",
    value: "http://localhost:5173/checkout/esewa/failure",
    group: "PAYMENT",
    label: "eSewa Failure URL",
    type: "text",
    description: "URL to redirect after failed eSewa payment.",
  },
  {
    key: "KHALTI_PUBLIC_KEY",
    value: "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
    group: "PAYMENT",
    label: "Khalti Public Key",
    type: "text",
    description: "Public key for Khalti integration.",
  },
  {
    key: "KHALTI_SECRET_KEY",
    value: "test_secret_key_f13b320d7533429690d81023774635d3",
    group: "PAYMENT",
    label: "Khalti Secret Key",
    type: "text",
    description: "Secret key for Khalti integration (Server-side).",
  },
];

async function main() {
  console.log("🌱 Seeding default settings...");

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
        description: setting.description,
        // We do NOT update 'value' here so user changes are preserved on re-seed
      },
      create: {
        key: setting.key,
        value: setting.value,
        group: setting.group,
        label: setting.label,
        type: setting.type,
        description: setting.description,
      },
    });
  }

  console.log("✅ Settings seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
